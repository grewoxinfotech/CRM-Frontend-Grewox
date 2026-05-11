
import React, { useMemo, useState } from 'react';
import { Table, Tag, Typography, Empty, Spin, Button, Card, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useGetWhatsappMessagesQuery, useGetWhatsappSettingsQuery } from '../../../../module/settings/services/settingsApi';

const { Text } = Typography;

const sourceColors = {
  customer: 'default',
  ai: 'purple',
  auto_template: 'blue',
  manual: 'orange'
};

const directionLabels = {
  inbound: 'In',
  outbound: 'Out',
};

export default function LeadWhatsapp({ leadId }) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const queryArgs = useMemo(() => ({
    page,
    limit: pageSize,
    lead_id: leadId
  }), [page, leadId]);

  const { data, isLoading, isFetching, refetch } = useGetWhatsappMessagesQuery(queryArgs, { skip: !leadId });
  const { data: waSettings, isLoading: isSettingsLoading, error: settingsError } = useGetWhatsappSettingsQuery();

  const rows = data?.data || [];
  const total = data?.total ?? 0;
  
  // settingsApi.js has transformResponse: (response) => response.data,
  // so waSettings IS the settings object itself.
  const isWaConfigured = waSettings && waSettings.is_active !== false && waSettings.access_token;

  const columns = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (v) => (v ? new Date(v).toLocaleString() : '—'),
    },
    {
      title: 'Dir',
      dataIndex: 'direction',
      key: 'direction',
      width: 70,
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
      title: 'Message',
      dataIndex: 'body',
      key: 'body',
      render: (text) => (
        <Text style={{ fontSize: '13px' }}>
          {text || '—'}
        </Text>
      ),
    },
  ];

  if (isLoading || isSettingsLoading) return <div style={{ padding: '40px', textAlign: 'center' }}><Spin tip="Loading..." /></div>;

  if (!isWaConfigured) {
    return (
      <Card style={{ textAlign: 'center', padding: '24px', background: '#f8fafc' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical">
              <Text strong>WhatsApp Business API is not configured</Text>
              <Text type="secondary">To see message logs and chat with leads, please set up your WhatsApp Business account in settings.</Text>
              <Button type="primary" onClick={() => window.location.href='/dashboard/settings/whatsapp'}>
                Go to WhatsApp Settings
              </Button>
            </Space>
          }
        />
      </Card>
    );
  }

  return (
    <div className="lead-whatsapp-tab">
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="small" icon={<ReloadOutlined />} loading={isFetching} onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {rows.length === 0 ? (
        <Empty description="No WhatsApp messages found for this lead." />
      ) : (
        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={rows}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: false,
            onChange: (p) => setPage(p),
          }}
          scroll={{ x: 600 }}
        />
      )}
    </div>
  );
}
