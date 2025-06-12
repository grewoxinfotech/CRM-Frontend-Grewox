import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Button,
    Typography,
    Select,
    Divider,
    message,
    Input,
} from 'antd';
import { FiPackage, FiX, FiCalendar, FiToggleRight, FiDollarSign, FiEdit } from 'react-icons/fi';
import { useGetAllPlansQuery } from '../plans/services/planApi';
import { useUpdateAssignedPlanMutation } from './services/companyApi';
import moment from 'moment';
import { useGetAllSubscribedUsersQuery } from '../SubscribedUser/services/SubscribedUserApi';

const { Text } = Typography;
const { Option } = Select;

const customInputStyle = {
    width: '100%',
    height: '48px',
    borderRadius: '10px',
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e6e8eb',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
};

const UpdateUpgradePlan = ({ open, onCancel, planId, companyId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    // Fetch plans using RTK Query
    const { data: plansData, isLoading: plansLoading } = useGetAllPlansQuery({
        page: 1,
        limit: 100,
    });

    // Fetch all subscribed users data
    const { data: subscribedUsersData, isLoading, refetch } = useGetAllSubscribedUsersQuery();

    // Update plan mutation
    const [updateAssignedPlan] = useUpdateAssignedPlanMutation();

    // Find the selected subscription when planId changes or subscribedUsersData is loaded
    useEffect(() => {
        if (subscribedUsersData?.data && planId) {
            const subscription = subscribedUsersData.data.find(sub => sub.id === planId);
            setSelectedSubscription(subscription);
        }
    }, [subscribedUsersData, planId]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            form.resetFields();
        }
    }, [open, form]);

    // Set form values when subscription data is found
    useEffect(() => {
        if (selectedSubscription && open) {
            // Parse dates properly
            const startDate = selectedSubscription.start_date ? moment(selectedSubscription.start_date) : null;
            const endDate = selectedSubscription.end_date ? moment(selectedSubscription.end_date) : null;
            
            form.setFieldsValue({
                plan: selectedSubscription.plan_id,
                startDate: startDate,
                endDate: endDate,
                status: selectedSubscription.status,
                paymentStatus: selectedSubscription.payment_status
            });
            
            // Update the min attribute of end date input after form is set
            setTimeout(() => {
                const endDateInput = document.querySelector('input[name="endDate"]');
                if (endDateInput && startDate) {
                    endDateInput.min = startDate.add(1, 'day').format('YYYY-MM-DD');
                }
            }, 100);
        }
    }, [selectedSubscription, form, open]);

    // Handle modal close
    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    // Extract plans from the API response
    const plans = React.useMemo(() => {
        if (!plansData?.data) return [];
        return plansData.data.map(plan => ({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration: plan.duration
        }));
    }, [plansData]);

    const statusOptions = [
        { value: 'active', label: 'Active' },
        { value: 'trial', label: 'Trial' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'expired', label: 'Expired' },
    ];

    const paymentStatusOptions = [
        { value: 'paid', label: 'Paid' },
        { value: 'unpaid', label: 'Unpaid' },
        { value: 'refunded', label: 'Refunded' },
    ];

    // Handle form submission
    const handleSubmit = async (values) => {
        try {
            if (!planId) {
                message.error('Plan ID is required');
                return;
            }

            setLoading(true);

            // Ensure dates are properly formatted
            const startDate = values.startDate ? moment(values.startDate).format('YYYY-MM-DD') : null;
            const endDate = values.endDate ? moment(values.endDate).format('YYYY-MM-DD') : null;
            
            if (!startDate || !endDate) {
                message.error('Start date and end date are required');
                setLoading(false);
                return;
            }

            const formattedValues = {
                plan_id: values.plan,
                start_date: startDate,
                end_date: endDate,
                status: values.status,
                payment_status: values.paymentStatus
            };

            const response = await updateAssignedPlan({ id: planId, data: formattedValues }).unwrap();

            if (response.success) {
                message.success('Plan updated successfully');
                form.resetFields();
                handleCancel();
                refetch();
            } else {
                throw new Error(response.message || 'Failed to update plan');
            }
        } catch (error) {
            console.error('Error details:', error);
            message.error(error?.data?.message || 'Failed to update plan');
        } finally {
            setLoading(false);
        }
    };

    // Calculate end date based on plan duration and start date
    const calculateEndDate = (startDate, duration) => {
        if (!startDate || !duration) return null;
        
        // Ensure startDate is a moment object
        const momentStartDate = moment.isMoment(startDate) ? startDate : moment(startDate);
        
        if (duration.toLowerCase() === 'lifetime') {
            return momentStartDate.clone().add(100, 'years');
        }

        let endDate = momentStartDate.clone();
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

    // Handle plan selection to auto-calculate end date
    const handlePlanChange = (planId) => {
        const selectedPlan = plans.find(p => p.id === planId);
        const startDate = form.getFieldValue('startDate');

        if (selectedPlan && startDate) {
            try {
                const endDate = calculateEndDate(startDate, selectedPlan.duration);
                if (endDate && endDate.isValid()) {
                    form.setFieldValue('endDate', endDate);
                    
                    // Force update the min attribute of end date input
                    const endDateInput = document.querySelector('input[name="endDate"]');
                    if (endDateInput) {
                        endDateInput.min = moment(startDate).add(1, 'day').format('YYYY-MM-DD');
                    }
                }
            } catch (error) {
                console.error('Error calculating end date:', error);
            }
        }
    };

    // Handle start date change to auto-calculate end date
    const handleStartDateChange = (e) => {
        const date = e.target.value ? moment(e.target.value) : null;
        if (!date) return;
        
        const planId = form.getFieldValue('plan');
        const selectedPlan = plans.find(p => p.id === planId);

        // Update end date min attribute
        const endDateInput = document.querySelector('input[name="endDate"]');
        if (endDateInput) {
            endDateInput.min = moment(date).add(1, 'day').format('YYYY-MM-DD');
        }

        if (selectedPlan && date) {
            try {
                const endDate = calculateEndDate(date, selectedPlan.duration);
                if (endDate && endDate.isValid()) {
                    form.setFieldValue('endDate', endDate);
                }
            } catch (error) {
                console.error('Error calculating end date:', error);
            }
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
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
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
                        <FiEdit style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Update Subscription Plan
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            {selectedSubscription?.clientUsername ? `Client: ${selectedSubscription.clientUsername}` : 'Modify the plan information'}
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{ padding: '24px' }}
            >
                <Form.Item
                    name="plan"
                    label={
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                        }}>
                            Plan
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select a plan' }]}
                >
                    <Select
                        placeholder="Select Plan"
                        size="large"
                        loading={plansLoading || isLoading}
                        onChange={handlePlanChange}
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
                        prefix={<FiPackage style={{ color: '#1890ff', fontSize: '16px' }} />}
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
                    getValueProps={(value) => {
                        // Convert moment to YYYY-MM-DD for HTML date input
                        return {
                            value: value ? moment(value).format('YYYY-MM-DD') : ''
                        };
                    }}
                    getValueFromEvent={(e) => {
                        // Convert string date from HTML input to moment
                        return e.target.value ? moment(e.target.value) : null;
                    }}
                >
                    <Input
                        type="date"
                        style={customInputStyle}
                        onChange={handleStartDateChange}
                        min={moment().format('YYYY-MM-DD')} // Disable dates before today
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
                    rules={[
                        { required: true, message: 'Please select end date' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                const startDate = getFieldValue('startDate');
                                if (!value || !startDate || moment(value).isAfter(startDate)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('End date must be after start date'));
                            },
                        }),
                    ]}
                    style={{ marginTop: "22px" }}
                    getValueProps={(value) => {
                        // Convert moment to YYYY-MM-DD for HTML date input
                        return {
                            value: value ? moment(value).format('YYYY-MM-DD') : ''
                        };
                    }}
                    getValueFromEvent={(e) => {
                        // Convert string date from HTML input to moment
                        return e.target.value ? moment(e.target.value) : null;
                    }}
                >
                    <Input
                        type="date"
                        style={customInputStyle}
                        min={form.getFieldValue('startDate') ? 
                            moment(form.getFieldValue('startDate')).add(1, 'day').format('YYYY-MM-DD') : 
                            moment().add(1, 'day').format('YYYY-MM-DD')}
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
                        suffixIcon={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
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
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Update Plan
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default UpdateUpgradePlan; 