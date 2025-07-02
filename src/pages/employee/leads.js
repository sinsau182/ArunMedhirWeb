import React, { useState, useEffect } from "react";
import LeadManagement from "../../components/LeadManagement";
import withAuth from "@/components/withAuth";
import MainLayout from "@/components/MainLayout";

const Leads = () => {
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    setCurrentRole(sessionStorage.getItem("currentRole"));
  }, []);

  return (
    <MainLayout>
      <div className="h-full">
        <LeadManagement role={currentRole} />
      </div>
    </MainLayout>
  );
};

export default withAuth(Leads);
