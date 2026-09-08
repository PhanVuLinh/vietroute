import { z } from "zod";

export const createOrderSchema = z.object({
  receiverName: z
    .string()
    .min(2, "Họ và tên người nhận phải có ít nhất 2 ký tự")
    .max(100, "Họ và tên không được vượt quá 100 ký tự"),
  receiverPhone: z
    .string()
    .regex(/^(0[3|5|7|8|9])[0-9]{8}$/, "Số điện thoại không hợp lệ (Ví dụ: 0912345678)"),
  warehouseId: z
    .string()
    .min(1, "Vui lòng chọn kho xuất phát tiếp nhận hàng"),
  receiverAddress: z
    .string()
    .min(5, "Địa chỉ giao hàng phải có ít nhất 5 ký tự")
    .max(255, "Địa chỉ không được vượt quá 255 ký tự"),
  totalWeight: z
    .number({ message: "Khối lượng phải là số" })
    .positive("Khối lượng kiện hàng phải lớn hơn 0 kg")
    .max(5000, "Khối lượng tối đa cho 1 đơn hàng là 5000 kg"),
  itemCount: z
    .number({ message: "Số kiện phải là số nguyên" })
    .int("Số kiện phải là số nguyên")
    .min(1, "Đơn hàng phải có ít nhất 1 kiện hàng"),
  codAmount: z
    .number({ message: "Số tiền COD phải là số" })
    .min(0, "Tiền thu hộ COD không được âm"),
  deliveryWindowEnd: z
    .string()
    .min(1, "Vui lòng chọn hạn chót giao hàng cam kết (SLA)"),
  priority: z.enum(["URGENT", "HIGH", "NORMAL", "LOW"], {
    message: "Vui lòng chọn mức độ ưu tiên hợp lệ",
  }),
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
