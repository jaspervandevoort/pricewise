import React, { JSX, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { Product } from '~/store/productSlice';
import { addToCurrentList, updateQuantity, saveCurrentList, ShoppingListItem } from '~/store/shoppingListSlice';
import { formatEuropeanPrice } from '~/util/numberUtils';

export default function CreateShoppingList(): JSX.Element {
    const products = useSelector((state: RootState) => state.products.products);
    const currentList = useSelector((state: RootState) => state.shoppingList.currentList);
    const dispatch = useDispatch<AppDispatch>();

    const [listName, setListName] = useState<string>('');

    const getQuantityForProduct = (productId: string): number => {
        const item = currentList.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    };

    const handleQuantityChange = (product: Product, quantity: number): void => {
        if (quantity <= 0) {
            dispatch(updateQuantity({ productId: product.id, quantity: 0 }));
        } else {
            const shoppingListItem: ShoppingListItem = {
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                pricePerUnit: product.price,
                store: product.store
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

    const renderProduct = ({ item }: { item: Product }) => {
        const quantity = getQuantityForProduct(item.id);

        return (
            <View style={styles.productCard}>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productStore}>Store: {item.store}</Text>
                    <Text style={styles.productPrice}>{formatEuropeanPrice(item.price)} each</Text>
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
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No products available</Text>
            <Text style={styles.emptySubtitle}>Add some products first to create a shopping list!</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Shopping List</Text>

            {currentList.length > 0 && (
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryText}>
                        {getTotalItems()} items • {formatEuropeanPrice(getTotalCost())} total
                    </Text>
                </View>
            )}

            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />

            {currentList.length > 0 && (
                <View style={styles.bottomContainer}>
                    <TextInput
                        style={styles.listNameInput}
                        value={listName}
                        onChangeText={setListName}
                        placeholder="Enter list name (e.g., Weekly Groceries)"
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSaveList}
                    >
                        <Text style={styles.saveButtonText}>Save Shopping List</Text>
                    </TouchableOpacity>
                </View>
            )}
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
        marginBottom: 20,
    },
    summaryContainer: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
    },
    summaryText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    listContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    productInfo: {
        flex: 1,
        marginRight: 15,
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    productStore: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        backgroundColor: '#007AFF',
        borderRadius: 6,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 15,
        color: '#333',
        minWidth: 20,
        textAlign: 'center',
    },
    bottomContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    listNameInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: '#34C759',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});