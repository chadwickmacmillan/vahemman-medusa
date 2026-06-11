import { useCallback, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Form } from "./Form";
import { FileType, FileUpload } from "./FileUpload";
import { Button } from "@medusajs/ui";

const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/svg+xml",
];

const SUPPORTED_FORMATS_FILE_EXTENSIONS = [
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".heic",
  ".svg",
];

export const UploadMediaFormItem = ({
  form,
  append,
  showHint = true,
  singleton,
  initialImage,
  onChanged,
}: {
  form: UseFormReturn<any>;
  append: (value: any) => void;
  showHint?: boolean;
  singleton?: boolean;
  initialImage?: string;
  onChanged?: () => void;
}) => {
  const [isCleared, setIsCleared] = useState(false);

  const media: FileType[] =
    useWatch({ control: form.control, name: "media" }) ?? [];

  const hasInvalidFiles = useCallback(
    (fileList: FileType[]) => {
      const invalidFile = fileList.find(
        (f) => !SUPPORTED_FORMATS.includes(f.file.type),
      );
      if (invalidFile) {
        form.setError("media", {
          type: "invalid_file",
          message: `'${invalidFile.file.name}' is not a supported file type. Supported formats: ${SUPPORTED_FORMATS_FILE_EXTENSIONS.join(", ")}.`,
        });
        return true;
      }
      return false;
    },
    [form],
  );

  const onUploaded = useCallback(
    (files: FileType[]) => {
      form.clearErrors("media");
      if (hasInvalidFiles(files)) return;
      files.forEach((f) => append(f));
      setIsCleared(false);
      onChanged?.();
    },
    [form, append, hasInvalidFiles, onChanged],
  );

  const onClear = () => {
    form.setValue("media", [], { shouldDirty: true });
    setIsCleared(true);
    onChanged?.();
  };

  const showInitialImage = !!initialImage && !isCleared && media.length === 0;
  const showUploadedImages = media.length > 0;
  const showUploader = !showInitialImage && media.length === 0;
  const showClearButton = showInitialImage || showUploadedImages;

  return (
    <Form.Field
      control={form.control as UseFormReturn<any>["control"]}
      name="media"
      render={() => (
        <Form.Item>
          <div className="flex flex-col gap-y-2">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-y-1">
                <Form.Label optional>Media</Form.Label>
                {showHint && (
                  <Form.Hint>{`Upload image${media.length > 1 ? "s" : ""}`}</Form.Hint>
                )}
              </div>
              {showClearButton && (
                <Button
                  onClick={onClear}
                  size="small"
                  variant="transparent"
                  type="button"
                >
                  Clear
                </Button>
              )}
            </div>
            <Form.Control>
              <div className="flex flex-col gap-y-2">
                {showInitialImage && (
                  <div className="size-60 rounded-md overflow-hidden">
                    <img
                      className="w-full h-full object-cover object-center"
                      src={initialImage}
                      alt=""
                    />
                  </div>
                )}
                {showUploadedImages &&
                  media.map((v, i) => (
                    <div key={i} className="size-60 rounded-md overflow-hidden">
                      <img
                        className="w-full h-full object-cover object-center"
                        src={v.url}
                        alt=""
                      />
                    </div>
                  ))}
                {showUploader && (
                  <FileUpload
                    label="Upload image"
                    hint="Upload image"
                    hasError={!!form.formState.errors.media}
                    formats={SUPPORTED_FORMATS}
                    onUploaded={onUploaded}
                    multiple={!singleton}
                  />
                )}
              </div>
            </Form.Control>
            <Form.ErrorMessage />
          </div>
        </Form.Item>
      )}
    />
  );
};
