import type { FieldError, FieldErrors, Resolver } from "react-hook-form";
import type { ZodType } from "zod";

/**
 * Adapter tích hợp Zod Schema với React Hook Form không cần thêm dependency bên ngoài
 */
export function zodResolver<TFieldValues extends Record<string, unknown>>(
  schema: ZodType<TFieldValues>
): Resolver<TFieldValues> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] ? String(issue.path[0]) : "root";
      if (!errors[field]) {
        errors[field] = {
          type: issue.code,
          message: issue.message,
        };
      }
    }

    return {
      values: {} as Record<string, never>,
      errors: errors as FieldErrors<TFieldValues>,
    };
  };
}
