import React, { useState, useRef } from 'react';
import { Input, Badge, Dropdown, Avatar, Tooltip, Space } from 'antd';
import {
    FiBell,
    FiSearch,
    FiUser,
    FiSettings,
    FiHelpCircle,
    FiLogOut,
    FiMail
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import './header.scss';

const Header = () => {
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const [showSearch, setShowSearch] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(3);
    const [unreadMails, setUnreadMails] = useState(5);
    const user = useSelector(selectCurrentUser);

    const userMenuItems = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <FiUser />
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <FiSettings />
        },
        {
            key: 'help',
            label: 'Help & Support',
            icon: <FiHelpCircle />
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <FiLogOut />,
            danger: true
        }
    ];

    const searchInputRef = useRef(null);
    const searchButtonRef = useRef(null);
    const notificationButtonRef = useRef(null);
    const mailButtonRef = useRef(null);
    const userButtonRef = useRef(null);

    return (
        <header className="superadmin-header">
            <div className="header-left">
                <h1>Super Admin</h1>
            </div>

            <div className="header-right">
                {showSearch && (
                    <div className="search-container">
                        <Input
                            ref={searchInputRef}
                            prefix={<FiSearch />}
                            placeholder="Search..."
                            className="search-input"
                            autoFocus
                        />
                    </div>
                )}

                <Space className="header-actions" size={16}>
                    <Tooltip title="Search" mouseEnterDelay={0.5}>
                        <button
                            ref={searchButtonRef}
                            className={`action-btn ${showSearch ? 'active' : ''}`}
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <FiSearch />
                        </button>
                    </Tooltip>

                    <Tooltip title="Notifications" mouseEnterDelay={0.5}>
                        <Badge count={unreadNotifications}>
                            <button
                                ref={notificationButtonRef}
                                className="action-btn"
                                onClick={() => setUnreadNotifications(0)}
                            >
                                <FiBell />
                            </button>
                        </Badge>
                    </Tooltip>

                    <Tooltip title="Messages" mouseEnterDelay={0.5}>
                        <Badge count={unreadMails}>
                            <button
                                ref={mailButtonRef}
                                className="action-btn"
                                onClick={() => setUnreadMails(0)}
                            >
                                <FiMail />
                            </button>
                        </Badge>
                    </Tooltip>

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                    >
                        <div ref={userButtonRef} className="user-avatar">
                            <Avatar>{user?.name ? getInitials(user.name) : 'U'}</Avatar>
                        </div>
                    </Dropdown>
                </Space>
            </div>
        </header>
    );
};

export default Header;