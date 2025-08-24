import React, { JSX, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '~/store/store';
import { optimizeShoppingList, OptimizationResult, StoreOption } from '~/util/optimizationUtils';
import { formatEuropeanPrice } from '~/util/numberUtils';

interface OptimizationResultsProps {
    listId?: string;
}

export default function OptimizationResults({ listId }: OptimizationResultsProps): JSX.Element {
    const [activeTab, setActiveTab] = useState<'single' | 'multi'>('multi');

    const products = useSelector((state: RootState) => state.products.products);
    const currentList = useSelector((state: RootState) => state.shoppingList.currentList);
    const savedLists = useSelector((state: RootState) => state.shoppingList.savedLists);

    const shoppingList = listId
        ? savedLists.find(list => list.id === listId)?.items || []
        : currentList;

    const optimization: OptimizationResult = optimizeShoppingList(shoppingList, products);

    const renderStoreOption = (storeOption: StoreOption) => (
        <View key={storeOption.storeName} className="bg-white rounded-xl p-4 mb-3 shadow">
            <View className="flex-row justify-between items-center mb-1">
                <Text className="text-lg font-bold text-gray-800">{storeOption.storeName}</Text>
                <Text className="text-lg font-bold text-blue-500">{formatEuropeanPrice(storeOption.totalCost)}</Text>
            </View>
            <Text className="text-sm text-gray-600 mb-3">{storeOption.itemCount} items</Text>

            <View className="border-t border-gray-100 pt-3">
                {storeOption.items.map((item, index) => (
                    <View key={index} className="flex-row justify-between mb-1">
                        <Text className="text-sm text-gray-800 flex-1">{item.productName}</Text>
                        <Text className="text-sm text-gray-600 font-medium">
                            {item.quantity} × {formatEuropeanPrice(item.pricePerUnit)} = {formatEuropeanPrice(item.totalPrice)}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );


    if (shoppingList.length === 0) {
        return (
            <View className="flex-1 bg-gray-100 p-5">
                <View className="flex-1 justify-center items-center pt-24">
                    <Text className="text-xl font-bold text-gray-800 mb-2">No shopping list selected</Text>
                    <Text className="text-base text-gray-600 text-center">
                        Create a shopping list first to see optimization results!
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-100 p-5">
            <Text className="text-2xl font-bold text-gray-800 text-center mb-5">
                Price Optimization Results
            </Text>

            {/* Savings Summary */}
            {optimization.savings > 0 && (
                <View className="bg-green-500 rounded-xl p-5 mb-5 items-center">
                    <Text className="text-3xl font-bold text-white mb-2 text-center">Bespaar:</Text>
                    <Text className="text-3xl font-bold text-white mb-1">
                        {formatEuropeanPrice(optimization.savings)}
                    </Text>
                    <Text className="text-sm text-white opacity-90 text-center">
                        Door bij verschillende winkels langs te gaan bespaar je het meeste geld!
                    </Text>
                </View>
            )}


            <View className="flex-row bg-white rounded-xl p-1 mb-5">
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'multi' ? 'bg-blue-500' : ''
                        }`}
                    onPress={() => setActiveTab('multi')}
                >
                    <Text
                        className={`text-sm font-semibold ${activeTab === 'multi' ? 'text-white' : 'text-gray-600'
                            }`}
                    >
                        Verschillende winkels ({formatEuropeanPrice(optimization.totalMultiStoreCost)})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'single' ? 'bg-blue-500' : ''
                        }`}
                    onPress={() => setActiveTab('single')}
                >
                    <Text
                        className={`text-sm font-semibold ${activeTab === 'single' ? 'text-white' : 'text-gray-600'
                            }`}
                    >
                        Enkele winkel ({formatEuropeanPrice(optimization.totalSingleStoreCost)})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Resultaten */}
            {activeTab === 'multi' && (
                <View>
                    <Text className="text-xl font-bold text-gray-800 mb-1">Beste meerdere winkel optie</Text>
                    <Text className="text-sm text-gray-600 mb-4">
                        Bij verschillende winkels kopen levert de beste prijs op
                    </Text>
                    {optimization.multiStoreOption.map(store => renderStoreOption(store))}
                </View>
            )}

            {activeTab === 'single' && optimization.singleStoreOption && (
                <View>
                    <Text className="text-xl font-bold text-gray-800 mb-1">Beste winkel optie</Text>
                    <Text className="text-sm text-gray-600 mb-4">
                        Alles in één winkel kopen
                    </Text>
                    {renderStoreOption(optimization.singleStoreOption)}
                </View>
            )}

            {activeTab === 'single' && !optimization.singleStoreOption && (
                <View className="bg-red-100 border border-red-200 rounded-lg p-4">
                    <Text className="text-base font-bold text-red-800 mb-2">Geen winkel beschikbaar </Text>
                    <Text className="text-sm text-red-800">
                        Geen enkele winkel heeft alle producten op je lijstje, om kennis van de app te gebruiken zul je naar meedere winkels moeten gaan.
                    </Text>
                </View>
            )}

        </ScrollView>
    );
}
