import { api } from './index'
import { Property, Pagination, PropertyType, SortBy } from '../types'

export interface PropertiesResponse {
	properties: Property[]
	pagination: Pagination
}

export interface PropertiesParams {
	page?: number
	limit?: number
	city?: string
	check_in?: string
	check_out?: string
	guests?: number
	property_type?: PropertyType
	min_price?: number
	max_price?: number
	sort_by?: SortBy
}

export interface CreatePropertyRequest {
	property_type: PropertyType
	title: string
	description: string
	address: string
	city: string
	max_guests: number
	bedrooms: number
	beds: number
	bathrooms: number
	price_per_night: number
	amenities: string[]
	images: string[]
}

export const propertiesApi = api.injectEndpoints({
	endpoints: builder => ({
		getProperties: builder.query<PropertiesResponse, PropertiesParams>({
			query: params => ({
				url: '/properties',
				params,
			}),
			providesTags: ['Property'],
		}),
		getProperty: builder.query<Property, number>({
			query: id => `/properties/${id}`,
			providesTags: (_result, _error, id) => [{ type: 'Property', id }],
		}),
		createProperty: builder.mutation<
			{ id: number; message: string },
			CreatePropertyRequest
		>({
			query: data => ({
				url: '/properties',
				method: 'POST',
				body: data,
			}),
			invalidatesTags: ['Property'],
		}),
		updateProperty: builder.mutation<
			{ message: string },
			{ id: number; data: CreatePropertyRequest }
		>({
			query: ({ id, data }) => ({
				url: `/properties/${id}`,
				method: 'PUT',
				body: data,
			}),
			invalidatesTags: (_result, _error, { id }) => [{ type: 'Property', id }],
		}),
		deleteProperty: builder.mutation<{ message: string }, number>({
			query: id => ({
				url: `/properties/${id}`,
				method: 'DELETE',
			}),
			invalidatesTags: ['Property'],
		}),
		uploadImage: builder.mutation<{ url: string }, File>({
			queryFn: async (file, _queryApi, _extraOptions, _fetchWithBQ) => {
				const formData = new FormData()
				formData.append('image', file)
				console.log(
					'Sending FormData with file:',
					file.name,
					file.size,
					file.type
				)

				const token = localStorage.getItem('token')
				const API_URL =
					import.meta.env.VITE_API_URL || 'http://localhost/homerent/api'

				try {
					const response = await fetch(`${API_URL}/properties/upload-image`, {
						method: 'POST',
						headers: {
							Authorization: token ? `Bearer ${token}` : '',
						},
						body: formData,
					})

					if (!response.ok) {
						const error = await response
							.json()
							.catch(() => ({ error: 'Upload failed' }))
						return { error: error }
					}

					const data = await response.json()
					return { data }
				} catch (error: any) {
					return { error: { status: 'CUSTOM_ERROR', error: error.message } }
				}
			},
		}),
	}),
})

export const {
	useGetPropertiesQuery,
	useGetPropertyQuery,
	useCreatePropertyMutation,
	useUpdatePropertyMutation,
	useDeletePropertyMutation,
	useUploadImageMutation,
} = propertiesApi
