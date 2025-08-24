import { Stack } from 'expo-router';
import ShoppingListSelector from './screens/ShoppingListSelector';

export default function OptimizeShoppingScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Optimaliseer Winkelsessie' }} />
            <ShoppingListSelector />
        </>
    );
}
