import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    generalSettings: {},
    securitySettings: {},
    notificationSettings: {},
    currencies: {
        list: [],
        isLoading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 10,
            total: 0
        }
    },
    countries: {
        list: [],
        isLoading: false,
        error: null
    },
    isLoading: false,
    error: null,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        // Currency reducers
        setCurrencies: (state, action) => {
            state.currencies.list = action.payload;
        },
        setCurrencyLoading: (state, action) => {
            state.currencies.isLoading = action.payload;
        },
        setCurrencyError: (state, action) => {
            state.currencies.error = action.payload;
        },
        setCurrencyPagination: (state, action) => {
            state.currencies.pagination = {
                ...state.currencies.pagination,
                ...action.payload
            };
        },

        // General settings reducers
        setGeneralSettings: (state, action) => {
            state.generalSettings = action.payload;
        },
        setSecuritySettings: (state, action) => {
            state.securitySettings = action.payload;
        },
        setNotificationSettings: (state, action) => {
            state.notificationSettings = action.payload;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },

        // Country reducers
        setCountries: (state, action) => {
            state.countries.list = action.payload;
        },
        setCountryLoading: (state, action) => {
            state.countries.isLoading = action.payload;
        },
        setCountryError: (state, action) => {
            state.countries.error = action.payload;
        }
    },
});

export const {
    setCurrencies,
    setCurrencyLoading,
    setCurrencyError,
    setCurrencyPagination,
    setGeneralSettings,
    setSecuritySettings,
    setNotificationSettings,
    setLoading,
    setError,
    setCountries,
    setCountryLoading,
    setCountryError
} = settingsSlice.actions;

export default settingsSlice.reducer;
