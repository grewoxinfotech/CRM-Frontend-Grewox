import React from 'react';
import { Input, Button, Tooltip, Spin, Typography, Badge } from 'antd';
import { FiSearch, FiRefreshCw, FiInbox, FiStar, FiAlertCircle, FiSend, FiClock, FiTrash2 } from 'react-icons/fi';

const { Text, Title } = Typography;

const MailHeader = ({ searchText, setSearchText, onRefresh, isRefreshing, selectedMenu }) => {
  const getMenuTitle = () => {
    switch (selectedMenu) {
      case 'inbox':
        return 'Inbox';
      case 'starred':
        return 'Starred';
      case 'important':
        return 'Important';
      case 'sent':
        return 'Sent';
      case 'scheduled':
        return 'Scheduled';
      case 'trash':
        return 'Trash';
      default:
        return 'Inbox';
    }
  };

  const getMenuIcon = () => {
    switch (selectedMenu) {
      case 'inbox':
        return <FiInbox />;
      case 'starred':
        return <FiStar />;
      case 'important':
        return <FiAlertCircle />;
      case 'sent':
        return <FiSend />;
      case 'scheduled':
        return <FiClock />;
      case 'trash':
        return <FiTrash2 />;
      default:
        return <FiInbox />;
    }
  };
  return (
    <div className="mail-header">
      <div className="header-title">
        <div className="title-icon">
          {getMenuIcon()}
        </div>
        <Title level={4} style={{ margin: 0 }}>{getMenuTitle()}</Title>
      </div>

      <div className="search-wrapper">
        <Input
          prefix={<FiSearch />}
          placeholder="Search in emails..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="header-actions">
        <Tooltip title="Refresh">
          <Button 
            icon={<FiRefreshCw className={isRefreshing ? 'spin' : ''} />} 
            onClick={onRefresh}
            loading={isRefreshing}
          />
        </Tooltip>
      </div>

      <style jsx>{`
        .spin {
          animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MailHeader;