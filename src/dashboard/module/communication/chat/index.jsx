import React, { useState, useMemo } from 'react';
import { Layout, List, Input, Button, Avatar, Badge, Typography, Divider, Tabs, Tag } from 'antd';
import {
    SendOutlined,
    SearchOutlined,
    EllipsisOutlined,
    UserOutlined,
    TeamOutlined,
    MessageOutlined,
    StarOutlined,
    SettingOutlined,
    PaperClipOutlined
} from '@ant-design/icons';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import "./chat.scss";

const { Content, Sider } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

export default function Chat() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    // Get real users data
    const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery();
    // Get roles data
    const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();

    // Create a map of role IDs to role names
    const roleMap = useMemo(() => {
        if (!rolesData?.data) return {};
        return rolesData.data.reduce((acc, role) => {
            acc[role.id] = role.role_name;
            return acc;
        }, {});
    }, [rolesData]);

    // Get current user from auth state
    const currentUser = useSelector((state) => state.auth.user);

    const handleSendMessage = () => {
        if (!messageInput.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            senderId: 'me',
            text: messageInput,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'sent'
        };

        setMessages([...messages, newMessage]);
        setMessageInput('');
    };

    const getFilteredUsers = () => {
        if (!userData?.data) return [];

        // First filter users based on creation and client_id, and exclude current user
        let filtered = userData.data.filter(user =>
            (user?.created_by === currentUser?.username ||
                user?.client_id === currentUser?.id) &&
            user.id !== currentUser?.id  // Exclude current user from the list
        );

        // Then map the filtered users
        filtered = filtered.map(user => {
            const roleName = roleMap[user.role_id] || 'Unknown Role';
            return {
                id: user.id,
                name: user.username,
                status: 'online',
                avatar: user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1890ff&color=fff`,
                lastMessage: 'Click to start chat',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unread: 0,
                isStarred: false,
                role: roleName,
                email: user.email
            };
        });

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply tab filter
        switch (activeTab) {
            case 'starred':
                filtered = filtered.filter(user => user.isStarred);
                break;
            case 'online':
                filtered = filtered.filter(user => user.status === 'online');
                break;
            default:
                break;
        }

        return filtered;
    };

    const getRoleColor = (role) => {
        const roleColors = {
            'super-admin': {
                color: '#531CAD',
                bg: '#F9F0FF',
                border: '#D3ADF7'
            },
            'client': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE'
            },
            'sub-client': {
                color: '#389E0D',
                bg: '#F6FFED',
                border: '#B7EB8F'
            },
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591'
            },
            'admin': {
                color: '#1890FF',
                bg: '#E6F7FF',
                border: '#91D5FF'
            },
            'default': {
                color: '#595959',
                bg: '#FAFAFA',
                border: '#D9D9D9'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const renderChatItem = (item) => {
        const roleStyle = getRoleColor(item.role);

        return (
            <List.Item
                onClick={() => setSelectedUser(item)}
                className={`chat-list-item ${selectedUser?.id === item.id ? 'selected' : ''}`}
            >
                <List.Item.Meta
                    avatar={
                        <Badge dot={item.status === 'online'} offset={[-2, 40]} color="#52c41a">
                            <Avatar
                                size={48}
                                src={item.avatar}
                                style={{
                                    background: '#f56a00',
                                    objectFit: 'cover'
                                }}
                            />
                        </Badge>
                    }
                    title={
                        <div className="chat-item-title">
                            <Text strong>{item.name}</Text>
                        </div>
                    }
                    description={
                        <div className="chat-item-description">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <div
                                    className="role-indicator"
                                    style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: roleStyle.color,
                                        boxShadow: `0 0 6px ${roleStyle.color}`
                                    }}
                                />
                                <Text style={{
                                    fontSize: '12px',
                                    color: roleStyle.color,
                                    textTransform: 'capitalize'
                                }}>
                                    {item.role || 'User'}
                                </Text>
                            </div>
                            <Text type="secondary" className="last-message">
                                {item.lastMessage}
                            </Text>
                        </div>
                    }
                />
                {item.unread > 0 && (
                    <Badge
                        count={item.unread}
                        style={{
                            backgroundColor: '#1890ff'
                        }}
                        className="unread-badge"
                    />
                )}
            </List.Item>
        );
    };

    return (
        <Layout className="chat-container">
            <Sider width={380} className="chat-sider">
                <div className="chat-sider-header">
                    <div className="user-profile">
                        <Badge dot offset={[-2, 40]} color="#52c41a">
                            <Avatar
                                size={48}
                                src={currentUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'User')}&background=1890ff&color=fff`}
                                style={{ objectFit: 'cover' }}
                            />
                        </Badge>
                        <div className="user-info">
                            <Text strong>Me ({currentUser?.username})</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {roleMap[currentUser?.role_id] || currentUser?.Role?.role_name || 'Online'}
                            </Text>
                        </div>
                        <Button type="text" icon={<SettingOutlined />} className="settings-button" />
                    </div>
                    <div className="search-container">
                        <div className="theme-search-wrapper">
                            <SearchOutlined className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="theme-search-input"
                            />
                            <TeamOutlined className="team-icon" />
                        </div>
                    </div>
                </div>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="chat-tabs"
                >
                    <TabPane tab="All" key="all" />
                    <TabPane tab="Online" key="online" />
                    <TabPane tab="Starred" key="starred" />
                </Tabs>
                <List
                    className="chat-list"
                    dataSource={getFilteredUsers()}
                    renderItem={renderChatItem}
                    loading={isLoadingUsers || isLoadingRoles}
                />
            </Sider>
            <Content className="chat-content">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <Avatar
                                    size={40}
                                    src={selectedUser.avatar}
                                    style={{ objectFit: 'cover' }}
                                />
                                <div>
                                    <Text strong>{selectedUser.name}</Text>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                        {selectedUser.role}
                                    </Text>
                                </div>
                            </div>
                            <Button type="text" icon={<EllipsisOutlined />} />
                        </div>
                        <div className="chat-messages">
                            {messages.map(message => (
                                <div
                                    key={message.id}
                                    className={`message ${message.type}`}
                                >
                                    <div className="message-content">
                                        <Text>{message.text}</Text>
                                        <Text type="secondary" className="message-time">
                                            {message.time}
                                        </Text>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="chat-input">
                            <div className="input-wrapper">
                                <label className="upload-button">
                                    <input
                                        type="file"
                                        onChange={(e) => {
                                            // Handle file upload here
                                            console.log(e.target.files[0]);
                                        }}
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                    />
                                    <PaperClipOutlined />
                                </label>
                                <Input.TextArea
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    placeholder="Type a message..."
                                    autoSize={{ minRows: 1, maxRows: 4 }}
                                    onPressEnter={(e) => {
                                        if (!e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    className="message-input"
                                />
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSendMessage}
                                    className="send-button"
                                />
                            </div>
                            <Text type="secondary" className="input-hint">
                                Press Enter to send, Shift + Enter for new line
                            </Text>
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="welcome-content">
                            <div className="welcome-icon">
                                <MessageOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                            </div>
                            <Typography.Title level={4} style={{ margin: '24px 0 8px', color: '#262626' }}>
                                Welcome to Messages
                            </Typography.Title>
                            <Text style={{
                                fontSize: '14px',
                                color: '#8c8c8c',
                                textAlign: 'center',
                                maxWidth: '400px',
                                marginBottom: '24px'
                            }}>
                                Connect with your team members, employees, and clients. Select a conversation from the left to start messaging.
                            </Text>
                            <div style={{
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    background: '#f5f5f5',
                                    borderRadius: '8px'
                                }}>
                                    <TeamOutlined style={{ color: '#1890ff' }} />
                                    <Text style={{ color: '#595959' }}>{getFilteredUsers().length} Contacts</Text>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    background: '#f5f5f5',
                                    borderRadius: '8px'
                                }}>
                                    <Badge dot color="#52c41a" />
                                    <Text style={{ color: '#595959' }}>Online</Text>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '24px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center'
                        }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Messages are end-to-end encrypted
                            </Text>
                        </div>
                    </div>
                )}
            </Content>
        </Layout>
    );
}
