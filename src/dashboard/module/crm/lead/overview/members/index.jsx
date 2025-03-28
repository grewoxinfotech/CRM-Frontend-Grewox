import React, { useState } from 'react';
import { Card, Table, Typography, Button, Space, Avatar, Tag, Tooltip, Modal, Form, Input, Select, message, Divider } from 'antd';
import { FiPlus, FiTrash2, FiMail, FiPhone, FiStar, FiX, FiUserPlus, FiShield, FiUser, FiBriefcase } from 'react-icons/fi';
import { useGetLeadQuery, useUpdateLeadMutation } from '../../services/LeadApi';
import { useGetUsersQuery } from '../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import CreateUser from '../../../../user-management/users/CreateUser';

const { Text } = Typography;
const { Option } = Select;

const LeadMembers = ({ leadId }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);

    const loggedInUser = useSelector(selectCurrentUser);
    const { data: leadData } = useGetLeadQuery(leadId);
    const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
    const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
    const [updateLead] = useUpdateLeadMutation();

    // Get subclient role ID to filter it out
    const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

    // Filter users to get team members (excluding subclients)
    const users = usersResponse?.data?.filter(user =>
        user?.created_by === loggedInUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];


    // Parse lead members properly
    let leadMembers = [];
    try {
        if (typeof leadData?.lead_members === 'string') {
            const parsedMembers = JSON.parse(leadData.lead_members);
            leadMembers = parsedMembers.lead_members || [];
        } else if (leadData?.lead_members?.lead_members) {
            leadMembers = leadData.lead_members.lead_members;
        }
    } catch (error) {
        console.error('Error parsing lead_members:', error);
    }

    // Set initial form values when lead data changes
    React.useEffect(() => {
        if (leadMembers.length > 0) {
            form.setFieldsValue({
                userId: leadMembers
            });
            setSelectedMembers(leadMembers);
        }
    }, [leadData, form]);

    // Filter and map users who are members
    const members = users.filter(user =>
        leadMembers.includes(user.id)
    ) || [];

    const handleAddMember = () => {
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleModalSubmit = async (values) => {
        try {
            // Format lead_members as an object with array of selected members
            const leadMembers = {
                lead_members: values.userId // Use directly selected values
            };

            // Update only the lead_members field
            const formData = {
                id: leadId,
                lead_members: leadMembers,
            };

            await updateLead({ id: leadId, data: formData });
            message.success('Members updated successfully');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to update members');
            console.error('Update members error:', error);
        }
    };

    const handleCreateUser = () => {
        setIsCreateUserVisible(true);
    };

    const handleCreateUserSuccess = (newUser) => {
        setIsCreateUserVisible(false);
        // Add the newly created user to the selected team members
        const currentMembers = form.getFieldValue('userId') || [];
        form.setFieldValue('userId', [...currentMembers, newUser.id]);
        setSelectedMembers([...currentMembers, newUser.id]);
    };

    const handleRemoveMember = async (memberId) => {
        try {
            // Format lead_members as an object with filtered array
            const updatedMembers = {
                lead_members: leadMembers.filter(id => id !== memberId)
            };

            const formData = {
                id: leadId,
                lead_members: updatedMembers,
            };

            await updateLead({ id: leadId, data: formData });
            message.success('Member removed successfully');
        } catch (error) {
            message.error('Failed to remove member');
            console.error('Remove member error:', error);
        }
    };

    // Get role name from role ID
    const getRoleName = (roleId) => {
        const role = rolesData?.data?.find(r => r.id === roleId);
        return role?.role_name || 'Member';
    };

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

    // Function to render role badge
    const RoleBadge = ({ role }) => {
        const roleStyle = getRoleColor(role);
        return (
            <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                background: roleStyle.bg,
                color: roleStyle.color,
                border: `1px solid ${roleStyle.border}`,
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '28px',
                lineHeight: '16px'
            }}>
                {roleStyle.icon}
                {role || 'Member'}
            </span>
        );
    };

    return (
        <div className="lead-members">
            <Card className="card-shadow">
                <div className="card-header" style={{
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 24px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <Text strong style={{ fontSize: '16px' }}>Team Members</Text>
                    <Button
                        type="primary"
                        icon={<FiUserPlus style={{ fontSize: '16px' }} />}
                        onClick={handleAddMember}
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
                        Add Member
                    </Button>
                </div>

                <Table
                    dataSource={members}
                    pagination={false}
                    style={{ padding: '0 24px' }}
                    columns={[
                        {
                            title: 'Member',
                            key: 'member',
                            render: (_, member) => (
                                <Space size={16}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: getRoleColor(getRoleName(member.role_id)).bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: getRoleColor(getRoleName(member.role_id)).color,
                                        fontSize: '18px',
                                        fontWeight: '500',
                                        textTransform: 'uppercase',
                                        border: `2px solid ${getRoleColor(getRoleName(member.role_id)).border}`
                                    }}>
                                        {member.profilePic ? (
                                            <img
                                                src={member.profilePic}
                                                alt={member.username}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        ) : (
                                            member.username?.charAt(0)
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <Text strong style={{ fontSize: '15px', color: '#111827' }}>
                                            {member.username}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: '13px' }}>
                                            {member.email}
                                        </Text>
                                    </div>
                                </Space>
                            ),
                        },
                        {
                            title: 'Role',
                            key: 'role',
                            width: 200,
                            render: (_, member) => (
                                <RoleBadge role={getRoleName(member.role_id)} />
                            ),
                        },
                        {
                            title: 'Contact',
                            key: 'contact',
                            width: 250,
                            render: (_, member) => (
                                <Space direction="vertical" size={4}>
                                    <Text type="secondary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <FiMail style={{ fontSize: '14px' }} />
                                        {member.email}
                                    </Text>
                                    {member.phone && (
                                        <Text type="secondary" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiPhone style={{ fontSize: '14px' }} />
                                            {member.phone}
                                        </Text>
                                    )}
                                </Space>
                            ),
                        },
                        {
                            title: 'Action',
                            key: 'action',
                            width: 100,
                            align: 'right',
                            render: (_, member) => (
                                member.id !== leadData?.created_by && (
                                    <Button
                                        type="text"
                                        icon={<FiTrash2 style={{ fontSize: '16px' }} />}
                                        onClick={() => handleRemoveMember(member.id)}
                                        style={{
                                            color: '#ef4444',
                                            height: '36px',
                                            width: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '8px'
                                        }}
                                    />
                                )
                            ),
                        },
                    ]}
                    locale={{
                        emptyText: (
                            <div style={{ padding: '24px 0', textAlign: 'center' }}>
                                <Text type="secondary">No team members added yet</Text>
                            </div>
                        )
                    }}
                />

                <Modal
                    title={null}
                    open={isModalVisible}
                    onCancel={handleModalCancel}
                    footer={null}
                    width={800}
                    destroyOnClose={true}
                    centered
                    closeIcon={null}
                    className="pro-modal custom-modal lead-form-modal"
                    style={{
                        "--antd-arrow-background-color": "#ffffff",
                    }}
                    styles={{
                        body: {
                            padding: 0,
                            borderRadius: "8px",
                            overflow: "hidden",
                        },
                        mask: {
                            backgroundColor: 'rgba(0, 0, 0, 0.45)',
                        },
                        content: {
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                        }
                    }}
                >
                    <div
                        className="modal-header"
                        style={{
                            background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                            padding: "24px",
                            color: "#ffffff",
                            position: "relative",
                        }}
                    >
                        <Button
                            type="text"
                            icon={<FiX />}
                            onClick={handleModalCancel}
                            style={{
                                color: "#ffffff",
                                position: "absolute",
                                right: "24px",
                                top: "24px",
                            }}
                        />
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                            }}
                        >
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
                                }}
                            >
                                <FiUserPlus style={{ fontSize: "24px", color: "#ffffff" }} />
                            </div>
                            <div>
                                <h2
                                    style={{
                                        margin: "0",
                                        fontSize: "24px",
                                        fontWeight: "600",
                                        color: "#ffffff",
                                    }}
                                >
                                    Add Team Member
                                </h2>
                                <Text
                                    style={{
                                        fontSize: "14px",
                                        color: "rgba(255, 255, 255, 0.85)",
                                    }}
                                >
                                    Add a new member to the lead team
                                </Text>
                            </div>
                        </div>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleModalSubmit}
                        className="lead-form custom-form"
                        style={{ padding: "24px" }}
                        requiredMark={false}
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
                                name="userId"
                                label={<span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>Select Members</span>}
                                rules={[{ required: true, message: 'Please select at least one member' }]}
                                initialValue={leadMembers}
                            >
                                <Select
                                    mode="multiple"
                                    showSearch
                                    placeholder="Search and select members"
                                    optionFilterProp="children"
                                    style={{ width: '100%' }}
                                    className="custom-select"
                                    popupClassName="custom-select-dropdown"
                                    open={dropdownOpen}
                                    onDropdownVisibleChange={setDropdownOpen}
                                    maxTagCount={5}
                                    maxTagTextLength={15}
                                    value={selectedMembers}
                                    onChange={(value) => setSelectedMembers(value)}
                                    loading={usersLoading || rolesLoading}
                                    filterOption={(input, option) => {
                                        const username = option?.username?.toLowerCase();
                                        return username?.includes(input.toLowerCase());
                                    }}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <div style={{
                                                display: 'flex',
                                                gap: '8px',
                                                padding: '0 8px',
                                                justifyContent: 'flex-end'
                                            }}>
                                                <Button
                                                    type="text"
                                                    icon={<FiUserPlus style={{ fontSize: '16px', color: '#ffffff' }} />}
                                                    onClick={handleCreateUser}
                                                    style={{
                                                        height: '36px',
                                                        padding: '8px 12px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        borderRadius: '6px'
                                                    }}
                                                >
                                                    Add New User
                                                </Button>
                                                <Button
                                                    type="text"
                                                    icon={<FiShield style={{ fontSize: '16px', color: '#1890ff' }} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDropdownOpen(false);
                                                    }}
                                                    style={{
                                                        height: '36px',
                                                        borderRadius: '6px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px',
                                                        background: '#ffffff',
                                                        border: '1px solid #1890ff',
                                                        color: '#1890ff',
                                                        fontWeight: '500'
                                                    }}
                                                >
                                                    Done
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                >
                                    {users.map(user => {
                                        const isExistingMember = leadMembers.includes(user.id);
                                        const roleName = getRoleName(user.role_id);
                                        const roleStyle = getRoleColor(roleName);

                                        return (
                                            <Option
                                                key={user.id}
                                                value={user.id}
                                                username={user.username}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '8px 4px',
                                                    opacity: isExistingMember ? 0.7 : 1
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: roleStyle.bg,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: roleStyle.color,
                                                        fontSize: '16px',
                                                        fontWeight: '500',
                                                        textTransform: 'uppercase',
                                                        border: `2px solid ${roleStyle.border}`
                                                    }}>
                                                        {user.profilePic ? (
                                                            <img
                                                                src={user.profilePic}
                                                                alt={user.username}
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    borderRadius: '50%',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        ) : (
                                                            user.username?.charAt(0)
                                                        )}
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '4px',
                                                        flex: 1
                                                    }}>
                                                        <span style={{
                                                            fontWeight: 500,
                                                            color: '#1f2937',
                                                            fontSize: '14px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            {user.username}
                                                            {isExistingMember && (
                                                                <span style={{
                                                                    fontSize: '12px',
                                                                    color: '#059669',
                                                                    background: '#d1fae5',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '12px'
                                                                }}>
                                                                    Added
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '13px',
                                                            color: '#6b7280',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <FiMail style={{ fontSize: '14px' }} />
                                                            {user.email}
                                                        </span>
                                                    </div>
                                                    <RoleBadge role={roleName} />
                                                </div>
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </div>

                        <Divider style={{ margin: "24px 0" }} />

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                                padding: "0 24px 24px"
                            }}
                        >
                            <Button
                                size="large"
                                onClick={handleModalCancel}
                                style={{
                                    padding: "8px 24px",
                                    height: "44px",
                                    borderRadius: "10px",
                                    border: "1px solid #e6e8eb",
                                    fontWeight: "500",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                size="large"
                                htmlType="submit"
                                style={{
                                    padding: "8px 24px",
                                    height: "44px",
                                    borderRadius: "10px",
                                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                    border: "none",
                                    fontWeight: "500",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                Update Members
                            </Button>
                        </div>
                    </Form>
                </Modal>

                <CreateUser
                    open={isCreateUserVisible}
                    onCancel={() => setIsCreateUserVisible(false)}
                    onSuccess={handleCreateUserSuccess}
                />

                <style jsx global>{`
                    .lead-members {
                        .card-shadow {
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

                    .lead-form-modal {
                        .ant-select:not(.ant-select-customize-input) .ant-select-selector {
                            background-color: #f8fafc !important;
                            border: 1px solid #e6e8eb !important;
                            border-radius: 10px !important;
                            min-height: 48px !important;
                            padding: 8px 12px !important;
                            display: flex !important;
                            align-items: center !important;
                        }

                        .ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector {
                            border-color: #1890ff !important;
                            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
                        }

                        .ant-select-dropdown {
                            padding: 8px !important;
                            border-radius: 10px !important;
                            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;

                            .ant-select-item {
                                padding: 8px 12px !important;
                                border-radius: 6px !important;
                                min-height: 32px !important;

                                &-option-selected {
                                    background-color: #E6F4FF !important;
                                    font-weight: 500 !important;
                                }

                                &-option-active {
                                    background-color: #F3F4F6 !important;
                                }
                            }

                            .ant-select-item-option-content {
                                white-space: normal !important;
                                word-break: break-word !important;
                            }
                        }

                        .ant-select-selection-search {
                            padding: 0 8px !important;
                            
                            input {
                                height: 32px !important;
                            }
                        }

                        .ant-select-selection-placeholder {
                            padding: 0 8px !important;
                            line-height: 32px !important;
                            color: #9CA3AF !important;
                        }

                        .ant-select-selection-item {
                            padding: 0 8px !important;
                        }

                        .ant-select-multiple {
                            .ant-select-selector {
                                min-height: 48px !important;
                                height: auto !important;
                                padding: 4px 8px !important;
                                background-color: #f8fafc !important;
                                border: 1px solid #e6e8eb !important;
                                border-radius: 10px !important;
                                display: flex !important;
                                align-items: flex-start !important;
                                flex-wrap: wrap !important;
                            }

                            .ant-select-selection-item {
                                height: 32px !important;
                                line-height: 30px !important;
                                background: #f0f7ff !important;
                                border: 1px solid #91caff !important;
                                border-radius: 6px !important;
                                color: #0958d9 !important;
                                font-size: 13px !important;
                                margin: 4px !important;
                                padding: 0 8px !important;
                                display: flex !important;
                                align-items: center !important;
                            }

                            .ant-select-selection-search {
                                margin: 4px !important;
                            }

                            .ant-select-selection-placeholder {
                                padding: 8px !important;
                            }
                        }
                    }
                `}</style>
            </Card>
        </div>
    );
};

export default LeadMembers; 