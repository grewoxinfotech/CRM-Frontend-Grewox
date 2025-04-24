import React, { useState } from 'react';
import { List, Avatar, Space, Button, Tooltip, Modal, Typography, Divider, message, Tag, Row, Col } from 'antd';
import { FiStar, FiAlertCircle, FiTrash2, FiCornerUpLeft, FiPaperclip, FiDownload, FiFile, FiMail, FiUser, FiClock, FiX } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text, Title, Paragraph } = Typography;

const EmailList = ({ 
  emails, 
  handleStarEmail, 
  handleImportant, 
  handleDelete, 
  handleRestore 
}) => {
  const [selectedEmail, setSelectedEmail] = useState(null);

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

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleCloseModal = () => {
    setSelectedEmail(null);
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error('Failed to download attachment');
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'file'; // Default icon if no filename

    try {
      const extension = fileName.split('.').pop().toLowerCase();
      switch (extension) {
        case 'pdf':
          return 'pdf';
        case 'doc':
        case 'docx':
          return 'word';
        case 'xls':
        case 'xlsx':
          return 'excel';
        case 'jpg':
        case 'jpeg':
        case 'png':
          return 'image';
        default:
          return 'file';
      }
    } catch (error) {
      console.error('Error getting file icon:', error);
      return 'file'; // Return default icon if there's an error
    }
  };

  return (
    <>
      <List
        className="mail-list"
        dataSource={emails}
        renderItem={(email) => (
          <List.Item
            className={`mail-item ${email.isRead ? '' : 'unread'} ${email.type === 'trash' ? 'trash' : ''}`}
            actions={[renderEmailActions(email)]}
            onClick={() => handleEmailClick(email)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              avatar={
                <Avatar src={`https://ui-avatars.com/api/?name=${encodeURIComponent(email.from)}&background=1890ff&color=fff`} />
              }
              title={
                <Space size={16}>
                  <Text strong={!email.isRead}>{email.subject}</Text>
                  {email.attachments && email.attachments !== '[]' && (() => {
                    try {
                      // Parse double stringified JSON
                      const firstParse = JSON.parse(email.attachments);
                      const attachments = JSON.parse(firstParse);
                      
                      return (
                        <Space>
                          <FiPaperclip style={{ color: '#8c8c8c' }} />
                          {attachments.map((attachment, index) => (
                            <Text
                              key={index}
                              type="secondary"
                              style={{ cursor: 'pointer', fontSize: '12px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(attachment.url, '_blank');
                              }}
                            >
                              {attachment.name}
                            </Text>
                          ))}
                        </Space>
                      );
                    } catch (error) {
                      console.error('Error parsing attachments:', error);
                      return <FiPaperclip style={{ color: '#8c8c8c' }} />;
                    }
                  })()}
                </Space>
              }
              description={
                <div className="mail-item-content">
                  <Space>
                    <Text type="secondary">{email.from}</Text>
                    <Text type="secondary">→</Text>
                    <Text type="secondary">{email.to}</Text>
                  </Space>
                  <Text type="secondary" className="mail-date">
                    {dayjs(email.createdAt).format('MMM D, YYYY h:mm A')}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />

      <Modal
        title={
          <div className="email-modal-header">
            <div className="email-modal-title">
              <FiMail className="header-icon" />
              <span>Email Details</span>
            </div>
            <Button 
              type="text" 
              // icon={<FiX />} 
              onClick={handleCloseModal}
              className="close-button"
            />
          </div>
        }
        open={!!selectedEmail}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        className="email-view-modal"
        bodyStyle={{ padding: '0' }}
        centered
      >
        {selectedEmail && (
          <div className="email-view">
            <div className="email-header">
              <Title level={4} className="email-subject">{selectedEmail.subject}</Title>
              <div className="email-tags">
                {selectedEmail.isStarred && <Tag color="gold" icon={<FiStar />}>Starred</Tag>}
                {selectedEmail.isImportant && <Tag color="red" icon={<FiAlertCircle />}>Important</Tag>}
                {selectedEmail.type === 'trash' && <Tag color="default" icon={<FiTrash2 />}>Trash</Tag>}
              </div>
            </div>
            
            <div className="email-meta">
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="meta-item">
                    <FiUser className="meta-icon" />
                    <div className="meta-content">
                      <Text type="secondary">From:</Text>
                      <Text strong>{selectedEmail.from}</Text>
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="meta-item">
                    <FiMail className="meta-icon" />
                    <div className="meta-content">
                      <Text type="secondary">To:</Text>
                      <Text strong>{selectedEmail.to}</Text>
                    </div>
                  </div>
                </Col>
                <Col span={24}>
                  <div className="meta-item">
                    <FiClock className="meta-icon" />
                    <div className="meta-content">
                      <Text type="secondary">Date:</Text>
                      <Text>{dayjs(selectedEmail.createdAt).format('dddd, MMMM D, YYYY h:mm A')}</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            
            <Divider className="email-divider" />
            
            <div className="email-content-container">
              <div 
                className="email-content"
                dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
              />
            </div>
            
            {selectedEmail.attachments && selectedEmail.attachments !== '[]' && (
              <>
                <Divider className="email-divider" />
                <div className="email-attachments">
                  <Title level={5} className="attachments-title">
                    <FiPaperclip className="attachments-icon" />
                    Attachments
                  </Title>
                  <div className="attachments-list">
                    {(() => {
                      try {
                        // Parse double stringified JSON
                        const firstParse = JSON.parse(selectedEmail.attachments);
                        const attachments = JSON.parse(firstParse);
                        
                        if (!Array.isArray(attachments)) {
                          console.error('Attachments is not an array:', attachments);
                          return null;
                        }

                        return attachments.map((attachment, index) => (
                          <div key={index} className="attachment-item">
                            <div className="attachment-content">
                              <FiFile className={`file-icon ${getFileIcon(attachment.name)}`} />
                              <div className="attachment-info">
                                <Text strong className="attachment-name">
                                  {attachment.name}
                                </Text>
                                {attachment.size && (
                                  <Text type="secondary" className="file-size">
                                    {(attachment.size / 1024).toFixed(1)} KB
                                  </Text>
                                )}
                              </div>
                            </div>
                            <Button
                              type="primary"
                              icon={<FiDownload />}
                              size="small"
                              onClick={() => handleDownloadAttachment(attachment)}
                              className="download-button"
                            >
                              Download
                            </Button>
                          </div>
                        ));
                      } catch (error) {
                        console.error('Error parsing attachments:', error);
                        return null;
                      }
                    })()}
                  </div>
                </div>
              </>
            )}
            
            <div className="email-actions">
              <Space>
                {/* <Button 
                  type="primary" 
                  icon={<FiMail />}
                  className="reply-button"
                >
                  Reply
                </Button> */}
                <Button 
                  icon={<FiStar />}
                  className={selectedEmail.isStarred ? 'starred' : ''}
                  onClick={() => handleStarEmail(selectedEmail)}
                >
                  {selectedEmail.isStarred ? 'Unstar' : 'Star'}
                </Button>
                <Button 
                  icon={<FiAlertCircle />}
                  className={selectedEmail.isImportant ? 'important' : ''}
                  onClick={() => handleImportant(selectedEmail)}
                >
                  {selectedEmail.isImportant ? 'Not Important' : 'Mark as Important'}
                </Button>
                <Button 
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => handleDelete(selectedEmail)}
                >
                  Delete
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .email-view {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .email-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: linear-gradient(135deg, #4361ee, #4895ef);
          color: white;
          border-radius: 8px 8px 0 0;
        }
        .email-modal-title {
          display: flex;
          align-items: center;
        }
        .header-icon {
          margin-right: 12px;
          font-size: 20px;
        }
        .close-button {
          color: white;
          font-size: 18px;
        }
        .email-header {
          padding: 24px 24px 16px;
        }
        .email-subject {
          margin-bottom: 8px;
          color: #333;
        }
        .email-tags {
          margin-bottom: 16px;
        }
        .email-meta {
          padding: 0 24px;
        }
        .meta-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .meta-icon {
          color: #8c8c8c;
          margin-right: 12px;
          margin-top: 4px;
          font-size: 16px;
        }
        .meta-content {
          display: flex;
          flex-direction: column;
        }
        .email-divider {
          margin: 16px 0;
        }
        .email-content-container {
          padding: 0 24px;
          flex: 1;
          overflow-y: auto;
          max-height: 400px;
        }
        .email-content {
          white-space: pre-wrap;
          line-height: 1.6;
        }
        .email-attachments {
          padding: 0 24px 24px;
        }
        .attachments-title {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .attachments-icon {
          margin-right: 8px;
          color: #4361ee;
        }
        .attachments-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .attachment-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-radius: 4px;
          background-color: #f8f9fa;
          border: 1px solid #e8e8e8;
        }
        .attachment-content {
          display: flex;
          align-items: center;
        }
        .attachment-info {
          margin-left: 12px;
          display: flex;
          flex-direction: column;
        }
        .attachment-name {
          font-weight: 500;
        }
        .file-size {
          font-size: 12px;
        }
        .file-icon {
          font-size: 20px;
        }
        .file-icon.pdf {
          color: #ff4d4f;
        }
        .file-icon.word {
          color: #1890ff;
        }
        .file-icon.excel {
          color: #52c41a;
        }
        .file-icon.image {
          color: #722ed1;
        }
        .download-button {
          background: linear-gradient(135deg, #4361ee, #4895ef);
          border: none;
        }
        .email-actions {
          padding: 16px 24px;
          background-color: #f8f9fa;
          border-top: 1px solid #e8e8e8;
          display: flex;
          justify-content: flex-end;
        }
        .reply-button {
          background: linear-gradient(135deg, #4361ee, #4895ef);
          border: none;
        }
        .starred {
          color: #fbbf24;
        }
        .important {
          color: #f87171;
        }
      `}</style>
    </>
  );
};

export default EmailList;