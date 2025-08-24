import React, { JSX } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { removeProduct, Product } from '~/store/productSlice';

export default function ProductList(): JSX.Element {
    const products = useSelector((state: RootState) => state.products.products);
    const dispatch = useDispatch<AppDispatch>();

    const handleDeleteProduct = (id: string): void => {
        dispatch(removeProduct(id));
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <View style={styles.productCard}>
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productStore}>Store: {item.store}</Text>
                <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
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
        </View>
    );

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
    },
});