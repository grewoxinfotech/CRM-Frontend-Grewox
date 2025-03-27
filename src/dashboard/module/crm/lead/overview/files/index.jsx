import React from 'react';
import { Upload, Card, List, Typography, Button, Space, Progress } from 'antd';
import { FiUpload, FiDownload, FiTrash2, FiFile, FiImage, FiFileText } from 'react-icons/fi';

const { Text } = Typography;
const { Dragger } = Upload;

const LeadFiles = ({ leadId }) => {
    // You'll need to implement the API calls to fetch and manage files
    const files = []; // Replace with actual API data

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'image':
                return <FiImage />;
            case 'document':
                return <FiFileText />;
            default:
                return <FiFile />;
        }
    };

    const handleUpload = (file) => {
        // Implement file upload
    };

    const handleDownload = (fileId) => {
        // Implement file download
    };

    const handleDelete = (fileId) => {
        // Implement file deletion
    };

    return (
        <div className="lead-files">
            <Card className="upload-section">
                <Dragger
                    multiple
                    beforeUpload={handleUpload}
                    showUploadList={false}
                >
                    <p className="ant-upload-drag-icon">
                        <FiUpload style={{ fontSize: 24 }} />
                    </p>
                    <p className="ant-upload-text">
                        Click or drag files to this area to upload
                    </p>
                </Dragger>
            </Card>

            <List
                className="files-list"
                itemLayout="horizontal"
                dataSource={files}
                renderItem={file => (
                    <Card className="file-item" key={file.id}>
                        <div className="file-info">
                            <Space>
                                {getFileIcon(file.type)}
                                <div>
                                    <Text strong>{file.name}</Text>
                                    <Text type="secondary" style={{ display: 'block' }}>
                                        {file.size} • {new Date(file.uploadedAt).toLocaleDateString()}
                                    </Text>
                                </div>
                            </Space>
                            <Space>
                                <Button
                                    type="text"
                                    icon={<FiDownload />}
                                    onClick={() => handleDownload(file.id)}
                                />
                                <Button
                                    type="text"
                                    danger
                                    icon={<FiTrash2 />}
                                    onClick={() => handleDelete(file.id)}
                                />
                            </Space>
                        </div>
                        {file.uploading && (
                            <Progress percent={file.progress} size="small" />
                        )}
                    </Card>
                )}
            />
        </div>
    );
};

export default LeadFiles; 