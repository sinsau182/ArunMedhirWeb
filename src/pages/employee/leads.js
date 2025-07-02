import React, { useState, useEffect } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import LeadManagement from "../../components/LeadManagement";
import withAuth from "@/components/withAuth";

const Leads = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const currentRole = sessionStorage.getItem("currentRole");

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        currentRole={currentRole}
      />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />
        <div className="flex-1 overflow-y-auto">
          <LeadManagement role={currentRole} />
        </div>
      </div>
    </div>
  );
};

export default withAuth(Leads);
