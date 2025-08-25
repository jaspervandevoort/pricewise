import React, { JSX } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '~/store/store';
import { ShoppingList } from '~/store/shoppingListSlice';
import { router } from 'expo-router';
import { formatEuropeanPrice } from '~/util/numberUtils';

export default function ShoppingListSelector(): JSX.Element {
    const savedLists = useSelector((state: RootState) => state.shoppingList.savedLists);


    const handleSelectList = (listId: string) => {
        router.push(`/optimization-results?listId=${listId}`);
    };

    // boodschappenlijsten worden niet opgeslaan in sanity, maar lokaal in redux
    // dus geen async calls nodig
    const renderListItem = ({ item }: { item: ShoppingList }) => {
        const totalCost = item.items.reduce((sum, listItem) =>
            sum + (listItem.quantity * listItem.pricePerUnit), 0
        );
        const totalItems = item.items.reduce((sum, listItem) => sum + listItem.quantity, 0);

        return (
            <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-2.5 shadow-md active:opacity-75"
                onPress={() => handleSelectList(item.id)}
            >
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold text-gray-800 flex-1">{item.name}</Text>
                    <Text className="text-lg font-bold text-blue-600">{formatEuropeanPrice(totalCost)}</Text>
                </View>
                <Text className="text-sm text-gray-600">
                    {totalItems} items • Created {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View className="flex-1 justify-center items-center pt-24">
            <Text className="text-xl font-bold text-gray-800 mb-2">Geen opgeslagen boodschappenlijst</Text>
            <Text className="text-base text-gray-600 text-center leading-6">
                Maak een nieuwe lijst aan om te beginnen met optimaliseren!
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 p-5">
            <Text className="text-2xl font-bold text-gray-800 mb-5 text-center">
                Kies Boodschappenlijst om te optimaliseren
            </Text>

            {/* Saved Lists */}
            <View className="flex-1">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                    Opgeslagen boodschappenlijsten ({savedLists.length})
                </Text>
                <FlatList
                    data={savedLists}
                    renderItem={renderListItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                    ListEmptyComponent={renderEmptyState}
                />
            </View>
        </View>
    );
}