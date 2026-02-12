import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import {
  ContainerRegistrationKeys,
  MedusaError,
  MedusaErrorTypes,
  Modules,
} from "@medusajs/framework/utils";
import { AssignTaxCode } from "../../../validators";
import { TAX_CODE_SERVICE } from "../../../../../modules/tax_code";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const productId = req.params.productId;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: "product",
    fields: ["tax_code.*"],
    filters: {
      id: productId,
    },
  });

  if (data.length === 0) {
    throw new MedusaError(MedusaErrorTypes.NOT_FOUND, "Category not found!");
  }
  res.json(data[0]);
}

export async function POST(
  req: MedusaRequest<AssignTaxCode>,
  res: MedusaResponse
) {
  const productId = req.params.productId;

  const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: "product",
    fields: ["tax_code.*"],
    filters: {
      id: productId,
    },
  });

  if (data.length === 0) {
    throw new MedusaError(MedusaErrorTypes.NOT_FOUND, "Product not found!");
  }

  console.log(data, "data from tax_code!");

  if (data[0].tax_code) {
    await link.dismiss({
      [Modules.PRODUCT]: {
        product_id: productId,
      },
      [TAX_CODE_SERVICE]: {
        tax_code_id: data[0].tax_code.id,
      },
    });
  }

  await link.create({
    [Modules.PRODUCT]: {
      product_id: productId,
    },
    [TAX_CODE_SERVICE]: {
      tax_code_id: req.body.taxCodeId,
    },
  });

  res.status(201).json({ status: "created" });
}
