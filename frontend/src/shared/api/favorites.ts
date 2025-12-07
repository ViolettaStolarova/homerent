import { api } from './index'
import { Property } from '../types'

export interface ToggleFavoriteRequest {
  property_id: number
}

export const favoritesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<Property[], void>({
      query: () => '/favorites',
      providesTags: ['Favorite'],
    }),
    toggleFavorite: builder.mutation<{ is_favorite: boolean; message: string }, ToggleFavoriteRequest>({
      query: (data) => ({
        url: '/favorites',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Favorite', 'Property'],
    }),
  }),
})

export const {
  useGetFavoritesQuery,
  useToggleFavoriteMutation,
} = favoritesApi

