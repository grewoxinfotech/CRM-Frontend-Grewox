import React, { useEffect, useMemo, useState } from 'react';
import { Card, Input, List, Typography, Tag, Button, Empty, Spin, Divider } from 'antd';
import { ReloadOutlined, SendOutlined, SearchOutlined } from '@ant-design/icons';
import { useGetWhatsappConversationsQuery, useGetWhatsappMessagesQuery } from '../settings/services/settingsApi';

import './whatsapp-inbox.scss';

const { Text, Title } = Typography;

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

  // For now: UI only (send API UI can be wired once you confirm which lead/contact mapping to use)
  const canSend = Boolean(selected) && draft.trim().length > 0;

  return (
    <div className="wa-inbox">
      <div className="wa-inbox-header">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            WhatsApp Inbox
          </Title>
          <Text type="secondary">Numbers list (left) and messages (right).</Text>
        </div>
        <Button icon={<ReloadOutlined />} loading={convFetching || msgFetching} onClick={() => { refetchConvs(); refetchMsgs(); }}>
          Refresh
        </Button>
      </div>

      <div className="wa-inbox-grid">
        <Card className="wa-left">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search number…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
                          <Text strong>{item.wa_from}</Text>
                          {item.lastSource ? <Tag color={sourceColor(item.lastSource)}>{item.lastSource}</Tag> : null}
                        </div>
                      }
                      description={
                        <Text type="secondary" className="wa-conv-preview">
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

        <Card className="wa-right">
          {!selected ? (
            <Empty description="Select a number to view messages" />
          ) : msgLoading ? (
            <div className="wa-center">
              <Spin />
            </div>
          ) : (
            <>
              <div className="wa-thread-header">
                <Text strong>Chat with: {selected}</Text>
                <Button size="small" onClick={() => refetchMsgs()} loading={msgFetching}>
                  Reload
                </Button>
              </div>

              <div className="wa-thread">
                {messages.length === 0 ? (
                  <Empty description="No messages found" />
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`wa-bubble ${m.direction === 'outbound' ? 'out' : 'in'}`}
                    >
                      <div className="wa-bubble-meta">
                        <Tag color={m.direction === 'outbound' ? 'geekblue' : 'green'}>
                          {m.direction === 'outbound' ? 'You' : 'Customer'}
                        </Tag>
                        {m.message_source ? <Tag color={sourceColor(m.message_source)}>{m.message_source}</Tag> : null}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                        </Text>
                      </div>
                      <div className="wa-bubble-body">{m.body || '—'}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="wa-compose">
                <Input.TextArea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Type a message…"
                />
                <Button type="primary" icon={<SendOutlined />} disabled={!canSend}>
                  Send
                </Button>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Send button UI ready. Tell me: message send should map to which lead/contact (latest lead for this phone? manual pick?).
              </Text>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

