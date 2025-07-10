import React, { useState, useEffect } from 'react';
import AssetManagementLayout from '@/components/AssetManagementLayout';
import { FaPlus, FaTimes, FaFileInvoice } from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '@/components/withAuth';
import { fetchAssetCategories } from '@/redux/slices/assetCategorySlice';
import { fetchAssetLocations } from '@/redux/slices/assetLocationSlice';
import { fetchAssetStatuses } from '@/redux/slices/assetStatusSlice';
import { addAsset, fetchAssets } from '@/redux/slices/assetSlice';

// Mock Data for existing assets display - REMOVED since we now use Redux
// const MOCK_ASSETS = [
//     { id: 'ASSET-2024-0001', name: 'Dell Latitude 5420', category: 'IT Equipment', status: 'Assigned', location: 'Mumbai Head Office', assignedTo: 'Ankit Matwa' },
//     { id: 'ASSET-2024-0002', name: 'Ergonomic Office Chair', category: 'Office Furniture', status: 'In Stock', location: 'Mumbai Head Office', assignedTo: null },
//     { id: 'ASSET-2024-0003', name: 'HP LaserJet Pro MFP', category: 'IT Equipment', status: 'Under Maintenance', location: 'Bangalore Branch', assignedTo: null },
// ];

const MOCK_EMPLOYEES = [{ id: 1, name: 'Ankit Matwa' }, { id: 2, name: 'Arun Medhir' }];
const MOCK_VENDORS = [{ id: 1, name: 'Dell India Pvt. Ltd.' }, { id: 2, name: 'Global Computers' }];
const MOCK_TEAMS = ['Marketing', 'Production', 'Sales', 'HR', 'Finance'];
const MOCK_LAPTOP_COMPANIES = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'];

// Input and Select components defined outside to prevent re-creation on each render
const InputField = ({ label, name, value, onChange, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            name={name} 
            onChange={onChange} 
            value={value || ''} 
            {...props} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" 
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select 
            name={name} 
            onChange={onChange} 
            value={value || ''} 
            {...props} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
        >
            {children}
        </select>
    </div>
);

const AddAssetModal = ({ isOpen, onClose, onSubmit }) => {
    const dispatch = useDispatch();
    const { categories, loading: categoriesLoading, error: categoriesError } = useSelector(state => state.assetCategories);
    const { locations, loading: locationsLoading, error: locationsError } = useSelector(state => state.assetLocations);
    const { statuses, loading: statusesLoading, error: statusesError } = useSelector(state => state.assetStatuses);
    const { addingAsset, addAssetError } = useSelector(state => state.assets);
    
    const [formData, setFormData] = useState({
        assetName: '', 
        category: '', 
        serialNumber: '', 
        location: '',
        purchaseDate: '', 
        vendor: '', 
        invoiceNumber: '', 
        purchaseCost: '',
        gstRate: '', 
        itcEligible: 'Yes', 
        invoiceScan: null,
        assignedTo: '', 
        assignmentDate: '', 
        warrantyExpiry: '',
        // IT Specific Fields
        team: '', 
        laptopCompany: '', 
        processor: '', 
        ram: '', 
        memory: '', 
        condition: 'New', 
        accessories: '', 
        graphicsCard: ''
    });

    const [showITFields, setShowITFields] = useState(false);

    // Fetch data from Redux when modal opens
    useEffect(() => {
        if (isOpen) {
            console.log('Modal opened, fetching data from Redux...');
            dispatch(fetchAssetCategories());
            dispatch(fetchAssetLocations());
            dispatch(fetchAssetStatuses());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        setShowITFields(formData.category === 'IT Equipment');
    }, [formData.category]);

    // Handle Redux errors with toast notifications
    useEffect(() => {
        if (categoriesError) {
            toast.error(`Failed to fetch categories: ${categoriesError}`);
        }
        if (locationsError) {
            toast.error(`Failed to fetch locations: ${locationsError}`);
        }
        if (statusesError) {
            toast.error(`Failed to fetch statuses: ${statusesError}`);
        }
        if (addAssetError) {
            toast.error(`Failed to add asset: ${addAssetError}`);
        }
    }, [categoriesError, locationsError, statusesError, addAssetError]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.assetName || !formData.category || !formData.purchaseDate || !formData.purchaseCost) {
            toast.error("Please fill all required fields.");
            return;
        }
        
        try {
            // Prepare asset data as JSON object with backend-expected field names
            const assetData = {
                name: formData.assetName,                    // Backend expects 'name' not 'assetName'
                categoryId: formData.category,               // Backend expects 'categoryId' not 'category'
                serialNumber: formData.serialNumber || '',
                locationId: formData.location,               // Backend expects 'locationId' not 'location'
                purchaseDate: formData.purchaseDate,
                vendorId: null, // TODO: Map vendor name to vendorId when vendor management is implemented
                invoiceNumber: formData.invoiceNumber || '',
                purchaseCost: parseFloat(formData.purchaseCost),
                gstRate: parseFloat(formData.gstRate || '0'),
                inputTaxCreditEligible: formData.itcEligible === 'Yes', // Backend expects boolean and 'inputTaxCreditEligible'
                assignedTo: formData.assignedTo || '',
                warrantyExpiry: formData.warrantyExpiry || null,
            };
            
            // Add IT specific fields as custom fields if applicable
            if (showITFields) {
                assetData.customFields = {};
                if (formData.team) assetData.customFields.team = formData.team;
                if (formData.laptopCompany) assetData.customFields.laptopCompany = formData.laptopCompany;
                if (formData.processor) assetData.customFields.processor = formData.processor;
                if (formData.ram) assetData.customFields.ram = formData.ram;
                if (formData.memory) assetData.customFields.memory = formData.memory;
                if (formData.condition) assetData.customFields.condition = formData.condition;
                if (formData.accessories) assetData.customFields.accessories = formData.accessories;
                if (formData.graphicsCard) assetData.customFields.graphicsCard = formData.graphicsCard;
            }
            
            // Create FormData with the asset data as JSON in the 'asset' field
            const submitData = new FormData();
            submitData.append('asset', JSON.stringify(assetData));
            
            // Add file upload if present
            if (formData.invoiceScan) {
                submitData.append('invoiceScan', formData.invoiceScan);
            }

            // Debug: Log the data being sent
            console.log('Submitting asset data:', assetData);
            console.log('Asset JSON:', JSON.stringify(assetData));

            // Dispatch the addAsset action
            const result = await dispatch(addAsset(submitData)).unwrap();
            
            toast.success('Asset added successfully!');
            onSubmit(result); // Pass the response back to parent
            onClose();
            
            // Reset form
            setFormData({
                assetName: '', category: '', serialNumber: '', location: '',
                purchaseDate: '', vendor: '', invoiceNumber: '', purchaseCost: '',
                gstRate: '', itcEligible: 'Yes', invoiceScan: null,
                assignedTo: '', assignmentDate: '', warrantyExpiry: '',
                team: '', laptopCompany: '', processor: '', ram: '', memory: '', 
                condition: 'New', accessories: '', graphicsCard: ''
            });
        } catch (error) {
            // Error is already handled by Redux and useEffect
            console.error('Error adding asset:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Add New Asset</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Core Identification */}
                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-lg mb-4">Core Identification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField 
                                label="Asset Name" 
                                name="assetName" 
                                value={formData.assetName}
                                onChange={handleChange}
                                required 
                            />
                            <SelectField 
                                label="Category" 
                                name="category" 
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    {categoriesLoading ? 'Loading categories...' : 'Select Category...'}
                                </option>
                                {Array.isArray(categories) && categories.map(c => (
                                    <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </SelectField>
                            <InputField 
                                label="Serial Number" 
                                name="serialNumber" 
                                value={formData.serialNumber}
                                onChange={handleChange}
                            />
                            <SelectField 
                                label="Location" 
                                name="location" 
                                value={formData.location}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    {locationsLoading ? 'Loading locations...' : 'Select Location...'}
                                </option>
                                {Array.isArray(locations) && locations.map(l => (
                                    <option key={l.locationId || l.id} value={l.locationId || l.id}>
                                        {l.name}
                                    </option>
                                ))}
                            </SelectField>
                        </div>
                    </div>
                    
                    {/* Financial & Purchase */}
                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-lg mb-4">Financial & Purchase Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField 
                                label="Purchase Date" 
                                name="purchaseDate" 
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                type="date" 
                                required 
                            />
                            <SelectField 
                                label="Supplier / Vendor" 
                                name="vendor"
                                value={formData.vendor}
                                onChange={handleChange}
                            >
                                <option value="">Select Vendor...</option>
                                {MOCK_VENDORS.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                            </SelectField>
                            <InputField 
                                label="Invoice / Bill Number" 
                                name="invoiceNumber" 
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                            />
                            <InputField 
                                label="Purchase Cost (Gross)" 
                                name="purchaseCost" 
                                value={formData.purchaseCost}
                                onChange={handleChange}
                                type="number" 
                                required 
                            />
                            <InputField 
                                label="GST Rate (%)" 
                                name="gstRate" 
                                value={formData.gstRate}
                                onChange={handleChange}
                                type="number" 
                                placeholder="e.g., 18" 
                            />
                            <SelectField 
                                label="Input Tax Credit (ITC) Eligible" 
                                name="itcEligible"
                                value={formData.itcEligible}
                                onChange={handleChange}
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </SelectField>
                            <InputField 
                                label="Invoice Scan" 
                                name="invoiceScan" 
                                onChange={handleChange}
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png" 
                            />
                        </div>
                    </div>
                    
                    {/* Conditional IT Fields */}
                    {showITFields && (
                        <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                            <h3 className="font-semibold text-lg mb-4 text-blue-800">IT Equipment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SelectField 
                                    label="Laptop Company" 
                                    name="laptopCompany"
                                    value={formData.laptopCompany}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Company...</option>
                                    {MOCK_LAPTOP_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </SelectField>
                                <InputField 
                                    label="Processor/Model" 
                                    name="processor" 
                                    value={formData.processor}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="RAM (e.g., 16GB)" 
                                    name="ram" 
                                    value={formData.ram}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Memory (e.g., 512GB SSD)" 
                                    name="memory" 
                                    value={formData.memory}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Graphics Card" 
                                    name="graphicsCard" 
                                    value={formData.graphicsCard}
                                    onChange={handleChange}
                                />
                                <SelectField 
                                    label="Condition" 
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                >
                                    <option value="New">New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Damaged">Damaged</option>
                                </SelectField>
                                <InputField 
                                    label="Accessories" 
                                    name="accessories" 
                                    value={formData.accessories}
                                    onChange={handleChange}
                                    placeholder="e.g., Charger, Mouse" 
                                />
                                <SelectField 
                                    label="Assigned To Team" 
                                    name="team"
                                    value={formData.team}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Team...</option>
                                    {MOCK_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                            </div>
                        </div>
                    )}

                    {/* Assignment & Warranty */}
                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-lg mb-4">Assignment & Warranty</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <SelectField 
                                label="Assigned To" 
                                name="assignedTo"
                                value={formData.assignedTo}
                                onChange={handleChange}
                            >
                                <option value="">Not Assigned</option>
                                {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                            </SelectField>
                            <InputField 
                                label="Assignment Date" 
                                name="assignmentDate" 
                                value={formData.assignmentDate}
                                onChange={handleChange}
                                type="date" 
                            />
                            <InputField 
                                label="Warranty Expiry Date" 
                                name="warrantyExpiry" 
                                value={formData.warrantyExpiry}
                                onChange={handleChange}
                                type="date" 
                            />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={addingAsset}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={addingAsset || categoriesLoading || locationsLoading || statusesLoading}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {addingAsset ? 'Saving...' : 'Save Asset'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const AssetManagementPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Get data from Redux store
    const { assets, loading: assetsLoading, error: assetsError } = useSelector(state => state.assets);
    const { categories } = useSelector(state => state.assetCategories);
    const { locations } = useSelector(state => state.assetLocations);
    const { statuses } = useSelector(state => state.assetStatuses);

    // Fetch all data when component mounts
    useEffect(() => {
        console.log('AssetManagementPage: Fetching all asset data...');
        dispatch(fetchAssets());
        dispatch(fetchAssetCategories());
        dispatch(fetchAssetLocations());
        dispatch(fetchAssetStatuses());
    }, [dispatch]);

    // Handle errors with toast notifications
    useEffect(() => {
        if (assetsError) {
            toast.error(`Failed to fetch assets: ${assetsError}`);
        }
    }, [assetsError]);

    // Helper functions to map IDs to names
    const getCategoryName = (categoryId) => {
        if (!categoryId || !Array.isArray(categories)) return 'Unknown Category';
        const category = categories.find(c => (c.categoryId || c.id) === categoryId);
        return category ? category.name : 'Unknown Category';
    };

    const getLocationName = (locationId) => {
        if (!locationId || !Array.isArray(locations)) return 'Unknown Location';
        const location = locations.find(l => (l.locationId || l.id) === locationId);
        return location ? location.name : 'Unknown Location';
    };

    const getStatusName = (statusLabelId) => {
        if (!statusLabelId) return 'No Status'; // More accurate when no statusLabelId
        if (!Array.isArray(statuses)) return 'Loading...';
        const status = statuses.find(s => (s.statusLabelId || s.id) === statusLabelId);
        return status ? status.name : 'Unknown Status';
    };

    const handleAddAsset = (newAssetData) => {
        // Handle the API response - the newAssetData will be the response from the server
        console.log('Asset added successfully:', newAssetData);
        
        // Refresh the assets list to show the new asset
        dispatch(fetchAssets());
        setIsModalOpen(false);
        
        // The success message is already shown in the modal
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Assigned': return 'bg-blue-100 text-blue-700';
            case 'In Stock': return 'bg-green-100 text-green-700';
            case 'Under Maintenance': return 'bg-yellow-100 text-yellow-700';
            case 'Scrapped': return 'bg-red-100 text-red-700';
            case 'No Status': return 'bg-gray-100 text-gray-600';
            case 'Loading...': return 'bg-gray-100 text-gray-500';
            case 'Unknown Status': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };
    
    return (
        <AssetManagementLayout>
            <div className="p-6">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Asset Inventory</h1>
                        <p className="text-gray-600 mt-1">Manage and track all company assets</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FaPlus /> Add New Asset
                    </button>
                </header>

                {/* Assets Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {assetsLoading && (
                        <div className="p-8 text-center">
                            <div className="text-blue-600">Loading assets...</div>
                        </div>
                    )}
                    {!assetsLoading && (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-700">Asset ID</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Asset Name</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Location</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(assets) && assets.length > 0 ? (
                                    assets.map((asset) => (
                                        <tr 
                                            key={asset.id} 
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.push(`/asset-management/${asset.assetId}`)}
                                        >
                                            <td className="p-4 font-mono text-sm">{asset.assetId}</td>
                                            <td className="p-4 font-medium">{asset.name}</td>
                                            <td className="p-4 text-gray-600">{getCategoryName(asset.categoryId)}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(getStatusName(asset.statusLabelId))}`}>
                                                    {getStatusName(asset.statusLabelId)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">{getLocationName(asset.locationId)}</td>
                                            <td className="p-4 text-gray-600">{asset.assignedTo || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            {assetsError ? 'Error loading assets' : 'No assets found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Add Asset Modal */}
                <AddAssetModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddAsset}
                />
            </div>
        </AssetManagementLayout>
    );
};

export default withAuth(AssetManagementPage); 