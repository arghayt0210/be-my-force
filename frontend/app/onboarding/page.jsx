// app/dashboard/page.js
"use client";

import { FiLogOut } from "react-icons/fi";
import ProtectedRoute from "@/components/ProtectedRoute";
import useAuthStore from "@/store/useAuthStore";

export default function Onboarding() {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <FiLogOut />
              Logout
            </button>
          </div>

          {user && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">
                Welcome, {user.full_name}!
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Username</p>
                  <p>{user.username}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
