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
  FiPhone,
  FiUser,
  FiShield,
  FiBriefcase,
  FiUserPlus,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useGetUsersQuery } from "../../../../../user-management/users/services/userApi";
import { useGetRolesQuery } from "../../../../../hrm/role/services/roleApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../../auth/services/authSlice";
import { useCreateFollowupCallMutation } from "./services/followupCallApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateLog = ({
  open,
  onCancel,
  onSubmit,
  initialDate,
  initialTime,
  dealId,
}) => {
  const [form] = Form.useForm();
  const [repeatType, setRepeatType] = useState("none");
  const [repeatEndType, setRepeatEndType] = useState("never");
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [showReminder, setShowReminder] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [callDuration, setCallDuration] = useState("");
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [createFollowupCall, { isLoading: followupCallResponseLoading }] =
    useCreateFollowupCallMutation();

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

     // Add formItemStyle constant
  const formItemStyle = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
  };

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
    const callDate = form.getFieldValue("call_date");
    setShowRepeat(!!callDate);
  }, [form.getFieldValue("call_date")]);

  // Update repeat availability when call date changes
  const handleCallDateChange = (date) => {
    setShowRepeat(!!date);
    if (!date) {
      setRepeatType("none");
    }
  };

  // Handle repeat toggle when no call date is selected
  const handleRepeatToggle = (checked) => {
    if (!showRepeat && checked) {
      message.info("Select a call date to set recurring");
      return;
    }
    setRepeatType(checked ? "daily" : "none");
  };

  // Add function to calculate duration
  const calculateDuration = () => {
    const startTime = form.getFieldValue("call_start_time");
    const endTime = form.getFieldValue("call_end_time");

    if (startTime && endTime) {
      const start = startTime.valueOf();
      const end = endTime.valueOf();

      if (end >= start) {
        const durationMs = end - start;
        const minutes = Math.floor(durationMs / (1000 * 60));
        const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
        setCallDuration(`${minutes} minutes ${seconds} seconds`);
        form.setFieldsValue({
          call_duration: `${minutes} minutes ${seconds} seconds`,
        });
      } else {
        setCallDuration("Invalid duration");
        form.setFieldsValue({ call_duration: "" });
      }
    }
  };

  // Watch for changes in start and end time
  useEffect(() => {
    calculateDuration();
  }, [
    form.getFieldValue("call_start_time"),
    form.getFieldValue("call_end_time"),
  ]);

  const handleSubmit = async (values) => {
    try {
      // If no assignee is selected, assign to current user
      const assignedTo = values.assigned_to
        ? values.assigned_to.map((id) => String(id))
        : [String(currentUser?.id)];

      const formattedValues = {
        ...values,
        call_type: "log",

        call_start_date: values.call_start_date
          ? values.call_start_date.format("YYYY-MM-DD")
          : null,
        call_start_time: values.call_start_time
          ? values.call_start_time.format("HH:mm:ss")
          : null,
        call_end_time: values.call_end_time
          ? values.call_end_time.format("HH:mm:ss")
          : null,
        assigned_to: {
          assigned_to: assignedTo,
        },
      };

      await createFollowupCall({ id: dealId, data: formattedValues });
      message.success("Call logged successfully");
      form.resetFields();
      onCancel();

      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error("Error logging call:", error);
      message.error("Failed to log call");
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
            <FiPhone style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Log a call
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Log your call details
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ padding: "24px" }}
      >
        <Typography.Title level={5} style={{ marginBottom: "24px" }}>
          Call Information
        </Typography.Title>

        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            name="call_start_date"
            label={<span style={formItemStyle}>Call Start Date <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please select start date" }]}
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
            label={<span style={formItemStyle}>Call Start Time <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please select start time" }]}
            style={{ flex: 1 }}
          >
            <TimePicker
              format="hh:mm A"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
              use12Hours
              onChange={() => calculateDuration()}
            />
          </Form.Item>

          <Form.Item
            name="call_end_time"
            label={<span style={formItemStyle}>Call End Time <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please select end time" }]}
            style={{ flex: 1 }}
          >
            <TimePicker
              format="hh:mm A"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
              use12Hours
              onChange={() => calculateDuration()}
            />
          </Form.Item>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <Form.Item
            name="call_status"
            label={<span style={formItemStyle}>Call Status <span style={{ color: "#ff4d4f" }}>*</span></span>}
            initialValue="not_started"
            rules={[{ required: true, message: "Please select call status" }]}
          >
            <Select
              placeholder="Select call status"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="not_started">
                <Tag color="default">Not Started</Tag>
              </Option>
              <Option value="in_progress">
                <Tag color="processing">In Progress</Tag>
              </Option>
              <Option value="completed">
                <Tag color="success">Completed</Tag>
              </Option>
              <Option value="cancelled">
                <Tag color="error">Cancelled</Tag>
              </Option>
              <Option value="no_answer">
                <Tag color="warning">No Answer</Tag>
              </Option>
              <Option value="busy">
                <Tag color="orange">Busy</Tag>
              </Option>
              <Option value="wrong_number">
                <Tag color="red">Wrong Number</Tag>
              </Option>
              <Option value="voicemail">
                <Tag color="purple">Voicemail</Tag>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label={<span style={formItemStyle}>Priority <span style={{ color: "#ff4d4f" }}>*</span></span>}
            initialValue="medium"
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select
              placeholder="Select priority"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="high">
                <Tag color="red">High</Tag>
              </Option>
              <Option value="medium">
                <Tag color="orange">Medium</Tag>
              </Option>
              <Option value="low">
                <Tag color="green">Low</Tag>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="call_duration"
            label={<span style={formItemStyle}>Call Duration <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[
              {
                required: true,
                message: "Call duration will be calculated automatically",
              },
            ]}
          >
            <Input
              placeholder="Duration will be calculated automatically"
              size="large"
              style={{ borderRadius: "10px", height: "48px" }}
              disabled
              value={callDuration}
            />
          </Form.Item>
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
                Assign To
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

        <Typography.Title level={5} style={{ margin: "24px 0" }}>
          Purpose Of Call
        </Typography.Title>

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
            <Input
              placeholder="Outgoing call to contact"
              size="large"
              style={{ borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>

          <Form.Item
            name="call_purpose"
            label={<span style={formItemStyle}>Call Purpose <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please select call purpose" }]}
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
            name="call_notes"
            label={<span style={formItemStyle}>Notes <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please enter call notes" }]}
            style={{ gridColumn: "1 / -1" }}
          >
            <TextArea
              placeholder="Enter call notes"
              rows={4}
              style={{
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
              }}
            />
          </Form.Item>
        </div>

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
            Submit
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateLog;
