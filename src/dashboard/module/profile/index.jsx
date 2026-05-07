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
            />

            <Card className="standard-content-card profile-details-card">
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar-container">
                            <Badge dot status="success" className="status-badge">
                                <div className="profile-avatar">
                                    {user?.profilePic ? (
                                        <img src={user.profilePic} alt={getUserFullName(user)} />
                                    ) : (
                                        <div className="avatar-initials">{getInitials(getUserFullName(user))}</div>
                                    )}
                                </div>
                            </Badge>
                        </div>
                        <div className="profile-title">
                            <Title level={3} style={{ textTransform: 'capitalize' }}>{getUserFullName(user)}</Title>
                            <span className="username">@{user?.username || 'user'}</span>
                            <div className="role-badge">
                                <FiShield size={12} />
                                {formatRole(userRole)}
                            </div>
                        </div>
                    </div>
                    <div className="profile-actions">
                        <Button type="primary" icon={<FiSettings />} onClick={() => setIsEditModalVisible(true)}>
                            Edit Profile
                        </Button>
                    </div>
                </div>

                <div className="profile-info-section">
                    <Title level={4}>Personal Information</Title>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} md={6}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiUser className="info-icon" />
                                    <Text>First Name</Text>
                                </div>
                                <Text strong>{user?.firstName || 'Not provided'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiUser className="info-icon" />
                                    <Text>Last Name</Text>
                                </div>
                                <Text strong>{user?.lastName || 'Not provided'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiMail className="info-icon" />
                                    <Text>Email</Text>
                                </div>
                                <Text strong>{user?.email || 'Not provided'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiPhone className="info-icon" />
                                    <Text>Phone</Text>
                                </div>
                                <Text strong>{user?.phone || 'Not provided'}</Text>
                            </div>
                        </Col>
                    </Row>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div className="profile-info-section">
                    <Title level={4}>Additional Information</Title>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={12} md={8}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiMapPin className="info-icon" />
                                    <Text>Address</Text>
                                </div>
                                <Text strong>{user?.address || 'Not provided'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiHome className="info-icon" />
                                    <Text>City</Text>
                                </div>
                                <Text strong>{user?.city || 'Not provided'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiMap className="info-icon" />
                                    <Text>State</Text>
                                </div>
                                <Text strong>{user?.state || 'Not provided'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiGlobe className="info-icon" />
                                    <Text>Country</Text>
                                </div>
                                <Text strong>{user?.country || 'Not provided'}</Text>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="info-item">
                                <div className="info-label">
                                    <FiMapPin className="info-icon" />
                                    <Text>Zip Code</Text>
                                </div>
                                <Text strong>{user?.zipCode || 'Not provided'}</Text>
                            </div>
                        </Col>
                    </Row>
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
