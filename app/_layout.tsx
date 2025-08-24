import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '~/store/store';
import '../global.css';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="add-product" options={{ title: 'Add Product' }} />
        <Stack.Screen name="product-list" options={{ title: 'My Products' }} />
        <Stack.Screen name="create-shopping-list" options={{ title: 'Create Shopping List' }} />
        <Stack.Screen name="optimize-shopping" options={{ title: 'Optimize Shopping' }} />
        <Stack.Screen name="optimization-results" options={{ title: 'Price Optimization' }} />
        <Stack.Screen name="details" options={{ title: 'Details' }} />
      </Stack>
    </Provider>
  );
}