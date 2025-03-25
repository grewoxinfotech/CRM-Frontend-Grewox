import React from 'react';
import { Modal, Form, Input, Button, Typography, Select, InputNumber, Row, Col, Divider, Switch } from 'antd';
import { FiPackage, FiX, FiDollarSign, FiUsers, FiCalendar, FiList, FiClock, FiHardDrive } from 'react-icons/fi';
import { useUpdatePlanMutation } from './services/planApi';
import { useGetAllCurrenciesQuery } from '../settings/services/settingsApi';
import { message } from 'antd';

const { Text } = Typography;
const { Option } = Select;

const EditPlan = ({ open, onCancel, initialValues, idd }) => {
    const [form] = Form.useForm();
    const [updatePlan, { isLoading }] = useUpdatePlanMutation();
    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    React.useEffect(() => {
        if (initialValues) {
            form.setFieldsValue({
                name: initialValues.name,
                price: initialValues.price?.toString(),
                currency: initialValues.currency || 'INR',
                duration: initialValues.duration?.toString(),
                trial_period: initialValues.trial_period?.toString(),
                storage_limit: initialValues.storage_limit?.toString(),
                max_users: initialValues.max_users?.toString(),
                max_clients: initialValues.max_clients?.toString(),
                max_vendors: initialValues.max_vendors?.toString(),
                max_customers: initialValues.max_customers?.toString(),
                status: initialValues.status === 'active'
            });
        }
    }, [initialValues, form]);

    const handleSubmit = async (values) => {
        try {
            const updateData = {
                name: values.name,
                price: values.price_group?.toString(),
                currency: values.currency,
                duration: values.duration?.toString(),
                trial_period: values.trial_period?.toString(),
                storage_limit: values.storage_limit?.toString(),
                max_users: values.max_users?.toString(),
                max_clients: values.max_clients?.toString(),
                max_vendors: values.max_vendors?.toString(),
                max_customers: values.max_customers?.toString(),
                status: values.status ? 'active' : 'inactive'
            };

            await updatePlan({ idd, updateData }).unwrap();
            message.success('Plan updated successfully');
            onCancel();
        } catch (error) {
            console.error('Update error:', error);
            message.error('Failed to update plan: ' + (error.message || 'Unknown error'));
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                }
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative',
                }}
            >
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
                        transition: 'all 0.3s ease',
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FiPackage style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#ffffff',
                            }}
                        >
                            Edit Plan
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Update subscription plan details
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
                    padding: '24px',
                }}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="name"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Plan Name</span>}
                            rules={[{ required: true, message: 'Please enter plan name' }]}
                        >
                            <Input
                                prefix={<FiPackage style={{ color: '#1890ff' }} />}
                                placeholder="Enter plan name"
                                size="large"
                                style={{
                                    borderRadius: '10px',
                                    height: '48px',
                                }}
                            />
                        </Form.Item>
                    </Col>
                                
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="price_group"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Price</span>}
                            style={{ marginBottom: 0 }}
                        >
                            <Input.Group compact className="price-input-group" style={{
                                display: 'flex',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '10px',
                                border: '1px solid #e6e8eb',
                                overflow: 'hidden'
                            }}>
                                <Form.Item
                                    name="currency"
                                    noStyle
                                    rules={[{ required: true }]}
                                >
                                    <Select
                                        size="large"
                                        style={{
                                            width: '100px',
                                            height: '48px'
                                        }}
                                        loading={currenciesLoading}
                                        className="currency-select"
                                        defaultValue="INR"
                                        dropdownStyle={{
                                            padding: '8px',
                                            borderRadius: '10px',
                                        }}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {currencies?.data?.map(currency => (
                                            <Option key={currency.code} value={currency.code}>
                                                {currency.code}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <InputNumber
                                    name='price'
                                    className="price-input"
                                    placeholder="Enter price"
                                    min={0}
                                    style={{ flex: 1, border: 'none', borderRadius: 0 ,padding: '0 16px'}}
                                    onChange={(value) => form.setFieldsValue({ price_group: value?.toString() })}
                                />
                            </Input.Group>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="duration"
                            label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Duration (months)</span>}
                            rules={[{ required: true, message: 'Please enter duration' }]}
                        >
                            <InputNumber
                                prefix={<FiCalendar style={{ color: '#1890ff' }} />}
                                placeholder="Enter duration"
                                size="large"
                                style={{ width: '100%', borderRadius: '10px', height: '48px' }}
                                min={1}
                                onChange={(value) => form.setFieldsValue({ duration: value?.toString() })}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="trial_period"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Trial Period (Days)
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={0}
                            onChange={(value) => form.setFieldsValue({ trial_period: value?.toString() })}
                        />
                    </Form.Item>

                    <Form.Item
                        name="storage_limit"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Storage Limit (GB)
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiHardDrive style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                            onChange={(value) => form.setFieldsValue({ storage_limit: value?.toString() })}
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="max_users"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Max Users
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                            onChange={(value) => form.setFieldsValue({ max_users: value?.toString() })}
                        />
                    </Form.Item>

                    <Form.Item
                        name="max_clients"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Max Clients
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                            onChange={(value) => form.setFieldsValue({ max_clients: value?.toString() })}
                        />
                    </Form.Item>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <Form.Item
                        name="max_vendors"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Max Vendors
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                            onChange={(value) => form.setFieldsValue({ max_vendors: value?.toString() })}
                        />
                    </Form.Item>

                    <Form.Item
                        name="max_customers"
                        label={
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                            }}>
                                Max Customers
                            </span>
                        }
                        rules={[{ required: true }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            min={1}
                            onChange={(value) => form.setFieldsValue({ max_customers: value?.toString() })}
                        />
                    </Form.Item>
                </div>

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
                    valuePropName="checked"
                >
                    <Switch
                        checkedChildren="Active"
                        unCheckedChildren="Inactive"
                        style={{
                            minWidth: '80px'
                        }}
                        onChange={(value) => form.setFieldsValue({ status: value })}
                    />
                </Form.Item>

              

                <Divider style={{ margin: '24px 0' }} />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
                    <Button
                        size="large"
                        onClick={onCancel}
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            fontWeight: '500',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                        }}
                    >
                        Update Plan
                    </Button>
                </div>
            </Form>

            <style jsx>{`
                .currency-select .ant-select-selector {
                    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
                    border: none !important;
                    color: white !important;
                    height: 48px !important;
                    line-height: 46px !important;
                    padding: 0 12px !important;
                    display: flex;
                    align-items: center;
                    box-shadow: none !important;
                }

                .currency-select .ant-select-selection-item {
                    color: white !important;
                    font-weight: 500 !important;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    height: 46px !important;
                    line-height: 46px !important;
                    font-size: 14px;
                }

                .currency-select .ant-select-arrow {
                    color: white !important;
                }

                .price-input-group {
                    margin-bottom: 0 !important;
                    display: flex !important;
                    width: 100% !important;

                    .ant-select-selector,
                    .ant-input-number {
                        height: 46px !important;
                        line-height: 46px !important;
                    }

                    .ant-select-selector {
                        border: none !important;
                        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%) !important;
                        color: white !important;
                        padding: 0 16px !important;
                        display: flex;
                        align-items: center;
                        box-shadow: none !important;
                        height: 46px !important;
                    }

                    .ant-select-selection-item {
                        color: white !important;
                        font-weight: 500 !important;
                        display: flex;
                        align-items: center;
                        height: 46px !important;
                        line-height: 46px !important;
                    }

                    .price-input {
                        flex: 1 !important;
                        width: calc(100% - 100px) !important;
                    }

                    .ant-input-number {
                        background-color: transparent;
                        height: 46px !important;
                        
                        &:hover, &:focus {
                            border-color: transparent !important;
                            box-shadow: none !important;
                        }

                        .ant-input-number-input-wrap {
                            height: 46px !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            
                            input {
                                height: 46px !important;
                                font-size: 14px;
                                padding: 0 16px;
                                line-height: 46px !important;
                            }
                        }

                        .ant-input-number-handler-wrap {
                            display: none;
                        }
                    }

                    &:hover {
                        border-color: #1890ff;
                        
                        .ant-select-selector {
                            background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%) !important;
                        }
                    }

                    &:focus-within {
                        border-color: #1890ff;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
                    }
                }
            `}</style>
        </Modal>
    );
};

export default EditPlan;