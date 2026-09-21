import React, { useState } from "react";
import { Building2, User, Phone, Mail, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { toast } from "@/shared/components/feedback/Toast";
import { customerService } from "@/mocks/adapters/serviceFactory";
import type { Customer } from "@/core/types/logistics";

interface CreateCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    type: "ENTERPRISE" as "INDIVIDUAL" | "ENTERPRISE",
    latitude: 21.0285,
    longitude: 105.8542,
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error("Thiếu thông tin", "Vui lòng điền đầy đủ tên, SĐT và email");
      return;
    }

    setIsSubmitting(true);
    try {
      await customerService.createCustomer(form as Omit<Customer, "id">);
      toast.success("Tạo thành công", `Đã thêm khách hàng "${form.name}"`);
      onSuccess();
      onClose();
      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        type: "ENTERPRISE",
        latitude: 21.0285,
        longitude: 105.8542,
      });
    } catch {
      toast.error("Lỗi", "Không thể tạo khách hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            Thêm khách hàng mới
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Phân loại</label>
            <Select
              value={form.type}
              onValueChange={(val) => updateField("type", val)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ENTERPRISE" className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" />
                    Doanh nghiệp (B2B)
                  </div>
                </SelectItem>
                <SelectItem value="INDIVIDUAL" className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Cá nhân (B2C)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tên {form.type === "ENTERPRISE" ? "doanh nghiệp" : "khách hàng"} *
            </label>
            <Input
              placeholder={form.type === "ENTERPRISE" ? "Công ty TNHH..." : "Nguyễn Văn..."}
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Số điện thoại *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input
                  placeholder="0912..."
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="h-9 text-xs pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input
                  placeholder="email@company.vn"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="h-9 text-xs pl-9"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Địa chỉ</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground/60" />
              <Textarea
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className="text-xs pl-9 min-h-[64px] resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 text-xs cursor-pointer"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 text-xs gap-1.5 font-semibold cursor-pointer"
            >
              {isSubmitting ? "Đang tạo..." : "Tạo khách hàng"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
