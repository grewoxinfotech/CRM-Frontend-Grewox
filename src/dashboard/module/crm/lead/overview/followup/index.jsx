import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, TimePicker, Select, message, Typography, Avatar, Tooltip, Divider } from 'antd';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCalendar, FiUser, FiCheck, FiX, FiPhoneCall, FiMail, FiCheckSquare, FiUsers, FiSearch, FiShield, FiBriefcase } from 'react-icons/fi';
import { useGetLeadQuery, useGetFollowupsQuery, useCreateFollowupMutation, useUpdateFollowupMutation, useDeleteFollowupMutation } from '../../services/LeadApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import dayjs from 'dayjs';
import './followup.scss';
import { useGetUsersQuery } from '../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../hrm/role/services/roleApi';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const LeadFollowup = ({ leadId }) => {
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFollowup, setEditingFollowup] = useState(null);
    const [searchText, setSearchText] = useState('');
    const currentUser = useSelector(selectCurrentUser);

    const { data: followups, isLoading } = useGetFollowupsQuery(leadId);
    const { data: leadData } = useGetLeadQuery(leadId);
    const [createFollowup] = useCreateFollowupMutation();
    const [updateFollowup] = useUpdateFollowupMutation();
    const [deleteFollowup] = useDeleteFollowupMutation();
    const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
    const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

    // Get lead members from leadData and ensure it's an array
    const leadMembers = React.useMemo(() => {
        try {
            if (!leadData?.data?.lead_members) return [];
            const parsedMembers = JSON.parse(leadData.data.lead_members);
            const members = Array.isArray(parsedMembers) ? parsedMembers : parsedMembers.lead_members || [];
            return members.map(member => ({
                ...member,
                value: member.id || member.email,
                label: member.name,
                avatar: member.avatar,
                color: member.color || '#1890ff'
            }));
        } catch (error) {
            console.error('Error parsing lead members:', error);
            return [];
        }
    }, [leadData]);

    // Filter members based on search
    const filteredMembers = React.useMemo(() => {
        if (!searchText) return leadMembers;
        const searchLower = searchText.toLowerCase();
        return leadMembers.filter(member =>
            member?.label?.toLowerCase().includes(searchLower) ||
            member?.email?.toLowerCase().includes(searchLower)
        );
    }, [leadMembers, searchText]);

    // Helper function to get member by value
    const getMemberByValue = (value) => {
        return leadMembers.find(m => m.value === value) || null;
    };

    // Helper function to get member display
    const getMemberDisplay = (member) => {
        if (!member) return { name: 'Unknown', color: '#1890ff', initial: '?' };
        return {
            name: member.label || 'Unknown',
            color: member.color || '#1890ff',
            initial: member.label?.charAt(0)?.toUpperCase() || '?',
            email: member.email
        };
    };

    // Get role colors and icons
    const getRoleStyle = (roleName) => {
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
        return roleColors[roleName?.toLowerCase()] || roleColors.default;
    };

    // Get subclient role ID to filter it out
    const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

    // Filter users to get team members (excluding subclients)
    const users = usersResponse?.data?.filter(user =>
        user?.created_by === currentUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];

    const followupTypes = [
        { label: 'Call', value: 'call', icon: <FiPhoneCall className="type-icon" /> },
        { label: 'Meeting', value: 'meeting', icon: <FiUsers className="type-icon" /> },
        { label: 'Email', value: 'email', icon: <FiMail className="type-icon" /> },
        { label: 'Task', value: 'task', icon: <FiCheckSquare className="type-icon" /> }
    ];

    const getStatusColor = (status) => {
        const colors = {
            pending: '#faad14',
            completed: '#52c41a',
            cancelled: '#ff4d4f',
            in_progress: '#1890ff'
        };
        return colors[status] || '#1890ff';
    };

    const getTypeIcon = (type) => {
        const foundType = followupTypes.find(t => t.value === type);
        return foundType?.icon || <FiClock />;
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                time: values.time.format('HH:mm:ss')
            };

            if (editingFollowup) {
                await updateFollowup({ id: editingFollowup.id, ...payload }).unwrap();
                message.success('Follow-up updated successfully');
            } else {
                await createFollowup({ id: leadId, ...payload }).unwrap();
                message.success('Follow-up created successfully');
            }

            setIsModalVisible(false);
            form.resetFields();
            setEditingFollowup(null);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to save follow-up');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteFollowup(id).unwrap();
            message.success('Follow-up deleted successfully');
        } catch (error) {
            message.error(error?.data?.message || 'Failed to delete follow-up');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    <Tag className="type-tag" color="blue" icon={getTypeIcon(record.type)}>
                        {record.type.charAt(0).toUpperCase() + record.type.slice(1)}
                    </Tag>
                    <Text strong>{text}</Text>
                </Space>
            )
        },
        {
            title: 'Date & Time',
            dataIndex: 'date',
            key: 'date',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong><FiCalendar className="icon" /> {dayjs(record.date).format('MMM DD, YYYY')}</Text>
                    <Text type="secondary"><FiClock className="icon" /> {dayjs(record.time, 'HH:mm:ss').format('hh:mm A')}</Text>
                </Space>
            )
        },
        {
            title: 'Assigned To',
            dataIndex: 'followup_by',
            key: 'followup_by',
            render: (value) => {
                const member = getMemberByValue(value);
                const display = getMemberDisplay(member);
                return (
                    <Space>
                        <Avatar
                            size="small"
                            style={{
                                backgroundColor: display.color,
                                fontSize: '12px'
                            }}
                        >
                            {display.initial}
                        </Avatar>
                        <Text>{display.name}</Text>
                    </Space>
                );
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag
                    className="status-tag"
                    color={getStatusColor(status)}
                    icon={status === 'completed' ? <FiCheck /> : status === 'cancelled' ? <FiX /> : <FiClock />}
                >
                    {status?.charAt(0).toUpperCase() + status?.slice(1)}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            className="action-btn"
                            icon={<FiEdit2 />}
                            onClick={() => {
                                setEditingFollowup(record);
                                form.setFieldsValue({
                                    ...record,
                                    date: dayjs(record.date),
                                    time: dayjs(record.time, 'HH:mm:ss')
                                });
                                setIsModalVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            className="action-btn delete"
                            icon={<FiTrash2 />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div className="lead-followup">
            <Card
                title={
                    <Space>
                        <Title level={4}>Follow-ups</Title>
                        <Tag className="total-tag">{followups?.data?.length || 0} Total</Tag>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<FiPlus />}
                        className="add-btn"
                        onClick={() => {
                            setEditingFollowup(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}
                    >
                        Add Follow-up
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={followups?.data || []}
                    loading={isLoading}
                    rowKey="id"
                    className="followup-table"
                    pagination={{
                        pageSize: 10,
                        hideOnSinglePage: true,
                        position: ['bottomCenter']
                    }}
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
                width={520}
                destroyOnClose={true}
                centered
                closeIcon={null}
                className="pro-modal custom-modal"
                style={{
                    "--antd-arrow-background-color": "#ffffff",
                }}
                styles={{
                    body: {
                        padding: 0,
                        borderRadius: "8px",
                        overflow: "hidden",
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
                    }}
                >
                    <Button
                        type="text"
                        onClick={() => {
                            setIsModalVisible(false);
                            form.resetFields();
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
                            <FiClock style={{ fontSize: "24px", color: "#ffffff" }} />
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
                                {editingFollowup ? "Edit Follow-up" : "Create New Follow-up"}
                            </h2>
                            <Text
                                style={{
                                    fontSize: "14px",
                                    color: "rgba(255, 255, 255, 0.85)",
                                }}
                            >
                                {editingFollowup ? "Update follow-up information" : "Fill in the information to create follow-up"}
                            </Text>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        status: 'pending',
                        followup_by: currentUser?.id
                    }}
                    style={{
                        padding: "24px",
                    }}
                >
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <Form.Item
                            name="name"
                            label={
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                    Follow-up Name
                                </span>
                            }
                            rules={[{ required: true, message: 'Please enter follow-up name' }]}
                            style={{ flex: 1, marginBottom: 0 }}
                        >
                            <Input
                                prefix={<FiClock style={{ color: "#1890ff", fontSize: "16px" }} />}
                                placeholder="Enter follow-up name"
                                size="large"
                                style={{
                                    borderRadius: "10px",
                                    padding: "8px 16px",
                                    height: "48px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e6e8eb",
                                    transition: "all 0.3s ease",
                                }}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="type"
                        label={
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                Type
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select type' }]}
                    >
                        <Select
                            placeholder="Select type"
                            size="large"
                            style={{
                                width: "100%",
                                borderRadius: "10px",
                                height: "48px",
                            }}
                        >
                            {followupTypes.map(type => (
                                <Option key={type.value} value={type.value}>
                                    <Space>
                                        {type.icon}
                                        {type.label}
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="followup_by"
                        label={
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                Assigned To
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select assignee' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select assignee"
                            size="large"
                            loading={usersLoading || rolesLoading}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option?.label?.toLowerCase().includes(input.toLowerCase()) ||
                                option?.email?.toLowerCase().includes(input.toLowerCase())
                            }
                            notFoundContent={
                                users.length === 0 ? (
                                    <div style={{ padding: "12px", textAlign: "center" }}>
                                        <FiUsers style={{ fontSize: "24px", color: "#bfbfbf", marginBottom: "8px" }} />
                                        <div>No team members available</div>
                                    </div>
                                ) : (
                                    <div style={{ padding: "12px", textAlign: "center" }}>
                                        <FiSearch style={{ fontSize: "24px", color: "#bfbfbf", marginBottom: "8px" }} />
                                        <div>No matches found</div>
                                    </div>
                                )
                            }
                            style={{
                                width: "100%",
                                borderRadius: "10px",
                            }}
                            dropdownStyle={{
                                padding: "8px",
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                            }}
                        >
                            {users.map(user => {
                                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                                const roleStyle = getRoleStyle(userRole?.role_name);

                                return (
                                    <Option
                                        key={user.id}
                                        value={user.id}
                                        label={user.username}
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
                                                    gap: '2px'
                                                }}>
                                                    <Text strong style={{
                                                        color: '#1f2937',
                                                        fontSize: '14px'
                                                    }}>
                                                        {user.username}
                                                    </Text>
                                                    <Text type="secondary" style={{
                                                        fontSize: '12px'
                                                    }}>
                                                        {user.email}
                                                    </Text>
                                                </div>
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
                                                gap: '4px',
                                                height: '24px'
                                            }}>
                                                {roleStyle.icon}
                                                {userRole?.role_name || 'User'}
                                            </Tag>
                                        </div>
                                    </Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <Form.Item
                            name="date"
                            label={
                                <span style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FiCalendar style={{ color: "#1890ff" }} />
                                    Date
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select date' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <DatePicker
                                size="large"
                                format="YYYY-MM-DD"
                                style={{
                                    width: '100%',
                                    borderRadius: "10px",
                                    height: "48px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e6e8eb",
                                }}
                                disabledDate={(current) => {
                                    return current && current < dayjs().startOf('day');
                                }}
                                placeholder="Select date"
                                suffixIcon={null}
                                superNextIcon={null}
                                superPrevIcon={null}
                            />
                        </Form.Item>

                        <Form.Item
                            name="time"
                            label={
                                <span style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FiClock style={{ color: "#1890ff" }} />
                                    Time
                                </span>
                            }
                            rules={[{ required: true, message: 'Please select time' }]}
                            style={{ marginBottom: 0 }}
                        >
                            <TimePicker
                                size="large"
                                format="HH:mm"
                                style={{
                                    width: '100%',
                                    borderRadius: "10px",
                                    height: "48px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e6e8eb",
                                }}
                                placeholder="Select time"
                                suffixIcon={null}
                                minuteStep={15}
                                showNow={false}
                                use12Hours
                                hideDisabledOptions
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="description"
                        label={
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                Description
                            </span>
                        }
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter description"
                            style={{
                                borderRadius: "10px",
                                padding: "8px 16px",
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e6e8eb",
                                transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label={
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                Status
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select status' }]}
                    >
                        <Select
                            size="large"
                            style={{
                                width: "100%",
                                borderRadius: "10px",
                                height: "48px",
                            }}
                        >
                            <Option value="pending">
                                <Space>
                                    <FiClock className="status-icon pending" />
                                    Pending
                                </Space>
                            </Option>
                            <Option value="in_progress">
                                <Space>
                                    <FiClock className="status-icon in-progress" />
                                    In Progress
                                </Space>
                            </Option>
                            <Option value="completed">
                                <Space>
                                    <FiCheck className="status-icon completed" />
                                    Completed
                                </Space>
                            </Option>
                            <Option value="cancelled">
                                <Space>
                                    <FiX className="status-icon cancelled" />
                                    Cancelled
                                </Space>
                            </Option>
                        </Select>
                    </Form.Item>

                    <Divider style={{ margin: "24px 0" }} />

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                        }}
                    >
                        <Button
                            size="large"
                            onClick={() => {
                                setIsModalVisible(false);
                                form.resetFields();
                            }}
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
                            size="large"
                            type="primary"
                            htmlType="submit"
                            style={{
                                padding: "8px 32px",
                                height: "44px",
                                borderRadius: "10px",
                                fontWeight: "500",
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {editingFollowup ? "Update Follow-up" : "Create Follow-up"}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default LeadFollowup;
