import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../../store/baseQuery';

export const subscribedUserApi = createApi({
    reducerPath: 'subscribedUserApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['SubscribedUsers'],
    endpoints: (builder) => ({
        getAllSubscribedUsers: builder.query({
            query: () => '/subscriptions/assign',
            providesTags: ['SubscribedUsers'],
        }),

        getsubcriptionById: builder.query({
            query: (id) => ({
                url: `/subscriptions/assign/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Subscriptions', id }]
        }),
    }),
   
});

export const {
    useGetAllSubscribedUsersQuery,
    useGetsubcriptionByIdQuery,
} = subscribedUserApi;

export default subscribedUserApi;
