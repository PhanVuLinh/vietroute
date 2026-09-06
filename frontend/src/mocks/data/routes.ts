import type { Route, RouteStatus, RouteStop, RouteStopStatus } from "@/core/types/logistics";
import { MOCK_DRIVERS } from "./drivers";
import { MOCK_WAREHOUSES } from "./warehouses";
import { MOCK_DELIVERIES } from "./deliveries";
import { MOCK_ORDERS } from "./orders";

const ROUTE_CONFIGS = [
  { code: "TUYEN-HAN-01", city: "Hà Nội", whId: "wh-hn-lb", driverIdx: 0, status: "ACTIVE" as RouteStatus, distance: 34.5, duration: 95 },
  { code: "TUYEN-HAN-02", city: "Hà Nội", whId: "wh-hn-lb", driverIdx: 1, status: "COMPLETED" as RouteStatus, distance: 28.0, duration: 75 },
  { code: "TUYEN-HAN-03", city: "Hà Nội", whId: "wh-hn-qm", driverIdx: 2, status: "ACTIVE" as RouteStatus, distance: 42.1, duration: 110 },
  { code: "TUYEN-SGN-04", city: "TP.HCM", whId: "wh-hcm-cl", driverIdx: 4, status: "ACTIVE" as RouteStatus, distance: 51.2, duration: 135 },
  { code: "TUYEN-SGN-05", city: "TP.HCM", whId: "wh-hcm-cl", driverIdx: 5, status: "PLANNED" as RouteStatus, distance: 38.6, duration: 105 },
  { code: "TUYEN-SGN-06", city: "TP.HCM", whId: "wh-hcm-tb", driverIdx: 6, status: "COMPLETED" as RouteStatus, distance: 26.4, duration: 70 },
  { code: "TUYEN-DAD-07", city: "Đà Nẵng", whId: "wh-dad-hc", driverIdx: 8, status: "ACTIVE" as RouteStatus, distance: 22.8, duration: 60 },
  { code: "TUYEN-DAD-08", city: "Đà Nẵng", whId: "wh-dad-hc", driverIdx: 9, status: "COMPLETED" as RouteStatus, distance: 18.5, duration: 50 },
  { code: "TUYEN-QNG-09", city: "Quảng Ngãi", whId: "wh-qng-qn", driverIdx: 11, status: "ACTIVE" as RouteStatus, distance: 31.0, duration: 80 },
  { code: "TUYEN-CTO-10", city: "Cần Thơ", whId: "wh-ct-cr", driverIdx: 13, status: "ACTIVE" as RouteStatus, distance: 27.5, duration: 70 },
  { code: "TUYEN-HAN-11", city: "Hà Nội", whId: "wh-hn-lb", driverIdx: 0, status: "PLANNED" as RouteStatus, distance: 33.0, duration: 90 },
  { code: "TUYEN-SGN-12", city: "TP.HCM", whId: "wh-hcm-tb", driverIdx: 5, status: "CANCELLED" as RouteStatus, distance: 19.2, duration: 55 },
];

function generateMockRoutes(): Route[] {
  const routes: Route[] = [];

  ROUTE_CONFIGS.forEach((cfg, rIdx) => {
    const routeId = `route-${(rIdx + 1).toString().padStart(3, "0")}`;
    const driver = MOCK_DRIVERS[cfg.driverIdx];
    const warehouse = MOCK_WAREHOUSES.find((w) => w.id === cfg.whId) || MOCK_WAREHOUSES[0];

    // Lấy danh sách delivery thuộc kho này
    const deliveriesForWarehouse = MOCK_DELIVERIES.filter((d) => {
      const order = MOCK_ORDERS.find((o) => o.id === d.orderId);
      return order && order.warehouseId === warehouse.id;
    });

    const stops: RouteStop[] = [];
    const stopCount = Math.min(deliveriesForWarehouse.length, 3 + (rIdx % 5));

    for (let sIdx = 0; sIdx < stopCount; sIdx++) {
      const delivery = deliveriesForWarehouse[sIdx];
      const order = MOCK_ORDERS.find((o) => o.id === delivery.orderId);

      const etaHour = 8 + Math.floor((sIdx * 25) / 60);
      const etaMinute = (sIdx * 25) % 60;
      const estimatedArrival = `2026-09-06T${etaHour.toString().padStart(2, "0")}:${etaMinute.toString().padStart(2, "0")}:00Z`;

      let stopStatus: RouteStopStatus = "PENDING";
      let actualArrival: string | undefined;

      if (cfg.status === "COMPLETED") {
        stopStatus = "COMPLETED";
        actualArrival = estimatedArrival;
      } else if (cfg.status === "ACTIVE") {
        if (sIdx === 0) {
          stopStatus = "COMPLETED";
          actualArrival = estimatedArrival;
        } else if (sIdx === 1) {
          stopStatus = "ARRIVED";
          actualArrival = estimatedArrival;
        } else {
          stopStatus = "PENDING";
        }
      } else if (cfg.status === "CANCELLED") {
        stopStatus = "SKIPPED";
      }

      stops.push({
        id: `stop-${routeId}-${sIdx + 1}`,
        routeId,
        deliveryId: delivery.id,
        sequence: sIdx + 1,
        latitude: order ? order.receiverLatitude : warehouse.latitude + 0.02 * (sIdx + 1),
        longitude: order ? order.receiverLongitude : warehouse.longitude + 0.02 * (sIdx + 1),
        estimatedArrival,
        actualArrival,
        status: stopStatus,
      });
    }

    routes.push({
      id: routeId,
      routeCode: cfg.code,
      driverId: driver.id,
      vehicleId: driver.currentVehicleId || "veh-01",
      warehouseId: warehouse.id,
      totalDistance: cfg.distance,
      estimatedDuration: cfg.duration,
      status: cfg.status,
      startedAt: cfg.status !== "PLANNED" ? "2026-09-06T08:00:00Z" : undefined,
      completedAt: cfg.status === "COMPLETED" ? "2026-09-06T10:30:00Z" : undefined,
      stops,
    });
  });

  return routes;
}

export const MOCK_ROUTES: Route[] = generateMockRoutes();
