import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Layout, List, Input, Button, Avatar, Badge, Typography, Tabs } from 'antd';
import {
    SendOutlined,
    SearchOutlined,
    EllipsisOutlined,
    TeamOutlined,
    MessageOutlined,
    SettingOutlined,
    PaperClipOutlined
} from '@ant-design/icons';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
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
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [conversations, setConversations] = useState({});
    const socketRef = useRef(null);

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


    // Initialize socket connection
    useEffect(() => {
        if (!currentUser?.id) return;

        // Extract base URL from API URL
        const baseUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.split('/api/')[0]
            : 'http://localhost:5000';

        socketRef.current = io(baseUrl, {
            withCredentials: true,
            path: '/socket.io'
        });

        // Connect and send user ID
        socketRef.current.emit('user_connected', currentUser.id);

        // Listen for online users updates
        socketRef.current.on('users_status', ({ activeUsers, userStatus }) => {
            setOnlineUsers(new Set(activeUsers));
        });

        // Get existing conversations
        socketRef.current.emit('get_conversations', { userId: currentUser.id });

        // Listen for conversations
        socketRef.current.on('conversations_received', (conversationsData) => {
            setConversations(conversationsData || {});
        });

        // Listen for new messages
        socketRef.current.on('receive_message', ({ user_id, message }) => {
            setConversations(prev => {
                const newConversations = { ...prev };
                if (!newConversations[user_id]) {
                    newConversations[user_id] = [];
                }
                newConversations[user_id].push(message);
                return newConversations;
            });

            // If message is from selected user, mark as read
            if (selectedUser?.id === user_id) {
                socketRef.current.emit('mark_messages_read', {
                    sender_id: user_id,
                    receiver_id: currentUser.id
                });
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [currentUser?.id]);

    // Mark messages as read when selecting a user
    useEffect(() => {
        if (selectedUser?.id && socketRef.current) {
            socketRef.current.emit('mark_messages_read', {
                sender_id: selectedUser.id,
                receiver_id: currentUser?.id
            });
        }
    }, [selectedUser?.id, currentUser?.id]);

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedUser || !socketRef.current) return;

        const messageData = {
            sender_id: currentUser?.id,
            receiver_id: selectedUser.id,
            message: messageInput.trim()
        };

        socketRef.current.emit('send_message', messageData);
        setMessageInput('');
    };

    const getFilteredUsers = () => {
        if (!userData?.data) return [];

        const filteredUsers1 = userData?.data.filter(user => {
            if (user?.client_id === currentUser?.id) {
                return true;
            }
            return false;
        });

        const filteredUsers2 = userData?.data.filter(user => {
            if (user?.client_id === currentUser?.client_id || user?.id == currentUser?.client_id) {
                return true;
            }
            return false;
        });

        // Check if either array is empty before merging
        let filtered;
        if (filteredUsers1.length === 0 || filteredUsers2.length === 0) {
            // If either is empty, use the non-empty array
            filtered = filteredUsers1.length > 0 ? filteredUsers1 : filteredUsers2;
        } else {
            // If both have data, only use filteredUsers1 
            filtered = filteredUsers1;
        }

        // Remove current user from filtered list
        filtered = filtered.filter(user => user.id !== currentUser?.id);

        filtered = filtered.map(user => {
            const roleName = roleMap[user.role_id] || 'Company';
            const userConversation = conversations[user.id] || [];
            const lastMessage = userConversation[userConversation.length - 1];

            return {
                id: user.id,
                name: user.username,
                status: onlineUsers.has(user.id.toString()) ? 'online' : 'offline',
                avatar: user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1890ff&color=fff`,
                lastMessage: lastMessage ? lastMessage.message : 'Click to start chat',
                time: lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unread: userConversation.filter(msg => msg.sender_id === user.id && msg.status !== 'read').length,
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

        // Sort company users to the top
        return filtered.sort((a, b) => {
            // First sort by company (companies first)
            if (a.role?.toLowerCase() === 'company' && b.role?.toLowerCase() !== 'company') return -1;
            if (a.role?.toLowerCase() !== 'company' && b.role?.toLowerCase() === 'company') return 1;

            // Then sort by online status
            if (a.status === 'online' && b.status !== 'online') return -1;
            if (a.status !== 'online' && b.status === 'online') return 1;

            // Then sort by unread messages
            if (a.unread > b.unread) return -1;
            if (a.unread < b.unread) return 1;

            // Finally sort by name
            return a.name.localeCompare(b.name);
        });
    };

    const getRoleColor = (role) => {
        const roleColors = {
            'company': {
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
            'default': {
                color: '#595959',
                bg: '#FAFAFA',
                border: '#D9D9D9'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const getAvatarContent = (item) => {
        const isCompany = item.role?.toLowerCase() === 'company';
        const isSubClient = item.role?.toLowerCase() === 'sub-client';
        const isEmployee = item.role?.toLowerCase() === 'employee';

        if (isCompany) {
            return (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                </svg>
            );
        } else if (isSubClient) {
            return (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
            );
        } else if (isEmployee) {
            return (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            );
        }

        return item.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarStyle = (item) => {
        const isCompany = item.role?.toLowerCase() === 'company';
        const isSubClient = item.role?.toLowerCase() === 'sub-client';
        const isEmployee = item.role?.toLowerCase() === 'employee';

        const baseStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '600',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        };

        if (isCompany) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.2)',
            };
        } else if (isSubClient) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #059669, #047857)',
                boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.2)',
            };
        } else if (isEmployee) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.2)',
            };
        }

        // For other roles, use modern gradients
        const colors = [
            'linear-gradient(135deg, #f43f5e, #be123c)', // Rose
            'linear-gradient(135deg, #f97316, #c2410c)', // Orange
            'linear-gradient(135deg, #06b6d4, #0e7490)', // Cyan
            'linear-gradient(135deg, #ec4899, #be185d)', // Pink
            'linear-gradient(135deg, #8b5cf6, #6d28d9)', // Purple
            'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
        ];

        const colorIndex = item.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

        return {
            ...baseStyle,
            background: colors[colorIndex],
            boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.2)',
        };
    };

    const renderAvatar = (item) => {
        if (item.avatar && !item.avatar.includes('ui-avatars.com')) {
            // Real profile picture exists
            return (
                <Avatar
                    size={48}
                    src={item.avatar}
                    style={{
                        objectFit: 'cover'
                    }}
                />
            );
        }

        // No profile picture, show custom avatar
        return (
            <Avatar
                size={48}
                style={getAvatarStyle(item)}
            >
                {getAvatarContent(item)}
            </Avatar>
        );
    };

    const renderChatItem = (item) => {
        const roleStyle = getRoleColor(item.role);

        return (
            <List.Item
                onClick={() => setSelectedUser(item)}
                className={`chat-list-item ${selectedUser?.id === item.id ? 'selected' : ''}`}
                data-role={item.role?.toLowerCase()}
            >
                <List.Item.Meta
                    avatar={
                        <Badge dot={item.status === 'online'} offset={[-2, 40]} color="#52c41a">
                            <div className={`custom-avatar ${item.role?.toLowerCase()}`}>
                                {renderAvatar(item)}
                            </div>
                        </Badge>
                    }
                    title={
                        <div className="chat-item-title">
                            <Text strong>{item.name}</Text>
                            {item.role?.toLowerCase() === 'company' && (
                                <span className="verified-badge" />
                            )}
                            <span className="role-badge" data-role={item.role?.toLowerCase() || 'default'}>
                                {item.role}
                            </span>
                        </div>
                    }
                    description={
                        <div className="chat-item-description">
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
                        <Avatar src={currentUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'User')}&background=1890ff&color=fff`} size={40}>
                            {!currentUser?.profilePic && currentUser?.username?.charAt(0)}
                        </Avatar>
                        <div className="user-info">
                            <div className="user-name-wrapper">
                                <Typography.Text className="user-name">{currentUser?.username}</Typography.Text>
                                <span className="me-badge">Me</span>
                            </div>
                            <Typography.Text type="secondary" className="user-role">
                                {roleMap[currentUser?.role_id] || currentUser?.Role?.role_name || 'Online'}
                            </Typography.Text>
                        </div>
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
                            {selectedUser && conversations[selectedUser.id]?.map((message, index) => (
                                <div
                                    key={`${message.timestamp}-${index}`}
                                    className={`message ${message.sender_id === currentUser?.id ? 'sent' : 'received'}`}
                                >
                                    <div className="message-content">
                                        <Text>{message.message}</Text>
                                        <Text type="secondary" className="message-time">
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {message.status === 'read' && message.sender_id === currentUser?.id && (
                                                <span className="message-status">✓✓</span>
                                            )}
                                            {message.status === 'delivered' && message.sender_id === currentUser?.id && (
                                                <span className="message-status">✓</span>
                                            )}
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
