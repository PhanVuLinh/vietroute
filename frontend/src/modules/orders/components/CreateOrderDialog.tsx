import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/shared/utils/zodResolver";
import {
  X,
  PlusCircle,
  User,
  Phone,
  MapPin,
  Warehouse as WarehouseIcon,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import type { Warehouse, Order } from "@/core/types/logistics";
import { createOrderSchema, type CreateOrderFormValues } from "../utils/orderValidation";
import { useOrderMutations } from "../hooks/useOrderMutations";

interface CreateOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  onSuccess: (order: Order) => void;
}

export const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({
  isOpen,
  onClose,
  warehouses,
  onSuccess,
}) => {
  const { createOrderMutation } = useOrderMutations();

  // Tạo giá trị thời gian mặc định: 4 giờ kể từ hiện tại
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setHours(d.getHours() + 4);
    // Format YYYY-MM-DDTHH:mm
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      receiverName: "",
      receiverPhone: "",
      receiverAddress: "",
      warehouseId: warehouses[0]?.id || "",
      totalWeight: 5,
      itemCount: 1,
      codAmount: 0,
      priority: "NORMAL",
      deliveryWindowEnd: getDefaultDeadline(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        receiverName: "",
        receiverPhone: "",
        receiverAddress: "",
        warehouseId: warehouses[0]?.id || "",
        totalWeight: 5,
        itemCount: 1,
        codAmount: 0,
        priority: "NORMAL",
        deliveryWindowEnd: getDefaultDeadline(),
      });
    }
  }, [isOpen, reset, warehouses]);

  if (!isOpen) return null;

  const onSubmit = async (values: CreateOrderFormValues) => {
    try {
      const created = await createOrderMutation.mutateAsync({
        ...values,
        deliveryWindowEnd: new Date(values.deliveryWindowEnd).toISOString(),
      });
      onSuccess(created);
      onClose();
    } catch (err) {
      console.error("Lỗi tạo đơn hàng:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-card border border-border p-6 text-left align-middle shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Tạo đơn hàng mới
                </h3>
                <p className="text-xs text-muted-foreground">
                  Nhập thông tin người nhận và bưu phẩm để đưa vào hàng đợi xử lý
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 text-xs">
            {/* Lỗi tổng quát nếu mutation thất bại */}
            {createOrderMutation.isError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Không thể tạo đơn hàng. Vui lòng kiểm tra lại thông tin và thử lại.</span>
              </div>
            )}

            {/* Khách hàng & Người nhận */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="input-receiver-name" className="block text-foreground font-medium mb-1">
                  Họ và tên người nhận <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="input-receiver-name"
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn An"
                    {...register("receiverName")}
                    className={`w-full pl-9 pr-3 py-2 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs ${
                      errors.receiverName ? "border-destructive focus:ring-destructive/30" : "border-input"
                    }`}
                  />
                </div>
                {errors.receiverName && (
                  <p className="text-destructive text-[11px] mt-1">{errors.receiverName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="input-receiver-phone" className="block text-foreground font-medium mb-1">
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    id="input-receiver-phone"
                    type="tel"
                    placeholder="Ví dụ: 0912345678"
                    {...register("receiverPhone")}
                    className={`w-full pl-9 pr-3 py-2 bg-background border rounded-xl text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs ${
                      errors.receiverPhone ? "border-destructive focus:ring-destructive/30" : "border-input"
                    }`}
                  />
                </div>
                {errors.receiverPhone && (
                  <p className="text-destructive text-[11px] mt-1">{errors.receiverPhone.message}</p>
                )}
              </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div>
              <label htmlFor="input-receiver-address" className="block text-foreground font-medium mb-1">
                Địa chỉ giao hàng chi tiết <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  id="input-receiver-address"
                  type="text"
                  placeholder="Ví dụ: Số 45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                  {...register("receiverAddress")}
                  className={`w-full pl-9 pr-3 py-2 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs ${
                    errors.receiverAddress ? "border-destructive focus:ring-destructive/30" : "border-input"
                  }`}
                />
              </div>
              {errors.receiverAddress && (
                <p className="text-destructive text-[11px] mt-1">{errors.receiverAddress.message}</p>
              )}
            </div>

            {/* Kho xuất bến & Mức ưu tiên */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="select-warehouse" className="block text-foreground font-medium mb-1">
                  Kho xuất phát <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <WarehouseIcon className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5 pointer-events-none" />
                  <select
                    id="select-warehouse"
                    {...register("warehouseId")}
                    className={`w-full pl-9 pr-3 py-2 bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs appearance-none ${
                      errors.warehouseId ? "border-destructive focus:ring-destructive/30" : "border-input"
                    }`}
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id} className="bg-popover text-popover-foreground">
                        {w.name} ({w.city})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.warehouseId && (
                  <p className="text-destructive text-[11px] mt-1">{errors.warehouseId.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="select-priority" className="block text-foreground font-medium mb-1">
                  Mức độ ưu tiên <span className="text-destructive">*</span>
                </label>
                <select
                  id="select-priority"
                  {...register("priority")}
                  className="w-full px-3 py-2 bg-background border border-input rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs appearance-none"
                >
                  <option value="LOW" className="bg-popover text-popover-foreground">Thấp (Tiết kiệm)</option>
                  <option value="NORMAL" className="bg-popover text-popover-foreground">Bình thường (Tiêu chuẩn)</option>
                  <option value="HIGH" className="bg-popover text-popover-foreground">Cao (Giao nhanh)</option>
                  <option value="URGENT" className="bg-popover text-popover-foreground">Khẩn cấp (Hỏa tốc)</option>
                </select>
              </div>
            </div>

            {/* Khối lượng & Số kiện & COD */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="input-total-weight" className="block text-foreground font-medium mb-1">
                  Khối lượng (kg) <span className="text-destructive">*</span>
                </label>
                <input
                  id="input-total-weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  {...register("totalWeight", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs ${
                    errors.totalWeight ? "border-destructive focus:ring-destructive/30" : "border-input"
                  }`}
                />
                {errors.totalWeight && (
                  <p className="text-destructive text-[11px] mt-1">{errors.totalWeight.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="input-item-count" className="block text-foreground font-medium mb-1">
                  Số kiện hàng <span className="text-destructive">*</span>
                </label>
                <input
                  id="input-item-count"
                  type="number"
                  min="1"
                  {...register("itemCount", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs ${
                    errors.itemCount ? "border-destructive focus:ring-destructive/30" : "border-input"
                  }`}
                />
                {errors.itemCount && (
                  <p className="text-destructive text-[11px] mt-1">{errors.itemCount.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="input-cod-amount" className="block text-foreground font-medium mb-1">
                  Thu hộ COD (VNĐ)
                </label>
                <input
                  id="input-cod-amount"
                  type="number"
                  step="1000"
                  min="0"
                  {...register("codAmount", { valueAsNumber: true })}
                  className={`w-full px-3 py-2 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs ${
                    errors.codAmount ? "border-destructive focus:ring-destructive/30" : "border-input"
                  }`}
                />
                {errors.codAmount && (
                  <p className="text-destructive text-[11px] mt-1">{errors.codAmount.message}</p>
                )}
              </div>
            </div>

            {/* Hạn chót cam kết (SLA) */}
            <div>
              <label htmlFor="input-sla-deadline" className="block text-foreground font-medium mb-1">
                Hạn chót cam kết giao hàng (SLA Deadline) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  id="input-sla-deadline"
                  type="datetime-local"
                  {...register("deliveryWindowEnd")}
                  className={`w-full pl-9 pr-3 py-2 bg-background border rounded-xl text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-xs ${
                    errors.deliveryWindowEnd ? "border-destructive focus:ring-destructive/30" : "border-input"
                  }`}
                />
              </div>
              {errors.deliveryWindowEnd && (
                <p className="text-destructive text-[11px] mt-1">{errors.deliveryWindowEnd.message}</p>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-cancel-create-order"
                onClick={onClose}
                disabled={isSubmitting || createOrderMutation.isPending}
                className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 border border-border rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                id="btn-submit-create-order"
                disabled={isSubmitting || createOrderMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang khởi tạo đơn...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Xác nhận tạo đơn</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
