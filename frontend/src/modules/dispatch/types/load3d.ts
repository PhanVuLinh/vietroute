export interface VehicleContainerPreset {
  id: string;
  name: string;
  category: 'TRUCK_LIGHT' | 'TRUCK_MEDIUM' | 'TRUCK_HEAVY' | 'CONTAINER';
  lengthM: number; // Chiều dài (m)
  widthM: number;  // Chiều rộng (m)
  heightM: number; // Chiều cao (m)
  maxWeightKg: number; // Tải trọng tối đa cho phép (kg)
  curbWeightKg: number; // Tự trọng của xe (kg)
  wheelbaseM: number; // Chiều dài cơ sở (m)
  maxFrontAxleKg: number; // Tải trọng trục trước tối đa
  maxRearAxleKg: number;  // Tải trọng trục sau tối đa
  description: string;
}

export interface CargoItemInput {
  id: string;
  orderCode: string;
  customerName: string;
  destination: string;
  stopIndex: number; // 1 = Giao đầu tiên, 2 = Giao thứ hai, 3 = Giao cuối
  lengthCm: number; // Chiều dài (cm)
  widthCm: number;  // Chiều rộng (cm)
  heightCm: number; // Chiều cao (cm)
  weightKg: number; // Khối lượng (kg)
  color: string;
  isFragile?: boolean; // Hàng dễ vỡ -> không xếp kiện khác đè lên
  allowRotate?: boolean; // Cho phép xoay kiện hàng ngang/dọc
}

export interface PlacedCargoBox {
  id: string;
  cargo: CargoItemInput;
  xM: number; // Tọa độ X (chiều dọc xe từ 0 đến lengthM, 0 = sát cabin, L = cửa đuôi)
  yM: number; // Tọa độ Y (chiều ngang xe từ 0 đến widthM)
  zM: number; // Tọa độ Z (chiều cao từ sàn 0 đến heightM)
  dxM: number; // Chiều dài đã định hướng (m)
  dyM: number; // Chiều rộng đã định hướng (m)
  dzM: number; // Chiều cao đã định hướng (m)
  stepIndex: number; // Thứ tự bốc vào thùng xe (1, 2, 3...)
}

export interface AxleLoadAnalysis {
  totalCargoWeightKg: number;
  totalGrossWeightKg: number;
  volumeUsedM3: number;
  totalVolumeM3: number;
  volumeUtilizationPercent: number; // %
  weightUtilizationPercent: number; // %
  centerOfGravityX: number; // m tính từ đầu thùng xe
  centerOfGravityY: number; // m tính từ tâm xe (0 = cân đối, >0 lệch phải, <0 lệch trái)
  frontAxleLoadKg: number;
  rearAxleLoadKg: number;
  frontAxlePercent: number;
  rearAxlePercent: number;
  isFrontAxleOverloaded: boolean;
  isRearAxleOverloaded: boolean;
  isWeightOverloaded: boolean;
  isLateralUnbalanced: boolean; // Lệch tâm trái/phải quá mức
  stabilityScore: number; // 0 - 100 điểm an toàn
}

export interface LoadOptimizationResult {
  vehicle: VehicleContainerPreset;
  placedBoxes: PlacedCargoBox[];
  unplacedBoxes: CargoItemInput[];
  analysis: AxleLoadAnalysis;
  packingEfficiency: number; // %
  generatedAt: string;
}

export const TRUCK_PRESETS: VehicleContainerPreset[] = [
  {
    id: 'kia-k250',
    name: 'Xe tải Kia K250 (1.49 Tấn)',
    category: 'TRUCK_LIGHT',
    lengthM: 3.5,
    widthM: 1.67,
    heightM: 1.7,
    maxWeightKg: 1490,
    curbWeightKg: 2250,
    wheelbaseM: 2.81,
    maxFrontAxleKg: 1600,
    maxRearAxleKg: 2400,
    description: 'Tối ưu luân chuyển hàng nội đô và ngõ phố hẹp',
  },
  {
    id: 'hyundai-mighty',
    name: 'Xe tải Hyundai Mighty 75S (3.5 Tấn)',
    category: 'TRUCK_LIGHT',
    lengthM: 4.5,
    widthM: 2.05,
    heightM: 1.88,
    maxWeightKg: 3490,
    curbWeightKg: 3150,
    wheelbaseM: 3.41,
    maxFrontAxleKg: 2600,
    maxRearAxleKg: 4500,
    description: 'Chuyên tuyến giao hàng các quận trung tâm và đại lý',
  },
  {
    id: 'hino-500',
    name: 'Xe tải Hino 500 Series (5.0 Tấn)',
    category: 'TRUCK_MEDIUM',
    lengthM: 5.7,
    widthM: 2.2,
    heightM: 2.15,
    maxWeightKg: 5000,
    curbWeightKg: 4200,
    wheelbaseM: 4.25,
    maxFrontAxleKg: 3600,
    maxRearAxleKg: 6800,
    description: 'Phân phối liên huyện, siêu thị và chuỗi bán lẻ',
  },
  {
    id: 'isuzu-fvr',
    name: 'Xe tải Isuzu FVR 900 (8.0 Tấn)',
    category: 'TRUCK_HEAVY',
    lengthM: 7.2,
    widthM: 2.35,
    heightM: 2.3,
    maxWeightKg: 8000,
    curbWeightKg: 5500,
    wheelbaseM: 5.55,
    maxFrontAxleKg: 5000,
    maxRearAxleKg: 9500,
    description: 'Vận chuyển liên tỉnh trục Bắc - Trung - Nam',
  },
  {
    id: 'container-20ft',
    name: 'Container 20ft DC Tiêu chuẩn',
    category: 'CONTAINER',
    lengthM: 5.9,
    widthM: 2.35,
    heightM: 2.39,
    maxWeightKg: 21800,
    curbWeightKg: 2200,
    wheelbaseM: 5.0,
    maxFrontAxleKg: 12000,
    maxRearAxleKg: 14000,
    description: 'Container đóng hàng xuất nhập khẩu và hàng nặng',
  },
  {
    id: 'container-40ft-hc',
    name: 'Container 40ft High Cube (HC)',
    category: 'CONTAINER',
    lengthM: 12.03,
    widthM: 2.35,
    heightM: 2.69,
    maxWeightKg: 26500,
    curbWeightKg: 3900,
    wheelbaseM: 8.5,
    maxFrontAxleKg: 14000,
    maxRearAxleKg: 18000,
    description: 'Container thể tích lớn 76.4 m3 chuyên chở hàng nhẹ và cồng kềnh',
  },
];
