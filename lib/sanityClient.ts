import { createClient } from '@sanity/client'

export const sanityClient = createClient({
    projectId: process.env.EXPO_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.EXPO_PUBLIC_SANITY_DATASET || 'production',
    useCdn: false, // false voor write operaties
    apiVersion: process.env.EXPO_PUBLIC_SANITY_API_VERSION || '2023-05-03',
    token: process.env.EXPO_PUBLIC_SANITY_TOKEN,
})

// Helper functie om producten op te halen
export const getProducts = async () => {
    try {
        const query = '*[_type == "product"] | order(dateAdded desc)'
        const products = await sanityClient.fetch(query)
        return products
    } catch (error) {
        console.error('Error fetching products:', error)
        throw error
    }
}

export const deleteProduct = async (id: string) => {
    try {
        const result = await sanityClient.delete(id)
        return result
    } catch (error) {
        console.error('Error deleting product:', error)
        throw error
    }

}

// Helper functie om een product toe te voegen
export const createProduct = async (product: {
    name: string
    price: number
    store: string
    dateAdded: string
}) => {
    try {
        const doc = {
            _type: 'product',
            name: product.name,
            price: product.price,
            store: product.store,
            dateAdded: product.dateAdded,
            slug: {
                _type: 'slug',
                current: product.name.toLowerCase().replace(/\s+/g, '-').slice(0, 96)
            }
        }

        const result = await sanityClient.create(doc)
        return result
    } catch (error) {
        console.error('Error creating product:', error)
        throw error
    }
}

// Helper functie om een product bij te werken
export const updateProduct = async (id: string, updates: {
    name?: string
    price?: number
    store?: string
}) => {
    try {
        const result = await sanityClient.patch(id).set(updates).commit()
        return result
    } catch (error) {
        console.error('Error updating product:', error)
        throw error
    }
}

// Helper functies voor stores
export const getStores = async () => {
    try {
        const query = '*[_type == "store"] | order(name asc)'
        const stores = await sanityClient.fetch(query)
        return stores
    } catch (error) {
        console.error('Error fetching stores:', error)
        throw error
    }
}

export const getActiveStores = async () => {
    try {
        const query = '*[_type == "store" && isActive == true] | order(name asc)'
        const stores = await sanityClient.fetch(query)
        return stores
    } catch (error) {
        console.error('Error fetching active stores:', error)
        throw error
    }
}

export const createStore = async (store: {
    name: string
    dateAdded: string
}) => {
    try {
        const doc = {
            _type: 'store',
            name: store.name,
            dateAdded: store.dateAdded,
            slug: {
                _type: 'slug',
                current: store.name.toLowerCase().replace(/\s+/g, '-').slice(0, 96)
            }
        }

        const result = await sanityClient.create(doc)
        return result
    } catch (error) {
        console.error('Error creating store:', error)
        throw error
    }
}

export const updateStore = async (id: string, updates: {
    name?: string
}) => {
    try {
        const result = await sanityClient.patch(id).set(updates).commit()
        return result
    } catch (error) {
        console.error('Error updating store:', error)
        throw error
    }
}

export const deleteStore = async (id: string) => {
    try {
        const result = await sanityClient.delete(id)
        return result
    } catch (error) {
        console.error('Error deleting store:', error)
        throw error
    }
}