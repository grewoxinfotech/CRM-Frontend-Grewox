import React from 'react';
import { Row, Col, Card, Statistic, Progress, Typography } from 'antd';
import {
    TeamOutlined,
    CloudUploadOutlined,
    FileOutlined,
    HddOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const StorageStats = ({ data = [] }) => {
    const totalClients = data?.length || 0;
    const totalFiles = data?.reduce((acc, client) => acc + (client.totalFiles || 0), 0) || 0;
    const totalStorage = data?.reduce((acc, client) => {
        const size = parseFloat(client.totalSize) || 0;
        return acc + size;
    }, 0).toFixed(2) || 0;
    const activeClients = data?.filter(client => (client.totalFiles || 0) > 0).length || 0;

    const stats = [
        {
            title: 'Total Clients',
            value: totalClients,
            icon: <TeamOutlined className="team-icon" />,
            color: '#1677ff',
            percent: (activeClients / totalClients) * 100,
            subTitle: `${activeClients} active clients`
        },
        {
            title: 'Active Clients',
            value: activeClients,
            icon: <CloudUploadOutlined className="active-icon" />,
            color: '#52c41a',
            percent: (activeClients / totalClients) * 100,
            subTitle: `${((activeClients / totalClients) * 100).toFixed(1)}% of total clients`
        },
        {
            title: 'Total Files',
            value: totalFiles,
            icon: <FileOutlined className="files-icon" />,
            color: '#faad14',
            percent: Math.min(100, (totalFiles / 1000) * 100),
            subTitle: 'Across all clients'
        },
        {
            title: 'Total Storage',
            value: totalStorage,
            suffix: 'MB',
            icon: <HddOutlined className="storage-icon" />,
            color: '#f5222d',
            percent: Math.min(100, (totalStorage / 1024) * 100),
            subTitle: `${((totalStorage / 1024)).toFixed(2)} GB used`
        }
    ];

    return (
        <Row gutter={[16, 16]} className="storage-stats">
            {stats.map((stat, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                    <Card className="stat-card">
                        <div className="stat-icon-wrapper" style={{ background: `${stat.color}15` }}>
                            {React.cloneElement(stat.icon, { style: { color: stat.color } })}
                        </div>
                        <div className="stat-content">
                            <Text className="stat-title">{stat.title}</Text>
                            <div className="stat-value">
                                <span className="number" style={{ color: stat.color }}>
                                    {stat.value}
                                </span>
                                {stat.suffix && <span className="suffix">{stat.suffix}</span>}
                            </div>
                            <Text type="secondary" className="stat-subtitle">
                                {stat.subTitle}
                            </Text>
                            <Progress
                                percent={stat.percent}
                                showInfo={false}
                                size="small"
                                strokeColor={stat.color}
                                trailColor={`${stat.color}15`}
                            />
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default StorageStats;