import { Stack } from 'expo-router';
import CreateShoppingList from './screens/CreateShoppingList';

export default function CreateShoppingListScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Create Shopping List' }} />
            <CreateShoppingList />
        </>
    );
}