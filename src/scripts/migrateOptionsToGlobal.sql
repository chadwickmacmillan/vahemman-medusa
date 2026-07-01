-- Migrate products from per-product (exclusive) Color/Size options to the
-- global (is_exclusive=false) options, preserving all variant data.
--
-- Why raw SQL instead of the core-flows workflows: Medusa guards forbid
-- unlinking an option while live variants reference its values, and forbid
-- relinking variants while both the exclusive and global option are attached.
-- An in-place re-point of the link tables is the only way to swap the options
-- without deleting/recreating variants (which would lose prices, inventory,
-- and image links).
--
-- What is preserved automatically (keyed by variant id, never touched):
--   * product_variant_product_image  (variant <-> image links)
--   * variant prices, inventory
--   * product images
-- What this script re-points:
--   * product_variant_option.option_value_id      (local value  -> global value)
--   * variant_images_settings.base_option_id       (local option -> global option)
--   * product_product_option / _value              (link globals, unlink locals)
-- Matching is by option title ("Color"/"Size") and value string ("Black", ...),
-- which are identical between the exclusive and global options.
--
-- Dry run (executes everything, verifies, then rolls back — no net change):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v apply=false -f src/scripts/migrateOptionsToGlobal.sql
-- Apply:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -v apply=true  -f src/scripts/migrateOptionsToGlobal.sql

\set ON_ERROR_STOP on
\if :{?apply}
\else
  \set apply false
\endif

BEGIN;

-- 1) Re-point LIVE variants' option-value links: exclusive value -> global value
--    (matched by option title + value string).
WITH mapping AS (
  SELECT lv.id AS local_value_id, gv.id AS global_value_id
  FROM product_option_value lv
  JOIN product_option lo ON lo.id = lv.option_id AND lo.is_exclusive = true  AND lo.deleted_at IS NULL
  JOIN product_option go ON go.title = lo.title      AND go.is_exclusive = false AND go.deleted_at IS NULL
  JOIN product_option_value gv ON gv.option_id = go.id AND gv.value = lv.value AND gv.deleted_at IS NULL
  WHERE lv.deleted_at IS NULL
)
UPDATE product_variant_option pvo
SET option_value_id = m.global_value_id
FROM mapping m, product_variant v
WHERE pvo.option_value_id = m.local_value_id
  AND v.id = pvo.variant_id
  AND v.deleted_at IS NULL;

-- 2) Re-point the variant-images plugin's base option: local Color -> global Color
--    (only live settings whose base option is a live exclusive option).
UPDATE variant_images_settings vis
SET base_option_id = go.id, updated_at = now()
FROM product_option lo
JOIN product_option go ON go.title = lo.title AND go.is_exclusive = false AND go.deleted_at IS NULL
WHERE vis.base_option_id = lo.id
  AND lo.is_exclusive = true AND lo.deleted_at IS NULL
  AND vis.deleted_at IS NULL;

-- 3) Link the global option(s) to each product that currently links a matching
--    exclusive option (and doesn't already link the global one).
INSERT INTO product_product_option (id, product_id, product_option_id, created_at, updated_at)
SELECT 'prodopt_' || upper(replace(gen_random_uuid()::text, '-', '')),
       ppo.product_id, go.id, now(), now()
FROM product_product_option ppo
JOIN product_option lo ON lo.id = ppo.product_option_id AND lo.is_exclusive = true  AND lo.deleted_at IS NULL
JOIN product_option go ON go.title = lo.title           AND go.is_exclusive = false AND go.deleted_at IS NULL
JOIN product p ON p.id = ppo.product_id AND p.deleted_at IS NULL
WHERE ppo.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM product_product_option x
    WHERE x.product_id = ppo.product_id AND x.product_option_id = go.id AND x.deleted_at IS NULL
  );

-- 4) Restrict each product's global option to the value subset its LIVE variants
--    actually use (product_product_option_value pivot). Scoped to products still
--    linking an exclusive option, so already-global products are left untouched.
INSERT INTO product_product_option_value (id, product_product_option_id, product_option_value_id, created_at, updated_at)
SELECT DISTINCT 'prodoptval_' || upper(replace(gen_random_uuid()::text, '-', '')),
       ppo.id, pvo.option_value_id, now(), now()
FROM product_product_option ppo
JOIN product_option go ON go.id = ppo.product_option_id AND go.is_exclusive = false AND go.deleted_at IS NULL
JOIN product p ON p.id = ppo.product_id AND p.deleted_at IS NULL
JOIN product_variant v ON v.product_id = ppo.product_id AND v.deleted_at IS NULL
JOIN product_variant_option pvo ON pvo.variant_id = v.id
JOIN product_option_value gv ON gv.id = pvo.option_value_id AND gv.option_id = go.id
WHERE ppo.deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM product_product_option lppo
    JOIN product_option llo ON llo.id = lppo.product_option_id AND llo.is_exclusive = true AND llo.deleted_at IS NULL
    WHERE lppo.product_id = ppo.product_id AND lppo.deleted_at IS NULL
  )
  AND NOT EXISTS (
    SELECT 1 FROM product_product_option_value x
    WHERE x.product_product_option_id = ppo.id AND x.product_option_value_id = pvo.option_value_id AND x.deleted_at IS NULL
  );

-- 5) Unlink the exclusive options from products (soft-delete the pivots).
UPDATE product_product_option_value ppov
SET deleted_at = now()
FROM product_product_option ppo
JOIN product_option lo ON lo.id = ppo.product_option_id AND lo.is_exclusive = true AND lo.deleted_at IS NULL
WHERE ppov.product_product_option_id = ppo.id AND ppov.deleted_at IS NULL;

UPDATE product_product_option ppo
SET deleted_at = now()
FROM product_option lo
WHERE ppo.product_option_id = lo.id
  AND lo.is_exclusive = true AND lo.deleted_at IS NULL
  AND ppo.deleted_at IS NULL;

-- 6) Soft-delete the exclusive options and their values. This also sweeps up the
--    orphaned exclusive options left over from the earlier Reilu Jacket rework.
UPDATE product_option_value
SET deleted_at = now()
WHERE deleted_at IS NULL
  AND option_id IN (SELECT id FROM product_option WHERE is_exclusive = true AND deleted_at IS NULL);

UPDATE product_option
SET deleted_at = now()
WHERE is_exclusive = true AND deleted_at IS NULL;

-- 7) Remove dangling variant-option links belonging to already soft-deleted
--    variants that still point at (now soft-deleted) exclusive values
--    (product_variant_option has no deleted_at, so hard-delete).
DELETE FROM product_variant_option pvo
USING product_variant v
WHERE pvo.variant_id = v.id
  AND v.deleted_at IS NOT NULL
  AND pvo.option_value_id IN (
    SELECT ov.id FROM product_option_value ov
    JOIN product_option o ON o.id = ov.option_id AND o.is_exclusive = true
  );

-- ---------------------------------------------------------------------------
-- Verification
-- ---------------------------------------------------------------------------
\echo '=== live products still linking an exclusive option (expect 0) ==='
SELECT count(DISTINCT ppo.product_id)
FROM product_product_option ppo
JOIN product_option o ON o.id = ppo.product_option_id AND o.is_exclusive = true AND o.deleted_at IS NULL
JOIN product p ON p.id = ppo.product_id AND p.deleted_at IS NULL
WHERE ppo.deleted_at IS NULL;

\echo '=== live variants still referencing an exclusive option value (expect 0) ==='
SELECT count(*)
FROM product_variant_option pvo
JOIN product_variant v ON v.id = pvo.variant_id AND v.deleted_at IS NULL
JOIN product_option_value ov ON ov.id = pvo.option_value_id
JOIN product_option o ON o.id = ov.option_id
WHERE o.is_exclusive = true;

\echo '=== variant_images_settings base options by exclusivity (expect only f) ==='
SELECT o.is_exclusive, count(*)
FROM variant_images_settings vis
JOIN product_option o ON o.id = vis.base_option_id
JOIN product p ON p.id = vis.product_id AND p.deleted_at IS NULL
WHERE vis.deleted_at IS NULL
GROUP BY o.is_exclusive;

\echo '=== per-product: variants, option values, image links (should be intact) ==='
SELECT p.title,
       count(DISTINCT v.id) AS variants,
       count(DISTINCT pvo.option_value_id) AS distinct_option_values,
       (SELECT count(*) FROM product_variant_product_image pvpi
          JOIN product_variant vv ON vv.id = pvpi.variant_id AND vv.deleted_at IS NULL
          WHERE vv.product_id = p.id) AS image_links,
       count(DISTINCT ppo.product_option_id) FILTER (WHERE o.is_exclusive = false) AS global_options
FROM product p
JOIN product_variant v ON v.product_id = p.id AND v.deleted_at IS NULL
JOIN product_variant_option pvo ON pvo.variant_id = v.id
LEFT JOIN product_product_option ppo ON ppo.product_id = p.id AND ppo.deleted_at IS NULL
LEFT JOIN product_option o ON o.id = ppo.product_option_id AND o.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.title
ORDER BY p.title;

\if :apply
  \echo '>>> COMMITTING'
  COMMIT;
\else
  \echo '>>> DRY RUN — rolling back (pass -v apply=true to apply)'
  ROLLBACK;
\endif
