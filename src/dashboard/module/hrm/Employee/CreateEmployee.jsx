import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Select, Divider, Upload } from 'antd';
import { 
    FiUser, FiX, FiMail, FiPhone, FiBriefcase, 
    FiMapPin, FiUpload, FiGrid, FiAward, FiDollarSign 
} from 'react-icons/fi';

const { Text } = Typography;
const { Option } = Select;

const CreateEmployee = ({ open, onCancel, onSubmit, isEditing, initialValues }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    const handleSubmit = async (values) => {
        try {
            await onSubmit(values);
            form.resetFields();
        } catch (error) {
            console.error('Submit Error:', error);
        }
    };

    const uploadButton = (
        <div style={{ 
            width: '100%',
            height: '100px',
            border: '1px dashed #d9d9d9',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            cursor: 'pointer'
        }}>
            <FiUpload style={{ fontSize: '24px', color: '#8c8c8c', marginBottom: '8px' }} />
            <div style={{ color: '#8c8c8c' }}>Upload Profile Picture</div>
        </div>
    );

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff',
            }}
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
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative',
                }}
            >
                <Button
                    type="text"
                    icon={<FiX />}
                    onClick={onCancel}
                    style={{
                        color: '#ffffff',
                        position: 'absolute',
                        right: '24px',
                        top: '24px',
                    }}
                />
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
                        <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            {isEditing ? 'Edit Employee' : 'Create New Employee'}
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            {isEditing
                                ? 'Update employee information'
                                : 'Fill in the information to create employee'}
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
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '16px',
                    marginBottom: '24px'
                }}>
                    <Form.Item
                        name="firstName"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>First Name</span>}
                        rules={[{ required: true, message: 'Please enter first name' }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter first name"
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
                        name="lastName"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Last Name</span>}
                        rules={[{ required: true, message: 'Please enter last name' }]}
                    >
                        <Input
                            prefix={<FiUser style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter last name"
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
                        name="username"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Username</span>}
                        rules={[{ required: true, message: 'Please enter username' }]}
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
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Email</span>}
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
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
                        name="phone"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Phone</span>}
                        rules={[{ required: true, message: 'Please enter phone number' }]}
                    >
                        <Input
                            prefix={<FiPhone style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter phone number"
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
                        name="gender"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Gender</span>}
                        rules={[{ required: true, message: 'Please select gender' }]}
                    >
                        <Select
                            placeholder="Select gender"
                            size="large"
                            style={{ width: '100%' }}
                            dropdownStyle={{ borderRadius: '10px' }}
                        >
                            <Option value="male">Male</Option>
                            <Option value="female">Female</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="joiningDate"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Joining Date</span>}
                        rules={[{ required: true, message: 'Please select joining date' }]}
                    >
                        <Input
                            type="date"
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
                        name="department"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Department</span>}
                        rules={[{ required: true, message: 'Please select department' }]}
                    >
                        <Select
                            placeholder="Select department"
                            size="large"
                            style={{ width: '100%' }}
                            dropdownStyle={{ borderRadius: '10px' }}
                        >
                            <Option value="it">IT</Option>
                            <Option value="hr">HR</Option>
                            <Option value="finance">Finance</Option>
                            <Option value="marketing">Marketing</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="designation"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Designation</span>}
                        rules={[{ required: true, message: 'Please select designation' }]}
                    >
                        <Select
                            placeholder="Select designation"
                            size="large"
                            style={{ width: '100%' }}
                            dropdownStyle={{ borderRadius: '10px' }}
                        >
                            <Option value="manager">Manager</Option>
                            <Option value="developer">Developer</Option>
                            <Option value="designer">Designer</Option>
                            <Option value="analyst">Analyst</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="salary"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Salary</span>}
                        rules={[{ required: true, message: 'Please enter salary' }]}
                    >
                        <Input
                            prefix={<FiDollarSign style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter salary"
                            type="number"
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
                        name="branch"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Branch</span>}
                        rules={[{ required: true, message: 'Please select branch' }]}
                    >
                        <Select
                            placeholder="Select branch"
                            size="large"
                            style={{ width: '100%' }}
                            dropdownStyle={{ borderRadius: '10px' }}
                        >
                            <Option value="main">Main Branch</Option>
                            <Option value="north">North Branch</Option>
                            <Option value="south">South Branch</Option>
                        </Select>
                    </Form.Item>
                </div>

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
                        {isEditing ? 'Update Employee' : 'Create Employee'}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateEmployee; 