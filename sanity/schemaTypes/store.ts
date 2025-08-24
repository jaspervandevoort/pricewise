import { defineType, defineField } from 'sanity'

export default defineType({
    name: 'store',
    title: 'Store',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Store Name',
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

    preview: {
        select: {
            title: 'name',


        },
        prepare(selection) {
            const { title } = selection;
            return {
                title: title

            }
        }
    },

    orderings: [
        {
            title: 'Name A-Z',
            name: 'nameAsc',
            by: [
                { field: 'name', direction: 'asc' }
            ]
        },
        {
            title: 'Date Added (Newest)',
            name: 'dateAddedDesc',
            by: [
                { field: 'dateAdded', direction: 'desc' }
            ]
        }
    ]
})