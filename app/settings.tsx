import { Stack } from 'expo-router';
import Settings from './screens/Settings';

export default function SettingsScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Instellingen' }} />
            <Settings />
        </>
    );
}