import React, { useState } from 'react';
import { Card, Table, Button, Tag, Upload, Modal, Form, Input, message } from 'antd';
import { FiUpload, FiDownload, FiTrash2, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import { useUpdateDealMutation, useGetDealsQuery } from '../../services/DealApi';
import './files.scss';

const DealFiles = ({ deal }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [updateDeal] = useUpdateDealMutation();
    const { refetch } = useGetDealsQuery();

    // Parse deal_files from deal
    const dealFiles = deal?.files ? 
        JSON.parse(deal.files) || [] 
        : [];

    const columns = [
        {
            title: 'File Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="file-info">
                    <FileIcon type={record.type} />
                    <div className="file-details">
                        <h4>{text}</h4>
                        <span>{record.size}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Uploaded By',
            dataIndex: 'uploadedBy',
            key: 'uploadedBy',
        },
        {
            title: 'Upload Date',
            dataIndex: 'uploadDate',
            key: 'uploadDate',
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : 'default'}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="action-buttons">
                    <Button
                        type="text"
                        icon={<FiDownload />}
                        className="download-button"
                        onClick={() => handleDownload(record)}
                    />
                    <Button
                        type="text"
                        icon={<FiTrash2 />}
                        className="delete-button"
                        onClick={() => handleDeleteFile(record)}
                    />
                </div>
            ),
        },
    ];

    const FileIcon = ({ type }) => {
        switch (type) {
            case 'document':
                return <FiFileText className="file-icon document" />;
            case 'image':
                return <FiImage className="file-icon design" />;
            default:
                return <FiFile className="file-icon" />;
        }
    };

    const showUploadModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const handleUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await updateDeal({
                id: deal.id,
                data: formData
            }).unwrap();

            message.success('File uploaded successfully');
            setIsModalVisible(false);
            await refetch();
        } catch (error) {
            console.error('Upload Error:', error);
            message.error(error?.data?.message || 'Failed to upload file');
        }
        return false;
    };

    const handleDeleteFile = async (fileToDelete) => {
        try {
            const updatedFiles = dealFiles.filter(file => file.name !== fileToDelete.name);
            
            await updateDeal({
                id: deal.id,
                files: JSON.stringify(updatedFiles)
            }).unwrap();

            await refetch();
            message.success('File deleted successfully');
        } catch (error) {
            message.error('Failed to delete file');
        }
    };

    const handleDownload = (file) => {
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = file.base64;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="deal-files">
            <Card
                title="Deal Files"
                extra={
                    <Button
                        type="primary"
                        icon={<FiUpload />}
                        onClick={showUploadModal}
                    >
                        Upload File
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={dealFiles}
                    rowKey="name"
                    pagination={false}
                />
            </Card>

            <Modal
                title="Upload File"
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Upload.Dragger
                    name="file"
                    multiple={false}
                    showUploadList={false}
                    beforeUpload={handleUpload}
                    accept=".jpg,.jpeg,.png,.pdf"
                    maxCount={1}
                    className="upload-dragger"
                >
                    <p className="ant-upload-drag-icon">
                        <FiUpload />
                    </p>
                    <p className="ant-upload-text">Click or drag file to this area to upload</p>
                    <p className="ant-upload-hint">
                        Support for JPG/PNG/PDF files. File must be smaller than 5MB.
                    </p>
                </Upload.Dragger>
            </Modal>
        </div>
    );
};

export default DealFiles; 