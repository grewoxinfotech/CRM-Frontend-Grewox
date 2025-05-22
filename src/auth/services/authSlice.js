import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isLogin: false,
    message: null,
    success: false,
    userRole: null,
    isRegistering: false,
    registrationError: null,
    registrationSuccess: false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        registerStart: (state) => {
            state.isRegistering = true;
            state.registrationError = null;
            state.registrationSuccess = false;
        },
        registerSuccess: (state, action) => {
            state.isRegistering = false;
            state.registrationSuccess = true;
            state.registrationError = null;
            state.message = action.payload.message;
        },
        registerFailure: (state, action) => {
            state.isRegistering = false;
            state.registrationSuccess = false;
            state.registrationError = action.payload;
            state.message = action.payload;
        },
        clearRegistrationState: (state) => {
            state.isRegistering = false;
            state.registrationError = null;
            state.registrationSuccess = false;
            state.message = null;
        },
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
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
            state.userRole = user?.roleName || null;
        },
        loginFailure: (state, action) => {
            return {
                ...initialState,
                error: action.payload,
                message: action.payload
            };
        },
        logout: () => initialState,
        clearError: (state) => {
            state.error = null;
            state.message = null;
        },
        updateUser: (state, action) => {
            if (action.payload) {
                state.user = { ...state.user, ...action.payload };
                if (action.payload.roleName) {
                    state.userRole = action.payload.roleName;
                }
            }
        },
        setLoading: (state, action) => {
            state.isLoading = Boolean(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            (action) => action.type === 'superadminProfileApi/executeMutation/fulfilled' &&
                action.meta.arg.endpointName === 'updateSuperAdminProfile',
            (state, action) => {
                if (action.payload?.data) {
                    state.user = { ...state.user, ...action.payload.data };
                    if (action.payload.data.roleName) {
                        state.userRole = action.payload.data.roleName;
                    }
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
    registerStart,
    registerSuccess,
    registerFailure,
    clearRegistrationState
} = authSlice.actions;

// Export selectors with null checks
export const selectCurrentUser = (state) => state.auth?.user || null;
export const selectCurrentToken = (state) => state.auth?.token || null;
export const selectAuthLoading = (state) => Boolean(state.auth?.isLoading);
export const selectAuthError = (state) => state.auth?.error || null;
export const selectIsLogin = (state) => Boolean(state.auth?.isLogin);
export const selectAuthMessage = (state) => state.auth?.message || null;
export const selectAuthSuccess = (state) => Boolean(state.auth?.success);
export const selectUserRole = (state) => state.auth?.userRole || null;
export const selectIsRegistering = (state) => Boolean(state.auth?.isRegistering);
export const selectRegistrationError = (state) => state.auth?.registrationError || null;
export const selectRegistrationSuccess = (state) => Boolean(state.auth?.registrationSuccess);

export default authSlice.reducer;