import React from 'react';
import { List, Avatar, Space, Button, Tooltip } from 'antd';
import { FiStar, FiAlertCircle, FiTrash2, FiCornerUpLeft } from 'react-icons/fi';
import dayjs from 'dayjs';

const EmailList = ({ 
  emails, 
  handleStarEmail, 
  handleImportant, 
  handleDelete, 
  handleRestore 
}) => {
  const renderEmailActions = (email) => {
    if (email.type === 'trash') {
      return (
        <Space>
          <Tooltip title="Restore">
            <Button
              icon={<FiCornerUpLeft />}
              className="restore-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleRestore(email);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete permanently">
            <Button
              danger
              icon={<FiTrash2 />}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(email);
              }}
            />
          </Tooltip>
        </Space>
      );
    }

    return (
      <Space>
        <Tooltip title={email.isStarred ? 'Unstar' : 'Star'}>
          <Button
            icon={<FiStar />}
            className={email.isStarred ? 'starred' : ''}
            onClick={(e) => {
              e.stopPropagation();
              handleStarEmail(email);
            }}
          />
        </Tooltip>
        <Tooltip title={email.isImportant ? 'Not important' : 'Mark as important'}>
          <Button
            icon={<FiAlertCircle />}
            className={email.isImportant ? 'important' : ''}
            onClick={(e) => {
              e.stopPropagation();
              handleImportant(email);
            }}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <Button
            icon={<FiTrash2 />}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(email);
            }}
          />
        </Tooltip>
      </Space>
    );
  };

  return (
    <List
      className="mail-list"
      dataSource={emails}
      renderItem={(email) => (
        <List.Item
          className={`mail-item ${email.isRead ? '' : 'unread'} ${email.type === 'trash' ? 'trash' : ''}`}
          actions={[renderEmailActions(email)]}
        >
          <List.Item.Meta
            avatar={
              <Avatar src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.to)}&background=1890ff&color=fff`} />
            }
            title={email.subject}
            description={
              <div className="mail-item-content">
                <span>{email.to}</span>
                <span className="mail-date">{dayjs(email.createdAt).format('MMM D')}</span>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );
};

export default EmailList;