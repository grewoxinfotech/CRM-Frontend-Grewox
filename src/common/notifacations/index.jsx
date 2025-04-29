import React, { useState, useEffect } from "react";
import {
  Tabs,
  Typography,
  Button,
  Badge,
  Empty,
  Dropdown,
  notification,
} from "antd";
import { BiBell, BiCalendarEvent } from "react-icons/bi";
import {
  useGetAllNotificationsQuery,
  useMarkAsReadMutation,
  useClearAllNotificationsMutation,
} from "./services/notificationApi";
import "./notifications.scss";
import { selectCurrentUser } from "../../auth/services/authSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";

// Define sections and their routes
const SECTIONS = {
  lead: {
    name: "Lead",
    route: "/dashboard/crm/lead",
    icon: "👥",
  },
  deal: {
    name: "Deal",
    route: "/dashboard/crm/deals",
    icon: "💰",
  },
  task: {
    name: "Task",
    route: "/dashboard/crm/tasks",
    icon: "✅",
  },
  meeting: {
    name: "Meeting",
    route: "/dashboard/crm/meetings",
    icon: "📅",
  },
  client: {
    name: "Client",
    route: "/dashboard/crm/clients",
    icon: "👤",
  },
};

const { Title } = Typography;
const NotificationsComponent = () => {
  const navigate = useNavigate();
  const loggedInUser = useSelector(selectCurrentUser);
  const id = loggedInUser?.id;

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useGetAllNotificationsQuery(id);

  // console.log("notification", notificationsData);

  const [markAsRead] = useMarkAsReadMutation();
  const [clearAll] = useClearAllNotificationsMutation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [processedNotifications] = useState(new Set());
  // Poll for new notifications every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 20000);
    return () => clearInterval(interval);
  }, [refetch]);
  // Filter notifications
  const notifications = notificationsData?.data || [];
  const unreadNotifications = notifications.filter((n) => {
    try {
      // Parse the users JSON string to get assigned users
      const usersArray = JSON.parse(n.users);
      const assignedUsers = Array.isArray(usersArray) ? usersArray : [];

      // Check if current user is in assigned users list OR if user's ID matches client_id
      const isAssignedUser = assignedUsers.includes(id);
      // const isClientUser = n.client_id === id;

      // Show notification if unread AND (user is assigned OR is client)
      return !n.read && isAssignedUser;
    } catch (error) {
      console.error("Error parsing users data:", error);
      return false;
    }
  });

  const normalNotifications = unreadNotifications.filter(
    (n) => n.notification_type === "normal"
  );
  const reminders = unreadNotifications.filter(
    (n) => n.notification_type === "reminder"
  );

  // console.log('Notification Status:', {
  //     total: notifications.length,
  //     unread: unreadNotifications.length,
  //     normal: normalNotifications.length,
  //     reminders: reminders.length
  // });

  // Show notifications
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "#dc2626"; // red
      case "medium":
        return "#f59e0b"; // orange
      case "low":
        return "#10b981"; // green
      default:
        return "#7c3aed"; // default purple
    }
  };

  useEffect(() => {
    // Show all unread notifications
    unreadNotifications.forEach((notif) => {
      if (!processedNotifications.has(notif.id)) {
        const isReminder = notif.notification_type === "reminder";
        notification.info({
          message: (
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>
              {notif.title || ""}
            </span>
          ),
          description: (
            <div>
              {notif.message && <div>{notif.message}</div>}
              <div style={{ marginTop: "4px", color: "#666" }}>
                {notif.date && (
                  <span style={{ fontWeight: 500 }}>
                    {new Date(notif.date).toLocaleDateString("en-GB")}
                  </span>
                )}
                {notif.time && (
                  <span style={{ fontWeight: 500 }}>
                    {" "}
                    {new Date(`2000-01-01 ${notif.time}`).toLocaleTimeString(
                      "en-US",
                      { hour: "numeric", minute: "numeric", hour12: true }
                    )}
                  </span>
                )}
              </div>
            </div>
          ),
          icon: isReminder ? (
            <BiCalendarEvent
              style={{ color: getPriorityColor(notif.priority) }}
            />
          ) : (
            <BiBell style={{ color: getPriorityColor(notif.priority) }} />
          ),
          placement: "topRight",
          duration: 0,
          key: notif.id,
          onClick: () => handleNotificationClick(notif),
          className: `notification-${notif.priority}`,
        });

        // Helper function to get color based on priority

        processedNotifications.add(notif.id);
        // console.log('Showing notification:', {
        //     id: notif.id,
        //     type: notif.notification_type,
        //     title: notif.title,
        //     time: notif.time,
        //     date: notif.date
        // });
      }
    });
  }, [notifications, unreadNotifications]);

  const handleNotificationClick = (notification) => {
    // Handle redirection based on section and IDs
    if (notification.section) {
      if (notification.section === "lead") {
        // Navigate to lead overview with the lead ID
        navigate(`/dashboard/crm/lead/${notification.parent_id}`);
      } else if (notification.section === "deal") {
        // Navigate to deal detail with the deal ID
        navigate(`/dashboard/crm/deals/${notification.parent_id}`);
      } else if (notification.section === "task") {
        // Navigate to task detail with the task ID
        navigate(`/dashboard/crm/tasks`);
      } else if (notification.section === "task_calendar") {
        // Navigate to task calendar with the task ID
        navigate(`/dashboard/crm/task-calendar`);
      } else if (notification.section === "sales-invoice") {
        // Navigate to sales invoice with the invoice ID
        navigate(`/dashboard/crm/sales/invoice`);
      } else if (notification.section === "announcement") {
        // Navigate to announcement with the announcement ID
        navigate(`/dashboard/hrm/announcement`);
      } else if (notification.section === "products") {
        // Navigate to product details with the product ID
        if (notification.related_id) {
          navigate(`/dashboard/sales/product-services`, {
            state: { selectedProduct: notification.related_id },
          });
        } else {
          navigate(`/dashboard/sales/product-services`);
        }
      } else if (notification.section === "meeting") {
        // Navigate to meeting with the meeting ID
        navigate(`/dashboard/hrm/meeting`);
      } else if (notification.section === "calendar") {
        // Navigate to calendar with the calendar ID
        navigate(`/dashboard/hrm/calendar`);
      } else if (notification.section === "contact") {
        // Navigate to contact with the contact ID
        navigate(`/dashboard/crm/contact`);
      }

    }
  };

  const handleMarkAsRead = async (id, notification) => {
    try {
      await markAsRead(id);
      notification.close(id);
      // Refresh notifications after marking as read
      refetch();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAll();
      setDropdownOpen(false);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  // Group notifications by section
  const groupedNotifications = normalNotifications.reduce((acc, notif) => {
    const section = notif.section || "other";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(notif);
    return acc;
  }, {});

  const items = [
    {
      key: "1",
      label: (
        <Badge count={normalNotifications.length} size="small">
          <span>Notifications</span>
        </Badge>
      ),
      children: (
        <div className="notifications-list">
          {normalNotifications.length > 0 ? (
            Object.entries(groupedNotifications).map(
              ([section, notifications]) => {
                const sectionConfig = SECTIONS[section] || {
                  name: section,
                  icon: "🔔",
                };
                return (
                  <div key={section} className="notification-section">
                    <Typography.Title level={5}>
                      {sectionConfig.icon} {sectionConfig.name} Notifications
                    </Typography.Title>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${
                          !notification.read ? "unread" : ""
                        }`}
                      >
                        <div
                          className="notification-content"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-icon-wrapper">
                            <BiBell className="notification-icon info" />
                          </div>
                          <div className="notification-details">
                            <Typography.Text
                              type="secondary"
                              className="message-text"
                            >
                              {notification.message}
                            </Typography.Text>
                            {notification.description && (
                              <div className="notification-description">
                                {notification.description
                                  .split(",")
                                  .map((detail, index) => (
                                    <div
                                      key={index}
                                      className="description-item"
                                    >
                                      {detail.trim()}
                                    </div>
                                  ))}
                              </div>
                            )}
                            {(notification.date || notification.time) && (
                              <div className="notification-time">
                                {notification.date && (
                                  <span>
                                    {new Date(
                                      notification.date
                                    ).toLocaleDateString("en-GB")}
                                  </span>
                                )}
                                {notification.time && (
                                  <span style={{ fontWeight: 500 }}>
                                    {" "}
                                    {new Date(
                                      `2000-01-01 ${notification.time}`
                                    ).toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "numeric",
                                      hour12: true,
                                    })}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <div className="notification-actions">
                            <Button
                              type="link"
                              size="small"
                              onClick={() =>
                                handleMarkAsRead(notification.id, notification)
                              }
                            >
                              Mark as Read
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              }
            )
          ) : (
            <Empty description="No notifications" />
          )}
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <Badge count={reminders.length} size="small">
          <span>Reminders</span>
        </Badge>
      ),
      children: (
        <div className="notifications-list">
          {reminders.length > 0 ? (
            Object.entries(
              reminders.reduce((acc, reminder) => {
                const section = reminder.section || "other";
                if (!acc[section]) {
                  acc[section] = [];
                }
                acc[section].push(reminder);
                return acc;
              }, {})
            ).map(([section, sectionReminders]) => {
              const sectionConfig = SECTIONS[section] || {
                name: section,
                icon: "🔔",
              };
              return (
                <div key={section} className="notification-section">
                  <Typography.Title level={5}>
                    {sectionConfig.icon} {sectionConfig.name} Reminders
                  </Typography.Title>
                  {sectionReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`notification-item reminder-item ${
                        !reminder.read ? "unread" : ""
                      }`}
                    >
                      <div
                        className="notification-content"
                        onClick={() => handleNotificationClick(reminder)}
                      >
                        <div className="notification-icon-wrapper">
                          <BiCalendarEvent className="notification-icon reminder" />
                        </div>
                        <div className="notification-details">
                          <Typography.Text
                            type="secondary"
                            className="message-text"
                          >
                            {reminder.message}
                          </Typography.Text>
                          {reminder.description && (
                            <div className="notification-description">
                              {reminder.description
                                .split("\n")
                                .filter(
                                  (line) =>
                                    line.includes("• Title:") ||
                                    line.includes("• Time:")
                                )
                                .map((line, index) => (
                                  <div key={index} className="description-item">
                                    {line.trim()}
                                  </div>
                                ))}
                            </div>
                          )}
                          <div className="reminder-time">
                            <span>
                              <BiCalendarEvent style={{ marginRight: "4px" }} />
                              {new Date(reminder.date).toLocaleDateString(
                                "en-GB"
                              )}
                            </span>
                            {reminder.time && (
                              <span>
                                {new Date(
                                  `2000-01-01 ${reminder.time}`
                                ).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "numeric",
                                  hour12: true,
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!reminder.read && (
                        <div className="notification-actions">
                          <Button
                            type="link"
                            size="small"
                            onClick={() =>
                              handleMarkAsRead(reminder.id, reminder)
                            }
                          >
                            Mark as Read
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })
          ) : (
            <Empty description="No reminders" />
          )}
        </div>
      ),
    },
  ];
  const notificationPanel = (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <Title level={5}>Notifications</Title>
        {unreadNotifications.length > 0 && (
          <Button type="link" onClick={handleClearAll}>
            Clear all
          </Button>
        )}
      </div>
      <Tabs defaultActiveKey="1" items={items} className="notification-tabs" />
    </div>
  );
  const totalUnread = unreadNotifications.length;
  return (
    <Dropdown
      overlay={notificationPanel}
      trigger={["click"]}
      placement="bottomRight"
      overlayClassName="notification-dropdown-overlay"
      open={dropdownOpen}
      onOpenChange={(visible) => setDropdownOpen(visible)}
    >
      <Badge count={totalUnread} className="notification-badge">
        <Button type="text" className="notification-button" loading={isLoading}>
          <BiBell className="notification-bell-icon" />
        </Button>
      </Badge>
    </Dropdown>
  );
};
export default NotificationsComponent;
