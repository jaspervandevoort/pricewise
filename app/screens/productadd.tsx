import React, { JSX, useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addProduct, Product } from '~/store/productSlice';
import { AppDispatch, RootState } from '~/store/store';
import { setStores, Store } from '~/store/storesSlice';
import { createProduct, getActiveStores } from '~/lib/sanityClient';
import { parseEuropeanNumber, isValidEuropeanNumber } from '~/util/numberUtils';

export default function ProductAdd(): JSX.Element {
    const [productName, setProductName] = useState('');
    const [price, setPrice] = useState('');
    const [selectedStore, setSelectedStore] = useState('');
    const [showStoreModal, setShowStoreModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();
    const stores = useSelector((state: RootState) => state.stores.stores);

    useEffect(() => {
        if (stores.length === 0) loadStores();
    }, []);

    const loadStores = async () => {
        try {
            const sanityStores = await getActiveStores();
            const appStores: Store[] = sanityStores.map((s: any) => ({
                id: s._id,
                name: s.name,
                dateAdded: s.dateAdded,
            }));
            dispatch(setStores(appStores));
        } catch (err) {
            console.error('Error loading stores:', err);
        }
    };

    const handleAddProduct = async () => {
        if (!productName.trim() || !price.trim() || !selectedStore.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (!isValidEuropeanNumber(price)) {
            Alert.alert('Error', 'Please enter a valid price (use comma, e.g. 12,50)');
            return;
        }

        const priceNumber = parseEuropeanNumber(price);
        setIsLoading(true);

        try {
            const newProduct: Product = {
                id: Date.now().toString(),
                name: productName.trim(),
                price: priceNumber,
                store: selectedStore,
                dateAdded: new Date().toISOString(),
            };

            const sanityProduct = await createProduct({
                name: newProduct.name,
                price: newProduct.price,
                store: newProduct.store,
                dateAdded: newProduct.dateAdded,
            });

            dispatch(addProduct({ ...newProduct, id: sanityProduct._id }));

            setProductName('');
            setPrice('');
            setSelectedStore('');

            Alert.alert('Success', 'Product added successfully!');
        } catch (err) {
            console.error('Error adding product:', err);
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
            className="bg-gray-100 rounded-lg p-4 mb-3"
            onPress={() => handleStoreSelect(item.name)}
        >
            <Text className="text-base font-semibold text-gray-800">{item.name}</Text>

        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-100 p-5">
            <Text className="text-5xl font-bold text-gray-800 mb-8">Nieuw product toevoegen</Text>

            <View className="bg-white rounded-xl p-5 shadow">
                <Text className="text-base font-semibold text-gray-800 mt-4 mb-2">Naam product</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50"
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="Voer productnaam in"
                    placeholderTextColor="#999"
                    editable={!isLoading}
                />

                <Text className="text-base font-semibold text-gray-800 mt-4 mb-2">Prijs (€)</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50"
                    value={price}
                    onChangeText={setPrice}
                    placeholder="12,50"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                />

                <Text className="text-base font-semibold text-gray-800 mt-4 mb-2">Winkel</Text>
                <TouchableOpacity
                    className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center bg-gray-50"
                    onPress={() => setShowStoreModal(true)}
                    disabled={isLoading}
                >
                    <Text
                        className={`text-base ${selectedStore ? 'text-gray-800' : 'text-gray-400'
                            }`}
                    >
                        {selectedStore || 'Kies een winkel'}
                    </Text>
                    <Text className="text-xs text-gray-500">▼</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`rounded-lg p-4 mt-6 items-center ${isLoading || !selectedStore ? 'bg-gray-300' : 'bg-blue-500'
                        }`}
                    onPress={handleAddProduct}
                    disabled={isLoading || !selectedStore}
                >
                    <Text className="text-white text-base font-semibold">
                        {isLoading ? 'Toevoegen...' : 'Voeg product toe'}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal visible={showStoreModal} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-white">
                    <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                        <TouchableOpacity className="p-2" onPress={() => setShowStoreModal(false)}>
                            <Text className="text-blue-500 text-base">Cancel</Text>
                        </TouchableOpacity>
                        <Text className="text-lg font-semibold text-gray-800">Select Store</Text>
                        <View className="w-14" />
                    </View>

                    <FlatList
                        data={stores}
                        renderItem={renderStoreItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 20 }}
                        ListEmptyComponent={
                            <View className="flex-1 justify-center items-center pt-24">
                                <Text className="text-lg font-bold text-gray-800 mb-2">Geen winkels gevonden</Text>
                                <Text className="text-base text-gray-600 text-center">
                                    Voeg eerst winkels toe bij instellingen.
                                </Text>
                            </View>
                        }
                    />
                </View>
            </Modal>
        </View>
    );
}
