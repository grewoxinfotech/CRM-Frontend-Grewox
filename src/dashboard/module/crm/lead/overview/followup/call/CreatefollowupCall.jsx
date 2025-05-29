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
  FiChevronDown,
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

const CreateFollowupCall = ({
  open,
  onCancel,
  onSubmit,
  initialDate,
  initialTime,
  leadId,
}) => {
  const [form] = Form.useForm();
  const [selectedCallType, setSelectedCallType] = useState(null);
  const currentUser = useSelector(selectCurrentUser);
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);

  const [createFollowupCall, { isLoading: followupCallResponseLoading }] =
    useCreateFollowupCallMutation();
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

  const handleSubmit = async (values) => {
    const assignedToArray = Array.isArray(values.assigned_to)
      ? values.assigned_to
      : [values.assigned_to].filter(Boolean);

    try {
      const formattedValues = {
        ...values,
        assigned_to: {
          assigned_to: assignedToArray,
        },
        call_type: "scheduled",
        section: "lead",
        call_status: "in_progress",
        call_start_date: values.call_start_date
          ? values.call_start_date.format("YYYY-MM-DD")
          : null,
        call_start_time: values.call_start_time
          ? values.call_start_time.format("HH:mm:ss")
          : null,
      };

      await createFollowupCall({ id: leadId, data: formattedValues });
      message.success("Call scheduled successfully");
      form.resetFields();
      onCancel();

      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error("Error scheduling call:", error);
      message.error("Failed to schedule call");
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
              Schedule Call
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Add a new call to your lead
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
        {/* Schedule Information */}
        <div style={{ display: "flex", gap: "16px", marginTop: "20px" }}>
          <Form.Item
            name="call_start_date"
            label={<span style={formItemStyle}>Call Date <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please select date" }]}
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
            label={<span style={formItemStyle}>Call Time <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please select time" }]}
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

        {/* Duration and Reminder */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <Form.Item
            name="priority"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Priority <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select priority" }]}
          >
            <Select
              placeholder="Select priority"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="highest">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
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
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
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
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
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
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
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

          <Form.Item
            name="call_reminder"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Reminder <span style={{ color: "#ff4d4f" }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Please select reminder" }]}
          >
            <Select
              placeholder="Select reminder"
              size="large"
              style={{ width: "100%", borderRadius: "10px", height: "48px" }}
            >
              <Option value="5_min">5 minutes before</Option>
              <Option value="10_min">10 minutes before</Option>
              <Option value="15_min">15 minutes before</Option>
              <Option value="30_min">30 minutes before</Option>
              <Option value="1_hour">1 hour before</Option>
            </Select>
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
             listHeight={300}
                 maxTagCount="responsive"
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

        {/* Subject and Purpose */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <Form.Item
            name="subject"
            label={<span style={formItemStyle}>Subject <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input
              placeholder="e.g., Product Demo Call"
              size="large"
              style={{ borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>

          <Form.Item
            name="call_purpose"
            label={<span style={formItemStyle}>Purpose <span style={{ color: "#ff4d4f" }}>*</span></span>}
            rules={[{ required: true, message: "Please enter purpose" }]}
          >
            <Input
              placeholder="Enter purpose"
              size="large"
              style={{ borderRadius: "10px", height: "48px" }}
            />
          </Form.Item>
        </div>

        {/* Notes */}
        <Form.Item
          name="call_notes"
          label="Notes"
          style={{ marginTop: "20px" }}
        >
          <TextArea
            placeholder="Enter any notes or talking points for the call"
            rows={4}
            style={{
              borderRadius: "10px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
          />
        </Form.Item>

        {/* Action Buttons */}
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
            Schedule Call
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateFollowupCall;
