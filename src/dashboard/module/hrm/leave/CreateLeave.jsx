import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Select,
  Row,
  Col,
  DatePicker,
  message,
  Switch,
} from "antd";
import { FiFileText, FiX, FiCalendar, FiUser, FiTag } from "react-icons/fi";
import dayjs from "dayjs";
import { useCreateLeaveMutation } from "./services/LeaveApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import "./leave.scss";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CreateLeave = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [createLeave, { isLoading }] = useCreateLeaveMutation();
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesQuery({
      page: 1,
      pageSize: -1,
      search: "",
    });


  const { data: rolesData } = useGetRolesQuery({
    page: 1,
    pageSize: -1,
    search: "",
  });
  const employees = React.useMemo(() => {
    if (!employeesData?.data || !rolesData?.message?.data) return [];

    const rolesList = Array.isArray(rolesData.data) ? rolesData.data : [];
    const employeesList = Array.isArray(employeesData.data) ? employeesData.data : [];

    return employeesList.map(employee => {
      const userRole = rolesList.find(role => role.id === employee.role_id);
      return {
        ...employee,
        role: userRole
      };
    });
  }, [employeesData, rolesData]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        employeeId: values.employeeId,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        leaveType: values.leaveType,
        reason: values.reason,
        isHalfDay: values.isHalfDay || false,
      };

      await createLeave(payload).unwrap();
      message.success("Leave request created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create leave request");
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
            <FiFileText style={{ fontSize: "24px", color: "#ffffff" }} />
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
              Create Leave Request
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create leave request
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
              name="employeeId"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  Employee <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select an employee" }]}
            >
              <Select
                showSearch
                placeholder="Select employee"
                optionFilterProp="label"
                allowClear
                size="large"
                listHeight={100}
                dropdownStyle={{
                  height: '100px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollBehavior: 'smooth'
                }}
                style={{
                  width: '100%',
                  borderRadius: '10px',
                }}
                filterOption={(input, option) => {
                  const label = option?.label?.toString() || '';
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
                options={employees.map(employee => {
                  const roleStyles = {
                    'employee': {
                      color: '#D46B08',
                      bg: '#FFF7E6',
                      border: '#FFD591'
                    },
                    'default': {
                      color: '#531CAD',
                      bg: '#F9F0FF',
                      border: '#D3ADF7'
                    }
                  };

                  const roleStyle = roleStyles[employee.role?.role_name?.toLowerCase()] || roleStyles.default;

                  return {
                    label: (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '4px 0'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: '#e6f4ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#1890ff',
                          fontSize: '16px',
                          fontWeight: '500',
                          textTransform: 'uppercase'
                        }}>
                          {employee.profilePic ? (
                            <img
                              src={employee.profilePic}
                              alt={employee.firstName + ' ' + employee.lastName}
                              style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover'
                              }}
                            />
                          ) : (
                            <FiUser style={{ fontSize: '20px' }} />
                          )}
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          flex: 1
                        }}>
                          <span style={{
                            fontWeight: 500,
                            color: 'rgba(0, 0, 0, 0.85)',
                            fontSize: '14px'
                          }}>
                            {`${employee.firstName} ${employee.lastName}`}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <div
                            className="role-indicator"
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: roleStyle.color,
                              boxShadow: `0 0 8px ${roleStyle.color}`,
                              animation: 'pulse 2s infinite'
                            }}
                          />
                          <span style={{
                            padding: '0px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: roleStyle.bg,
                            color: roleStyle.color,
                            border: `1px solid ${roleStyle.border}`,
                            fontWeight: 500,
                            textTransform: 'capitalize'
                          }}>
                            {employee.role?.role_name || 'User'}
                          </span>
                        </div>
                      </div>
                    ),
                    value: employee.id
                  };
                })}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="leaveType"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiTag style={{ marginRight: "8px", color: "#1890ff" }} />
                  Leave Type <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select leave type" }]}
            >
              <Select
                listHeight={100}
                dropdownStyle={{
                  Height: '100px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollBehavior: "smooth",
                }}
                placeholder="Select Leave Type"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="annual">Annual Leave</Option>
                <Option value="sick">Sick Leave</Option>
                <Option value="casual">Casual Leave</Option>
                <Option value="other">Other Leave</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12} style={{ marginTop: '22px' }}>
            <Form.Item
              name="startDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Start Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select start date" }]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                }}
                size="large"
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </Col>

          <Col span={12} style={{ marginTop: '22px' }}>
            <Form.Item
              name="endDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  End Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select end date" }]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "10px",
                }}
                size="large"
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="reason"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              <FiFileText style={{ marginRight: "8px", color: "#1890ff" }} />
              Reason <span style={{ color: "#ff4d4f" }}>*</span>
            </span>
          }
          rules={[{ required: true, message: "Please enter reason" }]}
          style={{ marginTop: '22px' }}
        >
          <TextArea
            rows={4}
            placeholder="Enter reason for leave"
            style={{
              borderRadius: "10px",
            }}
          />
        </Form.Item>

        <Form.Item
          name="isHalfDay"
          label={
            <span style={{ fontSize: "14px", fontWeight: "500" }}>
              Half Day Leave
            </span>
          }
          valuePropName="checked"
          style={{ marginTop: '22px' }}
        >
          <Switch />
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
            onClick={onCancel}
            style={{
              borderRadius: "10px",
              height: "40px",
              padding: "0 24px",
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            style={{
              borderRadius: "10px",
              height: "40px",
              padding: "0 24px",
            }}
          >
            Create Leave Request
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateLeave;
