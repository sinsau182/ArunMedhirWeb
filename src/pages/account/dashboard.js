import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import MainLayout from '../../components/MainLayout';
import {
    FaFileInvoiceDollar,
    FaMoneyBillWave,
    FaClock,
    FaPlusCircle,
    FaStickyNote,
    FaUsers,
    FaChartLine,
    FaExclamationTriangle,
    FaHistory,
    FaReceipt,
    FaTimes
} from 'react-icons/fa';

// --- Form Configuration with Dynamic Imports ---
const MODAL_CONFIG = {
    'create-invoice': {
        title: 'Create New Invoice',
        Component: dynamic(() => import('../../components/Forms/AddInvoiceForm'), { ssr: false })
    },
    'add-bill': {
        title: 'Add Vendor Bill',
        Component: dynamic(() => import('../../components/Forms/AddBillForm'), { ssr: false })
    },
    'record-receipt': {
        title: 'Record Customer Receipt',
        Component: dynamic(() => import('../../components/Forms/AddReceiptForm'), { ssr: false })
    },
    'record-payment': {
        title: 'Record Vendor Payment',
        Component: () => <div className="text-center p-8">Vendor Payment Form Placeholder</div>
    },
    'add-note': {
        title: 'Add a Note',
        Component: () => <div className="text-center p-8">Add Note Form Placeholder</div>
    },
};

// --- Reusable Components ---

const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white p-4 rounded-lg shadow-md flex-grow flex items-center border-l-4 ${color}`}>
        <div className="mr-4 text-2xl">{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

const QuickActionButton = ({ text, icon, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white hover:bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-md flex flex-col items-center justify-center text-center transition duration-200 h-full"
    >
        <div className="text-2xl mb-2 text-blue-600">{icon}</div>
        <span className="text-sm whitespace-nowrap">{text}</span>
    </button>
);

const DashboardCard = ({ title, children, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
        <div className="flex items-center mb-4">
            <div className="text-xl text-gray-600 mr-3">{icon}</div>
            <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        <div>{children}</div>
    </div>
);

const Modal = ({ children, title, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-full overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-xl font-semibold">{title}</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <FaTimes size={20} />
                </button>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    </div>
);

// --- Dashboard Specific Components ---

const AccountsReceivableCard = () => (
    <DashboardCard title="Accounts Receivable" icon={<FaFileInvoiceDollar className="text-green-500" />}>
        <div className="text-center bg-gray-50 p-4 my-4 rounded-md">
            <p className="text-sm text-gray-600">[Aging Chart Placeholder]</p>
        </div>
        <h3 className="font-semibold text-gray-700 mb-2">Overdue Invoices</h3>
        <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Customer A</span> <span className="font-mono">₹8,500</span></li>
            <li className="flex justify-between"><span>Customer B</span> <span className="font-mono">₹12,200</span></li>
            <li className="flex justify-between"><span>Customer C</span> <span className="font-mono">₹3,150</span></li>
            <li className="flex justify-between"><span>Customer D</span> <span className="font-mono">₹1,750</span></li>
            <li className="flex justify-between"><span>Customer E</span> <span className="font-mono">₹500</span></li>
        </ul>
        <div className="text-right">
            <a href="/account/customers" className="text-blue-500 hover:underline mt-4 text-sm">View All Invoices →</a>
        </div>
    </DashboardCard>
);

const AccountsPayableCard = () => (
    <DashboardCard title="Accounts Payable" icon={<FaMoneyBillWave className="text-red-500" />}>
        <div className="text-center bg-gray-50 p-4 my-4 rounded-md">
            <p className="text-sm text-gray-600">[Aging Chart Placeholder]</p>
        </div>
        <h3 className="font-semibold text-gray-700 mb-2">Upcoming Bills</h3>
        <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Vendor X</span> <span className="font-mono">₹4,000</span></li>
            <li className="flex justify-between"><span>Vendor Y</span> <span className="font-mono">₹7,800</span></li>
            <li className="flex justify-between"><span>Vendor Z</span> <span className="font-mono">₹1,250</span></li>
            <li className="flex justify-between"><span>Vendor W</span> <span className="font-mono">₹19,500</span></li>
            <li className="flex justify-between"><span>Vendor V</span> <span className="font-mono">₹2,300</span></li>
        </ul>
        <div className="text-right">
            <a href="/account/vendor" className="text-blue-500 hover:underline mt-4 text-sm">View All Bills →</a>
        </div>
    </DashboardCard>
);

const ActivityFeedCard = () => (
     <DashboardCard title="Recent Activity Feed" icon={<FaHistory />}>
        <ul className="space-y-2 text-sm text-gray-800">
            <li>- Receipt REC-002 for ₹1,200 from Tech Corp recorded.</li>
            <li>- Bill #VB-1002 from Acme Ltd. marked as paid.</li>
            <li>- New vendor 'Creative Solutions' was added.</li>
            <li>- Invoice INV-0045 for ₹5,600 was sent to Global Tech.</li>
        </ul>
    </DashboardCard>
);


const AccountantDashboard = () => {
    const [activeModal, setActiveModal] = useState(null);

    const closeModal = () => setActiveModal(null);
    
    const CurrentModalConfig = activeModal ? MODAL_CONFIG[activeModal] : null;

    return (
        <MainLayout>
            <div className="p-6 bg-gray-100 min-h-screen">
                <div className="space-y-6">
                    {/* Top Row: Stats */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <StatCard
                            icon={<FaFileInvoiceDollar className="text-green-500"/>}
                            title="Total Receivables"
                            value="₹50,000"
                            color="border-green-500"
                        />
                         <StatCard
                            icon={<FaMoneyBillWave className="text-red-500"/>}
                            title="Total Payables"
                            value="₹12,000"
                            color="border-red-500"
                        />
                    </div>

                    {/* Second Row: Quick Actions */}
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <QuickActionButton text="Create Invoice" icon={<FaFileInvoiceDollar />} onClick={() => setActiveModal('create-invoice')} />
                        <QuickActionButton text="Add Vendor Bill" icon={<FaReceipt />} onClick={() => setActiveModal('add-bill')} />
                        <QuickActionButton text="Record Customer Receipt" icon={<FaPlusCircle />} onClick={() => setActiveModal('record-receipt')} />
                        <QuickActionButton text="Record Vendor Payment" icon={<FaMoneyBillWave />} onClick={() => setActiveModal('record-payment')} />
                    </div>

                    {/* Third Row: AR and AP */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AccountsReceivableCard />
                        <AccountsPayableCard />
                    </div>

                    {/* Activity Feed */}
                    <ActivityFeedCard />
                </div>
            </div>
            
            {CurrentModalConfig && (
                <Modal title={CurrentModalConfig.title} onClose={closeModal}>
                    <CurrentModalConfig.Component onClose={closeModal} />
                </Modal>
            )}
        </MainLayout>
    );
};

export default AccountantDashboard; 