import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AssetManagementLayout from '@/components/AssetManagementLayout';
import { 
    FaEdit, FaHistory, FaTools, FaFileAlt, FaUser, FaMapMarkerAlt, 
    FaCalendarAlt, FaRupeeSign, FaBarcode, FaLaptop, FaMemory, 
    FaMicrochip, FaHdd, FaDesktop, FaArrowLeft, FaTimes, FaCheck,
    FaExclamationTriangle, FaPlus, FaClock, FaWrench
} from 'react-icons/fa';
import { toast } from 'sonner';

// Mock data - replace with actual API call
const MOCK_ASSET_DETAIL = {
    id: 'ASSET-2024-0001',
    name: 'Dell Latitude 5420',
    category: 'IT Equipment',
    serialNumber: 'DL5420-2024-001',
    status: 'Assigned',
    location: 'Mumbai Head Office',
    assignedTo: 'Ankit Matwa',
    assignmentDate: '2024-01-15',
    
    // Financial Details
    purchaseDate: '2024-01-10',
    vendor: 'Dell India Pvt. Ltd.',
    invoiceNumber: 'INV-DEL-2024-001',
    purchaseCost: 65000,
    gstRate: 18,
    itcEligible: 'Yes',
    currentValue: 58000,
    
    // IT Specific Details
    team: 'Development',
    laptopCompany: 'Dell',
    processor: 'Intel Core i7-11th Gen',
    ram: '16GB DDR4',
    memory: '512GB SSD',
    condition: 'Good',
    accessories: 'Charger, Mouse, Laptop Bag',
    graphicsCard: 'Intel Iris Xe Graphics',
    
    // Warranty & Maintenance
    warrantyExpiry: '2027-01-10',
    lastMaintenanceDate: '2024-06-15',
    nextMaintenanceDate: '2024-12-15',
    
    // History
    history: [
        { date: '2024-01-15', action: 'Assigned', details: 'Assigned to Ankit Matwa', user: 'Admin' },
        { date: '2024-01-10', action: 'Purchased', details: 'Asset purchased from Dell India', user: 'Admin' },
        { date: '2024-06-15', action: 'Maintenance', details: 'Routine maintenance completed', user: 'IT Support' }
    ],
    
    // Maintenance Records
    maintenanceRecords: [
        { date: '2024-06-15', type: 'Preventive', description: 'System cleanup and updates', cost: 500, vendor: 'IT Support Team' }
    ],
    
    // Files/Documents
    documents: [
        { name: 'Purchase Invoice', type: 'PDF', uploadDate: '2024-01-10' },
        { name: 'Warranty Certificate', type: 'PDF', uploadDate: '2024-01-10' }
    ]
};

const EditAssetModal = ({ isOpen, onClose, asset, onSave }) => {
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
        if (asset) {
            setFormData(asset);
        }
    }, [asset]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Edit Asset</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name</label>
                            <input
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                name="status"
                                value={formData.status || ''}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            >
                                <option value="In Stock">In Stock</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Under Maintenance">Under Maintenance</option>
                                <option value="Scrapped">Scrapped</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <input
                                name="location"
                                value={formData.location || ''}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                            <input
                                name="assignedTo"
                                value={formData.assignedTo || ''}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

const AssetDetailPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [asset, setAsset] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        if (id) {
            // Simulate API call
            setTimeout(() => {
                setAsset(MOCK_ASSET_DETAIL);
                setLoading(false);
            }, 500);
        }
    }, [id]);
    
    const handleSaveAsset = (updatedAsset) => {
        setAsset(updatedAsset);
        toast.success('Asset updated successfully!');
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'In Stock': return 'bg-green-100 text-green-700 border-green-200';
            case 'Under Maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Scrapped': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };
    
    if (loading) {
        return (
            <AssetManagementLayout>
                <div className="p-6 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading asset details...</p>
                    </div>
                </div>
            </AssetManagementLayout>
        );
    }
    
    if (!asset) {
        return (
            <AssetManagementLayout>
                <div className="p-6 text-center">
                    <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Asset Not Found</h2>
                    <p className="text-gray-600 mb-4">The asset you're looking for doesn't exist.</p>
                    <button
                        onClick={() => router.push('/asset-management')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Back to Assets
                    </button>
                </div>
            </AssetManagementLayout>
        );
    }
    
    return (
        <AssetManagementLayout>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/asset-management')}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                        >
                            <FaArrowLeft />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{asset.name}</h1>
                            <p className="text-gray-600">{asset.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(asset.status)}`}>
                            {asset.status}
                        </span>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                        >
                            <FaEdit /> Edit Asset
                        </button>
                    </div>
                </div>
                
                {/* Asset Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <FaUser className="text-2xl text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-500">Assigned To</p>
                                <p className="font-semibold">{asset.assignedTo || 'Unassigned'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <FaMapMarkerAlt className="text-2xl text-green-600" />
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-semibold">{asset.location}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <FaRupeeSign className="text-2xl text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-500">Current Value</p>
                                <p className="font-semibold">₹{asset.currentValue?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <FaCalendarAlt className="text-2xl text-orange-600" />
                            <div>
                                <p className="text-sm text-gray-500">Warranty Expires</p>
                                <p className="font-semibold">{new Date(asset.warrantyExpiry).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'overview', label: 'Overview', icon: FaFileAlt },
                                { id: 'specifications', label: 'Specifications', icon: FaLaptop },
                                { id: 'maintenance', label: 'Maintenance', icon: FaTools },
                                { id: 'history', label: 'History', icon: FaHistory },
                                { id: 'documents', label: 'Documents', icon: FaFileAlt }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <tab.icon />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    
                    <div className="p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Asset ID:</span>
                                                <span className="font-medium">{asset.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Category:</span>
                                                <span className="font-medium">{asset.category}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Serial Number:</span>
                                                <span className="font-medium">{asset.serialNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Condition:</span>
                                                <span className="font-medium">{asset.condition}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Financial Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Purchase Date:</span>
                                                <span className="font-medium">{new Date(asset.purchaseDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Purchase Cost:</span>
                                                <span className="font-medium">₹{asset.purchaseCost?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Vendor:</span>
                                                <span className="font-medium">{asset.vendor}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Invoice Number:</span>
                                                <span className="font-medium">{asset.invoiceNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Specifications Tab */}
                        {activeTab === 'specifications' && asset.category === 'IT Equipment' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800">IT Equipment Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <FaLaptop className="text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Brand</p>
                                                <p className="font-medium">{asset.laptopCompany}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaMicrochip className="text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Processor</p>
                                                <p className="font-medium">{asset.processor}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaMemory className="text-purple-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">RAM</p>
                                                <p className="font-medium">{asset.ram}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <FaHdd className="text-orange-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Storage</p>
                                                <p className="font-medium">{asset.memory}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaDesktop className="text-red-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Graphics Card</p>
                                                <p className="font-medium">{asset.graphicsCard}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaUser className="text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Team</p>
                                                <p className="font-medium">{asset.team}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-800 mb-2">Accessories</h4>
                                    <p className="text-gray-600">{asset.accessories}</p>
                                </div>
                            </div>
                        )}
                        
                        {/* Maintenance Tab */}
                        {activeTab === 'maintenance' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">Maintenance Records</h3>
                                    <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
                                        <FaPlus /> Add Maintenance
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-3">
                                            <FaCheck className="text-green-600" />
                                            <div>
                                                <p className="text-sm text-green-600">Last Maintenance</p>
                                                <p className="font-semibold">{new Date(asset.lastMaintenanceDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                        <div className="flex items-center gap-3">
                                            <FaClock className="text-yellow-600" />
                                            <div>
                                                <p className="text-sm text-yellow-600">Next Maintenance</p>
                                                <p className="font-semibold">{new Date(asset.nextMaintenanceDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    {asset.maintenanceRecords.map((record, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <FaWrench className="text-blue-600" />
                                                        <span className="font-semibold">{record.type} Maintenance</span>
                                                        <span className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-gray-700">{record.description}</p>
                                                    <p className="text-sm text-gray-500 mt-1">Service Provider: {record.vendor}</p>
                                                </div>
                                                <span className="font-semibold text-green-600">₹{record.cost}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* History Tab */}
                        {activeTab === 'history' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800">Asset History</h3>
                                <div className="space-y-4">
                                    {asset.history.map((entry, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{entry.action}</p>
                                                        <p className="text-gray-600">{entry.details}</p>
                                                        <p className="text-sm text-gray-500 mt-1">by {entry.user}</p>
                                                    </div>
                                                    <span className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Documents Tab */}
                        {activeTab === 'documents' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">Documents & Files</h3>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                                        <FaPlus /> Upload Document
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {asset.documents.map((doc, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3">
                                                <FaFileAlt className="text-2xl text-red-600" />
                                                <div>
                                                    <p className="font-medium text-gray-800">{doc.name}</p>
                                                    <p className="text-sm text-gray-500">{doc.type}</p>
                                                    <p className="text-xs text-gray-400">Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Edit Modal */}
                <EditAssetModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    asset={asset}
                    onSave={handleSaveAsset}
                />
            </div>
        </AssetManagementLayout>
    );
};

export default AssetDetailPage; 