import { createApi } from '@reduxjs/toolkit/query/react';
import { loginSuccess, loginFailure, loginStart, setUserRole } from './authSlice';
import { baseQueryWithReauth } from '../../store/baseQuery';

export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                dispatch(loginStart());
                try {
                    const { data: response } = await queryFulfilled;
                    if (response.success) {
                        dispatch(loginSuccess({
                            user: response.data.user,
                            token: response.data.token,
                            message: response.message
                        }));
                        // After successful login, fetch role information
                        if (response.data.user.role_id) {
                            dispatch(authApi.endpoints.getRole.initiate(response.data.user.role_id));
                        }
                    } else {
                        dispatch(loginFailure(response.message || 'Login failed'));
                    }
                } catch (error) {
                    dispatch(loginFailure(error.error?.message || 'Login failed'));
                }
            },
        }),
        getRole: builder.query({
            query: (roleId) => `/roles/${roleId}`,
            async onQueryStarted(_, { dispatch, queryFulfilled }) {
                try {
                    const { data: response } = await queryFulfilled;
                    if (response.success) {
                        dispatch(setUserRole(response.data));
                    }
                } catch (error) {
                    console.error('Failed to fetch role:', error);
                }
            },
        }),
    }),
});

export const { useLoginMutation, useGetRoleQuery } = authApi;