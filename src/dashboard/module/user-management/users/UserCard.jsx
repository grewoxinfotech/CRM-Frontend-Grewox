import React from 'react';
import { Card, Avatar, Tag, Button, Dropdown, Menu, message } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiUserCheck, FiLock, FiUser, FiUsers, FiEye, FiMail, FiCalendar, FiLogIn } from 'react-icons/fi';
import moment from 'moment';
import { useAdminLoginMutation } from '../../../../auth/services/authApi';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user, onEdit, onDelete, onView }) => {
    const navigate = useNavigate();
    const [adminLogin] = useAdminLoginMutation();

    const getRoleColor = (role) => {
        const roleColors = {
            'super-admin': {
                color: '#531CAD',
                bg: '#F9F0FF',
                border: '#D3ADF7'
            },
            'client': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE'
            },
            'sub-client': {
                color: '#389E0D',
                bg: '#F6FFED',
                border: '#B7EB8F'
            },
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591'
            },
            'default': {
                color: '#595959',
                bg: '#FAFAFA',
                border: '#D9D9D9'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const getInitials = (username) => {
        return username
            ? username.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : 'U';
    };

    const handleAdminLogin = async () => {
        try {
            const response = await adminLogin({
                email: user.email,
                isClientPage: true
            }).unwrap();

            if (response.success) {
                message.success('Logged in as user successfully');
                navigate('/dashboard');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to login as user');
        }
    };

    const getActionMenu = (record) => (
        <Menu className="action-menu">
            <Menu.Item key="view" icon={<FiEye />} onClick={() => onView(record)}>
                View Details
            </Menu.Item>
            <Menu.Item key="edit" icon={<FiEdit2 />} onClick={() => onEdit(record)}>
                Edit User
            </Menu.Item>
            <Menu.Item key="resetPassword" icon={<FiLock />}>
                Reset Password
            </Menu.Item>
            <Menu.Item key="status" icon={<FiUserCheck />}>
                Change Status
            </Menu.Item>
            {user.role_name !== 'Super Admin' && (
                <Menu.Item key="delete" icon={<FiTrash2 />} danger onClick={() => onDelete(record)}>
                    Delete User
                </Menu.Item>
            )}
        </Menu>
    );

    const roleStyle = getRoleColor(user.role_name);

    const getLoginButtonText = (roleName) => {
        if (!roleName) return 'Login as User';
        const formattedRole = roleName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        return `Login as ${formattedRole}`;
    };

    return (
        <Card
            className="user-card modern-card"
            bordered={false}
            style={{
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                height: '100%',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
            bodyStyle={{
                padding: '20px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}
            actions={[
                <Button
                    type="primary"
                    icon={<FiLogIn />}
                    className="login-as-button"
                    block
                    onClick={handleAdminLogin}
                    style={{
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        height: '40px',
                        borderRadius: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        margin: '0 1px'
                    }}
                >
                    {getLoginButtonText(user.role_name)}
                </Button>
            ]}
        >
            <div className="user-card-header" style={{ marginBottom: '16px' }}>
                <div className="user-main-info" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Avatar
                        size={56}
                        src={user.profilePic}
                        icon={!user.profilePic && <FiUser />}
                        className="user-avatar"
                        style={{
                            backgroundColor: !user.profilePic ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            flexShrink: 0
                        }}
                    >
                        {!user.profilePic && getInitials(user.username)}
                    </Avatar>
                    <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                            margin: '0 0 8px 0',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {user.username}
                        </h3>
                        <div className="role-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                className="role-indicator"
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: roleStyle.color,
                                    boxShadow: `0 0 8px ${roleStyle.color}`,
                                    flexShrink: 0
                                }}
                            />
                            <Tag
                                style={{
                                    textTransform: 'capitalize',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    margin: 0,
                                    background: roleStyle.bg,
                                    border: `1px solid ${roleStyle.border}`,
                                    color: roleStyle.color,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    maxWidth: 'calc(100% - 16px)',
                                    overflow: 'hidden'
                                }}
                            >
                                <FiUsers size={12} style={{ flexShrink: 0 }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.role_name || 'N/A'}
                                </span>
                            </Tag>
                        </div>
                    </div>
                </div>
                <Dropdown
                    overlay={getActionMenu(user)}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            height: '32px',
                            width: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            color: '#6b7280'
                        }}
                    />
                </Dropdown>
            </div>

            <div className="user-card-content" style={{ flex: 1 }}>
                <div className="user-details" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiMail style={{ color: '#6b7280', fontSize: '16px' }} />
                        <span style={{
                            color: '#374151',
                            fontSize: '14px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {user.email}
                        </span>
                    </div>
                    <div className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar style={{ color: '#6b7280', fontSize: '16px' }} />
                        <span style={{ color: '#374151', fontSize: '14px' }}>
                            {moment(user.created_at).format('MMM DD, YYYY')}
                        </span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default UserCard; 