import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/shared/stores/authStore";
import { getStoredToken } from "@/core/http/client";
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
  const { user, isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    // Khôi phục phiên làm việc từ LocalStorage nếu có token
    const token = getStoredToken();
    if (token && !user) {
      // Thiết lập phiên mặc định cho chế độ phát triển ban đầu
      const fallbackUser: AuthUser = {
        id: "usr-dispatch-01",
        email: "dieuphoi@vietroute.vn",
        full_name: "Nguyễn Minh Anh",
        role: "DISPATCHER",
        status: "ACTIVE",
      };
      setAuth(fallbackUser, token);
    }
  }, [user, setAuth]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading: false }}>
      {children}
    </AuthContext.Provider>
  );
};
