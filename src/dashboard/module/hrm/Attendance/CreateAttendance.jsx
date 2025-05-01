import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Select,
    DatePicker,
    TimePicker,
    Divider,
    Space,
    message,
    Tag
} from 'antd';
import { 
    FiX, 
    FiUser, 
    FiClock, 
    FiMessageSquare, 
    FiCalendar,
    FiFileText 
} from 'react-icons/fi';
import dayjs from 'dayjs';
import './attendance.scss';
import { useCreateAttendanceMutation } from './services/attendanceApi';
import { useGetEmployeesQuery } from '../Employee/services/employeeApi';
import { useGetRolesQuery } from '../role/services/roleApi';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateAttendance = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [createAttendance, { isLoading }] = useCreateAttendanceMutation();
    
    // Fetch employees data
    const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery();
    const { data: rolesData } = useGetRolesQuery();

    // Transform employees data
    const employees = React.useMemo(() => {
        if (!employeesData) return [];
        if (Array.isArray(employeesData)) return employeesData;
        if (Array.isArray(employeesData.data)) return employeesData.data;
        return [];
    }, [employeesData]);

    // Get role colors and icons
    const getRoleColor = (role) => {
        const roleColors = {
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591'
            },
            'admin': {
                color: '#096DD9',
                bg: '#E6F7FF',
                border: '#91D5FF'
            },
            'manager': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE'
            },
            'default': {
                color: '#531CAD',
                bg: '#F9F0FF',
                border: '#D3ADF7'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const handleSubmit = async (values) => {
        try {
            const formattedValues = {
                employee: values.employee,
                date: values.date.format('YYYY-MM-DD'),
                startTime: values.startTime.format('HH:mm:ss'),
                endTime: values.endTime.format('HH:mm:ss'),
                comment: values.comment || '',
                status: 'present',
            };
            
            const response = await createAttendance(formattedValues).unwrap();
            
            message.success('Attendance created successfully');
            form.resetFields();
            onCancel();
            
            if (onSuccess) {
                onSuccess(response);
            }
        } catch (error) {
            console.error('Failed to create attendance:', error);
            message.error(error?.data?.message || 'Failed to create attendance');
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={520}
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
                        <FiClock style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            Add Attendance
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Record employee attendance details
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <Form.Item
                    name="employee"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Employee <span style={{ color: "#ff4d4f" }}>*</span></span>}
                    rules={[{ required: true, message: 'Please select an employee' }]}
                >
                    <Select
                        showSearch
                        placeholder="Select employee"
                        size="large"
                        loading={isLoadingEmployees}
                        style={{
                            width: '100%',
                            borderRadius: '10px',
                        }}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                    >
                        {employees.map(employee => {
                            const userRole = rolesData?.data?.find(role => role.id === employee.role_id);
                            const roleStyle = getRoleColor(userRole?.role_name);
                            
                            return (
                                <Option key={employee.id} value={employee.id}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '4px 0'
                                    }}>
                                        <div style={{
                                            width: '35px',
                                            height: '35px',
                                            borderRadius: '50%',
                                            background: '#e6f4ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#1890ff',
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            textTransform: 'uppercase'
                                        }}>
                                            {employee.profilePic ? (
                                                <img
                                                    src={employee.profilePic}
                                                    alt={employee.username}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                employee.username?.charAt(0) || <FiUser />
                                            )}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            gap: '4px'
                                        }}>
                                            <span style={{
                                                fontWeight: 500,
                                                color: 'rgba(0, 0, 0, 0.85)',
                                                fontSize: '14px'
                                            }}>
                                                {employee.username}
                                            </span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginLeft: 'auto'
                                        }}>
                                            <div
                                                className="role-indicator"
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: roleStyle.color,
                                                    boxShadow: `0 0 8px ${roleStyle.color}`,
                                                    animation: 'pulse 2s infinite'
                                                }}
                                            />
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                background: roleStyle.bg,
                                                color: roleStyle.color,
                                                border: `1px solid ${roleStyle.border}`,
                                                fontWeight: 500,
                                                textTransform: 'capitalize'
                                            }}>
                                                {userRole?.role_name || 'User'}
                                            </span>
                                        </div>
                                    </div>
                                </Option>
                            );
                        })}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="date"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Date <span style={{ color: "#ff4d4f" }}>*</span></span>}
                    rules={[{ required: true, message: 'Please select date' }]}
                >
                    <DatePicker
                        format="DD-MM-YYYY"
                        size="large"
                        style={{
                            width: '100%',
                            borderRadius: '10px',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                        placeholder="dd-mm-yyyy"
                        suffixIcon={<FiCalendar style={{ color: '#1890ff', fontSize: '16px' }} />}
                    />
                </Form.Item>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="startTime"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Start Time <span style={{ color: "#ff4d4f" }}>*</span></span>}
                        rules={[{ required: true, message: 'Please select start time' }]}
                    >
                        <TimePicker
                            format="HH:mm"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            placeholder="Select start time"
                            suffixIcon={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                        />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>End Time <span style={{ color: "#ff4d4f" }}>*</span></span>}
                        rules={[{ required: true, message: 'Please select end time' }]}
                    >
                        <TimePicker
                            format="HH:mm"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            placeholder="Select end time"
                            suffixIcon={<FiClock style={{ color: '#1890ff', fontSize: '16px' }} />}
                        />
                    </Form.Item>
                </div>

                <Form.Item
                    name="comment"
                    label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Comment </span>}
                >
                    <TextArea
                        placeholder="Add a comment (optional)"
                        rows={3}
                        style={{
                            borderRadius: '10px',
                            padding: '12px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                        }}
                        prefix={<FiMessageSquare style={{ color: '#1890ff', fontSize: '16px' }} />}
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
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
                        Add Attendance
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateAttendance;
