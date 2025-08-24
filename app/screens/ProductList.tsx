import React, { JSX, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { removeProduct, Product, setProducts } from '~/store/productSlice';
import { getProducts, deleteProduct } from '~/lib/sanityClient';
import { formatEuropeanPrice } from '~/util/numberUtils';

export default function ProductList(): JSX.Element {
    const products = useSelector((state: RootState) => state.products.products);
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

    // Load products from Sanity on component mount (only if empty)
    useEffect(() => {
        if (products.length === 0) {
            loadProductsFromSanity();
        }
    }, []);

    const loadProductsFromSanity = async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const sanityProducts = await getProducts();

            // Convert Sanity format to app format
            const appProducts: Product[] = sanityProducts.map((sanityProduct: any) => ({
                id: sanityProduct._id,
                name: sanityProduct.name,
                price: sanityProduct.price,
                store: sanityProduct.store,
                dateAdded: sanityProduct.dateAdded
            }));

            // Update Redux store with fetched products
            dispatch(setProducts(appProducts));

        } catch (error) {
            console.error('Error loading products:', error);
            Alert.alert('Error', 'Failed to load products from server');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete from Sanity first
                            await deleteProduct(id);

                            // Then remove from Redux store
                            dispatch(removeProduct(id));

                            Alert.alert('Success', 'Product deleted successfully');
                        } catch (error) {
                            console.error('Error deleting product:', error);
                            Alert.alert('Error', 'Failed to delete product. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const handleRefresh = () => {
        loadProductsFromSanity(true);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <View style={styles.productCard}>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productStore}>Store: {item.store}</Text>
                <Text style={styles.productPrice}>{formatEuropeanPrice(item.price)}</Text>
                <Text style={styles.productDate}>
                    Added: {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProduct(item.id)}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptySubtitle}>Start by adding some products to compare prices!</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading products...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Products</Text>
            <Text style={styles.subtitle}>{products.length} products saved</Text>

            <FlatList
                data={products}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                    />
                }
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
    },
    productName: {
        fontSize: 18,
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
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 4,
    },
    productDate: {
        fontSize: 12,
        color: '#999',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 14,
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
        marginBottom: 20,
    },
    refreshButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        fontSize: 18,
        color: '#666',
    },
});