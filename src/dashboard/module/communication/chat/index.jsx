import React, { useState } from 'react';
import { Layout, List, Input, Button, Avatar, Badge, Typography, Divider, Tabs, Tag } from 'antd';
import {
    SendOutlined,
    SearchOutlined,
    EllipsisOutlined,
    UserOutlined,
    TeamOutlined,
    MessageOutlined,
    StarOutlined,
    SettingOutlined
} from '@ant-design/icons';
import "./chat.scss";

const { Content, Sider } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

// Enhanced dummy data
const dummyUsers = [
    { 
        id: 1, 
        name: 'John Doe', 
        status: 'online', 
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg', 
        lastMessage: 'Hey, how are you?', 
        time: '12:30 PM',
        unread: 2,
        isStarred: true,
        role: 'Product Manager'
    },
    { 
        id: 2, 
        name: 'Jane Smith', 
        status: 'offline', 
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg', 
        lastMessage: 'The meeting is scheduled for tomorrow', 
        time: '11:45 AM',
        unread: 0,
        isStarred: true,
        role: 'Developer'
    },
    { 
        id: 3, 
        name: 'Mike Johnson', 
        status: 'online', 
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg', 
        lastMessage: 'Please check the latest updates', 
        time: '10:15 AM',
        unread: 1,
        isStarred: false,
        role: 'Designer'
    },
    { 
        id: 4, 
        name: 'Sarah Wilson', 
        status: 'online', 
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg', 
        lastMessage: 'Thanks for your help!', 
        time: '9:20 AM',
        unread: 0,
        isStarred: false,
        role: 'Team Lead'
    },
    { 
        id: 5, 
        name: 'David Brown', 
        status: 'offline', 
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg', 
        lastMessage: "I'll send the documents soon", 
        time: 'Yesterday',
        unread: 0,
        isStarred: false,
        role: 'Developer'
    }
];

// Group chats with images
const dummyGroups = [
    {
        id: 'g1',
        name: 'Project Alpha Team',
        avatar: 'https://ui-avatars.com/api/?name=Project+Alpha&background=1890ff&color=fff',
        lastMessage: 'Meeting at 3 PM today',
        time: '11:00 AM',
        members: 8,
        unread: 5,
        memberAvatars: [
            'https://randomuser.me/api/portraits/men/1.jpg',
            'https://randomuser.me/api/portraits/women/2.jpg',
            'https://randomuser.me/api/portraits/men/3.jpg'
        ]
    },
    {
        id: 'g2',
        name: 'Design Team',
        avatar: 'https://ui-avatars.com/api/?name=Design+Team&background=1890ff&color=fff',
        lastMessage: 'New design system updates',
        time: '9:45 AM',
        members: 6,
        unread: 0,
        memberAvatars: [
            'https://randomuser.me/api/portraits/women/4.jpg',
            'https://randomuser.me/api/portraits/men/5.jpg'
        ]
    }
];

const dummyMessages = [
    { id: 1, senderId: 1, text: 'Hey, how are you?', time: '12:30 PM', type: 'received' },
    { id: 2, senderId: 'me', text: "I'm good, thanks! How about you?", time: '12:31 PM', type: 'sent' },
    { id: 3, senderId: 1, text: 'Doing great! Just wanted to check about the project status.', time: '12:32 PM', type: 'received' },
    { id: 4, senderId: 'me', text: "Sure! I've completed most of the tasks. Will share the update by EOD.", time: '12:33 PM', type: 'sent' },
    { id: 5, senderId: 1, text: 'Perfect! Looking forward to it.', time: '12:34 PM', type: 'received' }
];

export default function Chat() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState(dummyMessages);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');

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
        let filtered = [...dummyUsers];
        
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.role.toLowerCase().includes(searchQuery.toLowerCase())
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
            case 'groups':
                return dummyGroups;
            default:
                break;
        }

        return filtered;
    };

    const renderChatItem = (item) => {
        const isGroup = 'members' in item;
        
        return (
            <List.Item
                onClick={() => setSelectedUser(item)}
                className={`chat-list-item ${selectedUser?.id === item.id ? 'selected' : ''}`}
            >
                <List.Item.Meta
                    avatar={
                        <Badge dot={!isGroup && item.status === 'online'} offset={[-2, 40]} color="#52c41a">
                            <Avatar 
                                size={48}
                                src={item.avatar}
                                style={{ 
                                    background: isGroup ? '#1890ff' : '#f56a00',
                                    objectFit: 'cover'
                                }}
                            />
                        </Badge>
                    }
                    title={
                        <div className="chat-item-title">
                            <Text strong>{item.name}</Text>
                            {item.unread > 0 && (
                                <Badge 
                                    count={item.unread} 
                                    style={{ 
                                        backgroundColor: '#1890ff',
                                        marginLeft: 'auto'
                                    }}
                                    className="unread-badge"
                                />
                            )}
                        </div>
                    }
                    description={
                        <div className="chat-item-description">
                            <Text type="secondary" className="last-message">
                                {isGroup ? `${item.members} members` : item.role}
                            </Text>
                            <Text type="secondary" className="last-message">
                                {item.lastMessage}
                            </Text>
                        </div>
                    }
                />
            </List.Item>
        );
    };

    return (
        <Layout className="chat-container">
            <Sider width={380} className="chat-sider">
                <div className="chat-sider-header">
                    <div className="user-profile">
                        <Avatar 
                            size={48} 
                            src="https://randomuser.me/api/portraits/men/85.jpg"
                            style={{ objectFit: 'cover' }}
                        />
                        <div className="user-info">
                            <Text strong>Alex Johnson</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Online</Text>
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
                    <TabPane 
                        tab={<span><MessageOutlined />All</span>} 
                        key="all" 
                    />
                    <TabPane 
                        tab={<span><StarOutlined />Starred</span>} 
                        key="starred" 
                    />
                    <TabPane 
                        tab={<span><TeamOutlined />Groups</span>} 
                        key="groups" 
                    />
                    <TabPane 
                        tab={<Badge dot><span>Online</span></Badge>} 
                        key="online" 
                    />
                </Tabs>
                <div className="chat-list">
                    <List
                        dataSource={getFilteredUsers()}
                        renderItem={renderChatItem}
                    />
                </div>
            </Sider>
            <Content className="chat-content">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <Badge dot={selectedUser.status === 'online'} offset={[-2, 40]} color="#52c41a">
                                    <Avatar 
                                        size={45} 
                                        src={selectedUser.avatar}
                                    />
                                </Badge>
                                <div className="user-details">
                                    <Text strong>{selectedUser.name}</Text>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {selectedUser.status === 'online' ? 'Online' : 'Offline'}
                                    </Text>
                                </div>
                            </div>
                            <div className="chat-header-actions">
                                {selectedUser.memberAvatars && (
                                    <Avatar.Group 
                                        maxCount={3} 
                                        size="small"
                                        style={{ marginRight: '16px' }}
                                    >
                                        {selectedUser.memberAvatars.map((avatar, index) => (
                                            <Avatar key={index} src={avatar} />
                                        ))}
                                    </Avatar.Group>
                                )}
                                <Button type="text" icon={<EllipsisOutlined />} />
                            </div>
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
                            <Input
                                placeholder="Type a message..."
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onPressEnter={handleSendMessage}
                                suffix={
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={handleSendMessage}
                                    />
                                }
                            />
                        </div>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="welcome-message">
                            <Avatar 
                                size={64} 
                                src="https://randomuser.me/api/portraits/men/85.jpg"
                                style={{ marginBottom: '16px' }}
                            />
                            <Text strong style={{ fontSize: '20px', marginBottom: '8px' }}>
                                Welcome, Alex Johnson
                            </Text>
                            <Text type="secondary">
                                Select a conversation to start chatting
                            </Text>
                        </div>
                    </div>
                )}
            </Content>
        </Layout>
    );
}
