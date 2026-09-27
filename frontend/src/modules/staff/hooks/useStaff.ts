import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/mocks/adapters/serviceFactory";
import type { StaffFilterParams, StaffMember, RolePermissionItem } from "../types/staff";
import { toast } from "@/shared/components/feedback/Toast";

export function useStaffList(filters?: StaffFilterParams) {
  return useQuery<StaffMember[]>({
    queryKey: ["staff", filters],
    queryFn: async () => {
      try {
        const res = await userService.getStaffList(filters);
        const data = (res as any)?.data || res;
        return Array.isArray(data) ? data : [];
      } catch (err: any) {
        toast.error("Không thể tải danh sách nhân sự", err?.message);
        return [];
      }
    },
    staleTime: 30 * 1000,
  });
}

export function useRoles() {
  return useQuery<RolePermissionItem[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      try {
        const res = await userService.getRoles();
        const data = (res as any)?.data || res;
        return Array.isArray(data) ? data : [];
      } catch (err: any) {
        toast.error("Không thể tải danh sách vai trò", err?.message);
        return [];
      }
    },
    staleTime: 60 * 1000,
  });
}

export function useStaffMutations() {
  const queryClient = useQueryClient();

  const createStaff = useMutation({
    mutationFn: (data: any) => userService.createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Thêm nhân viên mới thành công");
    },
    onError: (err: any) => {
      toast.error("Thêm nhân viên thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const updateStaff = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userService.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Cập nhật thông tin nhân viên thành công");
    },
    onError: (err: any) => {
      toast.error("Cập nhật nhân viên thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      userService.updateStaffStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(`Đã cập nhật trạng thái nhân viên thành ${variables.status}`);
    },
    onError: (err: any) => {
      toast.error("Đổi trạng thái thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const deleteStaff = useMutation({
    mutationFn: (id: string) => userService.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Đã xóa nhân viên khỏi hệ thống");
    },
    onError: (err: any) => {
      toast.error("Xóa nhân viên thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const updateRolePermissions = useMutation({
    mutationFn: ({ roleId, permissions, description }: { roleId: string; permissions: string[]; description?: string }) =>
      userService.updateRolePermissions(roleId, permissions, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Đã lưu ma trận phân quyền thành công");
    },
    onError: (err: any) => {
      toast.error("Lưu phân quyền thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const createRole = useMutation({
    mutationFn: (data: { name: string; description?: string; permissions?: string[] }) =>
      userService.createRole(data),
    onSuccess: (newRole: any) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      const roleName = newRole?.name || newRole?.data?.name || "mới";
      toast.success("Tạo vai trò thành công", `Đã tạo vai trò "${roleName}"`);
    },
    onError: (err: any) => {
      toast.error("Tạo vai trò thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string; permissions?: string[] } }) =>
      userService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Cập nhật vai trò thành công");
    },
    onError: (err: any) => {
      toast.error("Cập nhật vai trò thất bại", err?.response?.data?.message || err?.message);
    },
  });

  const deleteRole = useMutation({
    mutationFn: (id: string) => userService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Đã xóa vai trò thành công");
    },
    onError: (err: any) => {
      toast.error("Xóa vai trò thất bại", err?.response?.data?.message || err?.message);
    },
  });

  return {
    createStaff,
    updateStaff,
    updateStatus,
    deleteStaff,
    createRole,
    updateRole,
    deleteRole,
    updateRolePermissions,
  };
}
