import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Upload,
    Button,
    Typography,
    Divider,
    message,
    Select,
    Row,
    Col
} from 'antd';
import {
    FiUser,
    FiPhone,
    FiX,
    FiCamera,
    FiMapPin,
    FiHome,
    FiMap,
    FiGlobe,
    FiBriefcase,
    FiDollarSign,
    FiCreditCard
} from 'react-icons/fi';

const { Text } = Typography;
const { Option } = Select;

const EditProfileModal = ({ visible, onCancel, onSubmit, initialValues, loading, userRole }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);

    // Reset form when modal opens or closes
    useEffect(() => {
        if (visible) {
            // Common fields for all roles
            const commonFields = {
                firstName: initialValues?.firstName || '',
                lastName: initialValues?.lastName || '',
                phone: initialValues?.phone || '',
                address: initialValues?.address || '',
                city: initialValues?.city || '',
                state: initialValues?.state || '',
                country: initialValues?.country || '',
                zipCode: initialValues?.zipCode || ''
            };

            // Additional fields for company role
            const companyFields = userRole === 'client' ? {
                phoneCode: initialValues?.phoneCode || '',
                bankname: initialValues?.bankname || '',
                ifsc: initialValues?.ifsc || '',
                banklocation: initialValues?.banklocation || '',
                accountholder: initialValues?.accountholder || '',
                accountnumber: initialValues?.accountnumber || '',
                gstIn: initialValues?.gstIn || '',
                website: initialValues?.website || '',
                accounttype: initialValues?.accounttype || ''
            } : {};

            form.setFieldsValue({
                ...commonFields,
                ...companyFields
            });

            // Set profile picture if exists
            if (initialValues?.profilePic) {
                setFileList([{
                    uid: '-1',
                    name: 'profile-picture.png',
                    status: 'done',
                    url: initialValues.profilePic,
                }]);
            } else {
                setFileList([]);
            }
        }
    }, [visible, initialValues, form, userRole]);

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                // Create FormData for file upload
                const formData = new FormData();

                // Add text fields, including empty values
                Object.keys(values).forEach(key => {
                    if (key !== 'profilePic' && values[key] !== undefined) {
                        formData.append(key, values[key] || '');
                    }
                });

                // Check if there's a new profile picture to upload
                const hasNewProfilePic = fileList.length > 0 && fileList[0].originFileObj;

                // Add file if exists
                if (hasNewProfilePic) {
                    formData.append('profilePic', fileList[0].originFileObj);
                }

                onSubmit(formData);
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
        }

        return isImage && isLt2M;
    };

    const handleChange = ({ fileList }) => {
        const updatedFileList = fileList.map(file => {
            if (file.originFileObj && !file.name) {
                return {
                    ...file,
                    name: file.originFileObj.name
                };
            }
            return file;
        });

        setFileList(updatedFileList);
    };

    const uploadButton = (
        <div>
            <FiCamera style={{ fontSize: '18px', color: '#1890ff' }} />
        </div>
    );

    // Render company-specific fields
    const renderCompanyFields = () => {
        if (userRole !== 'client') return null;

        return (
            <>
                <Divider orientation="left">Company Details</Divider>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Form.Item name="website" label="Website">
                            <Input prefix={<FiGlobe />} placeholder="Company Website" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="gstIn" label="GST Number">
                            <Input prefix={<FiBriefcase />} placeholder="GST Number" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Bank Details</Divider>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Form.Item name="bankname" label="Bank Name">
                            <Input prefix={<FiCreditCard />} placeholder="Bank Name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="accountholder" label="Account Holder">
                            <Input prefix={<FiUser />} placeholder="Account Holder Name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="accountnumber" label="Account Number">
                            <Input prefix={<FiCreditCard />} placeholder="Account Number" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="ifsc" label="IFSC Code">
                            <Input prefix={<FiCreditCard />} placeholder="IFSC Code" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="banklocation" label="Bank Location">
                            <Input prefix={<FiMapPin />} placeholder="Bank Location" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="accounttype" label="Account Type">
                            <Select placeholder="Select Account Type">
                                <Option value="savings">Savings</Option>
                                <Option value="current">Current</Option>
                                <Option value="other">Other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </>
        );
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff'
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }
            }}
        >
            <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                padding: '24px',
                color: '#ffffff',
                position: 'relative'
            }}>
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: '#ffffff',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    <FiX style={{ fontSize: '20px' }} />
                </Button>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <FiUser style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            Edit Profile
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            Update your personal information
                        </Text>
                    </div>
                </div>
            </div>

            <div className="modal-content" style={{ padding: '24px' }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div className="upload-section" style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Form.Item name="profilePic" label="Profile Picture">
                            <Upload
                                name="profilePic"
                                listType="picture-circle"
                                className="avatar-uploader"
                                showUploadList={false}
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                maxCount={1}
                            >
                                {fileList.length > 0 ? (
                                    <img
                                        src={fileList[0].url || URL.createObjectURL(fileList[0].originFileObj)}
                                        alt="avatar"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                ) : uploadButton}
                            </Upload>
                        </Form.Item>
                    </div>

                    <Divider orientation="left">Personal Information</Divider>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item name="firstName" label="First Name">
                                <Input prefix={<FiUser />} placeholder="First Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="lastName" label="Last Name">
                                <Input prefix={<FiUser />} placeholder="Last Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone">
                                <Input prefix={<FiPhone />} placeholder="Phone Number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left">Address Information</Divider>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item name="address" label="Address">
                                <Input.TextArea placeholder="Full Address" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="city" label="City">
                                <Input prefix={<FiHome />} placeholder="City" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="state" label="State">
                                <Input prefix={<FiMap />} placeholder="State" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="country" label="Country">
                                <Input prefix={<FiGlobe />} placeholder="Country" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="zipCode" label="Zip Code">
                                <Input prefix={<FiMapPin />} placeholder="Zip Code" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {renderCompanyFields()}

                    <div style={{ textAlign: 'right', marginTop: '24px' }}>
                        <Button onClick={onCancel} style={{ marginRight: '12px' }}>
                            Cancel
                        </Button>
                        <Button type="primary" onClick={handleSubmit} loading={loading}>
                            Save Changes
                        </Button>
                    </div>
                </Form>
            </div>
        </Modal>
    );
};

export default EditProfileModal;
