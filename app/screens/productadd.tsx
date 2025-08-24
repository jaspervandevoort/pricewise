import React, { JSX, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addProduct, Product } from '~/store/productSlice';
import { Store } from '~/store/storesSlice';
import { RootState, AppDispatch } from '~/store/store';
import { parseEuropeanNumber, isValidEuropeanNumber } from '~/util/numberUtils';

export default function ProductAdd(): JSX.Element {
    const [productName, setProductName] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [selectedStore, setSelectedStore] = useState<Store | null>(null);
    const [showStoreModal, setShowStoreModal] = useState<boolean>(false);

    const stores = useSelector((state: RootState) => state.stores.stores);
    const dispatch = useDispatch<AppDispatch>();

    const handleAddProduct = (): void => {
        // Validation
        if (!productName.trim() || !price.trim() || !selectedStore) {
            Alert.alert('Error', 'Please fill in all fields and select a store');
            return;
        }

        // Use European number parsing
        if (!isValidEuropeanNumber(price)) {
            Alert.alert('Error', 'Please enter a valid price (e.g., 0,99 or 1,50)');
            return;
        }

        const priceNumber = parseEuropeanNumber(price);

        // Create product object
        const newProduct: Product = {
            id: Date.now().toString(),
            name: productName.trim(),
            price: priceNumber,
            store: selectedStore.name,
            dateAdded: new Date().toISOString()
        };

        // Dispatch to Redux store
        dispatch(addProduct(newProduct));

        // Clear form
        setProductName('');
        setPrice('');
        setSelectedStore(null);

        Alert.alert('Success', 'Product added successfully!');
    };

    const handleStoreSelect = (store: Store): void => {
        setSelectedStore(store);
        setShowStoreModal(false);
    };

    const renderStoreItem = ({ item }: { item: Store }) => (
        <TouchableOpacity
            style={styles.storeItem}
            onPress={() => handleStoreSelect(item)}
        >
            <Text style={styles.storeItemText}>{item.name}</Text>
        </TouchableOpacity>
    );

    if (stores.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.noStoresContainer}>
                    <Text style={styles.noStoresTitle}>No Stores Available</Text>
                    <Text style={styles.noStoresText}>
                        Please add some stores in Settings first before adding products.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New Product</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Milk, Bread"
                    value={productName}
                    onChangeText={setProductName}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Price (€)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="0,99"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                />
                <Text style={styles.hint}>Use comma for decimals (e.g., 0,99)</Text>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Store</Text>
                <TouchableOpacity
                    style={styles.storeSelector}
                    onPress={() => setShowStoreModal(true)}
                >
                    <Text style={[styles.storeSelectorText, !selectedStore && styles.placeholder]}>
                        {selectedStore ? selectedStore.name : 'Select a store'}
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
                <Text style={styles.addButtonText}>Add Product</Text>
            </TouchableOpacity>

            {/* Store Selection Modal */}
            <Modal
                visible={showStoreModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowStoreModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Store</Text>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowStoreModal(false)}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={stores}
                            renderItem={renderStoreItem}
                            keyExtractor={(item) => item.id}
                            style={styles.storeList}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    hint: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        fontStyle: 'italic',
    },
    storeSelector: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storeSelectorText: {
        fontSize: 16,
        color: '#333',
    },
    placeholder: {
        color: '#999',
    },
    dropdownArrow: {
        fontSize: 12,
        color: '#666',
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    noStoresContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    noStoresTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    noStoresText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 0,
        maxHeight: '70%',
        width: '80%',
        maxWidth: 300,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#666',
    },
    storeList: {
        maxHeight: 300,
    },
    storeItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    storeItemText: {
        fontSize: 16,
        color: '#333',
    },
});