import React, { useState } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import LeadManagement from "../../components/LeadManagement";
import withAuth from "@/components/withAuth";

const Leads = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        // currentRole={"MANAGER"}
      />

    <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />
        <div className="flex-1 overflow-y-auto">
          <LeadManagement role={"MANAGER"} />
        </div>
      </div>
    </div>
  );
};

export default withAuth(Leads); 