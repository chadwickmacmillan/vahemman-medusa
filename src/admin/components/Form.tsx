import * as React from "react";
import {
  FormProvider,
  useForm,
  UseFormProps,
  DefaultValues,
  SubmitHandler,
} from "react-hook-form";
import { z } from "@medusajs/framework/zod";
import { zodResolver } from "@hookform/resolvers/zod";

export type FormProps<T extends z.ZodType<any, any>> = UseFormProps<
  z.infer<T>
> & {
  schema: T;
  onSubmit: SubmitHandler<z.infer<T>>;
  defaultValues?: DefaultValues<z.infer<T>>;
  children?: React.ReactNode;
  formProps?: Omit<React.ComponentProps<"form">, "onSubmit">;
};

export const Form = <T extends z.ZodType<any, any>>({
  schema,
  onSubmit,
  children,
  defaultValues,
  formProps,
  ...props
}: FormProps<T>) => {
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    ...props,
  });

  return (
    <FormProvider {...methods}>
      <form {...formProps} onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
};
