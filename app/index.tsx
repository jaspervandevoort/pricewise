import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, Link } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export default function Home() {
  const products = useSelector((state: RootState) => state.products.products);
  const savedLists = useSelector((state: RootState) => state.shoppingList.savedLists);
  const currentList = useSelector((state: RootState) => state.shoppingList.currentList);

  return (
    <>
      <Stack.Screen options={{ title: 'PriceWise' }} />
      <ScrollView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-blue-500 px-8 pt-12 pb-8 rounded-b-3xl items-center">
          <Text className="text-3xl font-bold text-white mb-2">💰 PriceWise</Text>
          <Text className="text-base text-white/90 text-center">
            Find the best deals for your shopping
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-around px-5 -mt-5 mb-5">
          <View className="bg-white rounded-2xl p-4 items-center min-w-20 shadow-sm">
            <Text className="text-2xl font-bold text-gray-800 mb-1">{products.length}</Text>
            <Text className="text-xs text-gray-600 font-semibold">Products</Text>
          </View>
          <View className="bg-white rounded-2xl p-4 items-center min-w-20 shadow-sm">
            <Text className="text-2xl font-bold text-gray-800 mb-1">{savedLists.length}</Text>
            <Text className="text-xs text-gray-600 font-semibold">Lists</Text>
          </View>
          <View className="bg-white rounded-2xl p-4 items-center min-w-20 shadow-sm">
            <Text className="text-2xl font-bold text-gray-800 mb-1">{currentList.length}</Text>
            <Text className="text-xs text-gray-600 font-semibold">Current</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-5">
          <Link href="/addproduct" asChild>
            <TouchableOpacity className="flex-row items-center bg-blue-500 rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-2xl mr-4">➕</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white mb-1">Add Product</Text>
                <Text className="text-sm text-white/90">Add items with prices and stores</Text>
              </View>
              <Text className="text-xl text-white font-bold">→</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/product-list" asChild>
            <TouchableOpacity className="flex-row items-center bg-green-500 rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-2xl mr-4">📦</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white mb-1">View Products</Text>
                <Text className="text-sm text-white/90">Browse your {products.length} saved products</Text>
              </View>
              <Text className="text-xl text-white font-bold">→</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/create-shopping-list" asChild>
            <TouchableOpacity className="flex-row items-center bg-orange-500 rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-2xl mr-4">📝</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white mb-1">Create Shopping List</Text>
                <Text className="text-sm text-white/90">Select products and quantities</Text>
              </View>
              <Text className="text-xl text-white font-bold">→</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/optimize-shopping" asChild>
            <TouchableOpacity className="flex-row items-center bg-red-500 rounded-2xl p-5 mb-4 shadow-sm">
              <Text className="text-2xl mr-4">🎯</Text>
              <View className="flex-1">
                <Text className="text-lg font-bold text-white mb-1">Optimize Shopping</Text>
                <Text className="text-sm text-white/90">Find the best prices and savings</Text>
              </View>
              <Text className="text-xl text-white font-bold">→</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Quick Actions */}
        {currentList.length > 0 && (
          <View className="mx-5 bg-white rounded-2xl p-5 border-2 border-dashed border-red-500">
            <Text className="text-base font-bold text-red-500 mb-3 text-center">
              🚀 Quick Action
            </Text>
            <Link href="/optimization-results" asChild>
              <TouchableOpacity className="bg-red-500 rounded-xl p-4 items-center">
                <Text className="text-white text-base font-semibold">
                  Optimize Current List ({currentList.length} items)
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}

        {/* Footer */}
        <View className="px-5 py-8 items-center">
          <Text className="text-base text-gray-600 italic">
            Smart shopping starts here! 🛒
          </Text>
        </View>
      </ScrollView>
    </>
  );
}