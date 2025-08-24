import { configureStore } from '@reduxjs/toolkit';
import productReducer from './productSlice';
import shoppingListReducer from './shoppingListSlice';

export const store = configureStore({
    reducer: {
        products: productReducer,
        shoppingList: shoppingListReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;