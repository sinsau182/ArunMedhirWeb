////////////////aasset management .........setting .js


   
import React, { useState, useRef, useMemo } from 'react';
import AssetManagementLayout from '@/components/AssetManagementLayout';
import { toast } from 'sonner';
import { FaPlus, FaTrash, FaListAlt, FaMapMarkedAlt, FaCheckSquare, FaFont, FaCog, FaQuestionCircle, FaTags, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAssetCategories, addAssetCategory, updateAssetCategory, batchUpdateAssetCategories, deleteAssetCategory } from '@/redux/slices/assetCategorySlice';
import { fetchAssetLocations, addAssetLocation, deleteAssetLocation, batchUpdateAssetLocations } from '@/redux/slices/assetLocationSlice';
import { fetchAssetStatuses, addAssetStatus, deleteAssetStatus, batchUpdateAssetStatuses } from '@/redux/slices/assetStatusSlice';
import { fetchCustomFields, addCustomField, toggleCustomFieldStatus, deleteCustomField, updateCustomFieldsForCategory, clearFieldsForCategory } from '@/redux/slices/customFieldsSlice';
import { fetchIdFormattings, addIdFormatting, updateIdFormatting } from '@/redux/slices/idFormattingSlice';
import { useEffect } from 'react';

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

const CategorySettings = ({
  editing,
  editedCategories,
  setEditedCategories,
  newCategory,
  setNewCategory,
  onAdd,
  onFieldChange,
  loading,
  onDelete,
}) => {
  const isAddDisabled =
    !newCategory.name ||
    !newCategory.depreciationRate ||
    isNaN(Number(newCategory.depreciationRate)) ||
    Number(newCategory.depreciationRate) <= 0 ||
    loading;
  return (
    <SettingsSection
      title="Asset Categories"
      subtitle="Add categories to your assets"
    >
      <div className="flex items-end gap-4 mb-4 w-full max-w-3xl mx-auto">
        <input
          value={newCategory.name}
          onChange={e =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
          placeholder="New Category Name (e.g., IT Equipment)"
          className="flex-1 min-w-[220px] p-3 border rounded-md text-base"
        />
        <input
          value={newCategory.depreciationRate}
          onChange={e =>
            setNewCategory({
              ...newCategory,
              depreciationRate: e.target.value,
            })
          }
          type="number"
          placeholder="Depreciation Rate (%)"
          className="w-56 p-3 border rounded-md text-base"
        />
        <button
          onClick={onAdd}
          className={`px-7 py-3 bg-blue-600 text-white rounded-md whitespace-nowrap text-base font-semibold shadow-sm transition-all duration-150 ${
            isAddDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isAddDisabled}
        >
          <FaPlus className="inline mr-1" /> Add
        </button>
      </div>
      {loading && <div className="text-blue-600">Loading...</div>}
      <div className="space-y-2">
        {editedCategories.map(cat => (
          <div
            key={cat.id || cat.categoryId}
            className="flex justify-between items-center p-2 bg-gray-50 rounded"
          >
            <div className="flex-1 flex gap-2 items-center">
              {editing ? (
                <>
                  <input
                    className="w-1/2 p-1 border rounded-md"
                    value={cat.name}
                    onChange={e =>
                      onFieldChange(cat.id, "name", e.target.value)
                    }
                  />
                  <input
                    className="w-1/4 p-1 border rounded-md"
                    value={cat.depreciationRate}
                    onChange={e =>
                      onFieldChange(cat.id, "depreciationRate", e.target.value)
                    }
                    type="number"
                  />
                </>
              ) : (
                <span>
                  {cat.name}{" "}
                  {cat.depreciationRate !== undefined &&
                  cat.depreciationRate !== null &&
                  cat.depreciationRate !== ""
                    ? `(${cat.depreciationRate}%)`
                    : ""}
                </span>
              )}
            </div>
            <button
              className="text-red-500 hover:text-red-700 ml-2"
              title="Delete Category"
              onClick={() => onDelete(cat.categoryId || cat.id, cat.name)}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
};
const LocationSettings = ({ editing, editedLocations, setEditedLocations, newLocation, setNewLocation, onAdd, onFieldChange, loading, onDelete }) => {
    const isAddDisabled = !newLocation.name || loading;
    return (
        <SettingsSection title="Asset Locations" subtitle="Manage the physical locations where assets are stored or assigned.">
            <div className="flex items-end gap-4 mb-4 w-full max-w-3xl mx-auto">
                <input 
                    value={newLocation.name} 
                    onChange={e => setNewLocation({...newLocation, name: e.target.value})} 
                    placeholder="New Location Name (e.g., Mumbai Office)" 
                    className="flex-1 min-w-[220px] p-3 border rounded-md text-base" 
                />
                <input 
                    value={newLocation.address} 
                    onChange={e => setNewLocation({...newLocation, address: e.target.value})} 
                    placeholder="Address (Optional)" 
                    className="w-56 p-3 border rounded-md text-base" 
                />
                <button 
                    onClick={onAdd} 
                    className={`px-7 py-3 bg-blue-600 text-white rounded-md whitespace-nowrap text-base font-semibold shadow-sm transition-all duration-150 ${isAddDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isAddDisabled}
                >
                    <FaPlus className="inline mr-1" /> Add
                </button>
            </div>
            {loading && <div className="text-blue-600">Loading...</div>}
            <div className="space-y-2">
                {editedLocations.map(loc => (
                    <div key={loc.id || loc.locationId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1 flex gap-2 items-center">
                        {editing ? (
                            <>
                                <input
                                    className="w-1/2 p-1 border rounded-md"
                                    value={loc.name}
                                    onChange={e => onFieldChange(loc.id, 'name', e.target.value)}
                                />
                                <input
                                    className="w-1/2 p-1 border rounded-md"
                                    value={loc.address}
                                    onChange={e => onFieldChange(loc.id, 'address', e.target.value)}
                                />
                            </>
                        ) : (
                            <span>{loc.name}{loc.address && ` - ${loc.address}`}</span>
                        )}
                        </div>
                        <button
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Delete Location"
                            onClick={() => onDelete(loc.locationId || loc.id, loc.name)}
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
        </SettingsSection>
    );
};

const StatusSettings = ({ editing, editedStatuses, setEditedStatuses, newStatus, setNewStatus, onAdd, onFieldChange, loading, onDelete }) => {
    const isAddDisabled = !newStatus.name || loading;
    return (
        <SettingsSection title="Asset Status Labels" subtitle="Customize the lifecycle statuses for your assets.">
            <div className="flex items-end gap-4 mb-4 w-full max-w-2xl mx-auto">
                <input 
                    value={newStatus.name} 
                    onChange={e => setNewStatus({ name: e.target.value })} 
                    placeholder="New Status Name (e.g., In Transit)" 
                    className="flex-1 min-w-[220px] p-3 border rounded-md text-base" 
                />
                <button 
                    onClick={onAdd} 
                    className={`px-7 py-3 bg-blue-600 text-white rounded-md whitespace-nowrap text-base font-semibold shadow-sm transition-all duration-150 ${isAddDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isAddDisabled}
                >
                    <FaPlus className="inline mr-1" /> Add
                </button>
            </div>
            {loading && <div className="text-blue-600">Loading...</div>}
            <div className="space-y-2">
                {editedStatuses.map(s => (
                    <div key={s.id || s.statusId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex-1 flex gap-2 items-center">
                        {editing ? (
                            <input
                                className="w-2/3 p-1 border rounded-md"
                                value={s.name}
                                onChange={e => onFieldChange(s.id, e.target.value)}
                            />
                        ) : (
                        <span>{s.name}</span>
                        )}
                        </div>
                        <button
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Delete Status Label"
                            onClick={() => onDelete(s.statusId || s.id, s.name)}
                        >
                            <FaTrash />
                        </button>
                    </div>
                ))}
            </div>
        </SettingsSection>
    );
};

const IdFormattingSettings = ({ categories, editing }) => {
    const dispatch = useDispatch();
    const { formattingsByCategory, loading, error } = useSelector(state => state.idFormatting);
    const [tempFormats, setTempFormats] = useState({});

    const safeCategories = useMemo(() => Array.isArray(categories) ? categories : [], [categories]);

    useEffect(() => {
        dispatch(fetchIdFormattings());
    }, [dispatch]);

    // When exiting edit mode, batch save all changes
    useEffect(() => {
        const saveAll = async () => {
            if (!editing && Object.keys(tempFormats).length > 0) {
                for (const [categoryId, tempFormat] of Object.entries(tempFormats)) {
                    // Validation
                    const prefix = (tempFormat.prefix || '').trim();
                    const objectId = (tempFormat.objectId || '').trim();
                    const startNumber = tempFormat.startNumber !== undefined ? parseInt(tempFormat.startNumber) : null;

                    if (!prefix) {
                        toast.error(`Prefix is required for ${categories.find(c => (c.categoryId || c.id) === categoryId)?.name || 'category'}.`);
                        continue;
                    }
                    if (!objectId) {
                        toast.error(`Object ID is required for ${categories.find(c => (c.categoryId || c.id) === categoryId)?.name || 'category'}.`);
                        continue;
                    }
                    if (startNumber === null || isNaN(startNumber) || startNumber < 0) {
                        toast.error(`Start Number must be a non-negative number for ${categories.find(c => (c.categoryId || c.id) === categoryId)?.name || 'category'}.`);
                        continue;
                    }

                    const hasExisting = !!formattingsByCategory[categoryId];
                    const payload = {
                        categoryId,
                        prefix,
                        objectId,
                        startNumber
                    };
                    if (hasExisting) {
                        await dispatch(updateIdFormatting({ categoryId, formattingData: payload })).unwrap();
                    } else {
                        await dispatch(addIdFormatting(payload)).unwrap();
                    }
                }
                await dispatch(fetchIdFormattings());
                setTempFormats({});
            }
        };
        saveAll();
        // eslint-disable-next-line
    }, [editing]);

    const handleFormatChange = (categoryId, key, value) => {
        setTempFormats(prev => {
            const backend = formattingsByCategory[categoryId] || {};
            const prevTemp = prev[categoryId] || {};
            return {
                ...prev,
                [categoryId]: {
                    prefix: key === 'prefix'
                        ? value.toUpperCase()
                        : (prevTemp.prefix !== undefined ? prevTemp.prefix : backend.prefix || ''),
                    objectId: key === 'objectId'
                        ? value
                        : (prevTemp.objectId !== undefined ? prevTemp.objectId : backend.objectId || ''),
                    startNumber: key === 'startNumber'
                        ? value
                        : (prevTemp.startNumber !== undefined ? prevTemp.startNumber : backend.startNumber || '')
                }
            };
        });
    };

    const getCurrentValue = (categoryId, field) => {
        if (tempFormats[categoryId] && tempFormats[categoryId][field] !== undefined) {
            return tempFormats[categoryId][field];
        }
        return formattingsByCategory[categoryId]?.[field] || '';
    };

   return (
    <SettingsSection
        title="Asset ID Formatting"
        subtitle="Set custom prefixes, object IDs, and starting numbers for each asset category."
    >
        {loading && <div className="text-blue-600 mb-4">Loading ID formatting settings...</div>}
        {error && <div className="text-red-600 mb-4">Error: {error}</div>}

        <div className="space-y-4">
            {safeCategories.map((cat) => {
                const categoryId = cat.categoryId || cat.id;

                return (
                    <div
                        key={categoryId}
                        className="grid grid-cols-4 gap-4 items-center p-3 bg-gray-50 rounded-md border"
                    >
                        {/* Category Name */}
                        <div className="font-semibold col-span-1">{cat.name}</div>

                        {/* Editable or Read-Only Fields */}
                        {['prefix', 'objectId', 'startNumber'].map((field, index) => (
                            <input
                                key={index}
                                value={getCurrentValue(categoryId, field)}
                                onChange={(e) =>
                                    editing && handleFormatChange(categoryId, field, e.target.value)
                                }
                                placeholder={
                                    field === 'prefix'
                                        ? 'Prefix (e.g., IT-)'
                                        : field === 'objectId'
                                        ? 'Object ID (e.g., 01)'
                                        : 'Start Number (e.g., 1001)'
                                }
                                type={field === 'startNumber' ? 'number' : 'text'}
                                disabled={!editing}
                                className={`w-full p-2 border rounded-md ${
                                    editing ? '' : 'bg-gray-100 text-gray-700'
                                }`}
                            />
                        ))}
                    </div>
                );
            })}
        </div>
    </SettingsSection>
);

};

const CustomFieldsSettings = ({ editing }) => {
    const dispatch = useDispatch();
    const { fieldsByCategory, loading, error } = useSelector(state => state.customFields);
    const { categories, loading: categoriesLoading } = useSelector(state => state.assetCategories);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [newField, setNewField] = useState({ label: '', type: 'Text', required: false, enabled: true });
    const [editedFields, setEditedFields] = useState({});

    // Fetch categories when component mounts
    useEffect(() => {
        dispatch(fetchAssetCategories());
    }, [dispatch]);

    // Fetch custom fields when category is selected
    useEffect(() => {
        if (selectedCategory) {
            console.log('Fetching custom fields for category:', selectedCategory);
            console.log('API URL will be:', `http://localhost:8080/api/asset-settings/custom-fields?categoryId=${selectedCategory}`);
            
            // Clear existing fields for this category to avoid stale data
            dispatch(clearFieldsForCategory(selectedCategory));
            
            // Fetch fresh fields for the selected category
            dispatch(fetchCustomFields(selectedCategory));
        }
    }, [selectedCategory, dispatch]);

    // Debug: Log the fieldsByCategory data
    useEffect(() => {
        console.log('fieldsByCategory:', fieldsByCategory);
        if (selectedCategory) {
            console.log('Fields for selected category:', fieldsByCategory[selectedCategory]);
        }
    }, [fieldsByCategory, selectedCategory]);

    // Initialize edited fields when entering edit mode
    useEffect(() => {
        if (editing && selectedCategory && fieldsByCategory[selectedCategory]) {
            const fieldsObj = {};
            const categoryFields = fieldsByCategory[selectedCategory];
            console.log('Initializing edited fields for category:', selectedCategory, categoryFields);
            
            if (Array.isArray(categoryFields)) {
                categoryFields.forEach(field => {
                    // Map _id to id for consistency
                    const fieldId = field.id || field._id;
                    console.log('Processing field:', field, 'mapped ID:', fieldId);
                    fieldsObj[fieldId] = { 
                        ...field,
                        id: fieldId
                    };
                });
            }
            setEditedFields(fieldsObj);
            console.log('Set edited fields:', fieldsObj);
        }
    }, [editing, selectedCategory, fieldsByCategory]);

    const handleAdd = async () => {
        if (!selectedCategory || !newField.label) { 
            toast.error("Category and Field Label are required."); 
            return; 
        }
        
        try {
            console.log('Adding field:', { categoryId: selectedCategory, ...newField });
            await dispatch(addCustomField({
                categoryId: selectedCategory, // Use the categoryId, not MongoDB _id
                label: newField.label,
                type: newField.type,
                required: newField.required,
                enabled: newField.enabled
            }));
            setNewField({ label: '', type: 'Text', required: false, enabled: true });
            toast.success("Custom field added successfully!");
        } catch (error) {
            console.error('Failed to add custom field:', error);
            toast.error("Failed to add custom field");
        }
    };

    const handleFieldChange = (fieldId, key, value) => {
        console.log('Field change:', fieldId, key, value);
        setEditedFields(prev => ({
            ...prev,
            [fieldId]: {
                ...prev[fieldId],
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        if (!selectedCategory) return;
        
        try {
            const fieldsToUpdate = Object.values(editedFields);
            console.log('Saving fields:', fieldsToUpdate);
            await dispatch(updateCustomFieldsForCategory({
                categoryId: selectedCategory,
                fields: fieldsToUpdate
            }));
            toast.success("Custom fields updated successfully!");
        } catch (error) {
            console.error('Failed to update custom fields:', error);
            toast.error("Failed to update custom fields");
        }
    };

    const handleDelete = async (fieldId) => {
        try {
            console.log('Deleting field:', fieldId);
            await dispatch(deleteCustomField(fieldId));
            toast.success("Custom field deleted successfully!");
        } catch (error) {
            console.error('Failed to delete custom field:', error);
            toast.error("Failed to delete custom field");
        }
    };

    const handleToggleStatus = async (fieldId, enabled) => {
        try {
            console.log('Toggling field status:', fieldId, enabled);
            await dispatch(toggleCustomFieldStatus({ id: fieldId, enabled }));
            toast.success(`Custom field ${enabled ? 'enabled' : 'disabled'} successfully!`);
        } catch (error) {
            console.error('Failed to toggle field status:', error);
            toast.error("Failed to toggle field status");
        }
    };

    // Safely get current fields with proper fallback and map _id to id
    const currentFields = selectedCategory && fieldsByCategory[selectedCategory] 
        ? (Array.isArray(fieldsByCategory[selectedCategory]) 
            ? fieldsByCategory[selectedCategory].map(field => ({
                ...field,
                id: field.id || field._id // Ensure we have an id field
            }))
            : [])
        : [];

    console.log('Current fields to render:', currentFields);

    return (
        <SettingsSection title="Custom Fields" subtitle="Add unique fields to specific asset categories.">
            <div className="p-4 bg-blue-50 border-blue-200 border rounded-lg mb-6 space-y-4">
                <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)} 
                    className="w-full p-2 border rounded-md"
                    disabled={categoriesLoading}
                >
                    <option value="">1. Select a Category to Add Fields To...</option>
                    {categories && Array.isArray(categories) && categories.map(c => (
                        <option key={c.categoryId || c.id} value={c.categoryId || c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                {categoriesLoading && <div className="text-blue-600">Loading categories...</div>}
                {selectedCategory && (
                    <div className="flex items-end gap-4">
                        <input 
                            value={newField.label} 
                            onChange={e => setNewField({...newField, label: e.target.value})} 
                            placeholder="2. New Field Label (e.g., Screen Size)" 
                            className="w-full p-2 border rounded-md" 
                        />
                        <select 
                            value={newField.type} 
                            onChange={e => setNewField({...newField, type: e.target.value})} 
                            className="p-2 border rounded-md"
                        >
                            <option>Text</option><option>Number</option><option>Date</option>
                        </select>
                        <label className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                checked={newField.required} 
                                onChange={e => setNewField({...newField, required: e.target.checked})} 
                            /> 
                            Required
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={newField.enabled}
                                onChange={e => setNewField({...newField, enabled: e.target.checked})}
                            />
                            Enabled
                        </label>
                        <button 
                            onClick={handleAdd} 
                            className="px-4 py-2 bg-blue-600 text-white rounded-md whitespace-nowrap"
                            disabled={loading}
                        >
                            <FaPlus /> Add Field
                        </button>
                    </div>
                )}
            </div>
            
            {selectedCategory && (
            <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Existing Custom Fields:</h4>
                        {editing && currentFields.length > 0 && (
                            <button 
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white rounded-md"
                                disabled={loading}
                            >
                                <FaSave /> Save Changes
                            </button>
                        )}
                    </div>
                    
                    {loading && <div className="text-blue-600">Loading...</div>}
                    {error && <div className="text-red-600">Error: {error}</div>}
                    
                    {currentFields.length === 0 && !loading && (
                        <p className="text-gray-500">No custom fields defined for this category.</p>
                    )}
                    
                    <div className="space-y-2">
                        {currentFields.map(field => {
                            console.log('Rendering field:', field);
                            return (
                                <div key={field.id} className={`flex items-center gap-3 p-3 bg-gray-50 rounded ${!field.enabled ? 'opacity-50' : ''}`}> 
                                    {editing ? (
                                        <>
                                            <input
                                                className="w-1/4 p-2 border rounded-md"
                                                value={editedFields[field.id]?.label || field.label || ''}
                                                onChange={e => handleFieldChange(field.id, 'label', e.target.value)}
                                            />
                                            <select
                                                className="p-2 border rounded-md"
                                                value={editedFields[field.id]?.type || field.type || 'Text'}
                                                onChange={e => handleFieldChange(field.id, 'type', e.target.value)}
                                            >
                                                <option>Text</option><option>Number</option><option>Date</option>
                                            </select>
                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="checkbox"
                                                    checked={editedFields[field.id]?.required !== undefined ? editedFields[field.id].required : (field.required || false)}
                                                    onChange={e => handleFieldChange(field.id, 'required', e.target.checked)}
                                                />
                                                <span className="text-sm">Required</span>
                                            </label>
                                            <label className="flex items-center gap-1">
                                                <input
                                                    type="checkbox"
                                                    checked={editedFields[field.id]?.enabled !== undefined ? editedFields[field.id].enabled : (field.enabled !== false)}
                                                    onChange={e => handleFieldChange(field.id, 'enabled', e.target.checked)}
                                                />
                                                <span className="text-sm">Enabled</span>
                                            </label>
                                            <button 
                                                onClick={() => handleDelete(field.id)} 
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="w-1/4 font-medium">{field.label || 'No Label'}</span>
                                            <span className="text-sm text-gray-500">({field.type || 'Text'}){field.required && <span className="text-red-500">*</span>}</span>
                                            <button
                                                onClick={() => handleToggleStatus(field.id, !field.enabled)}
                                                className={`text-sm font-semibold px-3 py-1 rounded ${field.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {field.enabled ? 'Enabled' : 'Disabled'}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(field.id)} 
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
            </div>
            )}
        </SettingsSection>
    );
};

// Delete confirmation modal
const DeleteCategoryModal = ({ open, onClose, onConfirm, categoryName }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                    <FaTrash /> Delete Category
                </h2>
                <p className="mb-4 text-gray-700">Are you sure you want to delete the category <span className="font-semibold">"{categoryName}"</span>?<br/>This action <span className="text-red-600 font-semibold">cannot be undone</span> and may affect assets linked to this category.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
};

const DeleteLocationModal = ({ open, onClose, onConfirm, locationName }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                    <FaTrash /> Delete Location
                </h2>
                <p className="mb-4 text-gray-700">Are you sure you want to delete the location <span className="font-semibold">"{locationName}"</span>?<br/>This action <span className="text-red-600 font-semibold">cannot be undone</span> and may affect assets linked to this location.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
};

const DeleteStatusModal = ({ open, onClose, onConfirm, statusName }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
                    <FaTrash /> Delete Status Label
                </h2>
                <p className="mb-4 text-gray-700">Are you sure you want to delete the status label <span className="font-semibold">"{statusName}"</span>?<br/>This action <span className="text-red-600 font-semibold">cannot be undone</span> and may affect assets linked to this status.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AssetSettingsPage = () => {
    const dispatch = useDispatch();
    const { categories, loading, error } = useSelector(state => state.assetCategories);
    const { locations, loading: locationsLoading, error: locationsError } = useSelector(state => state.assetLocations);
    const { statuses, loading: statusesLoading, error: statusesError } = useSelector(state => state.assetStatuses);
    const [activeTab, setActiveTab] = useState('categories');
    
    // Separate editing states for each section
    const [editingCategories, setEditingCategories] = useState(false);
    const [editingLocations, setEditingLocations] = useState(false);
    const [editingStatuses, setEditingStatuses] = useState(false);
    const [editingCustomFields, setEditingCustomFields] = useState(false);
    const [editingIdFormats, setEditingIdFormats] = useState(false);
    
    // Central state for all settings
    const [customFields, setCustomFields] = useState({ 1: [{ id: 1, label: 'RAM', type: 'Text', required: true, enabled: true }] });

    // State for editing categories
    const [editedCategories, setEditedCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', depreciationRate: '' });

    // State for editing locations
    const [editedLocations, setEditedLocations] = useState([]);
    const [newLocation, setNewLocation] = useState({ name: '', address: '' });
    const [deleteLocationModal, setDeleteLocationModal] = useState({ open: false, locationId: null, name: '' });

    // State for editing statuses
    const [editedStatuses, setEditedStatuses] = useState([]);
    const [newStatus, setNewStatus] = useState({ name: '' });
    const [deleteStatusModal, setDeleteStatusModal] = useState({ open: false, statusId: null, name: '' });

    // Store initial state for cancel functionality
    const initialStateRef = useRef({
        categories: [{ id: 1, name: 'IT Equipment', depreciationRate: '33.33' }, { id: 2, name: 'Office Furniture', depreciationRate: '10' }],
        locations: [{ id: 1, name: 'Mumbai Head Office', address: '123 Business Rd' }],
        statuses: [{ id: 1, name: 'In Stock' }, { id: 2, name: 'Assigned' }, { id: 3, name: 'Under Maintenance' }],
        customFields: { 1: [{ id: 1, label: 'RAM', type: 'Text', required: true, enabled: true }] }
    });

    const [deleteModal, setDeleteModal] = useState({ open: false, categoryId: null, name: '' });

    useEffect(() => {
        dispatch(fetchAssetCategories());
    }, [dispatch]);

    useEffect(() => {
        setEditedCategories(categories);
    }, [categories]);

    useEffect(() => {
        dispatch(fetchAssetLocations());
    }, [dispatch]);
    useEffect(() => {
        setEditedLocations(locations);
    }, [locations]);

    useEffect(() => {
        dispatch(fetchAssetStatuses());
    }, [dispatch]);
    useEffect(() => {
        setEditedStatuses(statuses);
    }, [statuses]);

    const handleAddCategory = () => {
        if (!newCategory.name) { toast.error("Category name is required."); return; }
        if (!newCategory.depreciationRate || isNaN(Number(newCategory.depreciationRate)) || Number(newCategory.depreciationRate) <= 0) {
            toast.error("Depreciation Rate must be a positive number.");
            return;
        }
        dispatch(addAssetCategory({ name: newCategory.name, depreciationRate: parseFloat(newCategory.depreciationRate) }))
            .then(() => {
                setNewCategory({ name: '', depreciationRate: '' });
                dispatch(fetchAssetCategories());
            });
    };

    const handleCategoryFieldChange = (catId, key, value) => {
        setEditedCategories(editedCategories.map(cat => cat.id === catId ? { ...cat, [key]: value } : cat));
    };

    const handleSaveCategories = async () => {
        // Only update categories that have changed
        const changed = editedCategories.filter(edited => {
            const orig = categories.find(c => c.id === edited.id);
            return orig && (orig.name !== edited.name || String(orig.depreciationRate) !== String(edited.depreciationRate));
        });
        if (changed.length > 0) {
            // Prepare payload for batch update
            const payload = changed.map(cat => ({
                categoryId: cat.categoryId || cat.id, // fallback to id if categoryId missing
                name: cat.name,
                depreciationRate: parseFloat(cat.depreciationRate)
            }));
            await dispatch(batchUpdateAssetCategories(payload));
            await dispatch(fetchAssetCategories());
        }
        setEditingCategories(false);
        toast.success("Categories updated successfully!");
    };

    const handleCancelCategories = () => {
        // Revert to initial state
        setEditedCategories((categories));
        setNewCategory({ name: '', depreciationRate: '' });
        setEditingCategories(false);
        toast.info("Category changes cancelled. Settings reverted to last saved state.");
    };

    const handleDeleteCategory = (categoryId, name) => {
        setDeleteModal({ open: true, categoryId, name });
    };
    const confirmDeleteCategory = () => {
        dispatch(deleteAssetCategory(deleteModal.categoryId)).then(() => dispatch(fetchAssetCategories()));
        setDeleteModal({ open: false, categoryId: null, name: '' });
    };
    const cancelDeleteCategory = () => {
        setDeleteModal({ open: false, categoryId: null, name: '' });
    };

    const handleAddLocation = () => {
        if (!newLocation.name) { toast.error("Location name is required."); return; }
        dispatch(addAssetLocation({ name: newLocation.name, address: newLocation.address }))
            .then(() => {
                setNewLocation({ name: '', address: '' });
                dispatch(fetchAssetLocations());
            });
    };
    const handleLocationFieldChange = (locId, key, value) => {
        setEditedLocations(editedLocations.map(loc => loc.id === locId ? { ...loc, [key]: value } : loc));
    };
    const handleSaveLocations = async () => {
        // Prepare payload for batch update (send all edited locations)
        const payload = editedLocations.map(loc => ({
            locationId: loc.locationId || loc.id,
            name: loc.name,
            address: loc.address
        }));
        if (payload.length > 0) {
            await dispatch(batchUpdateAssetLocations(payload));
            await dispatch(fetchAssetLocations());
        }
        setEditingLocations(false);
        toast.success("Locations updated successfully!");
    };

    const handleCancelLocations = () => {
        setEditedLocations(locations);
        setNewLocation({ name: '', address: '' });
        setEditingLocations(false);
        toast.info("Location changes cancelled. Settings reverted to last saved state.");
    };

    const handleDeleteLocation = (locationId, name) => {
        setDeleteLocationModal({ open: true, locationId, name });
    };
    const confirmDeleteLocation = () => {
        dispatch(deleteAssetLocation(deleteLocationModal.locationId)).then(() => dispatch(fetchAssetLocations()));
        setDeleteLocationModal({ open: false, locationId: null, name: '' });
    };
    const cancelDeleteLocation = () => {
        setDeleteLocationModal({ open: false, locationId: null, name: '' });
    };

    const handleAddStatus = () => {
        if (!newStatus.name) { toast.error("Status name is required."); return; }
        dispatch(addAssetStatus({ name: newStatus.name }))
            .then(() => {
                setNewStatus({ name: '' });
                dispatch(fetchAssetStatuses());
            });
    };
    const handleStatusFieldChange = (statusId, value) => {
        setEditedStatuses(editedStatuses.map(s => s.id === statusId ? { ...s, name: value } : s));
    };
    const handleSaveStatuses = async () => {
        // Prepare payload for batch update (send all edited statuses with valid statusLabelId only)
        const payload = editedStatuses
            .filter(s => s.statusLabelId) // Only include those with a valid statusLabelId
            .map(s => ({
                statusLabelId: s.statusLabelId,
                name: s.name,
                ...(s.color ? { color: s.color } : {}) // include color if present
            }));
        if (payload.length > 0) {
            await dispatch(batchUpdateAssetStatuses(payload));
            await dispatch(fetchAssetStatuses());
        }
        setEditingStatuses(false);
        toast.success("Status labels updated successfully!");
    };

    const handleCancelStatuses = () => {
        setEditedStatuses(statuses);
        setNewStatus({ name: '' });
        setEditingStatuses(false);
        toast.info("Status changes cancelled. Settings reverted to last saved state.");
    };

    const handleDeleteStatus = (statusId, name) => {
        setDeleteStatusModal({ open: true, statusId, name });
    };
    const confirmDeleteStatus = () => {
        dispatch(deleteAssetStatus(deleteStatusModal.statusId)).then(() => dispatch(fetchAssetStatuses()));
        setDeleteStatusModal({ open: false, statusId: null, name: '' });
    };
    const cancelDeleteStatus = () => {
        setDeleteStatusModal({ open: false, statusId: null, name: '' });
    };

    const handleSaveCustomFields = () => {
        setEditingCustomFields(false);
        toast.success("Custom fields updated successfully!");
    };

    const handleCancelCustomFields = () => {
        setCustomFields(JSON.parse(JSON.stringify(initialStateRef.current.customFields)));
        setEditingCustomFields(false);
        toast.info("Custom field changes cancelled. Settings reverted to last saved state.");
    };

    const handleSaveIdFormats = async () => {
        // This will be handled by individual category updates in the component
        setEditingIdFormats(false);
        toast.success("ID formatting updated successfully!");
    };

    const handleCancelIdFormats = () => {
        setEditingIdFormats(false);
        toast.info("ID format changes cancelled. Settings reverted to last saved state.");
    };

    const settingsTabs = [
        { 
            id: 'categories', 
            label: 'Categories', 
            icon: FaListAlt, 
            editing: editingCategories,
            setEditing: setEditingCategories,
            onSave: handleSaveCategories,
            onCancel: handleCancelCategories,
            component: <CategorySettings 
                editing={editingCategories} 
                editedCategories={editedCategories} 
                setEditedCategories={setEditedCategories} 
                newCategory={newCategory} 
                setNewCategory={setNewCategory} 
                onAdd={handleAddCategory} 
                onFieldChange={handleCategoryFieldChange} 
                loading={loading} 
                onDelete={handleDeleteCategory} 
            /> 
        },
        { 
            id: 'locations', 
            label: 'Locations', 
            icon: FaMapMarkedAlt, 
            editing: editingLocations,
            setEditing: setEditingLocations,
            onSave: handleSaveLocations,
            onCancel: handleCancelLocations,
            component: <LocationSettings 
                editing={editingLocations} 
                editedLocations={editedLocations} 
                setEditedLocations={setEditedLocations} 
                newLocation={newLocation} 
                setNewLocation={setNewLocation} 
                onAdd={handleAddLocation} 
                onFieldChange={handleLocationFieldChange} 
                loading={locationsLoading} 
                onDelete={handleDeleteLocation} 
            /> 
        },
        { 
            id: 'statuses', 
            label: 'Status Labels', 
            icon: FaCheckSquare, 
            editing: editingStatuses,
            setEditing: setEditingStatuses,
            onSave: handleSaveStatuses,
            onCancel: handleCancelStatuses,
            component: <StatusSettings 
                editing={editingStatuses} 
                editedStatuses={editedStatuses} 
                setEditedStatuses={setEditedStatuses} 
                newStatus={newStatus} 
                setNewStatus={setNewStatus} 
                onAdd={handleAddStatus} 
                onFieldChange={handleStatusFieldChange} 
                loading={statusesLoading} 
                onDelete={handleDeleteStatus} 
            /> 
        },
        { 
            id: 'customFields', 
            label: 'Custom Fields', 
            icon: FaCog, 
            editing: editingCustomFields,
            setEditing: setEditingCustomFields,
            onSave: null, // No global save button - Custom Fields has its own Save Changes button
            onCancel: handleCancelCustomFields,
            component: <CustomFieldsSettings 
                editing={editingCustomFields} 
            /> 
        },
        { 
            id: 'idFormatting', 
            label: 'ID Formatting', 
            icon: FaFont, 
            editing: editingIdFormats,
            setEditing: setEditingIdFormats,
            onSave: handleSaveIdFormats,
            onCancel: handleCancelIdFormats,
            component: <IdFormattingSettings 
                categories={categories} 
                editing={editingIdFormats} 
            /> 
        },
    ];

    return (
        <AssetManagementLayout>
            <DeleteCategoryModal
                open={deleteModal.open}
                onClose={cancelDeleteCategory}
                onConfirm={confirmDeleteCategory}
                categoryName={deleteModal.name}
            />
            <DeleteLocationModal
                open={deleteLocationModal.open}
                onClose={cancelDeleteLocation}
                onConfirm={confirmDeleteLocation}
                locationName={deleteLocationModal.name}
            />
            <DeleteStatusModal
                open={deleteStatusModal.open}
                onClose={cancelDeleteStatus}
                onConfirm={confirmDeleteStatus}
                statusName={deleteStatusModal.name}
            />
            <div className="p-6">
                 <header className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                    <h1 className="text-3xl font-bold text-gray-800">Asset Management Settings</h1>
                    <p className="text-gray-500 mt-1">Configure and standardize your company's asset tracking system.</p>
                        </div>
                    </div>
                </header>
                
                <div className="flex gap-8">
                    <aside className="w-1/4">
                        <nav className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            {settingsTabs.map(tab => {
                                const isActive = activeTab === tab.id;
                                const isDisabled = tab.id === 'customFields';
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            if (!isDisabled) setActiveTab(tab.id);
                                        }}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors
                                            ${isActive && !isDisabled ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}
                                            ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : ''}`}
                                        disabled={isDisabled}
                                    >
                                        <tab.icon className="text-lg" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>
                    
                    <main className="flex-1">
                        <div className="space-y-8">
                            {(() => {
                                const activeTabData = settingsTabs.find(tab => tab.id === activeTab);
                                if (!activeTabData) return null;
                                if (activeTabData.id === 'customFields') {
                                    return (
                                        <div className="p-8 text-center text-gray-500">
                                            <h2 className="text-2xl font-bold mb-4">Custom Fields</h2>
                                            <p>Coming Soon..</p>
                                        </div>
                                    );
                                }
                                return (
                                    <div>
                                        <div className="flex justify-end items-center -mb-10">
                                            <div className="flex -gap-5">
                                                {!activeTabData.editing ? (
                                                    <button
                                                        onClick={() => activeTabData.setEditing(true)}
                                                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium flex items-center gap-2"
                                                    >
                                                        <FaEdit /> Edit {activeTabData.label}
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={activeTabData.onCancel}
                                                            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-medium flex items-center gap-2"
                                                        >
                                                            <FaTimes /> Cancel
                                                        </button>
                                                        {activeTabData.onSave && (
                                                            <button
                                                                onClick={activeTabData.onSave}
                                                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center gap-2"
                                                            >
                                                                <FaSave /> Save {activeTabData.label}
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        {activeTabData.component}
                                    </div>
                                );
                            })()}
                        </div>
                    </main>
                </div>
            </div>
        </AssetManagementLayout>
    );
};

export default AssetSettingsPage; 