import React, { useMemo, useState } from 'react';
import { Breadcrumb, Card, Input, Table, Tag, Typography, Empty, Spin, Button } from 'antd';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { ReloadOutlined } from '@ant-design/icons';
import { useGetWhatsappMessagesQuery } from '../settings/services/settingsApi';
import './whatsapp-messages.scss';

const { Title, Text } = Typography;

const sourceColors = {
  customer: 'default',
  ai: 'purple',
  auto_template: 'blue',
};

const directionLabels = {
  inbound: 'In',
  outbound: 'Out',
};

export default function WhatsAppMessages() {
  const [leadFilter, setLeadFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const queryArgs = useMemo(() => {
    const lid = leadFilter.trim();
    return {
      page,
      limit: pageSize,
      ...(lid ? { lead_id: lid } : {}),
    };
  }, [page, leadFilter]);

  const { data, isLoading, isFetching, refetch } = useGetWhatsappMessagesQuery(queryArgs);

  const rows = data?.data || [];
  const total = data?.total ?? 0;

  const columns = [
    {
      title: 'When',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (v) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: 'Dir',
      dataIndex: 'direction',
      key: 'direction',
      width: 72,
      render: (d) => (
        <Tag color={d === 'inbound' ? 'green' : 'geekblue'}>{directionLabels[d] || d}</Tag>
      ),
    },
    {
      title: 'Source',
      dataIndex: 'message_source',
      key: 'message_source',
      width: 110,
      render: (s) => <Tag color={sourceColors[s] || 'default'}>{s || '—'}</Tag>,
    },
    {
      title: 'Phone',
      dataIndex: 'wa_from',
      key: 'wa_from',
      width: 130,
      ellipsis: true,
    },
    {
      title: 'Lead',
      dataIndex: 'lead_id',
      key: 'lead_id',
      width: 100,
      render: (id) =>
        id ? (
          <Link to={`/dashboard/crm/leads/${id}`}>Open</Link>
        ) : (
          '—'
        ),
    },
    {
      title: 'Message',
      dataIndex: 'body',
      key: 'body',
      ellipsis: true,
      render: (text) => (
        <Text type="secondary" className="wa-msg-preview">
          {text || '—'}
        </Text>
      ),
    },
  ];

  return (
    <div className="whatsapp-messages-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>WhatsApp</Breadcrumb.Item>
          <Breadcrumb.Item>Message log</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header wa-header">
        <div>
          <Title level={3} style={{ margin: 0 }}>
            WhatsApp message log
          </Title>
          <Text type="secondary">
            Inbound and outbound messages from the Meta webhook (stored in your CRM database).
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <Card className="white-label-welcome wa-filters-card">
        <div className="wa-filters">
          <Text strong>Filter by lead ID</Text>
          <Input
            allowClear
            placeholder="Paste lead ID (optional)"
            value={leadFilter}
            onChange={(e) => {
              setLeadFilter(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 320 }}
          />
        </div>
      </Card>

      <Card className="wa-table-card">
        {isLoading ? (
          <div className="wa-loading">
            <Spin />
          </div>
        ) : rows.length === 0 ? (
          <Empty description="No messages yet. When customers message your WhatsApp number, they will appear here." />
        ) : (
          <Table
            rowKey="id"
            size="middle"
            columns={columns}
            dataSource={rows}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: false,
              onChange: (p) => setPage(p),
            }}
            scroll={{ x: 900 }}
          />
        )}
      </Card>
    </div>
  );
}
