import React, { useState, useEffect } from "react";
import {
  List,
  Avatar,
  Space,
  Button,
  Tooltip,
  Modal,
  Typography,
  Divider,
  message,
  Tag,
  Row,
  Col,
  Dropdown,
} from "antd";
import {
  FiStar,
  FiAlertCircle,
  FiTrash2,
  FiCornerUpLeft,
  FiPaperclip,
  FiDownload,
  FiFile,
  FiMail,
  FiUser,
  FiClock,
  FiX,
  FiUsers,
  FiCalendar,
  FiFileText,
  FiImage,
  FiMoreVertical,
} from "react-icons/fi";
import dayjs from "dayjs";

const { Text, Title, Paragraph } = Typography;

const EmailList = ({
  emails,
  handleStarEmail,
  handleImportant,
  handleDelete,
  handleRestore,
}) => {
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderEmailActions = (email) => {
    // Desktop and Mobile view will now be same
    if (email.type === "trash") {
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
      <Space size={isMobile ? 4 : 8}>
        <Tooltip title={email.isStarred ? "Unstar" : "Star"}>
          <Button
            icon={<FiStar />}
            className={email.isStarred ? "starred" : ""}
            onClick={(e) => {
              e.stopPropagation();
              handleStarEmail(email);
            }}
          />
        </Tooltip>
        <Tooltip title={email.isImportant ? "Not important" : "Mark as important"}>
          <Button
            icon={<FiAlertCircle />}
            className={email.isImportant ? "important" : ""}
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
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error("Failed to download attachment");
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "file"; // Default icon if no filename

    try {
      const extension = fileName.split(".").pop().toLowerCase();
      switch (extension) {
        case "pdf":
          return "pdf";
        case "doc":
        case "docx":
          return "word";
        case "xls":
        case "xlsx":
          return "excel";
        case "jpg":
        case "jpeg":
        case "png":
          return "image";
        default:
          return "file";
      }
    } catch (error) {
      console.error("Error getting file icon:", error);
      return "file"; // Return default icon if there's an error
    }
  };

  return (
    <>
      <List
        className="mail-list"
        dataSource={emails}
        renderItem={(email) => (
          <List.Item
            className={`mail-item ${email.isRead ? "" : "unread"} ${
              email.type === "trash" ? "trash" : ""
            }`}
            actions={[renderEmailActions(email)]}
            onClick={() => handleEmailClick(email)}
            style={{ cursor: "pointer" }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    email.from
                  )}&background=1890ff&color=fff`}
                />
              }
              title={
                <Space size={16}>
                  <Text strong={!email.isRead}>{email.subject}</Text>
                  {email.attachments &&
                    email.attachments !== "[]" &&
                    (() => {
                      try {
                        // Parse double stringified JSON
                        const firstParse = JSON.parse(email.attachments);
                        const attachments = JSON.parse(firstParse);

                        return (
                          <Space>
                            <FiPaperclip style={{ color: "#8c8c8c" }} />
                            {attachments.map((attachment, index) => (
                              <Text
                                key={index}
                                type="secondary"
                                style={{ cursor: "pointer", fontSize: "12px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(attachment.url, "_blank");
                                }}
                              >
                                {attachment.name}
                              </Text>
                            ))}
                          </Space>
                        );
                      } catch (error) {
                        console.error("Error parsing attachments:", error);
                        return <FiPaperclip style={{ color: "#8c8c8c" }} />;
                      }
                    })()}
                </Space>
              }
              description={
                <div className="mail-item-content">
                  <div className="mail-details">
                    <div className="mail-addresses">
                      <Space direction={isMobile ? "vertical" : "horizontal"} size={isMobile ? 4 : 8} style={{ width: '100%' }}>
                        <Text type="secondary">{email.from}</Text>
                        {!isMobile && <Text type="secondary">→</Text>}
                        <Text type="secondary">{email.to}</Text>
                      </Space>
                    </div>
                    <div className="mail-datetime">
                      <Text type="secondary" className="mail-date">
                        {dayjs(email.createdAt).format("MMM D, YYYY")}
                      </Text>
                      <Text type="secondary" className="mail-time">
                        {dayjs(email.createdAt).format("h:mm A")}
                      </Text>
                    </div>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
      <Modal
        title={null}
        open={!!selectedEmail}
        onCancel={handleCloseModal}
        footer={null}
        width={720}
        destroyOnClose={true}
        centered
        closeIcon={null}
        className="pro-modal custom-modal"
        style={{
          "--antd-arrow-background-color": "#ffffff",
        }}
        styles={{
          body: {
            padding: 0,
            borderRadius: "8px",
            overflow: "hidden",
          },
        }}
      >
        {selectedEmail && (
          <>
            <div
              className="modal-header"
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                padding: "24px",
                color: "#ffffff",
                position: "relative",
              }}
            >
              <Button
                type="text"
                onClick={handleCloseModal}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  color: "#ffffff",
                  width: "32px",
                  height: "32px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                <FiX style={{ fontSize: "20px" }} />
              </Button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.2)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiMail style={{ fontSize: "24px", color: "#ffffff" }} />
                </div>
                <div>
                  <h2
                    style={{
                      margin: "0",
                      fontSize: "24px",
                      fontWeight: "600",
                      color: "#ffffff",
                    }}
                  >
                    {selectedEmail.subject}
                  </h2>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "rgba(255, 255, 255, 0.85)",
                    }}
                  >
                    View email details
                  </Text>
                </div>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    marginBottom: "12px",
                    border: "1px solid #e6e8eb",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#e6f4ff",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "16px",
                    }}
                  >
                    <FiUser style={{ fontSize: "20px", color: "#1890ff" }} />
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      From
                    </div>
                    <div
                      style={{
                        color: "#1e293b",
                        fontWeight: "500",
                        fontSize: "15px",
                      }}
                    >
                      {selectedEmail.from}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    marginBottom: "12px",
                    border: "1px solid #e6e8eb",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#e6f4ff",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "16px",
                    }}
                  >
                    <FiUsers style={{ fontSize: "20px", color: "#1890ff" }} />
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      To
                    </div>
                    <div
                      style={{
                        color: "#1e293b",
                        fontWeight: "500",
                        fontSize: "15px",
                      }}
                    >
                      {selectedEmail.to}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e6e8eb",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      background: "#e6f4ff",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "16px",
                    }}
                  >
                    <FiCalendar
                      style={{ fontSize: "20px", color: "#1890ff" }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Date
                    </div>
                    <div
                      style={{
                        color: "#1e293b",
                        fontWeight: "500",
                        fontSize: "15px",
                      }}
                    >
                      {dayjs(selectedEmail.createdAt).format(
                        "dddd, MMMM D, YYYY h:mm A"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#fff",
                  padding: "24px",
                  borderRadius: "10px",
                  border: "1px solid #e6e8eb",
                  marginBottom: "24px",
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
              </div>

              {selectedEmail.attachments &&
                selectedEmail.attachments !== "[]" && (
                  <div>
                    <div
                      style={{
                        marginBottom: "16px",
                        fontWeight: "500",
                        color: "#1e293b",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <FiPaperclip style={{ color: "#1890ff" }} />
                      Attachments
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gap: "16px",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(200px, 1fr))",
                      }}
                    >
                      {(() => {
                        try {
                          const firstParse = JSON.parse(
                            selectedEmail.attachments
                          );
                          const attachments = JSON.parse(firstParse);
                          return attachments.map((attachment, index) => (
                            <div
                              key={index}
                              style={{
                                background: "#fff",
                                border: "1px solid #e6e8eb",
                                borderRadius: "10px",
                                padding: "16px",
                              }}
                            >
                              <div
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  background: "#e6f4ff",
                                  borderRadius: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginBottom: "12px",
                                }}
                              >
                                {attachment.name.endsWith(".pdf") ? (
                                  <FiFile
                                    style={{
                                      color: "#1890ff",
                                      fontSize: "24px",
                                    }}
                                  />
                                ) : attachment.name.endsWith(".docx") ? (
                                  <FiFileText
                                    style={{
                                      color: "#1890ff",
                                      fontSize: "24px",
                                    }}
                                  />
                                ) : (
                                  <FiImage
                                    style={{
                                      color: "#1890ff",
                                      fontSize: "24px",
                                    }}
                                  />
                                )}
                              </div>
                              <div style={{ marginBottom: "12px" }}>
                                <div
                                  style={{
                                    color: "#1e293b",
                                    fontWeight: "500",
                                    marginBottom: "4px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    fontSize: "14px",
                                  }}
                                >
                                  {attachment.name}
                                </div>
                                <div
                                  style={{ color: "#64748b", fontSize: "12px" }}
                                >
                                  {(attachment.size / 1024).toFixed(1)} KB
                                </div>
                              </div>
                              <Button
                                type="primary"
                                block
                                icon={<FiDownload />}
                                onClick={() =>
                                  handleDownloadAttachment(attachment)
                                }
                                style={{
                                  height: "40px",
                                  borderRadius: "8px",
                                  background:
                                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                  border: "none",
                                  boxShadow:
                                    "0 4px 12px rgba(24, 144, 255, 0.15)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: "8px",
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          ));
                        } catch (error) {
                          console.error("Error parsing attachments:", error);
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                )}
            </div>
          </>
        )}
      </Modal>

      <style jsx>{`
        .email-view-modal {
          border-radius: 12px;
          overflow: hidden;
        }
        .email-view-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }
        .email-view-modal .ant-modal-body {
          border-radius: 12px;
          overflow: hidden;
        }
        
        .mail-item-content {
          width: 100%;
        }
        
        .mail-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
        }
        
        .mail-addresses {
          width: 100%;
        }
        
        .mail-datetime {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        @media (max-width: 768px) {
          .mail-item-content {
            padding: 8px 0;
          }
          
          .mail-details {
            gap: 12px;
          }
          
          .mail-datetime {
            align-items: flex-start;
          }
          
          .mail-date, .mail-time {
            font-size: 12px;
          }
          
          :global(.ant-list-item-meta-title) {
            margin-bottom: 12px !important;
          }
          
          :global(.ant-list-item) {
            padding: 16px !important;
          }

          :global(.action-btn) {
            width: 28px !important;
            height: 28px !important;
            min-width: 28px !important;
            padding: 0 !important;
          }

          :global(.ant-space) {
            gap: 4px !important;
          }
        }
      `}</style>
    </>
  );
};

export default EmailList;
