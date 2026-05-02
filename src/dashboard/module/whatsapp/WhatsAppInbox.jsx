import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, List, Typography, Tag, Button, Empty, Spin, Divider } from 'antd';
import { FiHome } from 'react-icons/fi';
import { SearchOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons';
import { useGetWhatsappConversationsQuery, useGetWhatsappMessagesQuery } from '../settings/services/settingsApi';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';

import './whatsapp-inbox.scss';

const { Text } = Typography;

const sourceColor = (s) => {
  if (s === 'ai') return 'purple';
  if (s === 'auto_template') return 'blue';
  if (s === 'customer') return 'default';
  return 'default';
};

export default function WhatsAppInbox() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null); // wa_from
  const [draft, setDraft] = useState('');

  const convArgs = useMemo(() => ({ limit: 80, q: q.trim() }), [q]);
  const { data: convData, isLoading: convLoading, isFetching: convFetching, refetch: refetchConvs } =
    useGetWhatsappConversationsQuery(convArgs);

  const conversations = convData?.data || [];

  useEffect(() => {
    if (!selected && conversations.length > 0) {
      setSelected(conversations[0].wa_from);
    }
  }, [conversations, selected]);

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

  return (
    <div className="wa-inbox standard-page-container">
      <PageHeader
        title="WhatsApp Inbox"
        subtitle="Numbers list (left) and messages (right)."
        breadcrumbItems={[
            { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
            { title: "Communication" },
            { title: "WhatsApp Inbox" },
        ]}
        extraActions={[
            <Button 
                key="refresh" 
                icon={<ReloadOutlined />} 
                loading={convFetching || msgFetching} 
                onClick={() => { refetchConvs(); refetchMsgs(); }}
            >
                Refresh
            </Button>
        ]}
      />

      <div className="wa-inbox-grid">
        <Card className="wa-left standard-content-card" bodyStyle={{ padding: '16px' }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search number…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="search-input"
          />
          <Divider style={{ margin: '12px 0' }} />

          {convLoading ? (
            <div className="wa-center">
              <Spin />
            </div>
          ) : conversations.length === 0 ? (
            <Empty description="No conversations yet" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={conversations}
              renderItem={(item) => {
                const active = item.wa_from === selected;
                return (
                  <List.Item
                    className={`wa-conv ${active ? 'active' : ''}`}
                    onClick={() => setSelected(item.wa_from)}
                  >
                    <List.Item.Meta
                      title={
                        <div className="wa-conv-title">
                          <Text strong style={{ fontSize: '13px' }}>{item.wa_from}</Text>
                          {item.lastSource ? <Tag color={sourceColor(item.lastSource)} style={{ fontSize: '10px' }}>{item.lastSource}</Tag> : null}
                        </div>
                      }
                      description={
                        <Text type="secondary" className="wa-conv-preview" style={{ fontSize: '12px' }}>
                          {item.lastPreview || '—'}
                        </Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          )}
        </Card>

        <Card className="wa-right standard-content-card" bodyStyle={{ padding: 0 }}>
          {!selected ? (
            <div style={{ padding: '40px' }}><Empty description="Select a number to view messages" /></div>
          ) : msgLoading ? (
            <div className="wa-center" style={{ padding: '40px' }}>
              <Spin />
            </div>
          ) : (
            <>
              <div className="wa-thread-header" style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <Text strong>Chat with: {selected}</Text>
                <Button size="small" type="text" onClick={() => refetchMsgs()} loading={msgFetching} icon={<ReloadOutlined />}>
                  Reload
                </Button>
              </div>

              <div className="wa-thread" style={{ height: 'calc(100vh - 350px)', overflowY: 'auto', padding: '16px' }}>
                {messages.length === 0 ? (
                  <Empty description="No messages found" />
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`wa-bubble ${m.direction === 'outbound' ? 'out' : 'in'}`}
                      style={{ marginBottom: '16px' }}
                    >
                      <div className="wa-bubble-meta" style={{ marginBottom: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Tag color={m.direction === 'outbound' ? 'geekblue' : 'green'} style={{ fontSize: '10px', borderRadius: '4px' }}>
                          {m.direction === 'outbound' ? 'You' : 'Customer'}
                        </Tag>
                        {m.message_source ? <Tag color={sourceColor(m.message_source)} style={{ fontSize: '10px', borderRadius: '4px' }}>{m.message_source}</Tag> : null}
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                        </Text>
                      </div>
                      <div className="wa-bubble-body" style={{ padding: '10px 14px', borderRadius: '8px', background: m.direction === 'outbound' ? '#eff6ff' : '#f1f5f9', fontSize: '13px', maxWidth: '80%' }}>
                        {m.body || '—'}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="wa-compose" style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
                <Input.TextArea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Type a message…"
                  style={{ borderRadius: '8px' }}
                />
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="primary" icon={<SendOutlined />} disabled={!canSend} style={{ borderRadius: '6px' }}>
                    Send
                    </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
