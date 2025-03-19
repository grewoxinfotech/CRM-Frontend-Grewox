import React, { useState, useRef, useEffect } from 'react';
import { 
    Card, Typography, Button, Row, Col, 
    Breadcrumb, Modal, Input, message, Tooltip,
    Divider, Radio, Spin
} from 'antd';
import {
    FiHome, FiSave, FiTrash2, FiDownload,
    FiEdit, FiPlusCircle, FiInfo, FiImage, FiCamera
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import ESignatureList from './eSignatureList';
import './eSignature.scss';
import { useDispatch, useSelector } from 'react-redux';
import { 
    useGetAllSignaturesQuery, 
    useCreateSignatureMutation, 
    useUpdateSignatureMutation, 
    useDeleteSignatureMutation
} from './services/esignatureApi';
import { 
    setSignatures, 
    addSignature, 
    updateSignature, 
    removeSignature 
} from './services/esignatureSlice';

const { Title, Text } = Typography;

const ESignature = () => {
    const dispatch = useDispatch();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [signatureName, setSignatureName] = useState('');
    const [signatureType, setSignatureType] = useState('draw');
    const [signatureMode, setSignatureMode] = useState('add');
    const [selectedSignature, setSelectedSignature] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    
    const sigCanvas = useRef(null);
    const uploadRef = useRef(null);

    // API hooks
    const { data: signatureData, isLoading, isError, refetch } = useGetAllSignaturesQuery();
    const [createSignature, { isLoading: isCreating }] = useCreateSignatureMutation();
    const [updateSignatureApi, { isLoading: isUpdating }] = useUpdateSignatureMutation();
    const [deleteSignature, { isLoading: isDeleting }] = useDeleteSignatureMutation();

    // Use local storage as fallback when API is not available
    const signatures = useSelector(state => state.esignature?.signatures) || [];

    useEffect(() => {
        // If API data is available, update Redux store
        if (signatureData?.data) {
            dispatch(setSignatures(signatureData.data));
        } else if (signatureData) {
            dispatch(setSignatures(signatureData));
        } else {
            // Fallback to localStorage
            const savedSignatures = localStorage.getItem('signatures');
            if (savedSignatures) {
                const parsedSignatures = JSON.parse(savedSignatures);
                dispatch(setSignatures(parsedSignatures));
            }
        }
    }, [signatureData, dispatch]);

    // Fallback save function for when API is not available
    const saveLocalSignatures = (newSignatures) => {
        localStorage.setItem('signatures', JSON.stringify(newSignatures));
        dispatch(setSignatures(newSignatures));
    };

    const handleOpenModal = (mode = 'add', signature = null) => {
        setSignatureMode(mode);
        setSelectedSignature(signature);
        
        if (mode === 'edit' && signature) {
            setSignatureName(signature.name);
            setSignatureType(signature.type || 'draw');
            
            // If reopening a signature, set the image data
            if (sigCanvas.current && signature.type === 'draw') {
                setTimeout(() => {
                    sigCanvas.current.fromDataURL(signature.data);
                }, 100);
            } else if (signature.type === 'upload') {
                setUploadedImage(signature.data);
            }
        } else {
            setSignatureName('');
            setSignatureType('draw');
            setUploadedImage(null);
        }
        
        setIsModalVisible(true);
    };

    const handleSaveSignature = async () => {
        if (!signatureName.trim()) {
            message.error('Please enter a name for your signature');
            return;
        }

        // Create FormData object for API submission
        const formData = new FormData();
        formData.append('esignature_name', signatureName);
        formData.append('type', signatureType);
        
        let signatureData;
        let fileToUpload;

        if (signatureType === 'draw') {
            if (sigCanvas.current.isEmpty()) {
                message.error('Please draw your signature');
                return;
            }
            
            // Get the data URL from canvas
            signatureData = sigCanvas.current.toDataURL('image/png');
            
            // Convert data URL to file
            const base64Response = await fetch(signatureData);
            const blob = await base64Response.blob();
            fileToUpload = new File([blob], `${signatureName}.png`, { type: 'image/png' });
            
        } else {
            if (!uploadedImage) {
                message.error('Please upload an image');
                return;
            }
            
            signatureData = uploadedImage;
            
            // Convert uploaded image to file
            const base64Response = await fetch(uploadedImage);
            const blob = await base64Response.blob();
            fileToUpload = new File([blob], `${signatureName}.png`, { type: 'image/png' });
        }
        
        // Append the file to FormData
        formData.append('e_signatures', fileToUpload);

        // For local storage and display
        const newSignature = {
            id: selectedSignature ? selectedSignature.id : Date.now().toString(),
            esignature_name: signatureName,
            name: signatureName, // For UI display
            type: signatureType,
            data: signatureData, // Keep for local storage and display
            createdAt: selectedSignature ? selectedSignature.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            if (signatureMode === 'edit' && selectedSignature) {
                // For edit, add ID to formData
                if (selectedSignature.id) {
                    formData.append('id', selectedSignature.id);
                }
                
                // Use API with FormData
                const result = await updateSignatureApi({ 
                    id: selectedSignature.id, 
                    data: formData 
                }).unwrap();
                
                if (result?.data) {
                    const updatedSignature = {
                        ...result.data,
                        data: signatureData // Ensure we keep the image data for display
                    };
                    dispatch(updateSignature(updatedSignature));
                    message.success('Signature updated successfully');
                } else if (result) {
                    dispatch(updateSignature({
                        ...result,
                        data: signatureData 
                    }));
                    message.success('Signature updated successfully');
                } else {
                    // Fallback to local storage
                    const updatedSignatures = signatures.map(sig => 
                        sig.id === newSignature.id ? newSignature : sig
                    );
                    saveLocalSignatures(updatedSignatures);
                    message.success('Signature updated successfully (local)');
                }
            } else {
                // Use API with FormData for new signature
                const result = await createSignature(formData).unwrap();
                
                if (result?.data) {
                    // Add the image data to the result for display
                    const newCreatedSignature = {
                        ...result.data,
                        data: signatureData // Ensure we keep the image data for display
                    };
                    dispatch(addSignature(newCreatedSignature));
                    message.success('Signature created successfully');
                } else if (result) {
                    dispatch(addSignature({
                        ...result,
                        data: signatureData
                    }));
                    message.success('Signature created successfully');
                } else {
                    // Fallback to local storage
                    const updatedSignatures = [...signatures, newSignature];
                    saveLocalSignatures(updatedSignatures);
                    message.success('Signature saved successfully (local)');
                }
            }
            
            setIsModalVisible(false);
            clearSignature();
            refetch(); // Refresh the list
        } catch (error) {
            console.error('Operation failed:', error);
            message.error(`Operation failed: ${error.message || 'Unknown error'}`);
            
            // Fallback to local storage in case of API error
            if (signatureMode === 'edit') {
                const updatedSignatures = signatures.map(sig => 
                    sig.id === newSignature.id ? newSignature : sig
                );
                saveLocalSignatures(updatedSignatures);
                message.warning('Saved to local storage due to API error');
            } else {
                const updatedSignatures = [...signatures, newSignature];
                saveLocalSignatures(updatedSignatures);
                message.warning('Saved to local storage due to API error');
            }
            setIsModalVisible(false);
        }
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
                    if (signatureData) {
                        // Use API
                        await deleteSignature(id).unwrap();
                        dispatch(removeSignature(id));
                    } else {
                        // Fallback to local storage
                        const updatedSignatures = signatures.filter(signature => signature.id !== id);
                        saveLocalSignatures(updatedSignatures);
                    }
                    message.success('Signature deleted successfully');
                    refetch(); // Refresh the list
                } catch (error) {
                    message.error(`Delete failed: ${error.message || 'Unknown error'}`);
                }
            }
        });
    };

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setUploadedImage(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
            return;
        }

        // Read and display the file
        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedImage(event.target.result);
            message.success('Image uploaded successfully. Click Save to complete.');
        };
        reader.onerror = () => {
            message.error('Failed to read the image file.');
        };
        reader.readAsDataURL(file);
    };

    const handleDownload = (signature) => {
        try {
            const signatureUrl = signature.e_signatures || signature.data || signature.signature_url;
            if (!signatureUrl) {
                message.error('No signature image available for download');
                return;
            }

            const link = document.createElement('a');
            link.href = signatureUrl;
            link.download = `${signature.esignature_name || signature.name || 'signature'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success('Signature downloaded successfully');
        } catch (error) {
            console.error('Download failed:', error);
            message.error('Failed to download signature');
        }
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

    return (
        <div className="esignature-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Settings</Breadcrumb.Item>
                    <Breadcrumb.Item>E-Signatures</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div className="header-actions">
                <div className="page-title">
                    <Title level={2}>E-Signatures</Title>
                    <Text type="secondary">Create and manage your electronic signatures</Text>
                </div>
                            <div className="action-buttons">
                                <Button
                                    type="primary"
                                    icon={<FiPlusCircle size={16} />}
                                    onClick={() => handleOpenModal()}
                                    className="add-button"
                                    loading={isCreating}
                                >
                                    Create New Signature
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="signature-list-card">
                <ESignatureList 
                    signatures={signatures} 
                    onEdit={(signature) => handleOpenModal('edit', signature)}
                    onDelete={handleDeleteSignature}
                    onDownload={handleDownload}
                    loading={isLoading || isDeleting}
                />
            </Card>

            <Modal
                title={<span style={{ color: 'white' }}>Create New Signature</span>}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
                className="signature-modal"
                destroyOnClose={true}
                confirmLoading={isCreating || isUpdating}
            >
                <div className="signature-form">
                    <div className="signature-form-input">
                        <label>Signature Name</label>
                        <Input
                            placeholder="Enter signature name"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                        />
                    </div>

                    <div className="signature-type-selector">
                        <div className="single-button-toggle">
                            <div 
                                className={`toggle-item ${signatureType === 'draw' ? 'active' : ''}`}
                                onClick={() => setSignatureType('draw')}
                            >
                                <FiEdit style={{ marginRight: '6px' }} />
                                Draw
                            </div>
                            <div 
                                className={`toggle-item ${signatureType === 'upload' ? 'active' : ''}`}
                                onClick={() => setSignatureType('upload')}
                            >
                                <FiImage style={{ marginRight: '6px' }} />
                                Upload
                            </div>
                        </div>
                    </div>

                    <div className="signature-canvas-container">
                        {signatureType === 'draw' ? (
                            <>
                                <div className="signature-canvas-wrapper">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        canvasProps={{
                                            width: 600,
                                            height: 200,
                                            className: 'signature-canvas'
                                        }}
                                        backgroundColor="rgba(247, 250, 252, 1)"
                                    />
                                    <Tooltip title="Clear signature">
                                        <Button
                                            icon={<FiTrash2 />}
                                            onClick={clearSignature}
                                            className="clear-button"
                                        />
                                    </Tooltip>
                                    <div className="signature-hint">
                                        <FiInfo size={14} />
                                        <span>Draw your signature using your mouse or touch device</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="signature-upload-container">
                                {uploadedImage ? (
                                    <div className="uploaded-image-container">
                                        <img 
                                            src={uploadedImage} 
                                            alt="Uploaded signature" 
                                            className="uploaded-signature"
                                        />
                                        <div className="image-actions">
                                            <Button
                                                icon={<FiTrash2 />}
                                                onClick={() => setUploadedImage(null)}
                                                className="remove-image-button"
                                                danger
                                            >
                                                Remove
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<FiCamera />}
                                                onClick={() => uploadRef.current.click()}
                                            >
                                                Change Image
                                            </Button>
                                            <input
                                                type="file"
                                                ref={uploadRef}
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        className="upload-placeholder"
                                        onClick={() => uploadRef.current.click()}
                                    >
                                        <div className="upload-icon-wrapper">
                                            <FiCamera size={40} className="upload-icon" />
                                        </div>
                                        <p className="upload-title">Upload Your Signature</p>
                                        <p className="upload-subtitle">Click or drag image here</p>
                                        <Button 
                                            type="primary"
                                            icon={<FiCamera />}
                                            className="upload-button"
                                        >
                                            Select File
                                        </Button>
                                        <div className="upload-info">
                                            <Text type="secondary">Supported formats: JPG, PNG, GIF</Text>
                                            <Text type="secondary">Max file size: 2MB</Text>
                                        </div>
                                        <input
                                            type="file"
                                            ref={uploadRef}
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <Divider />

                    <div className="signature-form-actions">
                        <Button onClick={() => setIsModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<FiSave />}
                            onClick={handleSaveSignature}
                            loading={isCreating || isUpdating}
                        >
                            {signatureMode === 'edit' ? 'Update Signature' : 'Save Signature'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ESignature;
