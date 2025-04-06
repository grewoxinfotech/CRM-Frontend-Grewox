import React, { useState } from 'react';
import { Layout, Form, message } from 'antd';
import { useGetEmailsQuery, useSendEmailMutation, useStarEmailMutation, useToggleImportantMutation, useMoveToTrashMutation, useDeleteEmailMutation } from './services/mailApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import ComposeModal from './components/ComposeModal';
import EmailList from './components/EmailList';
import Sidebar from './components/Sidebar';
import MailHeader from './components/MailHeader';
import ScheduleModal from './components/ScheduleModal';
import './mail.scss';

const Mail = () => {
  // Form instance
  const [form] = Form.useForm();

  // User and API hooks
  const currentUser = useSelector(selectCurrentUser);
  const { data: emailsData, isLoading } = useGetEmailsQuery();
  const [sendEmail] = useSendEmailMutation();
  const [starEmail] = useStarEmailMutation();
  const [toggleImportant] = useToggleImportantMutation();
  const [moveToTrash] = useMoveToTrashMutation();
  const [deleteEmail] = useDeleteEmailMutation();

  // State variables
  const [selectedMenu, setSelectedMenu] = useState('inbox');
  const [searchText, setSearchText] = useState('');
  const [composeVisible, setComposeVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState(null);
  const [scheduledDateTime, setScheduledDateTime] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateFields, setTemplateFields] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [isImportant, setIsImportant] = useState(false);

  // Filter emails based on selected menu and search text
  const emails = React.useMemo(() => {
    let filteredEmails = emailsData?.data || [];

    // Filter by menu type
    switch (selectedMenu) {
      case 'inbox':
        filteredEmails = filteredEmails.filter(email => email.type !== 'trash');
        break;
      case 'sent':
        filteredEmails = filteredEmails.filter(email => email.type === 'sent');
        break;
      case 'starred':
        filteredEmails = filteredEmails.filter(email => email.isStarred && email.type !== 'trash');
        break;
      case 'important':
        filteredEmails = filteredEmails.filter(email => email.isImportant && email.type !== 'trash');
        break;
      case 'scheduled':
        filteredEmails = filteredEmails.filter(email => 
          email.status === 'scheduled' && 
          email.scheduledFor && 
          new Date(email.scheduledFor) > new Date()
        );
        break;
      case 'trash':
        filteredEmails = filteredEmails.filter(email => email.type === 'trash');
        break;
      default:
        break;
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filteredEmails = filteredEmails.filter(email =>
        email.subject?.toLowerCase().includes(searchLower) ||
        email.to?.toLowerCase().includes(searchLower) ||
        email.html?.toLowerCase().includes(searchLower)
      );
    }

    return filteredEmails;
  }, [emailsData, selectedMenu, searchText]);

  // Calculate counts for badges
  const unreadCount = emails.filter(email => !email.isRead && email.type !== 'trash').length;
  const starredCount = emails.filter(email => email.isStarred && email.type !== 'trash').length;
  const importantCount = emails.filter(email => email.isImportant && email.type !== 'trash').length;
  const scheduledCount = emails.filter(email => email.status === 'scheduled').length;
  const trashCount = emails.filter(email => email.type === 'trash').length;

  // Handlers
  const handleComposeCancel = () => {
    setComposeVisible(false);
    form.resetFields();
    setSelectedTemplate(null);
    setTemplateFields({});
    setScheduledDateTime(null);
    setIsImportant(false);
    setAttachments([]);
  };

  const handleScheduleConfirm = (date, time, utcDateTime) => {
    setScheduleDate(date);
    setScheduleTime(time);
    setScheduledDateTime(utcDateTime);
    setIsScheduleModalVisible(false);
  };

  const handleSend = async (values) => {
    try {
      const emailData = {
        ...values,
        isImportant,
        type: scheduledDateTime ? 'scheduled' : 'sent',
        isRead: true,
        isStarred: false,
        scheduledFor: scheduledDateTime
      };

      if (attachments.length > 0) {
        emailData.attachments = attachments.map(file => file.originFileObj);
      }

      await sendEmail(emailData);
      
      message.success(scheduledDateTime ? 'Email scheduled successfully' : 'Email sent successfully');
      setComposeVisible(false);
      form.resetFields();
      setSelectedTemplate(null);
      setTemplateFields({});
      setScheduledDateTime(null);
      setIsImportant(false);
      setAttachments([]);
    } catch (error) {
      message.error(error?.data?.message || 'Failed to send email');
    }
  };

  const handleStarEmail = async (email) => {
    try {
      await starEmail({ id: email.id });
    } catch (error) {
      message.error('Failed to star email');
    }
  };

  const handleImportant = async (email) => {
    try {
      await toggleImportant({ id: email.id });
    } catch (error) {
      message.error('Failed to mark email as important');
    }
  };

  const handleDelete = async (email) => {
    try {
      if (email.type === 'trash') {
        await deleteEmail({ id: email.id });
        message.success('Email permanently deleted');
      } else {
        await moveToTrash({ id: email.id });
        message.success('Email moved to trash');
      }
    } catch (error) {
      message.error('Failed to delete email');
    }
  };

  const handleRestore = async (email) => {
    try {
      await moveToTrash({ id: email.id, restore: true });
      message.success('Email restored from trash');
    } catch (error) {
      message.error('Failed to restore email');
    }
  };

  return (
    <Layout className="mail-layout">
      <Sidebar 
        selectedMenu={selectedMenu}
        setSelectedMenu={setSelectedMenu}
        unreadCount={unreadCount}
        starredCount={starredCount}
        importantCount={importantCount}
        scheduledCount={scheduledCount}
        trashCount={trashCount}
        setComposeVisible={setComposeVisible}
      />

      <Layout className="mail-content">
        <MailHeader 
          searchText={searchText}
          setSearchText={setSearchText}
        />

        <EmailList 
          emails={emails}
          handleStarEmail={handleStarEmail}
          handleImportant={handleImportant}
          handleDelete={handleDelete}
          handleRestore={handleRestore}
          isLoading={isLoading}
        />
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