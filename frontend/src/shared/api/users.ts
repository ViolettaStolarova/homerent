import { api } from './index'
import { Property, Booking } from '../types'

export interface UpdateProfileRequest {
  full_name?: string
  username?: string
  phone?: string
  avatar_url?: string
}

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

export interface IncomingBookingsResponse {
  bookings: Booking[]
  unread_count: number
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<unknown, void>({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<{ message: string }, UpdateProfileRequest>({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<{ message: string }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/users/password',
        method: 'PUT',
        body: data,
      }),
    }),
    getMyProperties: builder.query<Property[], void>({
      query: () => '/users/properties',
      providesTags: ['Property'],
    }),
    getIncomingBookings: builder.query<IncomingBookingsResponse, { filter?: string }>({
      query: (params) => ({
        url: '/users/incoming-bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
  }),
})

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetMyPropertiesQuery,
  useGetIncomingBookingsQuery,
} = usersApi

