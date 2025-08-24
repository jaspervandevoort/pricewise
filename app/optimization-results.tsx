import { Stack, useLocalSearchParams } from 'expo-router';
import OptimizationResults from './screens/OptimizationResults';

export default function OptimizationResultsScreen() {
    const { listId } = useLocalSearchParams<{ listId?: string }>();

    return (
        <>
            <Stack.Screen options={{ title: 'Prijs Optimalisatie' }} />
            <OptimizationResults listId={listId} />
        </>
    );
}