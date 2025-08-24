import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ShoppingListItem {
    productId: string;
    productName: string;
    quantity: number;
    pricePerUnit: number;
    store: string;
}

export interface ShoppingList {
    id: string;
    name: string;
    items: ShoppingListItem[];
    createdAt: string;
}

interface ShoppingListState {
    currentList: ShoppingListItem[];
    savedLists: ShoppingList[];
}

const initialState: ShoppingListState = {
    currentList: [],
    savedLists: []
};

const shoppingListSlice = createSlice({
    name: 'shoppingList',
    initialState,
    reducers: {
        addToCurrentList: (state, action: PayloadAction<ShoppingListItem>) => {
            const existingItem = state.currentList.find(item =>
                item.productId === action.payload.productId &&
                item.store === action.payload.store
            );

            if (existingItem) {
                existingItem.quantity = action.payload.quantity;
            } else {
                state.currentList.push(action.payload);
            }
        },
        removeFromCurrentList: (state, action: PayloadAction<string>) => {
            state.currentList = state.currentList.filter(item => item.productId !== action.payload);
        },
        updateQuantity: (state, action: PayloadAction<{ productId: string, quantity: number }>) => {
            const item = state.currentList.find(item => item.productId === action.payload.productId);
            if (item) {
                if (action.payload.quantity <= 0) {
                    state.currentList = state.currentList.filter(item => item.productId !== action.payload.productId);
                } else {
                    item.quantity = action.payload.quantity;
                }
            }
        },
        saveCurrentList: (state, action: PayloadAction<string>) => {
            const newList: ShoppingList = {
                id: Date.now().toString(),
                name: action.payload,
                items: [...state.currentList],
                createdAt: new Date().toISOString()
            };
            state.savedLists.push(newList);
            state.currentList = [];
        },
        clearCurrentList: (state) => {
            state.currentList = [];
        }
    }
});

export const {
    addToCurrentList,
    removeFromCurrentList,
    updateQuantity,
    saveCurrentList,
    clearCurrentList
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;