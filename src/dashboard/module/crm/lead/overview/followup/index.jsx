import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, TimePicker, Select, message, Typography, Avatar, Tooltip, Divider, Dropdown } from 'antd';
import { FiPlus, FiPhone, FiEdit2, FiTrash2, FiClock, FiCalendar, FiUser, FiCheck, FiX, FiPhoneCall, FiMail, FiCheckSquare, FiUsers, FiSearch, FiShield, FiBriefcase, FiBell, FiMapPin, FiMonitor, FiDollarSign, FiMessageSquare, FiSend, FiVideo, FiAlertCircle, FiPause, FiInfo, FiMoreVertical } from 'react-icons/fi';
import { useGetLeadQuery, useGetFollowupsQuery, useCreateFollowupMutation, useUpdateFollowupMutation, useDeleteFollowupMutation } from '../../services/LeadApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import dayjs from 'dayjs';
import './followup.scss';
import { useGetUsersQuery } from '../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../hrm/role/services/roleApi';
import { useGetStatusesQuery, useGetFollowupTypesQuery } from '../../../crmsystem/souce/services/SourceApi';

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

    const { data: statuses } = useGetStatusesQuery(currentUser?.id);
    const { data: followupTypes } = useGetFollowupTypesQuery(currentUser?.id);


    const followupTypesData = followupTypes?.data || [];

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
            name: member.username || member.name || member.label || 'Unknown',
            color: member.color || '#1890ff',
            initial: (member.username?.[0] || member.name?.[0] || member.label?.[0] || '?').toUpperCase(),
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

    // Update the users filter to exclude the current user and client
    const users = usersResponse?.data?.filter(user =>
        user?.created_by === currentUser?.username &&
        user?.role_id !== subclientRoleId &&
        user?.id !== currentUser?.id && // Exclude current user
        user?.client_id !== user?.id    // Exclude if user is their own client
    ) || [];

    // Filter status options
    const statusOptions = React.useMemo(() => {
        if (!statuses?.data) return [];
        return statuses.data
            .filter(item => item.lableType === 'status')
            .map(status => ({
                value: status.id,
                label: status.name,
                color: status.color
            }));
    }, [statuses]);



    // Filter followup type options
    const typeOptions = React.useMemo(() => {
        if (!followupTypes?.data) return [];
        return followupTypes.data
            .filter(item => item.lableType === 'followup')
            .map(type => ({
                value: type.id,
                label: type.name,
                color: type.color
            }));
    }, [followupTypes]);

    // Get status icon based on name
    const getStatusIcon = (name) => {
        const icons = {
            'Pending': <FiClock />,
            'In Progress': <FiBell />,
            'Completed': <FiCheck />,
            'Cancelled': <FiX />,
            'Review': <FiShield />,
            'On Hold': <FiPause />,
            'Delayed': <FiAlertCircle />,
            'New': <FiPlus />,
            'Approved': <FiCheck />,
            'Rejected': <FiX />
        };
        return icons[name] || <FiCheckSquare />;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#faad14',
            completed: '#52c41a',
            cancelled: '#ff4d4f',
            in_progress: '#1890ff'
        };
        return colors[status] || '#1890ff';
    };

    const getTypeTag = (type) => {
        const typeConfig = {
            call: {
                icon: <FiPhone className="type-icon" />,
                color: '#1890ff',
                background: '#e6f7ff'
            },
            meeting: {
                icon: <FiUsers className="type-icon" />,
                color: '#52c41a',
                background: '#f6ffed'
            },
            whatsapp: {
                icon: <FiMessageSquare className="type-icon" />,
                color: '#25D366',
                background: '#ebfaef'
            },
            email: {
                icon: <FiMail className="type-icon" />,
                color: '#EA4335',
                background: '#fff1f0'
            },
            telegram: {
                icon: <FiSend className="type-icon" />,
                color: '#0088cc',
                background: '#e6f7ff'
            },
            video_call: {
                icon: <FiVideo className="type-icon" />,
                color: '#7c3aed',
                background: '#f3f0ff'
            }
        };

        const config = typeConfig[type] || typeConfig.call;

        return (
            <Tag
                className="type-tag"
                style={{
                    color: config.color,
                    background: config.background
                }}
            >
                {config.icon}
                {type?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Tag>
        );
    };

    const handleSubmit = async (values) => {
        try {
            // Find the user object based on the selected username
            const selectedUser = users.find(user => user.username === values.followup_by);
            
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                time: values.time.format('HH:mm:ss'),
                // Set the user ID for database storage
                followup_by: selectedUser?.id
            };

            if (editingFollowup) {
                await updateFollowup({ id: editingFollowup.id, ...payload }).unwrap();
                message.success('Follow-up updated successfully');
            } else {
                await createFollowup({ id: leadId, ...payload }).unwrap();
                message.success('Follow-up created successfully');
            }

            setIsModalVisible(false);
            form.resetFields(['followup_by']);
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

    const handleEdit = (followup) => {
        // Find the user object based on the followup_by value
        const assignedUser = users.find(user => user.id === followup.followup_by);
        
        setEditingFollowup(followup);
        form.setFieldsValue({
            name: followup.name,
            type: followup.type,
            date: dayjs(followup.date),
            time: dayjs(followup.time, 'HH:mm:ss'),
            description: followup.description,
            status: followup.status,
            // Set the username instead of ID
            followup_by: assignedUser?.username || undefined
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingFollowup(null);
        form.setFieldsValue({ followup_by: undefined });
        form.resetFields();
    };

    useEffect(() => {
        if (isModalVisible && !editingFollowup) {
            form.setFieldsValue({ followup_by: undefined });
        }
    }, [isModalVisible, editingFollowup]);

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: (
                    <Text>
                        Edit Follow-up
                    </Text>
                ),
                onClick: () => handleEdit(record)
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: (
                    <Text style={{ color: '#ff4d4f' }}>
                        Delete Follow-up
                    </Text>
                ),
                onClick: () => handleDelete(record.id),
                danger: true
            }
        ]
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <Space>
                    {getTypeTag(record.type)}
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
                // Find the user from users array using the ID stored in followup_by
                const assignedUser = users.find(user => user.id === value);
                
                return (
                    <Space>
                        <Avatar
                            size="small"
                            style={{
                                backgroundColor: assignedUser?.color || '#1890ff',
                                fontSize: '12px'
                            }}
                        >
                            {assignedUser?.username?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Text>{assignedUser?.username || 'Unknown'}</Text>
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
            title: "Actions",
            key: "actions",
            width: 80,
            align: "center",
            render: (_, record) => (
                <div onClick={e => e.stopPropagation()}>
                    <Dropdown
                        menu={getDropdownItems(record)}
                        trigger={["click"]}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical style={{ fontSize: '16px' }} />}
                            className="action-btn"
                            onClick={e => e.stopPropagation()}
                        />
                    </Dropdown>
                </div>
            )
        },
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
                onCancel={handleCancel}
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
                        onClick={handleCancel}
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
                                height: "48px"
                            }}
                            listHeight={100}
                            dropdownStyle={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                            }}
                            popupClassName="custom-select-dropdown"
                        >
                            {typeOptions.map(type => (
                                <Option key={type.value} value={type.value}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            gap: '4px'
                                        }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: type.color
                                            }} />
                                            {type.label}
                                        </div>
                                    </div>
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
                            size="large"
                            placeholder="Select team member"
                            optionFilterProp="children"
                            style={{
                                width: "100%",
                                borderRadius: "10px",
                                height: "48px"
                            }}
                            listHeight={100}
                            dropdownStyle={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                            }}
                            filterOption={(input, option) => {
                                const username = option?.username?.toLowerCase() || '';
                                const searchTerm = input.toLowerCase();
                                return username.includes(searchTerm);
                            }}
                            defaultOpen={false}
                        >
                            {users.map((user) => {
                                const userRole = rolesData?.data?.find(role => role.id === user.role_id);
                                const roleStyle = getRoleStyle(userRole?.role_name);

                                return (
                                    <Option
                                        key={user.id}
                                        value={user.username}
                                        username={user.username}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <Avatar
                                                    size="small"
                                                    style={{
                                                        backgroundColor: user.color || '#1890ff',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {user.username?.[0]?.toUpperCase() || '?'}
                                                </Avatar>
                                                <Text strong>{user.username}</Text>
                                            </div>
                                            <Tag style={{
                                                margin: 0,
                                                background: roleStyle.bg,
                                                color: roleStyle.color,
                                                border: `1px solid ${roleStyle.border}`,
                                                fontSize: '12px',
                                                borderRadius: '16px',
                                                padding: '2px 10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                {roleStyle.icon}
                                                {userRole?.role_name || 'User'}
                                            </Tag>
                                        </div>
                                    </Option>
                                );
                            }).filter(Boolean)}
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
                                height: "48px"
                            }}
                            listHeight={100}
                            dropdownStyle={{
                                maxHeight: '120px',
                                overflowY: 'auto',
                                scrollbarWidth: 'thin',
                                scrollBehavior: 'smooth'
                            }}
                        >
                            {statusOptions.map(status => (
                                <Option key={status.value} value={status.value}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '13px',
                                            color: status.color,
                                            backgroundColor: `${status.color}15`,
                                            gap: '4px'
                                        }}>
                                            {getStatusIcon(status.label)}
                                            {status.label}
                                        </span>
                                    </div>
                                </Option>
                            ))}
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
                            onClick={handleCancel}
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
