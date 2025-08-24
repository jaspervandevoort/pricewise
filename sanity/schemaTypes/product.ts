import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Product Name',
            type: 'string',
            validation: (Rule) => Rule.required().min(1).max(200).error('Product name is required and must be between 1-200 characters')
        }),
        defineField({
            name: 'price',
            title: 'Price',
            type: 'number',
            validation: (Rule) => Rule.required().min(0).precision(2).error('Price must be a positive number with max 2 decimal places')
        }),
        defineField({
            name: 'store',
            title: 'Store',
            type: 'string',
            validation: (Rule) => Rule.required().min(1).max(100).error('Store name is required and must be between 1-100 characters')
        }),
        defineField({
            name: 'dateAdded',
            title: 'Date Added',
            type: 'datetime',
            initialValue: () => new Date().toISOString(),
            validation: (Rule) => Rule.required()
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'name',
                maxLength: 96,
                slugify: (input: string) => input
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .slice(0, 96)
            },
            validation: (Rule) => Rule.required()
        })
    ],
});