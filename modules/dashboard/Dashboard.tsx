"use client";

import { CalendarCheck, Car, Building2, Users } from "lucide-react";
import { StatCard } from "./components/StatCard";
import { AvailableBookings } from "./components/RecentBookingTable";
import { DriverListCard } from "./components/DriverListCard";
import { AvailableVehicleTable } from "./components/AvailableVehicleTable";
import { AvailableRoomTable } from "./components/AvailableRoomTable";
import { useDashboardSummary } from "./hooks/useDashboard";
import { useAuthStore } from "@/store/auth.store";

// ─────────────────────────────────────────
// STAT CARDS ROW
// ─────────────────────────────────────────

const StatCards = () => {
  const { data } = useDashboardSummary();
  const sum = data;

  const stats = [
    {
      label: "Total Booking",
      value: sum?.total_bookings ?? "—",
      icon: <CalendarCheck className="h-5 w-5 text-[var(--primary)]" />,
      iconBg: "var(--primary-light)",
    },
    {
      label: "Total Kendaraan",
      value: sum?.total_vehicles ?? "—",
      icon: <Car className="h-5 w-5 text-[#16A34A]" />,
      iconBg: "#DCFCE7",
    },
    {
      label: "Total Ruangan",
      value: sum?.total_rooms ?? "—",
      icon: <Building2 className="h-5 w-5 text-[#0284C7]" />,
      iconBg: "#DBEAFE",
    },
    {
      label: "Total Driver",
      value: sum?.total_drivers ?? "—",
      icon: <Users className="h-5 w-5 text-[#D97706]" />,
      iconBg: "#FEF9C3",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
    </div>
  );
};
export const DashboardPage = () => {
  const isAdmin = useAuthStore((s) => s.isAdmin());
  return (
    <div className="flex flex-col gap-6">
      {isAdmin && <StatCards />}
      
      {/* Financial-Dashboard Style Asymmetric Grid */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Main Content Area (wider) */}
        <div className="flex flex-col gap-6 flex-grow xl:w-2/3">
          <AvailableBookings />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AvailableVehicleTable />
            <AvailableRoomTable />
          </div>
        </div>

        {/* Sidebar Area (narrower) */}
        <div className="xl:w-1/3 flex flex-col gap-6">
          <DriverListCard />
          {/* We can place other sidebar items here in the future like a quick calendar or small charts */}
        </div>
        
      </div>
    </div>
  );
};
