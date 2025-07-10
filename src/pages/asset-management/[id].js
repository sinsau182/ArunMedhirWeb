import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import AssetManagementLayout from '@/components/AssetManagementLayout';
import { fetchAssetById, updateAsset, clearCurrentAsset } from '@/redux/slices/assetSlice';
import { fetchAssetCategories } from '@/redux/slices/assetCategorySlice';
import { fetchAssetLocations } from '@/redux/slices/assetLocationSlice';
import { fetchAssetStatuses } from '@/redux/slices/assetStatusSlice';
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

const EditAssetModal = ({ isOpen, onClose, asset, onSave, categories, locations, statuses, loading }) => {
    const [formData, setFormData] = useState({});
    
    useEffect(() => {
        if (asset) {
            setFormData({
                name: asset.name || '',
                statusLabelId: asset.statusLabelId || '',
                locationId: asset.locationId || '',
                assignedTo: asset.assignedTo || '',
            });
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
                                name="statusLabelId"
                                value={formData.statusLabelId || ''}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            >
                                <option value="">Select Status...</option>
                                {Array.isArray(statuses) && statuses.map(status => (
                                    <option key={status.statusLabelId || status.id} value={status.statusLabelId || status.id}>
                                        {status.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <select
                                name="locationId"
                                value={formData.locationId || ''}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-md"
                            >
                                <option value="">Select Location...</option>
                                {Array.isArray(locations) && locations.map(location => (
                                    <option key={location.locationId || location.id} value={location.locationId || location.id}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>
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
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={loading}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const AssetDetailPage = () => {
    const router = useRouter();
    const { id } = router.query; // This is now the assetId (e.g., "D-03-3001")
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Get data from Redux store
    const { currentAsset: asset, fetchingAsset, fetchAssetError, updatingAsset, updateAssetError } = useSelector(state => state.assets);
    const { categories } = useSelector(state => state.assetCategories);
    const { locations } = useSelector(state => state.assetLocations);
    const { statuses } = useSelector(state => state.assetStatuses);
    

    
    useEffect(() => {
        if (id) {
            // Clear previous asset data
            dispatch(clearCurrentAsset());
            
            // Fetch the specific asset
            dispatch(fetchAssetById(id));
        }
        
        // Cleanup when component unmounts
        return () => {
            dispatch(clearCurrentAsset());
        };
    }, [id, dispatch]);
    
    // Fetch reference data when asset is loaded and we need to display names
    useEffect(() => {
        if (asset && (asset.categoryId || asset.locationId)) {
            // Only fetch categories and locations if we have IDs to resolve
            if (asset.categoryId && (!categories || categories.length === 0)) {
                dispatch(fetchAssetCategories());
            }
            if (asset.locationId && (!locations || locations.length === 0)) {
                dispatch(fetchAssetLocations());
            }
        }
    }, [asset, categories, locations, dispatch]);
    
    // Fetch statuses only when edit modal is opened (since we only need them for editing)
    useEffect(() => {
        if (isEditModalOpen && (!statuses || statuses.length === 0)) {
            dispatch(fetchAssetStatuses());
        }
    }, [isEditModalOpen, statuses, dispatch]);
    
    // Handle errors with toast notifications
    useEffect(() => {
        if (fetchAssetError) {
            toast.error(`Failed to fetch asset: ${fetchAssetError}`);
        }
        if (updateAssetError) {
            toast.error(`Failed to update asset: ${updateAssetError}`);
        }
    }, [fetchAssetError, updateAssetError]);
    
    // Helper functions to map IDs to names
    const getCategoryName = (categoryId) => {
        if (!categoryId) return 'No Category';
        if (!Array.isArray(categories) || categories.length === 0) return 'Loading...';
        const category = categories.find(c => (c.categoryId || c.id) === categoryId);
        return category ? category.name : 'Unknown Category';
    };

    const getLocationName = (locationId) => {
        if (!locationId) return 'No Location';
        if (!Array.isArray(locations) || locations.length === 0) return 'Loading...';
        const location = locations.find(l => (l.locationId || l.id) === locationId);
        return location ? location.name : 'Unknown Location';
    };

    const getStatusName = (statusLabelId) => {
        if (!statusLabelId) return 'No Status'; // More accurate when no statusLabelId
        if (!Array.isArray(statuses)) return 'Loading...';
        const status = statuses.find(s => (s.statusLabelId || s.id) === statusLabelId);
        return status ? status.name : 'Unknown Status';
    };
    
    const handleSaveAsset = async (updatedAsset) => {
        try {
            // Prepare the asset data for the API
            const assetData = {
                name: updatedAsset.name,
                statusLabelId: updatedAsset.statusLabelId,
                locationId: updatedAsset.locationId,
                assignedTo: updatedAsset.assignedTo,
                // Add other fields as needed
            };
            
            await dispatch(updateAsset({ assetId: id, assetData })).unwrap();
            toast.success('Asset updated successfully!');
            
            // Refresh the asset data to show changes instantly
            dispatch(fetchAssetById(id));
        } catch (error) {
            console.error('Error updating asset:', error);
            toast.error(`Failed to update asset: ${error}`);
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'In Stock': return 'bg-green-100 text-green-700 border-green-200';
            case 'Under Maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Scrapped': return 'bg-red-100 text-red-700 border-red-200';
            case 'No Status': return 'bg-gray-100 text-gray-600 border-gray-200';
            case 'Loading...': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };
    

    
    if (!fetchingAsset && !asset && fetchAssetError) {
        return (
            <AssetManagementLayout>
                <div className="p-6 text-center">
                    <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Asset Not Found</h2>
                    <p className="text-gray-600 mb-4">The asset you're looking for doesn't exist or couldn't be loaded.</p>
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
    
    // Don't render content if still loading or no asset
    if (!asset) {
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
                            <p className="text-gray-600">{asset.assetId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(getStatusName(asset.statusLabelId))}`}>
                            {getStatusName(asset.statusLabelId)}
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
                                <p className="font-semibold">{getLocationName(asset.locationId)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <FaRupeeSign className="text-2xl text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-500">Purchase Cost</p>
                                <p className="font-semibold">₹{asset.purchaseCost?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <FaCalendarAlt className="text-2xl text-orange-600" />
                            <div>
                                <p className="text-sm text-gray-500">Warranty Expires</p>
                                <p className="font-semibold">{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}</p>
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
                                                <span className="font-medium">{asset.assetId}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Category:</span>
                                                <span className="font-medium">{getCategoryName(asset.categoryId)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Serial Number:</span>
                                                <span className="font-medium">{asset.serialNumber || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-medium">{getStatusName(asset.statusLabelId)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800">Financial Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Purchase Date:</span>
                                                <span className="font-medium">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Purchase Cost:</span>
                                                <span className="font-medium">₹{asset.purchaseCost?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">GST Rate:</span>
                                                <span className="font-medium">{asset.gstRate}%</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Invoice Number:</span>
                                                <span className="font-medium">{asset.invoiceNumber || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Specifications Tab */}
                        {activeTab === 'specifications' && getCategoryName(asset.categoryId) === 'IT Equipment' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800">IT Equipment Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <FaLaptop className="text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Brand</p>
                                                <p className="font-medium">{asset.customFields?.laptopCompany || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaMicrochip className="text-green-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Processor</p>
                                                <p className="font-medium">{asset.customFields?.processor || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaMemory className="text-purple-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">RAM</p>
                                                <p className="font-medium">{asset.customFields?.ram || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <FaHdd className="text-orange-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Storage</p>
                                                <p className="font-medium">{asset.customFields?.memory || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaDesktop className="text-red-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Graphics Card</p>
                                                <p className="font-medium">{asset.customFields?.graphicsCard || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaUser className="text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-500">Team</p>
                                                <p className="font-medium">{asset.customFields?.team || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-6">
                                    <h4 className="font-semibold text-gray-800 mb-2">Accessories</h4>
                                    <p className="text-gray-600">{asset.customFields?.accessories || 'N/A'}</p>
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
                                
                                <div className="text-center py-12">
                                    <FaTools className="text-4xl text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No Maintenance Records</h4>
                                    <p className="text-gray-500">Maintenance records will appear here when added.</p>
                                </div>
                            </div>
                        )}
                        
                        {/* History Tab */}
                        {activeTab === 'history' && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-800">Asset History</h3>
                                <div className="text-center py-12">
                                    <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No History Records</h4>
                                    <p className="text-gray-500">Asset history will appear here when actions are performed.</p>
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
                                
                                <div className="text-center py-12">
                                    <FaFileAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No Documents</h4>
                                    <p className="text-gray-500">Upload documents and files related to this asset.</p>
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
                    categories={categories}
                    locations={locations}
                    statuses={statuses}
                    loading={updatingAsset}
                />
            </div>
        </AssetManagementLayout>
    );
};

export default AssetDetailPage; 