import { Stack } from 'expo-router';
import ProductAdd from './screens/productadd';

export default function AddProductScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Voeg product toe' }} />
            <ProductAdd />
        </>
    );
}