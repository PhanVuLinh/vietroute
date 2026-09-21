import type { ApiResponse } from "@/core/types/api";
import type { Incident, IncidentStatus } from "@/modules/incidents/types/incident";
import { MOCK_INCIDENTS } from "../data/incidents";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

const STORAGE_KEY = "vietroute_mock_incidents";

function loadIncidents(): Incident[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load incidents from localStorage", e);
    }
  }
  return [...MOCK_INCIDENTS];
}

function saveIncidents(data: Incident[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save incidents to localStorage", e);
    }
  }
}

let incidents: Incident[] = loadIncidents();

export const mockIncidentService = {
  async getIncidents(
    params?: { status?: IncidentStatus; severity?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<Incident[]>> {
    await simulateLatency(options);
    let result = [...incidents];
    if (params?.status) {
      result = result.filter((i) => i.status === params.status);
    }
    if (params?.severity) {
      result = result.filter((i) => i.severity === params.severity);
    }
    return { success: true, statusCode: 200, message: "OK", data: result };
  },

  async getIncidentById(
    id: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Incident | null>> {
    await simulateLatency(options);
    const incident = incidents.find((i) => i.id === id) || null;
    return { success: true, statusCode: 200, message: "OK", data: incident };
  },

  async createIncident(
    data: Omit<Incident, "id" | "incidentCode" | "comments">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Incident>> {
    await simulateLatency(options);
    const newIncident: Incident = {
      ...data,
      id: `inc-${Date.now()}`,
      incidentCode: `INC-2026-${String(incidents.length + 1).padStart(3, "0")}`,
      comments: [],
    };
    incidents.unshift(newIncident);
    saveIncidents(incidents);
    return { success: true, statusCode: 201, message: "Tạo sự cố thành công", data: newIncident };
  },

  async updateIncidentStatus(
    id: string,
    status: IncidentStatus,
    options?: MockServiceOptions
  ): Promise<ApiResponse<Incident | null>> {
    await simulateLatency(options);
    const incident = incidents.find((i) => i.id === id);
    if (incident) {
      incident.status = status;
      if (status === "RESOLVED") {
        incident.resolvedAt = new Date().toISOString();
      }
      saveIncidents(incidents);
    }
    return { success: true, statusCode: 200, message: "Cập nhật thành công", data: incident || null };
  },

  async addComment(
    incidentId: string,
    user: string,
    message: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<boolean>> {
    await simulateLatency(options);
    const incident = incidents.find((i) => i.id === incidentId);
    if (incident) {
      incident.comments.push({
        id: `cmt-${Date.now()}`,
        incidentId,
        user,
        message,
        createdAt: new Date().toISOString(),
      });
      saveIncidents(incidents);
    }
    return { success: true, statusCode: 200, message: "Thêm bình luận thành công", data: true };
  },
};
