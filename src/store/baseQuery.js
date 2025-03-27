import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { logout } from "../auth/services/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.token;

    // Don't add auth token for verify-signup and resend-otp
    if (
      endpoint !== "verifySignup" &&
      endpoint !== "resendSignupOtp" &&
      token
    ) {
      headers.set("authorization", `Bearer ${token}`);
    }

    // Set default headers for better API compatibility
    headers.set("Accept", "application/json");

    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  try {
    const result = await baseQuery(args, api, extraOptions);

    // Handle 401 Unauthorized
    if (
      result.error &&
      result.error.status === 401 &&
      !args.url.includes("verify-signup") &&
      !args.url.includes("resend-signup-otp")
    ) {
      api.dispatch(logout());
    }

    // Log any errors for debugging
    if (result.error) {
      console.error("API Error:", {
        url: args.url,
        status: result.error.status,
        data: result.error.data,
      });
    }

    return result;
  } catch (error) {
    console.error("API Request Failed:", error);
    return {
      error: {
        status: "FETCH_ERROR",
        error: "API request failed",
        data: error.message,
      },
    };
  }
};
