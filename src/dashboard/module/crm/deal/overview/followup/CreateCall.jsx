import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Select, Button, Typography, Tag, Checkbox, Space, Avatar, Radio, Switch, message } from 'antd';
import { FiX, FiCalendar, FiPhone, FiUser, FiShield, FiBriefcase } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateCall = ({ open, onCancel, onSubmit, initialDate, initialTime }) => {
  const [form] = Form.useForm();
  const [repeatType, setRepeatType] = useState('none');
  const [repeatEndType, setRepeatEndType] = useState('never');
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [showReminder, setShowReminder] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);

  const currentUser = useSelector(selectCurrentUser);
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

  // Get subclient role ID to filter it out
  const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

  // Filter users to get team members (excluding subclients)
  const users = usersResponse?.data?.filter(user =>
    user?.created_by === currentUser?.username &&
    user?.role_id !== subclientRoleId
  ) || [];

  // Get role colors and icons
  const getRoleStyle = (roleName) => {
    const roleColors = {
      'employee': {
        color: '#D46B08',
        bg: '#FFF7E6', 
        border: '#FFD591',
        icon: <FiUser style={{ fontSize: '14px' }} />
      },
      'admin': {
        color: '#096DD9',
        bg: '#E6F7FF',
        border: '#91D5FF', 
        icon: <FiShield style={{ fontSize: '14px' }} />
      },
      'manager': {
        color: '#08979C',
        bg: '#E6FFFB',
        border: '#87E8DE',
        icon: <FiBriefcase style={{ fontSize: '14px' }} />
      },
      'default': {
        color: '#531CAD',
        bg: '#F9F0FF',
        border: '#D3ADF7',
        icon: <FiUser style={{ fontSize: '14px' }} />
      }
    };
    return roleColors[roleName?.toLowerCase()] || roleColors.default;
  };

  // Watch due_date field to enable repeat option
  useEffect(() => {
    const callDate = form.getFieldValue('call_date');
    setShowRepeat(!!callDate);
  }, [form.getFieldValue('call_date')]);

  // Update repeat availability when call date changes
  const handleCallDateChange = (date) => {
    setShowRepeat(!!date);
    if (!date) {
      setRepeatType('none');
    }
  };

  // Handle repeat toggle when no call date is selected
  const handleRepeatToggle = (checked) => {
    if (!showRepeat && checked) {
      message.info('Select a call date to set recurring');
      return;
    }
    setRepeatType(checked ? 'daily' : 'none');
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleSubmit = (values) => {
    try {
      const formattedValues = {
        ...values,
        call_start_date: values.call_start_date ? values.call_start_date.format('YYYY-MM-DD') : null,
        call_start_time: values.call_start_time ? values.call_start_time.format('HH:mm:ss') : null,
      };

      console.log('Call Data:', formattedValues);
      message.success('Call scheduled successfully');

      form.resetFields();
      onCancel();

      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error('Error scheduling call:', error);
      message.error('Failed to schedule call');
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={800}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
      styles={{
        body: {
          padding: 0,
          borderRadius: "8px",
          overflow: "hidden",
        },
      }}
    >
      <div
        className="modal-header"
        style={{
          background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
          padding: "24px",
          color: "#ffffff",
          position: "relative",
        }}
      >
        <Button
          type="text"
          onClick={handleCancel}
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
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <FiPhone style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2 style={{
              margin: "0",
              fontSize: "24px",
              fontWeight: "600",
              color: "#ffffff",
            }}>
              Schedule Call
            </h2>
            <Text style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.85)",
            }}>
              Add a new call to your deal
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          call_date: initialDate,
          call_time: initialTime,
          created_by: currentUser?.username,
        }}
        style={{ padding: "24px" }}
      >
        <Typography.Title level={5} style={{ marginBottom: '24px' }}>Call Information</Typography.Title>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="call_for"
            label="Call For"
            rules={[{ required: true, message: 'Please select call for' }]}
          >
            <Select
              placeholder="Contact"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="contact">Contact</Option>
              <Option value="lead">Lead</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="call_type"
            label="Call Type"
            rules={[{ required: true, message: 'Please select call type' }]}
          >
            <Select
              placeholder="Select call type"
              size="large"
              listHeight={100}
              virtual={true}
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="outbound">Outbound</Option>
              <Option value="inbound">Inbound</Option>
              <Option value="missed">Missed</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="outgoing_call_status"
            label="Outgoing Call Status"
            rules={[{ required: true, message: 'Please select call status' }]}
          >
            <Select
              placeholder="Select status"
              size="large"
              listHeight={100}
              virtual={true}
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="completed">Completed</Option>
              <Option value="no_answer">No Answer</Option>
              <Option value="busy">Busy</Option>
              <Option value="wrong_number">Wrong Number</Option>
            </Select>
          </Form.Item>
          <Form.Item
          name="created_by"
          label="Call Owner"
          rules={[{ required: true, message: 'Please select creator' }]}
        >
          <Input
            value={currentUser?.username}
            disabled
            size="large"
            style={{
              borderRadius: "10px",
              height: "48px",
            }}
          />
        </Form.Item>
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
          <Form.Item
            name="call_start_date"
            label="Call Start Date"
            rules={[{ required: true, message: 'Please select start date' }]}
            style={{ flex: 1 }}
          >
            <DatePicker
              format="DD/MM/YYYY"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>
          
          <Form.Item
            name="call_start_time"
            label="Call Start Time"
            rules={[{ required: true, message: 'Please select start time' }]}
            style={{ flex: 1 }}
          >
            <TimePicker
              format="hh:mm A"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
              use12Hours
            />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: "20px" }}>
         
        <Form.Item
          name="`reminder"
          label=" Reminder"
        >
          <Select
            placeholder="Select reminder option"
            size="large"
            listHeight={100}
            virtual={true}
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px",
            }}
          >
            <Option value="none">None</Option>
            <Option value="at_time_of_meeting">At time of meeting</Option>
            <Option value="15_min">15 minutes before</Option>
            <Option value="30_min">30 minutes before</Option>
            <Option value="1_hour">1 hour before</Option>
            <Option value="1_day">1 day before</Option>
            <Option value="2_days">2 days before</Option>

          </Select>
        </Form.Item>

          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: 'Please enter subject' }]}
          >
            <Input
              placeholder="Outgoing call to contact"
              size="large"
              style={{ borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>
        </div>

        <Typography.Title level={5} style={{ margin: '24px 0' }}>Purpose Of Outgoing Call</Typography.Title>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="call_purpose"
            label="Call Purpose"
            rules={[{ required: true, message: 'Please select call purpose' }]}
          >
            <Select
              placeholder="Select purpose"
              size="large"
              listHeight={100}
              virtual={true}
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="none">-None-</Option>
              <Option value="prospecting">Prospecting</Option>
              <Option value="administrative">Administrative</Option>
              <Option value="negotiation">Negotiation</Option>
              <Option value="demo">Demo</Option>
              <Option value="project">Project</Option>
              <Option value="desk">Desk</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="call_agenda"
            label="Call Agenda"
            rules={[{ required: true, message: 'Please enter call agenda' }]}
          >
            <Input
              placeholder="Call Agenda"
              size="large"
              style={{ borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>
        </div>

       

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "24px"
        }}>
          <Button
            size="large"
            onClick={handleCancel}
            style={{
              padding: "8px 24px",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #e6e8eb",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            style={{
              padding: "8px 32px",
              height: "44px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
            }}
          >
            Schedule Call
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateCall;
