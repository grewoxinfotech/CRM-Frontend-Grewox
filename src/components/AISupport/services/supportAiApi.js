import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from '../../../store/baseQuery';

export const supportAiApi = createApi({
    reducerPath: 'supportAiApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getSupportChat: builder.mutation({
            query: (data) => ({
                url: '/ai/support-chat',
                method: 'POST',
                body: data
            }),
        }),
    })
});

export const { useGetSupportChatMutation } = supportAiApi;
