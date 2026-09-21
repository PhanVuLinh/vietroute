import {
  PrismaClient,
  Role,
  UserStatus,
  CustomerType,
  CustomerTier,
  OrderPriority,
  OrderStatus,
  WarehouseType,
  WarehouseRegion,
  WarehouseStorageType,
  WarehouseStatus,
  WarehouseZoneType,
  DockDoorType,
  DockStatus,
  VehicleType,
  VehicleStatus,
  DriverStatus,
  LicenseType,
  DeliveryStatus,
  AssignmentType,
  RouteStatus,
  RouteStopStatus,
  NotificationType,
  NotificationPriority,
  InboundStatus,
  OutboundStatus,
  TransferStatus,
  WmsActivityType,
  IncidentSeverity,
  IncidentStatus,
  IncidentType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Bắt đầu nạp dữ liệu khởi tạo (Seed) cho VietRoute...');

  // 0. Xóa dữ liệu cũ nếu có theo thứ tự ràng buộc khóa ngoại
  await prisma.incidentComment.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.warehouseActivity.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.outboundDispatch.deleteMany();
  await prisma.inboundReceipt.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.customerPricingRule.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.driverAssignment.deleteMany();
  await prisma.deliveryStatusHistory.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.dockDoor.deleteMany();
  await prisma.warehouseZone.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // 1. ROLES
  console.log('📦 1/8. Tạo danh sách vai trò (Roles)...');
  const roleNames = ['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'WAREHOUSE_STAFF'];
  const roleMap = new Map<string, Role>();

  for (const name of roleNames) {
    const role = await prisma.role.create({
      data: {
        name,
        description: `Vai trò ${name} trong hệ thống VietRoute`,
      },
    });
    roleMap.set(name, role);
  }

  // 2. USERS
  console.log('👤 2/8. Tạo tài khoản người dùng (Users)...');
  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminRole = roleMap.get('ADMIN')!;
  const dispatcherRole = roleMap.get('DISPATCHER')!;
  const driverRole = roleMap.get('DRIVER')!;
  const managerRole = roleMap.get('MANAGER')!;

  const userAdmin = await prisma.user.create({
    data: {
      id: 'usr-admin-01',
      email: 'admin@vietroute.com',
      password_hash: hashedPassword,
      full_name: 'Phan Vũ Linh (Admin)',
      phone: '0901234567',
      role_id: adminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.create({
    data: {
      id: 'usr-admin-02',
      email: 'admin@vietroute.vn',
      password_hash: hashedPassword,
      full_name: 'Quản trị viên VietRoute',
      phone: '0901234568',
      role_id: adminRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  const userDispatcher = await prisma.user.create({
    data: {
      id: 'usr-dispatch-01',
      email: 'dieuphoi@vietroute.vn',
      password_hash: hashedPassword,
      full_name: 'Nguyễn Văn Hùng (Điều phối viên)',
      phone: '0987654321',
      role_id: dispatcherRole.id,
      status: UserStatus.ACTIVE,
    },
  });

  const driverUsersData = [
    { id: 'usr-drv-01', email: 'taixe.an@vietroute.vn', name: 'Nguyễn Văn An', phone: '0971001001' },
    { id: 'usr-drv-02', email: 'taixe.hoang@vietroute.vn', name: 'Trần Minh Hoàng', phone: '0971001002' },
    { id: 'usr-drv-03', email: 'taixe.binh@vietroute.vn', name: 'Lê Văn Bình', phone: '0971001003' },
    { id: 'usr-drv-04', email: 'taixe.dung@vietroute.vn', name: 'Phạm Quốc Dũng', phone: '0971001004' },
    { id: 'usr-drv-05', email: 'taixe.thang@vietroute.vn', name: 'Hoàng Đức Thắng', phone: '0971001005' },
  ];

  for (const du of driverUsersData) {
    await prisma.user.create({
      data: {
        id: du.id,
        email: du.email,
        password_hash: hashedPassword,
        full_name: du.name,
        phone: du.phone,
        role_id: driverRole.id,
        status: UserStatus.ACTIVE,
      },
    });
  }

  // 3. TÀI XẾ (DRIVERS)
  console.log('🚚 3/8. Tạo hồ sơ tài xế (Drivers)...');
  const driversData = [
    {
      id: 'drv-01',
      userId: 'usr-drv-01',
      driverCode: 'TX-HAN-01',
      fullName: 'Nguyễn Văn An',
      phone: '0971001001',
      licenseNumber: '010192837465',
      licenseType: LicenseType.C,
      licenseExpiredAt: new Date('2029-05-20'),
      status: DriverStatus.BUSY,
      lat: 21.0285,
      lng: 105.8544,
      onTimeRate: 98.2,
      successRate: 99.4,
    },
    {
      id: 'drv-02',
      userId: 'usr-drv-02',
      driverCode: 'TX-HAN-02',
      fullName: 'Trần Minh Hoàng',
      phone: '0971001002',
      licenseNumber: '010283746519',
      licenseType: LicenseType.B2,
      licenseExpiredAt: new Date('2028-11-12'),
      status: DriverStatus.AVAILABLE,
      lat: 21.0368,
      lng: 105.9082,
      onTimeRate: 97.5,
      successRate: 98.8,
    },
    {
      id: 'drv-03',
      userId: 'usr-drv-03',
      driverCode: 'TX-HAN-03',
      fullName: 'Lê Văn Bình',
      phone: '0971001003',
      licenseNumber: '010374651928',
      licenseType: LicenseType.C,
      licenseExpiredAt: new Date('2030-03-15'),
      status: DriverStatus.BUSY,
      lat: 21.0333,
      lng: 105.7981,
      onTimeRate: 99.1,
      successRate: 100.0,
    },
    {
      id: 'drv-04',
      userId: 'usr-drv-04',
      driverCode: 'TX-HAN-04',
      fullName: 'Phạm Quốc Dũng',
      phone: '0971001004',
      licenseNumber: '010474651929',
      licenseType: LicenseType.FC,
      licenseExpiredAt: new Date('2027-08-10'),
      status: DriverStatus.ON_BREAK,
      lat: 21.0125,
      lng: 105.8342,
      onTimeRate: 95.8,
      successRate: 97.2,
    },
    {
      id: 'drv-05',
      userId: 'usr-drv-05',
      driverCode: 'TX-HCM-01',
      fullName: 'Hoàng Đức Thắng',
      phone: '0971001005',
      licenseNumber: '079182736451',
      licenseType: LicenseType.C,
      licenseExpiredAt: new Date('2029-01-30'),
      status: DriverStatus.AVAILABLE,
      lat: 10.7769,
      lng: 106.7009,
      onTimeRate: 98.9,
      successRate: 99.2,
    },
  ];

  for (const d of driversData) {
    await prisma.driver.create({
      data: {
        id: d.id,
        user_id: d.userId,
        driver_code: d.driverCode,
        full_name: d.fullName,
        phone: d.phone,
        license_number: d.licenseNumber,
        license_type: d.licenseType,
        license_expired_at: d.licenseExpiredAt,
        status: d.status,
        current_location_lat: d.lat,
        current_location_lng: d.lng,
        on_time_rate: d.onTimeRate,
        success_rate: d.successRate,
      },
    });
  }

  // 4. PHƯƠNG TIỆN (VEHICLES)
  console.log('🚛 4/8. Tạo phương tiện đội xe (Vehicles)...');
  const vehiclesData = [
    {
      id: 'veh-01',
      vehicleCode: 'XE-TRK-01',
      licensePlate: '29C-741.82',
      type: VehicleType.TRUCK,
      brand: 'Hino',
      model: 'FC9J 5 Tấn',
      capacityWeight: 5000,
      capacityVolume: 24.5,
      currentMileage: 48250,
      fuelPercent: 82,
      status: VehicleStatus.EN_ROUTE,
      driverId: 'drv-01',
      nextMaintenanceDate: new Date('2026-11-15'),
      inspectionCertificateNumber: 'KD-7482910',
      lastInspectionDate: new Date('2026-03-10'),
      inspectionExpiryDate: new Date('2027-03-10'),
      insuranceExpiryDate: new Date('2027-04-15'),
      inspectionCenter: 'TTĐK 29-03V (Hà Nội)',
      inspectionNotes: 'Đạt chuẩn khí thải Euro 4, phanh ABS hoạt động tốt',
    },
    {
      id: 'veh-02',
      vehicleCode: 'XE-VAN-02',
      licensePlate: '29H-123.45',
      type: VehicleType.VAN,
      brand: 'Ford',
      model: 'Transit Van 1.25T',
      capacityWeight: 1250,
      capacityVolume: 10.2,
      currentMileage: 23100,
      fuelPercent: 65,
      status: VehicleStatus.AVAILABLE,
      driverId: 'drv-02',
      nextMaintenanceDate: new Date('2026-12-01'),
      inspectionCertificateNumber: 'KD-1928374',
      lastInspectionDate: new Date('2025-09-22'),
      inspectionExpiryDate: new Date('2026-09-22'),
      insuranceExpiryDate: new Date('2026-10-01'),
      inspectionCenter: 'TTĐK 29-01S (Hà Nội)',
      inspectionNotes: 'Cần đưa xe đi kiểm định định kỳ trước hạn',
    },
    {
      id: 'veh-03',
      vehicleCode: 'XE-TRK-03',
      licensePlate: '29C-884.21',
      type: VehicleType.TRUCK,
      brand: 'Isuzu',
      model: 'QKR77HE4 2.5 Tấn',
      capacityWeight: 2500,
      capacityVolume: 15.0,
      currentMileage: 61400,
      fuelPercent: 45,
      status: VehicleStatus.EN_ROUTE,
      driverId: 'drv-03',
      nextMaintenanceDate: new Date('2026-10-10'),
      inspectionCertificateNumber: 'KD-8834921',
      lastInspectionDate: new Date('2026-01-15'),
      inspectionExpiryDate: new Date('2027-01-15'),
      insuranceExpiryDate: new Date('2027-02-20'),
      inspectionCenter: 'TTĐK 29-06V (Hà Nội)',
      inspectionNotes: 'Kiểm định đạt tiêu chuẩn',
    },
    {
      id: 'veh-04',
      vehicleCode: 'XE-TRK-04',
      licensePlate: '29C-339.12',
      type: VehicleType.TRUCK,
      brand: 'Hyundai',
      model: 'Mighty 110S 7 Tấn',
      capacityWeight: 7000,
      capacityVolume: 32.0,
      currentMileage: 85200,
      fuelPercent: 78,
      status: VehicleStatus.AVAILABLE,
      driverId: 'drv-04',
      nextMaintenanceDate: new Date('2026-10-25'),
      inspectionCertificateNumber: 'KD-3391823',
      lastInspectionDate: new Date('2025-10-28'),
      inspectionExpiryDate: new Date('2026-10-28'),
      insuranceExpiryDate: new Date('2026-11-15'),
      inspectionCenter: 'TTĐK 29-02V (Hà Nội)',
    },
    {
      id: 'veh-05',
      vehicleCode: 'XE-TRK-05',
      licensePlate: '51D-928.34',
      type: VehicleType.TRUCK,
      brand: 'Hino',
      model: 'XZU730L 5 Tấn',
      capacityWeight: 5000,
      capacityVolume: 26.0,
      currentMileage: 39500,
      fuelPercent: 90,
      status: VehicleStatus.AVAILABLE,
      driverId: 'drv-05',
      nextMaintenanceDate: new Date('2027-01-10'),
      inspectionCertificateNumber: 'KD-5192834',
      lastInspectionDate: new Date('2026-05-12'),
      inspectionExpiryDate: new Date('2027-05-12'),
      insuranceExpiryDate: new Date('2027-06-01'),
      inspectionCenter: 'TTĐK 50-03S (TP.HCM)',
    },
  ];

  for (const v of vehiclesData) {
    await prisma.vehicle.create({
      data: {
        id: v.id,
        vehicle_code: v.vehicleCode,
        license_plate: v.licensePlate,
        type: v.type,
        brand: v.brand,
        model: v.model,
        capacity_weight: v.capacityWeight,
        capacity_volume: v.capacityVolume,
        current_mileage: v.currentMileage,
        fuel_percent: v.fuelPercent,
        status: v.status,
        driver_id: v.driverId,
        next_maintenance_date: v.nextMaintenanceDate,
        inspection_certificate_number: v.inspectionCertificateNumber,
        last_inspection_date: v.lastInspectionDate,
        inspection_expiry_date: v.inspectionExpiryDate,
        insurance_expiry_date: v.insuranceExpiryDate,
        inspection_center: v.inspectionCenter,
        inspection_notes: v.inspectionNotes,
      },
    });
  }

  // 5. KHO BÃI (WAREHOUSES)
  console.log('🏭 5/8. Tạo mạng lưới kho bãi (Warehouses, Zones & Docks)...');
  const warehousesData = [
    {
      id: 'wh-hn-lb',
      code: 'HUB-HAN-01',
      name: 'Tổng kho Miền Bắc (Long Biên)',
      type: WarehouseType.CENTRAL_HUB,
      region: WarehouseRegion.NORTH,
      address: 'KCN Đài Tư, 386 Nguyễn Văn Linh, Phúc Lợi, Long Biên, Hà Nội',
      city: 'Hà Nội',
      latitude: 21.0368,
      longitude: 105.9082,
      openingTime: '05:00',
      closingTime: '23:30',
      capacity: 1200,
      usedCapacity: 860,
      areaSqM: 8500,
      totalPallets: 3200,
      usedPallets: 2350,
      storageType: WarehouseStorageType.MIXED,
      managerName: 'Trần Hữu Nam',
      managerPhone: '0912.834.192',
      managerEmail: 'nam.th@vietroute.vn',
      status: WarehouseStatus.ACTIVE,
      zones: [
        { code: 'ZONE-CD-01', name: 'Khu Cross-Docking nhanh', type: WarehouseZoneType.CROSS_DOCK, capacityPallets: 800, usedPallets: 680 },
        { code: 'ZONE-RACK-A', name: 'Khu Kệ Pallet Cao Tầng A-B', type: WarehouseZoneType.PALLET_RACK, capacityPallets: 1800, usedPallets: 1350 },
        { code: 'ZONE-COLD-01', name: 'Khu Kho Lạnh Âm Sâu Thực Phẩm', type: WarehouseZoneType.COLD_STORAGE, capacityPallets: 600, usedPallets: 320, temp: -18.5, hum: 82 },
      ],
      docks: [
        { doorNumber: 'Dock #01', name: 'Cổng Xuất Nhanh 01', type: DockDoorType.OUTBOUND, status: DockStatus.LOADING, plate: '29C-741.82', driver: 'Nguyễn Văn An', progress: 75 },
        { doorNumber: 'Dock #02', name: 'Cổng Nhập 02', type: DockDoorType.INBOUND, status: DockStatus.AVAILABLE },
        { doorNumber: 'Dock #03', name: 'Cổng Đa Năng 03', type: DockDoorType.BIDIRECTIONAL, status: DockStatus.AVAILABLE },
      ],
    },
    {
      id: 'wh-hn-gl',
      code: 'HUB-HAN-02',
      name: 'Kho Vệ Tinh Cầu Giấy (Hà Nội)',
      type: WarehouseType.LAST_MILE_HUB,
      region: WarehouseRegion.NORTH,
      address: 'Số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội',
      city: 'Hà Nội',
      latitude: 21.0285,
      longitude: 105.7925,
      capacity: 350,
      usedCapacity: 210,
      areaSqM: 2200,
      storageType: WarehouseStorageType.DRY,
      managerName: 'Lê Thu Trang',
      managerPhone: '0983.112.990',
      status: WarehouseStatus.ACTIVE,
      zones: [
        { code: 'ZONE-STG-01', name: 'Khu Tập Kết Giao Chặng Cuối', type: WarehouseZoneType.STAGING, capacityPallets: 400, usedPallets: 220 },
      ],
      docks: [
        { doorNumber: 'Dock #01', name: 'Cổng Xuất Xe Tải Nhỏ', type: DockDoorType.OUTBOUND, status: DockStatus.AVAILABLE },
      ],
    },
    {
      id: 'wh-hcm-cl',
      code: 'HUB-SGN-01',
      name: 'Tổng kho Miền Nam (Cát Lái - TP.HCM)',
      type: WarehouseType.CENTRAL_HUB,
      region: WarehouseRegion.SOUTH,
      address: 'Đường Nguyễn Thị Định, KCN Cát Lái 2, TP. Thủ Đức, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      latitude: 10.7612,
      longitude: 106.7934,
      capacity: 2500,
      usedCapacity: 1980,
      areaSqM: 16000,
      storageType: WarehouseStorageType.MIXED,
      managerName: 'Nguyễn Văn Thịnh',
      managerPhone: '0903.882.119',
      status: WarehouseStatus.ACTIVE,
      zones: [
        { code: 'ZONE-CD-SG1', name: 'Khu Cross-Dock Container', type: WarehouseZoneType.CROSS_DOCK, capacityPallets: 1500, usedPallets: 1200 },
      ],
      docks: [
        { doorNumber: 'Dock #01', name: 'Cổng Cont Inbound', type: DockDoorType.INBOUND, status: DockStatus.UNLOADING, plate: '51D-928.34', progress: 40 },
        { doorNumber: 'Dock #02', name: 'Cổng Cont Outbound', type: DockDoorType.OUTBOUND, status: DockStatus.AVAILABLE },
      ],
    },
    {
      id: 'wh-dad-hc',
      code: 'HUB-DAD-01',
      name: 'Trung tâm Vận tải Miền Trung (Hòa Cầm - Đà Nẵng)',
      type: WarehouseType.TRANSIT_HUB,
      region: WarehouseRegion.CENTRAL,
      address: 'KCN Hòa Cầm, Hòa Thọ Tây, Cẩm Lệ, Đà Nẵng',
      city: 'Đà Nẵng',
      latitude: 16.0125,
      longitude: 108.1874,
      capacity: 800,
      usedCapacity: 450,
      areaSqM: 6000,
      storageType: WarehouseStorageType.DRY,
      managerName: 'Võ Minh Toàn',
      managerPhone: '0913.445.667',
      status: WarehouseStatus.ACTIVE,
      zones: [
        { code: 'ZONE-DAD-A', name: 'Khu Trung Chuyển Bắc Nam', type: WarehouseZoneType.CROSS_DOCK, capacityPallets: 700, usedPallets: 400 },
      ],
      docks: [
        { doorNumber: 'Dock #01', name: 'Cổng Xuất Nhập Chung', type: DockDoorType.BIDIRECTIONAL, status: DockStatus.AVAILABLE },
      ],
    },
  ];

  for (const wh of warehousesData) {
    const createdWh = await prisma.warehouse.create({
      data: {
        id: wh.id,
        code: wh.code,
        name: wh.name,
        type: wh.type,
        region: wh.region,
        address: wh.address,
        city: wh.city,
        latitude: wh.latitude,
        longitude: wh.longitude,
        opening_time: wh.openingTime || '06:00',
        closing_time: wh.closingTime || '22:00',
        capacity: wh.capacity,
        used_capacity: wh.usedCapacity,
        area_sqm: wh.areaSqM,
        storage_type: wh.storageType,
        manager_name: wh.managerName,
        manager_phone: wh.managerPhone,
        status: wh.status,
      },
    });

    // Tạo zones
    if (wh.zones) {
      for (const z of wh.zones) {
        await prisma.warehouseZone.create({
          data: {
            warehouse_id: createdWh.id,
            code: z.code,
            name: z.name,
            type: z.type,
            capacity_pallets: z.capacityPallets,
            used_pallets: z.usedPallets,
            temperature_celsius: z.temp,
            humidity_percent: z.hum,
          },
        });
      }
    }

    // Tạo docks
    if (wh.docks) {
      for (const d of wh.docks) {
        await prisma.dockDoor.create({
          data: {
            warehouse_id: createdWh.id,
            door_number: d.doorNumber,
            name: d.name,
            type: d.type,
            status: d.status,
            current_vehicle_plate: d.plate,
            current_driver_name: d.driver,
            progress_percent: d.progress || 0,
          },
        });
      }
    }
  }

  // 6. KHÁCH HÀNG (CUSTOMERS)
  console.log('🏢 6/10. Tạo danh sách khách hàng doanh nghiệp & cá nhân...');
  const customersData = [
    {
      id: 'cus-hn-01',
      name: 'Công ty TNHH Tiếp vận Thăng Long',
      phone: '02438251234',
      email: 'contact@thanglonglogistics.vn',
      address: 'Số 18 Tam Trinh, Mai Động, Hoàng Mai, Hà Nội',
      latitude: 20.9984,
      longitude: 105.8642,
      type: CustomerType.ENTERPRISE,
      tier: CustomerTier.VIP,
      tax_code: '0102938475',
      contact_person: 'Nguyễn Tiến Dũng',
      website: 'https://thanglonglogistics.vn',
      notes: 'Khách hàng VIP khối vận tải logistics, yêu cầu giao hàng đúng hẹn 100%.',
      addresses: [
        { label: 'Kho chính Mai Động', address: 'Số 18 Tam Trinh, Hoàng Mai, Hà Nội', city: 'Hà Nội', latitude: 20.9984, longitude: 105.8642, is_default: true, contact_name: 'Nguyễn Tiến Dũng', contact_phone: '0988.123.456' },
        { label: 'Chi nhánh Hà Đông', address: 'Khu Đô Thị Văn Quán, Hà Đông, Hà Nội', city: 'Hà Nội', latitude: 20.9780, longitude: 105.7890, is_default: false, contact_name: 'Trần Văn Đức', contact_phone: '0977.223.344' },
      ],
      pricing_rules: [
        { route_type: 'URBAN', price_per_km: 18000, price_per_kg: 2500, discount_percent: 15 },
        { route_type: 'INTER_PROVINCIAL', price_per_km: 14000, price_per_kg: 2100, discount_percent: 20 },
      ],
    },
    {
      id: 'cus-hn-02',
      name: 'Công ty CP Dược phẩm Hà Nội (Hapharco)',
      phone: '02438526789',
      email: 'cungung@hapharco.com.vn',
      address: 'Số 170 La Thành, Ô Chợ Dừa, Đống Đa, Hà Nội',
      latitude: 21.0185,
      longitude: 105.8247,
      type: CustomerType.ENTERPRISE,
      tier: CustomerTier.GOLD,
      tax_code: '0100108923',
      contact_person: 'Dược sĩ Hoàng Kim Chi',
      website: 'https://hapharco.com.vn',
      notes: 'Hàng dược phẩm y tế, yêu cầu xe kiểm soát nhiệt độ nghiêm ngặt.',
      addresses: [
        { label: 'Kho Dược phẩm La Thành', address: 'Số 170 La Thành, Đống Đa, Hà Nội', city: 'Hà Nội', latitude: 21.0185, longitude: 105.8247, is_default: true, contact_name: 'Hoàng Kim Chi', contact_phone: '0912.876.543' },
      ],
      pricing_rules: [
        { route_type: 'URBAN', price_per_km: 22000, price_per_kg: 3200, discount_percent: 10 },
      ],
    },
    {
      id: 'cus-hn-03',
      name: 'Công ty Thiết bị Máy tính An Phát',
      phone: '02439871122',
      email: 'sales@anphatpc.com.vn',
      address: 'Số 49 Thái Hà, Trung Liệt, Đống Đa, Hà Nội',
      latitude: 21.0128,
      longitude: 105.8194,
      type: CustomerType.ENTERPRISE,
      tier: CustomerTier.SILVER,
      tax_code: '0101567890',
      contact_person: 'Lê Tuấn Hùng',
      website: 'https://anphatpc.com.vn',
      notes: 'Thiết bị công nghệ cao, dễ vỡ.',
      addresses: [
        { label: 'Showroom Thái Hà', address: 'Số 49 Thái Hà, Đống Đa, Hà Nội', city: 'Hà Nội', latitude: 21.0128, longitude: 105.8194, is_default: true, contact_name: 'Lê Tuấn Hùng', contact_phone: '02439871122' },
      ],
      pricing_rules: [],
    },
    {
      id: 'cus-hn-04',
      name: 'Trần Thị Bích Ngọc',
      phone: '0912445566',
      email: 'bichngoc.tran@gmail.com',
      address: 'Số 88 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội',
      latitude: 21.0345,
      longitude: 105.7981,
      type: CustomerType.INDIVIDUAL,
      tier: CustomerTier.REGULAR,
      notes: 'Khách hàng cá nhân giao lẻ.',
      addresses: [
        { label: 'Nhà riêng', address: 'Số 88 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội', city: 'Hà Nội', latitude: 21.0345, longitude: 105.7981, is_default: true, contact_name: 'Trần Thị Bích Ngọc', contact_phone: '0912445566' },
      ],
      pricing_rules: [],
    },
    {
      id: 'cus-sg-01',
      name: 'Tập đoàn Bán lẻ WinCommerce Miền Nam',
      phone: '02839105566',
      email: 'logistics.south@wincommerce.vn',
      address: 'Tòa nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      latitude: 10.7715,
      longitude: 106.7042,
      type: CustomerType.ENTERPRISE,
      tier: CustomerTier.VIP,
      tax_code: '0311234567',
      contact_person: 'Vũ Đức Nam',
      website: 'https://wincommerce.vn',
      notes: 'Hệ thống siêu thị chuỗi, sản lượng giao đều đặn theo ngày.',
      addresses: [
        { label: 'Văn phòng đại diện', address: 'Tòa nhà Bitexco, Số 2 Hải Triều, Bến Nghé, Quận 1, TP. HCM', city: 'TP. Hồ Chí Minh', latitude: 10.7715, longitude: 106.7042, is_default: true, contact_name: 'Vũ Đức Nam', contact_phone: '02839105566' },
        { label: 'Kho tổng Cát Lái', address: 'KCN Cát Lái 2, TP Thủ Đức, TP. HCM', city: 'TP. Hồ Chí Minh', latitude: 10.7612, longitude: 106.7934, is_default: false, contact_name: 'Trần Hữu Lộc', contact_phone: '0903.112.334' },
      ],
      pricing_rules: [
        { route_type: 'URBAN', price_per_km: 17000, price_per_kg: 2400, discount_percent: 20 },
        { route_type: 'LONG_HAUL', price_per_km: 12000, price_per_kg: 1800, discount_percent: 25 },
      ],
    },
    {
      id: 'cus-dad-01',
      name: 'Công ty Điện máy Hải Châu Đà Nẵng',
      phone: '02363821999',
      email: 'dienmayhaichau@danang.vn',
      address: 'Số 120 Hùng Vương, Hải Châu 1, Hải Châu, Đà Nẵng',
      latitude: 16.0682,
      longitude: 108.2198,
      type: CustomerType.ENTERPRISE,
      tier: CustomerTier.GOLD,
      tax_code: '0400987654',
      contact_person: 'Trương Minh Thuận',
      website: 'https://dienmayhaichau.vn',
      notes: 'Phân phối đồ điện gia dụng và âm thanh.',
      addresses: [
        { label: 'Tổng kho Hòa Cầm', address: 'KCN Hòa Cầm, Cẩm Lệ, Đà Nẵng', city: 'Đà Nẵng', latitude: 16.0125, longitude: 108.1874, is_default: true, contact_name: 'Trương Minh Thuận', contact_phone: '02363821999' },
      ],
      pricing_rules: [
        { route_type: 'URBAN', price_per_km: 19000, price_per_kg: 2700, discount_percent: 12 },
      ],
    },
  ];

  for (const c of customersData) {
    const { addresses, pricing_rules, ...customerFields } = c;
    await prisma.customer.create({
      data: customerFields,
    });

    if (addresses && addresses.length > 0) {
      for (const addr of addresses) {
        await prisma.customerAddress.create({
          data: {
            customer_id: c.id,
            ...addr,
          },
        });
      }
    }

    if (pricing_rules && pricing_rules.length > 0) {
      for (const pr of pricing_rules) {
        await prisma.customerPricingRule.create({
          data: {
            customer_id: c.id,
            ...pr,
          },
        });
      }
    }
  }

  // 7. ĐƠN HÀNG, MẶT HÀNG & CHUYẾN GIAO (ORDERS, ITEMS, DELIVERIES)
  console.log('📋 7/8. Tạo các đơn hàng vận chuyển & chuyến giao mẫu...');
  const ordersSeed = [
    {
      id: 'ord-01',
      orderCode: 'VR-2026-001',
      customerId: 'cus-hn-01',
      warehouseId: 'wh-hn-lb',
      receiverName: 'Nguyễn Tiến Dũng',
      receiverPhone: '0988.123.456',
      receiverAddress: 'Số 18 Tam Trinh, Hoàng Mai, Hà Nội',
      receiverLatitude: 20.9984,
      receiverLongitude: 105.8642,
      totalWeight: 350.5,
      totalVolume: 1.85,
      codAmount: 14500000,
      priority: OrderPriority.URGENT,
      status: OrderStatus.IN_TRANSIT,
      items: [
        { productName: 'Tivi Thông Minh Sony Bravia 55 Inch 4K', quantity: 4, weight: 74.0, volume: 0.72, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
        { productName: 'Thùng Dầu Ăn Cao Cấp Neptune 5L (4 can)', quantity: 12, weight: 230.4, volume: 0.54, isFragile: false, isLiquid: true, requiresSpecialHandling: false },
        { productName: 'Kiện Linh Kiện Máy Tính & Bo Mạch Chủ', quantity: 5, weight: 42.5, volume: 0.30, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
      ],
      delivery: {
        id: 'del-01',
        deliveryCode: 'DEL-2026-001',
        driverId: 'drv-01',
        vehicleId: 'veh-01',
        status: DeliveryStatus.IN_TRANSIT,
      },
    },
    {
      id: 'ord-02',
      orderCode: 'VR-2026-002',
      customerId: 'cus-hn-02',
      warehouseId: 'wh-hn-lb',
      receiverName: 'Dược sĩ Hoàng Kim Chi',
      receiverPhone: '0912.876.543',
      receiverAddress: 'Số 170 La Thành, Đống Đa, Hà Nội',
      receiverLatitude: 21.0185,
      receiverLongitude: 105.8247,
      totalWeight: 45.0,
      totalVolume: 0.35,
      codAmount: 8900000,
      priority: OrderPriority.HIGH,
      status: OrderStatus.ASSIGNED,
      items: [
        { productName: 'Thùng Dược Phẩm Kháng Sinh Kháng Viêm', quantity: 6, weight: 36.0, volume: 0.15, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
        { productName: 'Hộp Găng Tay Y Tế Tiệt Trùng Vglove', quantity: 15, weight: 9.0, volume: 0.20, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
      ],
      delivery: {
        id: 'del-02',
        deliveryCode: 'DEL-2026-002',
        driverId: 'drv-03',
        vehicleId: 'veh-03',
        status: DeliveryStatus.ASSIGNED,
      },
    },
    {
      id: 'ord-03',
      orderCode: 'VR-2026-003',
      customerId: 'cus-hn-03',
      warehouseId: 'wh-hn-gl',
      receiverName: 'Trưởng phòng Kỹ thuật An Phát',
      receiverPhone: '0904.332.119',
      receiverAddress: 'Số 49 Thái Hà, Đống Đa, Hà Nội',
      receiverLatitude: 21.0128,
      receiverLongitude: 105.8194,
      totalWeight: 120.0,
      totalVolume: 0.82,
      codAmount: 0,
      priority: OrderPriority.NORMAL,
      status: OrderStatus.PENDING,
      items: [
        { productName: 'Kiện Linh Kiện Máy Tính & Bo Mạch Chủ', quantity: 12, weight: 102.0, volume: 0.72, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
        { productName: 'Cuộn Dây Cáp Mạng Cat6 UTP 305m', quantity: 2, weight: 18.0, volume: 0.10, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
      ],
    },
    {
      id: 'ord-04',
      orderCode: 'VR-2026-004',
      customerId: 'cus-hn-04',
      warehouseId: 'wh-hn-gl',
      receiverName: 'Trần Thị Bích Ngọc',
      receiverPhone: '0912.445.566',
      receiverAddress: 'Số 88 Cầu Giấy, Cầu Giấy, Hà Nội',
      receiverLatitude: 21.0345,
      receiverLongitude: 105.7981,
      totalWeight: 18.5,
      totalVolume: 0.12,
      codAmount: 3200000,
      priority: OrderPriority.NORMAL,
      status: OrderStatus.DELIVERED,
      items: [
        { productName: 'Thùng Sữa Tươi Tiệt Trùng TH True Milk', quantity: 1, weight: 12.0, volume: 0.035, isFragile: false, isLiquid: true, requiresSpecialHandling: false },
        { productName: 'Thùng Bánh Kẹo Tết Kinh Đô Cao Cấp', quantity: 1, weight: 5.5, volume: 0.03, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
      ],
      delivery: {
        id: 'del-04',
        deliveryCode: 'DEL-2026-004',
        driverId: 'drv-02',
        vehicleId: 'veh-02',
        status: DeliveryStatus.DELIVERED,
      },
    },
    {
      id: 'ord-05',
      orderCode: 'VR-2026-005',
      customerId: 'cus-sg-01',
      warehouseId: 'wh-hcm-cl',
      receiverName: 'Quản lý Kho WinMart Cát Lái',
      receiverPhone: '0933.771.882',
      receiverAddress: 'Tòa nhà Bitexco, Quận 1, TP.HCM',
      receiverLatitude: 10.7715,
      receiverLongitude: 106.7042,
      totalWeight: 1850.0,
      totalVolume: 8.5,
      codAmount: 45000000,
      priority: OrderPriority.URGENT,
      status: OrderStatus.IN_TRANSIT,
      items: [
        { productName: 'Bao Gạo Nàng Thơm Chợ Đào 25kg', quantity: 50, weight: 1250.0, volume: 2.0, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
        { productName: 'Thùng Bia Sài Gòn Special (24 lon)', quantity: 50, weight: 440.0, volume: 1.1, isFragile: false, isLiquid: true, requiresSpecialHandling: false },
      ],
      delivery: {
        id: 'del-05',
        deliveryCode: 'DEL-2026-005',
        driverId: 'drv-05',
        vehicleId: 'veh-05',
        status: DeliveryStatus.IN_TRANSIT,
      },
    },
  ];

  for (const o of ordersSeed) {
    const createdOrder = await prisma.order.create({
      data: {
        id: o.id,
        order_code: o.orderCode,
        customer_id: o.customerId,
        warehouse_id: o.warehouseId,
        receiver_name: o.receiverName,
        receiver_phone: o.receiverPhone,
        receiver_address: o.receiverAddress,
        receiver_latitude: o.receiverLatitude,
        receiver_longitude: o.receiverLongitude,
        total_weight: o.totalWeight,
        total_volume: o.totalVolume,
        cod_amount: o.codAmount,
        priority: o.priority,
        status: o.status,
      },
    });

    for (const it of o.items) {
      await prisma.orderItem.create({
        data: {
          order_id: createdOrder.id,
          product_name: it.productName,
          quantity: it.quantity,
          weight: it.weight,
          volume: it.volume,
          is_fragile: it.isFragile,
          is_liquid: it.isLiquid,
          requires_special_handling: it.requiresSpecialHandling,
        },
      });
    }

    if (o.delivery) {
      const createdDel = await prisma.delivery.create({
        data: {
          id: o.delivery.id,
          delivery_code: o.delivery.deliveryCode,
          order_id: createdOrder.id,
          driver_id: o.delivery.driverId,
          vehicle_id: o.delivery.vehicleId,
          status: o.delivery.status,
        },
      });

      // Tạo lịch sử trạng thái
      await prisma.deliveryStatusHistory.create({
        data: {
          delivery_id: createdDel.id,
          status: o.delivery.status,
          description: `Đơn hàng chuyển sang trạng thái ${o.delivery.status}`,
          latitude: o.receiverLatitude,
          longitude: o.receiverLongitude,
        },
      });

      // Tạo phân công
      if (o.delivery.driverId && o.delivery.vehicleId) {
        await prisma.driverAssignment.create({
          data: {
            delivery_id: createdDel.id,
            driver_id: o.delivery.driverId,
            vehicle_id: o.delivery.vehicleId,
            score: 95.0,
            assignment_type: AssignmentType.AI_RECOMMENDED,
          },
        });
      }
    }
  }

  // 8. TUYẾN ĐƯỜNG VÀ THÔNG BÁO (ROUTES & NOTIFICATIONS)
  console.log('🛣️ 8/8. Tạo tuyến đường mẫu & thông báo hệ thống...');
  const route01 = await prisma.route.create({
    data: {
      id: 'rt-han-01',
      route_code: 'ROUTE-HAN-01',
      route_name: 'Tuyến Giao Nhanh Nội Thành Hà Nội - Chặng Hoàng Mai - Đống Đa',
      driver_id: 'drv-01',
      vehicle_id: 'veh-01',
      warehouse_id: 'wh-hn-lb',
      total_distance: 28.5,
      estimated_duration: 85,
      status: RouteStatus.ACTIVE,
      toll_fee_est_vnd: 35000,
      fuel_est_liters: 6.8,
      total_weight_kg: 350.5,
      total_volume_m3: 1.85,
      polyline: [
        [105.9082, 21.0368],
        [105.8642, 20.9984],
        [105.8247, 21.0185],
      ],
      traffic_alerts: ['Ùn ứ nhẹ giờ cao điểm tại nút giao Tam Trinh - Vành Đai 2.5'],
      stops: {
        create: [
          {
            delivery_id: 'del-01',
            sequence: 1,
            latitude: 20.9984,
            longitude: 105.8642,
            customer_name: 'Công ty TNHH Tiếp vận Thăng Long',
            customer_phone: '02438251234',
            address: 'Số 18 Tam Trinh, Mai Động, Hoàng Mai, Hà Nội',
            order_code: 'VR-2026-001',
            weight_kg: 350.5,
            package_count: 21,
            status: RouteStopStatus.ARRIVED,
            time_window_start: '08:30',
            time_window_end: '10:30',
          },
        ],
      },
    },
  });

  // Thông báo mẫu
  const notificationsSeed = [
    {
      title: 'Đơn hàng mới tiếp nhận VR-2026-001',
      message: 'Đơn hàng khẩn cấp (URGENT) đã được tiếp nhận và phân bổ tài xế Nguyễn Văn An.',
      type: NotificationType.ORDER_ASSIGNED,
      priority: NotificationPriority.HIGH,
      reference_id: 'ord-01',
    },
    {
      title: 'Cảnh báo đăng kiểm xe 29H-123.45',
      message: 'Phương tiện XE-VAN-02 (Ford Transit) sắp hết hạn đăng kiểm trong 12 ngày tới.',
      type: NotificationType.VEHICLE_ALERT,
      priority: NotificationPriority.HIGH,
      reference_id: 'veh-02',
    },
    {
      title: 'Giao hàng thành công đơn VR-2026-004',
      message: 'Tài xế Trần Minh Hoàng đã giao thành công đơn hàng tại Cầu Giấy.',
      type: NotificationType.DELIVERY_SUCCESS,
      priority: NotificationPriority.NORMAL,
      reference_id: 'ord-04',
    },
  ];

  for (const n of notificationsSeed) {
    await prisma.notification.create({
      data: n,
    });
  }

  // 9. QUẢN LÝ XUẤT NHẬP KHO (WMS)
  console.log('🏭 9/10. Tạo dữ liệu quản lý kho WMS (Tồn kho, Phiếu nhập, Phiếu xuất, Điều chuyển)...');
  const inventoryData = [
    {
      sku: 'SKU-ELEC-001',
      product_name: 'Tivi Sony Bravia 55 Inch 4K UHD',
      warehouse_id: 'wh-hn-lb',
      zone_code: 'ZONE-A-RACK',
      quantity: 120,
      reserved_quantity: 15,
      unit: 'chiếc',
      weight_per_unit: 18.5,
      min_stock_level: 20,
    },
    {
      sku: 'SKU-ELEC-002',
      product_name: 'Tủ lạnh Inverter Panasonic 350L',
      warehouse_id: 'wh-hn-lb',
      zone_code: 'ZONE-A-RACK',
      quantity: 45,
      reserved_quantity: 5,
      unit: 'chiếc',
      weight_per_unit: 62.0,
      min_stock_level: 10,
    },
    {
      sku: 'SKU-FOOD-001',
      product_name: 'Dầu ăn Neptune Gold Can 5 Lít (Thùng 4 can)',
      warehouse_id: 'wh-hn-lb',
      zone_code: 'ZONE-B-BULK',
      quantity: 380,
      reserved_quantity: 40,
      unit: 'thùng',
      weight_per_unit: 19.2,
      min_stock_level: 50,
    },
    {
      sku: 'SKU-MED-001',
      product_name: 'Găng tay y tế Vglove tiệt trùng (Hộp 50 đôi)',
      warehouse_id: 'wh-hn-gl',
      zone_code: 'ZONE-STG-01',
      quantity: 850,
      reserved_quantity: 60,
      unit: 'hộp',
      weight_per_unit: 0.6,
      min_stock_level: 100,
    },
    {
      sku: 'SKU-TECH-001',
      product_name: 'Màn hình Dell UltraSharp 27 inch 4K',
      warehouse_id: 'wh-hcm-cl',
      zone_code: 'ZONE-CD-SG1',
      quantity: 210,
      reserved_quantity: 25,
      unit: 'chiếc',
      weight_per_unit: 8.2,
      min_stock_level: 30,
    },
    {
      sku: 'SKU-HOME-001',
      product_name: 'Quạt đứng Mitsubishi Electric LV16',
      warehouse_id: 'wh-dad-hc',
      zone_code: 'ZONE-DAD-A',
      quantity: 160,
      reserved_quantity: 10,
      unit: 'cây',
      weight_per_unit: 7.5,
      min_stock_level: 25,
    },
  ];

  for (const inv of inventoryData) {
    await prisma.inventoryItem.create({
      data: inv,
    });
  }

  // Phiếu nhập kho
  await prisma.inboundReceipt.create({
    data: {
      receipt_code: 'INB-2026-001',
      warehouse_id: 'wh-hn-lb',
      supplier_name: 'Tập đoàn Điện tử Sony Việt Nam',
      item_count: 50,
      total_weight: 925.0,
      status: InboundStatus.COMPLETED,
      received_by: 'Nguyễn Văn Hùng',
      notes: 'Lô hàng tivi nguyên đai nguyên kiện, đã nghiệm thu vào cổng Dock #01.',
      completed_at: new Date(),
    },
  });

  await prisma.inboundReceipt.create({
    data: {
      receipt_code: 'INB-2026-002',
      warehouse_id: 'wh-hn-lb',
      supplier_name: 'Công ty Dầu thực vật Cái Lân',
      item_count: 100,
      total_weight: 1920.0,
      status: InboundStatus.RECEIVING,
      received_by: 'Trần Văn Cường',
      notes: 'Đang hạ tải tại khu vực lưu trữ bách hóa tổng hợp.',
    },
  });

  // Phiếu xuất kho
  await prisma.outboundDispatch.create({
    data: {
      dispatch_code: 'OUT-2026-001',
      warehouse_id: 'wh-hn-lb',
      order_code: 'VR-2026-001',
      route_code: 'ROUTE-HAN-01',
      item_count: 21,
      total_weight: 350.5,
      status: OutboundStatus.DISPATCHED,
      picked_by: 'Hoàng Văn Thao',
      notes: 'Bàn giao cho tài xế Nguyễn Văn An xe 29C-789.12 xuất bến lúc 08:15.',
    },
  });

  await prisma.outboundDispatch.create({
    data: {
      dispatch_code: 'OUT-2026-002',
      warehouse_id: 'wh-hcm-cl',
      order_code: 'VR-2026-005',
      item_count: 40,
      total_weight: 328.0,
      status: OutboundStatus.PICKING,
      picked_by: 'Lê Quốc Bảo',
      notes: 'Đang gom hàng màn hình máy tính theo đơn khách hàng WinCommerce.',
    },
  });

  // Phiếu điều chuyển kho liên tỉnh
  await prisma.stockTransfer.create({
    data: {
      transfer_code: 'TRF-2026-001',
      from_warehouse_id: 'wh-hn-lb',
      to_warehouse_id: 'wh-dad-hc',
      item_count: 30,
      total_weight: 555.0,
      status: TransferStatus.IN_TRANSIT,
      created_by: 'Phan Vũ Linh (Admin)',
      created_at: new Date(),
    },
  });

  // Nhật ký kho (Warehouse Activity)
  const activities = [
    {
      warehouse_id: 'wh-hn-lb',
      type: WmsActivityType.INBOUND,
      description: 'Nhập thành công 50 chiếc Tivi Sony Bravia vào ZONE-A-RACK',
      user: 'Nguyễn Văn Hùng',
      reference_code: 'INB-2026-001',
      quantity: 50,
    },
    {
      warehouse_id: 'wh-hn-lb',
      type: WmsActivityType.OUTBOUND,
      description: 'Xuất kho 21 kiện hàng bàn giao xe 29C-789.12 theo đơn VR-2026-001',
      user: 'Hoàng Văn Thao',
      reference_code: 'OUT-2026-001',
      quantity: 21,
    },
    {
      warehouse_id: 'wh-hn-lb',
      type: WmsActivityType.TRANSFER,
      description: 'Khởi tạo điều chuyển 30 sản phẩm từ Tổng kho Long Biên tới Kho Đà Nẵng',
      user: 'Phan Vũ Linh (Admin)',
      reference_code: 'TRF-2026-001',
      quantity: 30,
    },
  ];

  for (const act of activities) {
    await prisma.warehouseActivity.create({
      data: act,
    });
  }

  // 10. QUẢN LÝ SỰ CỐ & KHIẾU NẠI (INCIDENTS)
  console.log('🚨 10/10. Tạo dữ liệu quản lý sự cố vận hành & khiếu nại (Incidents)...');
  const incident01 = await prisma.incident.create({
    data: {
      incident_code: 'INC-2026-001',
      type: IncidentType.DAMAGED_GOODS,
      severity: IncidentSeverity.HIGH,
      status: IncidentStatus.IN_PROGRESS,
      title: 'Móp méo vỏ bao bì thùng tivi trong quá trình bốc dỡ',
      description: 'Khi hạ tải tại điểm giao số 18 Tam Trinh, phát hiện 01 góc thùng Tivi Sony 55 inch bị móp. Khách hàng đã lập biên bản ghi nhận.',
      order_code: 'VR-2026-001',
      driver_name: 'Nguyễn Văn An',
      vehicle_plate: '29C-789.12',
      warehouse_name: 'Tổng kho Miền Bắc (Long Biên)',
      reported_by: 'Nguyễn Văn An (Tài xế)',
      assigned_to: 'Phan Vũ Linh (Admin)',
      comments: {
        create: [
          {
            user: 'Nguyễn Văn An',
            message: 'Đã chụp ảnh hiện trạng hiện trường gửi phòng điều phối qua Zalo.',
          },
          {
            user: 'Phan Vũ Linh (Admin)',
            message: 'Đã ghi nhận sự cố. Đang kiểm tra với bộ phận bảo hiểm hàng hóa để hỗ trợ đổi mới vỏ thùng cho khách.',
          },
        ],
      },
    },
  });

  const incident02 = await prisma.incident.create({
    data: {
      incident_code: 'INC-2026-002',
      type: IncidentType.VEHICLE_ACCIDENT,
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.NEW,
      title: 'Xe van chết máy trên đường Vành Đai 3 trên cao',
      description: 'Phương tiện XE-VAN-02 gặp sự cố két làm mát, tạm thời dừng khẩn cấp tại làn cứu nạn gần nút giao Nguyễn Trãi.',
      vehicle_plate: '29H-123.45',
      driver_name: 'Trần Minh Hoàng',
      warehouse_name: 'Kho Vệ Tinh Cầu Giấy',
      reported_by: 'Trần Minh Hoàng',
      assigned_to: 'Nguyễn Văn Hùng (Điều phối)',
      comments: {
        create: [
          {
            user: 'Trần Minh Hoàng',
            message: 'Đã đặt tam giác phản quang cảnh báo và liên hệ đội cứu hộ cao tốc.',
          },
        ],
      },
    },
  });

  const incident03 = await prisma.incident.create({
    data: {
      incident_code: 'INC-2026-003',
      type: IncidentType.LATE_DELIVERY,
      severity: IncidentSeverity.LOW,
      status: IncidentStatus.RESOLVED,
      title: 'Giao trễ 25 phút do triều cường ngập nước khu vực Cát Lái',
      description: 'Khu vực cầu Mỹ Thủy ngập sâu 40cm khiến xe tải di chuyển chậm hơn dự kiến 25 phút.',
      order_code: 'VR-2026-005',
      driver_name: 'Hoàng Đức Thắng',
      vehicle_plate: '51D-928.34',
      warehouse_name: 'Tổng kho Miền Nam (Cát Lái)',
      reported_by: 'Hoàng Đức Thắng',
      assigned_to: 'Phan Vũ Linh (Admin)',
      resolution_note: 'Đã thông báo xin lỗi khách hàng WinCommerce và bàn giao đầy đủ chứng từ không phát sinh khiếu nại.',
      resolved_at: new Date(),
      comments: {
        create: [
          {
            user: 'Hoàng Đức Thắng',
            message: 'Khách hàng thông cảm do thời tiết mưa lớn, đã ký nhận đủ hàng.',
          },
        ],
      },
    },
  });

  console.log('✨ Seed dữ liệu hoàn tất thành công 100%!');
  console.log('====================================================');
  console.log('🔑 Tài khoản quản trị: admin@vietroute.com / 123456');
  console.log('🔑 Tài khoản quản trị dự phòng: admin@vietroute.vn / 123456');
  console.log('🔑 Tài khoản điều phối: dieuphoi@vietroute.vn / 123456');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
