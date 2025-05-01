import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Button,
  Typography,
  Tag,
  Divider,
  Checkbox,
  Space,
  Avatar,
  Radio,
  Switch,
  message,
} from "antd";
import {
  FiX,
  FiCalendar,
  FiCheckSquare,
  FiUser,
  FiShield,
  FiBriefcase,
  FiChevronDown,
  FiUserPlus,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useGetUsersQuery } from "../../../../../user-management/users/services/userApi";
import { useGetRolesQuery } from "../../../../../hrm/role/services/roleApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../../auth/services/authSlice";
import {
  useCreateFollowupTaskMutation,
  useGetFollowupTaskByIdQuery,
} from "./services/followupTaskApi";
import { useParams } from "react-router-dom";
const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreatefollowupTask = ({
  open,
  onCancel,
  onSubmit,
  initialDate,
  initialTime,
  leadId,
}) => {
  const [createFollowupTask, { isLoading: followupTaskResponseLoading }] =
    useCreateFollowupTaskMutation();
  const [form] = Form.useForm();
  const [repeatType, setRepeatType] = useState("none");
  const [repeatEndType, setRepeatEndType] = useState("never");
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [showReminder, setShowReminder] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [customRepeatInterval, setCustomRepeatInterval] = useState(1);
  const [customRepeatDays, setCustomRepeatDays] = useState([]);
  const [customFrequency, setCustomFrequency] = useState("weekly");
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);

  const [monthlyPattern, setMonthlyPattern] = useState("day");
  const [yearlyPattern, setYearlyPattern] = useState("date");
  const [repeatEndDate, setRepeatEndDate] = useState(null);

  // Add formItemStyle constant
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
  };

  const inputStyle = {
    height: "48px",
    borderRadius: "10px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e6e8eb",
    transition: "all 0.3s ease",
  };

  const prefixIconStyle = {
    color: "#1890ff",
    fontSize: "16px",
    marginRight: "8px",
  };

  const selectStyle = {
    width: "100%",
    height: "48px",
  };

  const currentUser = useSelector(selectCurrentUser);
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();

  // Get subclient role ID to filter it out
  const subclientRoleId = rolesData?.data?.find(
    (role) => role?.role_name === "sub-client"
  )?.id;

  // Filter users to get team members (excluding subclients)
  const users =
    usersResponse?.data?.filter(
      (user) =>
        user?.created_by === currentUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];

  // Get role colors and icons
  const getRoleColor = (role) => {
    const roleColors = {
      employee: {
        color: "#D46B08",
        bg: "#FFF7E6",
        border: "#FFD591",
      },
      admin: {
        color: "#096DD9",
        bg: "#E6F7FF",
        border: "#91D5FF",
      },
      manager: {
        color: "#08979C",
        bg: "#E6FFFB",
        border: "#87E8DE",
      },
      default: {
        color: "#531CAD",
        bg: "#F9F0FF",
        border: "#D3ADF7",
      },
    };
    return roleColors[role?.toLowerCase()] || roleColors.default;
  };

  const handleCreateUser = () => {
    setIsCreateUserVisible(true);
  };

  // Watch due_date field to enable repeat option
  useEffect(() => {
    const dueDate = form.getFieldValue("due_date");
    setShowRepeat(!!dueDate);
  }, [form.getFieldValue("due_date")]);

  // Update repeat availability when due date changes
  const handleDueDateChange = (date) => {
    setShowRepeat(!!date);
    if (!date) {
      setRepeatType("none");
    }
    // Reset reminder date if it's after new due date
    const reminderDate = form.getFieldValue("reminder_date");
    if (reminderDate && date && reminderDate.isAfter(date)) {
      form.setFieldValue("reminder_date", null);
    }
    // Reset repeat end date if it's before new due date
    const repeatEndDate = form.getFieldValue("repeat_end_date");
    if (repeatEndDate && date && repeatEndDate.isBefore(date)) {
      form.setFieldValue("repeat_end_date", null);
    }
  };

  // Update handleRepeatToggle to check for reminder
  const handleRepeatToggle = (checked) => {
    if (!showReminder) {
      message.info("Please set a reminder first before setting repeat");
      return;
    }
    setRepeatType(checked ? "daily" : "none");
  };

  // Add effect to reset repeat when reminder is turned off
  useEffect(() => {
    if (!showReminder) {
      setRepeatType("none");
    }
  }, [showReminder]);

  // Add disabledDate functions
  const disableReminderDate = (current) => {
    const dueDate = form.getFieldValue("due_date");
    return current && (current.isAfter(dueDate) || current.isSame(dueDate));
  };

  const disableRepeatEndDate = (current) => {
    const dueDate = form.getFieldValue("due_date");
    return current && (current.isAfter(dueDate) || current.isSame(dueDate));
  };

  // Add this new function to disable past dates
  const disablePastDates = (current) => {
    return current && current.isBefore(dayjs(), "day");
  };

  const handleSubmit = async (values) => {
    try {
      // Prepare reminder data
      const reminderData = showReminder
        ? {
            reminder_date: values.reminder_date?.format("YYYY-MM-DD"),
            reminder_time: values.reminder_time?.format("HH:mm:ss"),
          }
        : null;

      // Prepare repeat data
      const repeatData =
        repeatType !== "none"
          ? {
              repeat_type: repeatType,
              repeat_end_type: repeatEndType,
              repeat_times: repeatEndType === "after" ? repeatTimes : null,
              repeat_end_date: values.repeat_end_date
                ? values.repeat_end_date.format("YYYY-MM-DD")
                : null,
              repeat_start_date: values.repeat_start_date
                ? values.repeat_start_date.format("YYYY-MM-DD")
                : null,
              repeat_start_time: values.repeat_start_time
                ? values.repeat_start_time.format("HH:mm:ss")
                : null,
              custom_repeat_interval:
                repeatType === "custom" ? customRepeatInterval : null,
              custom_repeat_days:
                repeatType === "custom" && customFrequency === "weekly"
                  ? customRepeatDays
                  : null,
              custom_repeat_frequency:
                repeatType === "custom" ? customFrequency : null,
            }
          : null;

      // If no assignee is selected, assign to current user
      const assignedTo =
        values.assigned_to && values.assigned_to.length > 0
          ? values.assigned_to
          : [currentUser?.id];

      // Format the final payload
      const formattedValues = {
        subject: values.subject,
        section: "lead",
        due_date: values.due_date?.format("YYYY-MM-DD"),
        priority: values.priority,
        assigned_to: { assigned_to: assignedTo },
        status: "in_progress",
        description: values.description || null,
        reminder: reminderData,
        repeat: repeatData,
      };

      // Make API call to create task
      await createFollowupTask({ id: leadId, data: formattedValues }).unwrap();

      message.success("Task created successfully");
      form.resetFields();
      onCancel();

      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      message.error("Failed to create task");
    }
  };

  return (
    <>
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
            <FiCheckSquare style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create Task
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Add a new task to your lead
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
          status: "in_progress",
        }}
        style={{ padding: "24px" }}
      >
        <div style={{ marginBottom: "24px" }}>
          <Text
            strong
            style={{
              fontSize: "16px",
              color: "#1f2937",
              display: "block",
              marginBottom: "16px",
            }}
          >
            Task Details
          </Text>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <Form.Item
              name="subject"
              label={<span style={formItemStyle}>Subject <span style={{ color: "#ff4d4f" }}>*</span></span>}
              rules={[{ required: true, message: "Please enter subject" }]}
            >
              <Input placeholder="Enter subject" style={inputStyle} />
            </Form.Item>

            <Form.Item
              name="due_date"
              label={<span style={formItemStyle}>Due Date <span style={{ color: "#ff4d4f" }}>*</span></span>}
              rules={[{ required: true, message: "Please select due date" }]}
            >
              <DatePicker
                format="DD-MM-YYYY"
                style={{
                  ...inputStyle,
                  width: "100%",
                }}
                suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
                onChange={handleDueDateChange}
                disabledDate={disablePastDates}
              />
            </Form.Item>

            <Form.Item
              name="priority"
              label={<span style={formItemStyle}>Priority <span style={{ color: "#ff4d4f" }}>*</span></span>}
              rules={[{ required: true, message: "Please select priority" }]}
            >
              <Select
                placeholder="Select priority"
                style={selectStyle}
                suffixIcon={<FiChevronDown size={14} />}
              >
                <Option value="highest">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#ff4d4f",
                      }}
                    />
                    Highest - Urgent and Critical
                  </div>
                </Option>
                <Option value="high">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#faad14",
                      }}
                    />
                    High - Important
                  </div>
                </Option>
                <Option value="medium">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#1890ff",
                      }}
                    />
                    Medium - Normal
                  </div>
                </Option>
                <Option value="low">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#52c41a",
                      }}
                    />
                    Low - Can Wait
                  </div>
                </Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <Text
            strong
            style={{
              fontSize: "16px",
              color: "#1f2937",
              display: "block",
              marginBottom: "16px",
            }}
          >
            Assignment
          </Text>
          <Form.Item
            name="assigned_to"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Participants
              </span>
            }
          >
            <Select
              mode="multiple"
              placeholder="Select team members"
              style={{
                width: "100%",
                height: "auto",
                minHeight: "48px",
              }}
              listHeight={200}
              maxTagCount={2}
              maxTagTextLength={15}
              dropdownStyle={{
                maxHeight: "300px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollBehavior: "smooth",
              }}
              popupClassName="team-members-dropdown"
              showSearch
              optionFilterProp="children"
              loading={usersLoading}
              open={teamMembersOpen}
              onDropdownVisibleChange={setTeamMembersOpen}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: "8px 0" }} />
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      padding: "0 8px",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      type="text"
                      icon={
                        <FiUserPlus
                          style={{ fontSize: "16px", color: "#ffffff" }}
                        />
                      }
                      onClick={handleCreateUser}
                      style={{
                        height: "36px",
                        padding: "8px 12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        background:
                          "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, #40a9ff 0%, #1890ff 100%)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)";
                      }}
                    >
                      Add New User
                    </Button>
                    <Button
                      type="text"
                      icon={
                        <FiShield
                          style={{ fontSize: "16px", color: "#1890ff" }}
                        />
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        setTeamMembersOpen(false);
                      }}
                      style={{
                        height: "36px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        background: "#ffffff",
                        border: "1px solid #1890ff",
                        color: "#1890ff",
                        fontWeight: "500",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e6f4ff";
                        e.currentTarget.style.borderColor = "#69b1ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#ffffff";
                        e.currentTarget.style.borderColor = "#1890ff";
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </>
              )}
            >
              {Array.isArray(users) &&
                users.map((user) => {
                  const userRole = rolesData?.data?.find(
                    (role) => role.id === user.role_id
                  );
                  const roleStyle = getRoleColor(userRole?.role_name);

                  return (
                    <Option key={user.id} value={user.id}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "4px 0",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "#e6f4ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1890ff",
                            fontSize: "16px",
                            fontWeight: "500",
                            textTransform: "uppercase",
                          }}
                        >
                          {user.profilePic ? (
                            <img
                              src={user.profilePic}
                              alt={user.username}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            user.username?.charAt(0) || <FiUser />
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "4px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 500,
                              color: "rgba(0, 0, 0, 0.85)",
                              fontSize: "14px",
                            }}
                          >
                            {user.username}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginLeft: "auto",
                          }}
                        >
                          <div
                            className="role-indicator"
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              background: roleStyle.color,
                              boxShadow: `0 0 8px ${roleStyle.color}`,
                              animation: "pulse 2s infinite",
                            }}
                          />
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              background: roleStyle.bg,
                              color: roleStyle.color,
                              border: `1px solid ${roleStyle.border}`,
                              fontWeight: 500,
                              textTransform: "capitalize",
                            }}
                          >
                            {userRole?.role_name || "User"}
                          </span>
                        </div>
                      </div>
                    </Option>
                  );
                })}
            </Select>
          </Form.Item>
        </div>

        <div style={{ marginBottom: "24px" }}>
          {/* <Text
            strong
            style={{
              fontSize: "16px",
              color: "#1f2937",
              display: "block",
              marginBottom: "16px",
            }}
          >
            Task Status
          </Text> */}
          <Form.Item name="status" hidden initialValue="in_progress" />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <Text strong style={{ fontSize: "16px", color: "#1f2937" }}>
              Reminder
            </Text>
            <Switch checked={showReminder} onChange={setShowReminder} />
          </div>

          {showReminder && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <Form.Item
                name="reminder_date"
                label={<span style={formItemStyle}>Reminder Date</span>}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{
                    ...inputStyle,
                    width: "100%",
                  }}
                  disabledDate={disableReminderDate}
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
                    width: "100%",
                  }}
                  use12Hours
                />
              </Form.Item>
            </div>
          )}
        </div>

        <div
          style={{
            marginBottom: "24px",
            opacity: showReminder ? 1 : 0.5,
            pointerEvents: showReminder ? "auto" : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <Text strong style={{ fontSize: "16px", color: "#1f2937" }}>
              Repeat
            </Text>
            <Switch
              checked={repeatType !== "none"}
              onChange={handleRepeatToggle}
              disabled={!showReminder}
            />
          </div>

          {repeatType !== "none" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <Form.Item
                  name="repeat_start_date"
                  label={<span style={formItemStyle}>Start Date</span>}
                  rules={[
                    { required: true, message: "Please select start date" },
                  ]}
                >
                  <DatePicker
                    format="DD/MM/YYYY"
                    style={{
                      ...inputStyle,
                      width: "100%",
                    }}
                    disabledDate={disablePastDates}
                    suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
                  />
                </Form.Item>

                <Form.Item
                  name="repeat_start_time"
                  label={<span style={formItemStyle}>Start Time</span>}
                  rules={[
                    { required: true, message: "Please select start time" },
                  ]}
                >
                  <TimePicker
                    format="hh:mm A"
                    style={{
                      ...inputStyle,
                      width: "100%",
                    }}
                    use12Hours
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="repeat"
                label={<span style={formItemStyle}>Repeat Type</span>}
              >
                <Select
                  placeholder="Select repeat option"
                  style={selectStyle}
                  value={repeatType}
                  onChange={(value) => {
                    setRepeatType(value);
                    // Reset custom values when switching repeat types
                    if (value !== "custom") {
                      setCustomRepeatInterval(1);
                      setCustomRepeatDays([]);
                      setCustomFrequency("weekly");
                    }
                  }}
                  suffixIcon={<FiChevronDown size={14} />}
                >
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="yearly">Yearly</Option>
                  <Option value="custom">Custom</Option>
                </Select>
              </Form.Item>

              {repeatType === "custom" && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Form.Item
                    name="repeat_frequency"
                    label={<span style={formItemStyle}>Frequency</span>}
                  >
                    <Select
                      defaultValue="weekly"
                      style={selectStyle}
                      onChange={(value) => {
                        setCustomFrequency(value);
                        // Reset custom values when changing frequency
                        setCustomRepeatInterval(1);
                        setCustomRepeatDays([]);
                      }}
                      suffixIcon={<FiChevronDown size={14} />}
                    >
                      <Option value="weekly">Weekly</Option>
                      <Option value="monthly">Monthly</Option>
                      <Option value="yearly">Yearly</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label={<span style={formItemStyle}>Repeat Every</span>}
                  >
                    <Input.Group compact>
                      <Input
                        type="number"
                        min={1}
                        value={customRepeatInterval}
                        onChange={(e) =>
                          setCustomRepeatInterval(e.target.value)
                        }
                        style={{
                          width: "20%",
                          ...inputStyle,
                          borderTopRightRadius: 0,
                          borderBottomRightRadius: 0,
                        }}
                      />
                      <div
                        style={{
                          lineHeight: "48px",
                          padding: "0 16px",
                          backgroundColor: "#f3f4f6",
                          border: "1px solid #e6e8eb",
                          borderLeft: "none",
                          borderTopRightRadius: "10px",
                          borderBottomRightRadius: "10px",
                        }}
                      >
                        {customFrequency === "weekly"
                          ? "weeks"
                          : customFrequency === "monthly"
                          ? "months"
                          : "years"}
                      </div>
                    </Input.Group>
                  </Form.Item>

                  {customFrequency === "weekly" && (
                    <Form.Item
                      label={<span style={formItemStyle}>On These Days</span>}
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!customRepeatDays.length) {
                              return Promise.reject(
                                "Please select at least one day"
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        {["S", "M", "T", "W", "T", "F", "S"].map(
                          (day, index) => (
                            <Button
                              key={day}
                              type={
                                customRepeatDays.includes(index)
                                  ? "primary"
                                  : "default"
                              }
                              shape="circle"
                              onClick={() => {
                                const newDays = customRepeatDays.includes(index)
                                  ? customRepeatDays.filter((d) => d !== index)
                                  : [...customRepeatDays, index];
                                setCustomRepeatDays(newDays);
                              }}
                              style={{
                                width: "40px",
                                height: "40px",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                ...(customRepeatDays.includes(index)
                                  ? {
                                      background:
                                        "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                      border: "none",
                                    }
                                  : {}),
                              }}
                            >
                              {day}
                            </Button>
                          )
                        )}
                      </div>
                    </Form.Item>
                  )}
                </div>
              )}

              <div
                style={{
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  padding: "16px",
                  marginTop: "16px",
                  backgroundColor: "#f8fafc",
                }}
              >
                <Form.Item
                  label={<span style={formItemStyle}>Ends</span>}
                  style={{ marginBottom: "16px" }}
                >
                  <Radio.Group
                    value={repeatEndType}
                    onChange={(e) => setRepeatEndType(e.target.value)}
                  >
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Radio value="never">Never</Radio>
                      <Radio value="after">
                        <Space align="center">
                          After{" "}
                          <Input
                            type="number"
                            min={1}
                            value={repeatTimes}
                            onChange={(e) => setRepeatTimes(e.target.value)}
                            style={{
                              width: "60px",
                              ...inputStyle,
                              height: "32px",
                            }}
                            disabled={repeatEndType !== "after"}
                          />{" "}
                          Times
                        </Space>
                      </Radio>
                      <Radio value="on">
                        <Space align="center">
                          On{" "}
                          <DatePicker
                            value={repeatEndDate}
                            onChange={(date) => setRepeatEndDate(date)}
                            disabled={repeatEndType !== "on"}
                            format="DD/MM/YYYY"
                            style={{
                              ...inputStyle,
                              height: "32px",
                            }}
                            disabledDate={disableRepeatEndDate}
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
          name="description"
          label={<span style={formItemStyle}>Description</span>}
        >
          <TextArea
            placeholder="Enter task description"
            rows={4}
            style={{
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "24px",
          }}
        >
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

    <style>
      {`
        .ant-form-item-required::before {
          display: none !important;
        }
      `}
    </style>


    </>
  );
};

export default CreatefollowupTask;
