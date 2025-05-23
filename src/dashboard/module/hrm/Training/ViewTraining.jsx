import React from 'react';
import {
    Modal,
    Typography,
    Button,
    Space,
    Tag,
    Divider,
    Card,
    List
} from 'antd';
import { FiX, FiGrid, FiLink, FiBookOpen, FiUser } from 'react-icons/fi';
import moment from 'moment';

const { Text, Title } = Typography;

const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ViewTraining = ({ open, onCancel, training }) => {
    if (!training) return null;

    // Parse links if it's a string
    const links = typeof training.links === 'string'
        ? JSON.parse(training.links)
        : training.links;

    // Handle different link formats
    let urls = [];
    let titles = [];

    if (links?.urls && links?.titles) {
        // Format: {urls: Array, titles: Array}
        urls = links.urls;
        titles = links.titles;
    } else if (links?.url) {
        // Format: {url: Array}
        urls = Array.isArray(links.url) ? links.url : [links.url];
        titles = urls.map((url, index) => `Link ${index + 1}`);
    } else if (Array.isArray(links)) {
        // Format: Array of URLs
        urls = links;
        titles = links.map((_, index) => `Link ${index + 1}`);
    }

    const linkItems = urls.map((url, index) => ({
        title: titles[index] || `Link ${index + 1}`,
        url: url
    }));

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff',
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                }
            }}
        >
            <div className="training-view">
                <div className="header">
                    <Title level={4}>
                        <FiBookOpen className="icon" /> {training.title}
                    </Title>
                    <Button icon={<FiX />} type="text" onClick={onCancel} />
                </div>

                <Divider />

                <div className="content">
                    <div className="info-section">
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div>
                                <Text type="secondary">Category</Text>
                                <Title level={5}>{training.category}</Title>
                            </div>
                        </Space>
                    </div>

                    <Divider />

                    <div className="links-section">
                        <Title level={5}>Training Links</Title>
                        <List
                            dataSource={linkItems}
                            renderItem={(item) => (
                                <List.Item>
                                    <Card
                                        size="small"
                                        style={{ width: '100%' }}
                                        hoverable
                                        onClick={() => {
                                            const properUrl = item.url.startsWith('http')
                                                ? item.url
                                                : `https://${item.url}`;
                                            window.open(properUrl, '_blank');
                                        }}
                                    >
                                        <Space>
                                            <FiLink />
                                            <Text strong>{item.title}</Text>
                                            <Text type="secondary">{item.url}</Text>
                                        </Space>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    </div>

                    {training.created_by && (
                        <div className="footer">
                            <Divider />
                            <Space>
                                <FiUser />
                                <Text type="secondary">Created by {training.created_by}</Text>
                            </Space>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ViewTraining;
