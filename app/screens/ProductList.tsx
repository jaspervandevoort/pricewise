import React, { JSX, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '~/store/store';
import { removeProduct, Product, setProducts } from '~/store/productSlice';
import { getProducts, deleteProduct } from '~/lib/sanityClient';
import { formatEuropeanPrice } from '~/util/numberUtils';

interface GroupedProduct {
    name: string;
    stores: Array<{ id: string; store: string; price: number; dateAdded: string }>;
    lowestPrice: number;
    highestPrice: number;
    storeCount: number;
}

export default function ProductList(): JSX.Element {
    const products = useSelector((state: RootState) => state.products.products);
    const dispatch = useDispatch<AppDispatch>();
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [groupedView, setGroupedView] = useState(true);

    // producten laden bij mount
    useEffect(() => {
        if (products.length === 0) loadProductsFromSanity();
    }, []);


    const loadProductsFromSanity = async (showRefresh = false) => {
        try {
            showRefresh ? setIsRefreshing(true) : setIsLoading(true);
            const sanityProducts = await getProducts();

            const appProducts: Product[] = sanityProducts.map((p: any) => ({
                id: p._id,
                name: p.name,
                price: p.price,
                store: p.store,
                dateAdded: p.dateAdded,
            }));

            dispatch(setProducts(appProducts));
        } catch (error) {
            console.error('Fout bij laden producten:', error);
            Alert.alert('Fout', 'producten laden mislukt. Probeer het opnieuw.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const groupedProducts: GroupedProduct[] = React.useMemo(() => {
        const groups: { [key: string]: GroupedProduct } = {};
        products.forEach((product) => {
            const key = product.name.toLowerCase();
            if (!groups[key]) {
                groups[key] = {
                    name: product.name,
                    stores: [],
                    lowestPrice: product.price,
                    highestPrice: product.price,
                    storeCount: 0,
                };
            }
            groups[key].stores.push({
                id: product.id,
                store: product.store,
                price: product.price,
                dateAdded: product.dateAdded,
            });
            groups[key].lowestPrice = Math.min(groups[key].lowestPrice, product.price);
            groups[key].highestPrice = Math.max(groups[key].highestPrice, product.price);
            groups[key].storeCount = groups[key].stores.length;
            groups[key].stores.sort((a, b) => a.price - b.price);
        });
        return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    }, [products]);

    const handleDeleteProduct = async (id: string, productName?: string, storeName?: string) => {
        Alert.alert(
            'Verwijder Product',
            productName && storeName
                ? `Verwijder "${productName}" van ${storeName}?`
                : 'Weet je zeker dat je dit product wilt verwijderen?',
            [
                { text: 'Annuleer', style: 'cancel' },
                {
                    text: 'Verwijder',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProduct(id);
                            dispatch(removeProduct(id));
                            Alert.alert('Success', 'Product succesvol verwijderd!');
                        } catch (error) {
                            console.error('Fout verwijderen product:', error);
                            Alert.alert('Fout', 'Product verwijderen mislukt. Probeer het opnieuw.');
                        }
                    },
                },
            ]
        );
    };

    // Gegroepeerde view
    const renderGroupedProduct = ({ item }: { item: GroupedProduct }) => (
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between mb-2">
                <Text className="text-lg font-bold text-gray-800 flex-1">{item.name}</Text>
                {item.lowestPrice === item.highestPrice ? (
                    <Text className="text-blue-600 font-bold">{formatEuropeanPrice(item.lowestPrice)}</Text>
                ) : (
                    <Text className="text-blue-600 font-bold">
                        {formatEuropeanPrice(item.lowestPrice)} - {formatEuropeanPrice(item.highestPrice)}
                    </Text>
                )}
            </View>

            <Text className="text-sm text-gray-600 mb-3">
                Beschikbaar in {item.storeCount} winkel{item.storeCount !== 1 ? 's' : ''}
            </Text>

            <View className="border-t border-gray-200 pt-2">
                {item.stores.map((storeData) => (
                    <View
                        key={storeData.id}
                        className="flex-row justify-between items-center py-2 border-b border-gray-100"
                    >
                        <View className="flex-row justify-between flex-1">
                            <Text className="text-base text-gray-800 font-medium">{storeData.store}</Text>
                            <Text className="text-base text-gray-600 font-semibold">
                                {formatEuropeanPrice(storeData.price)}
                            </Text>
                        </View>
                        <TouchableOpacity
                            className="bg-red-500 w-6 h-6 rounded-full items-center justify-center ml-3"
                            onPress={() => handleDeleteProduct(storeData.id, item.name, storeData.store)}
                        >
                            <Text className="text-white font-bold">×</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );

    // Platte lijst view
    const renderFlatProduct = ({ item }: { item: Product }) => (
        <View className="bg-white rounded-xl p-4 mb-3 flex-row justify-between items-center shadow-sm">
            <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">{item.name}</Text>
                <Text className="text-sm text-gray-600 mb-1">Store: {item.store}</Text>
                <Text className="text-base font-bold text-blue-500 mb-1">
                    {formatEuropeanPrice(item.price)}
                </Text>
                <Text className="text-xs text-gray-400">
                    Added: {new Date(item.dateAdded).toLocaleDateString()}
                </Text>
            </View>
            <TouchableOpacity
                className="bg-red-500 px-2 py-1.5 rounded-md"
                onPress={() => handleDeleteProduct(item.id)}
            >
                <Text className="text-white text-sm font-semibold">Delete</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmptyState = () => (
        <View className="flex-1 justify-center items-center pt-24">
            <Text className="text-xl font-bold text-gray-800 mb-2">No products yet</Text>
            <Text className="text-base text-gray-600 text-center mb-5">
                Start by adding some products to compare prices!
            </Text>
            <TouchableOpacity
                className="bg-blue-500 px-5 py-2.5 rounded-lg"
                onPress={() => loadProductsFromSanity(true)}
            >
                <Text className="text-white text-base font-semibold">Refresh</Text>
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-lg text-gray-600">Producten Laden...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100 p-5">
            <View className="flex-row justify-between items-center mb-3">
                <View>
                    <Text className="text-2xl font-bold text-gray-800">Opgeslagen producten</Text>
                    <Text className="text-base text-gray-600">
                        {groupedProducts.length} producten • {products.length} winkel entries
                    </Text>
                </View>
                <TouchableOpacity
                    className="bg-blue-500 px-3 py-1.5 rounded-lg"
                    onPress={() => setGroupedView(!groupedView)}
                >
                    <Text className="text-white font-semibold">
                        {groupedView ? 'Platte lijst' : 'Gegroepeerd'}
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={groupedView ? groupedProducts : products}
                renderItem={groupedView ? renderGroupedProduct : renderFlatProduct}
                keyExtractor={(item) => (groupedView ? (item as GroupedProduct).name : (item as unknown as Product).id)}
                contentContainerStyle={{ flexGrow: 1 }}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={() => loadProductsFromSanity(true)} />
                }
            />
        </View>
    );
}
