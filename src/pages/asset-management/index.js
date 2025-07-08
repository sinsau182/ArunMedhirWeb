import React, { useState, useEffect } from 'react';
import AssetManagementLayout from '@/components/AssetManagementLayout';
import { FaPlus, FaTimes, FaFileInvoice } from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/router';

// Mock Data - Replace with API calls
const MOCK_ASSETS = [
    { id: 'ASSET-2024-0001', name: 'Dell Latitude 5420', category: 'IT Equipment', status: 'Assigned', location: 'Mumbai Head Office', assignedTo: 'Ankit Matwa' },
    { id: 'ASSET-2024-0002', name: 'Ergonomic Office Chair', category: 'Office Furniture', status: 'In Stock', location: 'Mumbai Head Office', assignedTo: null },
    { id: 'ASSET-2024-0003', name: 'HP LaserJet Pro MFP', category: 'IT Equipment', status: 'Under Maintenance', location: 'Bangalore Branch', assignedTo: null },
];
const MOCK_EMPLOYEES = [{ id: 1, name: 'Ankit Matwa' }, { id: 2, name: 'Arun Medhir' }];
const MOCK_VENDORS = [{ id: 1, name: 'Dell India Pvt. Ltd.' }, { id: 2, name: 'Global Computers' }];
const MOCK_CATEGORIES = ['IT Equipment', 'Office Furniture', 'Vehicles', 'Plant & Machinery'];
const MOCK_LOCATIONS = ['Mumbai Head Office', 'Bangalore Branch', 'Remote'];
const MOCK_TEAMS = ['Marketing', 'Production', 'Sales', 'HR', 'Finance'];
const MOCK_LAPTOP_COMPANIES = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'];

const AddAssetModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        assetName: '', category: '', serialNumber: '', location: '',
        purchaseDate: '', vendor: '', invoiceNumber: '', purchaseCost: '',
        gstRate: '', itcEligible: 'Yes', invoiceScan: null,
        assignedTo: '', assignmentDate: '', warrantyExpiry: '',
        // IT Specific Fields
        team: '', laptopCompany: '', processor: '', ram: '', memory: '', 
        condition: 'New', accessories: '', graphicsCard: ''
    });
    const [showITFields, setShowITFields] = useState(false);

    useEffect(() => {
        setShowITFields(formData.category === 'IT Equipment');
    }, [formData.category]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.assetName || !formData.category || !formData.purchaseDate || !formData.purchaseCost) {
            toast.error("Please fill all required fields.");
            return;
        }
        onSubmit(formData);
    };

    if (!isOpen) return null;

    const InputField = ({ label, name, ...props }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input name={name} onChange={handleChange} value={formData[name] || ''} {...props} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
        </div>
    );
    const SelectField = ({ label, name, children, ...props }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select name={name} onChange={handleChange} value={formData[name] || ''} {...props} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm">
                {children}
            </select>
        </div>
    );

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
                            <InputField label="Asset Name" name="assetName" required />
                            <SelectField label="Category" name="category" required>
                                <option value="">Select Category...</option>
                                {MOCK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </SelectField>
                            <InputField label="Serial Number" name="serialNumber" />
                             <SelectField label="Location" name="location" required>
                                <option value="">Select Location...</option>
                                {MOCK_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            </SelectField>
                        </div>
                    </div>
                     {/* Financial & Purchase */}
                     <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-lg mb-4">Financial & Purchase Details</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField label="Purchase Date" name="purchaseDate" type="date" required />
                             <SelectField label="Supplier / Vendor" name="vendor">
                                <option value="">Select Vendor...</option>
                                 {MOCK_VENDORS.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                            </SelectField>
                            <InputField label="Invoice / Bill Number" name="invoiceNumber" />
                            <InputField label="Purchase Cost (Gross)" name="purchaseCost" type="number" required />
                            <InputField label="GST Rate (%)" name="gstRate" type="number" placeholder="e.g., 18" />
                             <SelectField label="Input Tax Credit (ITC) Eligible" name="itcEligible">
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </SelectField>
                            <InputField label="Invoice Scan" name="invoiceScan" type="file" />
                        </div>
                    </div>
                    
                    {/* Conditional IT Fields */}
                    {showITFields && (
                        <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                            <h3 className="font-semibold text-lg mb-4 text-blue-800">IT Equipment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SelectField label="Laptop Company" name="laptopCompany">
                                    <option value="">Select Company...</option>
                                    {MOCK_LAPTOP_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </SelectField>
                                <InputField label="Processor/Model" name="processor" />
                                <InputField label="RAM (e.g., 16GB)" name="ram" />
                                <InputField label="Memory (e.g., 512GB SSD)" name="memory" />
                                <InputField label="Graphics Card" name="graphicsCard" />
                                <SelectField label="Condition" name="condition">
                                    <option value="New">New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Damaged">Damaged</option>
                                </SelectField>
                                <InputField label="Accessories" name="accessories" placeholder="e.g., Charger, Mouse" />
                                <SelectField label="Assigned To Team" name="team">
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
                             <SelectField label="Assigned To" name="assignedTo">
                                <option value="">Not Assigned</option>
                                 {MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                            </SelectField>
                            <InputField label="Assignment Date" name="assignmentDate" type="date" />
                            <InputField label="Warranty Expiry Date" name="warrantyExpiry" type="date" />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save Asset</button>
                </div>
            </form>
        </div>
    );
};

const AssetManagementPage = () => {
    const [assets, setAssets] = useState(MOCK_ASSETS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleAddAsset = (newAssetData) => {
        const newAsset = {
            ...newAssetData,
            id: `ASSET-2024-000${assets.length + 1}`,
            status: newAssetData.assignedTo ? 'Assigned' : 'In Stock',
        };
        setAssets(prev => [newAsset, ...prev]);
        setIsModalOpen(false);
        toast.success(`Asset "${newAsset.name}" added successfully!`);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Assigned': return 'bg-blue-100 text-blue-700';
            case 'In Stock': return 'bg-green-100 text-green-700';
            case 'Under Maintenance': return 'bg-yellow-100 text-yellow-700';
            case 'Scrapped': return 'bg-red-100 text-red-700';
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
                            {assets.map((asset) => (
                                <tr 
                                    key={asset.id} 
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => router.push(`/asset-management/${asset.id}`)}
                                >
                                    <td className="p-4 font-mono text-sm">{asset.id}</td>
                                    <td className="p-4 font-medium">{asset.name}</td>
                                    <td className="p-4 text-gray-600">{asset.category}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(asset.status)}`}>
                                            {asset.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">{asset.location}</td>
                                    <td className="p-4 text-gray-600">{asset.assignedTo || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

export default AssetManagementPage; 