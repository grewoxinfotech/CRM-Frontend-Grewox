import React, { useState, useEffect } from 'react';
import {
    Card, Typography, Button, Row, Col,
    Breadcrumb, message, Spin, Modal
} from 'antd';
import {
    FiHome, FiPlus
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PageHeader from '../../../../components/PageHeader';
import ESignatureList from './eSignatureList';
import AddSignature from './AddSignature';
import './eSignature.scss';
import {
    useGetAllSignaturesQuery,
    useDeleteSignatureMutation
} from './services/esignatureApi';

const { Title, Text } = Typography;

const ESignature = () => {
    // Local state management
    const [signatures, setSignatures] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSignature, setSelectedSignature] = useState(null);

    // API hooks
    const { data: signatureData, isLoading, isError, refetch } = useGetAllSignaturesQuery();
    const [deleteSignature, { isLoading: isDeleting }] = useDeleteSignatureMutation();

    useEffect(() => {
        // Update local state when API data changes
        if (signatureData?.data) {
            setSignatures(signatureData.data);
        } else if (signatureData) {
            setSignatures(signatureData);
        } else {
            // Fallback to localStorage
            const savedSignatures = localStorage.getItem('signatures');
            if (savedSignatures) {
                setSignatures(JSON.parse(savedSignatures));
            }
        }
    }, [signatureData]);

    const handleOpenModal = (mode = 'add', signature = null) => {
        setSelectedSignature(signature);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedSignature(null);
    };

    const handleDeleteSignature = (id) => {
        Modal.confirm({
            title: 'Delete Signature',
            content: 'Are you sure you want to delete this signature? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            bodyStyle: { padding: '20px' },
            onOk: async () => {
                try {
                    await deleteSignature(id).unwrap();
                    setSignatures(prev => prev.filter(sig => sig.id !== id));
                    message.success('Signature deleted successfully');
                    refetch();
                } catch (error) {
                    message.error(`Delete failed: ${error.message || 'Unknown error'}`);
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <Spin size="large" />
                <p>Loading signatures...</p>
            </div>
        );
    }

    if (isError) {
        message.error('Failed to load signatures. Using local storage as fallback.');
    }

    const breadcrumbItems = [
        {
            title: (
                <Link to="/superadmin">
                    <FiHome style={{ marginRight: '4px' }} />
                    Home
                </Link>
            ),
        },
        { title: 'Settings' },
        { title: 'E-Signatures' },
    ];

    return (
        <div className="esignature-page">
            <PageHeader
                title="E-Signatures"
                subtitle="Create and manage your electronic signatures"
                breadcrumbItems={breadcrumbItems}
                onAdd={() => handleOpenModal()}
                addText="Create New Signature"
            />

            <Card className="signature-list-card">
                <ESignatureList
                    signatures={signatures}
                    onEdit={(signature) => handleOpenModal('edit', signature)}
                    onDelete={handleDeleteSignature}
                    loading={isLoading || isDeleting}
                />
            </Card>

            <AddSignature
                visible={isModalVisible}
                onCancel={handleCloseModal}
                isEditing={!!selectedSignature}
                initialValues={selectedSignature}
                onSuccess={refetch}
            />
        </div>
    );
};

export default ESignature;
