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
    tagTypes: ['WhatsappSettings'],
    endpoints: (builder) => ({
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
    }),
});

export const {
    useGetAllCurrenciesQuery,
    useGetAllCountriesQuery,
    useGetWhatsappSettingsQuery,
    useSaveWhatsappSettingsMutation,
    useGetApprovedCampaignsQuery,
    useSendBulkCampaignMutation,
} = settingsApi;
