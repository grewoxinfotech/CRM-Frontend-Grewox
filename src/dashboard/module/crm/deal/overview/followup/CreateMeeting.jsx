import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Select, Button, Typography, Tag, Empty, Checkbox, Radio, Space, Avatar } from 'antd';
import { FiX, FiCalendar, FiMapPin, FiUsers, FiPlus, FiSearch, FiRepeat, FiUser, FiShield, FiBriefcase } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';

const { Text } = Typography;
const { Option } = Select;

const CreateMeeting = ({ open, onCancel, onSubmit, initialDate, initialTime }) => {
  const [form] = Form.useForm();
  const [showParticipantsSection, setShowParticipantsSection] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('Contacts');
  const [showContactsWithoutEmail, setShowContactsWithoutEmail] = useState(false);
  const [showRepeatOptions, setShowRepeatOptions] = React.useState(false);
  const [repeatEndType, setRepeatEndType] = React.useState('never');
  const [repeatType, setRepeatType] = React.useState('none');
  const [frequency, setFrequency] = React.useState('daily');
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [venueType, setVenueType] = useState(null);

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

  const handleSubmit = (values) => {
    onSubmit({
      ...values,
      from_date: values.from_date.format('YYYY-MM-DD'),
      from_time: values.from_time.format('HH:mm:ss'),
      to_date: values.to_date.format('YYYY-MM-DD'),
      to_time: values.to_time.format('HH:mm:ss'),
    });
  };

  const removeParticipant = (id) => {
    setSelectedParticipants(prevParticipants => prevParticipants.filter(p => p.id !== id));
  };

  const handleRepeatChange = (value) => {
    setShowRepeatOptions(value !== 'none');
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
          name="venue"
          label="Meeting Venue"
          rules={[{ required: true, message: 'Please select meeting venue' }]}
        >
          <Select
            placeholder="Select venue"
            size="large"
            listHeight={100}
            virtual={true}
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px",
            }}
            onChange={handleVenueChange}
          >
            <Option value="client_location">Client Location</Option>
            <Option value="office">In-Office</Option>
            <Option value="online">Online</Option>
          </Select>
        </Form.Item>

        {(venueType === 'client_location' || venueType === 'office') && (
          <Form.Item
            name="location"
            label="Location"
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

        </div>

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
        </div>

        <Form.Item
          name="repeat"
          label="Repeat"
          style={{marginTop:"20px"}}
        >
          <Select
            placeholder="Select repeat option"
            size="large"
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px",
            }}
            onChange={handleRepeatChange}
          >
            {repeatOptions.map(option => (
              <Option key={option.value} value={option.value}>{option.label}</Option>
            ))}
          </Select>
        </Form.Item>

        {showRepeatOptions && repeatType !== 'custom' && (
          <div style={{
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '-12px',
            marginBottom: '16px',
            background: '#fafafa'
          }}>
            <Form.Item
              label="Repeat every"
              style={{ marginBottom: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Input
                  type="number"
                  min={1}
                  defaultValue={1}
                  style={{ width: '80px' }}
                />
                <span style={{ marginLeft: '8px' }}>{repeatType === 'daily' ? 'days' : repeatType === 'weekly' ? 'weeks' : repeatType === 'monthly' ? 'months' : 'years'}</span>
              </div>
            </Form.Item>

            {repeatType === 'weekly' && (
              <Form.Item
                label="On these days"
                style={{ marginBottom: '16px' }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {weekDays.map(day => (
                    <Checkbox key={day} style={{ marginRight: '8px' }}>
                      {day}
                    </Checkbox>
                  ))}
                </div>
              </Form.Item>
            )}

            <Form.Item
              label="Ends"
              style={{ marginBottom: '16px' }}
            >
              <Radio.Group 
                value={repeatEndType}
                onChange={(e) => setRepeatEndType(e.target.value)}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="never">
                    <span style={{ fontWeight: '500' }}>Never</span>
                  </Radio>
                  <Radio value="after">
                    <Space align="center">
                      <span style={{ fontWeight: '500' }}>After</span>
                      <Input
                        type="number"
                        min={1}
                        value={repeatTimes}
                        onChange={(e) => setRepeatTimes(e.target.value)}
                        style={{ width: '60px' }}
                        disabled={repeatEndType !== 'after'}
                      />
                      <span style={{ fontWeight: '500' }}>occurrences</span>
                    </Space>
                  </Radio>
                  <Radio value="on">
                    <Space align="center">
                      <span style={{ fontWeight: '500' }}>On</span>
                      <DatePicker
                        disabled={repeatEndType !== 'on'}
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                      />
                    </Space>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            <Form.Item name="send_separate_invites" valuePropName="checked">
              <Checkbox>
                Send separate invites for each meeting.
              </Checkbox>
            </Form.Item>
          </div>
        )}

        {repeatType === 'custom' && (
          <div style={{
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '-12px',
            marginBottom: '16px'
          }}>
            <Form.Item
              label="Repeat type"
              style={{ marginBottom: '16px' }}
            >
              <Select
                value={repeatType}
                size="large"
                style={{ width: '100%' }}
              >
                <Option value="custom">Custom</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Frequency"
              style={{ marginBottom: '16px' }}
            >
              <Select
                value={frequency}
                onChange={setFrequency}
                size="large"
                style={{ width: '100%' }}
              >
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="yearly">Yearly</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Repeat every"
              style={{ marginBottom: '16px' }}
            >
              <Space>
                <Input
                  type="number"
                  min={1}
                  defaultValue={1}
                  style={{ width: '80px' }}
                />
                <span>{frequency === 'daily' ? 'days' : 
                       frequency === 'weekly' ? 'weeks' : 
                       frequency === 'monthly' ? 'months' : 'years'}</span>
              </Space>
            </Form.Item>

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

            <Form.Item name="send_separate_invites" valuePropName="checked">
              <Checkbox>
                Send separate invites for each meeting.
              </Checkbox>
            </Form.Item>
          </div>
        )}
        
     
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