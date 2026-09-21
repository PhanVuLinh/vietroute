import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/shared/stores/authStore";
import { getStoredToken } from "@/core/http/client";
import { ENV } from "@/core/config/env";
import type { AuthUser } from "@/core/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsLoading(false);
      return;
    }

    if (user && isAuthenticated) {
      // Đã có user trong store (Zustand persist), không cần verify lại
      setIsLoading(false);
      return;
    }

    if (ENV.USE_MOCK) {
      // Chế độ Mock: dùng fallback user cho phát triển nhanh
      const fallbackUser: AuthUser = {
        id: "usr-dispatch-01",
        email: "dieuphoi@vietroute.vn",
        full_name: "Nguyễn Minh Anh",
        role: "DISPATCHER",
        status: "ACTIVE",
      };
      setAuth(fallbackUser, token);
      setIsLoading(false);
    } else {
      // Chế độ Real DB: verify JWT token với backend
      fetch(`${ENV.API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token invalid");
          return res.json();
        })
        .then((data) => {
          if (data.success && data.data) {
            setAuth(data.data, token);
          } else {
            logout();
          }
        })
        .catch(() => {
          // Token hết hạn hoặc không hợp lệ → buộc đăng nhập lại
          logout();
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, isAuthenticated, setAuth, logout]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

