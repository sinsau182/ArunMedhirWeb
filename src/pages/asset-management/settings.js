import React, { useState } from 'react';
import AssetManagementLayout from '@/components/AssetManagementLayout';
import { toast } from 'sonner';
import { FaPlus, FaTrash, FaListAlt, FaMapMarkedAlt, FaCheckSquare, FaFont, FaCog, FaQuestionCircle, FaTags } from 'react-icons/fa';

// Helper component for a consistent setting section layout
const SettingsSection = ({ title, subtitle, children }) => (
    <div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            {children}
        </div>
    </div>
);

// --- Individual Setting Components ---

const CategorySettings = ({ categories, setCategories }) => {
    const [newCategory, setNewCategory] = useState({ name: '', depreciationRate: '' });
    const handleAdd = () => {
        if (!newCategory.name) { toast.error("Category name is required."); return; }
        setCategories([...categories, { ...newCategory, id: Date.now() }]);
        setNewCategory({ name: '', depreciationRate: '' });
    };
    return (
        <SettingsSection title="Asset Categories" subtitle="Manage the categories for your assets.">
            <div className="flex items-end gap-4 mb-4">
                <input value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} placeholder="New Category Name (e.g., IT Equipment)" className="w-full p-2 border rounded-md" />
                <input value={newCategory.depreciationRate} onChange={e => setNewCategory({...newCategory, depreciationRate: e.target.value})} type="number" placeholder="Default Depreciation Rate (%)" className="w-full p-2 border rounded-md" />
                <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md whitespace-nowrap"><FaPlus /> Add</button>
            </div>
            <div className="space-y-2">
                {categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{cat.name} {cat.depreciationRate && `(${cat.depreciationRate}%)`}</span>
                        <button onClick={() => setCategories(categories.filter(c => c.id !== cat.id))} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                    </div>
                ))}
            </div>
        </SettingsSection>
    );
};

const LocationSettings = ({ locations, setLocations }) => {
    const [newLocation, setNewLocation] = useState({ name: '', address: '' });
    const handleAdd = () => {
        if (!newLocation.name) { toast.error("Location name is required."); return; }
        setLocations([...locations, { ...newLocation, id: Date.now() }]);
        setNewLocation({ name: '', address: '' });
    };
    return (
        <SettingsSection title="Asset Locations" subtitle="Manage the physical locations where assets are stored or assigned.">
            <div className="flex items-end gap-4 mb-4">
                <input value={newLocation.name} onChange={e => setNewLocation({...newLocation, name: e.target.value})} placeholder="New Location Name (e.g., Mumbai Office)" className="w-full p-2 border rounded-md" />
                <input value={newLocation.address} onChange={e => setNewLocation({...newLocation, address: e.target.value})} placeholder="Address (Optional)" className="w-full p-2 border rounded-md" />
                <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md whitespace-nowrap"><FaPlus /> Add</button>
            </div>
            <div className="space-y-2">
                {locations.map(loc => (
                    <div key={loc.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{loc.name} {loc.address && `- ${loc.address}`}</span>
                        <button onClick={() => setLocations(locations.filter(l => l.id !== loc.id))} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                    </div>
                ))}
            </div>
        </SettingsSection>
    );
};

const StatusSettings = ({ statuses, setStatuses }) => {
    const [newStatus, setNewStatus] = useState('');
    const handleAdd = () => {
        if (!newStatus) { toast.error("Status name is required."); return; }
        setStatuses([...statuses, { id: Date.now(), name: newStatus }]);
        setNewStatus('');
    };
    return (
        <SettingsSection title="Asset Status Labels" subtitle="Customize the lifecycle statuses for your assets.">
            <div className="flex items-end gap-4 mb-4">
                <input value={newStatus} onChange={e => setNewStatus(e.target.value)} placeholder="New Status Name (e.g., In Transit)" className="w-full p-2 border rounded-md" />
                <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md whitespace-nowrap"><FaPlus /> Add</button>
            </div>
            <div className="space-y-2">
                {statuses.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{s.name}</span>
                        <button onClick={() => setStatuses(statuses.filter(st => st.id !== s.id))} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                    </div>
                ))}
            </div>
        </SettingsSection>
    );
};

const IdFormattingSettings = ({ categories, idFormats, setIdFormats }) => {
    const handleFormatChange = (categoryId, key, value) => {
        setIdFormats(prev => ({...prev, [categoryId]: {...(prev[categoryId] || {}), [key]: value}}));
    };
    return (
        <SettingsSection title="Asset ID Formatting" subtitle="Set custom prefixes and starting numbers for each asset category.">
            <div className="space-y-4">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                        <span className="font-semibold w-1/3">{cat.name}</span>
                        <input value={idFormats[cat.id]?.prefix || ''} onChange={e => handleFormatChange(cat.id, 'prefix', e.target.value)} placeholder="Prefix (e.g., IT-)" className="w-1/3 p-2 border rounded-md" />
                        <input value={idFormats[cat.id]?.startNumber || ''} onChange={e => handleFormatChange(cat.id, 'startNumber', e.target.value)} type="number" placeholder="Start Number (e.g., 1001)" className="w-1/3 p-2 border rounded-md" />
                    </div>
                ))}
            </div>
        </SettingsSection>
    );
};

const CustomFieldsSettings = ({ categories, customFields, setCustomFields }) => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newField, setNewField] = useState({ label: '', type: 'Text', required: false });
    const handleAdd = () => {
        if (!selectedCategory || !newField.label) { toast.error("Category and Field Label are required."); return; }
        const newFieldData = { ...newField, id: Date.now() };
        setCustomFields(prev => ({
            ...prev,
            [selectedCategory]: [...(prev[selectedCategory] || []), newFieldData]
        }));
        setNewField({ label: '', type: 'Text', required: false });
    };
    return (
        <SettingsSection title="Custom Fields" subtitle="Add unique fields to specific asset categories.">
            <div className="p-4 bg-blue-50 border-blue-200 border rounded-lg mb-6 space-y-4">
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-2 border rounded-md">
                    <option value="">1. Select a Category to Add Fields To...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {selectedCategory && (
                    <div className="flex items-end gap-4">
                        <input value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} placeholder="2. New Field Label (e.g., Screen Size)" className="w-full p-2 border rounded-md" />
                        <select value={newField.type} onChange={e => setNewField({...newField, type: e.target.value})} className="p-2 border rounded-md">
                            <option>Text</option><option>Number</option><option>Date</option>
                        </select>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={newField.required} onChange={e => setNewField({...newField, required: e.target.checked})} /> Required</label>
                        <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-md whitespace-nowrap"><FaPlus /> Add Field</button>
                    </div>
                )}
            </div>
            <div>
                <h4 className="font-semibold mb-2">Existing Custom Fields:</h4>
                {Object.keys(customFields).length === 0 && <p className="text-gray-500">No custom fields defined.</p>}
                {categories.filter(c => customFields[c.id]?.length > 0).map(cat => (
                    <div key={cat.id} className="mb-4">
                        <p className="font-bold">{cat.name}</p>
                        <div className="pl-4 space-y-2 mt-1">
                            {customFields[cat.id].map(field => (
                                <div key={field.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span>{field.label} <span className="text-xs text-gray-500">({field.type}){field.required && <span className="text-red-500">*</span>}</span></span>
                                    <button onClick={() => setCustomFields(prev => ({...prev, [cat.id]: prev[cat.id].filter(f => f.id !== field.id)}))} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </SettingsSection>
    );
};

// --- Main Page Component ---
const AssetSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('categories');
    
    // Central state for all settings
    const [categories, setCategories] = useState([{ id: 1, name: 'IT Equipment', depreciationRate: '33.33' }, { id: 2, name: 'Office Furniture', depreciationRate: '10' }]);
    const [locations, setLocations] = useState([{ id: 1, name: 'Mumbai Head Office', address: '123 Business Rd' }]);
    const [statuses, setStatuses] = useState([{ id: 1, name: 'In Stock' }, { id: 2, name: 'Assigned' }, { id: 3, name: 'Under Maintenance' }]);
    const [idFormats, setIdFormats] = useState({ 1: { prefix: 'IT-', startNumber: '1001' } });
    const [customFields, setCustomFields] = useState({ 1: [{ id: 1, label: 'RAM', type: 'Text', required: true }] });

    const handleSaveChanges = () => {
        console.log("Saving all settings:", { categories, locations, statuses, idFormats, customFields });
        toast.success("Asset settings saved successfully!");
    };

    const settingsTabs = [
        { id: 'categories', label: 'Categories', icon: FaListAlt, component: <CategorySettings categories={categories} setCategories={setCategories} /> },
        { id: 'locations', label: 'Locations', icon: FaMapMarkedAlt, component: <LocationSettings locations={locations} setLocations={setLocations} /> },
        { id: 'statuses', label: 'Status Labels', icon: FaCheckSquare, component: <StatusSettings statuses={statuses} setStatuses={setStatuses} /> },
        { id: 'customFields', label: 'Custom Fields', icon: FaCog, component: <CustomFieldsSettings categories={categories} customFields={customFields} setCustomFields={setCustomFields} /> },
        { id: 'idFormatting', label: 'ID Formatting', icon: FaFont, component: <IdFormattingSettings categories={categories} idFormats={idFormats} setIdFormats={setIdFormats} /> },
    ];

    return (
        <AssetManagementLayout>
            <div className="p-6">
                 <header className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Asset Management Settings</h1>
                    <p className="text-gray-500 mt-1">Configure and standardize your company's asset tracking system.</p>
                </header>
                
                <div className="flex gap-8">
                    <aside className="w-1/4">
                        <nav className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            {settingsTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <tab.icon className="text-lg" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>
                    
                    <main className="flex-1">
                        <div className="space-y-8">
                            {settingsTabs.find(tab => tab.id === activeTab)?.component}
                        </div>
                        
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSaveChanges}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                            >
                                Save All Changes
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        </AssetManagementLayout>
    );
};

export default AssetSettingsPage; 