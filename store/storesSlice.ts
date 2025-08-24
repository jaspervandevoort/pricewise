import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Store {
    id: string;
    name: string;
    dateAdded: string;
}

interface StoresState {
    stores: Store[];
}

const initialState: StoresState = {
    stores: [
        // Hier best standaard winkels toevoegen
        { id: '1', name: 'Albert Heijn', dateAdded: new Date().toISOString() },
        { id: '2', name: 'Colruyt', dateAdded: new Date().toISOString() },
        { id: '3', name: 'Delhaize', dateAdded: new Date().toISOString() },
        { id: '4', name: 'Aldi', dateAdded: new Date().toISOString() },
    ]
};

const storesSlice = createSlice({
    name: 'stores',
    initialState,
    reducers: {
        addStore: (state, action: PayloadAction<{ name: string }>) => {
            const newStore: Store = {
                id: Date.now().toString(),
                name: action.payload.name.trim(),
                dateAdded: new Date().toISOString()
            };

            // checken als er al een winkel met dezelfde naam bestaat (case-insensitive)
            const existingStore = state.stores.find(
                store => store.name.toLowerCase() === newStore.name.toLowerCase()
            );

            if (!existingStore) {
                state.stores.push(newStore);
            }
        },
        removeStore: (state, action: PayloadAction<string>) => {
            state.stores = state.stores.filter(store => store.id !== action.payload);
        },
        updateStore: (state, action: PayloadAction<{ id: string, name: string }>) => {
            const store = state.stores.find(store => store.id === action.payload.id);
            if (store) {
                store.name = action.payload.name.trim();
            }
        }
    }
});

export const { addStore, removeStore, updateStore } = storesSlice.actions;
export default storesSlice.reducer;