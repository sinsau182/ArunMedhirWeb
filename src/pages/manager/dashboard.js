/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import {
  FaUsers,
  FaBullseye,
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaExclamationCircle,
  FaHourglassHalf,
  FaUserPlus,
  FaChartPie,
  FaExternalLinkAlt,
  FaFilter,
  FaCrown,
  FaPlus,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaStickyNote,
  FaHandshake,
  FaArrowRight,
  FaClock,
} from 'react-icons/fa';
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
} from 'recharts';
import MainLayout from '@/components/MainLayout';
import AddLeadModal from '@/components/Sales/AddLeadModal';
import Link from 'next/link';
import { toast } from 'sonner';

// --- MOCK DATA (Replace with API data) ---
const MOCK_DATA = {
  kpis: {
    newLeads: { value: 42, change: 15 },
    conversionRate: { value: '18%', convertedCount: 12, change: -2 },
    avgDealValue: { value: 250000, change: 10 },
    revenueWon: { value: 1250000, change: 25 },
  },
  actionCenter: {
    unassignedLeads: [
      { id: 'L401', name: 'Innovate Corp', source: 'Website' },
      { id: 'L402', name: 'Global Tech', source: 'Referral' },
    ],
    overdueActivities: [
      { id: 'L205', name: 'Quantum Solutions', task: 'Follow-up call', overdueBy: '2 days' },
      { id: 'L112', name: 'Vertex Industries', task: 'Send proposal', overdueBy: '5 days' },
    ],
    staleLeads: [
      { id: 'L150', name: 'Apex Enterprises', lastActivity: '10 days ago' },
    ],
  },
  recentActivities: [
    {
      id: 1,
      type: 'call',
      leadName: 'Innovate Corp',
      leadId: 'L401',
      description: 'Alice completed a follow-up call',
      timestamp: '2 minutes ago',
      user: 'Alice'
    },
    {
      id: 2,
      type: 'stage_change',
      leadName: 'Global Tech',
      leadId: 'L402',
      description: 'Bob moved lead from "Contacted" to "Qualified"',
      timestamp: '15 minutes ago',
      user: 'Bob'
    },
    {
      id: 3,
      type: 'email',
      leadName: 'Quantum Solutions',
      leadId: 'L205',
      description: 'Charlie sent proposal email',
      timestamp: '1 hour ago',
      user: 'Charlie'
    },
    {
      id: 4,
      type: 'meeting',
      leadName: 'Vertex Industries',
      leadId: 'L112',
      description: 'Dana scheduled site visit for tomorrow',
      timestamp: '2 hours ago',
      user: 'Dana'
    },
    {
      id: 5,
      type: 'note',
      leadName: 'Apex Enterprises',
      leadId: 'L150',
      description: 'Alice added budget discussion notes',
      timestamp: '3 hours ago',
      user: 'Alice'
    },
    {
      id: 6,
      type: 'conversion',
      leadName: 'Prime Solutions',
      leadId: 'L301',
      description: 'Bob converted lead to customer (₹3,50,000)',
      timestamp: '4 hours ago',
      user: 'Bob'
    }
  ],
  pipelineForecast: {
    funnel: [
      { name: 'New', value: 150 },
      { name: 'Contacted', value: 110 },
      { name: 'Qualified', value: 70 },
      { name: 'Quoted', value: 45 },
      { name: 'Converted', value: 25 },
    ],
    forecast: [
      { stage: 'Qualified', value: 5000000, probability: '25%', forecastValue: 1250000 },
      { stage: 'Quoted', value: 3000000, probability: '60%', forecastValue: 1800000 },
      { stage: 'Negotiation', value: 1500000, probability: '80%', forecastValue: 1200000 },
    ],
  },
  teamPerformance: {
    leaderboard: [
      { rank: 1, name: 'Alice', dealsWon: 12, activities: 150 },
      { rank: 2, name: 'Bob', dealsWon: 9, activities: 120 },
      { rank: 3, name: 'Charlie', dealsWon: 7, activities: 95 },
    ],
    sourcePerformance: [
      { name: 'Website', value: 400 },
      { name: 'Referral', value: 300 },
      { name: 'Social Media', value: 200 },
      { name: 'Cold Call', value: 100 },
    ],
  },
};

const salesPersons = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Dana' },
  ];

const designers = [
  { id: 1, name: 'Bob' },
  { id: 2, name: 'Dana' },
  { id: 3, name: 'Frank' },
  { id: 4, name: 'Jack' },
];

const defaultLeadData = {
  name: "",
  contactNumber: "",
  email: "",
  projectType: "",
  propertyType: "",
  address: "",
  area: "",
  budget: "",
  designStyle: "",
  leadSource: "",
  preferredContact: "",
  notes: "",
  status: "New",
  rating: 0,
  salesRep: null,
  designer: null,
  callDescription: null,
  callHistory: [],
  nextCall: null,
  quotedAmount: null,
  finalQuotation: null,
  signupAmount: null,
  paymentDate: null,
  paymentMode: null,
  panNumber: null,
  discount: null,
  reasonForLost: null,
  reasonForJunk: null,
  submittedBy: null,
  paymentDetailsFileName: null,
  bookingFormFileName: null,
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- Helper Functions ---
function getActivityIcon(type) {
  const iconClass = "w-4 h-4";
  switch (type) {
    case 'call':
      return <FaPhoneAlt className={`${iconClass} text-blue-600`} />;
    case 'email':
      return <FaEnvelope className={`${iconClass} text-green-600`} />;
    case 'meeting':
      return <FaCalendarAlt className={`${iconClass} text-purple-600`} />;
    case 'note':
      return <FaStickyNote className={`${iconClass} text-yellow-600`} />;
    case 'stage_change':
      return <FaArrowRight className={`${iconClass} text-orange-600`} />;
    case 'conversion':
      return <FaHandshake className={`${iconClass} text-green-700`} />;
    default:
      return <FaClock className={`${iconClass} text-gray-500`} />;
  }
}

// --- Reusable Components ---
function KpiCard({ icon, label, value, change, currency = false, convertedCount }) {
  return (
    <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800">
            {currency && '₹'}
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {convertedCount && (
            <p className="text-sm text-gray-600 mt-1">
              {convertedCount} converted this month
            </p>
          )}
                        </div>
                      </div>
      <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {change >= 0 ? `+${change}%` : `${change}%`} vs last month
                        </p>
    </div>
  );
}

function ActionItem({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 hover:bg-gray-50 rounded-md">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{icon}</div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
                          </div>
                        </div>
      {action}
                      </div>
  );
}

function SectionCard({ title, children, viewAllLink }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200 h-full">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">{title}</h3>
            {viewAllLink && (
                 <Link href={viewAllLink} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    View All <FaExternalLinkAlt size={12}/>
                </Link>
            )}
                    </div>
        <div className="space-y-4">{children}</div>
                        </div>
  );
}

function ActivityItem({ activity }) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md">
      <div className="flex-shrink-0 mt-1">
        {getActivityIcon(activity.type)}
                      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm text-gray-800 font-medium">
          <Link href={`/Sales/leads/${activity.leadId}`} className="text-blue-600 hover:underline">
            {activity.leadName}
          </Link>
        </p>
        <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">{activity.timestamp}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">by {activity.user}</span>
                          </div>
                        </div>
                      </div>
  );
}

// --- Dashboard Sections ---
function ActionCenter({ data, onAssign }) {
    const [selectedSalesRep, setSelectedSalesRep] = useState({});

    const handleAssign = (leadId) => {
        const repName = selectedSalesRep[leadId];
        if (!repName) {
            toast.error("Please select a sales rep.");
            return;
        }
        onAssign(leadId, repName);
        toast.success(`Lead ${leadId} assigned to ${repName}.`);
    };

    return (
        <SectionCard title="Action Center">
            <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Unassigned Leads ({data.unassignedLeads.length})</h4>
                {data.unassignedLeads.map(lead => (
                    <ActionItem
                        key={lead.id}
                        icon={<FaUserPlus size={20} />}
                        title={lead.name}
                        subtitle={`Source: ${lead.source}`}
                        action={
                            <div className="flex items-center gap-2">
                                <select 
                                    className="text-xs border-gray-300 rounded-md shadow-sm p-1"
                                    onChange={(e) => setSelectedSalesRep(prev => ({...prev, [lead.id]: e.target.value}))}
                                >
                                    <option value="">Assign to...</option>
                                    {salesPersons.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                </select>
                                <button 
                                    onClick={() => handleAssign(lead.id)}
                                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                >
                                    Assign
                                </button>
          </div>
                        }
                    />
                ))}
            </div>
             <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Leads with Overdue Activities ({data.overdueActivities.length})</h4>
                {data.overdueActivities.map(lead => (
                    <ActionItem
                        key={lead.id}
                        icon={<FaExclamationCircle className="text-red-500" size={20} />}
                        title={lead.name}
                        subtitle={`${lead.task} - Overdue by ${lead.overdueBy}`}
                        action={ <Link href={`/Sales/leads/${lead.id}`} className="text-xs text-blue-600 hover:underline">View</Link> }
                    />
                ))}
            </div>
            <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Stale Leads ({data.staleLeads.length})</h4>
                {data.staleLeads.map(lead => (
                    <ActionItem
                        key={lead.id}
                        icon={<FaHourglassHalf className="text-yellow-500" size={20} />}
                        title={lead.name}
                        subtitle={`Last activity: ${lead.lastActivity}`}
                        action={ <Link href={`/Sales/leads/${lead.id}`} className="text-xs text-blue-600 hover:underline">View</Link> }
                    />
                ))}
            </div>
        </SectionCard>
    );
}

function RecentActivity({ activities = [] }) {
  return (
    <SectionCard title="Recent Activity" viewAllLink="/SalesManager/Manager">
      <div className="max-h-96 overflow-y-auto">
        {activities && activities.length > 0 ? (
          activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaClock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activities</p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function SalesPipelineFunnel({ data }) {
  return (
    <SectionCard title="Sales Pipeline Funnel">
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="value" fill="#3B82F6" barSize={30}>
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
                  </BarChart>
                </ResponsiveContainer>
    </SectionCard>
  );
}

function RevenueForecast({ data }) {
  return (
    <SectionCard title="Revenue Forecast (Weighted)">
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="text-left text-gray-500">
                        <th className="p-2">Stage</th>
                        <th className="p-2">Probability</th>
                        <th className="p-2 text-right">Forecast</th>
                    </tr>
                </thead>
                <tbody>
                    {data.forecast.map(item => (
                        <tr key={item.stage} className="border-b border-gray-100">
                            <td className="p-2 font-semibold">{item.stage}</td>
                            <td className="p-2 text-gray-600">{item.probability}</td>
                            <td className="p-2 text-right font-bold text-gray-800">₹{item.forecastValue.toLocaleString()}</td>
                        </tr>
                    ))}
                    <tr className="font-bold bg-gray-50">
                        <td colSpan="2" className="p-2 text-right">Total Forecast</td>
                        <td className="p-2 text-right text-blue-600">₹{data.forecast.reduce((acc, i) => acc + i.forecastValue, 0).toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
              </div>
    </SectionCard>
  );
}

function TeamLeaderboard({ data }) {
  return (
     <SectionCard title="Team Leaderboard" viewAllLink="/manager/team">
        {data.map(member => (
            <div key={member.rank} className="flex items-center gap-4 text-sm">
                <div className="font-bold text-gray-500 w-6">{member.rank === 1 ? <FaCrown className="text-yellow-500"/> : member.rank}.</div>
                <div className="flex-grow font-semibold text-gray-800">{member.name}</div>
                <div className="text-right">
                    <p className="font-semibold">{member.dealsWon} <span className="text-gray-500 font-normal">deals</span></p>
                </div>
                <div className="text-right">
                     <p className="font-semibold">{member.activities} <span className="text-gray-500 font-normal">activities</span></p>
                </div>
            </div>
        ))}
    </SectionCard>
  );
}

function LeadSourcePerformance({ data }) {
  return (
    <SectionCard title="Lead Source Performance">
        <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                <Tooltip />
                <Legend iconType="circle" />
            </PieChart>
        </ResponsiveContainer>
    </SectionCard>
  );
}

function MainDashboard() {
    const [dashboardData, setDashboardData] = useState(MOCK_DATA);
    const [showAddLeadModal, setShowAddLeadModal] = useState(false);

    const handleAssignLead = (leadId, repName) => {
        setDashboardData(prev => ({
            ...prev,
            actionCenter: {
                ...prev.actionCenter,
                unassignedLeads: prev.actionCenter.unassignedLeads.filter(l => l.id !== leadId),
            }
        }));
    };

    const handleAddLeadSubmit = (formData) => {
        if (!formData.salesRep || !formData.designer) {
            toast.error('Please assign both Sales Person and Designer.');
            return;
        }
        
        const leadData = {
            ...defaultLeadData,
            ...formData,
            status: formData.status || "New",
            submittedBy: "SALESMANAGER",
        };

        // Generate a new lead ID
        const newId = `LEAD${Math.floor(Math.random() * 100000)}`;
        const newLead = { ...leadData, leadId: newId };

        // Add new activity for lead creation
        const newActivity = {
            id: Date.now(),
            type: 'note',
            leadName: formData.name,
            leadId: newId,
            description: `Manager created new lead and assigned to ${formData.salesRep}`,
            timestamp: 'Just now',
            user: 'Manager'
        };

        // Update the dashboard data to reflect the new lead
        setDashboardData(prev => ({
            ...prev,
            kpis: {
                ...prev.kpis,
                newLeads: { ...prev.kpis.newLeads, value: prev.kpis.newLeads.value + 1 }
            },
            recentActivities: [newActivity, ...(prev.recentActivities || [])],
            pipelineForecast: {
                ...prev.pipelineForecast,
                funnel: prev.pipelineForecast.funnel.map(stage => 
                    stage.name === 'New' ? { ...stage, value: stage.value + 1 } : stage
                )
            }
        }));

        toast.success(`Lead "${formData.name}" added successfully!`);
        setShowAddLeadModal(false);
    };

    return (
        <MainLayout>
            <div className="p-6 bg-gray-50 min-h-screen">
                <header className="flex justify-between items-center mb-6">
                        <div>
                        <h1 className="text-3xl font-bold text-gray-800">Sales Command Center</h1>
                        <p className="text-gray-600">Welcome back, Manager. Here's your sales overview for today.</p>
                            </div>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2">
                            <FaFilter /> Quick Filters
                        </button>
                        <button 
                            onClick={() => setShowAddLeadModal(true)}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
                        >
                            <FaPlus /> Add New Lead
                        </button>
                         <Link href="/SalesManager/Manager" className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                           Go to Pipeline
                        </Link>
                        </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KpiCard icon={<FaUsers size={24}/>} label="New Leads" value={dashboardData.kpis.newLeads.value} change={dashboardData.kpis.newLeads.change} />
                    <KpiCard 
                        icon={<FaBullseye size={24}/>} 
                        label="Conversion Rate" 
                        value={dashboardData.kpis.conversionRate.value} 
                        change={dashboardData.kpis.conversionRate.change} 
                        convertedCount={dashboardData.kpis.conversionRate.convertedCount}
                    />
                    <KpiCard icon={<FaHandHoldingUsd size={24}/>} label="Avg. Deal Value" value={dashboardData.kpis.avgDealValue.value} change={dashboardData.kpis.avgDealValue.change} currency={true} />
                    <KpiCard icon={<FaMoneyBillWave size={24}/>} label="Revenue Won" value={dashboardData.kpis.revenueWon.value} change={dashboardData.kpis.revenueWon.change} currency={true} />
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Action Center) */}
                    <div className="lg:col-span-1">
                        <ActionCenter data={dashboardData.actionCenter} onAssign={handleAssignLead} />
              </div>

                    {/* Right Column (Charts & Forecasts) */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <SalesPipelineFunnel data={dashboardData.pipelineForecast.funnel} />
                           <RecentActivity activities={dashboardData.recentActivities} />
            </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <TeamLeaderboard data={dashboardData.teamPerformance.leaderboard} />
                           <LeadSourcePerformance data={dashboardData.teamPerformance.sourcePerformance} />
        </div>
      </div>
    </div>

                {/* Add Lead Modal */}
                <AddLeadModal
                    isOpen={showAddLeadModal}
                    onClose={() => setShowAddLeadModal(false)}
                    onSubmit={handleAddLeadSubmit}
                    initialData={defaultLeadData}
                    isManagerView={true}
                    salesPersons={salesPersons}
                    designers={designers}
                />
            </div>
        </MainLayout>
  );
}

export default MainDashboard;
