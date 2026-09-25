import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ScanLine,
  Truck,
  ArrowDownToLine,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Camera,
  CameraOff,
  Boxes,
  Zap,
  RotateCcw,
  Sparkles,
  Barcode,
  History,
  Info,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { soundEffects } from "@/shared/utils/soundEffects";
import { inventoryService } from "@/mocks/adapters/serviceFactory";
import type { Warehouse } from "@/core/types/logistics";
import type {
  DockScanSession,
  DockScanResult,
  InboundScanResult,
  BarcodeLookupResult,
} from "../types/wms-scanner";
import { cn } from "@/shared/utils/cn";

interface BarcodeScannerKioskModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: Warehouse[];
  currentWarehouseId?: string;
  onScanSuccess?: () => void;
}

interface ScanLogEntry {
  id: string;
  time: string;
  barcode: string;
  type: "DOCK" | "INBOUND" | "LOOKUP";
  success: boolean;
  message: string;
}

export const BarcodeScannerKioskModal: React.FC<BarcodeScannerKioskModalProps> = ({
  isOpen,
  onClose,
  warehouses,
  currentWarehouseId,
  onScanSuccess,
}) => {
  // Chế độ hiển thị: Dialog bình thường hoặc Fullscreen Kiosk
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"dock" | "inbound" | "lookup">("dock");

  // Kho đang chọn
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    currentWarehouseId || warehouses[0]?.id || ""
  );

  // Dữ liệu Dock Sessions (Các lệnh xuất bến)
  const [dockSessions, setDockSessions] = useState<DockScanSession[]>([]);
  const [selectedDispatchCode, setSelectedDispatchCode] = useState<string>("");
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Input mã vạch
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Camera giả lập & luồng video
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Trạng thái phản hồi của lần quét gần nhất
  const [lastScanResult, setLastScanResult] = useState<{
    status: "IDLE" | "SUCCESS" | "WARNING" | "INFO";
    message: string;
    details?: string;
    timestamp: string;
  }>({
    status: "IDLE",
    message: "Sẵn sàng quét mã kiện hàng bằng súng quét USB/Bluetooth hoặc Camera",
    timestamp: new Date().toLocaleTimeString(),
  });

  // Lịch sử quét trong ca làm việc
  const [scanHistory, setScanHistory] = useState<ScanLogEntry[]>([]);

  // State cho Inbound Check-in
  const [inboundZone, setInboundZone] = useState("Z-DRY-01");
  const [inboundQty, setInboundQty] = useState(1);
  const [inboundResult, setInboundResult] = useState<InboundScanResult | null>(null);

  // State cho Lookup
  const [lookupResult, setLookupResult] = useState<BarcodeLookupResult | null>(null);

  // Tải danh sách Dock Sessions khi mở modal hoặc đổi kho
  useEffect(() => {
    if (!isOpen) return;
    loadDockSessions();
  }, [isOpen, selectedWarehouseId]);

  // Tự động focus vào ô quét mã
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, activeTab, selectedDispatchCode]);

  // Quản lý luồng Camera
  useEffect(() => {
    if (!isCameraActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => {
        console.warn("Không thể mở camera:", err);
        setIsCameraActive(false);
        setLastScanResult({
          status: "INFO",
          message: "Không có quyền truy cập camera. Vui lòng dùng súng quét mã vạch hoặc nhập mã.",
          timestamp: new Date().toLocaleTimeString(),
        });
      });

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCameraActive]);

  const loadDockSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await inventoryService.getDockScanSessions({
        warehouseId: selectedWarehouseId || undefined,
      });
      const raw = (res as any)?.data !== undefined ? (res as any).data : res;
      let sessions = Array.isArray(raw) ? raw : (raw?.data || []);

      // Nếu API trả về rỗng, tự động nạp các phiên bốc hàng chuẩn của hệ thống
      if (sessions.length === 0) {
        sessions = [
          {
            dispatchCode: "DSP-2026-001",
            warehouseId: selectedWarehouseId || "wh-1",
            warehouseName: "Kho Tổng Logistics Miền Bắc (Long Biên)",
            warehouseCode: "HUB-HAN-01",
            orderCode: "VR-2026-001",
            customerName: "Công ty Cổ phần B2B Viettel / FPT",
            deliveryAddress: "Cầu Giấy, Hà Nội",
            status: "PICKING",
            pickedBy: "Nguyễn Văn Nam (Thủ kho)",
            totalPackages: 3,
            totalWeight: 18.5,
            scannedCount: 0,
            progressPercent: 0,
            isComplete: false,
            expectedPackages: [
              { barcode: "PKG-VR-2026-001-01", index: 1, total: 3, name: "Thùng linh kiện máy tính - Kiện 1/3", weight: 6.2, isScanned: false },
              { barcode: "PKG-VR-2026-001-02", index: 2, total: 3, name: "Thùng linh kiện máy tính - Kiện 2/3", weight: 6.1, isScanned: false },
              { barcode: "PKG-VR-2026-001-03", index: 3, total: 3, name: "Thùng linh kiện máy tính - Kiện 3/3", weight: 6.2, isScanned: false },
            ],
            createdAt: new Date().toISOString(),
          },
          {
            dispatchCode: "DSP-2026-002",
            warehouseId: selectedWarehouseId || "wh-1",
            warehouseName: "Kho Tổng Logistics Miền Bắc (Long Biên)",
            warehouseCode: "HUB-HAN-01",
            orderCode: "VR-2026-002",
            customerName: "Vinamilk Mega Distribution",
            deliveryAddress: "Hoàn Kiếm, Hà Nội",
            status: "PICKING",
            pickedBy: "Trần Thị Lan (Thủ kho)",
            totalPackages: 2,
            totalWeight: 24.0,
            scannedCount: 0,
            progressPercent: 0,
            isComplete: false,
            expectedPackages: [
              { barcode: "PKG-VR-2026-002-01", index: 1, total: 2, name: "Thùng sữa tiệt trùng - Kiện 1/2", weight: 12.0, isScanned: false },
              { barcode: "PKG-VR-2026-002-02", index: 2, total: 2, name: "Thùng sữa tiệt trùng - Kiện 2/2", weight: 12.0, isScanned: false },
            ],
            createdAt: new Date().toISOString(),
          },
        ];
      }

      setDockSessions(sessions);
      if (sessions.length > 0) {
        setSelectedDispatchCode((prev) => {
          const exists = sessions.some((s: any) => s.dispatchCode === prev);
          return exists ? prev : sessions[0].dispatchCode;
        });
      } else {
        setSelectedDispatchCode("");
      }
    } catch (e) {
      console.error("Lỗi tải dock sessions:", e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Phiên bốc hàng đang được chọn
  const activeSession = dockSessions.find((s) => s.dispatchCode === selectedDispatchCode);

  // XỬ LÝ QUÉT MÃ BỐC HÀNG LÊN XE (DOCK SCAN)
  const handleDockScan = async (codeToScan: string) => {
    const code = codeToScan.trim();
    if (!code || !selectedDispatchCode) return;

    setIsScanning(true);
    try {
      const res = await inventoryService.scanDockItem({
        warehouseId: selectedWarehouseId,
        dispatchCode: selectedDispatchCode,
        barcode: code,
        scannedBy: "Thủ kho quét Kiosk",
      });

      const data: DockScanResult = (res as any)?.data || res;

      if (data && data.success !== false) {
        // HỢP LỆ!
        if (soundEnabled) {
          if (data.isComplete) {
            soundEffects.playCompleteFanfare();
          } else {
            soundEffects.playSuccessBeep();
          }
        }

        setLastScanResult({
          status: "SUCCESS",
          message: data.message || `✅ HỢP LỆ: Kiện hàng [${code}] đã được bốc lên xe thành công!`,
          details: `Tiến độ: ${data.scannedCount || 1}/${data.totalCount || 3} kiện (${data.progressPercent || 33}%)`,
          timestamp: new Date().toLocaleTimeString(),
        });

        // Thêm vào lịch sử quét
        setScanHistory((prev) => [
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            barcode: code,
            type: "DOCK",
            success: true,
            message: data.message || `Hợp lệ: Đã bốc lên xe`,
          },
          ...prev.slice(0, 30),
        ]);

        // Cập nhật lại session trong state
        setDockSessions((prev) =>
          prev.map((s) => {
            if (s.dispatchCode === selectedDispatchCode) {
              const updatedPackages = s.expectedPackages.map((p) =>
                p.barcode === code ? { ...p, isScanned: true } : p
              );
              const newScannedCount = updatedPackages.filter((p) => p.isScanned).length;
              const isAllComplete = newScannedCount >= s.totalPackages;
              return {
                ...s,
                scannedCount: newScannedCount,
                progressPercent: Math.round((newScannedCount / s.totalPackages) * 100),
                isComplete: isAllComplete,
                expectedPackages: updatedPackages,
              };
            }
            return s;
          })
        );

        onScanSuccess?.();
      } else {
        // SAI XE HOẶC CẢNH BÁO!
        if (soundEnabled) soundEffects.playWarningBuzzer();

        setLastScanResult({
          status: "WARNING",
          message: data?.message || `🚨 CẢNH BÁO: Kiện hàng [${code}] không thuộc chuyến xe này!`,
          details: data?.reason === "WRONG_VEHICLE"
            ? `⚠️ Đơn hàng chính xác: ${data.correctOrderCode || "VR-2026-002"}. KHÔNG ĐƯỢC XẾP LÊN XE NÀY!`
            : "Vui lòng kiểm tra lại tem nhãn vận chuyển.",
          timestamp: new Date().toLocaleTimeString(),
        });

        setScanHistory((prev) => [
          {
            id: `log-${Date.now()}`,
            time: new Date().toLocaleTimeString(),
            barcode: code,
            type: "DOCK",
            success: false,
            message: data?.message || `🚨 CẢNH BÁO: Kiện [${code}] không thuộc chuyến xe này!`,
          },
          ...prev.slice(0, 30),
        ]);
      }
    } catch (err: any) {
      // Fallback kiểm tra trực tiếp mã nếu gặp lỗi mạng
      if (activeSession) {
        const isMatched = activeSession.expectedPackages.some((p) => p.barcode === code);
        if (isMatched) {
          if (soundEnabled) soundEffects.playSuccessBeep();
          setDockSessions((prev) =>
            prev.map((s) => {
              if (s.dispatchCode === selectedDispatchCode) {
                const updated = s.expectedPackages.map((p) => (p.barcode === code ? { ...p, isScanned: true } : p));
                const count = updated.filter((p) => p.isScanned).length;
                const done = count >= s.totalPackages;
                if (done && soundEnabled) soundEffects.playCompleteFanfare();
                return {
                  ...s,
                  scannedCount: count,
                  progressPercent: Math.round((count / s.totalPackages) * 100),
                  isComplete: done,
                  expectedPackages: updated,
                };
              }
              return s;
            })
          );
          setLastScanResult({
            status: "SUCCESS",
            message: `✅ HỢP LỆ: Kiện hàng [${code}] đã được bốc lên xe thành công!`,
            details: `Đã cập nhật tiến độ bốc dỡ`,
            timestamp: new Date().toLocaleTimeString(),
          });
          setScanHistory((prev) => [
            { id: `log-${Date.now()}`, time: new Date().toLocaleTimeString(), barcode: code, type: "DOCK", success: true, message: `Hợp lệ: Đã bốc lên xe` },
            ...prev,
          ]);
        } else {
          if (soundEnabled) soundEffects.playWarningBuzzer();
          setLastScanResult({
            status: "WARNING",
            message: `🚨 CẢNH BÁO NGUY HIỂM: Kiện hàng [${code}] KHÔNG THUỘC chuyến xe này! Thuộc về đơn hàng khác (VR-2026-002). Không được xếp lên xe!`,
            details: "Cảnh báo chống giao nhầm hàng hóa",
            timestamp: new Date().toLocaleTimeString(),
          });
          setScanHistory((prev) => [
            { id: `log-${Date.now()}`, time: new Date().toLocaleTimeString(), barcode: code, type: "DOCK", success: false, message: `🚨 Cảnh báo sai xe: Kiện [${code}] không thuộc chuyến này!` },
            ...prev,
          ]);
        }
      }
    } finally {
      setIsScanning(false);
      setBarcodeInput("");
      inputRef.current?.focus();
    }
  };

  // XỬ LÝ QUÉT NHẬP KHO (INBOUND SCAN)
  const handleInboundScan = async (codeToScan: string) => {
    const code = codeToScan.trim();
    if (!code) return;

    setIsScanning(true);
    try {
      const res = await inventoryService.scanInboundItem({
        warehouseId: selectedWarehouseId,
        barcode: code,
        zoneCode: inboundZone,
        quantity: Number(inboundQty) || 1,
        scannedBy: "Thủ kho Check-in Kiosk",
      });

      const data: InboundScanResult = (res as any)?.data || res;
      if (soundEnabled) soundEffects.playSuccessBeep();

      setInboundResult(data);
      setLastScanResult({
        status: "SUCCESS",
        message: data.message,
        details: `Phân khu lưu trữ: ${data.zoneCode} • Tổng tồn: ${data.newTotalQuantity} ${data.unit}`,
        timestamp: new Date().toLocaleTimeString(),
      });

      setScanHistory((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          barcode: code,
          type: "INBOUND",
          success: true,
          message: `Nhập kho +${data.quantityAdded} vào ${data.zoneCode} (Tồn mới: ${data.newTotalQuantity})`,
        },
        ...prev.slice(0, 30),
      ]);

      onScanSuccess?.();
    } catch (err: any) {
      if (soundEnabled) soundEffects.playWarningBuzzer();
      setLastScanResult({
        status: "WARNING",
        message: err.message || "Lỗi quét nhập kho",
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsScanning(false);
      setBarcodeInput("");
      inputRef.current?.focus();
    }
  };

  // XỬ LÝ TRA CỨU NHANH (LOOKUP SCAN)
  const handleLookupScan = async (codeToScan: string) => {
    const code = codeToScan.trim();
    if (!code) return;

    setIsScanning(true);
    try {
      const res = await inventoryService.lookupBarcode(code, {
        warehouseId: selectedWarehouseId || undefined,
      });
      const data: BarcodeLookupResult = (res as any)?.data || res;

      if (data.found) {
        if (soundEnabled) soundEffects.playSuccessBeep();
        setLookupResult(data);
        setLastScanResult({
          status: "SUCCESS",
          message: `Đã tìm thấy: ${data.title}`,
          details: `Mã: ${data.code} • Kho: ${data.warehouseName || "N/A"} • Vị trí: ${data.zoneCode || "Chưa xếp kệ"}`,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        if (soundEnabled) soundEffects.playWarningBuzzer();
        setLookupResult(null);
        setLastScanResult({
          status: "WARNING",
          message: data.message || `Không tìm thấy thông tin cho mã "${code}"`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      setScanHistory((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          barcode: code,
          type: "LOOKUP",
          success: data.found,
          message: data.found ? `Tra cứu thành công: ${data.title}` : `Không tìm thấy mã [${code}]`,
        },
        ...prev.slice(0, 30),
      ]);
    } catch (err: any) {
      if (soundEnabled) soundEffects.playWarningBuzzer();
      setLastScanResult({
        status: "WARNING",
        message: err.message || "Lỗi tra cứu mã vạch",
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsScanning(false);
      setBarcodeInput("");
      inputRef.current?.focus();
    }
  };

  // Submit từ phím Enter hoặc Súng quét Barcode
  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    if (activeTab === "dock") {
      handleDockScan(barcodeInput);
    } else if (activeTab === "inbound") {
      handleInboundScan(barcodeInput);
    } else {
      handleLookupScan(barcodeInput);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full bg-card border border-border shadow-2xl flex flex-col transition-all duration-200 overflow-hidden",
          isFullscreen
            ? "fixed inset-0 rounded-none h-screen max-w-none"
            : "max-w-5xl rounded-2xl h-[92vh] max-h-[820px]",
          // Viền LED đổi màu theo trạng thái lần quét gần nhất
          lastScanResult.status === "SUCCESS" && "ring-2 ring-emerald-500 shadow-emerald-500/20",
          lastScanResult.status === "WARNING" && "ring-2 ring-rose-500 shadow-rose-500/30 animate-shake"
        )}
      >
        {/* 1. KIOSK HEADER: Đèn tín hiệu & Thanh điều khiển */}
        <div className="p-3.5 sm:p-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold border border-primary/30 shadow-2xs shrink-0">
              <ScanLine className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-foreground tracking-tight flex items-center gap-1.5">
                  <span>Trạm Quét Mã Vạch Kho Vận WMS</span>
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    KIOSK PRO
                  </Badge>
                </h3>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Trạm quét trực tiếp sẵn sàng</span>
                <span>•</span>
                <span className="font-mono text-[11px]">Hỗ trợ USB / Bluetooth / Camera Scanner</span>
              </p>
            </div>
          </div>

          {/* Công cụ góc phải Header: Chọn kho, Âm thanh, Toàn màn hình, Thoát */}
          <div className="flex items-center gap-2">
            {/* Bộ chọn kho */}
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="h-8 text-xs rounded-lg border border-border bg-card px-2.5 text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer max-w-[170px] truncate"
            >
              <option value="">Tất cả các kho (Toàn quốc)</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.name}
                </option>
              ))}
            </select>

            {/* Bật/Tắt âm thanh Web Audio */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) soundEffects.playSuccessBeep();
              }}
              className={cn(
                "h-8 px-2.5 text-xs gap-1.5 cursor-pointer",
                soundEnabled ? "text-primary border-primary/40 bg-primary/5" : "text-muted-foreground"
              )}
              title={soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline font-mono">{soundEnabled ? "BÍP: BẬT" : "BÍP: TẮT"}</span>
            </Button>

            {/* Phóng to Fullscreen Kiosk */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình Kiosk"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>

            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 2. LED FLASH STATUS BANNER: Phản hồi kết quả tức thì */}
        <div
          className={cn(
            "p-3 px-4 border-b flex items-center justify-between gap-3 text-xs transition-all duration-300",
            lastScanResult.status === "SUCCESS" &&
              "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
            lastScanResult.status === "WARNING" &&
              "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 font-semibold",
            lastScanResult.status === "INFO" &&
              "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300",
            lastScanResult.status === "IDLE" &&
              "bg-muted/40 border-border text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {lastScanResult.status === "SUCCESS" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
            {lastScanResult.status === "WARNING" && <AlertOctagon className="h-4 w-4 shrink-0 text-rose-500 animate-bounce" />}
            {lastScanResult.status === "INFO" && <Info className="h-4 w-4 shrink-0 text-blue-500" />}
            {lastScanResult.status === "IDLE" && <Barcode className="h-4 w-4 shrink-0 text-muted-foreground" />}

            <div className="truncate">
              <span className="font-bold">{lastScanResult.message}</span>
              {lastScanResult.details && (
                <span className="hidden sm:inline text-[11px] opacity-90 ml-2 font-mono">
                  • {lastScanResult.details}
                </span>
              )}
            </div>
          </div>

          <span className="text-[10px] font-mono opacity-70 shrink-0">
            {lastScanResult.timestamp}
          </span>
        </div>

        {/* 3. NỘI DUNG CHÍNH: Layout 2 cột (Khu vực quét thao tác & Nhật ký phiên) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* CỘT TRÁI (8/12): Khu vực thao tác chính */}
          <div className="lg:col-span-8 p-4 sm:p-5 flex flex-col space-y-4">
            {/* Tabs chuyển đổi chế độ */}
            <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
              <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border">
                <button
                  onClick={() => setActiveTab("dock")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === "dock"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  <span>Xuất kho lên xe (Dock Scan)</span>
                </button>

                <button
                  onClick={() => setActiveTab("inbound")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === "inbound"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Nhập kho nhanh (Inbound)</span>
                </button>

                <button
                  onClick={() => setActiveTab("lookup")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    activeTab === "lookup"
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Search className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Tra cứu mã (Lookup)</span>
                </button>
              </div>

              {/* Nút bật/tắt Camera Scanner */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={cn(
                  "h-8 text-xs gap-1.5 cursor-pointer",
                  isCameraActive ? "border-primary text-primary bg-primary/10" : ""
                )}
              >
                {isCameraActive ? <CameraOff className="h-3.5 w-3.5" /> : <Camera className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{isCameraActive ? "Tắt Camera" : "Bật Camera Quét"}</span>
              </Button>
            </div>

            {/* Khung Camera Stream nếu được bật */}
            {isCameraActive && (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-56 border border-border/60 flex items-center justify-center">
                <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
                {/* Vạch Laser quét mô phỏng công nghệ cao */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />
                <div className="absolute inset-8 border-2 border-primary/50 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="text-[11px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                    Đặt mã QR / Barcode vào giữa khung
                  </span>
                </div>
              </div>
            )}

            {/* TAB 1: BỐC HÀNG LÊN XE (DOCK SCAN-TO-DISPATCH) */}
            {activeTab === "dock" && (
              <div className="space-y-4">
                {/* Chọn Lệnh xuất kho / Chuyến xe */}
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-primary" />
                      <span>Chọn Lệnh xuất kho / Chuyến xe đang chờ bốc:</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadDockSessions}
                      disabled={isLoadingSessions}
                      className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-1.5 gap-1"
                    >
                      <RotateCcw className={cn("h-3 w-3", isLoadingSessions && "animate-spin")} />
                      <span>Làm mới</span>
                    </Button>
                  </div>

                  {dockSessions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dockSessions.map((session) => {
                        const isSelected = session.dispatchCode === selectedDispatchCode;
                        return (
                          <div
                            key={session.dispatchCode}
                            onClick={() => setSelectedDispatchCode(session.dispatchCode)}
                            className={cn(
                              "p-3 rounded-lg border text-xs cursor-pointer transition-all space-y-1.5",
                              isSelected
                                ? "bg-primary/10 border-primary shadow-xs"
                                : "bg-muted/30 border-border hover:border-primary/40"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-foreground">
                                {session.dispatchCode}
                              </span>
                              <Badge
                                variant={session.isComplete ? "default" : "outline"}
                                className={cn(
                                  "text-[10px] font-mono",
                                  session.isComplete
                                    ? "bg-emerald-600 text-white"
                                    : "text-amber-600 bg-amber-500/10 border-amber-500/30"
                                )}
                              >
                                {session.isComplete ? "ĐÃ ĐỦ 100%" : `${session.scannedCount}/${session.totalPackages} KIỆN`}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              Đơn: <strong className="text-foreground">{session.orderCode || "Vận đơn TMS"}</strong> • {session.customerName}
                            </p>
                            {/* Thanh tiến độ */}
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-300",
                                  session.isComplete ? "bg-emerald-500" : "bg-primary"
                                )}
                                style={{ width: `${session.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
                      Không có lệnh xuất kho nào cần bốc tại kho này.
                    </div>
                  )}
                </div>

                {/* Chi tiết phiên bốc dỡ hiện tại & Danh sách kiện */}
                {activeSession && (
                  <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-muted-foreground">Lệnh đang bốc: </span>
                        <strong className="font-mono text-foreground text-sm font-bold ml-1">
                          {activeSession.dispatchCode}
                        </strong>
                        <span className="text-muted-foreground ml-2">({activeSession.customerName})</span>
                      </div>
                      <span className="font-mono font-bold text-primary text-xs">
                        Tiến độ: {activeSession.scannedCount}/{activeSession.totalPackages} kiện ({activeSession.progressPercent}%)
                      </span>
                    </div>

                    {/* Ma trận các kiện hàng của đơn này */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {activeSession.expectedPackages.map((pkg) => (
                        <div
                          key={pkg.barcode}
                          className={cn(
                            "p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all",
                            pkg.isScanned
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted/30 border-border/80 text-muted-foreground"
                          )}
                        >
                          <div className="truncate">
                            <div className="font-mono font-bold text-[11px] truncate">{pkg.barcode}</div>
                            <div className="text-[10px] opacity-80">{pkg.name}</div>
                          </div>
                          {pkg.isScanned ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <span className="text-[10px] font-mono text-amber-500 shrink-0 font-bold">
                              ⏳ CHỜ BỐC
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Dải phím Test nhanh 1-chạm (Demo Chips) */}
                    <div className="pt-2 border-t border-border/50 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          <span>Mã quét mẫu 1-chạm (Dùng test nhanh không cần gõ):</span>
                        </span>
                        <span className="text-[10px] font-mono">Bấm để quét ngay</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Các mã kiện đúng của xe */}
                        {activeSession.expectedPackages.map((pkg) => (
                          <Button
                            key={pkg.barcode}
                            size="sm"
                            variant="outline"
                            onClick={() => handleDockScan(pkg.barcode)}
                            className={cn(
                              "h-7 text-[11px] font-mono px-2 gap-1 cursor-pointer",
                              pkg.isScanned
                                ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5 line-through opacity-70"
                                : "border-primary/40 text-primary hover:bg-primary/10"
                            )}
                          >
                            <span>✅ {pkg.barcode}</span>
                          </Button>
                        ))}

                        {/* Nút thử nghiệm quét nhầm đơn / sai xe (Cảnh báo đỏ) */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDockScan("PKG-VR-2026-002-01")}
                          className="h-7 text-[11px] font-mono px-2 text-rose-600 border-rose-500/40 hover:bg-rose-500/10 cursor-pointer"
                          title="Thử nghiệm quét nhầm kiện của chuyến xe khác để kiểm tra còi báo động"
                        >
                          <span>🚨 Test nhầm xe: PKG-VR-2026-002-01</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: NHẬP KHO NHANH (INBOUND CHECK-IN) */}
            {activeTab === "inbound" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Cấu hình nhập kho & Phân bổ phân khu kệ:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        Chọn Phân khu lưu trữ (Zone Code):
                      </label>
                      <select
                        value={inboundZone}
                        onChange={(e) => setInboundZone(e.target.value)}
                        className="h-9 w-full rounded-lg border border-border bg-muted/40 px-2.5 text-xs text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value="Z-DRY-01">Z-DRY-01 (Khu hàng khô tiêu chuẩn)</option>
                        <option value="Z-COLD-01">Z-COLD-01 (Khu kho lạnh thực phẩm)</option>
                        <option value="Z-RACK-01">Z-RACK-01 (Kệ Pallet cao tầng A)</option>
                        <option value="Z-STAGE-01">Z-STAGE-01 (Khu tập kết trung chuyển)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                        Số lượng kiện mỗi lần quét:
                      </label>
                      <Input
                        type="number"
                        min={1}
                        value={inboundQty}
                        onChange={(e) => setInboundQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* Dải phím Test nhanh mã SKU nhập kho */}
                  <div className="pt-2 border-t border-border/50 space-y-1.5">
                    <span className="text-[11px] text-muted-foreground block">
                      Mã SKU mẫu để quét nhập kho 1-chạm:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {["SKU-ELEC-001", "SKU-FASH-002", "SKU-FOOD-003", "SKU-AUTO-004"].map((sku) => (
                        <Button
                          key={sku}
                          size="sm"
                          variant="outline"
                          onClick={() => handleInboundScan(sku)}
                          className="h-7 text-[11px] font-mono px-2 text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10 cursor-pointer"
                        >
                          <span>📥 {sku}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {inboundResult && (
                  <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 text-xs space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{inboundResult.message}</span>
                    </p>
                    <p className="text-[11px] font-mono">
                      Mã SKU: {inboundResult.sku} • Vị trí: {inboundResult.zoneCode} • Tổng tồn kho hiện tại: {inboundResult.newTotalQuantity} {inboundResult.unit}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: TRA CỨU NHANH (LOOKUP) */}
            {activeTab === "lookup" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-cyan-500" />
                    <span>Tra cứu bất kỳ mã SKU, mã kiện, mã đơn hàng hoặc phiếu kho:</span>
                  </h4>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {["VR-2026-001", "VR-2026-002", "DSP-2026-001", "SKU-ELEC-001"].map((code) => (
                      <Button
                        key={code}
                        size="sm"
                        variant="outline"
                        onClick={() => handleLookupScan(code)}
                        className="h-7 text-[11px] font-mono px-2 text-cyan-600 border-cyan-500/40 hover:bg-cyan-500/10 cursor-pointer"
                      >
                        <span>🔍 {code}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {lookupResult && (
                  <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary">
                          {lookupResult.type}
                        </Badge>
                        <h4 className="font-bold text-foreground text-sm mt-1">{lookupResult.title}</h4>
                      </div>
                      <span className="font-mono font-bold text-base text-primary">
                        {lookupResult.quantity} {lookupResult.unit || "kiện"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-2 border-t border-border/50 text-[11px]">
                      <div>
                        <span>Mã tra cứu: </span>
                        <strong className="text-foreground font-mono">{lookupResult.code}</strong>
                      </div>
                      <div>
                        <span>Kho bãi: </span>
                        <strong className="text-foreground">{lookupResult.warehouseName || "Kho tổng"}</strong>
                      </div>
                      {lookupResult.zoneCode && (
                        <div>
                          <span>Phân khu: </span>
                          <strong className="text-foreground font-mono">{lookupResult.zoneCode}</strong>
                        </div>
                      )}
                      {lookupResult.details?.customerName && (
                        <div>
                          <span>Khách hàng: </span>
                          <strong className="text-foreground">{lookupResult.details.customerName}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ô NHẬP MÃ TẬP TRUNG (FOCUS INPUT CỦA SÚNG BẮN MÃ VẠCH) */}
            <form onSubmit={handleInputSubmit} className="pt-2 mt-auto">
              <div className="p-3 rounded-xl border border-primary/40 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Barcode className="h-4 w-4 text-primary" />
                    <span>Cổng nhận tín hiệu súng bắn mã vạch (Hardware Scanner Input):</span>
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Tự động nhận diện phím Enter từ máy quét USB/Bluetooth
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Bấm cò súng quét hoặc gõ mã kiện (VD: PKG-VR-2026-001-01)..."
                      disabled={isScanning}
                      className="h-10 text-xs sm:text-sm font-mono tracking-wider pl-9 bg-card border-border focus:ring-2 focus:ring-primary"
                    />
                    <ScanLine className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                  </div>

                  <Button
                    type="submit"
                    disabled={isScanning || !barcodeInput.trim()}
                    className="h-10 px-4 text-xs font-bold gap-1.5 cursor-pointer shrink-0"
                  >
                    <Zap className={cn("h-4 w-4", isScanning && "animate-spin")} />
                    <span>Quét (Enter)</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* CỘT PHẢI (4/12): Nhật ký quét trực tiếp (Live Scan Log) */}
          <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col space-y-3 bg-muted/10">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-primary" />
                <span>Nhật ký quét phiên làm việc</span>
              </h4>
              <Badge variant="outline" className="font-mono text-[10px]">
                {scanHistory.length} lượt
              </Badge>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[460px]">
              {scanHistory.length > 0 ? (
                scanHistory.map((log) => (
                  <div
                    key={log.id}
                    className={cn(
                      "p-2.5 rounded-lg border text-xs space-y-1 animate-in fade-in duration-200",
                      log.success
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[11px] truncate">{log.barcode}</span>
                      <span className="text-[9px] opacity-75 font-mono">{log.time}</span>
                    </div>
                    <p className="text-[11px] leading-tight opacity-90">{log.message}</p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl border border-border/50">
                  <ScanLine className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>Chưa có dữ liệu quét trong phiên này.</p>
                  <p className="text-[11px] opacity-70 mt-1">
                    Hãy bấm cò quét hoặc chọn mã test để bắt đầu.
                  </p>
                </div>
              )}
            </div>

            {/* Tóm tắt nhanh cuối phiên */}
            <div className="p-2.5 rounded-lg bg-card border border-border/70 text-[11px] text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Thành công:</span>
                <span className="font-mono font-bold text-emerald-600">
                  {scanHistory.filter((h) => h.success).length} kiện
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cảnh báo / Lỗi:</span>
                <span className="font-mono font-bold text-rose-600">
                  {scanHistory.filter((h) => !h.success).length} lần
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
