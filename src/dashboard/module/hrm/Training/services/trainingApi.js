import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../../store/baseQuery';

export const trainingApi = createApi({
    reducerPath: 'trainingApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Trainings'],
    endpoints: (builder) => ({
        getTrainings: builder.query({
            query: ({ page = 1, pageSize = 10, search = '' } = {}) => ({
                url: '/trainings',
                method: 'GET',
                params: {
                    page,
                    pageSize,
                    search
                }
            }),
            transformResponse: (response) => {
                // The response structure is:
                // { success: true, message: { data: [...], pagination: {...} }, data: null }
                const data = response.message.data.map(training => ({
                    ...training,
                    key: training.id
                }));
                return {
                    data,
                    pagination: response.message.pagination
                };
            },
            providesTags: ['Trainings']
        }),
        getTrainingById: builder.query({
            query: (id) => `/trainings/${id}`,
            providesTags: ['Trainings'],
        }),
        createTraining: builder.mutation({
            query: (data) => ({
                url: '/trainings',
                method: 'POST',
                body: data
            }),
            invalidatesTags: ['Trainings']
        }),
        updateTraining: builder.mutation({
            query: ({ id, data }) => ({
                url: `/trainings/${id}`,
                method: 'PUT',
                body: data
            }),
            invalidatesTags: ['Trainings']
        }),
        deleteTraining: builder.mutation({
            query: (id) => ({
                url: `/trainings/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Trainings']
        })
    })
});

export const {
    useGetTrainingsQuery,
    useGetTrainingByIdQuery,
    useCreateTrainingMutation,
    useUpdateTrainingMutation,
    useDeleteTrainingMutation
} = trainingApi;
export default trainingApi;

