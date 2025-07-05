/* eslint-disable react/jsx-key */
import React, { useCallback, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { FaUsers, FaMoneyBillWave, FaChartLine, FaPlus, FaExternalLinkAlt, FaBell, FaUserClock, FaRegCommentDots, FaPhoneSlash, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import RequestDetails from "@/components/RequestDetails";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { useSelector, useDispatch } from "react-redux";
// import { fetchEmployees } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { toast } from "sonner";
import getConfig from "next/config";
import {
  fetchExpenseRequests,
  fetchIncomeRequests,
} from "@/redux/slices/requestDetailsSlice";
import Link from "next/link";


// MOCK DATA FOR SALES DASHBOARD - Replace with actual data fetching
const MOCK_LEADS_DATA = [
  { status: 'New', count: 12 },
  { status: 'Contacted', count: 8 },
  { status: 'Qualified', count: 5 },
  { status: 'Quoted', count: 3 },
  { status: 'Converted', count: 2 },
];

const MOCK_TEAM_PERFORMANCE = [
  { name: 'Alice', converted: 12, revenue: 150000 },
  { name: 'Bob', converted: 9, revenue: 120000 },
  { name: 'Charlie', converted: 7, revenue: 95000 },
  { name: 'Dana', converted: 5, revenue: 75000 },
];

const MOCK_ACTIVITIES = [
    { type: 'missed_call', text: 'Alice missed a scheduled call with "Innovate Inc."', time: '1 hour ago' },
    { type: 'stale_lead', text: 'Bob has no updates on "Global Corp" for 4 days.', time: '3 hours ago' },
    { type: 'deal_won', text: 'Alice closed the deal with "Innovate Inc."', time: '2 hours ago' },
    { type: 'new_lead', text: 'A new lead "Tech Solutions" was assigned to Bob.', time: '5 hours ago' },
    { type: 'stage_change', text: 'Charlie moved "Global Corp" to the "Quoted" stage.', time: '1 day ago' },
    { type: 'note_added', text: 'You added a note to "Innovate Inc.".', time: '2 days ago' },
];

const MOCK_UNASSIGNED_LEADS = [
    { id: 'LEAD201', name: 'Lead A', projectType: 'Residential', submittedBy: 'emp123' },
    { id: 'LEAD202', name: 'Lead B', projectType: 'Commercial', submittedBy: 'emp124' },
    { id: 'LEAD203', name: 'Lead C', projectType: 'Residential', submittedBy: 'emp125' },
];

const salesPersons = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'Dana' },
];

const SalesKPI = ({ icon, label, value, currency = false, onClick }) => (
  <div 
    className={`bg-white p-6 rounded-lg shadow-md flex items-center gap-4 border border-gray-200 ${onClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
    onClick={onClick}
  >
    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {currency && '₹'}{typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

const ActivityIcon = ({ type }) => {
    const iconStyle = "w-5 h-5";
    switch (type) {
        case 'missed_call':
            return <FaPhoneSlash className={`${iconStyle} text-yellow-600`} />;
        case 'stale_lead':
            return <FaExclamationTriangle className={`${iconStyle} text-red-600`} />;
        case 'deal_won':
            return <FaMoneyBillWave className={`${iconStyle} text-green-600`} />;
        case 'new_lead':
            return <FaUserClock className={`${iconStyle} text-blue-600`} />;
        default:
            return <FaRegCommentDots className={`${iconStyle} text-gray-500`} />;
    }
};

const SalesDashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingCompOffs, setPendingCompOffs] = useState([]);
  const [profileUpdates, setProfileUpdates] = useState([]);
  const [unassignedLeads, setUnassignedLeads] = useState(MOCK_UNASSIGNED_LEADS);
  const [selectedSalesRep, setSelectedSalesRep] = useState({});

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const handleOpenRequestsClick = () => {
    setShowRequestDetails(prev => !prev);
  };

  // --- Start of logic from old dashboard ---
  const publicRuntimeConfig = getConfig().publicRuntimeConfig;

  const fetchProfileUpdates = useCallback(async () => {
    // Mocking this for now as it's not the core sales focus
    setProfileUpdates([]);
  }, []);
  
  const fetchPendingRequests = useCallback(async () => {
    // Mocking this for now
    setPendingLeaves([]);
    setPendingCompOffs([]);
  }, []);

  useEffect(() => {
    fetchPendingRequests();
    fetchProfileUpdates();
  }, [fetchPendingRequests, fetchProfileUpdates]);
  
  const refreshRequests = useCallback(async () => {
    await fetchPendingRequests();
    await fetchProfileUpdates();
  }, [fetchPendingRequests, fetchProfileUpdates]);
  // --- End of logic from old dashboard ---

  const handleAssignLead = (leadId) => {
    const repName = selectedSalesRep[leadId];
    if (!repName) {
        toast.error("Please select a Sales Rep to assign.");
        return;
    }
    setUnassignedLeads(prev => prev.filter(lead => lead.id !== leadId));
    toast.success(`Lead ${leadId} assigned to ${repName}.`);
    // In a real app, an API call would be made here.
  };

  // These would be calculated from your actual leads data
  const totalLeads = 65;
  const newLeadsThisMonth = 22;
  const conversionRate = "18%";
  const totalRevenue = 485000;
  const openRequestsCount = pendingLeaves.length + pendingCompOffs.length + profileUpdates.length;

  if (showRequestDetails) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Administrative Requests</h2>
                    <button onClick={() => setShowRequestDetails(false)} className="text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <RequestDetails refreshRequests={refreshRequests} />
                </div>
                 <div className="bg-gray-50 px-6 py-3 flex justify-end items-center rounded-b-lg">
                    <button onClick={() => setShowRequestDetails(false)} className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Sales Dashboard</h1>
                <div className="flex gap-4">
                    <Link href="/SalesManager/Manager" className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                        <FaExternalLinkAlt /> View All Leads
                    </Link>
                    <Link href="/SalesManager/Manager" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                        <FaPlus /> Add New Lead
                    </Link>
                </div>
            </header>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SalesKPI icon={<FaUsers size={24}/>} label="Total Leads in Pipeline" value={totalLeads} />
                <SalesKPI icon={<FaChartLine size={24}/>} label="New Leads This Month" value={newLeadsThisMonth} />
                <SalesKPI icon={<FaMoneyBillWave size={24}/>} label="Total Revenue Won" value={totalRevenue} currency={true} />
                <SalesKPI icon={<FaBell size={24}/>} label="Open Admin Requests" value={openRequestsCount} onClick={handleOpenRequestsClick} />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-8">
                    {/* Pipeline Stages Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Pipeline Stages</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={MOCK_LEADS_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="status" tick={{fontSize: 12}} />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                                <Bar dataKey="count" fill="#3B82F6" name="Leads" barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Unassigned Leads */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Unassigned Leads</h3>
                        <div className="space-y-4">
                            {unassignedLeads.length > 0 ? unassignedLeads.map((lead) => (
                                <div key={lead.id} className="flex flex-wrap items-center justify-between gap-4 p-3 bg-gray-50 rounded-md border">
                                    <div>
                                        <p className="font-semibold text-gray-800">{lead.name}</p>
                                        <p className="text-sm text-gray-500">{lead.projectType}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            onChange={(e) => setSelectedSalesRep(prev => ({...prev, [lead.id]: e.target.value}))}
                                            className="p-2 border border-gray-300 rounded-md shadow-sm text-sm"
                                        >
                                            <option value="">Assign to...</option>
                                            {salesPersons.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                        </select>
                                        <button 
                                            onClick={() => handleAssignLead(lead.id)}
                                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                        >
                                            Assign
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center py-4">No unassigned leads.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                     {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Recent Activity / Alerts</h3>
                        <div className="space-y-4">
                            {MOCK_ACTIVITIES.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2.5 rounded-full mt-1">
                                        <ActivityIcon type={activity.type} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-700">{activity.text}</p>
                                        <p className="text-xs text-gray-400">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Team Leaderboard */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Team Leaderboard</h3>
                        <div className="space-y-4">
                            {MOCK_TEAM_PERFORMANCE.map((member, index) => (
                                <div key={member.name} className="flex items-center gap-4">
                                    <div className="text-gray-400 font-bold w-6">{index + 1}</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{member.name}</p>
                                        <p className="text-sm text-gray-500">{member.converted} deals converted</p>
                                    </div>
                                    <div className="font-bold text-green-600">₹{member.revenue.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SalesDashboard, ["MANAGER", "SALESMANAGER"]);
