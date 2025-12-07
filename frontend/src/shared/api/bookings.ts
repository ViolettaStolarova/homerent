import { api } from './index'
import { Booking, BookingStatus } from '../types'

export interface CreateBookingRequest {
  property_id: number
  check_in: string
  check_out: string
  guests: number
}

export interface BookingsParams {
  filter?: BookingStatus | 'all'
  type?: 'my_bookings' | 'incoming'
}

export const bookingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query<Booking[], BookingsParams>({
      query: (params) => ({
        url: '/bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    getBooking: builder.query<Booking, number>({
      query: (id) => `/bookings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),
    createBooking: builder.mutation<{ id: number; message: string }, CreateBookingRequest>({
      query: (data) => ({
        url: '/bookings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
    cancelBooking: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/bookings/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking'],
    }),
    confirmBooking: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/bookings/${id}/confirm`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking'],
    }),
    rejectBooking: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/bookings/${id}/reject`,
        method: 'PUT',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
})

export const {
  useGetBookingsQuery,
  useGetBookingQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useRejectBookingMutation,
} = bookingsApi

