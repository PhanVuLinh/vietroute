import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/core/types/auth";
import { removeStoredToken, setStoredToken, registerUnauthorizedHandler } from "@/core/http/client";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        setStoredToken(token);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        removeStoredToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "vietroute_auth_store",
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Đồng bộ tự động: khi client nhận lỗi 401 Unauthorized từ bất kỳ API nào, kích hoạt logout
registerUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});
