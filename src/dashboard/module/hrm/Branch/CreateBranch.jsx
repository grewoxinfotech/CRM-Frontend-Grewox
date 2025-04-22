import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    message,
    Select,
    Space,
} from 'antd';
import { FiUser, FiFileText, FiMapPin, FiPhone, FiMail, FiX, FiPlus } from 'react-icons/fi';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useCreateBranchMutation, useUpdateBranchMutation } from './services/branchApi';
import CreateUser from '../../user-management/users/CreateUser';
import { useGetRolesQuery } from '../role/services/roleApi';

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CreateBranch = ({ open, onCancel, onSubmit, isEditing, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
    
    // API hooks
    const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery();
    const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
    const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
    const { data: rolesData} = useGetRolesQuery();

    // Add array of excluded role names
    const excludedRoleNames = ['employee', 'client', 'sub-client', 'super-admin'];

    // Modify the users memo to filter out users with excluded roles
    const filteredUsers = React.useMemo(() => {
        if (!userData?.data || !rolesData?.data) return [];
        
        const usersList = Array.isArray(userData.data) ? userData.data : [];
        const rolesList = Array.isArray(rolesData.data) ? rolesData.data : [];

        return usersList.filter(user => {
            // Find the role object for this user
            const userRole = rolesList.find(role => role.id === user.role_id);
            
            // If role not found or role_name is in excluded list, filter out this user
            if (!userRole || excludedRoleNames.includes(userRole.role_name.toLowerCase())) {
                return false;
            }
            return true;
        });
    }, [userData, rolesData]);

    // Effect to set initial values when editing
    useEffect(() => {
        if (isEditing && initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [form, isEditing, initialValues]);

    const handleSubmit = async (values) => {
        try {
            let response;
            
            if (isEditing && initialValues?.id) {
                // Update existing branch
                response = await updateBranch({
                    id: initialValues.id,
                    data: values
                }).unwrap();
                message.success('Branch updated successfully');
            } else {
                // Create new branch
                response = await createBranch(values).unwrap();
                message.success('Branch created successfully');
            }

            form.resetFields();
            onCancel(); // Close the modal
            if (onSubmit) {
                onSubmit(response);
            }
        } catch (error) {
            console.error('Failed to save branch:', error);
            message.error(error?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} branch`);
        }
    };

    const handleCreateUserSuccess = async (newUser) => {
        setIsCreateUserModalOpen(false);
        message.success('User created successfully');
        if (newUser?.id) {
            form.setFieldValue('manager', newUser.id);
        }
    };

    const handleAddNewUser = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setIsCreateUserModalOpen(true);
    };

    const dropdownRender = (menu) => (
        <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    type="primary"
                    icon={<FiPlus />}
                    onClick={handleAddNewUser}
                    style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                        fontWeight: '500',
                    }}
                >
                    Add Branch Manager
                </Button>
            </div>
        </>
    );

    return (
        <>
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
                            <FiMapPin style={{ fontSize: '24px', color: '#ffffff' }} />
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
                                {isEditing ? 'Edit Branch' : 'Create New Branch'}
                            </h2>
                            <Text
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                {isEditing
                                    ? 'Update branch information'
                                    : 'Fill in the information to create branch'}
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
                    <Form.Item
                        name="branchName"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Branch Name
                            </span>
                        }
                        
                        rules={[
                            { required: true, message: 'Please enter branch name' },
                            { max: 100, message: 'Branch name cannot exceed 100 characters' }
                        ]}
                    >
                        <Input
                            prefix={<FiMapPin style={{ color: '#1890ff', fontSize: '16px' }} />}
                            placeholder="Enter branch name"
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
                        name="branchManager"
                        label={
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                width: '100%'
                            }}>
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Branch Manager
                                </span>
                            </div>
                        }
                        rules={[{ required: true, message: 'Please select a branch manager' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select branch manager"
                            optionFilterProp="label"
                            loading={isLoadingUsers}
                            size="large"
                            listHeight={200}
                            dropdownStyle={{
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                            }}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                            }}
                            dropdownRender={dropdownRender}
                            filterOption={(input, option) => {
                                const label = option?.label?.toString() || '';
                                return label.toLowerCase().includes(input.toLowerCase());
                            }}
                            options={Array.isArray(filteredUsers) ? filteredUsers.map(user => {
                                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                                const roleStyles = {
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

                                const roleStyle = roleStyles[userRole?.role_name?.toLowerCase()] || roleStyles.default;

                                return {
                                    label: (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '4px 0'
                                        }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
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
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name || user.username}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            borderRadius: '50%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <FiUser style={{ fontSize: '20px' }} />
                                                )}
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flex: 1
                                            }}>
                                                <span style={{
                                                    fontWeight: 500,
                                                    color: 'rgba(0, 0, 0, 0.85)',
                                                    fontSize: '14px'
                                                }}>
                                                    {user.name || user.username}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
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
                                    ),
                                    value: user.id
                                };
                            }) : []}
                        />
                    </Form.Item>

                    <Form.Item
                        name="branchAddress"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Address
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter address' }]}
                    >
                        <TextArea
                            placeholder="Enter complete address"
                            rows={3}
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                                transition: 'all 0.3s ease',
                            }}
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
                            size="large"
                            type="primary"
                            htmlType="submit"
                            loading={isCreating}
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
                            {isEditing ? 'Update Branch' : 'Create Branch'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <CreateUser
                visible={isCreateUserModalOpen}
                onCancel={() => setIsCreateUserModalOpen(false)}
                onSuccess={handleCreateUserSuccess}
            />

            <style jsx global>{`
                .custom-modal {
                    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        background-color: #f8fafc !important;
                        border: 1px solid #e6e8eb !important;
                        border-radius: 10px !important;
                        min-height: 42px !important;
                        padding: 0px 16px !important;
                        display: flex !important;
                        align-items: center !important;
                    }

                    .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        border-color: #1890ff !important;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                    }

                    .ant-select-single .ant-select-selector .ant-select-selection-item,
                    .ant-select-single .ant-select-selector .ant-select-selection-placeholder {
                        display: flex !important;
                        align-items: center !important;
                    }

                    @keyframes pulse {
                        0% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.2);
                            opacity: 0.8;
                        }
                        100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }

                    .role-indicator {
                        animation: pulse 2s infinite;
                    }
                }
            `}</style>
        </>
    );
};

export default CreateBranch; 