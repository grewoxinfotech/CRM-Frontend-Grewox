import React, { useState } from 'react';
import { Layout, Menu, Button, Badge, Avatar, Typography } from 'antd';
import { FiEdit, FiInbox, FiStar, FiAlertCircle, FiSend, FiClock, FiTrash2, FiSettings, FiUser } from 'react-icons/fi';
import EmailSettingsModal from './EmailSettingsModal';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = ({ 
  selectedMenu, 
  setSelectedMenu, 
  unreadCount, 
  starredCount,
  importantCount,
  scheduledCount,
  trashCount,
  setComposeVisible,
  className
}) => {
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <Sider width={280} className={`mail-sider ${className || ''}`}>
      <div className="mail-filters">
        <div className="user-profile">
          <Avatar size={48} icon={<FiUser />} className="user-avatar" />
          <div className="user-info">
            <Text strong>John Doe</Text>
            <Text type="secondary">john.doe@example.com</Text>
          </div>
        </div>

        <Button
          type="primary"
          icon={<FiEdit />}
          size="large"
          block
          onClick={() => setComposeVisible(true)}
          className="compose-button"
        >
          Compose
        </Button>

        <Menu
          selectedKeys={[selectedMenu]}
          onClick={({ key }) => setSelectedMenu(key)}
          items={[
            {
              key: 'inbox',
              icon: <FiInbox />,
              label: 'Inbox',
              suffix: unreadCount > 0 && <Badge count={unreadCount} style={{ backgroundColor: '#4361ee' }} />
            },
            {
              key: 'starred',
              icon: <FiStar />,
              label: 'Starred',
              suffix: starredCount > 0 && <Badge count={starredCount} style={{ backgroundColor: '#fbbf24' }} />
            },
            {
              key: 'important',
              icon: <FiAlertCircle />,
              label: 'Important',
              suffix: importantCount > 0 && <Badge count={importantCount} style={{ backgroundColor: '#f87171' }} />
            },
            {
              key: 'sent',
              icon: <FiSend />,
              label: 'Sent'
            },
            {
              key: 'scheduled',
              icon: <FiClock />,
              label: 'Scheduled',
              suffix: scheduledCount > 0 && <Badge count={scheduledCount} style={{ backgroundColor: '#4cc9f0' }} />
            },
            {
              key: 'trash',
              icon: <FiTrash2 />,
              label: 'Trash',
              suffix: trashCount > 0 && <Badge count={trashCount} style={{ backgroundColor: '#64748b' }} />
            },
            {
              type: 'divider'
            },
            {
              key: 'settings',
              icon: <FiSettings />,
              label: 'Email Settings',
              onClick: () => setSettingsVisible(true)
            }
          ]}
        />
      </div>

      <EmailSettingsModal
        visible={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
      />
    </Sider>
  );
};

export default Sidebar;