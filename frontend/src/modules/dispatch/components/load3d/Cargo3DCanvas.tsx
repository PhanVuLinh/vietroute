import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  Eye,
  Maximize2,
  Play,
  Pause,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sliders,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { PlacedCargoBox, VehicleContainerPreset } from '../../types/load3d';

interface Cargo3DCanvasProps {
  vehicle: VehicleContainerPreset;
  placedBoxes: PlacedCargoBox[];
  selectedBoxId?: string | null;
  onSelectBox?: (box: PlacedCargoBox | null) => void;
}

export const Cargo3DCanvas: React.FC<Cargo3DCanvasProps> = ({
  vehicle,
  placedBoxes,
  selectedBoxId,
  onSelectBox,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Góc xoay và Zoom
  // yaw: góc quay quanh trục Z (độ), pitch: góc nghiêng từ trên xuống (độ)
  const [yaw, setYaw] = useState<number>(35);
  const [pitch, setPitch] = useState<number>(30);
  const [zoom, setZoom] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Bước bốc xếp (Step-by-Step)
  const maxSteps = placedBoxes.length || 1;
  const [currentStep, setCurrentStep] = useState<number>(maxSteps);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Khi danh sách kiện thay đổi, cập nhật bước tối đa
  useEffect(() => {
    setCurrentStep(placedBoxes.length);
  }, [placedBoxes.length]);

  // Tự động phát diễn hoạt (Auto Play Animation)
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= maxSteps) {
            setIsPlaying(false);
            return maxSteps;
          }
          return prev + 1;
        });
      }, 400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, maxSteps]);

  // Preset góc nhìn
  const setViewPreset = (type: 'ISOMETRIC' | 'TOP' | 'SIDE' | 'REAR') => {
    if (type === 'ISOMETRIC') {
      setYaw(35);
      setPitch(30);
      setZoom(1.0);
    } else if (type === 'TOP') {
      setYaw(0);
      setPitch(88);
      setZoom(1.1);
    } else if (type === 'SIDE') {
      setYaw(90);
      setPitch(5);
      setZoom(1.1);
    } else if (type === 'REAR') {
      setYaw(0);
      setPitch(5);
      setZoom(1.1);
    }
  };

  // Chiếu điểm 3D [X, Y, Z] thành tọa độ màn hình 2D [screenX, screenY, depth]
  // Hệ tọa độ:
  // X: Chiều dọc xe (0 = cabin, L = đuôi xe)
  // Y: Chiều ngang xe (0 = bên trái, W = bên phải)
  // Z: Chiều cao xe (0 = sàn xe, H = trần xe)
  const project3D = useCallback(
    (
      x: number,
      y: number,
      z: number,
      centerX: number,
      centerY: number,
      scale: number
    ): { x: number; y: number; depth: number } => {
      // Dời gốc tọa độ về tâm thùng xe
      const cx = x - vehicle.lengthM / 2;
      const cy = y - vehicle.widthM / 2;
      const cz = z - vehicle.heightM / 2;

      const radYaw = (yaw * Math.PI) / 180;
      const radPitch = (pitch * Math.PI) / 180;

      // Xoay quanh trục Z (Yaw)
      const x1 = cx * Math.cos(radYaw) - cy * Math.sin(radYaw);
      const y1 = cx * Math.sin(radYaw) + cy * Math.cos(radYaw);
      const z1 = cz;

      // Xoay quanh trục X (Pitch)
      const x2 = x1;
      const y2 = y1 * Math.cos(radPitch) - z1 * Math.sin(radPitch);
      const z2 = y1 * Math.sin(radPitch) + z1 * Math.cos(radPitch);

      // Phối cảnh Perspective nhẹ
      const cameraDistance = 15;
      const fov = cameraDistance / (cameraDistance + y2);

      const screenX = centerX + x2 * scale * fov;
      const screenY = centerY - z2 * scale * fov;
      const depth = y2; // Dùng để sắp xếp Z-sorting vẽ từ xa tới gần

      return { x: screenX, y: screenY, depth };
    },
    [yaw, pitch, vehicle.lengthM, vehicle.widthM, vehicle.heightM]
  );

  // VẼ TOÀN BỘ KHÔNG GIAN 3D LÊN CANVAS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina resolution
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2 + 30;

    // Tỉ lệ scale tính theo kích thước thùng xe
    const baseScale = Math.min(width / (vehicle.lengthM * 1.5), height / (vehicle.heightM * 2.8)) * 0.85;
    const scale = baseScale * zoom;

    // 1. Xóa nền với hiệu ứng Gradient Dark Studio chuyên nghiệp
    const bgGrad = ctx.createRadialGradient(centerX, centerY - 50, 50, centerX, centerY, width * 0.8);
    bgGrad.addColorStop(0, '#1E293B'); // Slate 800
    bgGrad.addColorStop(1, '#0F172A'); // Slate 900
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Vẽ bóng đổ của thùng xe trên mặt đất (Ground Shadow)
    const groundPts = [
      project3D(-0.3, -0.3, 0, centerX, centerY, scale),
      project3D(vehicle.lengthM + 0.3, -0.3, 0, centerX, centerY, scale),
      project3D(vehicle.lengthM + 0.3, vehicle.widthM + 0.3, 0, centerX, centerY, scale),
      project3D(-0.3, vehicle.widthM + 0.3, 0, centerX, centerY, scale),
    ];
    ctx.beginPath();
    ctx.moveTo(groundPts[0].x, groundPts[0].y + 4);
    groundPts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y + 4));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.filter = 'none';

    // 3. Vẽ ô lưới mặt sàn (Floor Grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    // Đường dọc
    for (let x = 0; x <= vehicle.lengthM + 0.05; x += 0.5) {
      const p1 = project3D(x, 0, 0, centerX, centerY, scale);
      const p2 = project3D(x, vehicle.widthM, 0, centerX, centerY, scale);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    // Đường ngang
    for (let y = 0; y <= vehicle.widthM + 0.05; y += 0.5) {
      const p1 = project3D(0, y, 0, centerX, centerY, scale);
      const p2 = project3D(vehicle.lengthM, y, 0, centerX, centerY, scale);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // 4. Vẽ Cabin xe tải phía trước (Front Truck Cabin) để người dùng dễ định hướng
    const cabinLength = 1.2;
    const cabinPts = [
      project3D(-cabinLength, 0, 0, centerX, centerY, scale),
      project3D(0, 0, 0, centerX, centerY, scale),
      project3D(0, vehicle.widthM, 0, centerX, centerY, scale),
      project3D(-cabinLength, vehicle.widthM, 0, centerX, centerY, scale),
      project3D(-cabinLength, 0, vehicle.heightM * 0.9, centerX, centerY, scale),
      project3D(0, 0, vehicle.heightM * 0.9, centerX, centerY, scale),
      project3D(0, vehicle.widthM, vehicle.heightM * 0.9, centerX, centerY, scale),
      project3D(-cabinLength, vehicle.widthM, vehicle.heightM * 0.9, centerX, centerY, scale),
    ];
    // Vẽ khối cabin mờ ảo
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cabinPts[0].x, cabinPts[0].y);
    ctx.lineTo(cabinPts[1].x, cabinPts[1].y);
    ctx.lineTo(cabinPts[5].x, cabinPts[5].y);
    ctx.lineTo(cabinPts[4].x, cabinPts[4].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. Vẽ nhãn định hướng "ĐẦU XE" & "CỬA DỠ HÀNG"
    const cabinLabelPt = project3D(-0.6, vehicle.widthM / 2, 0.3, centerX, centerY, scale);
    ctx.fillStyle = '#60A5FA';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚚 ĐẦU XE (CABIN)', cabinLabelPt.x, cabinLabelPt.y);

    const rearLabelPt = project3D(vehicle.lengthM + 0.5, vehicle.widthM / 2, 0.3, centerX, centerY, scale);
    ctx.fillStyle = '#34D399';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚪 CỬA DỠ HÀNG (LIFO)', rearLabelPt.x, rearLabelPt.y);

    // 6. Chuẩn bị danh sách các kiện hàng cần vẽ (theo bước stepIndex)
    const visibleBoxes = placedBoxes.filter((b) => b.stepIndex <= currentStep);

    // Sắp xếp các kiện theo chiều sâu (Depth Sorting) để vẽ từ xa lại gần
    const renderList = visibleBoxes.map((b) => {
      const centerPt = project3D(
        b.xM + b.dxM / 2,
        b.yM + b.dyM / 2,
        b.zM + b.dzM / 2,
        centerX,
        centerY,
        scale
      );
      return { box: b, depth: centerPt.depth };
    });
    renderList.sort((a, b) => b.depth - a.depth);

    // 7. Vẽ từng kiện hàng 3D với hiệu ứng khối lập phương nổi
    renderList.forEach(({ box }) => {
      const isSelected = selectedBoxId === box.id;
      const x0 = box.xM;
      const x1 = box.xM + box.dxM;
      const y0 = box.yM;
      const y1 = box.yM + box.dyM;
      const z0 = box.zM;
      const z1 = box.zM + box.dzM;

      // 8 đỉnh của hình hộp chữ nhật
      const p000 = project3D(x0, y0, z0, centerX, centerY, scale);
      const p100 = project3D(x1, y0, z0, centerX, centerY, scale);
      const p110 = project3D(x1, y1, z0, centerX, centerY, scale);
      const p010 = project3D(x0, y1, z0, centerX, centerY, scale);

      const p001 = project3D(x0, y0, z1, centerX, centerY, scale);
      const p101 = project3D(x1, y0, z1, centerX, centerY, scale);
      const p111 = project3D(x1, y1, z1, centerX, centerY, scale);
      const p011 = project3D(x0, y1, z1, centerX, centerY, scale);

      const baseColor = box.cargo.color || '#3B82F6';

      // Hàm vẽ mặt đa giác có viền và độ sáng
      const drawFace = (points: Array<{ x: number; y: number }>, brightness: number) => {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();

        ctx.fillStyle = baseColor;
        ctx.globalAlpha = isSelected ? 0.95 : 0.85;
        ctx.fill();

        // Shading ánh sáng
        ctx.fillStyle = `rgba(0, 0, 0, ${brightness})`;
        ctx.fill();

        // Viền cạnh hộp
        ctx.strokeStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.globalAlpha = 1.0;
        ctx.stroke();
      };

      // Mặt trên (Top Face: Z = z1) - Hướng sáng mạnh nhất
      drawFace([p001, p101, p111, p011], 0.0);

      // Mặt trước (Front Face: Y = y0 hoặc y1 tùy góc nhìn)
      drawFace([p000, p100, p101, p001], 0.25);

      // Mặt bên (Side Face: X = x1)
      drawFace([p100, p110, p111, p101], 0.4);

      // Vẽ nhãn mã đơn và thứ tự bốc xếp lên mặt trên của hộp
      const topCenter = {
        x: (p001.x + p101.x + p111.x + p011.x) / 4,
        y: (p001.y + p101.y + p111.y + p011.y) / 4,
      };

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`#${box.stepIndex}`, topCenter.x, topCenter.y - 4);

      if (box.cargo.isFragile) {
        ctx.fillStyle = '#FBBF24';
        ctx.font = '9px sans-serif';
        ctx.fillText('⚠️ Dễ vỡ', topCenter.x, topCenter.y + 7);
      }
    });

    // 8. Vẽ Khung Viền Thùng Xe Tải Trong Suốt (Bounding Box Wireframe)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    const boxLines = [
      // 4 cột đứng
      [project3D(0, 0, 0, centerX, centerY, scale), project3D(0, 0, vehicle.heightM, centerX, centerY, scale)],
      [project3D(vehicle.lengthM, 0, 0, centerX, centerY, scale), project3D(vehicle.lengthM, 0, vehicle.heightM, centerX, centerY, scale)],
      [project3D(vehicle.lengthM, vehicle.widthM, 0, centerX, centerY, scale), project3D(vehicle.lengthM, vehicle.widthM, vehicle.heightM, centerX, centerY, scale)],
      [project3D(0, vehicle.widthM, 0, centerX, centerY, scale), project3D(0, vehicle.widthM, vehicle.heightM, centerX, centerY, scale)],
      // Khung trần xe
      [project3D(0, 0, vehicle.heightM, centerX, centerY, scale), project3D(vehicle.lengthM, 0, vehicle.heightM, centerX, centerY, scale)],
      [project3D(vehicle.lengthM, 0, vehicle.heightM, centerX, centerY, scale), project3D(vehicle.lengthM, vehicle.widthM, vehicle.heightM, centerX, centerY, scale)],
      [project3D(vehicle.lengthM, vehicle.widthM, vehicle.heightM, centerX, centerY, scale), project3D(0, vehicle.widthM, vehicle.heightM, centerX, centerY, scale)],
      [project3D(0, vehicle.widthM, vehicle.heightM, centerX, centerY, scale), project3D(0, 0, vehicle.heightM, centerX, centerY, scale)],
    ];

    boxLines.forEach(([p1, p2]) => {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    });
    ctx.setLineDash([]); // Reset line dash

    // 9. Hiển thị kích thước thùng xe (Kích thước mét)
    const dimL = project3D(vehicle.lengthM / 2, -0.2, 0, centerX, centerY, scale);
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Dài: ${vehicle.lengthM}m`, dimL.x, dimL.y);

    const dimW = project3D(vehicle.lengthM + 0.3, vehicle.widthM / 2, 0, centerX, centerY, scale);
    ctx.fillText(`Rộng: ${vehicle.widthM}m`, dimW.x, dimW.y);

    const dimH = project3D(-0.2, 0, vehicle.heightM / 2, centerX, centerY, scale);
    ctx.fillText(`Cao: ${vehicle.heightM}m`, dimH.x, dimH.y);
  }, [project3D, vehicle, placedBoxes, currentStep, selectedBoxId, zoom]);

  // Xử lý sự kiện chuột kéo xoay 3D
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    setYaw((prev) => (prev + dx * 0.5) % 360);
    setPitch((prev) => Math.max(5, Math.min(88, prev + dy * 0.5)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.6, Math.min(2.5, prev + zoomDelta)));
  };

  return (
    <div className="relative flex flex-col h-full w-full rounded-2xl overflow-hidden border border-border/80 bg-slate-950 shadow-xl">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Preset Angles */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewPreset('ISOMETRIC')}
            className="h-7 px-2.5 text-[11px] text-slate-200 hover:text-white hover:bg-white/10 gap-1 cursor-pointer font-medium"
          >
            <Eye className="h-3 w-3 text-blue-400" /> 3D Phối Cảnh
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewPreset('TOP')}
            className="h-7 px-2 text-[11px] text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            Từ Trên (Top)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewPreset('SIDE')}
            className="h-7 px-2 text-[11px] text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            Mặt Bên (Side)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewPreset('REAR')}
            className="h-7 px-2 text-[11px] text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            Đuôi Xe (Door)
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-lg pointer-events-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <span className="text-[10px] text-slate-400 font-mono px-1">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewPreset('ISOMETRIC')}
            className="h-7 w-7 p-0 text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
            title="Reset góc quay"
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Main 3D Interactive Canvas */}
      <div className="flex-1 w-full h-full min-h-[480px] cursor-grab active:cursor-grabbing relative">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Help Tip Overlay */}
        <div className="absolute top-14 left-3 pointer-events-none text-[10px] text-slate-400 bg-slate-900/60 backdrop-blur-xs px-2 py-1 rounded-lg border border-white/5">
          🖱️ Kéo chuột để xoay 360° • Lăn chuột để Zoom
        </div>
      </div>

      {/* Bottom Step-by-Step Stacking Timeline Bar */}
      <div className="p-3 bg-slate-900/95 backdrop-blur-md border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-8 bg-blue-600 hover:bg-blue-700 text-white border-blue-500 font-bold text-xs gap-1.5 cursor-pointer shrink-0"
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? 'Tạm dừng' : 'Diễn hoạt bốc xếp'}
          </Button>

          <div className="text-xs">
            <span className="text-slate-400">Kiện hàng hiển thị:</span>{' '}
            <strong className="text-blue-400 font-mono text-sm">
              {currentStep} / {maxSteps}
            </strong>
          </div>
        </div>

        {/* Slider Trình tự bốc hàng */}
        <div className="flex items-center gap-3 w-full sm:max-w-md">
          <span className="text-[11px] text-slate-400 shrink-0">Bắt đầu</span>
          <input
            type="range"
            min={1}
            max={maxSteps}
            value={currentStep}
            onChange={(e) => {
              setCurrentStep(Number(e.target.value));
              setIsPlaying(false);
            }}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-[11px] text-slate-400 shrink-0">Hoàn tất</span>
        </div>
      </div>
    </div>
  );
};
