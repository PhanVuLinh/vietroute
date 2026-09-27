import React, { useState, useEffect } from "react";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { PageContainer } from "@/shared/components/layout/PageContainer";
import {
  ShieldCheck,
  Warehouse,
  Waypoints,
  Boxes,
  Truck,
  Wallet,
  Building2,
  Check,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  Info,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useRoles, useStaffMutations } from "../hooks/useStaff";
import { SYSTEM_PERMISSIONS } from "../types/staff";
import { DEFAULT_ROLE_PERMISSIONS } from "@/mocks/services/mockRolePermissions";
import { toast } from "@/shared/components/feedback/Toast";

export const RolesPage: React.FC = () => {
  usePageTitle("Phân quyền & Vai trò (RBAC)");

  const { data: roles = [] } = useRoles();
  const { updateRolePermissions } = useStaffMutations();

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // Chọn role đầu tiên khi dữ liệu tải xong
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
      setCurrentPermissions(roles[0].permissions || []);
    }
  }, [roles, selectedRoleId]);

  const activeRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const handleSelectRole = (roleId: string) => {
    if (hasChanges) {
      if (!window.confirm("Bạn có các thay đổi chưa lưu trên vai trò hiện tại. Tiếp tục chuyển?")) {
        return;
      }
    }
    setSelectedRoleId(roleId);
    const r = roles.find((x) => x.id === roleId);
    setCurrentPermissions(r?.permissions || []);
    setHasChanges(false);
  };

  const handleTogglePermission = (key: string) => {
    setCurrentPermissions((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];
      setHasChanges(true);
      return next;
    });
  };

  const handleToggleCategory = (categoryKeys: string[], selectAll: boolean) => {
    setCurrentPermissions((prev) => {
      let next = [...prev];
      if (selectAll) {
        // Thêm tất cả khóa chưa có
        for (const k of categoryKeys) {
          if (!next.includes(k)) next.push(k);
        }
      } else {
        // Bỏ tất cả khóa trong nhóm
        next = next.filter((k) => !categoryKeys.includes(k));
      }
      setHasChanges(true);
      return next;
    });
  };

  const handleResetToDefault = () => {
    if (!activeRole) return;
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[activeRole.name] || [];
    setCurrentPermissions(defaultPerms);
    setHasChanges(true);
    toast.info("Đã khôi phục quyền mặc định theo chuẩn phân hệ VietRoute");
  };

  const handleSave = async () => {
    if (!activeRole) return;
    try {
      await updateRolePermissions.mutateAsync({
        roleId: activeRole.id,
        permissions: currentPermissions,
      });
      setHasChanges(false);
    } catch (e) {
      // toast error handled in hook
    }
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case "ADMIN":
        return <ShieldCheck className="h-4 w-4 text-rose-500" />;
      case "MANAGER":
        return <Warehouse className="h-4 w-4 text-amber-500" />;
      case "DISPATCHER":
        return <Waypoints className="h-4 w-4 text-blue-500" />;
      case "WAREHOUSE_STAFF":
        return <Boxes className="h-4 w-4 text-teal-500" />;
      case "DRIVER":
        return <Truck className="h-4 w-4 text-emerald-500" />;
      case "ACCOUNTANT":
        return <Wallet className="h-4 w-4 text-indigo-500" />;
      default:
        return <Building2 className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span>Phân quyền & Vai trò (RBAC)</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Cấu hình ma trận phân quyền chi tiết cho từng vai trò vận hành trong hệ thống VietRoute
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToDefault}
              className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Khôi phục mặc định</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || updateRolePermissions.isPending}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{updateRolePermissions.isPending ? "Đang lưu..." : "Lưu ma trận phân quyền"}</span>
            </Button>
          </div>
        </div>

        {/* Danh sách Thẻ Vai trò (Role Selector Bar) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {roles.map((r) => {
            const isSelected = activeRole?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleSelectRole(r.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? "bg-primary/10 border-primary shadow-xs ring-1 ring-primary/40"
                    : "bg-card hover:bg-muted/50 border-border"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {getRoleIcon(r.name)}
                    <span className="font-bold text-xs text-foreground truncate">
                      {r.name}
                    </span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-foreground line-clamp-1">
                    {r.displayName || r.name}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Nhân sự:</span>
                    <strong className="font-mono text-foreground">{r.userCount} người</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thông tin vai trò đang cấu hình */}
        {activeRole && (
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                {getRoleIcon(activeRole.name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    Vai trò: {activeRole.displayName || activeRole.name} ({activeRole.name})
                  </h3>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                    {currentPermissions.length} quyền được cấp
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activeRole.description}
                </p>
              </div>
            </div>

            {hasChanges && (
              <Badge className="bg-amber-500 text-white text-[10px] px-2 py-0.5 self-start sm:self-center">
                Có thay đổi chưa lưu
              </Badge>
            )}
          </div>
        )}

        {/* Ma trận phân quyền theo nhóm tính năng */}
        <div className="space-y-4">
          {SYSTEM_PERMISSIONS.map((group) => {
            const groupKeyList = group.permissions.map((p) => p.key);
            const activeInGroup = groupKeyList.filter((k) => currentPermissions.includes(k));
            const isAllSelected = activeInGroup.length === groupKeyList.length;

            return (
              <Card key={group.categoryKey} className="border-border shadow-2xs overflow-hidden">
                <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border flex flex-row items-center justify-between space-y-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xs sm:text-sm font-bold text-foreground">
                      {group.categoryLabel}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-border">
                      {activeInGroup.length}/{groupKeyList.length}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCategory(groupKeyList, !isAllSelected)}
                      className="h-7 px-2 text-[11px] gap-1 text-primary cursor-pointer hover:bg-primary/10"
                    >
                      {isAllSelected ? (
                        <>
                          <Square className="h-3 w-3" />
                          Bỏ chọn nhóm
                        </>
                      ) : (
                        <>
                          <CheckSquare className="h-3 w-3" />
                          Chọn tất cả nhóm
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {group.permissions.map((perm) => {
                      const isChecked = currentPermissions.includes(perm.key);
                      return (
                        <div
                          key={perm.key}
                          onClick={() => handleTogglePermission(perm.key)}
                          className={`p-3 rounded-lg border transition-all cursor-pointer select-none flex items-start gap-3 ${
                            isChecked
                              ? "bg-primary/5 border-primary/30"
                              : "bg-background hover:bg-muted/40 border-border/70 opacity-75"
                          }`}
                        >
                          <div
                            className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                              isChecked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/40 bg-background"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>

                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-xs font-semibold ${
                                  isChecked ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {perm.label}
                              </span>
                              <span className="text-[9px] font-mono text-muted-foreground/80 shrink-0">
                                {perm.key}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Footer info & save reminder */}
        <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>
              Các thay đổi về phân quyền sẽ có hiệu lực tức thì đối với các phiên đăng nhập mới của người dùng thuộc vai trò này.
            </span>
          </div>

          {hasChanges && (
            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold cursor-pointer shrink-0 ml-2"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Lưu thay đổi</span>
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
