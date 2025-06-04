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
  Avatar,
  Switch,
  Radio,
  Space,
  Divider,
} from "antd";
import {
  FiX,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiUser,
  FiShield,
  FiBriefcase,
  FiChevronDown,
  FiLink,
  FiUserPlus,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useGetUsersQuery } from "../../../../../user-management/users/services/userApi";
import { useGetRolesQuery } from "../../../../../hrm/role/services/roleApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../../auth/services/authSlice";
import { message } from "antd";
import {
  useUpdateFollowupMeetingMutation,
  useGetFollowupMeetingByIdQuery,
} from "./services/followupMettingApi";
import CreateUser from "../../../../../user-management/users/CreateUser";

const { Text } = Typography;
const { Option } = Select;

const EditFollowupMeeting = ({
  open,
  onCancel,
  onSubmit,
  meetingId,
  meetingData,
}) => {
  // Use the same state variables as CreateFollowupMeeting
  const [form] = Form.useForm();
  const [repeatType, setRepeatType] = useState("none");
  const [repeatEndType, setRepeatEndType] = useState("never");
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [showRepeat, setShowRepeat] = useState(false);
  const [customRepeatInterval, setCustomRepeatInterval] = useState(1);
  const [customRepeatDays, setCustomRepeatDays] = useState([]);
  const [customFrequency, setCustomFrequency] = useState("weekly");
  const [repeatEndDate, setRepeatEndDate] = useState(null);
  const [venueType, setVenueType] = useState(null);
  const [showReminder, setShowReminder] = useState(false);
  const [meetingType, setMeetingType] = useState(null);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);

  // Add queries and mutations
  const [updateFollowupMeeting] = useUpdateFollowupMeetingMutation();
  const currentUser = useSelector(selectCurrentUser);
  const { data: usersResponse, isLoading: usersLoading } = useGetUsersQuery();
  const { data: rolesData } = useGetRolesQuery();

  // Filter users (same as create component)
  const subclientRoleId = rolesData?.data?.find(
    (role) => role?.role_name === "sub-client"
  )?.id;
  const users =
    usersResponse?.data?.filter(
      (user) =>
        user?.created_by === currentUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];

  const handleCreateUser = () => {
    setIsCreateUserVisible(true);
  };
  
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
  // Add useEffect to set initial form values when meeting data is loaded
  useEffect(() => {
    if (meetingData) {
      try {
        // Parse assigned_to (participants)
        let assignedTo = meetingData.assigned_to;
        if (typeof assignedTo === "string") {
          try {
            assignedTo = JSON.parse(assignedTo);
          } catch (e) {
            assignedTo = { assigned_to: [] };
          }
        }

        // Get usernames from assigned_to IDs
        const assignedUsernames = assignedTo?.assigned_to?.map(userId => {
          const user = usersResponse?.data?.find(u => u.id === userId);
          return user?.username;
        }).filter(username => username) || [currentUser?.username];

        // Parse reminder data
        let reminderData = meetingData.reminder;
        if (typeof reminderData === "string") {
          try {
            reminderData = JSON.parse(reminderData);
            setShowReminder(!!reminderData);
          } catch (e) {
            reminderData = null;
          }
        }

        // Parse repeat data
        let repeatData = meetingData.repeat;
        if (typeof repeatData === "string") {
          try {
            repeatData = JSON.parse(repeatData);
            if (repeatData) {
              setRepeatType(repeatData.repeat_type || "none");
              setRepeatEndType(repeatData.repeat_end_type || "never");
              setRepeatTimes(repeatData.repeat_times || 1);
              setCustomRepeatInterval(repeatData.custom_repeat_interval || 1);
              setCustomRepeatDays(repeatData.custom_repeat_days || []);
              setCustomFrequency(
                repeatData.custom_repeat_frequency || "weekly"
              );
              setRepeatEndDate(
                repeatData.repeat_end_date
                  ? dayjs(repeatData.repeat_end_date)
                  : null
              );
              setShowRepeat(true);
            }
          } catch (e) {
            console.error("Error parsing repeat data:", e);
          }
        }

        // Set meeting type and venue
        if (meetingData.meeting_type) {
          setMeetingType(meetingData.meeting_type);
          if (meetingData.meeting_type === "offline") {
            setVenueType(meetingData.venue);
          }
        }

        // Set form values
        form.setFieldsValue({
          title: meetingData.title || "",
          meeting_type: meetingData.meeting_type || undefined,
          venue: meetingData.venue || undefined,
          location: meetingData.location || undefined,
          meeting_link: meetingData.meeting_link || undefined,
          from_date: meetingData.from_date ? dayjs(meetingData.from_date) : null,
          from_time: meetingData.from_time ? dayjs(meetingData.from_time, "HH:mm:ss") : null,
          to_date: meetingData.to_date ? dayjs(meetingData.to_date) : null,
          to_time: meetingData.to_time ? dayjs(meetingData.to_time, "HH:mm:ss") : null,
          assigned_to: assignedUsernames,
          participants_reminder: meetingData.participants_reminder || undefined,
          reminder_date: reminderData ? dayjs(reminderData.reminder_date) : null,
          reminder_time: reminderData ? dayjs(reminderData.reminder_time, "HH:mm:ss") : null,
          repeat: repeatData?.repeat_type || "none",
        });
      } catch (error) {
        console.error("Error setting form values:", error);
        message.error("Error loading meeting data");
      }
    }
  }, [meetingData, form, usersResponse?.data, currentUser]);

  // Update handleSubmit for editing
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
              repeat_times:
                repeatEndType === "after"
                  ? parseInt(repeatTimes)
                  : repeatEndType === "never"
                  ? null
                  : 1,
              repeat_end_date:
                repeatEndType === "on"
                  ? repeatEndDate?.format("YYYY-MM-DD")
                  : null,
              custom_repeat_interval:
                repeatType === "custom" ? parseInt(customRepeatInterval) : 1,
              custom_repeat_days:
                repeatType === "custom" ? customRepeatDays : [],
              custom_repeat_frequency:
                repeatType === "custom" ? customFrequency : "weekly",
            }
          : null;

      // Format the final payload
      const formattedValues = {
        title: values.title,
        section: "deal",
        meeting_type: values.meeting_type,
        venue: values.venue,
        location: values.location,
        meeting_link: values.meeting_link,
        from_date: values.from_date.format("YYYY-MM-DD"),
        from_time: values.from_time.format("HH:mm:ss"),
        to_date: values.to_date.format("YYYY-MM-DD"),
        to_time: values.to_time.format("HH:mm:ss"),
        meeting_status: "in_progress",
        assigned_to: {
          assigned_to: values.assigned_to && values.assigned_to.length > 0
            ? values.assigned_to.map(username => {
                const user = usersResponse?.data?.find(u => u.username === username);
                return user?.id;
              }).filter(id => id)
            : [currentUser?.id]
        },
        reminder: reminderData,
        repeat: repeatData,
        participants_reminder: values.participants_reminder,
        updated_by: currentUser?.username,
      };

      // Make API call to update meeting
      await updateFollowupMeeting({
        id: meetingId,
        data: formattedValues,
      }).unwrap();
      message.success("Meeting updated successfully");
      onCancel();

      if (onSubmit) {
        onSubmit(formattedValues);
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      message.error("Failed to update meeting");
    }
  };

  // Copy all the helper functions and styles from CreateFollowupMeeting
  const getRoleStyle = (roleName) => {
    const roleColors = {
      employee: {
        color: "#D46B08",
        bg: "#FFF7E6",
        border: "#FFD591",
        icon: <FiUser style={{ fontSize: "14px" }} />,
      },
      admin: {
        color: "#096DD9",
        bg: "#E6F7FF",
        border: "#91D5FF",
        icon: <FiShield style={{ fontSize: "14px" }} />,
      },
      manager: {
        color: "#08979C",
        bg: "#E6FFFB",
        border: "#87E8DE",
        icon: <FiBriefcase style={{ fontSize: "14px" }} />,
      },
      default: {
        color: "#531CAD",
        bg: "#F9F0FF",
        border: "#D3ADF7",
        icon: <FiUser style={{ fontSize: "14px" }} />,
      },
    };
    return roleColors[roleName?.toLowerCase()] || roleColors.default;
  };

  const handleVenueChange = (value) => {
    setVenueType(value);
    // If venue is online, clear the location field
    if (value === "online") {
      form.setFieldsValue({ location: undefined });
    }
  };

  const handleCreateUserSuccess = (newUser) => {
    setIsCreateUserVisible(false);
    const currentAssignees = form.getFieldValue("assigned_to") || [];
    form.setFieldValue("assigned_to", [...currentAssignees, newUser.id]);
  };

  const handleRepeatToggle = (checked) => {
    setRepeatType(checked ? "daily" : "none");
  };

  // Copy all the style constants
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

  const selectStyle = {
    width: "100%",
    height: "48px",
  };

  // Return the same form structure as CreateFollowupMeeting, but with updated title
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
            <FiUsers style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Edit Meeting
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update meeting details
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Form.Item name="title" label="Title">
            <Input
              placeholder="Enter meeting title"
              size="large"
              style={{
                borderRadius: "10px",
                height: "48px",
              }}
            />
          </Form.Item>

          <Form.Item name="meeting_type" label="Meeting Type">
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
                  location: undefined,
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {meetingType === "offline" && (
              <>
                <Form.Item name="venue" label="Meeting Venue">
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
                  <Form.Item name="location" label="Location">
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

            {meetingType === "online" && (
              <Form.Item
                name="meeting_link"
                label="Meeting Link"
                style={{ gridColumn: "1 / -1" }}
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <Form.Item name="from_date" label="Meeting Start Date">
            <DatePicker
              format="DD/MM/YYYY"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
            />
          </Form.Item>

          <Form.Item name="from_time" label="Meeting Start Time">
            <TimePicker
              format="hh:mm A"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              use12Hours
            />
          </Form.Item>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <Form.Item name="to_date" label="Meeting End Date">
            <DatePicker
              format="DD/MM/YYYY"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              suffixIcon={<FiCalendar style={{ color: "#4096ff" }} />}
            />
          </Form.Item>

          <Form.Item name="to_time" label="Meeting End Time">
            <TimePicker
              format="hh:mm A"
              style={{
                width: "100%",
                borderRadius: "10px",
                height: "48px",
              }}
              use12Hours
            />
          </Form.Item>
        </div>

        <div
        
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
        </div>
        <Form.Item
          name="meeting_status"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Meeting Status
            </span>
          }
          rules={[{ required: true, message: "Please select meeting status" }]}
          initialValue="scheduled"
        >
          <Select
            placeholder="Select status"
            size="large"
            style={{
              width: "100%",
              borderRadius: "10px",
              height: "48px",
            }}
          >
            <Option value="scheduled">
              <Tag color="processing">Scheduled</Tag>
            </Option>
            <Option value="in_progress">
              <Tag color="warning">In Progress</Tag>
            </Option>
            <Option value="completed">
              <Tag color="success">Completed</Tag>
            </Option>
            <Option value="cancelled">
              <Tag color="error">Cancelled</Tag>
            </Option>
            <Option value="postponed">
              <Tag color="default">Postponed</Tag>
            </Option>
          </Select>
        </Form.Item>

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
              Repeat
            </Text>
            <Switch
              checked={repeatType !== "none"}
              onChange={handleRepeatToggle}
            />
          </div>

          {repeatType !== "none" && (
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
                      onChange={(value) => setCustomFrequency(value)}
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

                  {customFrequency === "monthly" && (
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

                  {customFrequency === "yearly" && (
                    <Form.Item label={<span style={formItemStyle}>On</span>}>
                      <Space direction="vertical">
                        <Space>
                          <Select style={{ width: 120 }} defaultValue="1">
                            {Array.from({ length: 12 }, (_, i) => (
                              <Option key={i + 1} value={i + 1}>
                                {new Date(2024, i, 1).toLocaleString(
                                  "default",
                                  { month: "long" }
                                )}
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
            label={<span style={formItemStyle}>Priority <span style={{ color: "#ff4d4f" }}></span></span>}
            rules={[{ required: true, message: "Please select priority" }]}
            initialValue="medium"
          >
            <Select
              placeholder="Select priority"
              style={selectStyle}
              suffixIcon={<FiChevronDown size={14} />}
              defaultValue="medium"
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
          name="participants_reminder"
          label="Participants Reminder"
          // style={{ marginTop: "20px" }}
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
            <Option value="5_min">5 minutes before</Option>
            <Option value="10_min">10 minutes before</Option>
            <Option value="15_min">15 minutes before</Option>
            <Option value="30_min">30 minutes before</Option>
            <Option value="1_hour">1 hour before</Option>
          </Select>
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
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            }}
          >
            Update Meeting
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

export default EditFollowupMeeting;
