import { Stack } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import { store } from '~/store/store';
import { useEffect } from 'react';
import { setProducts } from '~/store/productSlice';
import { setStores } from '~/store/storesSlice';
import { getProducts, getStores } from '~/lib/sanityClient';
import '../global.css';

// Component om data te laden bij app start
function DataLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadInitialData = async () => {
      try {


        // Laad producten en winkels parallel
        const [sanityProducts, sanityStores] = await Promise.all([
          getProducts(),
          getStores()
        ]);

        // zet producten in redux
        const appProducts = sanityProducts.map((sanityProduct: any) => ({
          id: sanityProduct._id,
          name: sanityProduct.name,
          price: sanityProduct.price,
          store: sanityProduct.store,
          dateAdded: sanityProduct.dateAdded
        }));

        // zet winkels in redux
        const appStores = sanityStores.map((sanityStore: any) => ({
          id: sanityStore._id,
          name: sanityStore.name,
          dateAdded: sanityStore.dateAdded
        }));

        dispatch(setProducts(appProducts));
        dispatch(setStores(appStores));

        console.log(`Loaded ${appProducts.length} products and ${appStores.length} stores`);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();
  }, [dispatch]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <DataLoader>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Home' }} />
          <Stack.Screen name="addproduct" options={{ title: 'Add Product' }} />
          <Stack.Screen name="product-list" options={{ title: 'My Products' }} />
          <Stack.Screen name="create-shopping-list" options={{ title: 'Create Shopping List' }} />
          <Stack.Screen name="optimize-shopping" options={{ title: 'Optimize Shopping' }} />
          <Stack.Screen name="optimization-results" options={{ title: 'Price Optimization' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="details" options={{ title: 'Details' }} />
        </Stack>
      </DataLoader>
    </Provider>
  );
}