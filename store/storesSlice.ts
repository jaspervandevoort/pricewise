import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Store {
    id: string;
    name: string;
    dateAdded: string;
}

interface StoreState {
    stores: Store[];
    isLoading: boolean;
}

const initialState: StoreState = {
    stores: [],
    isLoading: false
};

const storeSlice = createSlice({
    name: 'stores',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setStores: (state, action: PayloadAction<Store[]>) => {
            state.stores = action.payload;
        },
        addStore: (state, action: PayloadAction<Store>) => {
            state.stores.push(action.payload);
        },
        removeStore: (state, action: PayloadAction<string>) => {
            state.stores = state.stores.filter(store => store.id !== action.payload);
        },
        updateStore: (state, action: PayloadAction<Store>) => {
            const index = state.stores.findIndex(store => store.id === action.payload.id);
            if (index !== -1) {
                state.stores[index] = action.payload;
            }
        },
        clearStores: (state) => {
            state.stores = [];
        }
    }
});

export const {
    setLoading,
    setStores,
    addStore,
    removeStore,
    updateStore,
    clearStores
} = storeSlice.actions;

export default storeSlice.reducer;