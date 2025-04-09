import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, DatePicker, TimePicker, Select, message, Typography, Avatar, Tooltip, Divider, Dropdown, Empty ,Checkbox, Radio, InputNumber,Col} from 'antd';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiCalendar, FiUser, FiCheck, FiX, FiPhoneCall, FiMail, FiCheckSquare, FiUsers, FiSearch, FiShield, FiBriefcase, FiMoreVertical } from 'react-icons/fi';
import { useGetFollowupsQuery, useCreateFollowupMutation, useUpdateFollowupMutation, useDeleteFollowupMutation } from '../../../lead/services/LeadApi';
import { useGetDealQuery } from '../../services/dealApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import dayjs from 'dayjs';
import './followup.scss';
import { useGetUsersQuery } from '../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../hrm/role/services/roleApi';
import { useGetFollowupTypesQuery, useGetStatusesQuery } from '../../../crmsystem/souce/services/SourceApi';
import CreateMeeting from './CreateMeeting';
import CreateTask from './CreateTask';
import CreateCall from './CreateCall';
import CreateLog from './CreateLog';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const DealFollowup = ({ deal }) => {

    const dealId = deal?.id;
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFollowup, setEditingFollowup] = useState(null);
    const [searchText, setSearchText] = useState('');
    const currentUser = useSelector(selectCurrentUser);
    const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
    const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
    const [isCallModalVisible, setIsCallModalVisible] = useState(false);
    const [isLogModalVisible, setIsLogModalVisible] = useState(false);
    const [followupData, setFollowupData] = useState([]);  // To store submitted data

    const { data: followups, isLoading } = useGetFollowupsQuery(dealId);
    const { data: dealData } = useGetDealQuery(dealId);
    const [createFollowup] = useCreateFollowupMutation();
    const [updateFollowup] = useUpdateFollowupMutation();
    const [deleteFollowup] = useDeleteFollowupMutation();
    const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
    const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
    const { data: followupTypes } = useGetFollowupTypesQuery(currentUser?.id);
    const { data: statuses } = useGetStatusesQuery(currentUser?.id);

    // Update the status options mapping
    const statusOptions = React.useMemo(() => {
        if (!statuses?.data) return [];
        return statuses.data
            .filter(item => item.lableType === 'status')
            .map(status => ({
                value: status.id,  // Use status ID as value
                label: status.name,
                color: status.color
            }));
    }, [statuses]);

    const handleMenuClick = (e) => {
        switch(e.key) {
            case 'task':
                setIsTaskModalVisible(true);
                break;
            case 'meeting':
                setIsMeetingModalVisible(true);
                break;
            case 'schedule-call':
                setIsCallModalVisible(true);
                break;
            case 'log-call':
                setIsLogModalVisible(true);
                break;
            default:
                break;
        }
    };

    const handleMeetingSubmit = (values) => {
        console.log('Meeting Data:', values);
        setFollowupData([...followupData, { ...values, type: 'meeting' }]);
        setIsMeetingModalVisible(false);
        message.success('Meeting created successfully');
    };

    const handleTaskSubmit = (values) => {
        console.log('Task Data:', values);
        setFollowupData([...followupData, { ...values, type: 'task' }]);
        setIsTaskModalVisible(false);
        message.success('Task created successfully');
    };

    const handleCallSubmit = (values) => {
        console.log('Call Data:', values);
        setFollowupData([...followupData, { ...values, type: 'call' }]);
        setIsCallModalVisible(false);
        message.success('Call scheduled successfully');
    };

    const handleLogSubmit = (values) => {
        console.log('Log Data:', values);
        setFollowupData([...followupData, { ...values, type: 'log' }]);
        setIsLogModalVisible(false);
        message.success('Call logged successfully');
    };

    const items = [
        {
            key: 'task',
            label: 'Task',
            icon: <FiCheckSquare />
        },
        {
            key: 'meeting',
            label: 'Meeting',
            icon: <FiUsers />
        },
        {
            key: 'call',
            label: 'Call',
            icon: <FiPhoneCall />,
            children: [
                {
                    key: 'schedule-call',
                    label: 'Schedule Call',
                    icon: <FiCalendar />
                },
                {
                    key: 'log-call',
                    label: 'Log Call',
                    icon: <FiClock />
                }
            ]
        }
    ];

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

    // Get deal members from dealData and ensure it's an array
    const dealMembers = React.useMemo(() => {
        try {       
            if (!dealData?.assigned_to) return [];
            
            // Parse the assigned_to JSON string
            const parsedData = JSON.parse(dealData.assigned_to);
            
            // Get the assigned_to array from the parsed data
            const assignedMembers = parsedData.assigned_to || [];

            // Map the members to the required format
            return assignedMembers.map(memberId => {
                const user = usersResponse?.data?.find(u => u.id === memberId);
                return {
                    id: memberId,
                    value: memberId,
                    label: user?.username || 'Unknown User',
                    email: user?.email,
                    avatar: user?.profilePic,
                    color: user?.color || '#1890ff'
                };
            });
        } catch (error) {
            console.error('Error parsing deal members:', error);
            return [];
        }
    }, [dealData, usersResponse]);

    // Filter members based on search
    const filteredMembers = React.useMemo(() => {
        if (!searchText) return dealMembers;
        const searchLower = searchText.toLowerCase();
        return dealMembers.filter(member =>
            member?.label?.toLowerCase().includes(searchLower) ||
            member?.email?.toLowerCase().includes(searchLower)
        );
    }, [dealMembers, searchText]);

    // Helper function to get member by value
    const getMemberByValue = (value) => {
        return dealMembers.find(m => m.value === value) || null;
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

    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title'
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status'
        },
        {
            title: 'Due Date',
            dataIndex: 'due_date',
            key: 'due_date'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button icon={<FiEdit2 />} onClick={() => handleEdit(record)} />
                    <Button icon={<FiTrash2 />} onClick={() => handleDelete(record.id)} />
                </Space>
            )
        }
    ];

    return (
        <div className="lead-followup">
            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Dropdown 
                        menu={{ items, onClick: handleMenuClick }}
                        placement="bottomRight"
                    >
                        <Button type="primary" icon={<FiPlus />}>
                            Create New
                    </Button>
                    </Dropdown>
                </div>

                {/* Display submitted data */}
                <Table
                    dataSource={followupData}
                    columns={[
                        {
                            title: 'Type',
                            dataIndex: 'type',
                            key: 'type',
                            render: (text) => text.charAt(0).toUpperCase() + text.slice(1)
                        },
                        {
                            title: 'Subject',
                            dataIndex: 'subject',
                            key: 'subject'
                        },
                        {
                            title: 'Date',
                            dataIndex: 'due_date',
                            key: 'due_date'
                        },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status'
                        },
                        {
                            title: 'Actions',
                            key: 'actions',
                            render: (_, record) => (
                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                key: 'edit',
                                                label: 'Edit',
                                                icon: <FiEdit2 />,
                                                onClick: () => handleEdit(record)
                                            },
                                            {
                                                key: 'delete',
                                                label: 'Delete',
                                                icon: <FiTrash2 />,
                                                onClick: () => handleDelete(record)
                                            }
                                        ]
                                    }}
                                    placement="bottomRight"
                                    trigger={['click']}
                                >
                                    <Button icon={<FiMoreVertical />} />
                                </Dropdown>
                            )
                        }
                    ]}
                    rowKey={(record) => record.subject + record.type}
                />
            </Card>

            {/* Task Modal */}
            <CreateTask
                open={isTaskModalVisible}
                onCancel={() => setIsTaskModalVisible(false)}
                onSubmit={handleTaskSubmit}
            />

            {/* Meeting Modal */}
            <CreateMeeting
                open={isMeetingModalVisible}
                onCancel={() => setIsMeetingModalVisible(false)}
                onSubmit={handleMeetingSubmit}
            />

            {/* Call Modal */}
            <CreateCall
                open={isCallModalVisible}
                onCancel={() => setIsCallModalVisible(false)}
                onSubmit={handleCallSubmit}
            />

            {/* Log Modal */}
            <CreateLog
                open={isLogModalVisible}
                onCancel={() => setIsLogModalVisible(false)}
                onSubmit={handleLogSubmit}
            />
        </div>
    );
};

export default DealFollowup;
