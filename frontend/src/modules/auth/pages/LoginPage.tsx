import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/authStore";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Lock, Mail, Truck } from "lucide-react";
import type { UserRole } from "@/core/types/auth";

export const LoginPage: React.FC = () => {
  usePageTitle("Đăng nhập");
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = React.useState("dieuphoi@vietroute.vn");
  const [password, setPassword] = React.useState("123456");

  const [role, setRole] = React.useState<UserRole>("DISPATCHER");

  const DEMO_ACCOUNTS: { role: UserRole; name: string; email: string; label: string }[] = [
    { role: "DISPATCHER", name: "Nguyễn Minh Anh", email: "dieuphoi@vietroute.vn", label: "Điều phối viên" },
    { role: "MANAGER", name: "Trần Quốc Toàn", email: "quanly@vietroute.vn", label: "Quản lý" },
    { role: "DRIVER", name: "Phạm Văn Hoàng", email: "taixe@vietroute.vn", label: "Tài xế" },
    { role: "WAREHOUSE_STAFF", name: "Lê Thị Mai", email: "kho@vietroute.vn", label: "Nhân viên kho" },
    { role: "ADMIN", name: "Quản trị hệ thống", email: "admin@vietroute.vn", label: "Quản trị viên" },
  ];

  const handleSelectDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setRole(acc.role);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentAccount = DEMO_ACCOUNTS.find((a) => a.role === role) || DEMO_ACCOUNTS[0];

    setAuth(
      {
        id: `usr-${role.toLowerCase()}-01`,
        email,
        full_name: currentAccount.name,
        role,
        status: "ACTIVE",
      },
      "mock_access_token_vietroute_2026"
    );
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-3 shadow-sm">
            <Truck className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">VietRoute Enterprise</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hệ thống quản lý giao hàng và điều phối xe thông minh
          </p>
        </div>

        {/* Lựa chọn vai trò nhanh để kiểm tra phân quyền */}
        <div className="mb-5 rounded-md border border-border/80 bg-muted/30 p-3">
          <p className="text-[11px] font-semibold text-muted-foreground mb-2">
            Chọn vai trò mẫu để kiểm tra phân quyền (RBAC):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleSelectDemo(acc)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  role === acc.role
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-background text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email đăng nhập</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                placeholder="example@vietroute.vn"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2 cursor-pointer">
            Đăng nhập với vai trò {DEMO_ACCOUNTS.find((a) => a.role === role)?.label}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          VietRoute © 2026 — Nền tảng điều phối vận tải thông minh
        </div>
      </div>
    </div>
  );
};
