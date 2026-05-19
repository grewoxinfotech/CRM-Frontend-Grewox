import React, { useState } from 'react';
import { Modal, Drawer, Form, Input, Button, Typography, Divider, message, Row, Col, Select } from 'antd';
import { FiUser, FiMail, FiLock, FiBriefcase, FiX, FiPhone, FiMapPin } from 'react-icons/fi';
import { useCreateCompanyMutation, useUpdateCompanyMutation, useVerifySignupMutation, useResendSignupOtpMutation } from './services/companyApi';
import indianStatesAndCities from '../../../utils/Indian_Cities_In_States_JSON.json';
import industriesData from '../../../utils/industries.json';

const { Text } = Typography;

const CreateCompany = ({ open, onCancel, isEditing, initialValues, loading, onSuccess }) => {
    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
    const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();
    const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [verifySignup] = useVerifySignupMutation();
    const [resendSignupOtp] = useResendSignupOtpMutation();
    const [companyFormData, setCompanyFormData] = useState(null);

    const selectedState = Form.useWatch('state', form);

    const availableCities = React.useMemo(() => {
        if (!selectedState) return [];
        return indianStatesAndCities[selectedState] || [];
    }, [selectedState]);

    const handleSubmit = async (values) => {
        try {
            if (isEditing) {
                await updateCompany({ id: initialValues.id, data: values }).unwrap();
                message.success('Company updated successfully');
                form.resetFields();
                if (onSuccess) {
                    onSuccess();
                } else {
                    onCancel();
                }
            } else {
                setCompanyFormData(values);
                const response = await createCompany(values).unwrap();
                if (response.success) {
                    localStorage.setItem('verificationToken', response.data.verificationToken);
                    setIsOtpModalVisible(true);
                    message.success(response.message || 'Please verify your email to complete registration');
                } else {
                    message.error(response.message || 'Failed to create company');
                }
            }
        } catch (error) {
            message.error(error?.data?.message || 'Something went wrong');
        }
    };

    const handleOtpSubmit = async () => {
        try {
            setOtpLoading(true);
            const otpValue = await otpForm.validateFields();

            const verifyResponse = await verifySignup({
                otp: otpValue.otp
            }).unwrap();

            if (verifyResponse.success) {
                localStorage.removeItem('verificationToken');
                message.success('Company verified successfully');
                setIsOtpModalVisible(false);
                otpForm.resetFields();
                form.resetFields();
                if (onSuccess) {
                    onSuccess();
                } else {
                    onCancel();
                }
            } else {
                message.error(verifyResponse.message || 'Failed to verify OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to verify OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            const response = await resendSignupOtp().unwrap();

            if (response.success) {
                localStorage.setItem('verificationToken', response.data.verificationToken);
                message.success('OTP resent successfully');
            } else {
                message.error(response.message || 'Failed to resend OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to resend OTP');
        }
    };

    React.useEffect(() => {
        return () => {
            localStorage.removeItem('verificationToken');
        };
    }, []);

    const OtpModal = () => (
        <Modal
            title={null}
            open={isOtpModalVisible}
            onCancel={() => {
                setIsOtpModalVisible(false);
                otpForm.resetFields();
            }}
            footer={null}
            width={420}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            styles={{
                body: {
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "8px",
                },
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
            >
                <Button
                    type="text"
                    onClick={() => {
                        setIsOtpModalVisible(false);
                        otpForm.resetFields();
                    }}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        color: "#ffffff",
                        width: "32px",
                        height: "32px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(8px)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                >
                    <FiX style={{ fontSize: "20px" }} />
                </Button>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <FiLock style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            Verify OTP
                        </h2>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Enter the OTP sent to your email
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ padding: "24px" }}>
                <Form
                    form={otpForm}
                    layout="vertical"
                    onFinish={handleOtpSubmit}
                >
                    <Form.Item
                        name="otp"
                        rules={[
                            { required: true, message: 'Please enter OTP' },
                            { len: 4, message: 'OTP must be 4 digits' },
                            { pattern: /^[0-9]+$/, message: 'OTP must contain only numbers' }
                        ]}
                    >
                        <Input
                            placeholder="Enter 4-digit OTP"
                            maxLength={4}
                            style={{
                                borderRadius: "8px",
                                height: "40px",
                                fontSize: "16px",
                                textAlign: "center",
                                letterSpacing: "8px",
                                fontWeight: "600"
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={otpLoading}
                            block
                            style={{
                                height: "40px",
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}
                        >
                            Verify & Create Company
                        </Button>
                    </Form.Item>

                    <div style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        fontSize: '14px',
                        color: '#8c8c8c'
                    }}>
                        Didn't receive OTP? <Button
                            type="link"
                            style={{ padding: '0 4px' }}
                            onClick={handleResendOtp}
                        >
                            Resend
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );

    return (
        <>
            <Drawer
                title={null}
                open={open}
                onClose={onCancel}
                footer={null}
                width={720}
                destroyOnClose={true}
                closeIcon={null}
                className="pro-drawer custom-drawer"
                styles={{
                    body: {
                        padding: 0,
                    }
                }}
            >
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative'
                }}>
                    <Button
                        type="text"
                        onClick={onCancel}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            color: '#ffffff',
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                    >
                        <FiX style={{ fontSize: '20px' }} />
                    </Button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
                        </div>
                        <div>
                            <h2 style={{
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#ffffff',
                            }}>
                                Create New Company
                            </h2>
                            <Text style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)'
                            }}>
                                Fill in the information to create company
                            </Text>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={initialValues}
                    requiredMark={false}
                    style={{
                        padding: '24px'
                    }}
                >
                    <Form.Item
                        name="username"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Username <span style={{ color: "#ff4d4f" }}>*</span>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter username' },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                                    return Promise.reject(
                                        new Error('Username must contain both uppercase or lowercase English letters')
                                    );
                                }
                                return Promise.resolve();
                            }
                        }
                        ]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter username"
                            size="large"
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Email <span style={{ color: "#ff4d4f" }}>*</span>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                        style={{ marginTop: "22px" }}
                    >
                        <Input
                            prefix={<FiMail style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter email"
                            size="large"
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Password <span style={{ color: "#ff4d4f" }}>*</span>
                            </span>
                        }
                        rules={[
                            { required: !isEditing, message: 'Please enter password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                        extra={
                            <Text type="secondary" style={{
                                fontSize: '12px',
                                marginTop: '4px',
                                display: 'block'
                            }}>
                                Password must be at least 6 characters long
                            </Text>
                        }
                        style={{ marginTop: "22px" }}
                    >
                        <Input.Password
                            prefix={<FiLock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter password"
                            size="large"
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                transition: 'all 0.3s ease',
                            }}
                        />
                    </Form.Item>

                    <Divider orientation="left" style={{ margin: '30px 0 16px 0', fontSize: '14px', fontWeight: 600, color: '#1890ff' }}>
                        Company Corporate Profile Details (Optional)
                    </Divider>

                    {/* Hidden input to default phoneCode to +91 */}
                    <Form.Item name="phoneCode" initialValue="+91" noStyle>
                        <input type="hidden" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>Authorized First Name</span>}
                            >
                                <Input
                                    prefix={<FiUser style={{ color: '#1890ff', fontSize: '15px' }} />}
                                    placeholder="Enter first name"
                                    size="large"
                                    style={{ borderRadius: '10px', height: '44px', backgroundColor: '#f8fafc', border: '1px solid #e6e8eb' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>Authorized Last Name</span>}
                            >
                                <Input
                                    prefix={<FiUser style={{ color: '#1890ff', fontSize: '15px' }} />}
                                    placeholder="Enter last name"
                                    size="large"
                                    style={{ borderRadius: '10px', height: '44px', backgroundColor: '#f8fafc', border: '1px solid #e6e8eb' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: '12px' }}>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label={
                                    <span style={{ fontSize: '13px', fontWeight: '500' }}>
                                        Phone Number <span style={{ color: "#ff4d4f" }}>*</span>
                                    </span>
                                }
                                rules={[
                                    { required: true, message: 'Please enter phone number' },
                                    { pattern: /^[0-9]+$/, message: 'Please enter a valid numeric phone number' }
                                ]}
                            >
                                <Input
                                    prefix={<FiPhone style={{ color: '#1890ff', fontSize: '15px' }} />}
                                    placeholder="Enter contact number"
                                    size="large"
                                    style={{ borderRadius: '10px', height: '44px', backgroundColor: '#f8fafc', border: '1px solid #e6e8eb' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="gstIn"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>GSTIN Number</span>}
                            >
                                <Input
                                    prefix={<FiBriefcase style={{ color: '#1890ff', fontSize: '15px' }} />}
                                    placeholder="Enter GSTIN (e.g. 24ABCDE1234F1Z5)"
                                    size="large"
                                    style={{ borderRadius: '10px', height: '44px', backgroundColor: '#f8fafc', border: '1px solid #e6e8eb' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: '12px' }}>
                        <Col span={12}>
                            <Form.Item
                                name="state"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>State</span>}
                            >
                                <Select
                                    showSearch
                                    placeholder="Select state"
                                    size="large"
                                    style={{
                                        borderRadius: '10px',
                                        height: '44px',
                                    }}
                                    onChange={() => {
                                        form.setFieldValue('city', undefined);
                                        form.setFieldValue('country', 'India');
                                    }}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={Object.keys(indianStatesAndCities).map(stateName => ({
                                        label: stateName,
                                        value: stateName
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="city"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>City</span>}
                            >
                                <Select
                                    showSearch
                                    placeholder="Select city"
                                    size="large"
                                    style={{
                                        borderRadius: '10px',
                                        height: '44px',
                                    }}
                                    disabled={!selectedState}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={availableCities.map(cityName => ({
                                        label: cityName,
                                        value: cityName
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: '12px' }}>
                        <Col span={12}>
                            <Form.Item
                                name="zipcode"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>Zipcode / Pincode</span>}
                            >
                                <Input
                                    placeholder="Enter zipcode"
                                    size="large"
                                    style={{ borderRadius: '10px', height: '44px', backgroundColor: '#f8fafc', border: '1px solid #e6e8eb' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="country"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>Country</span>}
                            >
                                <Input
                                    placeholder="Enter country"
                                    size="large"
                                    style={{ borderRadius: '10px', height: '44px', backgroundColor: '#f8fafc', border: '1px solid #e6e8eb' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: '12px' }}>
                        <Col span={12}>
                            <Form.Item
                                name="industry"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>Business Industry</span>}
                            >
                                <Select
                                    showSearch
                                    placeholder="Select business industry"
                                    size="large"
                                    style={{ borderRadius: '10px', height: '44px' }}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={industriesData.industries.map(industryName => ({
                                        label: industryName,
                                        value: industryName
                                    }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="website"
                                label={<span style={{ fontSize: '13px', fontWeight: '500' }}>Website / Domain</span>}
                                rules={[{ type: 'url', message: 'Please enter a valid URL (e.g. https://example.com)' }]}
                            >
                                <Input
                                    placeholder="Enter website (e.g. https://...)"
                                    size="large"
                                    style={{ borderRadius: '10px', height: '44px', backgroundColor: '#f8fafc', border: '1px solid #e6e8eb' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="address"
                        label={<span style={{ fontSize: '13px', fontWeight: '500' }}>Office Street Address</span>}
                        style={{ marginTop: "12px" }}
                    >
                        <Input.TextArea
                            placeholder="Enter street address, building, floor etc."
                            size="large"
                            rows={2}
                            style={{ borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e6e8eb', padding: '10px' }}
                        />
                    </Form.Item>

                    <Divider style={{ margin: '24px 0' }} />

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px'
                    }}>
                        <Button
                            size="large"
                            onClick={onCancel}
                            style={{
                                padding: '8px 24px',
                                height: '44px',
                                borderRadius: '10px',
                                border: '1px solid #e6e8eb',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            htmlType="submit"
                            loading={isCreating || isUpdating}
                            style={{
                                padding: '8px 32px',
                                height: '44px',
                                borderRadius: '10px',
                                fontWeight: '500',
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {isEditing ? 'Update Account' : 'Create Account'}
                        </Button>
                    </div>
                </Form>
            </Drawer>

            <OtpModal />
        </>
    );
};

export default CreateCompany;