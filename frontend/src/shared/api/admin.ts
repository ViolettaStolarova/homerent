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
	endpoints: builder => ({
		getStats: builder.query<AdminStats, void>({
			query: () => '/admin/stats',
		}),
		exportData: builder.mutation<Blob, ExportParams>({
			query: params => ({
				url: '/admin/export',
				params,
				responseHandler: async response => {
					const contentType = response.headers.get('content-type') || ''
					if (contentType.includes('application/json')) {
						const text = await response.text()
						throw new Error(text)
					}
					return response.blob()
				},
			}),
		}),
		blockUser: builder.mutation<
			{ message: string },
			{ id: number; data: BlockUserRequest }
		>({
			query: ({ id, data }) => ({
				url: `/admin/users/${id}/block`,
				method: 'PUT',
				body: data,
			}),
		}),
	}),
})

export const { useGetStatsQuery, useExportDataMutation, useBlockUserMutation } =
	adminApi
