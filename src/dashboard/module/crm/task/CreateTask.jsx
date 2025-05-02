import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
  Upload,
  message,
  Tag,
} from "antd";
import {
  FiCheckSquare,
  FiX,
  FiCalendar,
  FiFlag,
  FiMapPin,
  FiUser,
  FiUpload,
  FiShield,
  FiBriefcase,
  FiChevronDown,
  FiUserPlus,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useCreateTaskMutation } from "./services/taskApi";
import { useGetUsersQuery } from "../../user-management/users/services/userApi";
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import CreateUser from "../../user-management/users/CreateUser";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateTask = ({
  open,
  onCancel,
  onSubmit,
  isEditing,
  initialValues,
  relatedId,
  users = [],
  usersLoading,
}) => {
  const [form] = Form.useForm();
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const [fileList, setFileList] = useState([]);
  const [teamMembersOpen, setTeamMembersOpen] = useState(false);
  const [isCreateUserVisible, setIsCreateUserVisible] = useState(false);

  // Add style constants
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

  const currentUser = useSelector(selectCurrentUser);
  const { data: usersResponse } = useGetUsersQuery();
  const { data: rolesData } = useGetRolesQuery();

  // Get subclient role ID to filter it out
  const subclientRoleId = rolesData?.data?.find(
    (role) => role?.role_name === "sub-client"
  )?.id;

  // Filter users to get team members (excluding subclients)
  const teamMembers =
    usersResponse?.data?.filter(
      (user) =>
        user?.created_by === currentUser?.username &&
        user?.role_id !== subclientRoleId
    ) || [];

  // Define roleStyles object outside of the map function
  const roleStyles = {
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

  const handleCreateUser = () => {
    setIsCreateUserVisible(true);
    setTeamMembersOpen(false);
  };

  const handleCreateUserSuccess = (newUser) => {
    setIsCreateUserVisible(false);
    setTeamMembersOpen(true);
    form.setFieldValue("assignTo", [
      ...(form.getFieldValue("assignTo") || []),
      newUser.id,
    ]);
  };

  useEffect(() => {
    if (initialValues) {
      const formattedValues = {
        ...initialValues,
        startDate: initialValues.startDate
          ? dayjs(initialValues.startDate)
          : null,
        dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : null,
        reminder_date: initialValues.reminder_date
          ? dayjs(initialValues.reminder_date)
          : null,
        assignTo: initialValues.assignTo || [],
      };
      form.setFieldsValue(formattedValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      formData.append("taskName", values.taskName || "");
      formData.append("section", "task");
      formData.append("task_reporter", values.task_reporter || "");
      formData.append(
        "startDate",
        values.startDate?.format("YYYY-MM-DD") || ""
      );
      formData.append("dueDate", values.dueDate?.format("YYYY-MM-DD") || "");
      formData.append(
        "reminder_date",
        values.reminder_date?.format("YYYY-MM-DD") || ""
      );
      formData.append("priority", values.priority || "");
      formData.append("status", values.status || "");
      formData.append("description", values.description || "");

      if (Array.isArray(values.assignTo) && values.assignTo.length > 0) {
        values.assignTo.forEach((userId, index) => {
          if (userId && userId.trim() !== "") {
            formData.append(`assignTo[assignedusers][${index}]`, userId);
          }
        });
      }

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("file", fileList[0].originFileObj);
      }

      const response = await createTask({
        id: relatedId,
        data: formData,
      }).unwrap();

      // message.success("Task created successfully");
      form.resetFields();
      setFileList([]);
      onSubmit(response);
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(error?.data?.message || "Failed to create task");
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
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
              {isEditing ? "Edit Task" : "Create New Task"}
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              {isEditing
                ? "Update task information"
                : "Fill in the information to create task"}
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        style={{
          padding: "24px",
        }}
      >
        <Form.Item
          name="taskName"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Task Name <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          rules={[
            { required: true, message: "Please enter task name" },
            { max: 100, message: "Task name cannot exceed 100 characters" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                  return Promise.reject(
                      new Error('Task name must contain both uppercase or lowercase English letters')
                  );
              }
              return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            prefix={<FiMapPin style={{ color: "#1890ff", fontSize: "16px" }} />}
            placeholder="Enter task name"
            size="large"
            style={{
              borderRadius: "10px",
              padding: "8px 16px",
              height: "48px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
              transition: "all 0.3s ease",
            }}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Start Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dueDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Due Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select due date" }]}
            >
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="priority"
              label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Priority <span style={{ color: "#ff4d4f" }}>*</span></span>}
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
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label={<span style={{ fontSize: "14px", fontWeight: "500" }}>Status <span style={{ color: "#ff4d4f" }}>*</span></span>}
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                placeholder="Select status"
                style={selectStyle}
                suffixIcon={<FiChevronDown size={14} />}
              >
                <Option value="not_started">
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
                        backgroundColor: "#d9d9d9",
                      }}
                    />
                    Not Started
                  </div>
                </Option>
                <Option value="in_progress">
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
                    In Progress
                  </div>
                </Option>
                <Option value="completed">
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
                    Completed
                  </div>
                </Option>
                <Option value="on_hold">
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
                    On Hold
                  </div>
                </Option>
                <Option value="cancelled">
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
                    Cancelled
                  </div>
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="assignTo"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Assign To <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please select assignees" }]}
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
            {teamMembers.map((user) => {
              const userRole = rolesData?.data?.find(
                (role) => role.id === user.role_id
              );
              const roleStyle =
                roleStyles[userRole?.role_name?.toLowerCase()] ||
                roleStyles.default;

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
                        {user.username || user.email}
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

        <Form.Item
          name="task_reporter"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Task Reporter <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please select task reporter" }]}
        >
          <Select
            showSearch
            placeholder="Select task reporter"
            style={{
              width: "100%",
              height: "auto",
              minHeight: "48px",
            }}
            listHeight={200}
            maxTagCount={1}
            maxTagTextLength={15}
            dropdownStyle={{
              maxHeight: "320px",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollBehavior: "smooth",
            }}
            popupClassName="team-members-dropdown"
            optionFilterProp="children"
          >
            {users.map((user) => {
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
                        {user.username || user.email}
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

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="reminder_date"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Reminder Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
            >
              <DatePicker
                size="large"
                format="YYYY-MM-DD"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                suffixIcon={<FiCalendar style={{ color: "#1890ff" }} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Description
            </span>
          }
        >
          <TextArea
            placeholder="Enter task description"
            rows={4}
            style={{
              borderRadius: "10px",
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
            }}
          />
        </Form.Item>

        <Form.Item
          name="file"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Task File <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
        >
          <Upload
            maxCount={1}
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={(file) => {
              const isValidFileType = [
                "image/jpeg",
                "image/png",
                "application/pdf",
              ].includes(file.type);
              const isValidFileSize = file.size / 1024 / 1024 < 5;

              if (!isValidFileType) {
                message.error("You can only upload JPG/PNG/PDF files!");
                return Upload.LIST_IGNORE;
              }
              if (!isValidFileSize) {
                message.error("File must be smaller than 5MB!");
                return Upload.LIST_IGNORE;
              }

              return false;
            }}
            customRequest={({ onSuccess }) => {
              onSuccess("ok");
            }}
          >
            <Button
              icon={<FiUpload style={{ marginRight: "8px" }} />}
              style={{
                width: "100%",
                height: "48px",
                borderRadius: "10px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Click to Upload File
            </Button>
          </Upload>
        </Form.Item>

        <Divider style={{ margin: "24px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
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
              fontWeight: "500",
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{
              padding: "8px 32px",
              height: "44px",
              borderRadius: "10px",
              fontWeight: "500",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
            }}
          >
            {isEditing ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </Form>

      {/* Create User Modal */}
      <CreateUser
        visible={isCreateUserVisible}
        onCancel={() => {
          setIsCreateUserVisible(false);
          setTeamMembersOpen(true);
        }}
        onSuccess={handleCreateUserSuccess}
      />

      <style jsx global>{`
        .create-task-modal {
          .ant-select:not(.ant-select-customize-input) .ant-select-selector {
            background-color: #ffffff !important;
            border: 1px solid #d1d5db !important;
            border-radius: 8px !important;
            min-height: 42px !important;
            padding: 4px 8px !important;
            display: flex !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
          }

          .ant-select-focused:not(.ant-select-disabled).ant-select:not(
              .ant-select-customize-input
            )
            .ant-select-selector {
            border-color: #1890ff !important;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1) !important;
          }

          .ant-select-multiple {
            .ant-select-selection-overflow {
              flex-wrap: wrap !important;
              gap: 4px !important;
              padding: 2px !important;
            }

            .ant-select-selection-overflow-item {
              margin: 0 !important;
            }

            .ant-select-selection-placeholder {
              padding: 0 8px !important;
            }
          }

          .ant-select-dropdown {
            padding: 8px !important;
            border-radius: 12px !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;

            .ant-select-item {
              padding: 8px !important;
              border-radius: 8px !important;
              margin: 2px 0 !important;

              &-option-selected {
                background-color: #e6f4ff !important;
                font-weight: 500 !important;
              }

              &-option-active {
                background-color: #f0f7ff !important;
              }

              &:hover {
                background-color: #f0f7ff !important;
              }
            }
          }

          .custom-dropdown {
            .ant-select-item-option-content {
              white-space: normal !important;
              word-break: break-word !important;
            }
          }

          .role-wrapper {
            position: relative;
            padding-left: 12px;
          }

          .role-indicator {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% {
              transform: translateY(-50%) scale(1);
              opacity: 1;
            }
            50% {
              transform: translateY(-50%) scale(1.2);
              opacity: 0.8;
            }
            100% {
              transform: translateY(-50%) scale(1);
              opacity: 1;
            }
          }
        }
      `}</style>
    </Modal>
  );
};

export default CreateTask;
