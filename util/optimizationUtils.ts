// util/optimizationUtils.ts
import { Product } from '../store/productSlice';
import { ShoppingListItem } from '../store/shoppingListSlice';

export interface OptimizedItem {
    productName: string;
    quantity: number;
    pricePerUnit: number;
    totalPrice: number;
    store: string;
    originalItem: ShoppingListItem;
}

export interface StoreOption {
    storeName: string;
    items: OptimizedItem[];
    totalCost: number;
    itemCount: number;
}

export interface OptimizationResult {
    singleStoreOption: StoreOption | null;
    multiStoreOption: StoreOption[];
    totalSingleStoreCost: number;
    totalMultiStoreCost: number;
    savings: number;
    unavailableItems: ShoppingListItem[];
}

export function optimizeShoppingList(
    shoppingList: ShoppingListItem[],
    allProducts: Product[]
): OptimizationResult {
    // Group products by name to find all available options
    const productsByName = new Map<string, Product[]>();
    allProducts.forEach(product => {
        const existing = productsByName.get(product.name) || [];
        existing.push(product);
        productsByName.set(product.name, existing);
    });

    // Find items that aren't available in any store
    const unavailableItems: ShoppingListItem[] = [];
    const availableItems: ShoppingListItem[] = [];

    shoppingList.forEach(item => {
        const availableProducts = productsByName.get(item.productName);
        if (!availableProducts || availableProducts.length === 0) {
            unavailableItems.push(item);
        } else {
            availableItems.push(item);
        }
    });

    if (availableItems.length === 0) {
        return {
            singleStoreOption: null,
            multiStoreOption: [],
            totalSingleStoreCost: 0,
            totalMultiStoreCost: 0,
            savings: 0,
            unavailableItems
        };
    }

    // Calculate single store options
    const singleStoreOptions = calculateSingleStoreOptions(availableItems, productsByName);

    // Calculate multi-store optimization
    const multiStoreOption = calculateMultiStoreOptimization(availableItems, productsByName);

    // Find best single store option
    const bestSingleStore = singleStoreOptions.length > 0
        ? singleStoreOptions.reduce((best, current) =>
            current.totalCost < best.totalCost ? current : best
        )
        : null;

    const totalSingleStoreCost = bestSingleStore?.totalCost || 0;
    const totalMultiStoreCost = multiStoreOption.reduce((sum, store) => sum + store.totalCost, 0);
    const savings = Math.max(0, totalSingleStoreCost - totalMultiStoreCost);

    return {
        singleStoreOption: bestSingleStore,
        multiStoreOption,
        totalSingleStoreCost,
        totalMultiStoreCost,
        savings,
        unavailableItems
    };
}

function calculateSingleStoreOptions(
    shoppingList: ShoppingListItem[],
    productsByName: Map<string, Product[]>
): StoreOption[] {
    // Get all unique stores
    const allStores = new Set<string>();
    productsByName.forEach(products => {
        products.forEach(product => allStores.add(product.store));
    });

    const storeOptions = new Map<string, OptimizedItem[]>();

    // For each store, check if it can fulfill ALL items in the shopping list
    allStores.forEach(storeName => {
        const storeItems: OptimizedItem[] = [];
        let canFulfillAll = true;

        shoppingList.forEach(shoppingItem => {
            const availableProducts = productsByName.get(shoppingItem.productName) || [];
            const storeProducts = availableProducts.filter(p => p.store === storeName);

            if (storeProducts.length > 0) {
                // Find cheapest option at this store for this product
                const cheapestProduct = storeProducts.reduce((cheapest, current) =>
                    current.price < cheapest.price ? current : cheapest
                );

                storeItems.push({
                    productName: shoppingItem.productName,
                    quantity: shoppingItem.quantity,
                    pricePerUnit: cheapestProduct.price,
                    totalPrice: cheapestProduct.price * shoppingItem.quantity,
                    store: storeName,
                    originalItem: shoppingItem
                });
            } else {
                canFulfillAll = false;
            }
        });

        // Only include stores that have ALL required items
        if (canFulfillAll && storeItems.length === shoppingList.length) {
            storeOptions.set(storeName, storeItems);
        }
    });

    return Array.from(storeOptions.entries()).map(([storeName, items]) => ({
        storeName,
        items,
        totalCost: items.reduce((sum, item) => sum + item.totalPrice, 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    }));
}

function calculateMultiStoreOptimization(
    shoppingList: ShoppingListItem[],
    productsByName: Map<string, Product[]>
): StoreOption[] {
    const optimizedItems: OptimizedItem[] = [];

    // For each item in shopping list, find the cheapest option across all stores
    shoppingList.forEach(shoppingItem => {
        const availableProducts = productsByName.get(shoppingItem.productName) || [];

        if (availableProducts.length > 0) {
            // Find the absolute cheapest option
            const cheapestProduct = availableProducts.reduce((cheapest, current) =>
                current.price < cheapest.price ? current : cheapest
            );

            optimizedItems.push({
                productName: shoppingItem.productName,
                quantity: shoppingItem.quantity,
                pricePerUnit: cheapestProduct.price,
                totalPrice: cheapestProduct.price * shoppingItem.quantity,
                store: cheapestProduct.store,
                originalItem: shoppingItem
            });
        }
    });

    // Group optimized items by store
    const itemsByStore = new Map<string, OptimizedItem[]>();
    optimizedItems.forEach(item => {
        const existing = itemsByStore.get(item.store) || [];
        existing.push(item);
        itemsByStore.set(item.store, existing);
    });

    return Array.from(itemsByStore.entries()).map(([storeName, items]) => ({
        storeName,
        items,
        totalCost: items.reduce((sum, item) => sum + item.totalPrice, 0),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    }));
}