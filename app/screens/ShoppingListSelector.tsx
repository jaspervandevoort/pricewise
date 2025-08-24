import React, { JSX } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '~/store/store';
import { ShoppingList } from '~/store/shoppingListSlice';
import { router } from 'expo-router';

export default function ShoppingListSelector(): JSX.Element {
    const savedLists = useSelector((state: RootState) => state.shoppingList.savedLists);
    const currentList = useSelector((state: RootState) => state.shoppingList.currentList);

    const handleSelectList = (listId: string) => {
        router.push(`/optimization-results?listId=${listId}`);
    };

    const handleOptimizeCurrentList = () => {
        router.push('/optimization-results');
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
                    <Text style={styles.listCost}>${totalCost.toFixed(2)}</Text>
                </View>
                <Text style={styles.listDetails}>
                    {totalItems} items • Created {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.itemsPreview}>
                    {item.items.slice(0, 3).map((listItem, index) => (
                        <Text key={index} style={styles.itemPreview}>
                            • {listItem.productName} ({listItem.quantity})
                        </Text>
                    ))}
                    {item.items.length > 3 && (
                        <Text style={styles.moreItems}>
                            +{item.items.length - 3} more items
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No saved shopping lists</Text>
            <Text style={styles.emptySubtext}>Create and save a shopping list first to optimize prices!</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Shopping List to Optimize</Text>

            {/* Current List Option */}
            {currentList.length > 0 && (
                <TouchableOpacity
                    style={styles.currentListCard}
                    onPress={handleOptimizeCurrentList}
                >
                    <Text style={styles.currentListTitle}>📝 Current List (Unsaved)</Text>
                    <Text style={styles.currentListDetails}>
                        {currentList.reduce((sum, item) => sum + item.quantity, 0)} items
                    </Text>
                    <Text style={styles.optimizeButtonText}>Tap to optimize →</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Saved Shopping Lists</Text>

            <FlatList
                data={savedLists}
                renderItem={renderListItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            />
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginTop: 10,
    },
    currentListCard: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
    },
    currentListTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    currentListDetails: {
        fontSize: 14,
        color: 'white',
        opacity: 0.9,
        marginBottom: 8,
    },
    optimizeButtonText: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        textAlign: 'right',
    },
    listContainer: {
        flexGrow: 1,
    },
    listCard: {
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
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    listName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    listCost: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    listDetails: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    itemsPreview: {
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
    },
    itemPreview: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    moreItems: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
        marginTop: 4,
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