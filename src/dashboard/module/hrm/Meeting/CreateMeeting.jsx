import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Select,
  Row,
  Col,
  DatePicker,
  TimePicker,
  message,
} from "antd";
import { FiX, FiUsers, FiMapPin, FiCalendar, FiClock } from "react-icons/fi";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import { useGetAllDepartmentsQuery } from "../Department/services/departmentApi";
import { useGetAllSubclientsQuery } from "../../user-management/subclient/services/subClientApi";
import { useCreateMeetingMutation } from "./services/meetingApi";
import { useSelector } from "react-redux";
import { useGetRolesQuery } from "../role/services/roleApi";

dayjs.extend(customParseFormat);

const { Text } = Typography;
const { TextArea } = Input;

const CreateMeeting = ({ open, onCancel, loading }) => {
  const [form] = Form.useForm();

  const [createMeeting, { isLoading: isCreating }] = useCreateMeetingMutation();

  const { data: subClientsData, isLoading: subClientsLoading } =
    useGetAllSubclientsQuery();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useGetAllDepartmentsQuery();
  const { data: employeesData, isLoading: employeesLoading } =
    useGetEmployeesQuery();
  const { data: rolesData } = useGetRolesQuery();

  // Transform departments data
  const departments = React.useMemo(() => {
    if (!departmentsData) return [];
    if (Array.isArray(departmentsData)) return departmentsData;
    if (Array.isArray(departmentsData.data)) return departmentsData.data;
    return [];
  }, [departmentsData]);

  // Transform subclients data
  const subclients = React.useMemo(() => {
    if (!subClientsData) return [];
    if (Array.isArray(subClientsData)) return subClientsData;
    if (Array.isArray(subClientsData.data)) return subClientsData.data;
    return [];
  }, [subClientsData]);

  // Transform employees data for better logging
  const employeeOptions = React.useMemo(() => {
    if (!employeesData?.data) return [];
    return employeesData.data.map((emp) => ({
      value: emp.id,
      label: `${emp.firstName} ${emp.lastName || ""}`,
      avatar: emp.avatarUrl,
      profile: emp.profile,
      role: emp.role,
      roleColor: emp.roleColor || "#a259f7",
      username: emp.username,
    }));
  }, [employeesData]);

  useEffect(() => {
    form.resetFields();
  }, [form]);

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        title: values.title,
        department: values.department,
        section: "meeting",
        employee: values.employees || [],
        description: values.notes,
        date: values.date && dayjs(values.date).format("YYYY-MM-DD"),
        startTime: values.startTime && dayjs(values.startTime).format("HH:mm"),
        endTime: values.endTime && dayjs(values.endTime).format("HH:mm"),
        meetingLink: values.meetingLink || null,
        status: values.status || "scheduled",
        client: values.client,
      };

      const response = await createMeeting(formattedValues).unwrap();
      if (response.success) {
        message.success("Meeting scheduled successfully");
        form.resetFields();
        onCancel();
      } else {
        throw new Error(response.message || "Failed to create meeting");
      }
    } catch (error) {
      message.error(error?.data?.message || "Failed to schedule meeting");
    }
  };

  // Helper for role badge color (similar to members UI)
  const getRoleStyle = (role) => {
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

  const getRoleName = (role_id) => {
    if (!rolesData?.data) return "Employee";
    const foundRole = rolesData.data.find((role) => role.id === role_id);
    return foundRole ? foundRole.role_name : "Employee";
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="meeting-form-modal"
      style={{
        "--antd-arrow-background-color": "#ffffff",
      }}
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
              Schedule New Meeting
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to schedule meeting
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Meeting Title <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please enter meeting title" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                      return Promise.reject(
                        new Error(
                          "Meeting title must contain both uppercase and lowercase English letters"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                prefix={
                  <FiUsers style={{ color: "#1890ff", fontSize: "16px" }} />
                }
                placeholder="Enter meeting title"
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
          </Col>
          <Col span={12}>
            <Form.Item
              name="department"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Department <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select
                placeholder="Select department"
                size="large"
                listHeight={100}
                dropdownStyle={{
                  Height: "100px",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollBehavior: "smooth",
                }}
                loading={departmentsLoading}
                style={{
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                options={
                  departments.map((dept) => ({
                    value: dept.id,
                    label: dept.department_name,
                  })) || []
                }
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="employees"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Employees <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select employees" }]}
            >
              <Select
                mode="multiple"
                listHeight={100}
                dropdownStyle={{
                  Height: "100px",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollBehavior: "smooth",
                }}
                placeholder="Select employees"
                size="large"
                loading={employeesLoading}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                showSearch
                filterOption={(input, option) =>
                  option?.data?.username
                    ?.toLowerCase()
                    .includes(input.toLowerCase())
                }
                maxTagCount={2}
                maxTagTextLength={10}
                maxTagPlaceholder={(omittedValues) => (
                  <span
                    style={{
                      background: "#f4f6fa",
                      borderRadius: 6,
                      padding: "2px 8px",
                      // color: '#7c3aed',
                      fontWeight: 500,
                      fontSize: 13,
                      // border: '1px solidrgb(9, 12, 24)',
                      marginLeft: 4,
                      display: "inline-block",
                    }}
                  >
                    + {omittedValues.length} ...
                  </span>
                )}
                optionLabelProp="label"
                tagRender={({ label, value, closable, onClose }) => {
                  // Find the employee data
                  const emp = employeeOptions.find((e) => e.value === value);
                  if (!emp) return label;
                  const roleStyle = getRoleStyle(emp.role);
                  return (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "2px 6px",
                        borderRadius: 6,
                        background: "#f4f6fa",
                        marginRight: 4,
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#e6f4ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textTransform: "uppercase",
                          fontSize: 13,
                          fontWeight: 500,
                          overflow: "hidden",
                        }}
                      >
                        {emp.avatar ? (
                          <img
                            src={emp.avatar}
                            alt={emp.username}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          emp.username?.charAt(0) || "?"
                        )}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>
                        {emp.username}
                      </span>
                      <span
                        style={{
                          padding: "1px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          background: roleStyle.bg,
                          color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`,
                          fontWeight: 500,
                          textTransform: "capitalize",
                        }}
                      >
                        {getRoleName(emp.role)}
                      </span>
                      {closable && (
                        <span
                          onClick={onClose}
                          style={{
                            cursor: "pointer",
                            marginLeft: 4,
                            color: "#bbb",
                          }}
                        >
                          ×
                        </span>
                      )}
                    </div>
                  );
                }}
                options={employeeOptions.map((emp) => {
                  const roleStyle = getRoleStyle(emp.role);
                  return {
                    value: emp.value,
                    data: emp,
                    label: (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "4px 0",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#e6f4ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1890ff",
                            fontSize: 15,
                            fontWeight: 500,
                            textTransform: "uppercase",
                            overflow: "hidden",
                          }}
                        >
                          {emp.avatar ? (
                            <img
                              src={emp.avatar}
                              alt={emp.username}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            emp.username?.charAt(0) || "?"
                          )}
                        </div>
                        <span
                          style={{
                            fontWeight: 500,
                            color: "rgba(0, 0, 0, 0.85)",
                            fontSize: 14,
                          }}
                        >
                          {emp.username}
                        </span>
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
                            marginLeft: 8,
                          }}
                        >
                          {getRoleName(emp.role)}
                        </span>
                      </div>
                    ),
                  };
                })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="client"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Client <span style={{ color: "#ff4d4f" }}></span>
                </span>
              }
            >
              <Select
                placeholder="Select client"
                listHeight={100}
                dropdownStyle={{
                  Height: "100px",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollBehavior: "smooth",
                }}
                size="large"
                loading={subClientsLoading}
                style={{
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                options={
                  subclients.map((client) => ({
                    value: client.id,
                    label: client.username,
                  })) || []
                }
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="date"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Meeting Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker
                format="DD-MM-YYYY"
                style={{ width: "100%", height: "48px" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Start Time <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select start time" }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%", height: "48px" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endTime"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  End Time <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select end time" }]}
            >
              <TimePicker
                format="HH:mm"
                style={{ width: "100%", height: "48px" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Status <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select
                placeholder="Select status"
                size="large"
                options={[
                  { value: "scheduled", label: "Scheduled" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
                style={{
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="meetingLink"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Meeting Link
                </span>
              }
            >
              <Input
                placeholder="Enter meeting link"
                size="large"
                style={{
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="notes"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Meeting Description <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          rules={[
            { required: true, message: "Please enter meeting description" },
          ]}
        >
          <TextArea
            placeholder="Enter meeting description"
            rows={4}
            style={{
              borderRadius: "10px",
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e6e8eb",
              transition: "all 0.3s ease",
              resize: "none",
            }}
          />
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            htmlType="submit"
            loading={isCreating}
            style={{
              padding: "8px 32px",
              height: "44px",
              borderRadius: "10px",
              fontWeight: "500",
              background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
              border: "none",
              boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Schedule Meeting
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateMeeting;
