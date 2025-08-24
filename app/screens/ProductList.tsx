import React, { JSX } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { removeProduct, Product } from '~/store/productSlice';
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

export default function ProductList(): JSX.Element {
    const products = useSelector((state: RootState) => state.products.products);
    const dispatch = useDispatch<AppDispatch>();

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

    const handleDeleteProduct = (productId: string, productName: string, storeName: string): void => {
        Alert.alert(
            'Delete Product',
            `Remove "${productName}" from ${storeName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => dispatch(removeProduct(productId))
                }
            ]
        );
    };

    const renderGroupedProduct = ({ item }: { item: GroupedProduct }) => (
        <View style={styles.productCard}>
            <View style={styles.productHeader}>
                <Text style={styles.productName}>{item.name}</Text>
                <View style={styles.priceRange}>
                    {item.lowestPrice === item.highestPrice ? (
                        <Text style={styles.singlePrice}>{formatEuropeanPrice(item.lowestPrice)}</Text>
                    ) : (
                        <Text style={styles.priceRangeText}>
                            {formatEuropeanPrice(item.lowestPrice)} - {formatEuropeanPrice(item.highestPrice)}
                        </Text>
                    )}
                </View>
            </View>

            <Text style={styles.storeCount}>
                Available in {item.storeCount} store{item.storeCount !== 1 ? 's' : ''}
            </Text>

            <View style={styles.storesContainer}>
                {item.stores.map((storeData, index) => (
                    <View key={storeData.id} style={styles.storeRow}>
                        <View style={styles.storeInfo}>
                            <Text style={styles.storeName}>{storeData.store}</Text>
                            <Text style={styles.storePrice}>{formatEuropeanPrice(storeData.price)}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteProduct(storeData.id, item.name, storeData.store)}
                        >
                            <Text style={styles.deleteButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptySubtitle}>Start by adding some products to compare prices!</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Products</Text>
            <Text style={styles.subtitle}>
                {groupedProducts.length} product{groupedProducts.length !== 1 ? 's' : ''} • {products.length} store entries
            </Text>

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
    listContainer: {
        flexGrow: 1,
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    productHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    priceRange: {
        alignItems: 'flex-end',
    },
    singlePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    priceRangeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    storeCount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    storesContainer: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    storeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f8f8',
    },
    storeInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storeName: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    storePrice: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
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