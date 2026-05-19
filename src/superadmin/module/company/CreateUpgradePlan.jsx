import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Button,
    Typography,
    Select,
    Divider,
    message,
    DatePicker,
} from 'antd';
import { FiPackage, FiX, FiCalendar, FiToggleRight, FiDollarSign } from 'react-icons/fi';
import { useGetAllPlansQuery } from '../plans/services/planApi';
import { useAssignPlanMutation, useUpdateAssignedPlanMutation, useGetAllAssignedPlansQuery } from './services/companyApi';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../../auth/services/authSlice';

const { Text } = Typography;
const { Option } = Select;

const CreateUpgradePlan = ({ open, onCancel, companyId, preselectedPlanId = null, preselectedPlan = null, modalTitle = 'Create Upgrade Plan', buttonText = 'Create Upgrade Plan', initialStartDate = null, initialStatus = null, initialPaymentStatus = null }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const token = useSelector(selectCurrentToken);
    
    // Check if this is Buy Plan modal (all fields should be disabled)
    const isBuyPlanModal = buttonText === 'Buy This Plan';

    // Fetch plans using RTK Query
    const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery({
        page: 1,
        limit: 100,
    });

    // Mutations and queries
    const [assignUpgradePlan] = useAssignPlanMutation();
    const [updateAssignedPlan] = useUpdateAssignedPlanMutation();

    // Fetch assigned plans to see if company already has an active subscription
    const { data: assignedPlansData } = useGetAllAssignedPlansQuery(undefined, {
        skip: !open || !companyId
    });

    const activeSubscription = React.useMemo(() => {
        if (!assignedPlansData?.data || !companyId) return null;
        return assignedPlansData.data.find(
            sub => sub.client_id === companyId && sub.status !== 'cancelled'
        );
    }, [assignedPlansData, companyId]);

    const isEditing = !!activeSubscription;
    const finalModalTitle = isEditing ? 'Update Assigned Plan' : modalTitle;
    const finalButtonText = isEditing ? 'Update Plan' : buttonText;

    // Extract plans from the API response
    const plans = React.useMemo(() => {
        let list = [];
        if (plansData?.data) {
            list = plansData.data.map(plan => ({
                id: plan.id,
                name: plan.name,
                price: plan.price,
                duration: plan.duration
            }));
        }
        // Safely push preselected plan if it's not already in the list
        if (preselectedPlan && !list.some(p => p.id === preselectedPlan.id)) {
            list.push({
                id: preselectedPlan.id,
                name: preselectedPlan.name,
                price: preselectedPlan.price,
                duration: preselectedPlan.duration
            });
        }
        return list;
    }, [plansData, preselectedPlan]);

    // Calculate end date function (needed before useEffect)
    const calculateEndDate = (startDate, duration) => {
        if (!startDate || !duration) return null;

        if (duration.toLowerCase() === 'lifetime') {
            return moment(startDate).add(100, 'years');
        }

        let endDate = moment(startDate);
        const durationMatch = duration.match(/^(\d+)\s*(Month|Year)s?$/i);

        if (durationMatch) {
            const value = parseInt(durationMatch[1], 10);
            const unit = durationMatch[2].toLowerCase();

            switch (unit) {
                case 'month':
                    endDate = endDate.add(value, 'months');
                    break;
                case 'year':
                    endDate = endDate.add(value, 'years');
                    break;
                default:
                    break;
            }
        }

        return endDate;
    };

    // Reset form when modal closes - handled by destroyOnClose in Modal
    // No need for useEffect resetFields here as it causes "not connected" warnings
    
    // Set initial values when modal opens with active subscription or defaults
    useEffect(() => {
        if (open) {
            if (activeSubscription) {
                const planId = activeSubscription.plan_id;
                const startDate = activeSubscription.start_date && moment(activeSubscription.start_date).isValid()
                    ? moment(activeSubscription.start_date)
                    : moment();
                const endDate = activeSubscription.end_date && moment(activeSubscription.end_date).isValid()
                    ? moment(activeSubscription.end_date)
                    : null;
                const status = activeSubscription.status || 'active';
                const paymentStatus = activeSubscription.payment_status || 'unpaid';

                form.setFieldsValue({
                    plan: planId,
                    startDate,
                    endDate,
                    status,
                    paymentStatus
                });
            } else {
                const activePlanId = preselectedPlanId || preselectedPlan?.id;
                form.setFieldsValue({
                    plan: activePlanId,
                    startDate: initialStartDate || moment(),
                    status: initialStatus || 'active',
                    paymentStatus: initialPaymentStatus || 'unpaid'
                });
                
                // Auto-calculate end date for preselected plan
                const activePlanList = plans.length > 0 ? plans : (preselectedPlan ? [preselectedPlan] : []);
                const selectedPlan = activePlanList.find(p => p.id === activePlanId);
                if (selectedPlan) {
                    const startDate = initialStartDate || moment();
                    const endDate = calculateEndDate(startDate, selectedPlan.duration);
                    form.setFieldValue('endDate', endDate);
                }
            }
        }
    }, [open, activeSubscription, preselectedPlanId, preselectedPlan, plans, initialStartDate, initialStatus, initialPaymentStatus, form]);

    // Handle modal close
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'trial', label: 'Trial' },
    ];

    const paymentStatusOptions = [
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
    ];

    const handleSubmit = async (values) => {
        try {
            console.log('=== PAYMENT FLOW STARTED ===');
            console.log('Step 1: Form values received:', values);
            console.log('Company ID:', companyId);
            console.log('Button Text:', buttonText);
            
            if (!companyId) {
                console.error('ERROR: Company ID is missing');
                message.error('Company ID is required');
                return;
            }

            setLoading(true);

            const formattedValues = {
                client_id: companyId,
                plan_id: values.plan,
                start_date: values.startDate.format('YYYY-MM-DD'),
                end_date: values.endDate.format('YYYY-MM-DD'),
                status: values.status,
                payment_status: values.paymentStatus
            };
            
            console.log('Step 2: Formatted values for API:', formattedValues);

            // If payment is required (unpaid status), initiate Razorpay payment
            if (values.paymentStatus === 'unpaid' && buttonText === 'Buy This Plan') {
                console.log('Step 3: Payment required - initiating Razorpay flow');
                // Step 1: Create Razorpay order
                console.log('Step 4: Calling Razorpay order API');
                console.log('API URL:', `${import.meta.env.VITE_API_URL}/subscriptions/razorpay/order`);
                console.log('Request body:', formattedValues);
                
                const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/razorpay/order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formattedValues)
                });

                console.log('Step 5: Order API response status:', orderResponse.status);
                
                if (!orderResponse.ok) {
                    const errorData = await orderResponse.json();
                    console.error('Order API Error:', errorData);
                    throw new Error('Failed to create payment order');
                }

                const orderData = await orderResponse.json();
                console.log('Step 6: Order data received:', orderData);
                
                const { orderId, keyId, amount, planName } = orderData.data;
                console.log('Step 7: Extracted order details:', { orderId, keyId, amount, planName });

                // Step 2: Open Razorpay checkout
                console.log('Step 8: Creating Razorpay options');
                const options = {
                    key: keyId,
                    amount: amount,
                    currency: 'INR',
                    name: `${planName}`,
                    description: `Payment for ${planName}`,
                    order_id: orderId,
                    handler: async function (response) {
                        console.log('Step 9: Payment successful - Razorpay response:', response);
                        try {
                            console.log('Step 10: Starting payment verification');
                            // Step 3: Verify payment and create subscription
                            const verifyPayload = {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                ...formattedValues
                            };
                            console.log('Step 11: Verify API payload:', verifyPayload);
                            
                            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/razorpay/verify`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(verifyPayload)
                            });

                            console.log('Step 12: Verify API response status:', verifyResponse.status);
                            
                            if (!verifyResponse.ok) {
                                const errorData = await verifyResponse.json();
                                console.error('Verification API Error:', errorData);
                                throw new Error('Payment verification failed');
                            }

                            const verifyData = await verifyResponse.json();
                            console.log('Step 13: Verification data received:', verifyData);

                            if (verifyData.success) {
                                console.log('Step 14: Payment verified successfully!');
                                message.success('Payment successful! Subscription activated. Please login again to see updated plan.');
                                form.resetFields();
                                handleCancel();
                                console.log('Step 15: Clearing session and redirecting to login');
                                // Clear localStorage and redirect to login to get fresh user data
                                setTimeout(() => {
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }, 2000);
                            } else{
                                console.error('Step 14: Verification failed:', verifyData.message);
                                throw new Error(verifyData.message || 'Payment verification failed');
                            }
                        } catch (error) {
                            console.error('=== PAYMENT VERIFICATION ERROR ===');
                            console.error('Error details:', error);
                            message.error(error.message || 'Failed to verify payment');
                        } finally {
                            setLoading(false);
                        }
                    },
                    prefill: {
                        name: '',
                        email: '',
                        contact: ''
                    },
                    theme: {
                        color: '#1890ff'
                    },
                    modal: {
                        ondismiss: function() {
                            console.log('=== PAYMENT CANCELLED BY USER ===');
                            setLoading(false);
                            message.info('Payment cancelled');
                        }
                    }
                };

                console.log('Step 8: Opening Razorpay modal with options:', options);
                const razorpay = new window.Razorpay(options);
                razorpay.open();
                console.log('Razorpay modal opened successfully');
            } else {
                console.log('Step 3: Direct assignment/update (no payment required)');
                let response;
                if (activeSubscription) {
                    console.log('Call updateAssignedPlan mutation with ID:', activeSubscription.id);
                    response = await updateAssignedPlan({
                        id: activeSubscription.id,
                        data: formattedValues
                    }).unwrap();
                } else {
                    console.log('Call assignUpgradePlan mutation');
                    response = await assignUpgradePlan(formattedValues).unwrap();
                }
                console.log('Assignment response:', response);

                if (response.success) {
                    console.log('=== ASSIGNMENT SUCCESSFUL ===');
                    message.success(activeSubscription ? 'Assigned plan updated successfully' : 'Upgrade plan assigned successfully');
                    form.resetFields();
                    handleCancel();
                } else {
                    console.error('Assignment failed:', response.message);
                    throw new Error(response.message || 'Failed to assign upgrade plan');
                }
                setLoading(false);
            }
        } catch (error) {
            console.error('=== ERROR IN HANDLE SUBMIT ===');
            console.error('Error details:', error);
            message.error(error?.data?.message || error.message || 'Failed to assign upgrade plan');
            setLoading(false);
        }
    };

    // Validate end date should be after start date
    const validateEndDate = (_, value) => {
        const startDate = form.getFieldValue('startDate');
        if (startDate && value && value.isBefore(startDate)) {
            return Promise.reject('End date should be after start date');
        }
        return Promise.resolve();
    };

    // Handle plan selection to auto-calculate end date
    const handlePlanChange = (planId) => {
        const selectedPlan = plans.find(p => p.id === planId);
        const startDate = form.getFieldValue('startDate');

        if (selectedPlan && startDate) {
            const endDate = calculateEndDate(startDate, selectedPlan.duration);
            form.setFieldValue('endDate', endDate);
        }
    };

    // Handle start date change to auto-calculate end date
    const handleStartDateChange = (date) => {
        const planId = form.getFieldValue('plan');
        const selectedPlan = plans.find(p => p.id === planId);

        if (selectedPlan && date) {
            const endDate = calculateEndDate(date, selectedPlan.duration);
            form.setFieldValue('endDate', endDate);
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={520}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff'
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }
            }}
        >
            <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                padding: '24px',
                color: '#ffffff',
                position: 'relative'
            }}>
                <Button
                    type="text"
                    onClick={handleCancel}
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
                        <FiPackage style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            {finalModalTitle}
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Fill in the plan information
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                preserve={false}
                style={{ padding: '24px' }}
            >
                <Form.Item
                    name="plan"
                    label={
                        <span>
                            Plan
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select a plan' }]}
                >
                    <Select
                        placeholder="Select Plan"
                        size="large"
                        loading={plansLoading}
                        onChange={handlePlanChange}
                        disabled={isBuyPlanModal}
                        style={{
                            width: '100%',
                            height: '48px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        dropdownStyle={{
                            padding: '8px',
                            borderRadius: '10px',
                        }}
                        prefix={<FiPackage style={{ color: '#2563eb', fontSize: '16px' }} />}
                    >
                        {plans.map(plan => (
                            <Option key={plan.id} value={plan.id}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 500 }}>{plan.name}</span>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="startDate"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Start Date
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select start date' }]}
                    style={{ marginTop: "22px" }}
                >
                    <DatePicker
                        style={{
                            width: '100%',
                            height: '48px',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                        format="DD-MM-YYYY"
                        placeholder="dd-mm-yyyy"
                        suffixIcon={<FiCalendar style={{ color: '#2563eb', fontSize: '16px' }} />}
                        onChange={handleStartDateChange}
                        disabled={isBuyPlanModal}
                    />
                </Form.Item>

                <Form.Item
                    name="endDate"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            End Date
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select end date' }]}
                    style={{ marginTop: "22px" }}
                >
                    <DatePicker
                        style={{
                            width: '100%',
                            height: '48px',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                        format="DD-MM-YYYY"
                        placeholder="dd-mm-yyyy"
                        suffixIcon={<FiCalendar style={{ color: '#2563eb', fontSize: '16px' }} />}
                        disabled={true}
                    />
                </Form.Item>

                <Form.Item
                    name="status"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Status
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select status' }]}
                    style={{ marginTop: "22px" }}
                >
                    <Select
                        placeholder="Select Status"
                        size="large"
                        style={{
                            width: '100%',
                            height: '48px',
                        }}
                        disabled={isBuyPlanModal}
                    >
                        {statusOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="paymentStatus"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Payment Status
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select payment status' }]}
                    style={{ marginTop: "22px" }}
                >
                    <Select
                        placeholder="Select Payment Status"
                        size="large"
                        style={{
                            width: '100%',
                            height: '48px',
                        }}
                        suffixIcon={<FiDollarSign style={{ color: '#2563eb', fontSize: '16px' }} />}
                        disabled={isBuyPlanModal}
                    >
                        {paymentStatusOptions.map(option => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Divider style={{ margin: '24px 0' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '12px'
                }}>
                    <Button
                        size="large"
                        onClick={handleCancel}
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
                        loading={loading}
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {finalButtonText}
                    </Button>
                </div>

                {isBuyPlanModal && (
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e6e8eb'
                    }}>
                        <Text style={{
                            fontSize: '12px',
                            color: '#64748b',
                            lineHeight: '1.5',
                            display: 'block'
                        }}>
                            By purchasing a plan, you agree to my{' '}
                            <a href="/terms-and-conditions" target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>
                                Terms & Conditions
                            </a>,{' '}
                            <a href="/privacy-policy" target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>
                                Privacy Policy
                            </a>, and{' '}
                            <a href="/refund-policy" target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>
                                Refund Policy
                            </a>.
                        </Text>
                    </div>
                )}
            </Form>
        </Modal>
    );
};

export default CreateUpgradePlan;