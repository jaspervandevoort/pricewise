import React, { JSX, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { addStore, removeStore, Store } from '~/store/storesSlice';

export default function Settings(): JSX.Element {
    const stores = useSelector((state: RootState) => state.stores.stores);
    const dispatch = useDispatch<AppDispatch>();

    const [newStoreName, setNewStoreName] = useState<string>('');
    const [isAddingStore, setIsAddingStore] = useState<boolean>(false);

    const handleAddStore = (): void => {
        if (!newStoreName.trim()) {
            Alert.alert('Error', 'Please enter a store name');
            return;
        }

        // Check if store already exists
        const existingStore = stores.find(
            store => store.name.toLowerCase() === newStoreName.trim().toLowerCase()
        );

        if (existingStore) {
            Alert.alert('Error', 'This store already exists');
            return;
        }

        dispatch(addStore({ name: newStoreName.trim() }));
        setNewStoreName('');
        setIsAddingStore(false);
        Alert.alert('Success', 'Store added successfully!');
    };

    const handleRemoveStore = (storeId: string, storeName: string): void => {
        Alert.alert(
            'Remove Store',
            `Are you sure you want to remove "${storeName}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => dispatch(removeStore(storeId))
                }
            ]
        );
    };

    const renderStore = ({ item }: { item: Store }) => (
        <View style={styles.storeCard}>
            <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.storeDate}>
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveStore(item.id, item.name)}
            >
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Store Settings</Text>
            <Text style={styles.subtitle}>Manage your tracked stores</Text>

            {/* Add Store Section */}
            <View style={styles.addSection}>
                <Text style={styles.sectionTitle}>Add New Store</Text>
                {!isAddingStore ? (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setIsAddingStore(true)}
                    >
                        <Text style={styles.addButtonText}>+ Add Store</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.addForm}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter store name"
                            value={newStoreName}
                            onChangeText={setNewStoreName}
                            autoFocus
                        />
                        <View style={styles.addFormButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setIsAddingStore(false);
                                    setNewStoreName('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={handleAddStore}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* Stores List */}
            <View style={styles.storesSection}>
                <Text style={styles.sectionTitle}>Your Stores ({stores.length})</Text>
                <FlatList
                    data={stores}
                    renderItem={renderStore}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.storesList}
                />
            </View>
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
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    addSection: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    addForm: {
        gap: 12,
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    addFormButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    storesSection: {
        flex: 1,
    },
    storesList: {
        paddingBottom: 20,
    },
    storeCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    storeInfo: {
        flex: 1,
    },
    storeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    storeDate: {
        fontSize: 12,
        color: '#666',
    },
    removeButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    removeButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
});