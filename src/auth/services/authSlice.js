import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isLogin: false,
    message: null,
    success: false,
    userRole: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
            state.success = false;
            state.message = null;
        },
        loginSuccess: (state, action) => {
            const { user, token, message } = action.payload;
            state.isLoading = false;
            state.user = user;
            state.token = token;
            state.isLogin = true;
            state.error = null;
            state.success = true;
            state.message = message;
        },
        loginFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.success = false;
            state.message = action.payload;
            state.userRole = null;
            state.user = null;
            state.token = null;
            state.isLogin = false;
        },
        logout: (state) => {
            return initialState;
        },
        setUserRole: (state, action) => {
            state.userRole = action.payload;
        },
        clearError: (state) => {
            state.error = null;
            state.message = null;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Add matchers for superadminProfileApi
        builder.addMatcher(
            (action) => action.type === 'superadminProfileApi/executeMutation/fulfilled' &&
                action.meta.arg.endpointName === 'updateSuperAdminProfile',
            (state, action) => {
                if (action.payload?.data) {
                    state.user = { ...state.user, ...action.payload.data };
                }
            }
        );
    }
});

// Export actions
export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    clearError,
    updateUser,
    setLoading,
    setUserRole
} = authSlice.actions;

// Export selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsLogin = (state) => state.auth.isLogin;
export const selectAuthMessage = (state) => state.auth.message;
export const selectAuthSuccess = (state) => state.auth.success;
export const selectUserRole = (state) => state.auth.userRole;

export default authSlice.reducer;