import { Stack } from 'expo-router';
import ProductList from './screens/ProductList';

export default function ProductListScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Mijn producten' }} />
            <ProductList />
        </>
    );
}