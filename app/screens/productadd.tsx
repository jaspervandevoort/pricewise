import React, { JSX, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { addProduct, Product } from '~/store/productSlice';
import { AppDispatch } from '~/store/store';

export default function ProductAdd(): JSX.Element {
    const [productName, setProductName] = useState<string>('');
    const [price, setPrice] = useState<string>('');
    const [store, setStore] = useState<string>('');

    const dispatch = useDispatch<AppDispatch>();

    const handleAddProduct = (): void => {
        // Validation
        if (!productName.trim() || !price.trim() || !store.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber)) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        // Create product object
        const newProduct: Product = {
            id: Date.now().toString(),
            name: productName.trim(),
            price: priceNumber,
            store: store.trim(),
            dateAdded: new Date().toISOString()
        };

        // Dispatch to Redux store
        dispatch(addProduct(newProduct));

        // TODO: Also save to Sanity
        // saveToSanity(newProduct);

        // Clear form
        setProductName('');
        setPrice('');
        setStore('');

        Alert.alert('Success', 'Product added successfully!');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New Product</Text>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Product Name</Text>
                <TextInput
                    style={styles.input}
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="Enter product name"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Price ($)</Text>
                <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    placeholder="0.00"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                />

                <Text style={styles.label}>Store</Text>
                <TextInput
                    style={styles.input}
                    value={store}
                    onChangeText={setStore}
                    placeholder="Enter store name"
                    placeholderTextColor="#999"
                />

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddProduct}
                >
                    <Text style={styles.addButtonText}>Add Product</Text>
                </TouchableOpacity>
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
        marginBottom: 30,
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fafafa',
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        marginTop: 25,
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});