import React from 'react';
import { Card, Avatar, Tag, Button, Dropdown, Menu } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiUserCheck, FiUser, FiEye, FiMail, FiCalendar, FiBriefcase, FiLogIn } from 'react-icons/fi';
import moment from 'moment';

const EmployeeCard = ({ employee, onEdit, onDelete, onView }) => {
    const getStatusColor = (status) => {
        const statusColors = {
            'active': {
                color: '#389E0D',
                bg: '#F6FFED',
                border: '#B7EB8F'
            },
            'inactive': {
                color: '#FF4D4F',
                bg: '#FFF1F0',
                border: '#FFA39E'
            },
            'pending': {
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
        return statusColors[status?.toLowerCase()] || statusColors.default;
    };

    const getInitials = (name) => {
        return name
            ? name.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : 'E';
    };

    const getActionMenu = (record) => (
        <Menu className="action-menu">
            <Menu.Item key="view" icon={<FiEye />} onClick={() => onView(record)}>
                View Details
            </Menu.Item>
            <Menu.Item key="edit" icon={<FiEdit2 />} onClick={() => onEdit(record)}>
                Edit Employee
            </Menu.Item>
            <Menu.Item key="status" icon={<FiUserCheck />}>
                Change Status
            </Menu.Item>
            <Menu.Item key="delete" icon={<FiTrash2 />} danger onClick={() => onDelete(record)}>
                Delete Employee
            </Menu.Item>
        </Menu>
    );

    const statusStyle = getStatusColor(employee.status);

    return (
        <Card
            className="employee-card modern-card"
            bordered={false}
            style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03)',
                height: '100%',
                position: 'relative'
            }}
            actions={[
                <Button
                    type="primary"
                    icon={<FiLogIn />}
                    className="login-as-button"
                    block
                    onClick={() => console.log('Login as', employee.name)}
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
                        fontWeight: '500'
                    }}
                >
                    Login as Employee
                </Button>
            ]}
        >
            <div className="card-top-pattern" />

            <div className="employee-card-header">
                <div className="employee-main-info">
                    <Avatar
                        size={56}
                        src={employee.profilePic}
                        icon={!employee.profilePic && <FiUser />}
                        className="employee-avatar"
                        style={{
                            backgroundColor: !employee.profilePic ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                        }}
                    >
                        {!employee.profilePic && getInitials(employee.name)}
                    </Avatar>
                    <div className="employee-info">
                        <h3>{employee.name}</h3>
                        <div className="status-wrapper">
                            <div
                                className="status-indicator"
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: statusStyle.color,
                                    boxShadow: `0 0 8px ${statusStyle.color}`
                                }}
                            />
                            <Tag
                                style={{
                                    textTransform: 'capitalize',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    margin: 0,
                                    background: statusStyle.bg,
                                    border: `1px solid ${statusStyle.border}`,
                                    color: statusStyle.color,
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FiUserCheck size={12} />
                                {employee.status || 'N/A'}
                            </Tag>
                        </div>
                    </div>
                </div>
                <Dropdown
                    overlay={getActionMenu(employee)}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                    />
                </Dropdown>
            </div>

            <div className="employee-details">
                <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <span className="detail-text">{employee.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <FiCalendar className="detail-icon" />
                    <div className="date-cell">
                        <span className="date">
                            {moment(employee.created_at).format('MMM DD, YYYY')}
                        </span>
                        <span className="time">
                            {moment(employee.created_at).format('h:mm A')}
                        </span>
                    </div>
                </div>
                {employee.updated_at && (
                    <div className="detail-item">
                        <FiCalendar className="detail-icon" />
                        <div className="date-cell">
                            <span className="date">
                                {moment(employee.updated_at).format('MMM DD, YYYY')}
                            </span>
                            <span className="time">
                                {moment(employee.updated_at).format('h:mm A')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default EmployeeCard; 