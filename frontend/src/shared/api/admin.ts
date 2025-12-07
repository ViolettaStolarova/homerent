import { api } from './index'

export interface AdminStats {
  users: {
    total: number
    new_this_month: number
  }
  properties: {
    total: number
    new_this_month: number
  }
  bookings: {
    total: number
    active: number
  }
}

export interface ExportParams {
  format?: 'csv' | 'xlsx' | 'pdf'
  start_date?: string
  end_date?: string
}

export interface BlockUserRequest {
  blocked: boolean
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStats: builder.query<AdminStats, void>({
      query: () => '/admin/stats',
    }),
    exportData: builder.query<void, ExportParams>({
      query: (params) => ({
        url: '/admin/export',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
    blockUser: builder.mutation<{ message: string }, { id: number; data: BlockUserRequest }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}/block`,
        method: 'PUT',
        body: data,
      }),
    }),
  }),
})

export const {
  useGetStatsQuery,
  useLazyExportDataQuery,
  useBlockUserMutation,
} = adminApi

