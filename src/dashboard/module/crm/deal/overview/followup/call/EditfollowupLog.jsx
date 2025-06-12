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
import { useUpdateFollowupCallMutation } from "./services/followupCallApi";
import CreateUser from "../../../../../user-management/users/CreateUser";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditLog = ({ open, onCancel, onSubmit, callId, callData, rtiId }) => {
  const [form] = Form.useForm();
  const [repeatType, setRepeatType] = useState("none");
  const [repeatEndType, setRepeatEndType] = useState("never");
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [showReminder, setShowReminder] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [callDuration, setCallDuration] = useState("");
  const [updateFollowupCall, { isLoading: followupCallResponseLoading }] =
    useUpdateFollowupCallMutation();

  console.log("callData", callData);

  const currentUser = useSelector(selectCurrentUser);
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);

  // Get subclient role ID to filter it out
  const subclientRoleId = rolesData?.data?.find(
    (role) => role?.role_name === "sub-client"
  )?.id;

  const handleCreateUserSuccess = (newUser) => {
    setIsCreateUserVisible(false);
    const currentAssignees = form.getFieldValue("assigned_to") || [];
    form.setFieldValue("assigned_to", [...currentAssignees, newUser.id]);
  };
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

  // Set initial form values when call data is loaded
  useEffect(() => {
    if (callData) {
      // Parse assigned_to (participants)
      let assignedTo = { assigned_to: [] };
      if (callData.assigned_to) {
        try {
          assignedTo =
            typeof callData.assigned_to === "string"
              ? JSON.parse(callData.assigned_to)
              : callData.assigned_to;
        } catch (e) {
          console.error("Error parsing assigned_to:", e);
        }
      }

      // Convert IDs to usernames
      const assignedUsernames = assignedTo?.assigned_to?.map(userId => {
        const user = usersResponse?.data?.find(u => u.id === userId);
        return user?.username;
      }).filter(username => username) || [currentUser?.username];

      // Set form values
      const formValues = {
        subject: callData.subject || "",
        call_start_date: callData.call_start_date
          ? dayjs(callData.call_start_date)
          : null,
        call_start_time: callData.call_start_time
          ? dayjs(callData.call_start_time, "HH:mm:ss")
          : null,
        call_end_time: callData.call_end_time
          ? dayjs(callData.call_end_time, "HH:mm:ss")
          : null,
        call_duration: callData.call_duration || "",
        call_reminder: callData.call_reminder || null,
        assigned_to: assignedUsernames,
        call_purpose: callData.call_purpose || "",
        call_notes: callData.call_notes || "",
        call_type: callData.call_type || "log",
        call_status: callData.call_status || "not_started",
        priority: callData.priority || "medium",
        rti_id: rtiId || callData.rti_id || null,
      };

      form.setFieldsValue(formValues);
    }
  }, [callData, form, rtiId, usersResponse?.data, currentUser]);

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
      const formattedValues = {
        ...values,
        call_type: "log",
        priority: values.priority || "medium",
        section: "deal",
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
          assigned_to: values.assigned_to && values.assigned_to.length > 0
            ? values.assigned_to.map(username => {
                const user = usersResponse?.data?.find(u => u.username === username);
                return user?.id;
              }).filter(id => id)
            : [currentUser?.id]
        },
      };

      await updateFollowupCall({ id: callId, data: formattedValues });
      message.success("Call updated successfully");
      form.resetFields();
      onCancel();

      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error("Error updating call:", error);
      message.error("Failed to update call");
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
              Edit Call Log
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update call log details
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
            label="Call Start Date"
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
            label="Call Start Time"
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
            label="Call End Time"
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
            label="Call Status"
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
            label="Priority"
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
            label="Call Duration"
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
              initialValue={[currentUser?.username]}
            >
              <Select
                mode="multiple"
                placeholder="Select team members"
                style={{
                  width: "100%", 
                  height: "auto",
                  minHeight: "48px",
                }}
                listHeight={300}
                maxTagCount="responsive"
                maxTagTextLength={15}
                dropdownStyle={{
                  maxHeight: "400px",
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
                <Option key={currentUser?.username} value={currentUser?.username}>
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
                      {currentUser?.profilePic ? (
                        <img
                          src={currentUser.profilePic}
                          alt={currentUser.username}
                          style={{
                            width: "100%",
                            height: "100%",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        currentUser?.username?.charAt(0) || <FiUser />
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
                        {currentUser?.username}
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
                          background: getRoleColor(currentUser?.roleName).color,
                          boxShadow: `0 0 8px ${getRoleColor(currentUser?.roleName).color}`,
                          animation: "pulse 2s infinite",
                        }}
                      />
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          background: getRoleColor(currentUser?.roleName).bg,
                          color: getRoleColor(currentUser?.roleName).color,
                          border: `1px solid ${getRoleColor(currentUser?.roleName).border}`,
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      >
                        {currentUser?.roleName || "User"}
                      </span>
                    </div>
                  </div>
                </Option>
                {Array.isArray(users) &&
                  users.map((user) => {
                    const userRole = rolesData?.data?.find(
                      (role) => role.id === user.role_id
                    );
                    const roleStyle = getRoleColor(userRole?.role_name);

                    return (
                      <Option key={user.username} value={user.username}>
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
            label="Subject"
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
            label="Call Purpose"
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
            label="Notes"
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
            Update Call
          </Button>
        </div>
      </Form>
    </Modal>
    <CreateUser
        visible={isCreateUserVisible}
        onCancel={() => {
          setIsCreateUserVisible(false);
          setTeamMembersOpen(true);
        }}
        onSuccess={handleCreateUserSuccess}
      />
    </>
  );
};

export default EditLog;
