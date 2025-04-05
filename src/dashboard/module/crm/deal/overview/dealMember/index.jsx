import React, { useState, useEffect } from 'react';
import { Card, Table, Typography, Button, Space, Avatar, Tag, Tooltip, Modal, Form, Input, Select, message, Divider } from 'antd';
import { FiPlus, FiTrash2, FiMail, FiPhone, FiStar, FiX, FiUserPlus, FiShield, FiUser, FiBriefcase } from 'react-icons/fi';
import { useUpdateDealMutation, useGetDealsQuery } from '../../services/dealApi';
import { useGetUsersQuery } from "../../../../user-management/users/services/userApi";
import { useGetRolesQuery } from "../../../../hrm/role/services/roleApi";
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import './projectMember.scss';

const { Text } = Typography;
const { Option } = Select;

const DealMember = ({ deal }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [updateDeal] = useUpdateDealMutation();
    const { data: usersResponse = { data: [] } } = useGetUsersQuery();
    const { refetch } = useGetDealsQuery();
    const { data: rolesData } = useGetRolesQuery();
    const loggedInUser = useSelector(selectCurrentUser);
    
     // Get subclient role ID to filter it out
     const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

     // Filter users to get team members (excluding subclients)
     const users = usersResponse?.data?.filter(user =>
         user?.created_by === loggedInUser?.username &&
         user?.role_id !== subclientRoleId
     ) || [];

    // Parse assigned_to from deal
    const assignedMembers = deal?.assigned_to ? 
        JSON.parse(deal.assigned_to)?.assigned_to || [] 
        : [];

    // Set selected members when modal opens
    useEffect(() => {
        if (isModalVisible) {
            setSelectedMembers(assignedMembers);
            form.setFieldsValue({ members: assignedMembers });
        }
    }, [isModalVisible, assignedMembers, form]);

    const getRoleColor = (role) => {
        const roleColors = {
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591',
                icon: <FiUser style={{ fontSize: '14px' }} />
            },
            'admin': {
                color: '#096DD9',
                bg: '#E6F7FF',
                border: '#91D5FF',
                icon: <FiShield style={{ fontSize: '14px' }} />
            },
            'manager': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE',
                icon: <FiBriefcase style={{ fontSize: '14px' }} />
            },
            'default': {
                color: '#531CAD',
                bg: '#F9F0FF',
                border: '#D3ADF7',
                icon: <FiUser style={{ fontSize: '14px' }} />
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const columns = [
        {
            title: 'Profile',
            key: 'profile',
            width: 80,
            render: (_, record) => {
                const user = users.find(u => u.id === record) || {};
                return (
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#1890ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '16px',
                        fontWeight: '500'
                    }}>
                        <FiUser style={{ fontSize: '20px' }} />
                    </div>
                );
            }
        },
        {
            title: 'Username',
            key: 'username',
            render: (_, record) => {
                const user = users.find(u => u.id === record) || {};
                return (
                    <Text style={{ fontSize: '14px' }}>
                        {user.username}
                    </Text>
                );
            }
        },
        {
            title: 'Email',
            key: 'email',
            render: (_, record) => {
                const user = users.find(u => u.id === record) || {};
                return (
                    <Text style={{ fontSize: '14px', color: '#4B5563' }}>
                        {user.email}
                    </Text>
                );
            }
        },
        {
            title: 'Role',
            key: 'role',
            render: (_, record) => {
                const user = users.find(u => u.id === record) || {};
                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                const roleStyle = getRoleColor(userRole?.role_name);

                return (
                    <div className="role-wrapper">
                        <Tag style={{
                            margin: 0,
                            background: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`,
                            borderRadius: '5px',
                            padding: '4px 12px',
                            fontSize: '13px',
                            fontWeight: 500,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            height: '28px',
                            lineHeight: '16px'
                        }}>
                            {roleStyle.icon}
                            {userRole?.role_name || 'User'}
                        </Tag>
                        <span className="role-indicator" style={{
                            position: 'absolute',
                            left: '-2px',
                            transform: 'translateY(-50%)',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            background: roleStyle.color
                        }} />
                    </div>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => {
                const user = users.find(u => u.id === record) || {};
                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Tooltip title="Remove Member">
                            <Button
                                type="text"
                                icon={<FiTrash2 style={{ color: '#ff4d4f' }} />}
                                onClick={() => handleRemoveMember(record)}
                                style={{
                                    padding: '4px 8px',
                                    height: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            />
                        </Tooltip>
                    </div>
                );
            }
        }
    ];

    const handleModalSubmit = async (values) => {
        try {
            const newAssignedTo = values.members || [];
            
            await updateDeal({
                id: deal.id,
                assigned_to: {
                    assigned_to: newAssignedTo
                }
            }).unwrap();

            await refetch();
            message.success('Members updated successfully');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to update members');
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            const newAssignedTo = assignedMembers.filter(id => id !== userId);
            
            await updateDeal({
                id: deal.id,
                assigned_to: {
                    assigned_to: newAssignedTo
                }
            }).unwrap();
            
            await refetch();
            message.success('Member removed successfully');
        } catch (error) {
            message.error('Failed to remove member');
        }
    };

    return (
        <div className="deal-member">
            <Card
                className="custom-card"
                bodyStyle={{ padding: 0 }}
            >
                <div className="card-header" style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #f0f0f0',
                        display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Text strong style={{ fontSize: '16px' }}>Team Members</Text>
                    <Button
                        type="primary"
                        icon={<FiUserPlus style={{ fontSize: '16px' }} />}
                        onClick={() => {
                            setIsModalVisible(true);
                            form.setFieldsValue({ members: assignedMembers });
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '0 16px',
                            borderRadius: '8px'
                        }}
                    >
                        Update Members
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={assignedMembers}
                    rowKey={(record) => record}
                    pagination={false}
                    style={{ padding: '0 24px 24px' }}
                />
            </Card>

            <Modal
                title={null}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
                className="custom-modal"
                closeIcon={null}
                styles={{
                    body: {
                        padding: 0,
                    },
                    mask: {
                        background: 'rgba(0, 0, 0, 0.45)',
                    },
                    content: {
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
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
                        onClick={() => {
                            setIsModalVisible(false);
                            form.resetFields();
                        }}
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
                            <FiUserPlus style={{ fontSize: '24px', color: '#ffffff' }} />
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
                                Update Team Members
                            </h2>
                            <Text
                                style={{
                                    fontSize: '14px',
                                    color: 'rgba(255, 255, 255, 0.85)',
                                }}
                            >
                                Select team members for this deal
                            </Text>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleModalSubmit}
                    initialValues={{ members: assignedMembers }}
                    style={{ padding: '24px' }}
                >
                    <div className="section-title" style={{ marginBottom: '16px' }}>
                        <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Member Information</Text>
                    </div>

                    <div className="form-section" style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px'
                    }}>
                        <Form.Item
                            name="members"
                            label={<span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Select Members</span>}
                            rules={[{ required: true, message: 'Please select at least one member' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Search and select members"
                                style={{ width: '100%' }}
                                open={dropdownOpen}
                                onDropdownVisibleChange={setDropdownOpen}
                                maxTagCount={5}
                                maxTagTextLength={20}
                                maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} more`}
                                dropdownRender={(menu) => (
                                    <div>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <div style={{
                                            padding: '8px',
                                            display: 'flex',
                                            justifyContent: 'flex-end'
                                        }}>
                                            <Button
                                                type="primary"
                                                onClick={() => setDropdownOpen(false)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                    border: 'none',
                                                    height: '36px',
                                                    borderRadius: '6px',
                                                    padding: '0 16px',
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Done
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                tagRender={(props) => {
                                    const { label, value, closable, onClose } = props;
                                    const user = users.find(u => u.id === value);
                                    const userRole = rolesData?.data?.find(role => role.id === user?.role_id);
                                    const roleStyle = getRoleColor(userRole?.role_name);

                                    return (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                background: '#F0F7FF',
                                                borderRadius: '16px',
                                                padding: '3px 8px',
                                                margin: '2px',
                                                border: '1px solid #91CAFF',
                                                maxWidth: '100%',
                                                height: '28px'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: '#E6F4FF',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#1890FF',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                textTransform: 'uppercase',
                                                flexShrink: 0
                                            }}>
                                                <FiUser style={{ fontSize: '12px' }} />
                                            </div>
                                            <span style={{
                                                color: '#0958D9',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                maxWidth: '120px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {user?.username}
                                            </span>
                                            <Tag style={{
                                                margin: 0,
                                                background: roleStyle.bg,
                                                color: roleStyle.color,
                                                border: `1px solid ${roleStyle.border}`,
                                                fontSize: '11px',
                                                borderRadius: '12px',
                                                padding: '0 6px',
                                                height: '18px',
                                                lineHeight: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexShrink: 0
                                            }}>
                                                {userRole?.role_name}
                                            </Tag>
                                            {closable && (
                                                <span
                                                    style={{
                                                        cursor: 'pointer',
                                                        color: '#0958D9',
                                                        fontSize: '14px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        flexShrink: 0
                                                    }}
                                                    onClick={onClose}
                                                >
                                                    ×
                                                </span>
                                            )}
                                        </div>
                                    );
                                }}
                            >
                                {users.map(user => {
                                    const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                                    const roleStyle = getRoleColor(userRole?.role_name);

                                    return (
                                        <Option
                                    key={user.id} 
                                    value={user.id}
                                            label={user.username}
                                            username={user.username}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '8px 4px',
                                                width: '100%'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px'
                                                }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: '#E6F4FF',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#1890FF',
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        textTransform: 'uppercase',
                                                        flexShrink: 0
                                                    }}>
                                                        <FiUser style={{ fontSize: '16px' }} />
                                                    </div>
                                                    <span style={{
                                                        fontWeight: 500,
                                                        color: '#1f2937',
                                                        fontSize: '14px'
                                                    }}>
                                                        {user.username}
                                        </span>
                                    </div>
                                                <Tag style={{
                                                    margin: 0,
                                                    background: roleStyle.bg,
                                                    color: roleStyle.color,
                                                    border: `1px solid ${roleStyle.border}`,
                                                    fontSize: '12px',
                                                    borderRadius: '16px',
                                                    padding: '2px 10px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    height: '24px'
                                                }}>
                                                    {userRole?.role_name || 'User'}
                                                </Tag>
                                            </div>
                                        </Option>
                                    );
                                })}
                        </Select>
                    </Form.Item>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        padding: '0 24px 24px',
                        gap: '12px'
                    }}>
                        <Button
                            onClick={() => {
                                setIsModalVisible(false);
                                form.resetFields();
                            }}
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
                            style={{
                                padding: '8px 24px',
                                height: '44px',
                                borderRadius: '10px',
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            Update Members
                        </Button>
                    </div>
                </Form>
            </Modal>

            <style jsx global>{`
                .deal-member {
                    .custom-card {
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        border-radius: 12px;
                        border: none;
                    }

                    .ant-table {
                        background: transparent;
                    }

                    .ant-table-thead > tr > th {
                        background: transparent;
                        font-weight: 600;
                        color: #4b5563;
                        padding: 16px;
                        border-bottom: 2px solid #e5e7eb;
                    }

                    .ant-table-tbody > tr > td {
                        padding: 16px;
                        border-bottom: 1px solid #e5e7eb;
                    }

                    .ant-table-tbody > tr:hover > td {
                        background: #f8fafc;
                    }

                    .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        background-color: #ffffff !important;
                        border: 1px solid #d1d5db !important;
                        border-radius: 8px !important;
                        min-height: 42px !important;
                        padding: 4px 8px !important;
                        display: flex !important;
                        align-items: center !important;
                        flex-wrap: wrap !important;
                        gap: 4px !important;
                    }

                    .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
                        border-color: #1890ff !important;
                        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
                    }

                    .ant-select-multiple {
                        .ant-select-selection-overflow {
                            flex-wrap: wrap !important;
                            gap: 4px !important;
                            padding: 2px !important;
                        }

                        .ant-select-selection-overflow-item {
                            margin: 0 !important;
                        }

                        .ant-select-selection-placeholder {
                            padding: 0 8px !important;
                        }
                    }

                    .ant-select-dropdown {
                        padding: 8px !important;
                        border-radius: 12px !important;
                        border: 1px solid #e5e7eb !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
                        
                        .ant-select-item {
                            padding: 8px !important;
                            border-radius: 8px !important;
                            margin: 2px 0 !important;
                            
                            &-option-selected {
                                background-color: #E6F4FF !important;
                                font-weight: 500 !important;
                            }
                            
                            &-option-active {
                                background-color: #F0F7FF !important;
                            }
                            
                            &:hover {
                                background-color: #F0F7FF !important;
                            }
                        }
                    }

                    .custom-dropdown {
                        .ant-select-item-option-content {
                            white-space: normal !important;
                            word-break: break-word !important;
                        }
                    }

                    .role-wrapper {
                        position: relative;
                        padding-left: 12px;
                    }

                    .role-indicator {
                        animation: pulse 2s infinite;
                    }

                    @keyframes pulse {
                        0% {
                            transform: translateY(-50%) scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: translateY(-50%) scale(1.2);
                            opacity: 0.8;
                        }
                        100% {
                            transform: translateY(-50%) scale(1);
                            opacity: 1;
                        }
                    }
                }
            `}</style>
        </div>
    );
};

export default DealMember;
