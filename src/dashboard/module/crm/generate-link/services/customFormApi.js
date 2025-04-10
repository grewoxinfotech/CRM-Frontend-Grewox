import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../../../store/baseQuery";

export const customFormApi = createApi({
    reducerPath: "customFormApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["CustomForms"],
    endpoints: (builder) => ({
        getCustomForms: builder.query({
            query: () => ({
                url: "/custom-forms",
                method: "GET"
            }),
            transformResponse: (response) => {
                return {
                    data: response.data || [],
                    success: response.success,
                    message: response.message
                };
            },
            providesTags: ["CustomForms"],
        }),
        createCustomForm: builder.mutation({
            query: (data) => ({
                url: "/custom-forms",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["CustomForms"],
        }),
        updateCustomForm: builder.mutation({
            query: ({ id, data }) => ({
                url: `/custom-forms/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["CustomForms"],
        }),
        deleteCustomForm: builder.mutation({
            query: (id) => ({
                url: `/custom-forms/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["CustomForms"],
        }),
        getCustomFormById: builder.query({
            query: (id) => `/custom-forms/${id}`,
            providesTags: (result, error, id) => [{ type: 'CustomForms', id }],
        }),
    }),
});

export const {
    useGetCustomFormsQuery,
    useCreateCustomFormMutation,
    useUpdateCustomFormMutation,
    useDeleteCustomFormMutation,
    useGetCustomFormByIdQuery,
} = customFormApi;

// Sample data for testing
export const sampleCustomForm = {
    title: "Employee Registration Form",
    description: "Collect employee information for onboarding process",
    fields: {
        fullName: {
            type: "string",
            required: true
        },
        age: {
            type: "number",
            required: true
        },
        bio: {
            type: "text",
            required: false
        },
        isActive: {
            type: "boolean",
            required: true
        }
    }
};

// You can use this to test the form:
/*
const testData = {
    title: "Employee Registration Form",
    description: "Collect employee information for onboarding process",
    fields: [
        {
            name: "fullName",
            type: "string",
            required: true
        },
        {
            name: "age",
            type: "number",
            required: true
        },
        {
            name: "bio",
            type: "text",
            required: false
        },
        {
            name: "isActive",
            type: "boolean",
            required: true
        }
    ]
};
*/ 