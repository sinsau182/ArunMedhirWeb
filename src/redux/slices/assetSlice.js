import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getItemFromSessionStorage } from './sessionStorageSlice';

// Add new asset
export const addAsset = createAsyncThunk(
    'assets/addAsset',
    async (assetData, { rejectWithValue }) => {
        try {
            // Get authentication token
            const token = getItemFromSessionStorage('token', null);
            
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch('http://localhost:8080/api/assets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Note: Don't set Content-Type for FormData, let browser set it with boundary
                },
                body: assetData, // FormData object
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add asset');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch assets (for future use)
export const fetchAssets = createAsyncThunk(
    'assets/fetchAssets',
    async (_, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage('token', null);
            
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch('http://localhost:8080/api/assets', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch single asset by assetId
export const fetchAssetById = createAsyncThunk(
    'assets/fetchAssetById',
    async (assetId, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage('token', null);
            
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`http://localhost:8080/api/assets/asset/${assetId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Asset not found');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update asset by assetId
export const updateAsset = createAsyncThunk(
    'assets/updateAsset',
    async ({ assetId, assetData }, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage('token', null);
            
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`http://localhost:8080/api/assets/asset/${assetId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(assetData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update asset');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const assetSlice = createSlice({
    name: 'assets',
    initialState: {
        assets: [],
        currentAsset: null,
        loading: false,
        error: null,
        addingAsset: false,
        addAssetError: null,
        fetchingAsset: false,
        fetchAssetError: null,
        updatingAsset: false,
        updateAssetError: null,
    },
    reducers: {
        clearErrors: (state) => {
            state.error = null;
            state.addAssetError = null;
            state.fetchAssetError = null;
            state.updateAssetError = null;
        },
        clearCurrentAsset: (state) => {
            state.currentAsset = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Add asset cases
            .addCase(addAsset.pending, (state) => {
                state.addingAsset = true;
                state.addAssetError = null;
            })
            .addCase(addAsset.fulfilled, (state, action) => {
                state.addingAsset = false;
                // Add the new asset to the assets array
                state.assets.unshift(action.payload);
            })
            .addCase(addAsset.rejected, (state, action) => {
                state.addingAsset = false;
                state.addAssetError = action.payload;
            })
            // Fetch assets cases
            .addCase(fetchAssets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAssets.fulfilled, (state, action) => {
                state.loading = false;
                state.assets = action.payload;
            })
            .addCase(fetchAssets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch single asset cases
            .addCase(fetchAssetById.pending, (state) => {
                state.fetchingAsset = true;
                state.fetchAssetError = null;
                state.currentAsset = null;
            })
            .addCase(fetchAssetById.fulfilled, (state, action) => {
                state.fetchingAsset = false;
                state.currentAsset = action.payload;
            })
            .addCase(fetchAssetById.rejected, (state, action) => {
                state.fetchingAsset = false;
                state.fetchAssetError = action.payload;
                state.currentAsset = null;
            })
            // Update asset cases
            .addCase(updateAsset.pending, (state) => {
                state.updatingAsset = true;
                state.updateAssetError = null;
            })
            .addCase(updateAsset.fulfilled, (state, action) => {
                state.updatingAsset = false;
                state.currentAsset = action.payload;
                // Also update the asset in the assets array if it exists
                const index = state.assets.findIndex(asset => asset.assetId === action.payload.assetId);
                if (index !== -1) {
                    state.assets[index] = action.payload;
                }
            })
            .addCase(updateAsset.rejected, (state, action) => {
                state.updatingAsset = false;
                state.updateAssetError = action.payload;
            });
    },
});

export const { clearErrors, clearCurrentAsset } = assetSlice.actions;
export default assetSlice.reducer; 