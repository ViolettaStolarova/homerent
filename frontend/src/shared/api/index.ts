import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/homerent/api'

const baseQuery = fetchBaseQuery({
	baseUrl: API_URL,
	prepareHeaders: headers => {
		const token = localStorage.getItem('token')
		if (token) {
			headers.set('authorization', `Bearer ${token}`)
		}
		return headers
	},
})

export const api = createApi({
	reducerPath: 'api',
	baseQuery,
	tagTypes: ['Property', 'Booking', 'User', 'Favorite'],
	endpoints: () => ({}),
})
