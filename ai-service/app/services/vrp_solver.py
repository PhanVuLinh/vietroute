import math
from typing import List, Tuple
from app.schemas.route import (
    RouteOptimizationRequest,
    RouteOptimizationResponse,
    OptimizedStopItem,
)


def calculate_haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Tính cự ly cung đường bộ theo công thức Haversine nhân hệ số uốn lượn 1.35x."""
    R = 6371.0  # Bán kính Trái Đất (km)
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c * 1.35, 2)


class VrpSolver:
    """Động cơ giải bài toán tối ưu hóa tuyến đường đa điểm dừng (VRP & TSP 2-Opt Heuristic)."""

    @staticmethod
    def solve_route(req: RouteOptimizationRequest) -> RouteOptimizationResponse:
        stops = [s.model_dump() for s in req.stops]
        return_to_origin = req.returnToOrigin is not False
        origin = {
            "id": "depot-origin",
            "name": "Điểm xuất phát",
            "lat": req.originLat,
            "lng": req.originLng,
            "demandKg": 0.0,
            "timeWindow": None,
        }

        if len(stops) <= 1:
            d = (
                calculate_haversine_km(
                    origin["lat"], origin["lng"], stops[0]["lat"], stops[0]["lng"]
                )
                if len(stops) == 1
                else 0.0
            )
            opt_stops = [
                OptimizedStopItem(
                    **s,
                    sequence=idx + 1,
                    distanceFromPreviousKm=d,
                    cumulativeDistanceKm=d,
                    estimatedEtaMinutes=round((d / 36.0) * 60),
                )
                for idx, s in enumerate(stops)
            ]
            return RouteOptimizationResponse(
                originalDistanceKm=d,
                optimizedDistanceKm=d,
                savedKm=0.0,
                savedPercent=0.0,
                fuelSavedLiters=0.0,
                costSavedVND=0,
                timeSavedMinutes=0,
                optimizedStops=opt_stops,
            )

        # 1. Tính quãng đường ban đầu
        orig_dist = calculate_haversine_km(
            origin["lat"], origin["lng"], stops[0]["lat"], stops[0]["lng"]
        )
        for i in range(len(stops) - 1):
            orig_dist += calculate_haversine_km(
                stops[i]["lat"], stops[i]["lng"], stops[i + 1]["lat"], stops[i + 1]["lng"]
            )
        if return_to_origin:
            orig_dist += calculate_haversine_km(
                stops[-1]["lat"], stops[-1]["lng"], origin["lat"], origin["lng"]
            )
        orig_dist = round(orig_dist, 1)

        # 2. Xây dựng tour khởi tạo bằng Nearest Neighbor
        unvisited = list(stops)
        tour = []
        current = origin

        while unvisited:
            nearest_idx = 0
            min_d = float("inf")
            for i, stop in enumerate(unvisited):
                d = calculate_haversine_km(
                    current["lat"], current["lng"], stop["lat"], stop["lng"]
                )
                if d < min_d:
                    min_d = d
                    nearest_idx = i

            nxt = unvisited.pop(nearest_idx)
            tour.append(nxt)
            current = nxt

        # 3. Tối ưu hóa 2-Opt TSP (Đảo các cặp đoạn thẳng để loại bỏ nút giao chéo)
        def compute_tour_dist(t: List[dict]) -> float:
            tot = calculate_haversine_km(origin["lat"], origin["lng"], t[0]["lat"], t[0]["lng"])
            for i in range(len(t) - 1):
                tot += calculate_haversine_km(
                    t[i]["lat"], t[i]["lng"], t[i + 1]["lat"], t[i + 1]["lng"]
                )
            if return_to_origin:
                tot += calculate_haversine_km(t[-1]["lat"], t[-1]["lng"], origin["lat"], origin["lng"])
            return tot

        best_tour = list(tour)
        best_dist = compute_tour_dist(best_tour)
        improved = True
        iterations = 0

        while improved and iterations < 50:
            improved = False
            iterations += 1
            for i in range(len(best_tour) - 1):
                for k in range(i + 1, len(best_tour)):
                    new_tour = (
                        best_tour[:i]
                        + list(reversed(best_tour[i : k + 1]))
                        + best_tour[k + 1 :]
                    )
                    new_dist = compute_tour_dist(new_tour)
                    if new_dist < best_dist - 0.05:
                        best_tour = new_tour
                        best_dist = new_dist
                        improved = True
                        break
                if improved:
                    break

        best_dist = round(best_dist, 1)
        saved_km = max(0.0, round(orig_dist - best_dist, 1))
        saved_pct = round((saved_km / orig_dist) * 100.0, 1) if orig_dist > 0 else 0.0
        fuel_liters = round(saved_km * 0.145, 1)  # Định mức 14.5L / 100km
        cost_vnd = int(fuel_liters * 23500)       # Giá dầu DO 23,500đ / Lít
        time_mins = round((saved_km / 36.0) * 60)

        # Lũy kế cự ly và tính ETA từng điểm dừng
        cum_dist = 0.0
        prev_pt = origin
        opt_stops_res = []

        for idx, stop in enumerate(best_tour):
            step_d = calculate_haversine_km(
                prev_pt["lat"], prev_pt["lng"], stop["lat"], stop["lng"]
            )
            cum_dist = round(cum_dist + step_d, 1)
            prev_pt = stop
            eta_m = round((cum_dist / 36.0) * 60)

            opt_stops_res.append(
                OptimizedStopItem(
                    id=stop["id"],
                    name=stop["name"],
                    lat=stop["lat"],
                    lng=stop["lng"],
                    demandKg=stop.get("demandKg", 0.0),
                    timeWindow=stop.get("timeWindow"),
                    sequence=idx + 1,
                    distanceFromPreviousKm=step_d,
                    cumulativeDistanceKm=cum_dist,
                    estimatedEtaMinutes=eta_m,
                )
            )

        return RouteOptimizationResponse(
            originalDistanceKm=orig_dist,
            optimizedDistanceKm=best_dist,
            savedKm=saved_km,
            savedPercent=saved_pct,
            fuelSavedLiters=fuel_liters,
            costSavedVND=cost_vnd,
            timeSavedMinutes=time_mins,
            optimizedStops=opt_stops_res,
        )
