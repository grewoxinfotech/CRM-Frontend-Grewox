import React, { useState, useEffect } from "react";
import { Layout, Form, message, Badge, Tooltip, Button, Spin } from "antd";
import {
  useGetEmailsQuery,
  useSendEmailMutation,
  useStarEmailMutation,
  useToggleImportantMutation,
  useMoveToTrashMutation,
  useDeleteEmailMutation,
} from "./services/mailApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import ComposeModal from "./components/ComposeModal";
import EmailList from "./components/EmailList";
import Sidebar from "./components/Sidebar";
import MailHeader from "./components/MailHeader";
import ScheduleModal from "./components/ScheduleModal";
import { FiMenu, FiUser } from "react-icons/fi";
import "./mail.scss";

const Mail = () => {
  // Form instance
  const [form] = Form.useForm();

  // User and API hooks
  const currentUser = useSelector(selectCurrentUser);
  const { data: emailsData, isLoading, refetch } = useGetEmailsQuery();
  const [sendEmail] = useSendEmailMutation();
  const [starEmail] = useStarEmailMutation();
  const [toggleImportant] = useToggleImportantMutation();
  const [moveToTrash] = useMoveToTrashMutation();
  const [deleteEmail] = useDeleteEmailMutation();

  // State variables
  const [selectedMenu, setSelectedMenu] = useState("inbox");
  const [searchText, setSearchText] = useState("");
  const [composeVisible, setComposeVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateFields, setTemplateFields] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [isImportant, setIsImportant] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarVisible, setSidebarVisible] = useState(!isMobile);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarVisible(true);
      } else {
        setSidebarVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Call it initially
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (emailsData) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [refetch, emailsData]);

  // Filter emails based on selected menu and search text
  const emails = React.useMemo(() => {
    let filteredEmails = emailsData?.data || [];

    // First filter by user's email (to) or username (created_by)
    filteredEmails = filteredEmails.filter(
      (email) =>
        email.to === currentUser?.email ||
        email.created_by === currentUser?.username
    );

    // Then filter by menu type
    switch (selectedMenu) {
      case "inbox":
        filteredEmails = filteredEmails.filter((email) => !email.isTrash);
        break;
      case "sent":
        filteredEmails = filteredEmails.filter(
          (email) => email.type === "sent"
        );
        break;
      case "starred":
        filteredEmails = filteredEmails.filter(
          (email) => email.isStarred && email.type !== "trash"
        );
        break;
      case "important":
        filteredEmails = filteredEmails.filter(
          (email) => email.isImportant && email.type !== "trash"
        );
        break;
      case "scheduled":
        filteredEmails = filteredEmails.filter(
          (email) => email.type === "scheduled" && email.status === "scheduled"
        );
        break;
      case "trash":
        filteredEmails = filteredEmails.filter((email) => email.isTrash);
        break;
      default:
        break;
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredEmails = filteredEmails.filter(
        (email) =>
          email.subject?.toLowerCase().includes(searchLower) ||
          email.to?.toLowerCase().includes(searchLower) ||
          email.html?.toLowerCase().includes(searchLower)
      );
    }

    return filteredEmails;
  }, [emailsData, selectedMenu, searchText, currentUser]);

  // Calculate counts for badges
  const unreadCount = emails.filter(
    (email) => !email.isRead && email.type !== "trash"
  ).length;
  const starredCount = emails.filter(
    (email) => email.isStarred && email.type !== "trash"
  ).length;
  const importantCount = emails.filter(
    (email) => email.isImportant && email.type !== "trash"
  ).length;
  const scheduledCount = emails.filter(
    (email) => email.status === "scheduled"
  ).length;
  const trashCount = emails.filter((email) => email.type === "trash").length;

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      message.success("Emails refreshed successfully");
    } catch (error) {
      message.error("Failed to refresh emails");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handlers
  const handleComposeCancel = () => {
    setComposeVisible(false);
    form.resetFields();
    setSelectedTemplate(null);
    setTemplateFields({});
    setIsImportant(false);
    setAttachments([]);
  };

  const handleScheduleConfirm = (date, time, formattedDate, formattedTime) => {
    setScheduleDate(date);
    setScheduleTime(time);
    setIsScheduleModalVisible(false);
  };

  const handleSend = async (values) => {
    try {
      const formData = new FormData();

      // Add basic email data
      formData.append("to", values.to);
      formData.append("subject", values.subject);
      formData.append("html", values.html);
      formData.append("isImportant", isImportant);
      formData.append(
        "type",
        scheduleDate && scheduleTime ? "scheduled" : "sent"
      );
      formData.append("isRead", true);
      formData.append("isStarred", false);

      if (scheduleDate && scheduleTime) {
        formData.append("scheduleDate", scheduleDate.format("YYYY-MM-DD"));
        formData.append("scheduleTime", scheduleTime.format("HH:mm:ss"));
      }

      // Handle attachments
      if (attachments.length > 0) {
        attachments.forEach((file, index) => {
          if (file.originFileObj) {
            formData.append(`attachments`, file.originFileObj);
          }
        });
      }

      await sendEmail(formData);

      message.success(
        scheduleDate && scheduleTime
          ? "Email scheduled successfully"
          : "Email sent successfully"
      );
      setComposeVisible(false);
      form.resetFields();
      setSelectedTemplate(null);
      setTemplateFields({});
      setScheduleDate(null);
      setScheduleTime(null);
      setIsImportant(false);
      setAttachments([]);
    } catch (error) {
      console.error("Send email error:", error);
      message.error(error?.data?.message || "Failed to send email");
    }
  };

  const handleStarEmail = async (email) => {
    try {
      await starEmail({ id: email.id });
    } catch (error) {
      message.error("Failed to star email");
    }
  };

  const handleImportant = async (email) => {
    try {
      await toggleImportant({ id: email.id });
    } catch (error) {
      message.error("Failed to mark email as important");
    }
  };

  const handleDelete = async (email) => {
    try {
      await moveToTrash({ id: email.id, isTrash: true });
      message.success("Email moved to trash");
    } catch (error) {
      message.error("Failed to move email to trash");
    }
  };

  const handleRestore = async (email) => {
    try {
      await moveToTrash({ id: email.id, isTrash: false });
      message.success("Email restored to inbox");
    } catch (error) {
      message.error("Failed to restore email");
    }
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Handle menu selection on mobile
  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
    if (isMobile) {
      setSidebarVisible(false);
    }
  };

  return (
    <Layout className="mail-layout">
      {isMobile && (
        <Button
          className={`mobile-menu-toggle ${sidebarVisible ? 'sidebar-visible' : ''}`}
          icon={<FiMenu />}
          onClick={toggleSidebar}
        />
      )}

      <Sidebar
        selectedMenu={selectedMenu}
        setSelectedMenu={handleMenuSelect}
        unreadCount={unreadCount}
        starredCount={starredCount}
        importantCount={importantCount}
        scheduledCount={scheduledCount}
        trashCount={trashCount}
        setComposeVisible={setComposeVisible}
        className={`mail-sider ${sidebarVisible ? "visible" : ""}`}
        setSidebarVisible={setSidebarVisible}
      />

      <Layout className="mail-content">
        <MailHeader
          searchText={searchText}
          setSearchText={setSearchText}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          selectedMenu={selectedMenu}
        />

        {isLoading ? (
          <div className="loading-container">
            <Spin size="large" />
            <p>Loading emails...</p>
          </div>
        ) : (
          <EmailList
            emails={emails}
            handleStarEmail={handleStarEmail}
            handleImportant={handleImportant}
            handleDelete={handleDelete}
            handleRestore={handleRestore}
            isLoading={isLoading}
          />
        )}
      </Layout>

      <ComposeModal
        visible={composeVisible}
        onCancel={handleComposeCancel}
        onSubmit={handleSend}
        form={form}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        templateFields={templateFields}
        setTemplateFields={setTemplateFields}
        attachments={attachments}
        setAttachments={setAttachments}
        isImportant={isImportant}
        setIsImportant={setIsImportant}
        handleSchedule={() => setIsScheduleModalVisible(true)}
      />

      <ScheduleModal
        visible={isScheduleModalVisible}
        onCancel={() => setIsScheduleModalVisible(false)}
        onConfirm={handleScheduleConfirm}
        scheduleDate={scheduleDate}
        setScheduleDate={setScheduleDate}
        scheduleTime={scheduleTime}
        setScheduleTime={setScheduleTime}
      />
    </Layout>
  );
};

export default Mail;
