import React, { JSX, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addProduct, Product } from '~/store/productSlice';
import { AppDispatch, RootState } from '~/store/store';
import { setStores, Store } from '~/store/storesSlice';
import { createProduct, getActiveStores } from '~/lib/sanityClient';
import { parseEuropeanNumber, isValidEuropeanNumber } from '~/util/numberUtils';

export default function ProductAdd(): JSX.Element {
    const [productName, setProductName] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [showStoreModal, setShowStoreModal] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const dispatch = useDispatch<AppDispatch>();
    const stores = useSelector((state: RootState) => state.stores.stores);


    // Load stores on component mount (only if empty)
    useEffect(() => {
        if (stores.length === 0) {
            loadStores();
        }
    }, []);

    const loadStores = async () => {
        try {
            const sanityStores = await getActiveStores();

            const appStores: Store[] = sanityStores.map((sanityStore: any) => ({
                id: sanityStore._id,
                name: sanityStore.name,
                description: sanityStore.description || '',
                location: sanityStore.location || '',
                isActive: sanityStore.isActive,
                dateAdded: sanityStore.dateAdded
            }));

            dispatch(setStores(appStores));
        } catch (error) {
            console.error('Error loading stores:', error);
        }
    };

    const handleAddProduct = async (): Promise<void> => {
        // Validation
        if (!productName.trim() || !price.trim() || !selectedStore.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!isValidEuropeanNumber(price)) {
            Alert.alert('Error', 'Please enter a valid price (use comma for decimals, e.g. 12,50)');
            return;
        }

        const priceNumber = parseEuropeanNumber(price);

        setIsLoading(true);

        try {
            // Create product object for local Redux store
            const newProduct: Product = {
                id: Date.now().toString(),
                name: productName.trim(),
                price: priceNumber,
                store: selectedStore,
                dateAdded: new Date().toISOString()
            };

            // Save to Sanity first
            const sanityProduct = await createProduct({
                name: newProduct.name,
                price: newProduct.price,
                store: newProduct.store,
                dateAdded: newProduct.dateAdded
            });

            // Update local product with Sanity ID
            const productWithSanityId: Product = {
                ...newProduct,
                id: sanityProduct._id
            };

            // Dispatch to Redux store
            dispatch(addProduct(productWithSanityId));

            // Clear form
            setProductName('');
            setPrice('');
            setSelectedStore('');

            Alert.alert('Success', 'Product added successfully!');

        } catch (error) {
            console.error('Error adding product:', error);
            Alert.alert('Error', 'Failed to save product. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStoreSelect = (storeName: string) => {
        setSelectedStore(storeName);
        setShowStoreModal(false);
    };

    const renderStoreItem = ({ item }: { item: Store }) => (
        <TouchableOpacity
            style={styles.storeOption}
            onPress={() => handleStoreSelect(item.name)}
        >

        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New Product</Text>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="Enter product name"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                />

                <Text style={styles.label}>Price (€)</Text>
                <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="12,50"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                />

                <Text style={styles.label}>Store</Text>
                <TouchableOpacity
                    style={[styles.input, styles.storeSelector]}
                    onPress={() => setShowStoreModal(true)}
                    disabled={isLoading}
                >
                    <Text style={selectedStore ? styles.selectedStoreText : styles.placeholderText}>
                        {selectedStore || 'Select a store'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.addButton, (isLoading || !selectedStore) && styles.addButtonDisabled]}
                    onPress={handleAddProduct}
                    disabled={isLoading || !selectedStore}
                >
                    <Text style={styles.addButtonText}>
                        {isLoading ? 'Adding...' : 'Add Product'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Store Selection Modal */}
            <Modal
                visible={showStoreModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowStoreModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Store</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <FlatList
                        data={stores}
                        renderItem={renderStoreItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.storeList}
                        ListEmptyComponent={
                            <View style={styles.emptyStoreList}>
                                <Text style={styles.emptyStoreText}>No active stores found</Text>
                                <Text style={styles.emptyStoreSubtext}>Add stores in Settings first</Text>
                            </View>
                        }
                    />
                </View>
            </Modal>
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
        marginBottom: 30,
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    storeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectedStoreText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#999',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#666',
    },
    noStoresText: {
        fontSize: 14,
        color: '#FF3B30',
        textAlign: 'center',
        marginTop: 10,
        fontStyle: 'italic',
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        marginTop: 25,
        alignItems: 'center',
    },
    addButtonDisabled: {
        backgroundColor: '#ccc',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cancelButton: {
        padding: 5,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#007AFF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    placeholder: {
        width: 60, // Same width as cancel button for centering
    },
    storeList: {
        padding: 20,
    },
    storeOption: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
    },
    storeOptionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    storeOptionLocation: {
        fontSize: 14,
        color: '#666',
    },
    emptyStoreList: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyStoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptyStoreSubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});