import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../../../../config/config';

export const settingsApi = createApi({
    reducerPath: 'settingsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['WhatsappSettings', 'WhatsappInbox', 'Currencies', 'AiSettings', 'AiUsage', 'WhatsappBroadcast'],
    endpoints: (builder) => ({
        // ... (existing endpoints)
        getWhatsappBroadcasts: builder.query({
            query: (params) => ({
                url: '/whatsapp/broadcasts',
                method: 'GET',
                params: {
                    search: params?.search
                }
            }),
            transformResponse: (response) => response.data,
            providesTags: ['WhatsappBroadcast'],
        }),
        createWhatsappBroadcast: builder.mutation({
            query: (data) => ({
                url: '/whatsapp/broadcasts',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['WhatsappBroadcast'],
        }),
        getWhatsappBroadcastDetails: builder.query({
            query: (id) => ({
                url: `/whatsapp/broadcasts/${id}`,
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: (result, error, id) => [{ type: 'WhatsappBroadcast', id }],
        }),
        processWhatsappBroadcast: builder.mutation({
            query: (id) => ({
                url: `/whatsapp/broadcasts/${id}/send`,
                method: 'POST',
            }),
            invalidatesTags: ['WhatsappBroadcast'],
        }),
        pauseWhatsappBroadcast: builder.mutation({
            query: (id) => ({
                url: `/whatsapp/broadcasts/${id}/pause`,
                method: 'POST',
            }),
            invalidatesTags: ['WhatsappBroadcast'],
        }),
        resumeWhatsappBroadcast: builder.mutation({
            query: (id) => ({
                url: `/whatsapp/broadcasts/${id}/resume`,
                method: 'POST',
            }),
            invalidatesTags: ['WhatsappBroadcast'],
        }),
        retryWhatsappBroadcast: builder.mutation({
            query: (id) => ({
                url: `/whatsapp/broadcasts/${id}/retry`,
                method: 'POST',
            }),
            invalidatesTags: ['WhatsappBroadcast'],
        }),
        // ... (remaining endpoints)
        getAllCurrencies: builder.query({
            query: (params) => ({
                url: '/currencies',
                method: 'GET',
                params: {
                    page: params?.page,
                    limit: params?.limit
                }
            }),
            transformResponse: (response) => response.data,
            providesTags: ['Currencies'],
        }),
        getAllCountries: builder.query({
            query: (params) => ({
                url: '/countries',
                method: 'GET',
                params: {
                    page: params?.page,
                    limit: params?.limit
                }
            }),
            transformResponse: (response) => response.data,
        }),
        getWhatsappSettings: builder.query({
            query: () => ({
                url: '/whatsapp/settings',
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: ['WhatsappSettings'],
        }),
        saveWhatsappSettings: builder.mutation({
            query: (data) => ({
                url: '/whatsapp/settings',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['WhatsappSettings'],
        }),
        whatsappEmbeddedSignup: builder.mutation({
            query: (data) => ({
                url: '/whatsapp/embedded-signup',
                method: 'POST',
                body: data,
            }),
        }),
        getWhatsappTemplates: builder.query({
            query: () => ({
                url: '/whatsapp/templates',
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: ['WhatsappSettings'],
        }),
        getWhatsappMessages: builder.query({
            query: (params) => ({
                url: '/whatsapp/messages',
                method: 'GET',
                params: {
                    lead_id: params?.lead_id,
                    wa_from: params?.wa_from,
                    page: params?.page,
                    limit: params?.limit,
                },
            }),
            transformResponse: (response) => response.data,
            providesTags: ['WhatsappInbox'],
        }),
        getWhatsappConversations: builder.query({
            query: (params) => ({
                url: '/whatsapp/conversations',
                method: 'GET',
                params: {
                    limit: params?.limit,
                    q: params?.q,
                },
            }),
            transformResponse: (response) => response.data,
            providesTags: ['WhatsappInbox'],
        }),
        getApprovedCampaigns: builder.query({
            query: () => ({
                url: '/whatsapp/campaigns',
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
        }),
        sendBulkCampaign: builder.mutation({
            query: (data) => ({
                url: '/whatsapp/bulk-send',
                method: 'POST',
                body: data,
            }),
        }),
        setDefaultCurrency: builder.mutation({
            query: (id) => ({
                url: `/currencies/${id}/set-default`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Currencies'],
        }),
        syncWhatsappTemplates: builder.mutation({
            query: () => ({
                url: '/whatsapp/sync-templates',
                method: 'POST',
            }),
        }),
        getAiSettings: builder.query({
            query: () => ({
                url: '/super-admin/ai/settings',
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: ['AiSettings'],
        }),
        updateAiSettings: builder.mutation({
            query: (data) => ({
                url: '/super-admin/ai/settings',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['AiSettings'],
        }),
        getAiUsageStats: builder.query({
            query: () => ({
                url: '/super-admin/ai/usage',
                method: 'GET',
            }),
            transformResponse: (response) => response.data,
            providesTags: ['AiUsage'],
        }),
        sendWhatsAppMessage: builder.mutation({
            query: (data) => ({
                url: '/whatsapp/send-message',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['WhatsappInbox'],
        }),
    }),
});

export const {
    useGetAllCurrenciesQuery,
    useGetAllCountriesQuery,
    useGetWhatsappSettingsQuery,
    useSaveWhatsappSettingsMutation,
    useGetWhatsappMessagesQuery,
    useGetWhatsappConversationsQuery,
    useGetApprovedCampaignsQuery,
    useSendBulkCampaignMutation,
    useSetDefaultCurrencyMutation,
    useWhatsappEmbeddedSignupMutation,
    useSyncWhatsappTemplatesMutation,
    useGetWhatsappTemplatesQuery,
    useGetAiSettingsQuery,
    useUpdateAiSettingsMutation,
    useGetAiUsageStatsQuery,
    useSendWhatsAppMessageMutation,
    useGetWhatsappBroadcastsQuery,
    useCreateWhatsappBroadcastMutation,
    useGetWhatsappBroadcastDetailsQuery,
    useProcessWhatsappBroadcastMutation,
    usePauseWhatsappBroadcastMutation,
    useResumeWhatsappBroadcastMutation,
    useRetryWhatsappBroadcastMutation,
} = settingsApi;
