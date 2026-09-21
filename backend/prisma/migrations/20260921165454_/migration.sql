-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "CustomerTier" AS ENUM ('REGULAR', 'SILVER', 'GOLD', 'VIP');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'ASSIGNED', 'PICKING_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('CENTRAL_HUB', 'TRANSIT_HUB', 'LAST_MILE_HUB');

-- CreateEnum
CREATE TYPE "WarehouseRegion" AS ENUM ('NORTH', 'CENTRAL', 'SOUTH');

-- CreateEnum
CREATE TYPE "WarehouseStorageType" AS ENUM ('DRY', 'COLD', 'MIXED');

-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('ACTIVE', 'MAINTENANCE', 'FULL');

-- CreateEnum
CREATE TYPE "WarehouseZoneType" AS ENUM ('CROSS_DOCK', 'PALLET_RACK', 'COLD_STORAGE', 'HAZMAT', 'STAGING');

-- CreateEnum
CREATE TYPE "DockDoorType" AS ENUM ('INBOUND', 'OUTBOUND', 'BIDIRECTIONAL');

-- CreateEnum
CREATE TYPE "DockStatus" AS ENUM ('AVAILABLE', 'LOADING', 'UNLOADING', 'INSPECTING', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTORBIKE', 'CAR', 'VAN', 'TRUCK');

-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'EN_ROUTE', 'LOADING', 'MAINTENANCE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'BUSY', 'ON_BREAK', 'OFFLINE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "LicenseType" AS ENUM ('B2', 'C', 'D', 'E', 'FC');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'ACCEPTED', 'PICKING_UP', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'DELIVERY_FAILED', 'RETURNING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('MANUAL', 'RULE_BASED', 'AI_RECOMMENDED');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RouteStopStatus" AS ENUM ('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ORDER_CREATED', 'ORDER_ASSIGNED', 'ORDER_ACCEPTED', 'DELIVERY_SUCCESS', 'DELIVERY_FAILED', 'LATE_WARNING', 'VEHICLE_ALERT', 'GPS_ALERT');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "InboundStatus" AS ENUM ('PENDING', 'RECEIVING', 'INSPECTING', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OutboundStatus" AS ENUM ('PENDING', 'PICKING', 'PACKING', 'DISPATCHED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WmsActivityType" AS ENUM ('INBOUND', 'OUTBOUND', 'TRANSFER', 'ADJUSTMENT', 'INSPECTION');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('DAMAGED_GOODS', 'LATE_DELIVERY', 'LOST_PACKAGE', 'WRONG_DELIVERY', 'VEHICLE_ACCIDENT', 'CUSTOMER_COMPLAINT', 'THEFT', 'OTHER');

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "type" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL',
    "tier" "CustomerTier" NOT NULL DEFAULT 'REGULAR',
    "tax_code" TEXT,
    "contact_person" TEXT,
    "website" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_pricing_rules" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "route_type" TEXT NOT NULL,
    "price_per_km" DOUBLE PRECISION NOT NULL,
    "price_per_kg" DOUBLE PRECISION NOT NULL,
    "discount_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_code" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "receiver_name" TEXT NOT NULL,
    "receiver_phone" TEXT NOT NULL,
    "receiver_address" TEXT NOT NULL,
    "receiver_latitude" DOUBLE PRECISION NOT NULL,
    "receiver_longitude" DOUBLE PRECISION NOT NULL,
    "total_weight" DOUBLE PRECISION NOT NULL,
    "total_volume" DOUBLE PRECISION NOT NULL,
    "cod_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
    "delivery_window_start" TIMESTAMP(3),
    "delivery_window_end" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "weight" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "is_fragile" BOOLEAN NOT NULL DEFAULT false,
    "is_liquid" BOOLEAN NOT NULL DEFAULT false,
    "requires_special_handling" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WarehouseType" NOT NULL DEFAULT 'CENTRAL_HUB',
    "region" "WarehouseRegion" NOT NULL DEFAULT 'NORTH',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "opening_time" TEXT NOT NULL DEFAULT '06:00',
    "closing_time" TEXT NOT NULL DEFAULT '22:00',
    "capacity" DOUBLE PRECISION NOT NULL,
    "used_capacity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "area_sqm" DOUBLE PRECISION,
    "total_pallets" INTEGER DEFAULT 1000,
    "used_pallets" INTEGER DEFAULT 0,
    "dock_doors_count" INTEGER DEFAULT 4,
    "storage_type" "WarehouseStorageType" NOT NULL DEFAULT 'DRY',
    "manager_name" TEXT,
    "manager_phone" TEXT,
    "manager_email" TEXT,
    "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE',
    "daily_inbound_tons" DOUBLE PRECISION DEFAULT 0,
    "daily_outbound_tons" DOUBLE PRECISION DEFAULT 0,
    "yard_parking_capacity" INTEGER DEFAULT 10,
    "yard_parking_occupied" INTEGER DEFAULT 0,
    "pccc_certificate_number" TEXT,
    "pccc_expiry_date" TEXT,
    "pccc_inspector" TEXT,
    "insurance_policy_number" TEXT,
    "insurance_expiry_date" TEXT,
    "insurance_provider" TEXT,
    "rack_inspection_expiry" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_zones" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WarehouseZoneType" NOT NULL DEFAULT 'PALLET_RACK',
    "capacity_pallets" INTEGER NOT NULL DEFAULT 500,
    "used_pallets" INTEGER NOT NULL DEFAULT 0,
    "temperature_celsius" DOUBLE PRECISION,
    "humidity_percent" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warehouse_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dock_doors" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "door_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DockDoorType" NOT NULL DEFAULT 'BIDIRECTIONAL',
    "status" "DockStatus" NOT NULL DEFAULT 'AVAILABLE',
    "current_vehicle_plate" TEXT,
    "current_driver_name" TEXT,
    "cargo_type" TEXT,
    "started_at" TIMESTAMP(3),
    "estimated_completion_time" TIMESTAMP(3),
    "progress_percent" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dock_doors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "vehicle_code" TEXT NOT NULL,
    "license_plate" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL DEFAULT 'TRUCK',
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "capacity_weight" DOUBLE PRECISION NOT NULL,
    "capacity_volume" DOUBLE PRECISION NOT NULL,
    "current_mileage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fuel_percent" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "driver_id" TEXT,
    "next_maintenance_date" TIMESTAMP(3),
    "inspection_certificate_number" TEXT,
    "last_inspection_date" TIMESTAMP(3),
    "inspection_expiry_date" TIMESTAMP(3),
    "insurance_expiry_date" TIMESTAMP(3),
    "inspection_center" TEXT,
    "inspection_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "driver_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "license_type" "LicenseType" NOT NULL DEFAULT 'C',
    "license_expired_at" TIMESTAMP(3) NOT NULL,
    "status" "DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
    "current_location_lat" DOUBLE PRECISION NOT NULL DEFAULT 21.0285,
    "current_location_lng" DOUBLE PRECISION NOT NULL DEFAULT 105.8544,
    "current_delivery_count" INTEGER NOT NULL DEFAULT 0,
    "today_completed_deliveries" INTEGER NOT NULL DEFAULT 0,
    "on_time_rate" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "success_rate" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "delivery_code" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "driver_id" TEXT,
    "vehicle_id" TEXT,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "failed_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_status_history" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "status" "DeliveryStatus" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "note" TEXT,

    CONSTRAINT "delivery_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_assignments" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "driver_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 90.0,
    "assignment_type" "AssignmentType" NOT NULL DEFAULT 'MANUAL',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "driver_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "route_code" TEXT NOT NULL,
    "route_name" TEXT,
    "driver_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "total_distance" DOUBLE PRECISION NOT NULL,
    "estimated_duration" INTEGER NOT NULL,
    "status" "RouteStatus" NOT NULL DEFAULT 'PLANNED',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "toll_fee_est_vnd" DOUBLE PRECISION DEFAULT 0,
    "fuel_est_liters" DOUBLE PRECISION DEFAULT 0,
    "total_weight_kg" DOUBLE PRECISION DEFAULT 0,
    "total_volume_m3" DOUBLE PRECISION DEFAULT 0,
    "polyline" JSONB,
    "traffic_alerts" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "delivery_id" TEXT,
    "sequence" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "estimated_arrival" TIMESTAMP(3),
    "actual_arrival" TIMESTAMP(3),
    "status" "RouteStopStatus" NOT NULL DEFAULT 'PENDING',
    "customer_name" TEXT,
    "customer_phone" TEXT,
    "address" TEXT,
    "order_code" TEXT,
    "weight_kg" DOUBLE PRECISION,
    "package_count" INTEGER,
    "time_window_start" TEXT,
    "time_window_end" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'ORDER_CREATED',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "reference_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "zone_code" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'kiện',
    "weight_per_unit" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "min_stock_level" INTEGER NOT NULL DEFAULT 10,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbound_receipts" (
    "id" TEXT NOT NULL,
    "receipt_code" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "supplier_name" TEXT NOT NULL,
    "item_count" INTEGER NOT NULL DEFAULT 1,
    "total_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "InboundStatus" NOT NULL DEFAULT 'RECEIVING',
    "received_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "inbound_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound_dispatches" (
    "id" TEXT NOT NULL,
    "dispatch_code" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "order_code" TEXT,
    "route_code" TEXT,
    "item_count" INTEGER NOT NULL DEFAULT 1,
    "total_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "OutboundStatus" NOT NULL DEFAULT 'PICKING',
    "picked_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "outbound_dispatches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_transfers" (
    "id" TEXT NOT NULL,
    "transfer_code" TEXT NOT NULL,
    "from_warehouse_id" TEXT NOT NULL,
    "to_warehouse_id" TEXT NOT NULL,
    "item_count" INTEGER NOT NULL DEFAULT 1,
    "total_weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "TransferStatus" NOT NULL DEFAULT 'IN_TRANSIT',
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "stock_transfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouse_activities" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "type" "WmsActivityType" NOT NULL DEFAULT 'INBOUND',
    "description" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "reference_code" TEXT NOT NULL,
    "quantity" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "incident_code" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL DEFAULT 'DAMAGED_GOODS',
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'NEW',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order_code" TEXT,
    "driver_name" TEXT,
    "vehicle_plate" TEXT,
    "warehouse_name" TEXT,
    "reported_by" TEXT NOT NULL,
    "assigned_to" TEXT,
    "resolution_note" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_comments" (
    "id" TEXT NOT NULL,
    "incident_id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_code_key" ON "orders"("order_code");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicle_code_key" ON "vehicles"("vehicle_code");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_license_plate_key" ON "vehicles"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_driver_id_key" ON "vehicles"("driver_id");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_user_id_key" ON "drivers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_driver_code_key" ON "drivers"("driver_code");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_delivery_code_key" ON "deliveries"("delivery_code");

-- CreateIndex
CREATE UNIQUE INDEX "routes_route_code_key" ON "routes"("route_code");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_items_sku_key" ON "inventory_items"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "inbound_receipts_receipt_code_key" ON "inbound_receipts"("receipt_code");

-- CreateIndex
CREATE UNIQUE INDEX "outbound_dispatches_dispatch_code_key" ON "outbound_dispatches"("dispatch_code");

-- CreateIndex
CREATE UNIQUE INDEX "stock_transfers_transfer_code_key" ON "stock_transfers"("transfer_code");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_incident_code_key" ON "incidents"("incident_code");

-- AddForeignKey
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_pricing_rules" ADD CONSTRAINT "customer_pricing_rules_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_zones" ADD CONSTRAINT "warehouse_zones_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dock_doors" ADD CONSTRAINT "dock_doors_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_status_history" ADD CONSTRAINT "delivery_status_history_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_assignments" ADD CONSTRAINT "driver_assignments_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound_receipts" ADD CONSTRAINT "inbound_receipts_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound_dispatches" ADD CONSTRAINT "outbound_dispatches_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_warehouse_id_fkey" FOREIGN KEY ("from_warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_warehouse_id_fkey" FOREIGN KEY ("to_warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouse_activities" ADD CONSTRAINT "warehouse_activities_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_comments" ADD CONSTRAINT "incident_comments_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "incidents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
