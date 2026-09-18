import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Truck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Route,
  Zap,
  MapPin,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useAuthStore } from "@/shared/stores/authStore";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { authService } from "@/mocks/adapters/serviceFactory";
import { DEMO_ACCOUNTS, type DemoAccountItem } from "@/mocks/services/mockAuthService";
import { ENV } from "@/core/config/env";
import { zodResolver } from "@/shared/utils/zodResolver";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/shared/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";

// Schema Validation bằng Zod với thông báo hoàn toàn bằng tiếng Việt
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ email.")
    .email("Địa chỉ email không hợp lệ."),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu."),
  remember_me: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  usePageTitle("Đăng nhập");
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Khởi tạo React Hook Form kết hợp Zod Resolver
  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: ENV.USE_MOCK ? "dieuphoi@vietroute.vn" : "admin@vietroute.com",
      password: ENV.USE_MOCK ? "password123" : "123456",
      remember_me: true,
    },
  });

  // Xử lý gửi biểu mẫu đăng nhập
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authService.login({
        email: values.email,
        password: values.password,
        remember_me: rememberMe,
      });

      if (response.success && response.data) {
        // Lưu thông tin phiên đăng nhập vào Auth Store
        setAuth(response.data.user, response.data.access_token);

        // Điều hướng người dùng về trang trước đó hoặc /dashboard
        const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/dashboard";
        navigate(fromPath, { replace: true });
      } else {
        setErrorMessage(response.message || "Email hoặc mật khẩu không chính xác.");
      }
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setErrorMessage(apiErr?.message || "Không thể kết nối đến máy chủ VietRoute. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Chọn tài khoản dùng thử để kiểm tra phân quyền (RBAC Demo)
  const handleSelectDemoAccount = (account: DemoAccountItem) => {
    setValue("email", account.email);
    setValue("password", ENV.USE_MOCK ? account.defaultPassword : "123456");
    clearErrors();
    setErrorMessage(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-muted/30">
      {/* ========================================================================= */}
      {/* BÊN TRÁI: KHU VỰC NHẬN DIỆN THƯƠNG HIỆU & HẠ TẦNG LOGISTICS (DESKTOP)     */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 flex-col justify-between border-r border-border/80 bg-card p-10 xl:p-14 relative overflow-hidden select-none">
        {/* Nền đồ họa tuyến đường mờ tinh tế */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="logistics-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#logistics-grid)" />
          </svg>
        </div>

        {/* 1. Brand Logo & Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs ring-1 ring-white/20">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-foreground leading-none">
                  VietRoute
                </span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary tracking-wide">
                  TMS
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-1 leading-none">
                Quản lý vận hành logistics
              </p>
            </div>
          </div>
        </div>

        {/* 2. Middle Content: Giới thiệu hệ thống & Visual tuyến vận tải */}
        <div className="relative z-10 my-auto py-8 space-y-7">
          <div className="space-y-2.5">
            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-foreground leading-snug">
              Nền tảng điều phối vận tải & giám sát đội xe thông minh
            </h2>
            <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed">
              Quản lý đơn hàng, điều phối đội xe và theo dõi giao hàng theo thời gian thực.
            </p>
          </div>

          {/* Visual logistics tối giản: Sơ đồ hành lang vận chuyển Bắc - Trung - Nam */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground pb-2 border-b border-border/60">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Route className="h-4 w-4 text-primary" />
                Mạng lưới vận chuyển trục quốc gia
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Realtime kết nối
              </span>
            </div>

            {/* Sơ đồ 3 Trung tâm Logistics trọng điểm */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/60 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-semibold text-foreground">Hà Nội</span>
                  <span className="text-[11px] text-muted-foreground">Tổng kho Long Biên</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Hub Phía Bắc
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/60 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="font-semibold text-foreground">Đà Nẵng</span>
                  <span className="text-[11px] text-muted-foreground">Kho Trung chuyển Hòa Cầm</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Hub Miền Trung
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-card/80 border border-border/60 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="font-semibold text-foreground">TP. Hồ Chí Minh</span>
                  <span className="text-[11px] text-muted-foreground">Tổng kho Cát Lái</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Hub Phía Nam
                </span>
              </div>
            </div>

            {/* 3 Chỉ số vận hành tiêu chuẩn */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center">
              <div className="p-2 rounded-md bg-card/50 border border-border/40">
                <p className="font-mono font-bold text-primary text-xs">98.4%</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Chuẩn ETA</p>
              </div>
              <div className="p-2 rounded-md bg-card/50 border border-border/40">
                <p className="font-mono font-bold text-emerald-600 text-xs">24/7</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Giám sát GPS</p>
              </div>
              <div className="p-2 rounded-md bg-card/50 border border-border/40">
                <p className="font-mono font-bold text-foreground text-xs">AI Routing</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Tối ưu tải</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer bên trái */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-muted-foreground pt-4 border-t border-border/60">
          <span>VietRoute Enterprise TMS © 2026</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Hạ tầng vận hành doanh nghiệp
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BÊN PHẢI: CARD ĐĂNG NHẬP (TỐI GIẢN, HIỆN ĐẠI, CHUẨN DOANH NGHIỆP)         */}
      {/* ========================================================================= */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8 lg:p-12 min-h-screen">
        <Card className="w-full max-w-md border-border/80 shadow-md bg-card">
          <CardHeader className="space-y-1.5 pb-4">
            {/* Header thương hiệu nhỏ trên Mobile (khi cột trái ẩn) */}
            <div className="flex lg:hidden items-center gap-2.5 mb-2 pb-3 border-b border-border/60">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-foreground text-base">VietRoute</span>
                <span className="text-[10px] text-muted-foreground block">Quản lý vận hành logistics</span>
              </div>
            </div>

            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Đăng nhập
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Đăng nhập để truy cập hệ thống vận hành VietRoute.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Hộp cảnh báo lỗi khi đăng nhập không thành công */}
            {errorMessage && (
              <Alert variant="destructive" className="animate-in fade-in-50">
                <AlertCircle className="h-4 w-4" />
                <div className="flex flex-col gap-1 w-full ml-1">
                  <AlertTitle className="text-xs font-semibold text-destructive">
                    Đăng nhập không thành công.
                  </AlertTitle>
                  <AlertDescription className="text-[11px] text-destructive/90">
                    {errorMessage}
                  </AlertDescription>
                  <div className="mt-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setErrorMessage(null)}
                      className="h-6 px-2 text-[10px] font-medium border-destructive/30 text-destructive hover:bg-destructive/15 cursor-pointer"
                    >
                      Thử lại
                    </Button>
                  </div>
                </div>
              </Alert>
            )}

            {/* Biểu mẫu đăng nhập */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Field 1: Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email-input"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span>Email</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email-input"
                    type="email"
                    placeholder="Nhập địa chỉ email"
                    autoComplete="email"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`pl-9.5 h-10 text-xs rounded-lg transition-colors ${
                      errors.email ? "border-destructive focus-visible:ring-destructive/30" : ""
                    }`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1 animate-in fade-in-50"
                  >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Field 2: Mật khẩu */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password-input"
                  className="text-xs font-semibold text-foreground flex items-center justify-between"
                >
                  <span>Mật khẩu</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password-input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    disabled={isLoading}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={`pl-9.5 pr-10 h-10 text-xs rounded-lg transition-colors ${
                      errors.password ? "border-destructive focus-visible:ring-destructive/30" : ""
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0.5"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="text-[11px] text-destructive flex items-center gap-1 font-medium mt-1 animate-in fade-in-50"
                  >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Row: Ghi nhớ đăng nhập + Quên mật khẩu */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember_me"
                    checked={rememberMe}
                    disabled={isLoading}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                  />
                  <label
                    htmlFor="remember_me"
                    className="text-xs text-muted-foreground cursor-pointer select-none font-medium"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForgotDialog(true)}
                  className="text-xs font-medium text-primary hover:underline underline-offset-4 cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Nút Đăng nhập CTA */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 rounded-lg text-xs font-semibold cursor-pointer shadow-xs mt-2 transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </Button>
            </form>

            {/* ========================================================================= */}
            {/* KHU VỰC TÀI KHOẢN DÙNG THỬ PHỤC VỤ PHÁT TRIỂN / KIỂM THỬ                   */}
            {/* ========================================================================= */}
            <div className="pt-4 border-t border-border/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  {ENV.USE_MOCK ? "Tài khoản dùng thử (Mock Data)" : "Tài khoản mẫu PostgreSQL (Pass: 123456)"}
                </span>
              </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.role}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSelectDemoAccount(account)}
                      className="flex flex-col text-left p-2 rounded-md border border-border/60 bg-muted/20 hover:bg-accent/60 hover:border-border transition-colors cursor-pointer group disabled:opacity-50"
                      title={`Đăng nhập nhanh với vai trò: ${account.label} (${account.email})`}
                    >
                      <span className="text-[11px] font-semibold text-foreground group-hover:text-primary transition-colors">
                        {account.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
                        {account.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================================= */}
      {/* MODAL THÔNG BÁO QUÊN MẬT KHẨU                                             */}
      {/* ========================================================================= */}
      <Dialog open={showForgotDialog} onOpenChange={setShowForgotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Khôi phục mật khẩu nội bộ
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-2 leading-relaxed">
              Vì lý do an toàn bảo mật dữ liệu logistics doanh nghiệp, hệ thống VietRoute không cung cấp tính năng tự đặt lại mật khẩu qua email cá nhân.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>Quy trình hỗ trợ cấp lại thông tin:</span>
            </div>
            <p className="text-[11px] text-muted-foreground pl-6">
              Vui lòng liên hệ trực tiếp Bộ phận Quản trị Hệ thống hoặc Trưởng ca Điều phối qua hòm thư{" "}
              <span className="font-mono text-foreground font-semibold">admin@vietroute.vn</span> để được xác thực danh tính và cấp lại mật khẩu tạm thời.
            </p>
          </div>

          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setShowForgotDialog(false)}
              className="cursor-pointer text-xs"
            >
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
