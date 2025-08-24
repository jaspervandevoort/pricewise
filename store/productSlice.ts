import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
    id: string;
    name: string;
    price: number;
    store: string;
    dateAdded: string;
}

interface ProductState {
    products: Product[];
    isLoading: boolean;
}

const initialState: ProductState = {
    products: [],
    isLoading: false
};

const productSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setProducts: (state, action: PayloadAction<Product[]>) => {
            state.products = action.payload;
        },
        addProduct: (state, action: PayloadAction<Product>) => {
            state.products.push(action.payload);
        },
        removeProduct: (state, action: PayloadAction<string>) => {
            state.products = state.products.filter(product => product.id !== action.payload);
        },
        updateProduct: (state, action: PayloadAction<Product>) => {
            const index = state.products.findIndex(product => product.id === action.payload.id);
            if (index !== -1) {
                state.products[index] = action.payload;
            }
        },
        clearProducts: (state) => {
            state.products = [];
        }
    }
});

export const {
    setLoading,
    setProducts,
    addProduct,
    removeProduct,
    updateProduct,
    clearProducts
} = productSlice.actions;

export default productSlice.reducer;