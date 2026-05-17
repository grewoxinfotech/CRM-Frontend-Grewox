import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Layout, List, Input, Button, Avatar, Badge, Typography, Tabs, Tag, Empty, Spin, Divider, message, Tooltip, Modal, Form, Select } from 'antd';
import { Space } from 'antd';
const AntInput = Input; // Alias for consistency with other parts of the code
import {
    SearchOutlined,
    SendOutlined,
    ReloadOutlined,
    UserOutlined,
    ArrowLeftOutlined,
    MessageOutlined,
    CheckOutlined,
    TeamOutlined,
    PlusOutlined,
    FileTextOutlined,
    PaperClipOutlined,
    RocketOutlined
} from '@ant-design/icons';
import {
    useGetWhatsappConversationsQuery,
    useGetWhatsappMessagesQuery,
    useSendWhatsAppMessageMutation,
    useGetWhatsappTemplatesQuery
} from '../settings/services/settingsApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectCurrentToken } from '../../../auth/services/authSlice';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { FiMoreVertical } from 'react-icons/fi';

import { io } from 'socket.io-client';
import { BASE_URL } from '../../../config/config';
import "./whatsapp-inbox.scss";

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
    const [typingStatus, setTypingStatus] = useState({}); // { phoneNumber: boolean }
    const [showChatContent, setShowChatContent] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
    const messagesEndRef = useRef(null);
    const currentUser = useSelector(selectCurrentUser);
    const socketRef = useRef(null);

    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !currentUser || currentUser.roleName === 'super-admin' || currentUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === currentUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);
    const hasPermission = React.useCallback((action) => {
        if (!currentUser) return false;
        if (currentUser.roleName === 'super-admin' || currentUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const perms = userPermissions['dashboards-communication'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [currentUser, userPermissions]);

    const formatRelativeTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            const yesterday = new Date();
            yesterday.setDate(now.getDate() - 1);
            if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return date.toLocaleDateString([], { weekday: 'short' });
            } else {
                return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
            }
        }
    };

    useEffect(() => {
        const handleResize = () => setIsMobileView(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        // Handle deep linking via phone query param
        const params = new URLSearchParams(window.location.search);
        const phoneParam = params.get('phone');

        if (phoneParam) {
            setSelected(phoneParam);
            if (window.innerWidth <= 768) {
                setShowChatContent(true);
            }
        }

        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const convArgs = useMemo(() => ({ limit: 80, q: q.trim() }), [q]);
    const { data: convData, isLoading: convLoading, isFetching: convFetching, refetch: refetchConvs } =
        useGetWhatsappConversationsQuery(convArgs);

    const conversations = convData?.data || [];

    // Memoize the display list to avoid flickering during renders
    const displayConvs = useMemo(() => {
        let list = [...conversations];
        if (selected && !list.find(c => c.wa_from === selected)) {
            list.unshift({
                wa_from: selected,
                lastPreview: 'New chat',
                unreadCount: 0,
                isNew: true
            });
        }
        return list;
    }, [conversations, selected]);

    // Auto-select first chat only if NO deep link and NOT mobile
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const phoneParam = params.get('phone');

        if (!phoneParam && !selected && conversations.length > 0 && !isMobileView) {
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

    const [sendMessage, { isLoading: isSending }] = useSendWhatsAppMessageMutation();

    // Refetch conversations when messages are loaded to clear the unread badge
    useEffect(() => {
        if (!msgLoading && msgData) {
            refetchConvs();
        }
    }, [msgData, msgLoading, refetchConvs]);

    // Force real-time updates via direct socket listener
    useEffect(() => {
        if (!currentUser?.id) return;
        const baseUrl = BASE_URL.replace(/\/?api\/v1\/?$/, '');

        const socket = io(baseUrl, {
            withCredentials: true,
            path: '/socket.io',
            reconnection: true,
            transports: ['polling', 'websocket'] // Try polling first if websocket fails
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('user_connected', currentUser.id);
        });

        socket.on('connect_error', (err) => {
            // Error handled silently
        });

        socket.on('whatsapp_inbox_update', (payload) => {
            if (payload.isTyping !== undefined) {
                setTypingStatus(prev => ({
                    ...prev,
                    [payload.phone]: payload.isTyping
                }));
            }

            // Verify if the update is relevant to the selected chat or just the sidebar
            refetchConvs();
            refetchMsgs();
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [currentUser?.id, refetchConvs, refetchMsgs]);

    const token = useSelector(selectCurrentToken);
    const messages = msgData?.data || [];
    const canSend = Boolean(selected) && draft.trim().length > 0 && !isSending;

    const handleMediaUpload = async (file) => {
        if (!selected) return;

        // Meta/WhatsApp limits
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isDoc = !isImage && !isVideo;

        if (isImage && file.size > 5 * 1024 * 1024) {
            return message.error('Image size must be less than 5MB');
        }
        if (isVideo && file.size > 16 * 1024 * 1024) {
            return message.error('Video size must be less than 16MB');
        }
        if (isDoc && file.size > 25 * 1024 * 1024) {
            return message.error('Document size must be less than 25MB');
        }
        
        const hide = message.loading('Uploading media...', 0);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('to', selected);
            formData.append('mediaType', file.type.startsWith('image/') ? 'image' :
                file.type.startsWith('video/') ? 'video' : 'document');

            const res = await fetch(`${BASE_URL}/whatsapp/send-media`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                message.success('Media sent successfully');
                refetchMsgs();
            } else {
                message.error(data.message || 'Failed to send media');
            }
        } catch (err) {
            console.error('Media upload error:', err);
            message.error('Error uploading media');
        } finally {
            hide();
        }
    };

    const handleSendMessage = async () => {
        if (!canSend) return;
        try {
            await sendMessage({
                phoneNumber: selected,
                message: draft.trim()
            }).unwrap();
            setDraft('');
            message.success('Message sent');
            refetchMsgs();
            refetchConvs();
        } catch (err) {
            console.error('Failed to send message:', err);
            message.error(err?.data?.message || 'Failed to send message');
        }
    };

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

    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    const [newChatForm] = Form.useForm();

    const handleNewChat = (values) => {
        const phone = values.phone.replace(/\D/g, '');
        if (phone) {
            setSelected(phone);
            setIsNewChatModalOpen(false);
            newChatForm.resetFields();
            if (isMobileView) {
                setShowChatContent(true);
            }
        }
    };

    const { data: templates = [] } = useGetWhatsappTemplatesQuery();
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [templateForm] = Form.useForm();

    const handleSendTemplate = async (values) => {
        if (!selectedTemplate) return;

        const components = [];

        // Handle Body Variables
        const bodyVars = [];
        Object.keys(values).forEach(key => {
            if (key.startsWith('var_body_')) {
                bodyVars.push({ type: 'text', text: values[key] });
            }
        });
        if (bodyVars.length > 0) {
            components.push({ type: 'body', parameters: bodyVars });
        }

        // Handle Button Variables (Meta expects one component per button that has variables)
        const buttonComponents = selectedTemplate?.components?.find(c => c.type === 'BUTTONS');
        if (buttonComponents) {
            buttonComponents.buttons.forEach((btn, index) => {
                if (btn.type === 'URL' && btn.url.includes('{{1}}')) {
                    const btnVarValue = values[`var_btn_${index}`];
                    if (btnVarValue) {
                        components.push({
                            type: 'button',
                            sub_type: 'url',
                            index: index,
                            parameters: [{ type: 'text', text: btnVarValue }]
                        });
                    }
                }
            });
        }

        try {
            await sendMessage({
                phoneNumber: selected,
                templateName: selectedTemplate.name,
                languageCode: selectedTemplate.language || 'en',
                isTemplate: true,
                components: components
            }).unwrap();

            setIsTemplateModalOpen(false);
            templateForm.resetFields();
            setSelectedTemplate(null);
            message.success('Message sent successfully');
            setDraft('');
            refetchMsgs();
            refetchConvs();
        } catch (err) {
            console.error('Failed to send template:', err);
            message.error(err?.data?.message || 'Failed to send template');
        }
    };

    // Extract variables count from template body and buttons
    const getTemplateVariables = (template) => {
        const bodyComponent = template?.components?.find(c => c.type === 'BODY');
        const bodyMatches = bodyComponent?.text?.match(/\{\{\d+\}\}/g);
        const bodyVars = bodyMatches ? bodyMatches.map(m => ({ num: m.replace(/[\{\}]/g, ''), type: 'body' })) : [];

        const buttonComponent = template?.components?.find(c => c.type === 'BUTTONS');
        const btnVars = [];
        if (buttonComponent) {
            buttonComponent.buttons.forEach((btn, idx) => {
                if (btn.type === 'URL' && btn.url.includes('{{1}}')) {
                    btnVars.push({ num: 1, type: 'button', index: idx, label: btn.text });
                }
            });
        }

        return { bodyVars, btnVars };
    };

    // Live preview logic
    const formValues = Form.useWatch([], templateForm);
    const renderPreviewText = () => {
        const bodyText = selectedTemplate?.components?.find(c => c.type === 'BODY')?.text || '';
        if (!formValues) return bodyText;

        let preview = bodyText;
        Object.keys(formValues).forEach(key => {
            if (key.startsWith('var_body_')) {
                const varNum = key.replace('var_body_', '');
                const value = formValues[key] || `{{${varNum}}}`;
                preview = preview.replace(`{{${varNum}}}`, value);
            }
        });
        return preview;
    };

    const renderMessageBody = (m) => {
        // Handle Media first
        if (m.media_url && (m.wa_message_type === 'image' || m.type === 'image')) {
            return (
                <div className="media-message">
                    <img
                        src={m.media_url}
                        alt="Media"
                        style={{ 
                            maxWidth: '400px', 
                            maxHeight: '300px', 
                            borderRadius: '8px', 
                            cursor: 'pointer', 
                            display: 'block',
                            objectFit: 'cover'
                        }} 
                        onClick={() => window.open(m.media_url, '_blank')}
                    />
                    {m.body && m.body !== 'Attachment received' && !m.body.startsWith('📎 Shared') && (
                        <div style={{ marginTop: '8px' }}>{m.body}</div>
                    )}
                </div>
            );
        }

        if (m.media_url && (m.wa_message_type === 'video' || m.type === 'video')) {
            return (
                <div className="media-message">
                    <video
                        src={m.media_url}
                        controls
                        style={{ 
                            maxWidth: '400px', 
                            maxHeight: '300px', 
                            borderRadius: '8px', 
                            display: 'block' 
                        }} 
                    />
                    {m.body && m.body !== 'Attachment received' && !m.body.startsWith('📎 Shared') && (
                        <div style={{ marginTop: '8px' }}>{m.body}</div>
                    )}
                </div>
            );
        }

        if (m.media_url && (m.wa_message_type === 'document' || m.type === 'document')) {
            return (
                <div 
                    className="media-message document-message" 
                    onClick={() => window.open(m.media_url, '_blank')} 
                    style={{ 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        background: m.direction === 'outbound' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)', 
                        padding: '12px', 
                        borderRadius: '12px',
                        border: '1px solid rgba(0,0,0,0.05)',
                        minWidth: '220px',
                        maxWidth: '300px'
                    }}
                >
                    <div style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: '10px', 
                        background: '#fff', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <FileTextOutlined style={{ fontSize: '22px', color: '#1890ff' }} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <Text strong style={{ 
                            display: 'block', 
                            whiteSpace: 'nowrap', 
                            textOverflow: 'ellipsis', 
                            overflow: 'hidden',
                            fontSize: '13.5px',
                            color: m.direction === 'outbound' ? '#fff' : 'inherit'
                        }}>
                            {(() => {
                                if (m.body && !m.body.startsWith('📎 Shared')) return m.body;
                                if (m.media_url) {
                                    try {
                                        const urlParts = m.media_url.split('/');
                                        const fileName = urlParts[urlParts.length - 1].split('?')[0];
                                        return fileName || 'Document Attachment';
                                    } catch (e) {
                                        return 'Document Attachment';
                                    }
                                }
                                return 'Document Attachment';
                            })()}
                        </Text>
                        <Text style={{ 
                            fontSize: '11px', 
                            opacity: 0.8,
                            color: m.direction === 'outbound' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.45)'
                        }}>
                            Click to download/view
                        </Text>
                    </div>
                </div>
            );
        }

        if (m.wa_message_type === 'template' || m.body?.startsWith('[Template: ')) {
            const templateName = m.body.replace('[Template: ', '').replace(']', '');
            const template = templates.find(t => t.name === templateName);
            if (template) {
                return template.components?.find(c => c.type === 'BODY')?.text || m.body;
            }
        }
        return m.body;
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
                                {hasPermission('create') && (
                                    <PlusOutlined
                                        className="plus-icon"
                                        title="Start New Chat"
                                        style={{ cursor: 'pointer', marginLeft: '10px', color: '#1890ff', fontSize: '18px' }}
                                        onClick={() => setIsNewChatModalOpen(true)}
                                    />
                                )}
                                <TeamOutlined
                                    className="team-icon"
                                    title="Create New Group"
                                    style={{ marginLeft: '10px' }}
                                />
                            </div>
                        </div>

                        <Tabs
                            defaultActiveKey="all"
                            className="chat-tabs"
                            tabBarExtraContent={
                                <Space style={{ paddingRight: '12px' }}>
                                    <Button 
                                        size="small"
                                        icon={<RocketOutlined />} 
                                        onClick={() => window.location.href = '/dashboard/whatsapp/broadcast'}
                                    >
                                        Broadcast
                                    </Button>
                                    {hasPermission('create') && (
                                        <Button 
                                            size="small"
                                            type="primary" 
                                            icon={<PlusOutlined />} 
                                            onClick={() => setIsNewChatModalOpen(true)}
                                        >
                                            New Chat
                                        </Button>
                                    )}
                                </Space>
                            }
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
                        ) : displayConvs.length === 0 ? (
                            <Empty description="No chats found" />
                        ) : (
                            displayConvs.map((item) => {
                                const active = item.wa_from === selected;
                                return (
                                    <div
                                        key={item.wa_from}
                                        className={`chat-list-item ${active ? 'selected' : ''}`}
                                        onClick={() => handleSelectConversation(item.wa_from)}
                                    >
                                        <div className="ant-list-item-meta">
                                            <Badge dot offset={[-2, 36]} status={item.isNew ? "default" : "processing"}>
                                                <Avatar
                                                    size={44}
                                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.wa_from)}&background=random&color=fff`}
                                                />
                                            </Badge>
                                            <div className="chat-item-content" style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                                                <div className="chat-item-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                                    <Title level={5} style={{ margin: 0, fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                                                        {item.wa_from}
                                                    </Title>
                                                    <Text type="secondary" style={{ fontSize: '11px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                        {item.lastAt ? formatRelativeTime(item.lastAt) : (item.isNew ? 'New' : '')}
                                                    </Text>
                                                </div>
                                                <div className="chat-item-summary" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text type="secondary" ellipsis style={{ fontSize: '13px', color: item.unreadCount > 0 ? '#1890ff' : '#8c8c8c', maxWidth: '85%' }}>
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
                                    [...messages].reverse().map((m) => (
                                        <div key={m.id} className={`message ${m.direction === 'outbound' ? 'sent' : 'received'}`}>
                                            <div className="message-content">
                                                {m.direction === 'received' && <div className="message-sender">{selected}</div>}
                                                <div className="message-body">
                                                    {renderMessageBody(m)}
                                                </div>
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

                                {typingStatus[selected] && (
                                    <div className="message received">
                                        <div className="message-content typing-indicator-bubble">
                                            <div className="typing-dots">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-footer">
                                <div className="chat-input-wrapper">
                                    {hasPermission('create') && (
                                        <div className="input-actions">
                                            <Button
                                                type="text"
                                                icon={<FileTextOutlined />}
                                                className="action-icon"
                                                title="Send Template"
                                                onClick={() => setIsTemplateModalOpen(true)}
                                            />
                                            <div className="media-upload-wrapper" style={{ display: 'inline-block' }}>
                                                <input
                                                    type="file"
                                                    id="whatsapp-media-upload"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            handleMediaUpload(e.target.files[0]);
                                                            e.target.value = ''; // Reset for same file selection
                                                        }
                                                    }}
                                                />
                                                <Tooltip title="Upload Media (Images: 5MB, Video: 16MB, Docs: 25MB)">
                                                    <Button
                                                        type="text"
                                                        icon={<PaperClipOutlined />}
                                                        className="action-icon"
                                                        onClick={() => document.getElementById('whatsapp-media-upload').click()}
                                                    />
                                                </Tooltip>
                                            </div>
                                            <Button type="text" icon={<ReloadOutlined />} className="action-icon" onClick={() => refetchMsgs()} />
                                        </div>
                                    )}
                                    <Input.TextArea
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                        placeholder="Type a message"
                                        className="message-input"
                                        disabled={!hasPermission('create')}
                                        value={draft}
                                        onChange={(e) => setDraft(e.target.value)}
                                        onPressEnter={(e) => {
                                            if (!e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<SendOutlined />}
                                        disabled={!canSend || !hasPermission('create')}
                                        loading={isSending}
                                        onClick={handleSendMessage}
                                        className="send-button"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </Content>
            </Layout>

            <Modal
                title="Start New WhatsApp Chat"
                open={isNewChatModalOpen}
                onCancel={() => setIsNewChatModalOpen(false)}
                onOk={() => newChatForm.submit()}
                okText="Start Chat"
                destroyOnClose
            >
                <Form
                    form={newChatForm}
                    layout="vertical"
                    onFinish={handleNewChat}
                >
                    <Form.Item
                        name="phone"
                        label="Phone Number"
                        rules={[
                            { required: true, message: 'Please enter a phone number' },
                            { pattern: /^\+?[0-9]{10,15}$/, message: 'Please enter a valid phone number (e.g., 919328996135)' }
                        ]}
                    >
                        <AntInput placeholder="Enter phone number with country code (e.g., 919328996135)" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Select WhatsApp Template"
                open={isTemplateModalOpen}
                onCancel={() => {
                    setIsTemplateModalOpen(false);
                    setSelectedTemplate(null);
                    templateForm.resetFields();
                }}
                onOk={() => templateForm.submit()}
                okText="Send Template"
                destroyOnClose
            >
                <Form
                    form={templateForm}
                    layout="vertical"
                    onFinish={handleSendTemplate}
                >
                    <Form.Item
                        name="templateName"
                        label="Approved Template"
                        rules={[{ required: true, message: 'Please select a template' }]}
                    >
                        <Select
                            placeholder="Select a template"
                            onChange={(val) => {
                                const t = templates.find(temp => temp.name === val);
                                setSelectedTemplate(t);
                                templateForm.resetFields(['var_']); // Reset vars on change
                            }}
                        >
                            {templates.map(t => (
                                <Select.Option key={t.id} value={t.name}>
                                    {t.name} ({t.language})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    {selectedTemplate && (
                        <>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                                <Text strong style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Message Preview:
                                </Text>
                                <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9', whiteSpace: 'pre-wrap', fontSize: '14px', color: '#1e293b', lineHeight: '1.6' }}>
                                    {renderPreviewText()}
                                </div>
                            </div>

                            {getTemplateVariables(selectedTemplate).bodyVars.map((v) => (
                                <Form.Item
                                    key={`body_${v.num}`}
                                    name={`var_body_${v.num}`}
                                    label={`Message Variable {{${v.num}}}`}
                                    rules={[{ required: true, message: `Please enter value for {{${v.num}}}` }]}
                                >
                                    <AntInput placeholder={`Value for {{${v.num}}}`} />
                                </Form.Item>
                            ))}

                            {getTemplateVariables(selectedTemplate).btnVars.map((v) => (
                                <Form.Item
                                    key={`btn_${v.index}`}
                                    name={`var_btn_${v.index}`}
                                    label={`Button URL Variable (Button: ${v.label})`}
                                    rules={[{ required: true, message: `Please enter URL parameter for button` }]}
                                >
                                    <AntInput placeholder="Enter URL parameter (e.g., project-id-123)" />
                                </Form.Item>
                            ))}
                        </>
                    )}

                    <div style={{ background: '#f0f7ff', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#005a9e' }}>
                        <FiMoreVertical style={{ marginRight: '8px' }} />
                        Templates with dynamic buttons require URL parameters to be filled.
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
