import React, { useEffect } from "react";
import { Form, Input, Button, Checkbox, notification } from "antd";
import { motion } from "framer-motion";
import { FiLock, FiMail, FiBox, FiUser } from "react-icons/fi";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLogin } from "../services/authSlice";
import form_graphic from "../../assets/auth/form_grapihc.png";
import "./register.scss";
import { useRegisterMutation } from "../services/authApi";

const validationSchema = yup.object().shape({
  username: yup.string().required("Username is required").trim(),
  email: yup.string().email("Invalid email format").required("Email is required").trim(),
  password: yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/^[a-zA-Z0-9!@#$%^&*]{8,30}$/, "Create a strong password"),
});

export default function Register() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsLogin);
  const [form] = Form.useForm();
  const [register, { isLoading }] = useRegisterMutation();

  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/auth-redirect", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear any persisted state when login component mounts
  useEffect(() => {
    localStorage.removeItem("persist:root");
    sessionStorage.clear();
  }, []);

  const showNotification = (type, message, description = "") => {
    api[type]({
      message: message,
      description: description,
      placement: "topRight",
      duration: 3,
    });
  };

  const validateForm = async (values) => {
    try {
      await validationSchema.validate(values, { abortEarly: false });
      return true;
    } catch (err) {
      const errors = {};
      err.inner.forEach((error) => {
        errors[error.path] = error.message;
      });
      form.setFields(
        Object.keys(errors).map((key) => ({
          name: key,
          errors: [errors[key]],
        }))
      );
      return false;
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const values = await form.validateFields();
    const isValid = await validateForm(values);
    if (!isValid) return;

    try {
      const result = await register(values).unwrap();
      if (result.success) {
        showNotification("success", "Registration initiated", "Please verify your email to complete registration");
        // Store form data in localStorage for after OTP verification
        localStorage.setItem('registrationData', JSON.stringify(values));
        // Navigate to OTP verification page
        navigate("/otp"); 
      } else {
        showNotification(
          "error",
          "Registration Failed",
          result.message || "Registration failed"
        );
      }
    } catch (error) {
      let errorMessage = "Registration failed";

      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.error) {
        errorMessage =
          typeof error.error === "string" ? error.error : "Server error";
      } else if (error.message) {
        errorMessage = error.message;
      }

      showNotification("error", "Registration Failed", errorMessage);
    }
  };

  return (
    <div className="register-container">
      {contextHolder}
      <div className="register-split">
        <motion.div
          className="illustration-side"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="brand">
            <FiBox className="logo" />
            <span className="brand-name">Raiser CRM</span>
          </div>
          <motion.img
            src={form_graphic}
            alt="Work illustration"
            className="illustration"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="illustration-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p>Sign up to start your CRM</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="form-side"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="register-header">
            <h1>Sign Up to Raiser CRM</h1>
            <p>Enter your details to create an account</p>
          </div>

          <Form
            form={form}
            name="register"
            className="register-form"
            layout="vertical"
            validateTrigger={["onBlur", "onChange"]}
          >
            <Form.Item
              label="Username"
              name="username"
              validateTrigger={["onBlur", "onChange"]}
              rules={[
                {
                  required: true,
                  message: "Username is required",
                },
              ]}
            >
              <Input
                prefix={<FiUser className="site-form-item-icon" />}
                placeholder="Enter your username"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              validateTrigger={["onBlur", "onChange"]}
              rules={[
                {
                  type: "email",
                  message: "Invalid email format",
                },
                {
                  required: true,
                  message: "Email is required",
                },
              ]}
            >
              <Input
                prefix={<FiMail className="site-form-item-icon" />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              validateTrigger={["onBlur", "onChange"]}
              rules={[
                {
                  required: true,
                  message: "Password is required",
                },
                {
                  min: 8,
                  message: "Password must be at least 8 characters long",
                },
                {
                  pattern: /^[a-zA-Z0-9!@#$%^&*]{8,30}$/,
                  message: "Create a strong password",
                },
              ]}
            >
              <Input.Password
                prefix={<FiLock className="site-form-item-icon" />}
                placeholder="Enter your password"
                size="large"
              />
            </Form.Item>

            <div className="form-footer">
              <Form.Item
                name="remember"
                valuePropName="checked"
                className="remember-me"
                noStyle
              >
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" className="forgot-link">
                Forgot Password?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                onClick={handleRegister}
                loading={isLoading}
                className="register-button"
                block
              >
                {isLoading ? "Signing up..." : "Sign Up →"}
              </Button>
            </Form.Item>

            <Form.Item>
              <Button
                type="default"
                onClick={() => navigate('/login')}
                className="login-button"
                block
              >
                Already have an account? Sign In
              </Button>
            </Form.Item>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
