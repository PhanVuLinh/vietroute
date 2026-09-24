/**
 * Bộ chuyển đổi dữ liệu Prisma Snake_case sang chuẩn CamelCase phù hợp với Frontend
 */

export function mapVehicle(v: any) {
  if (!v) return null;
  return {
    id: v.id,
    vehicleCode: v.vehicle_code,
    licensePlate: v.license_plate,
    type: v.type,
    brand: v.brand,
    model: v.model,
    capacityWeight: v.capacity_weight,
    capacityVolume: v.capacity_volume,
    currentMileage: v.current_mileage,
    fuelPercent: v.fuel_percent,
    status: v.status,
    driverId: v.driver_id,
    driverName: v.driver?.full_name,
    nextMaintenanceDate: v.next_maintenance_date
      ? new Date(v.next_maintenance_date).toISOString().split('T')[0]
      : undefined,
    inspectionCertificateNumber: v.inspection_certificate_number,
    lastInspectionDate: v.last_inspection_date
      ? new Date(v.last_inspection_date).toISOString().split('T')[0]
      : undefined,
    inspectionExpiryDate: v.inspection_expiry_date
      ? new Date(v.inspection_expiry_date).toISOString().split('T')[0]
      : undefined,
    insuranceExpiryDate: v.insurance_expiry_date
      ? new Date(v.insurance_expiry_date).toISOString().split('T')[0]
      : undefined,
    inspectionCenter: v.inspection_center,
    inspectionNotes: v.inspection_notes,
  };
}

export function mapDriver(d: any) {
  if (!d) return null;
  return {
    id: d.id,
    userId: d.user_id,
    driverCode: d.driver_code,
    fullName: d.full_name,
    phone: d.phone,
    licenseNumber: d.license_number,
    licenseType: d.license_type,
    licenseExpiredAt: d.license_expired_at
      ? new Date(d.license_expired_at).toISOString().split('T')[0]
      : '',
    status: d.status,
    currentLocation: [d.current_location_lng, d.current_location_lat],
    currentVehicleId: d.current_vehicle?.id || undefined,
    currentDeliveryCount: d.current_delivery_count,
    todayCompletedDeliveries: d.today_completed_deliveries,
    onTimeRate: d.on_time_rate,
    successRate: d.success_rate,
  };
}

export function mapWarehouse(w: any) {
  if (!w) return null;
  return {
    id: w.id,
    code: w.code,
    name: w.name,
    type: w.type,
    region: w.region,
    address: w.address,
    city: w.city,
    latitude: w.latitude,
    longitude: w.longitude,
    openingTime: w.opening_time,
    closingTime: w.closing_time,
    capacity: w.capacity,
    usedCapacity: w.used_capacity,
    areaSqM: w.area_sqm,
    totalPallets: w.total_pallets,
    usedPallets: w.used_pallets,
    dockDoors: w.dock_doors_count,
    storageType: w.storage_type,
    managerName: w.manager_name,
    managerPhone: w.manager_phone,
    managerEmail: w.manager_email,
    status: w.status,
    dailyInboundTons: w.daily_inbound_tons,
    dailyOutboundTons: w.daily_outbound_tons,
    yardParkingCapacity: w.yard_parking_capacity,
    yardParkingOccupied: w.yard_parking_occupied,
    compliance: {
      pcccCertificateNumber: w.pccc_certificate_number,
      pcccExpiryDate: w.pccc_expiry_date,
      pcccInspector: w.pccc_inspector,
      insurancePolicyNumber: w.insurance_policy_number,
      insuranceExpiryDate: w.insurance_expiry_date,
      insuranceProvider: w.insurance_provider,
      rackInspectionExpiry: w.rack_inspection_expiry,
    },
    zones: w.zones?.map((z: any) => ({
      id: z.id,
      code: z.code,
      name: z.name,
      type: z.type,
      capacityPallets: z.capacity_pallets,
      usedPallets: z.used_pallets,
      temperatureCelsius: z.temperature_celsius,
      humidityPercent: z.humidity_percent,
    })),
    dockList: w.dock_doors?.map((d: any) => ({
      id: d.id,
      doorNumber: d.door_number,
      name: d.name,
      type: d.type,
      status: d.status,
      currentVehiclePlate: d.current_vehicle_plate,
      currentDriverName: d.current_driver_name,
      cargoType: d.cargo_type,
      startedAt: d.started_at ? new Date(d.started_at).toISOString() : undefined,
      estimatedCompletionTime: d.estimated_completion_time
        ? new Date(d.estimated_completion_time).toISOString()
        : undefined,
      progressPercent: d.progress_percent,
    })),
  };
}

export function mapOrder(o: any) {
  if (!o) return null;
  const primaryDelivery = o.deliveries?.[0];
  const lastHistoryWithPod = primaryDelivery?.history?.find(
    (h: any) => h.status === 'DELIVERED' && h.note && (h.note.startsWith('{') || h.note.includes('"signatureUrl"'))
  );
  let pod = null;
  if (lastHistoryWithPod?.note) {
    try {
      pod = JSON.parse(lastHistoryWithPod.note);
    } catch {
      pod = { notes: lastHistoryWithPod.note };
    }
  }

  return {
    id: o.id,
    orderCode: o.order_code,
    customerId: o.customer_id,
    customerName: o.customer?.name,
    warehouseId: o.warehouse_id,
    warehouseName: o.warehouse?.name,
    warehouse: o.warehouse ? mapWarehouse(o.warehouse) : undefined,
    receiverName: o.receiver_name,
    receiverPhone: o.receiver_phone,
    receiverAddress: o.receiver_address,
    receiverLatitude: o.receiver_latitude,
    receiverLongitude: o.receiver_longitude,
    totalWeight: o.total_weight,
    totalVolume: o.total_volume,
    codAmount: o.cod_amount,
    priority: o.priority,
    deliveryWindowStart: o.delivery_window_start
      ? new Date(o.delivery_window_start).toISOString()
      : undefined,
    deliveryWindowEnd: o.delivery_window_end
      ? new Date(o.delivery_window_end).toISOString()
      : undefined,
    status: o.status,
    driver: primaryDelivery?.driver ? mapDriver(primaryDelivery.driver) : undefined,
    vehicle: primaryDelivery?.vehicle ? mapVehicle(primaryDelivery.vehicle) : undefined,
    delivery: primaryDelivery ? mapDelivery(primaryDelivery) : undefined,
    pod: pod,
    createdAt: o.created_at ? new Date(o.created_at).toISOString() : undefined,
    updatedAt: o.updated_at ? new Date(o.updated_at).toISOString() : undefined,
    items: o.items?.map((it: any) => ({
      id: it.id,
      orderId: it.order_id,
      productName: it.product_name,
      quantity: it.quantity,
      weight: it.weight,
      volume: it.volume,
      isFragile: it.is_fragile,
      isLiquid: it.is_liquid,
      requiresSpecialHandling: it.requires_special_handling,
    })),
  };
}

export function mapDelivery(del: any) {
  if (!del) return null;
  return {
    id: del.id,
    deliveryCode: del.delivery_code,
    orderId: del.order_id,
    orderCode: del.order?.order_code,
    receiverName: del.order?.receiver_name,
    receiverPhone: del.order?.receiver_phone,
    receiverAddress: del.order?.receiver_address,
    driverId: del.driver_id,
    driverName: del.driver?.full_name,
    driverPhone: del.driver?.phone,
    vehicleId: del.vehicle_id,
    vehiclePlate: del.vehicle?.license_plate,
    status: del.status,
    startedAt: del.started_at ? new Date(del.started_at).toISOString() : undefined,
    completedAt: del.completed_at ? new Date(del.completed_at).toISOString() : undefined,
    failedReason: del.failed_reason,
    createdAt: del.created_at ? new Date(del.created_at).toISOString() : undefined,
    updatedAt: del.updated_at ? new Date(del.updated_at).toISOString() : undefined,
  };
}

export function mapRoute(r: any) {
  if (!r) return null;
  return {
    id: r.id,
    routeCode: r.route_code,
    routeName: r.route_name,
    driverId: r.driver_id,
    driverName: r.driver?.full_name,
    vehicleId: r.vehicle_id,
    vehiclePlate: r.vehicle?.license_plate,
    warehouseId: r.warehouse_id,
    warehouseName: r.warehouse?.name,
    totalDistance: r.total_distance,
    estimatedDuration: r.estimated_duration,
    status: r.status,
    startedAt: r.started_at ? new Date(r.started_at).toISOString() : undefined,
    completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
    tollFeeEstVND: r.toll_fee_est_vnd,
    fuelEstLiters: r.fuel_est_liters,
    totalWeightKg: r.total_weight_kg,
    totalVolumeM3: r.total_volume_m3,
    polyline: r.polyline,
    trafficAlerts: r.traffic_alerts,
    stops: r.stops?.map((s: any) => ({
      id: s.id,
      routeId: s.route_id,
      deliveryId: s.delivery_id,
      sequence: s.sequence,
      latitude: s.latitude,
      longitude: s.longitude,
      estimatedArrival: s.estimated_arrival
        ? new Date(s.estimated_arrival).toISOString()
        : undefined,
      actualArrival: s.actual_arrival ? new Date(s.actual_arrival).toISOString() : undefined,
      status: s.status,
      customerName: s.customer_name,
      customerPhone: s.customer_phone,
      address: s.address,
      orderCode: s.order_code,
      weightKg: s.weight_kg,
      packageCount: s.package_count,
      timeWindowStart: s.time_window_start,
      timeWindowEnd: s.time_window_end,
      notes: s.notes,
    })),
  };
}
