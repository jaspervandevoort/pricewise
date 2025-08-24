import React, { JSX, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '~/store/store';
import { optimizeShoppingList, OptimizationResult, StoreOption } from '~/util/optimizationUtils';

interface OptimizationResultsProps {
    listId?: string;
}

export default function OptimizationResults({ listId }: OptimizationResultsProps): JSX.Element {
    const [activeTab, setActiveTab] = useState<'single' | 'multi'>('multi');

    const products = useSelector((state: RootState) => state.products.products);
    const currentList = useSelector((state: RootState) => state.shoppingList.currentList);
    const savedLists = useSelector((state: RootState) => state.shoppingList.savedLists);

    // Use current list if no specific list ID provided
    const shoppingList = listId
        ? savedLists.find(list => list.id === listId)?.items || []
        : currentList;

    const optimization: OptimizationResult = optimizeShoppingList(shoppingList, products);

    const renderStoreOption = (storeOption: StoreOption, isMultiStore: boolean = false) => (
        <View key={storeOption.storeName} style={styles.storeCard}>
            <View style={styles.storeHeader}>
                <Text style={styles.storeName}>{storeOption.storeName}</Text>
                <Text style={styles.storeCost}>${storeOption.totalCost.toFixed(2)}</Text>
            </View>
            <Text style={styles.storeSubtext}>{storeOption.itemCount} items</Text>

            <View style={styles.itemsList}>
                {storeOption.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.productName}</Text>
                        <Text style={styles.itemDetails}>
                            {item.quantity} × ${item.pricePerUnit.toFixed(2)} = ${item.totalPrice.toFixed(2)}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );

    const renderUnavailableItems = () => {
        if (optimization.unavailableItems.length === 0) return null;

        return (
            <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>⚠️ Unavailable Items</Text>
                {optimization.unavailableItems.map((item, index) => (
                    <Text key={index} style={styles.warningText}>
                        • {item.productName} (quantity: {item.quantity})
                    </Text>
                ))}
                <Text style={styles.warningSubtext}>
                    These items aren't in your product database yet.
                </Text>
            </View>
        );
    };

    if (shoppingList.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>No shopping list selected</Text>
                    <Text style={styles.emptySubtext}>Create a shopping list first to see optimization results!</Text>
                </View>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Price Optimization Results</Text>

            {/* Savings Summary */}
            {optimization.savings > 0 && (
                <View style={styles.savingsCard}>
                    <Text style={styles.savingsTitle}>💰 Potential Savings</Text>
                    <Text style={styles.savingsAmount}>${optimization.savings.toFixed(2)}</Text>
                    <Text style={styles.savingsSubtext}>
                        Save by shopping at multiple stores instead of just one
                    </Text>
                </View>
            )}

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'multi' && styles.activeTab]}
                    onPress={() => setActiveTab('multi')}
                >
                    <Text style={[styles.tabText, activeTab === 'multi' && styles.activeTabText]}>
                        Multi-Store (${optimization.totalMultiStoreCost.toFixed(2)})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'single' && styles.activeTab]}
                    onPress={() => setActiveTab('single')}
                >
                    <Text style={[styles.tabText, activeTab === 'single' && styles.activeTabText]}>
                        Single Store (${optimization.totalSingleStoreCost.toFixed(2)})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Results Content */}
            {activeTab === 'multi' && (
                <View>
                    <Text style={styles.sectionTitle}>Best Multi-Store Strategy</Text>
                    <Text style={styles.sectionSubtext}>
                        Shop at multiple stores for maximum savings
                    </Text>
                    {optimization.multiStoreOption.map(store => renderStoreOption(store, true))}
                </View>
            )}

            {activeTab === 'single' && optimization.singleStoreOption && (
                <View>
                    <Text style={styles.sectionTitle}>Best Single Store Option</Text>
                    <Text style={styles.sectionSubtext}>
                        Get everything at one convenient location
                    </Text>
                    {renderStoreOption(optimization.singleStoreOption)}
                </View>
            )}

            {activeTab === 'single' && !optimization.singleStoreOption && (
                <View style={styles.noSingleStoreCard}>
                    <Text style={styles.noSingleStoreTitle}>No Single Store Option</Text>
                    <Text style={styles.noSingleStoreText}>
                        No single store has all the items on your list. You'll need to visit multiple stores.
                    </Text>
                </View>
            )}

            {renderUnavailableItems()}
        </ScrollView>
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
        marginBottom: 20,
        textAlign: 'center',
    },
    savingsCard: {
        backgroundColor: '#34C759',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    savingsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    savingsAmount: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    savingsSubtext: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center',
        opacity: 0.9,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#007AFF',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: 'white',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    sectionSubtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    storeCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    storeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    storeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    storeCost: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    storeSubtext: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    itemsList: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    itemName: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    warningCard: {
        backgroundColor: '#FFF3CD',
        borderColor: '#FFEAA7',
        borderWidth: 1,
        borderRadius: 10,
        padding: 16,
        marginTop: 20,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#856404',
        marginBottom: 4,
    },
    warningSubtext: {
        fontSize: 12,
        color: '#856404',
        marginTop: 8,
        fontStyle: 'italic',
    },
    noSingleStoreCard: {
        backgroundColor: '#F8D7DA',
        borderColor: '#F5C6CB',
        borderWidth: 1,
        borderRadius: 10,
        padding: 16,
    },
    noSingleStoreTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#721C24',
        marginBottom: 8,
    },
    noSingleStoreText: {
        fontSize: 14,
        color: '#721C24',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});