import React from "react";
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { DepartmentItem } from "../types/department";

interface DepartmentTableProps {
  departments: DepartmentItem[];
  onEdit: (dept: DepartmentItem) => void;
  onDelete: (dept: DepartmentItem) => void;
  isLoading?: boolean;
}

export const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-2xs">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground mt-3">Đang tải danh sách phòng ban cơ cấu...</p>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center shadow-2xs">
        <Building2 className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-semibold text-foreground">Không tìm thấy phòng ban nào</p>
        <p className="text-xs text-muted-foreground mt-1">
          Hãy thử đổi từ khóa tìm kiếm hoặc tạo phòng ban mới cho cơ cấu tổ chức
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <th className="py-3 px-4 w-[140px]">Mã phòng</th>
              <th className="py-3 px-4 min-w-[220px]">Tên phòng ban & Chức năng</th>
              <th className="py-3 px-4 min-w-[200px]">Trưởng phòng / Phụ trách</th>
              <th className="py-3 px-4 min-w-[160px]">Cơ sở / Địa điểm</th>
              <th className="py-3 px-4 w-[110px] text-center">Nhân sự</th>
              <th className="py-3 px-4 w-[120px] text-center">Trạng thái</th>
              <th className="py-3 px-4 w-[80px] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {departments.map((dept) => {
              const isActive = dept.status === "ACTIVE";

              return (
                <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                  {/* Mã phòng */}
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="font-mono text-[11px] font-semibold border-border">
                      {dept.code}
                    </Badge>
                  </td>

                  {/* Tên phòng ban & Chức năng */}
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-foreground text-xs">{dept.name}</p>
                        {dept.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {dept.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Trưởng phòng / Phụ trách */}
                  <td className="py-3 px-4">
                    {dept.headName ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-500/10 text-blue-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {dept.headName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{dept.headName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            {dept.headPhone && (
                              <span className="flex items-center gap-0.5">
                                <Phone className="h-2.5 w-2.5" />
                                {dept.headPhone}
                              </span>
                            )}
                            {dept.headEmail && (
                              <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                                <Mail className="h-2.5 w-2.5" />
                                {dept.headEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Chưa bổ nhiệm
                      </span>
                    )}
                  </td>

                  {/* Địa điểm */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                      <span className="truncate">{dept.location || "Trụ sở chính"}</span>
                    </div>
                  </td>

                  {/* Số lượng nhân sự */}
                  <td className="py-3 px-4 text-center">
                    <Badge
                      variant="outline"
                      className="font-mono text-[11px] px-2 py-0.5 gap-1 border-border font-medium"
                    >
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{dept.memberCount || 0}</span>
                    </Badge>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3 px-4 text-center">
                    {isActive ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 px-1.5 py-0.5">
                        <CheckCircle2 className="h-3 w-3" />
                        Hoạt động
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1 px-1.5 py-0.5">
                        <XCircle className="h-3 w-3" />
                        Tạm ngưng
                      </Badge>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem onClick={() => onEdit(dept)} className="gap-2">
                          <Edit2 className="h-3.5 w-3.5 text-blue-500" />
                          <span>Chỉnh sửa thông tin</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(dept)}
                          className="gap-2 text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Xóa phòng ban</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
