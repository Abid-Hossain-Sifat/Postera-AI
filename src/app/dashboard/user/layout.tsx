import React from "react";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-160px)] bg-slate-950 text-slate-100">
      {children}
    </div>
  );
}
