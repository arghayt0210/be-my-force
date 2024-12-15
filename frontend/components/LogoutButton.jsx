"use client";

import useAuthStore from "@/store/useAuthStore";

export default function LogoutButton() {
  const { logout } = useAuthStore();
  return (
    <button
      onClick={() => {
        logout();
      }}
    >
      Logout{" "}
    </button>
  );
}
