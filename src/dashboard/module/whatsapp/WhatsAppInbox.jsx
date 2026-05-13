import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Layout, List, Input, Button, Avatar, Badge, Typography, Tabs, Tag, Empty, Spin, Divider, message } from 'antd';
import { 
    SearchOutlined, 
    SendOutlined, 
    ReloadOutlined, 
    UserOutlined,
    ArrowLeftOutlined,
    MessageOutlined,
    CheckOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useGetWhatsappConversationsQuery, useGetWhatsappMessagesQuery } from '../settings/services/settingsApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { FiMoreVertical } from 'react-icons/fi';

// Directly importing Chat's SCSS to ensure 100% identical look
import "../communication/chat/chat.scss";

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const sourceColor = (s) => {
    if (s === 'ai') return 'purple';
    if (s === 'auto_template') return 'blue';
    if (s === 'customer') return 'default';
    return 'default';
};

export default function WhatsAppInbox() {
    const [q, setQ] = useState('');
    const [selected, setSelected] = useState(null);
    const [draft, setDraft] = useState('');
    const [showChatContent, setShowChatContent] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
    const messagesEndRef = useRef(null);
    const currentUser = useSelector(selectCurrentUser);

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const convArgs = useMemo(() => ({ limit: 80, q: q.trim() }), [q]);
    const { data: convData, isLoading: convLoading, isFetching: convFetching, refetch: refetchConvs } =
        useGetWhatsappConversationsQuery(convArgs);

    const conversations = convData?.data || [];

    useEffect(() => {
        if (!selected && conversations.length > 0 && !isMobileView) {
            setSelected(conversations[0].wa_from);
        }
    }, [conversations, selected, isMobileView]);

    const msgArgs = useMemo(() => {
        if (!selected) return null;
        return { wa_from: selected, page: 1, limit: 200 };
    }, [selected]);

    const {
        data: msgData,
        isLoading: msgLoading,
        isFetching: msgFetching,
        refetch: refetchMsgs,
    } = useGetWhatsappMessagesQuery(msgArgs, { skip: !msgArgs });

    const messages = msgData?.data || [];
    const canSend = Boolean(selected) && draft.trim().length > 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSelectConversation = (wa_from) => {
        setSelected(wa_from);
        if (isMobileView) {
            setShowChatContent(true);
        }
    };

    return (
        <div className="chat-container">
            <Layout className="chat-layout">
                <Sider 
                    width={380} 
                    className={`chat-sider ${isMobileView && showChatContent ? 'mobile-hidden' : ''}`}
                >
                    <div className="chat-sider-header">
                        <div className="user-profile">
                            <Badge dot offset={[-2, 32]} status="processing">
                                <Avatar 
                                    size={44} 
                                    src={currentUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'Me')}&background=00A3FF&color=fff`} 
                                />
                            </Badge>
                            <div className="user-info">
                                <div className="user-name-wrapper">
                                    <Title level={5} className="user-name">{currentUser?.username || 'Me'}</Title>
                                    <span className="me-badge">ME</span>
                                </div>
                                <Text className="user-role">Administrator</Text>
                            </div>
                        </div>

                        <div className="search-container">
                            <div className="theme-search-wrapper">
                                <SearchOutlined className="search-icon" />
                                <input 
                                    className="theme-search-input"
                                    placeholder="Search or start new chat"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                />
                                <TeamOutlined
                                    className="team-icon"
                                    title="Create New Group"
                                />
                            </div>
                        </div>

                        <Tabs
                            defaultActiveKey="all"
                            className="chat-tabs"
                        >
                            <Tabs.TabPane
                                tab={
                                    <span>
                                        <MessageOutlined />
                                        All
                                    </span>
                                }
                                key="all"
                            />
                            <Tabs.TabPane
                                tab={
                                    <span>
                                        <TeamOutlined />
                                        Groups
                                    </span>
                                }
                                key="groups"
                            />
                        </Tabs>
                    </div>

                    <div className="chat-list">
                        {convLoading ? (
                            <div className="center-spin"><Spin /></div>
                        ) : conversations.length === 0 ? (
                            <Empty description="No chats found" />
                        ) : (
                            conversations.map((item) => {
                                const active = item.wa_from === selected;
                                return (
                                    <div 
                                        key={item.wa_from}
                                        className={`chat-list-item ${active ? 'selected' : ''}`}
                                        onClick={() => handleSelectConversation(item.wa_from)}
                                    >
                                        <div className="ant-list-item-meta">
                                            <Badge dot offset={[-2, 36]} status="processing">
                                                <Avatar 
                                                    size={44} 
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.wa_from)}&background=random&color=fff`}
                                                />
                                            </Badge>
                                            <div className="chat-item-content" style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                                                <div className="chat-item-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Title level={5} style={{ margin: 0, fontSize: '14px' }}>{item.wa_from}</Title>
                                                    <Text type="secondary" style={{ fontSize: '11px' }}>
                                                        {item.lastTime ? new Date(item.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </Text>
                                                </div>
                                                <div className="chat-item-description" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                                    <Text type="secondary" ellipsis className="last-message" style={{ fontSize: '13px', maxWidth: '85%' }}>
                                                        {item.lastPreview || 'No messages yet'}
                                                    </Text>
                                                    {item.unreadCount > 0 && (
                                                        <Badge count={item.unreadCount} className="unread-badge" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Sider>

                <Content className={`chat-content ${isMobileView && !showChatContent ? 'mobile-hidden' : ''}`}>
                    {!selected ? (
                        <div className="no-chat-selected">
                            <div className="welcome-content">
                                <div className="welcome-image">
                                    <MessageOutlined style={{ fontSize: '80px', color: '#00A3FF', marginBottom: '20px' }} />
                                </div>
                                <Title level={2}>Grewox WhatsApp Chat</Title>
                                <p>Send and receive WhatsApp messages directly from CRM.<br />Use Grewox WhatsApp Chat to stay connected with your leads and customers.</p>
                                <div className="encryption-notice" style={{ marginTop: '40px', color: '#8c8c8c', fontSize: '12px' }}>
                                    <CheckOutlined /> End-to-end encrypted
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="chat-header">
                                <div className="chat-user-info">
                                    {isMobileView && (
                                        <Button 
                                            type="text" 
                                            icon={<ArrowLeftOutlined />} 
                                            onClick={() => setShowChatContent(false)}
                                        />
                                    )}
                                    <Badge dot offset={[-2, 32]} status="processing">
                                        <Avatar size={40} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selected)}&background=random&color=fff`} />
                                    </Badge>
                                    <div className="user-details">
                                        <Title level={5} style={{ margin: 0 }}>{selected}</Title>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Online</Text>
                                    </div>
                                </div>
                                <div className="chat-header-actions">
                                    <Button type="text" icon={<ReloadOutlined />} onClick={() => refetchMsgs()} loading={msgFetching} />
                                    <Button type="text" icon={<FiMoreVertical />} />
                                </div>
                            </div>

                            <div className="chat-messages">
                                {msgLoading ? (
                                    <div className="center-spin"><Spin /></div>
                                ) : (
                                    messages.map((m) => (
                                        <div key={m.id} className={`message ${m.direction === 'outbound' ? 'sent' : 'received'}`}>
                                            <div className="message-content">
                                                {m.direction === 'received' && <div className="message-sender">{selected}</div>}
                                                <Text>{m.body || '—'}</Text>
                                                <div className="message-footer">
                                                    <span className="message-time">
                                                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </span>
                                                    {m.direction === 'outbound' && (
                                                        <span className="message-status">
                                                            <CheckOutlined style={{ fontSize: '10px' }} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-footer">
                                <div className="chat-input-wrapper">
                                    <div className="input-actions">
                                        <Button type="text" icon={<MessageOutlined />} className="action-icon" />
                                        <Button type="text" icon={<ReloadOutlined />} className="action-icon" />
                                    </div>
                                    <Input.TextArea
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                        placeholder="Type a message"
                                        className="message-input"
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onPressEnter={(e) => {
                                            if (!e.shiftKey) {
                                                e.preventDefault();
                                            }
                                        }}
                                    />
                                    <Button 
                                        type="primary" 
                                        shape="circle" 
                                        icon={<SendOutlined />} 
                                        disabled={!canSend}
                                        className="send-button"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </Content>
            </Layout>
        </div>
    );
}
