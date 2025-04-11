import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Select, Button, Typography, Tag, Empty, Checkbox, Radio, Space, Avatar, Switch } from 'antd';
import { FiX, FiCalendar, FiMapPin, FiUsers, FiPlus, FiSearch, FiRepeat, FiUser, FiShield, FiBriefcase, FiChevronDown, FiLink } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../../auth/services/authSlice';
import { message } from 'antd';
import { useCreateFollowupMeetingMutation } from './services/followupMettingApi';

const { Text } = Typography;
const { Option } = Select;

const CreateMeeting = ({ open, onCancel, onSubmit, initialDate, initialTime, dealId }) => {
  const [form] = Form.useForm();
  const [showParticipantsSection, setShowParticipantsSection] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('Contacts');
  const [showContactsWithoutEmail, setShowContactsWithoutEmail] = useState(false);
  const [repeatEndType, setRepeatEndType] = React.useState('never');
  const [repeatType, setRepeatType] = React.useState('none');
  const [frequency, setFrequency] = React.useState('daily');
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [venueType, setVenueType] = useState(null);
  const [showReminder, setShowReminder] = useState(false);
  const [customRepeatInterval, setCustomRepeatInterval] = useState(1);
  const [customRepeatDays, setCustomRepeatDays] = useState([]);
  const [customFrequency, setCustomFrequency] = useState('weekly');
  const [monthlyPattern, setMonthlyPattern] = useState('day');
  const [yearlyPattern, setYearlyPattern] = useState('date');
  const [meetingType, setMeetingType] = useState(null);


  const [createFollowupMeeting, { isLoading: isCreating }] = useCreateFollowupMeetingMutation();
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

  const handleSubmit = async (values) => {
    try {
      // Organize reminder fields
      const reminderData = showReminder ? {
        reminder_date: values.reminder_date ? values.reminder_date.format('YYYY-MM-DD') : null,
        reminder_time: values.reminder_time ? values.reminder_time.format('HH:mm:ss') : null,
      } : null;

      // Organize repeat fields
      const repeatData = repeatType !== 'none' ? {
        repeat_type: repeatType,
        repeat_end_type: repeatEndType,
        repeat_times: repeatEndType === 'after' ? repeatTimes : null,
        repeat_end_date: values.repeat_end_date ? values.repeat_end_date.format('YYYY-MM-DD') : null,
        custom_repeat_interval: repeatType === 'custom' ? customRepeatInterval : null,
        custom_repeat_days: repeatType === 'custom' ? customRepeatDays : null,
        custom_repeat_frequency: repeatType === 'custom' ? customFrequency : null,
      } : null;

      // Ensure assigned_to is always an array
      const assignedToArray = Array.isArray(values.assigned_to) ? values.assigned_to : [values.assigned_to].filter(Boolean);

      // Format the final payload
      const formattedValues = {
        title: values.title,
        meeting_type: values.meeting_type,
        venue: values.venue,
        location: values.location,
        meeting_link: values.meeting_link,
        from_date: values.from_date.format('YYYY-MM-DD'),
        from_time: values.from_time.format('HH:mm:ss'),
        to_date: values.to_date.format('YYYY-MM-DD'),
        to_time: values.to_time.format('HH:mm:ss'),
        host: values.host,
        assigned_to: {
          assigned_to: assignedToArray
        },
        reminder: reminderData,
        repeat: repeatData,
        participants_reminder: values.participants_reminder
      };

      await createFollowupMeeting({id: dealId, data: formattedValues}).unwrap();
      message.success('Meeting created successfully');
      form.resetFields();
      onCancel();

      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      message.error('Failed to create meeting');
    }
  };

  const removeParticipant = (id) => {
    setSelectedParticipants(prevParticipants => prevParticipants.filter(p => p.id !== id));
  };

  const handleRepeatChange = (value) => {
    setRepeatType(value);
  };
  
  const handleFrequencyChange = (value) => {
    setFrequency(value);
  };

  const handleVenueChange = (value) => {
    setVenueType(value);
    // If venue is online, clear the location field
    if (value === 'online') {
      form.setFieldsValue({ location: undefined });
    }
  };

  const repeatOptions = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom...' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Update handleRepeatToggle to work independently
  const handleRepeatToggle = (checked) => {
    setRepeatType(checked ? 'daily' : 'none');
  };

  // Add formItemStyle constant
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937"
  };

  const inputStyle = {
    height: "48px", 
    borderRadius: "10px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e6e8eb",
    transition: "all 0.3s ease"
  };

  const selectStyle = {
    width: '100%',
    height: '48px'
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
            <FiUsers style={{ fontSize: "24px", color: "#ffffff" }} />
          </div>
          <div>
            <h2 style={{
              margin: "0",
              fontSize: "24px",
              fontWeight: "600",
              color: "#ffffff",
            }}>
              Create Meeting
            </h2>
            <Text style={{
              fontSize: "14px",
              color: "rgba(255, 255, 255, 0.85)",
            }}>
              Schedule a new meeting
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          from_date: initialDate,
          from_time: initialTime,
          to_date: initialDate,
          to_time: initialTime,
        }}
        style={{ padding: "24px" }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter meeting title' }]}
          >
            <Input
              placeholder="Enter meeting title"
              size="large"
              style={{
                borderRadius: "10px",
                height: "48px",
              }}
            />
          </Form.Item>

          <Form.Item
            name="meeting_type"
            label="Meeting Type"
            rules={[{ required: true, message: 'Please select meeting type' }]}
          >
            <Select
              placeholder="Select meeting type"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              onChange={(value) => {
                setMeetingType(value);
                // Reset venue and location when meeting type changes
                form.setFieldsValue({
                  venue: undefined,
                  location: undefined
                });
                setVenueType(null);
              }}
            >
              <Option value="online">Online Meeting</Option>
              <Option value="offline">Offline Meeting</Option>
            </Select>
          </Form.Item>
        </div>

        {meetingType && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {meetingType === 'offline' && (
              <>
                <Form.Item
                  name="venue"
                  label="Meeting Venue"
                  rules={[{ required: true, message: 'Please select meeting venue' }]}
                >
                  <Select
                    placeholder="Select venue"
                    size="large"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      height: "48px",
                    }}
                    onChange={handleVenueChange}
                  >
                    <Option value="client_location">Client Location</Option>
                    <Option value="office">In-Office</Option>
                  </Select>
                </Form.Item>

                {venueType && (
                  <Form.Item
                    name="location"
                    label="Location"
                    rules={[{ required: true, message: 'Please enter location details' }]}
                  >
                    <Input
                      placeholder="Enter location details"
                      size="large"
                      style={{
                        borderRadius: "10px",
                        height: "48px",
                      }}
                      prefix={<FiMapPin style={{ color: "#1890ff" }} />}
                    />
                  </Form.Item>
                )}
              </>
            )}

            {meetingType === 'online' && (
              <Form.Item
                name="meeting_link"
                label="Meeting Link"
                rules={[{ required: true, message: 'Please enter meeting link' }]}
                style={{ gridColumn: '1 / -1' }}
              >
                <Input
                  placeholder="Enter meeting link (e.g., Zoom, Google Meet)"
                  size="large"
                  style={{
                    borderRadius: "10px",
                    height: "48px",
                  }}
                  prefix={<FiLink style={{ color: "#1890ff" }} />}
                />
              </Form.Item>
            )}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',marginTop:"20px"  }}>
          <Form.Item
            name="from_date"
            label="From"
            rules={[{ required: true, message: 'Please select start date' }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
            />
          </Form.Item>

          <Form.Item
            name="from_time"
            label="From Time"
            rules={[{ required: true, message: 'Please select start time' }]}
          >
            <TimePicker
              format="hh:mm A"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              minuteStep={15}
              use12Hours
            />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',marginTop:"20px"  }}>
          <Form.Item
            name="to_date"
            label="To"
            rules={[{ required: true, message: 'Please select end date' }]}
          >
            <DatePicker
              format="DD-MM-YYYY"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
            />
          </Form.Item>

          <Form.Item
            name="to_time"
            label="To Time"
            rules={[{ required: true, message: 'Please select end time' }]}
          >
            <TimePicker
              format="hh:mm A"
              size="large"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              minuteStep={15}
              use12Hours
            />
          </Form.Item>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',marginTop:"20px"  }}>

        <Form.Item
          name="host"
          label="Host"
          rules={[{ required: true, message: 'Please select host' }]}
        >
          <Select
            placeholder="Select host"
            size="large"
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px",
            }}
          >
            <Option value="grewox">Grewox</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="assigned_to"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Participants
            </span>
          }
          rules={[{ required: true, message: 'Please select participants' }]}
        >
          <Select
            mode="multiple"
            showSearch
            size="large"
            placeholder="Select team members"
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
                  value={user.id}
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
            })}
          </Select>
        </Form.Item>
        </div>

        

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Reminder</Text>
            <Switch checked={showReminder} onChange={setShowReminder} />
          </div>

          {showReminder && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                name="reminder_date"
                label={<span style={formItemStyle}>Reminder Date</span>}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{
                    ...inputStyle,
                    width: '100%'
                  }}
                  suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
                />
              </Form.Item>

              <Form.Item
                name="reminder_time"
                label={<span style={formItemStyle}>Reminder Time</span>}
              >
                <TimePicker
                  format="hh:mm A"
                  style={{
                    ...inputStyle,
                    width: '100%'
                  }}
                  use12Hours
                />
              </Form.Item>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Text strong style={{ fontSize: '16px', color: '#1f2937' }}>Repeat</Text>
            <Switch 
              checked={repeatType !== 'none'} 
              onChange={handleRepeatToggle}
            />
          </div>

          {repeatType !== 'none' && (
            <div>
              <Form.Item
                name="repeat"
                label={<span style={formItemStyle}>Repeat Type</span>}
              >
                <Select
                  placeholder="Select repeat option"
                  style={selectStyle}
                  value={repeatType}
                  onChange={(value) => setRepeatType(value)}
                  suffixIcon={<FiChevronDown size={14} />}
                >
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="yearly">Yearly</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>

              {repeatType === 'custom' && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '16px', 
                  border: '1px solid #f0f0f0', 
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc'
                }}>
                  <Form.Item
                    name="repeat_frequency"
                    label={<span style={formItemStyle}>Frequency</span>}
                  >
                    <Select 
                      defaultValue="weekly" 
                      style={selectStyle}
                      onChange={(value) => setCustomFrequency(value)}
                      suffixIcon={<FiChevronDown size={14} />}
                    >
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                      <Option value="yearly">Yearly</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label={<span style={formItemStyle}>Repeat Every</span>}>
                    <Input.Group compact>
                      <Input 
                        type="number" 
                        min={1} 
                        value={customRepeatInterval}
                        onChange={(e) => setCustomRepeatInterval(e.target.value)}
                        style={{ 
                          width: '20%', 
                          ...inputStyle,
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0
                        }}
                      />
                      <div style={{ 
                        lineHeight: '48px', 
                        padding: '0 16px', 
                        backgroundColor: '#f3f4f6',
                        border: '1px solid #e6e8eb',
                        borderLeft: 'none',
                        borderTopRightRadius: '10px',
                        borderBottomRightRadius: '10px'
                      }}>
                        {customFrequency === 'weekly' ? 'weeks' : customFrequency === 'monthly' ? 'months' : 'years'}
                      </div>
                    </Input.Group>
                  </Form.Item>

                  {customFrequency === 'weekly' && (
                    <Form.Item label={<span style={formItemStyle}>On These Days</span>}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                          <Button
                            key={day}
                            type={customRepeatDays.includes(index) ? 'primary' : 'default'}
                            shape="circle"
                            onClick={() => {
                              const newDays = customRepeatDays.includes(index)
                                ? customRepeatDays.filter(d => d !== index)
                                : [...customRepeatDays, index];
                              setCustomRepeatDays(newDays);
                            }}
                            style={{
                              width: '40px',
                              height: '40px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              ...(customRepeatDays.includes(index) ? {
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none'
                              } : {})
                            }}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </Form.Item>
                  )}

                  {customFrequency === 'monthly' && (
                    <Form.Item label={<span style={formItemStyle}>On</span>}>
                      <Space>
                        <Select style={{ width: 120 }} defaultValue="first">
                          <Option value="first">First</Option>
                          <Option value="second">Second</Option>
                          <Option value="third">Third</Option>
                          <Option value="fourth">Fourth</Option>
                          <Option value="last">Last</Option>
                        </Select>
                        <Select style={{ width: 120 }} defaultValue="monday">
                          <Option value="sunday">Sunday</Option>
                          <Option value="monday">Monday</Option>
                          <Option value="tuesday">Tuesday</Option>
                          <Option value="wednesday">Wednesday</Option>
                          <Option value="thursday">Thursday</Option>
                          <Option value="friday">Friday</Option>
                          <Option value="saturday">Saturday</Option>
                        </Select>
                      </Space>
                    </Form.Item>
                  )}

                  {customFrequency === 'yearly' && (
                    <Form.Item label={<span style={formItemStyle}>On</span>}>
                      <Space direction="vertical">
                        <Space>
                          <Select style={{ width: 120 }} defaultValue="1">
                            {Array.from({ length: 12 }, (_, i) => (
                              <Option key={i + 1} value={i + 1}>
                                {new Date(2024, i, 1).toLocaleString('default', { month: 'long' })}
                              </Option>
                            ))}
                          </Select>
                          <Select style={{ width: 120 }} defaultValue="first">
                            <Option value="first">First</Option>
                            <Option value="second">Second</Option>
                            <Option value="third">Third</Option>
                            <Option value="fourth">Fourth</Option>
                            <Option value="last">Last</Option>
                          </Select>
                          <Select style={{ width: 120 }} defaultValue="monday">
                            <Option value="sunday">Sunday</Option>
                            <Option value="monday">Monday</Option>
                            <Option value="tuesday">Tuesday</Option>
                            <Option value="wednesday">Wednesday</Option>
                            <Option value="thursday">Thursday</Option>
                            <Option value="friday">Friday</Option>
                            <Option value="saturday">Saturday</Option>
                          </Select>
                        </Space>
                      </Space>
                    </Form.Item>
                  )}
                </div>
              )}

              <div style={{
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px',
                backgroundColor: '#f8fafc'
              }}>
                <Form.Item
                  label={<span style={formItemStyle}>Ends</span>}
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
                            style={{ 
                              width: '60px',
                              ...inputStyle,
                              height: '32px'
                            }}
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
                            style={{
                              ...inputStyle,
                              height: '32px'
                            }}
                          />
                        </Space>
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </div>
            </div>
          )}
        </div>

        <Form.Item
          name="participants_reminder"
          label="Participants Reminder"
          style={{marginTop:"20px"}}
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
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            }}
          >
            Create Meeting
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateMeeting;