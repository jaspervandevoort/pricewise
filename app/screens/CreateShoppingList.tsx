import React, { JSX, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { Product } from '~/store/productSlice';
import { addToCurrentList, updateQuantity, saveCurrentList, ShoppingListItem } from '~/store/shoppingListSlice';
import { formatEuropeanPrice } from '~/util/numberUtils';

type ProductGroup = {
    key: string;            // name lowercased
    name: string;           // display name
    variants: Product[];    // same product across stores
    lowestPrice: number;
    highestPrice: number;
};

export default function CreateShoppingList(): JSX.Element {
    const products = useSelector((state: RootState) => state.products.products);
    const currentList = useSelector((state: RootState) => state.shoppingList.currentList);
    const dispatch = useDispatch<AppDispatch>();

    const [listName, setListName] = useState<string>('');
    // welke store-variant is geselecteerd per product-soort
    const [selectedByKey, setSelectedByKey] = useState<Record<string, string>>({});

    // 👉 groepeer per soort (productnaam), sorteer varianten op prijs (laagste eerst)
    const groups: ProductGroup[] = useMemo(() => {
        const map: Record<string, ProductGroup> = {};
        for (const p of products) {
            const key = p.name.trim().toLowerCase();
            if (!map[key]) {
                map[key] = { key, name: p.name, variants: [], lowestPrice: p.price, highestPrice: p.price };
            }
            map[key].variants.push(p);
            map[key].lowestPrice = Math.min(map[key].lowestPrice, p.price);
            map[key].highestPrice = Math.max(map[key].highestPrice, p.price);
        }
        const arr = Object.values(map).map(g => ({
            ...g,
            variants: g.variants.sort((a, b) => a.price - b.price),
        }));
        // set default (goedkoopste) selectie voor nieuwe groepen
        const defaults: Record<string, string> = {};
        arr.forEach(g => (defaults[g.key] = g.variants[0]?.id));
        setSelectedByKey(prev => ({ ...defaults, ...prev }));
        return arr.sort((a, b) => a.name.localeCompare(b.name));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [products]);

    const getQuantityForProductId = (productId: string): number => {
        const item = currentList.find(i => i.productId === productId);
        return item ? item.quantity : 0;
    };

    const handleQuantityChange = (product: Product, quantity: number): void => {
        if (quantity <= 0) {
            dispatch(updateQuantity({ productId: product.id, quantity: 0 }));
        } else {
            const shoppingListItem: ShoppingListItem = {
                productId: product.id,
                productName: product.name,
                quantity,
                pricePerUnit: product.price,
                store: product.store,
            };
            dispatch(addToCurrentList(shoppingListItem));
        }
    };

    const handleSaveList = (): void => {
        if (currentList.length === 0) {
            Alert.alert('Error', 'Voeg minstens één product toe aan je lijst voordat je deze opslaat');
            return;
        }
        if (!listName.trim()) {
            Alert.alert('Error', 'Geef een naam op voor je boodschappenlijst');
            return;
        }
        dispatch(saveCurrentList(listName.trim()));
        setListName('');
        Alert.alert('Success', 'Boodschappenlijst succesvol opgeslagen!');
    };

    const getTotalItems = (): number =>
        currentList.reduce((total, item) => total + item.quantity, 0);

    const getTotalCost = (): number =>
        currentList.reduce((total, item) => total + item.quantity * item.pricePerUnit, 0);

    const renderGroup = ({ item }: { item: ProductGroup }) => {
        const selectedId = selectedByKey[item.key] || item.variants[0].id;
        const selected = item.variants.find(v => v.id === selectedId) || item.variants[0];
        const qty = getQuantityForProductId(selected.id);

        return (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lg font-bold text-gray-800 flex-1 pr-2">{item.name}</Text>
                    {item.lowestPrice === item.highestPrice ? (
                        <Text className="text-blue-600 font-bold">{formatEuropeanPrice(item.lowestPrice)}</Text>
                    ) : (
                        <Text className="text-blue-600 font-bold">
                            {formatEuropeanPrice(item.lowestPrice)}–{formatEuropeanPrice(item.highestPrice)}
                        </Text>
                    )}
                </View>

                {/* store/prijs chips */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                    {item.variants.map(v => {
                        const active = v.id === selectedId;
                        return (
                            <TouchableOpacity
                                key={v.id}
                                onPress={() => setSelectedByKey(s => ({ ...s, [item.key]: v.id }))}
                                className={`px-3 py-1.5 rounded-lg border ${active ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'
                                    }`}
                            >
                                <Text className={`text-xs font-medium ${active ? 'text-blue-700' : 'text-gray-700'}`}>
                                    {v.store} • {formatEuropeanPrice(v.price)}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* qty controls for the geselecteerde variant */}
                <View className="flex-row justify-between items-center">
                    <View className="flex-1 mr-4">
                        <Text className="text-sm text-gray-500">
                            Geselecteerd: <Text className="font-semibold text-gray-700">{selected.store}</Text>
                        </Text>
                    </View>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            className="bg-blue-500 rounded-md w-8 h-8 items-center justify-center"
                            onPress={() => handleQuantityChange(selected, qty - 1)}
                        >
                            <Text className="text-white text-lg font-bold">-</Text>
                        </TouchableOpacity>
                        <Text className="mx-4 text-base font-bold text-gray-800 min-w-[20px] text-center">{qty}</Text>
                        <TouchableOpacity
                            className="bg-blue-500 rounded-md w-8 h-8 items-center justify-center"
                            onPress={() => handleQuantityChange(selected, qty + 1)}
                        >
                            <Text className="text-white text-lg font-bold">+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View className="flex-1 justify-center items-center pt-24">
            <Text className="text-xl font-bold text-gray-800 mb-2">Geen producten beschikbaar</Text>
            <Text className="text-base text-gray-600 text-center">
                Voeg producten toe om een boodschappenlijst te maken!
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 p-5">
            <Text className="text-2xl font-bold text-gray-800 mb-5">Maak Boodschappenlijst</Text>

            {currentList.length > 0 && (
                <View className="bg-blue-500 rounded-xl p-4 mb-5">
                    <Text className="text-white text-base font-semibold text-center">
                        {getTotalItems()} producten • {formatEuropeanPrice(getTotalCost())} totaal
                    </Text>
                </View>
            )}

            <FlatList
                data={groups}
                renderItem={renderGroup}
                keyExtractor={(g) => g.key}
                contentContainerStyle={{ flexGrow: 1 }}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
            />

            {currentList.length > 0 && (
                <View className="bg-white rounded-xl p-5 mt-3 shadow-sm">
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 text-base bg-gray-50 mb-4"
                        value={listName}
                        onChangeText={setListName}
                        placeholder="Naam van de boodschappenlijst"
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity className="bg-green-500 rounded-lg p-4 items-center" onPress={handleSaveList}>
                        <Text className="text-white text-base font-semibold">Sla boodschappenlijst op</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
