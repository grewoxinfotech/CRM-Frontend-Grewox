import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Card,
    Typography,
    Divider,
    Row,
    Col,
    Badge,
    Button,
    message,
} from 'antd';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiHome,
    FiMapPin,
    FiShield,
    FiSettings,
    FiMap,
    FiGlobe,
} from 'react-icons/fi';
import { selectCurrentUser, selectUserRole } from '../../../auth/services/authSlice';
import { useUpdateUserMutation } from '../user-management/users/services/userApi';
import './profile.scss';
import EditProfileModal from './EditProfileModal';
import EditCompanyWrapper from './EditCompanyWrapper';
import PageHeader from '../../../components/PageHeader';

const { Title, Text } = Typography;

const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatRole = (role) => {
    if (!role || typeof role !== 'string') return 'User';
    if (role === 'client') return 'Company';
    return role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const getUserFullName = (user) => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    return user?.username || 'User';
};

const Profile = () => {
    const user = useSelector(selectCurrentUser);
    const userRole = useSelector(selectUserRole);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

    const handleSubmitEdit = async (formData) => {
        try {
            await updateUser({ id: user.id, data: formData }).unwrap();
            message.success('Profile updated successfully');
            setIsEditModalVisible(false);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <div className="profile-page standard-page-container">
            <PageHeader
                title="My Profile"
                subtitle="View and manage your account information"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Profile" },
                ]}
                extraActions={[
                    <Button key="edit" type="primary" icon={<FiSettings />} onClick={() => setIsEditModalVisible(true)}>
                        Edit Profile
                    </Button>
                ]}
            />

            <Card className="standard-content-card profile-details-card">
                <div className="profile-header-standard">
                    <div className="profile-avatar-wrapper">
                        <Badge dot status="success" offset={[-5, 35]}>
                            <div className="profile-avatar-circle">
                                {user?.profilePic ? (
                                    <img src={user.profilePic} alt={getUserFullName(user)} />
                                ) : (
                                    <div className="avatar-initials-large">{getInitials(getUserFullName(user))}</div>
                                )}
                            </div>
                        </Badge>
                    </div>
                    <div className="profile-main-info">
                        <Title level={3} style={{ margin: 0 }}>{getUserFullName(user)}</Title>
                        <Text type="secondary">@{user?.username || 'user'}</Text>
                        <div className="role-tag-premium">
                            <FiShield size={12} />
                            {formatRole(userRole)}
                        </div>
                    </div>
                </div>

                <Divider style={{ margin: '24px 0' }} />

                <div className="profile-info-grid">
                    <div className="info-group">
                        <Title level={5} className="group-title">Personal Information</Title>
                        <Row gutter={[24, 16]}>
                            <Col xs={24} sm={12}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiUser /> First Name</Text>
                                    <Text strong className="detail-value">{user?.firstName || 'Not provided'}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiUser /> Last Name</Text>
                                    <Text strong className="detail-value">{user?.lastName || 'Not provided'}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiMail /> Email</Text>
                                    <Text strong className="detail-value">{user?.email}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiPhone /> Phone</Text>
                                    <Text strong className="detail-value">{user?.phone || 'Not provided'}</Text>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <Divider style={{ margin: '24px 0' }} />

                    <div className="info-group">
                        <Title level={5} className="group-title">Additional Information</Title>
                        <Row gutter={[24, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiMapPin /> Address</Text>
                                    <Text strong className="detail-value">{user?.address || 'Not provided'}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiHome /> City</Text>
                                    <Text strong className="detail-value">{user?.city || 'Not provided'}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiMap /> State</Text>
                                    <Text strong className="detail-value">{user?.state || 'Not provided'}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiGlobe /> Country</Text>
                                    <Text strong className="detail-value">{user?.country || 'Not provided'}</Text>
                                </div>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <div className="info-detail-item">
                                    <Text type="secondary" className="detail-label"><FiMapPin /> Zip Code</Text>
                                    <Text strong className="detail-value">{user?.zipCode || 'Not provided'}</Text>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Card>

            {userRole === 'client' ? (
                <EditCompanyWrapper
                    visible={isEditModalVisible}
                    onCancel={() => setIsEditModalVisible(false)}
                    initialValues={user}
                    loading={false}
                />
            ) : (
                <EditProfileModal
                    visible={isEditModalVisible}
                    onCancel={() => setIsEditModalVisible(false)}
                    onSubmit={handleSubmitEdit}
                    initialValues={user}
                    loading={isUpdatingUser}
                    userRole={userRole}
                />
            )}
        </div>
    );
};

export default Profile;
