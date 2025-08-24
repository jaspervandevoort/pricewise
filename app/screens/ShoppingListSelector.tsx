import React, { JSX } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '~/store/store';
import { ShoppingList } from '~/store/shoppingListSlice';
import { router } from 'expo-router';
import { formatEuropeanPrice } from '~/util/numberUtils';

export default function ShoppingListSelector(): JSX.Element {
    const savedLists = useSelector((state: RootState) => state.shoppingList.savedLists);
    const currentList = useSelector((state: RootState) => state.shoppingList.currentList);

    const handleSelectList = (listId: string) => {
        router.push(`/optimization-results?listId=${listId}`);
    };

    const handleOptimizeCurrentList = () => {
        router.push('/optimization-results');
    };

    const getCurrentListTotalCost = () => {
        return currentList.reduce((sum, listItem) =>
            sum + (listItem.quantity * listItem.pricePerUnit), 0
        );
    };

    const getCurrentListTotalItems = () => {
        return currentList.reduce((sum, listItem) => sum + listItem.quantity, 0);
    };

    const renderListItem = ({ item }: { item: ShoppingList }) => {
        const totalCost = item.items.reduce((sum, listItem) =>
            sum + (listItem.quantity * listItem.pricePerUnit), 0
        );
        const totalItems = item.items.reduce((sum, listItem) => sum + listItem.quantity, 0);

        return (
            <TouchableOpacity
                style={styles.listCard}
                onPress={() => handleSelectList(item.id)}
            >
                <View style={styles.listHeader}>
                    <Text style={styles.listName}>{item.name}</Text>
                    <Text style={styles.listCost}>{formatEuropeanPrice(totalCost)}</Text>
                </View>
                <Text style={styles.listDetails}>
                    {totalItems} items • Created {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No saved shopping lists</Text>
            <Text style={styles.emptySubtitle}>
                Create and save shopping lists first to optimize them here
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Shopping List to Optimize</Text>

            {/* Current List Option */}
            {currentList.length > 0 && (
                <View style={styles.currentListSection}>
                    <Text style={styles.sectionTitle}>Current List</Text>
                    <TouchableOpacity
                        style={[styles.listCard, styles.currentListCard]}
                        onPress={handleOptimizeCurrentList}
                    >
                        <View style={styles.listHeader}>
                            <Text style={styles.listName}>Current Shopping List</Text>
                            <Text style={styles.listCost}>{formatEuropeanPrice(getCurrentListTotalCost())}</Text>
                        </View>
                        <Text style={styles.listDetails}>
                            {getCurrentListTotalItems()} items • Not saved yet
                        </Text>
                        <Text style={styles.optimizeNowBadge}>Optimize Now</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Saved Lists */}
            <View style={styles.savedListsSection}>
                <Text style={styles.sectionTitle}>Saved Lists ({savedLists.length})</Text>
                <FlatList
                    data={savedLists}
                    renderItem={renderListItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={renderEmptyState}
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
        marginBottom: 20,
        textAlign: 'center',
    },
    currentListSection: {
        marginBottom: 20,
    },
    savedListsSection: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    listContainer: {
        flexGrow: 1,
    },
    listCard: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    currentListCard: {
        borderColor: '#007AFF',
        borderWidth: 2,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    listName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    listCost: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    listDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    optimizeNowBadge: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
        textAlign: 'right',
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
    emptySubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
});