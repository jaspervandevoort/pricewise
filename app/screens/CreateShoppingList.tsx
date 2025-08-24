// app/screens/CreateShoppingList.tsx - Updated with grouped products
import React, { JSX, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { Product } from '~/store/productSlice';
import { addToCurrentList, updateQuantity, saveCurrentList, ShoppingListItem } from '~/store/shoppingListSlice';
import { formatEuropeanPrice } from '~/util/numberUtils';

interface GroupedProduct {
    name: string;
    stores: Array<{
        id: string;
        store: string;
        price: number;
        dateAdded: string;
    }>;
    lowestPrice: number;
    highestPrice: number;
    storeCount: number;
}

export default function CreateShoppingList(): JSX.Element {
    const products = useSelector((state: RootState) => state.products.products);
    const currentList = useSelector((state: RootState) => state.shoppingList.currentList);
    const dispatch = useDispatch<AppDispatch>();

    const [listName, setListName] = useState<string>('');

    // Group products by name
    const groupedProducts: GroupedProduct[] = React.useMemo(() => {
        const groups: { [key: string]: GroupedProduct } = {};

        products.forEach(product => {
            const key = product.name.toLowerCase();

            if (!groups[key]) {
                groups[key] = {
                    name: product.name,
                    stores: [],
                    lowestPrice: product.price,
                    highestPrice: product.price,
                    storeCount: 0
                };
            }

            groups[key].stores.push({
                id: product.id,
                store: product.store,
                price: product.price,
                dateAdded: product.dateAdded
            });

            groups[key].lowestPrice = Math.min(groups[key].lowestPrice, product.price);
            groups[key].highestPrice = Math.max(groups[key].highestPrice, product.price);
            groups[key].storeCount = groups[key].stores.length;

            // Sort stores by price (lowest first)
            groups[key].stores.sort((a, b) => a.price - b.price);
        });

        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    const getQuantityForProduct = (productName: string): number => {
        const item = currentList.find(item =>
            item.productName.toLowerCase() === productName.toLowerCase()
        );
        return item ? item.quantity : 0;
    };

    const handleQuantityChange = (groupedProduct: GroupedProduct, quantity: number): void => {
        if (quantity <= 0) {
            // Remove all instances of this product from current list
            currentList
                .filter(item => item.productName.toLowerCase() === groupedProduct.name.toLowerCase())
                .forEach(item => {
                    dispatch(updateQuantity({ productId: item.productId, quantity: 0 }));
                });
        } else {
            // Add the product with cheapest store as default choice
            const cheapestStore = groupedProduct.stores[0]; // Already sorted by price
            const shoppingListItem: ShoppingListItem = {
                productId: cheapestStore.id,
                productName: groupedProduct.name,
                quantity: quantity,
                pricePerUnit: cheapestStore.price,
                store: cheapestStore.store
            };
            dispatch(addToCurrentList(shoppingListItem));
        }
    };

    const handleSaveList = (): void => {
        if (currentList.length === 0) {
            Alert.alert('Error', 'Please add at least one item to your shopping list');
            return;
        }

        if (!listName.trim()) {
            Alert.alert('Error', 'Please enter a name for your shopping list');
            return;
        }

        dispatch(saveCurrentList(listName.trim()));
        setListName('');
        Alert.alert('Success', 'Shopping list saved successfully!');
    };

    const getTotalItems = (): number => {
        return currentList.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalCost = (): number => {
        return currentList.reduce((total, item) => total + (item.quantity * item.pricePerUnit), 0);
    };

    const renderGroupedProduct = ({ item }: { item: GroupedProduct }) => {
        const quantity = getQuantityForProduct(item.name);

        return (
            <View style={styles.productCard}>
                <View style={styles.productHeader}>
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.storeInfo}>
                            {item.storeCount} store{item.storeCount !== 1 ? 's' : ''}: {item.stores.map(s => s.store).join(', ')}
                        </Text>
                        <Text style={styles.priceRange}>
                            {item.lowestPrice === item.highestPrice
                                ? formatEuropeanPrice(item.lowestPrice)
                                : `${formatEuropeanPrice(item.lowestPrice)} - ${formatEuropeanPrice(item.highestPrice)}`
                            }
                        </Text>
                    </View>

                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item, quantity - 1)}
                        >
                            <Text style={styles.quantityButtonText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.quantityText}>{quantity}</Text>

                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item, quantity + 1)}
                        >
                            <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No products available</Text>
            <Text style={styles.emptySubtitle}>Add some products first to create shopping lists!</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Shopping List</Text>
            <Text style={styles.subtitle}>Select products and quantities</Text>

            {/* Current List Summary */}
            {currentList.length > 0 && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Current List</Text>
                    <Text style={styles.summaryText}>
                        {getTotalItems()} items • Estimated: {formatEuropeanPrice(getTotalCost())}
                    </Text>
                </View>
            )}

            {/* Save List Section */}
            {currentList.length > 0 && (
                <View style={styles.saveSection}>
                    <TextInput
                        style={styles.listNameInput}
                        placeholder="Enter list name (e.g., Weekly Groceries)"
                        value={listName}
                        onChangeText={setListName}
                    />
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveList}>
                        <Text style={styles.saveButtonText}>Save List</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Products List */}
            <FlatList
                data={groupedProducts}
                renderItem={renderGroupedProduct}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    summaryText: {
        fontSize: 14,
        color: '#666',
    },
    saveSection: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    listNameInput: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    listContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productInfo: {
        flex: 1,
        marginRight: 16,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    storeInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    priceRange: {
        fontSize: 16,
        fontWeight: '600',
        color: '#007AFF',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 4,
    },
    quantityButton: {
        backgroundColor: '#007AFF',
        width: 32,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 16,
        minWidth: 20,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});