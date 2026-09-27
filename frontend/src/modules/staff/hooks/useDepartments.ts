import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "@/mocks/adapters/serviceFactory";
import type {
  DepartmentItem,
  DepartmentFilterParams,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "../types/department";
import { toast } from "@/shared/components/feedback/Toast";

export const useDepartmentList = (params?: DepartmentFilterParams) => {
  return useQuery<DepartmentItem[]>({
    queryKey: ["departments", params],
    queryFn: async () => {
      const res = await departmentService.getDepartments(params);
      return Array.isArray(res) ? res : ((res as any)?.data || []);
    },
    staleTime: 60 * 1000,
  });
};

export const useDepartmentMutations = () => {
  const queryClient = useQueryClient();

  const createDepartment = useMutation({
    mutationFn: async (data: CreateDepartmentInput) => {
      return await departmentService.createDepartment(data);
    },
    onSuccess: (newDept: any) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      const deptName = newDept?.name || newDept?.data?.name || "mới";
      toast.success("Tạo phòng ban thành công", `Đã thêm phòng ban "${deptName}" vào cơ cấu`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Không thể tạo phòng ban";
      toast.error("Lỗi tạo phòng ban", msg);
    },
  });

  const updateDepartment = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateDepartmentInput }) => {
      return await departmentService.updateDepartment(id, data);
    },
    onSuccess: (updatedDept: any) => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      const deptName = updatedDept?.name || updatedDept?.data?.name || "";
      toast.success("Cập nhật thành công", `Đã cập nhật thông tin phòng ban "${deptName}"`);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Không thể cập nhật phòng ban";
      toast.error("Lỗi cập nhật", msg);
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: async (id: string) => {
      return await departmentService.deleteDepartment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Xóa phòng ban", "Đã xóa phòng ban khỏi hệ thống cơ cấu");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Không thể xóa phòng ban";
      toast.error("Lỗi xóa phòng ban", msg);
    },
  });

  return {
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};
