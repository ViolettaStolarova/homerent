import { api } from './index'

export interface CreateReviewRequest {
	property_id: number
	rating: number
	comment?: string
}

export const reviewsApi = api.injectEndpoints({
	endpoints: builder => ({
		createReview: builder.mutation<
			{ id: number; message: string },
			CreateReviewRequest
		>({
			query: data => ({
				url: '/reviews',
				method: 'POST',
				body: data,
			}),
			invalidatesTags: (result, error, { property_id }) => [
				{ type: 'Property', id: property_id },
			],
		}),
	}),
})

export const { useCreateReviewMutation } = reviewsApi
