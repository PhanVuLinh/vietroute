import type {
  VehicleContainerPreset,
  CargoItemInput,
  PlacedCargoBox,
  AxleLoadAnalysis,
  LoadOptimizationResult,
} from '../types/load3d';

/**
 * Thuật toán Tối ưu hóa Xếp Hàng 3D (3D Bin Packing & Axle Load Optimization)
 * Tuân thủ nghiêm ngặt nguyên tắc LIFO (giao trước xếp ngoài) và cân bằng trọng tâm xe tải
 */
export function optimize3DLoad(
  vehicle: VehicleContainerPreset,
  items: CargoItemInput[]
): LoadOptimizationResult {
  // 1. Phân loại và sắp xếp thứ tự ưu tiên
  // - Điểm giao sau (stopIndex lớn) xếp vào sâu bên trong (đầu xe)
  // - Điểm giao trước (stopIndex nhỏ) xếp ngoài cùng gần cửa thùng xe
  // - Hàng nặng và cồng kềnh xếp xuống sàn trước
  const sortedItems = [...items].sort((a, b) => {
    // 1. Ưu tiên theo điểm giao (Stop Index giảm dần: Stop 3 xếp trước Stop 1)
    if (b.stopIndex !== a.stopIndex) {
      return b.stopIndex - a.stopIndex;
    }
    // 2. Trong cùng 1 điểm dừng: Hàng nặng và thể tích to xếp trước
    const volA = a.lengthCm * a.widthCm * a.heightCm;
    const volB = b.lengthCm * b.widthCm * b.heightCm;
    if (b.weightKg !== a.weightKg) {
      return b.weightKg - a.weightKg;
    }
    return volB - volA;
  });

  const placedBoxes: PlacedCargoBox[] = [];
  const unplacedBoxes: CargoItemInput[] = [];

  // Danh sách các điểm neo tiềm năng trong thùng xe [x, y, z] (tính bằng mét)
  const candidatePoints: Array<[number, number, number]> = [[0, 0, 0]];

  const containerL = vehicle.lengthM;
  const containerW = vehicle.widthM;
  const containerH = vehicle.heightM;

  let currentWeightKg = 0;
  let stepCounter = 1;

  for (const item of sortedItems) {
    const itemWeight = item.weightKg;

    // Kiểm tra quá tải trọng xe
    if (currentWeightKg + itemWeight > vehicle.maxWeightKg) {
      unplacedBoxes.push(item);
      continue;
    }

    const itemL = item.lengthCm / 100;
    const itemW = item.widthCm / 100;
    const itemH = item.heightCm / 100;

    let bestPlacement: {
      x: number;
      y: number;
      z: number;
      dx: number;
      dy: number;
      dz: number;
    } | null = null;

    // Thử 2 hướng đặt (nguyên bản hoặc xoay ngang 90 độ nếu cho phép)
    const orientations: Array<[number, number, number]> = [[itemL, itemW, itemH]];
    if (item.allowRotate !== false) {
      orientations.push([itemW, itemL, itemH]);
    }

    // Sắp xếp các điểm ứng viên: Ưu tiên điểm có Z thấp nhất (sát sàn), sau đó X nhỏ nhất (từ trong ra ngoài), rồi Y
    candidatePoints.sort((a, b) => {
      if (Math.abs(a[2] - b[2]) > 0.01) return a[2] - b[2]; // Z thấp trước
      if (Math.abs(a[0] - b[0]) > 0.01) return a[0] - b[0]; // X từ trong ra ngoài
      return a[1] - b[1]; // Y từ trái sang phải
    });

    for (const [px, py, pz] of candidatePoints) {
      for (const [dx, dy, dz] of orientations) {
        // Kiểm tra xem kiện hàng có nằm trọn trong thùng xe không
        if (px + dx > containerL + 0.001 || py + dy > containerW + 0.001 || pz + dz > containerH + 0.001) {
          continue;
        }

        // Kiểm tra va chạm với các kiện đã xếp
        const hasCollision = placedBoxes.some((placed) => {
          return (
            px < placed.xM + placed.dxM - 0.001 &&
            px + dx > placed.xM + 0.001 &&
            py < placed.yM + placed.dyM - 0.001 &&
            py + dy > placed.yM + 0.001 &&
            pz < placed.zM + placed.dzM - 0.001 &&
            pz + dz > placed.zM + 0.001
          );
        });

        if (hasCollision) continue;

        // Kiểm tra xem kiện có được nâng đỡ vững chắc bên dưới không (nếu không nằm trên sàn z=0)
        if (pz > 0.01) {
          let supportedArea = 0;
          const boxBottomArea = dx * dy;

          for (const placed of placedBoxes) {
            if (Math.abs(placed.zM + placed.dzM - pz) < 0.02) {
              const overlapX = Math.max(0, Math.min(px + dx, placed.xM + placed.dxM) - Math.max(px, placed.xM));
              const overlapY = Math.max(0, Math.min(py + dy, placed.yM + placed.dyM) - Math.max(py, placed.yM));
              supportedArea += overlapX * overlapY;

              // Không được đè lên hàng dễ vỡ
              if (placed.cargo.isFragile && overlapX * overlapY > 0.01) {
                supportedArea = -999;
                break;
              }
            }
          }

          // Yêu cầu ít nhất 60% diện tích đáy được nâng đỡ
          if (supportedArea < boxBottomArea * 0.6) {
            continue;
          }
        }

        // Tìm thấy vị trí hợp lệ tối ưu
        bestPlacement = { x: px, y: py, z: pz, dx, dy, dz };
        break;
      }

      if (bestPlacement) break;
    }

    if (bestPlacement) {
      placedBoxes.push({
        id: `placed-${item.id}`,
        cargo: item,
        xM: bestPlacement.x,
        yM: bestPlacement.y,
        zM: bestPlacement.z,
        dxM: bestPlacement.dx,
        dyM: bestPlacement.dy,
        dzM: bestPlacement.dz,
        stepIndex: stepCounter++,
      });

      currentWeightKg += itemWeight;

      // Sinh các điểm neo mới từ kiện vừa đặt
      candidatePoints.push(
        [bestPlacement.x + bestPlacement.dx, bestPlacement.y, bestPlacement.z],
        [bestPlacement.x, bestPlacement.y + bestPlacement.dy, bestPlacement.z],
        [bestPlacement.x, bestPlacement.y, bestPlacement.z + bestPlacement.dz]
      );
    } else {
      unplacedBoxes.push(item);
    }
  }

  // 2. Phân tích Thể tích, Tải trọng & Trọng tâm xe tải
  const totalVolumeM3 = vehicle.lengthM * vehicle.widthM * vehicle.heightM;
  let volumeUsedM3 = 0;
  let sumWeightX = 0;
  let sumWeightY = 0;

  placedBoxes.forEach((b) => {
    const boxVol = b.dxM * b.dyM * b.dzM;
    volumeUsedM3 += boxVol;
    const centerBoxX = b.xM + b.dxM / 2;
    const centerBoxY = b.yM + b.dyM / 2;
    sumWeightX += b.cargo.weightKg * centerBoxX;
    sumWeightY += b.cargo.weightKg * (centerBoxY - vehicle.widthM / 2); // So với đường trung tâm xe
  });

  const totalCargoWeightKg = currentWeightKg;
  const totalGrossWeightKg = vehicle.curbWeightKg + totalCargoWeightKg;

  const centerOfGravityX = totalCargoWeightKg > 0 ? sumWeightX / totalCargoWeightKg : vehicle.lengthM / 2;
  const centerOfGravityY = totalCargoWeightKg > 0 ? sumWeightY / totalCargoWeightKg : 0;

  // Tính lực tác động lên cầu trước và cầu sau
  // Giả định thùng xe cách trục trước 0.5m và chiều dài cơ sở wheelbase
  const distanceFrontAxleToFrontBody = 0.6; // m
  const distFromFrontAxle = centerOfGravityX + distanceFrontAxleToFrontBody;
  const wheelbase = vehicle.wheelbaseM;

  const cargoRearAxleLoadKg = (totalCargoWeightKg * distFromFrontAxle) / wheelbase;
  const cargoFrontAxleLoadKg = totalCargoWeightKg - cargoRearAxleLoadKg;

  // Cộng với tự trọng xe (khoảng 55% cầu trước, 45% cầu sau khi xe không tải)
  const curbFrontKg = vehicle.curbWeightKg * 0.55;
  const curbRearKg = vehicle.curbWeightKg * 0.45;

  const frontAxleLoadKg = Math.round(curbFrontKg + cargoFrontAxleLoadKg);
  const rearAxleLoadKg = Math.round(curbRearKg + cargoRearAxleLoadKg);

  const frontAxlePercent = Math.round((frontAxleLoadKg / totalGrossWeightKg) * 100);
  const rearAxlePercent = Math.round((rearAxleLoadKg / totalGrossWeightKg) * 100);

  const isFrontAxleOverloaded = frontAxleLoadKg > vehicle.maxFrontAxleKg;
  const isRearAxleOverloaded = rearAxleLoadKg > vehicle.maxRearAxleKg;
  const isWeightOverloaded = totalCargoWeightKg > vehicle.maxWeightKg;
  const isLateralUnbalanced = Math.abs(centerOfGravityY) > vehicle.widthM * 0.15; // Lệch quá 15% bề ngang xe

  // Điểm an toàn xe (0 - 100)
  let stabilityScore = 100;
  if (isFrontAxleOverloaded) stabilityScore -= 35;
  if (isRearAxleOverloaded) stabilityScore -= 35;
  if (isWeightOverloaded) stabilityScore -= 40;
  if (isLateralUnbalanced) stabilityScore -= 20;
  stabilityScore = Math.max(10, Math.min(100, stabilityScore));

  const volumeUtilizationPercent = Math.min(100, Math.round((volumeUsedM3 / totalVolumeM3) * 100));
  const weightUtilizationPercent = Math.min(100, Math.round((totalCargoWeightKg / vehicle.maxWeightKg) * 100));

  const analysis: AxleLoadAnalysis = {
    totalCargoWeightKg,
    totalGrossWeightKg,
    volumeUsedM3: Number(volumeUsedM3.toFixed(2)),
    totalVolumeM3: Number(totalVolumeM3.toFixed(2)),
    volumeUtilizationPercent,
    weightUtilizationPercent,
    centerOfGravityX: Number(centerOfGravityX.toFixed(2)),
    centerOfGravityY: Number(centerOfGravityY.toFixed(2)),
    frontAxleLoadKg,
    rearAxleLoadKg,
    frontAxlePercent,
    rearAxlePercent,
    isFrontAxleOverloaded,
    isRearAxleOverloaded,
    isWeightOverloaded,
    isLateralUnbalanced,
    stabilityScore,
  };

  return {
    vehicle,
    placedBoxes,
    unplacedBoxes,
    analysis,
    packingEfficiency: volumeUtilizationPercent,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Sinh danh sách kiện hàng mẫu phong phú và thực tế
 */
export function generateDemoCargoBatch(): CargoItemInput[] {
  const items: CargoItemInput[] = [];

  // Điểm 3 (Giao cuối cùng - Nhà máy Bình Dương): Hàng nặng, xếp sâu trong cùng
  for (let i = 1; i <= 6; i++) {
    items.push({
      id: `p3-${i}`,
      orderCode: `VR-BD-00${i}`,
      customerName: 'Vinamilk Bình Dương',
      destination: 'KCN VSIP 1, Thuận An, Bình Dương',
      stopIndex: 3,
      lengthCm: 80,
      widthCm: 60,
      heightCm: 65,
      weightKg: 120,
      color: '#1E40AF', // Blue đậm
      isFragile: false,
      allowRotate: true,
    });
  }

  // Điểm 2 (Giao thứ hai - Đại lý Quận 3): Thùng nước trái cây vừa phải
  for (let i = 1; i <= 10; i++) {
    items.push({
      id: `p2-${i}`,
      orderCode: `VR-Q3-0${i}`,
      customerName: 'Đại lý Minh Anh Q3',
      destination: 'Võ Văn Tần, Quận 3, TP. HCM',
      stopIndex: 2,
      lengthCm: 60,
      widthCm: 40,
      heightCm: 45,
      weightKg: 35,
      color: '#D97706', // Hổ phách
      isFragile: false,
      allowRotate: true,
    });
  }

  // Điểm 1 (Giao đầu tiên - Co.opmart Cống Quỳnh): Sữa hộp & Hàng dễ vỡ, xếp gần cửa đuôi
  for (let i = 1; i <= 8; i++) {
    items.push({
      id: `p1-${i}`,
      orderCode: `VR-Q1-0${i}`,
      customerName: 'Co.opmart Cống Quỳnh',
      destination: 'Cống Quỳnh, Quận 1, TP. HCM',
      stopIndex: 1,
      lengthCm: 50,
      widthCm: 40,
      heightCm: 35,
      weightKg: 25,
      color: '#059669', // Xanh lá
      isFragile: i > 6, // 2 kiện cuối dễ vỡ
      allowRotate: true,
    });
  }

  return items;
}
