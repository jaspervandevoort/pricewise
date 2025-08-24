import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import shoppingListReducer from './shoppingListSlice';
import storeReducer from './storesSlice';

export const store = configureStore({
    reducer: {
        products: productReducer,
        shoppingList: shoppingListReducer,
        stores: storeReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;