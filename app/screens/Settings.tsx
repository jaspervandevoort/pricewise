import React, { JSX, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { addStore, removeStore, setStores, Store } from '~/store/storesSlice';
import { getStores, createStore, deleteStore } from '~/lib/sanityClient';

export default function Settings(): JSX.Element {
    const stores = useSelector((state: RootState) => state.stores.stores);
    const dispatch = useDispatch<AppDispatch>();

    const [newStoreName, setNewStoreName] = useState<string>('');
    const [isAddingStore, setIsAddingStore] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Load stores on component mount
    useEffect(() => {
        loadStoresFromSanity();
    }, []);

    const loadStoresFromSanity = async () => {
        try {
            setIsLoading(true);
            const sanityStores = await getStores();

            const appStores: Store[] = sanityStores.map((sanityStore: any) => ({
                id: sanityStore._id,
                name: sanityStore.name,
                dateAdded: sanityStore.dateAdded
            }));

            dispatch(setStores(appStores));
        } catch (error) {
            console.error('Error loading stores:', error);
            Alert.alert('Error', 'Failed to load stores from server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStore = async (): Promise<void> => {
        if (!newStoreName.trim()) {
            Alert.alert('Error', 'Voeg een winkelnaam toe');
            return;
        }

        // Check if store already exists
        const existingStore = stores.find(
            store => store.name.toLowerCase() === newStoreName.trim().toLowerCase()
        );

        if (existingStore) {
            Alert.alert('Error', 'Winkel bestaat al');
            return;
        }

        try {
            const newStore = {
                name: newStoreName.trim(),
                dateAdded: new Date().toISOString()
            };

            // Save to Sanity first
            const sanityStore = await createStore(newStore);

            // Then add to Redux store with Sanity ID
            const storeWithSanityId: Store = {
                ...newStore,
                id: sanityStore._id
            };

            dispatch(addStore(storeWithSanityId));
            setNewStoreName('');
            setIsAddingStore(false);
            Alert.alert('Success', 'Winkel succesvol toegevoegd!');
        } catch (error) {
            console.error('Error adding store:', error);
            Alert.alert('Error', 'Failed to add store. Please try again.');
        }
    };

    const handleRemoveStore = (storeId: string, storeName: string): void => {
        Alert.alert(
            'Winkel verwijderen',
            `Weet je zeker dat je "${storeName}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`,
            [
                { text: 'Annuleer', style: 'cancel' },
                {
                    text: 'Verwijder',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Delete from Sanity first
                            await deleteStore(storeId);

                            // Then remove from Redux store
                            dispatch(removeStore(storeId));

                            Alert.alert('Success', 'Winkel succesvol verwijderd');
                        } catch (error) {
                            console.error('Error deleting store:', error);
                            Alert.alert('Error', 'Failed to delete store. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const renderStore = ({ item }: { item: Store }) => (
        <View className="bg-white rounded-lg p-4 mb-2 flex-row justify-between items-center shadow-sm">
            <View className="flex-1">
                <Text className="text-base font-semibold text-gray-800 mb-1">{item.name}</Text>
                <Text className="text-xs text-gray-400">
                    Toegevoegd {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity
                className="bg-red-500 px-3 py-1.5 rounded"
                onPress={() => handleRemoveStore(item.id, item.name)}
            >
                <Text className="text-white text-xs font-semibold">Verwijderen</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-lg text-gray-600">Winkels laden...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100 p-5">
            <Text className="text-2xl font-bold text-gray-800 mb-2">Winkel instellingen</Text>
            <Text className="text-base text-gray-600 mb-8">Beheer je opgeslagen winkels ({stores.length} totaal)</Text>

            {/* Add Store Section */}
            <View className="bg-white rounded-lg p-4 mb-5 shadow-md">
                <Text className="text-lg font-bold text-gray-800 mb-3">Winkel toevoegen</Text>
                {!isAddingStore ? (
                    <TouchableOpacity
                        className="bg-blue-500 rounded-lg p-3 items-center"
                        onPress={() => setIsAddingStore(true)}
                    >
                        <Text className="text-white text-base font-semibold">+ Winkel toevoegen</Text>
                    </TouchableOpacity>
                ) : (
                    <View className="gap-3">
                        <TextInput
                            className="bg-gray-50 rounded-lg p-3 text-base border border-gray-200"
                            placeholder="Winkel naam"
                            value={newStoreName}
                            onChangeText={setNewStoreName}
                            autoFocus
                        />
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 rounded-lg p-3 items-center"
                                onPress={() => {
                                    setIsAddingStore(false);
                                    setNewStoreName('');
                                }}
                            >
                                <Text className="text-gray-600 text-base font-semibold">Annuleer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-500 rounded-lg p-3 items-center"
                                onPress={handleAddStore}
                            >
                                <Text className="text-white text-base font-semibold">Opslaan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>

            {/* Stores List */}
            <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                    Jouw Winkels ({stores.length})
                </Text>
                {stores.length === 0 ? (
                    <View className="items-center py-10">
                        <Text className="text-lg font-bold text-gray-800 mb-2">Geen winkels gevonden</Text>
                        <Text className="text-sm text-gray-600 text-center leading-5">
                            Voeg winkels toe om schrijffouten te voorkomen bij het toevoegen van producten
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={stores}
                        renderItem={renderStore}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        className="pb-5"
                    />
                )}
            </View>
        </View>
    );
}