import React, { useRef, useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  RotateCcw,
  Camera,
  Upload,
  Banknote,
  QrCode,
  User,
  FileCheck,
  AlertCircle,
  Sparkles,
  Package,
  FileText,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import type { DriverStop, PodData } from "../types/driverPortal";

interface ProofOfDeliveryModalProps {
  isOpen: boolean;
  stop: DriverStop;
  onClose: () => void;
  onConfirmPod: (stopId: string, pod: PodData) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  isOpen,
  stop,
  onClose,
  onConfirmPod,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const [receiverName, setReceiverName] = useState(stop.customerName);
  const [receiverPhone, setReceiverPhone] = useState(stop.customerPhone);
  const [receiverRelation, setReceiverRelation] = useState<PodData["receiverRelation"]>("SELF");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");
  const [isCodConfirmed, setIsCodConfirmed] = useState(stop.codAmount === 0);
  const [notes, setNotes] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Setup Canvas kích thước
  useEffect(() => {
    if (!isOpen) return;
    setReceiverName(stop.customerName);
    setReceiverPhone(stop.customerPhone);
    setIsCodConfirmed(stop.codAmount === 0);
    setPhotoPreview(null);
    setHasSignature(false);
    setErrorMsg(null);

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(2, 2);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#0f172a";
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, stop]);

  if (!isOpen) return null;

  // Xử lý vẽ chuột / cảm ứng
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Mẫu chữ ký demo nhanh cho tester
  const applyQuickDemoSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2.8;

    // Vẽ nét ký giả lập mềm mại
    ctx.moveTo(40, 70);
    ctx.bezierCurveTo(70, 30, 90, 110, 120, 50);
    ctx.bezierCurveTo(150, 20, 170, 90, 220, 60);
    ctx.bezierCurveTo(240, 50, 260, 80, 280, 75);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(60, 90);
    ctx.lineTo(260, 85);
    ctx.stroke();

    setHasSignature(true);
  };

  // Xử lý ảnh tải lên hoặc chụp ảnh
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Chọn ảnh mẫu nhanh để review giao diện
  const handleSelectSamplePhoto = (url: string) => {
    setPhotoPreview(url);
  };

  const handleSave = () => {
    if (!hasSignature) {
      setErrorMsg("Vui lòng yêu cầu khách hàng ký tên xác nhận vào ô chữ ký bên dưới.");
      return;
    }

    if (stop.codAmount > 0 && !isCodConfirmed) {
      setErrorMsg("Vui lòng xác nhận đã thu đủ số tiền COD trước khi hoàn tất.");
      return;
    }

    if (!receiverName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên người nhận hàng thực tế.");
      return;
    }

    const canvas = canvasRef.current;
    const signatureUrl = canvas ? canvas.toDataURL("image/png") : "";

    const podData: PodData = {
      signatureUrl,
      photoUrl: photoPreview || undefined,
      codCollected: stop.codAmount > 0 ? isCodConfirmed : true,
      codAmount: stop.codAmount,
      codPaymentMethod: paymentMethod,
      receiverName: receiverName.trim(),
      receiverPhone: receiverPhone.trim(),
      receiverRelation,
      notes: notes.trim() || undefined,
      completedAt: new Date().toISOString(),
      gpsCoords: {
        lat: stop.lat,
        lng: stop.lng,
      },
    };

    onConfirmPod(stop.id, podData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-blue-600/10 via-primary/5 to-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-foreground">
                  Biên bản giao hàng điện tử (e-POD)
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                  {stop.orderCode}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Điểm dừng #{stop.sequence} • {stop.customerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body có thể scroll mượt mà */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Thông tin người nhận thực tế */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <User className="h-4 w-4 text-primary" />
              <span>Người nhận hàng thực tế</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground block">Họ và tên người nhận</label>
                <Input
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Nhập tên người nhận..."
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground block">Số điện thoại liên hệ</label>
                <Input
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="09xx..."
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground block">Quan hệ với người đặt hàng</label>
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                {[
                  { value: "SELF", label: "Chính chủ" },
                  { value: "FAMILY", label: "Người thân" },
                  { value: "SECURITY", label: "Bảo vệ / Lễ tân" },
                ].map((rel) => (
                  <button
                    key={rel.value}
                    type="button"
                    onClick={() => setReceiverRelation(rel.value as any)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all cursor-pointer ${
                      receiverRelation === rel.value
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card hover:bg-muted/80 text-muted-foreground border-border"
                    }`}
                  >
                    {rel.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Tiền thu hộ COD (nếu có) */}
          {stop.codAmount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
                  <Banknote className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Thu tiền mặt khi giao (COD)</span>
                </div>
                <span className="font-bold font-mono text-sm text-amber-600 dark:text-amber-400">
                  {stop.codAmount.toLocaleString("vi-VN")} đ
                </span>
              </div>

              {/* Hình thức thanh toán */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("CASH")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    paymentMethod === "CASH"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  <Banknote className="h-3.5 w-3.5" />
                  <span>Tiền mặt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("BANK_TRANSFER")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                      : "bg-card text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Chuyển khoản QR</span>
                </button>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isCodConfirmed}
                  onChange={(e) => setIsCodConfirmed(e.target.checked)}
                  className="h-4 w-4 rounded border-amber-500 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-foreground">
                  Tôi xác nhận đã kiểm đếm và nhận đủ <b>{stop.codAmount.toLocaleString("vi-VN")} đ</b>
                </span>
              </label>
            </div>
          )}

          {/* 3. Chữ ký điện tử trên màn hình Canvas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Chữ ký khách hàng</span>
                <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={applyQuickDemoSignature}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  title="Ký mẫu tự động để test nhanh"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Ký mẫu nhanh</span>
                </button>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>

            <div className="relative border-2 border-dashed border-border rounded-xl bg-card overflow-hidden h-36 select-none touch-none">
              <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-muted-foreground/60 gap-1">
                  <span className="text-xs font-medium">Khách hàng ký tên trực tiếp tại đây</span>
                  <span className="text-[10px] text-muted-foreground/40">(Hỗ trợ ngón tay cảm ứng trên điện thoại hoặc chuột)</span>
                </div>
              )}
            </div>
          </div>

          {/* 4. Chụp ảnh kiện hàng / biên bản bàn giao */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-primary" />
                <span>Ảnh chụp bàn giao kiện hàng (Tùy chọn)</span>
              </label>
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="text-[11px] text-destructive hover:underline cursor-pointer"
                >
                  Xóa ảnh
                </button>
              )}
            </div>

            {photoPreview ? (
              <div className="relative rounded-xl border border-border overflow-hidden bg-black/10 aspect-video max-h-40 flex items-center justify-center">
                <img src={photoPreview} alt="Ảnh POD" className="w-full h-full object-cover" />
                <Badge className="absolute bottom-2 right-2 bg-black/60 text-white border-0 text-[10px]">
                  Đã đính kèm ảnh
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border/80 rounded-xl p-3 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Upload className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium">Chụp ảnh hoặc tải ảnh lên</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 mt-0.5">
                    Hỗ trợ định dạng JPG, PNG (Dung lượng &lt; 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {/* Gợi ý ảnh mẫu nhanh tiện cho việc demo */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] text-muted-foreground shrink-0">Ảnh mẫu demo:</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectSamplePhoto(
                        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=60"
                      )
                    }
                    className="px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border inline-flex items-center gap-1"
                  >
                    <Package className="h-3 w-3 text-primary shrink-0" />
                    <span>Kiện hàng trước cửa</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSelectSamplePhoto(
                        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60"
                      )
                    }
                    className="px-2 py-0.5 rounded text-[10px] bg-muted hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-border inline-flex items-center gap-1"
                  >
                    <FileText className="h-3 w-3 text-primary shrink-0" />
                    <span>Biên bản ký nhận</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 5. Ghi chú phát sinh */}
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground block">Ghi chú chuyến giao (Tùy chọn)</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm: VD gửi lễ tân tòa nhà, khách kiểm tra êm đẹp..."
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20 shrink-0 gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="h-9 px-4 text-xs cursor-pointer">
            Hủy bỏ
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasSignature || (stop.codAmount > 0 && !isCodConfirmed)}
            className="h-9 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Xác nhận hoàn tất giao hàng</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
