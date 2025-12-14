import { configureStore } from '@reduxjs/toolkit'
import { api } from '@/shared/api'

export const store = configureStore({
	reducer: {
		[api.reducerPath]: api.reducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [
					'api/executeMutation/fulfilled',
					'api/executeMutation/pending',
				],
				ignoredActionPaths: ['payload'],
				ignoredPaths: ['api.mutations'],
			},
		}).concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
