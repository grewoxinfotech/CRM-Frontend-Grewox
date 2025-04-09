import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Select, Button, Typography, Tag, Checkbox, Space, Avatar, Radio, Switch, message } from 'antd';
import { FiX, FiCalendar, FiCheckSquare, FiUser, FiShield, FiBriefcase } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateTask = ({ open, onCancel, onSubmit, initialDate, initialTime }) => {
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
    const dueDate = form.getFieldValue('due_date');
    setShowRepeat(!!dueDate);
  }, [form.getFieldValue('due_date')]);

  // Update repeat availability when due date changes
  const handleDueDateChange = (date) => {
    setShowRepeat(!!date);
    if (!date) {
      setRepeatType('none');
    }
  };

  // Handle repeat toggle when no due date is selected
  const handleRepeatToggle = (checked) => {
    if (!showRepeat && checked) {
      message.info('Select a due date to set recurring');
      return;
    }
    setRepeatType(checked ? 'daily' : 'none');
  };

  const handleSubmit = (values) => {
    try {
      // Format the values, handling potential undefined dates
      const formattedValues = {
        ...values,
        due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        due_time: values.due_time ? values.due_time.format('HH:mm:ss') : null,
        reminder_date: values.reminder_date ? values.reminder_date.format('YYYY-MM-DD') : null,
        reminder_time: values.reminder_time ? values.reminder_time.format('HH:mm:ss') : null,
        repeat_end_date: values.repeat_end_date ? values.repeat_end_date.format('YYYY-MM-DD') : null,
        repeat_type: repeatType,
        repeat_end_type: repeatEndType,
        repeat_times: repeatEndType === 'after' ? repeatTimes : null,
        has_reminder: showReminder,
        has_repeat: repeatType !== 'none'
      };

      // Log the data
      console.log('Task Data:', formattedValues);

      // Show success message
      message.success('Task created successfully');

      // Reset form and close modal
      form.resetFields();
      onCancel();

      // Pass the formatted values to parent component
      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('Failed to create task');
    }
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
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
          onClick={onCancel}
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
            <FiCheckSquare style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2 style={{
              margin: "0",
              fontSize: "24px",
              fontWeight: "600",
              color: "#ffffff",
            }}>
              Create Task
            </h2>
            <Text style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.85)",
            }}>
              Add a new task to your deal
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          due_date: initialDate,
          due_time: initialTime,
          created_by: currentUser?.username,
        }}
        style={{ padding: "24px" }}
      >
        <Form.Item
          name="subject"
          label="Subject"
          rules={[{ required: true, message: 'Please enter subject' }]}
        >
          <Input
            placeholder="Enter subject"
            size="large"
            style={{
              borderRadius: "10px",
              height: "48px",
            }}
          />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',marginTop:"20px"  }}>
          <Form.Item
            name="due_date"
            label="Due Date"
            rules={[{ required: true, message: 'Please select due date' }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
              onChange={handleDueDateChange}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Select
              placeholder="Select priority"
              size="large"
              listHeight={100}
            virtual={true}
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
            >
              <Option value="high">High</Option>
              <Option value="highest">Highest</Option>
              <Option value="low">Low</Option>
              <Option value="lowest">Lowest</Option>
              <Option value="medium">Medium</Option>
              <Option value="normal">Normal</Option>
            </Select>
          </Form.Item>
       

        <Form.Item
          name="created_by"
          label="Task Reporter"
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

        <Form.Item
          name="assigned_to"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Assign To
            </span>
          }
          rules={[{ required: true, message: 'Please select assignee' }]}
        >
          <Select
            showSearch
            size="large"
            placeholder="Select team member"
            optionFilterProp="children"
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px"
            }}
            listHeight={100}
            dropdownStyle={{
              maxHeight: '120px',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollBehavior: 'smooth'
            }}
            filterOption={(input, option) => {
              const username = option?.username?.toLowerCase() || '';
              const searchTerm = input.toLowerCase();
              return username.includes(searchTerm);
            }}
            defaultOpen={false}
          >
            {users.map((user) => {
              const userRole = rolesData?.data?.find(role => role.id === user.role_id);
              const roleStyle = getRoleStyle(userRole?.role_name);

              return (
                <Option
                  key={user.id}
                  value={user.username}
                  username={user.username}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Avatar
                        size="small"
                        style={{
                          backgroundColor: user.color || '#1890ff',
                          fontSize: '12px'
                        }}
                      >
                        {user.username?.[0]?.toUpperCase() || '?'}
                      </Avatar>
                      <Text strong>{user.username}</Text>
                    </div>
                    <Tag style={{
                      margin: 0,
                      background: roleStyle.bg,
                      color: roleStyle.color,
                      border: `1px solid ${roleStyle.border}`,
                      fontSize: '12px',
                      borderRadius: '16px',
                      padding: '2px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {roleStyle.icon}
                      {userRole?.role_name || 'User'}
                    </Tag>
                  </div>
                </Option>
              );
            }).filter(Boolean)}
          </Select>
        </Form.Item>

        <Form.Item
          name="contact_name"
          label="Contact Name"
          rules={[{ required: true, message: 'Please enter contact name' }]}
        >
          <Input
            placeholder="Enter contact name"
            size="large"
            style={{
              borderRadius: "10px",
              height: "48px",
            }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select
            placeholder="Select status"
            size="large"
            listHeight={100}
            virtual={true}
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px",
            }}
          >
            <Option value="not_started">Not Started</Option>
            <Option value="deferred">Deferred</Option>
            <Option value="in_progress">In Progress</Option>
            <Option value="completed">Completed</Option>
            <Option value="waiting_for_input">Waiting for input</Option>
          </Select>
        </Form.Item>

        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px',marginTop:'16px' }}>
          <Text style={{ fontSize: '14px', fontWeight: '500' }}>Reminder</Text>
          <Switch checked={showReminder} onChange={setShowReminder} />
        </div>

        {showReminder && (
          <div style={{ marginBottom: '16px',display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'  }}>
            <Form.Item
              name="reminder_date"
              label="Reminder Date"
            >
              <DatePicker
                format="DD/MM/YYYY"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="reminder_time"
              label="Reminder Time"
            >
              <TimePicker
                format="hh:mm A"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
                use12Hours
              />
            </Form.Item>

            <Form.Item
              name="alert_type"
              label="Alert"
            >
              <Select
                placeholder="Select alert type"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
              >
                <Option value="email">Email</Option>
                <Option value="popup">Pop-up</Option>
                <Option value="both">Both</Option>
              </Select>
            </Form.Item>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Text style={{ fontSize: '14px', fontWeight: '500' }}>Repeat</Text>
          <Switch 
            checked={repeatType !== 'none'} 
            onChange={handleRepeatToggle}
          />
        </div>

        {repeatType !== 'none' && (
          <div style={{ marginBottom: '16px' }}>
            <Form.Item
              name="repeat"
              label="Repeat Type"
            >
              <Select
                placeholder="Select repeat option"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
                value={repeatType}
                onChange={(value) => setRepeatType(value)}
              >
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="yearly">Yearly</Option>
              </Select>
            </Form.Item>

            <div style={{
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '-12px',
              marginBottom: '16px'
            }}>
              <Form.Item
                label="Ends"
                style={{ marginBottom: '16px' }}
              >
                <Radio.Group 
                  value={repeatEndType}
                  onChange={(e) => setRepeatEndType(e.target.value)}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Radio value="never">Never</Radio>
                    <Radio value="after">
                      <Space align="center">
                        After{' '}
                        <Input
                          type="number"
                          min={1}
                          value={repeatTimes}
                          onChange={(e) => setRepeatTimes(e.target.value)}
                          style={{ width: '60px' }}
                          disabled={repeatEndType !== 'after'}
                        />
                        {' '}Times
                      </Space>
                    </Radio>
                    <Radio value="on">
                      <Space align="center">
                        On{' '}
                        <DatePicker
                          disabled={repeatEndType !== 'on'}
                          format="DD/MM/YYYY"
                        />
                      </Space>
                    </Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>
            </div>
          </div>
        )}

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea
            placeholder="Enter task description"
            rows={4}
            style={{
              borderRadius: "10px",
            }}
          />
        </Form.Item>

        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
          marginTop: "24px"
        }}>
          <Button
            size="large"
            onClick={onCancel}
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
            Create Task
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateTask;
