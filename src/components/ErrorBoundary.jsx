import React from "react";
import { useRouteError, Link } from "react-router-dom";
import { Button, Result } from "antd";
import { FiHome, FiRefreshCw } from "react-icons/fi";

const ErrorBoundary = () => {
  const error = useRouteError();

  // Handle different types of errors
  const getErrorDetails = () => {
    // Handle RTK Query middleware error
    if (
      error?.message?.includes("RTK-Query API") &&
      error?.message?.includes("middleware")
    ) {
      return {
        status: "500",
        title: "API Configuration Error",
        subTitle:
          "There was an error with the API configuration. Please try refreshing the page.",
        showRefresh: true,
      };
    }

    // Handle other error types
    if (error?.status === 404) {
      return {
        status: "404",
        title: "Page Not Found",
        subTitle: "Sorry, the page you visited does not exist.",
      };
    } else if (error?.status === 401) {
      return {
        status: "401",
        title: "Unauthorized",
        subTitle: "Sorry, you are not authorized to access this page.",
      };
    } else if (error?.status === 403) {
      return {
        status: "403",
        title: "Forbidden",
        subTitle: "Sorry, you do not have permission to access this page.",
      };
    } else {
      return {
        status: "500",
        title: "Something Went Wrong",
        subTitle: "Sorry, an unexpected error has occurred.",
        extra: error?.message || "Internal Server Error",
      };
    }
  };

  const errorDetails = getErrorDetails();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Result
      status={errorDetails.status}
      title={errorDetails.title}
      subTitle={errorDetails.subTitle}
      extra={[
        <Link key="home" to="/">
          <Button type="primary" icon={<FiHome />}>
            Back to Home
          </Button>
        </Link>,
        errorDetails.showRefresh && (
          <Button key="refresh" onClick={handleRefresh} icon={<FiRefreshCw />}>
            Refresh Page
          </Button>
        ),
      ].filter(Boolean)}
    />
  );
};

export default ErrorBoundary;
