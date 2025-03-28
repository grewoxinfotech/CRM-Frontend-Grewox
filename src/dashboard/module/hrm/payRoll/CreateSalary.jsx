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
  InputNumber,
} from "antd";
import {
  FiFileText,
  FiX,
  FiCalendar,
  FiUser,
  FiDollarSign,
  FiTag,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useCreateSalaryMutation } from "./services/salaryApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import "./salary.scss";

const { Text } = Typography;
const { Option } = Select;

const CreateSalary = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [createSalary, { isLoading }] = useCreateSalaryMutation();
  const { data: employeesData, isLoading: isLoadingEmployees } =
    useGetEmployeesQuery();
  const employees = employeesData?.data || [];

  const handleSubmit = async (values) => {
    try {
      const payload = {
        employeeId: values.employeeId,
        payslipType: values.payslipType,
        currency: values.currency,
        salary: values.salary.toString(),
        netSalary: values.netSalary.toString(),
        bankAccount: values.bankAccount,
        paymentDate: values.paymentDate.format("YYYY-MM-DD"),
        status: "pending",
      };

      await createSalary(payload).unwrap();
      message.success("Salary record created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Submit Error:", error);
      message.error(error?.data?.message || "Failed to create salary record");
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
              Create Salary Record
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Fill in the information to create a new salary record
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
                  <FiUser style={{ marginRight: "8px", color: "#1890ff" }} />
                  Employee <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select an employee" }]}
            >
              <Select
                placeholder="Select Employee"
                size="large"
                loading={isLoadingEmployees}
                showSearch
                allowClear
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                  backgroundColor: "#f8fafc",
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
                onChange={(value) => {
                  console.log("Selected value:", value);
                  form.validateFields(["employeeId"]);
                }}
              >
                {Array.isArray(employees) &&
                  employees.map((employee) => (
                    <Option key={employee.id} value={employee.id}>
                      {`${employee.firstName} ${employee.lastName}`}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="payslipType"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiTag style={{ marginRight: "8px", color: "#1890ff" }} />
                  Payslip Type <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please select payslip type" },
              ]}
            >
              <Select
                placeholder="Select Payslip Type"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="Monthly">Monthly</Option>
                <Option value="Weekly">Weekly</Option>
                <Option value="Bi-Weekly">Bi-Weekly</Option>
                <Option value="Annual">Annual</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="currency"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Currency <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select
                placeholder="Select Currency"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
                <Option value="GBP">GBP</Option>
                <Option value="INR">INR</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="salary"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Salary <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter salary" }]}
            >
              <InputNumber
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="Enter salary"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="netSalary"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Net Salary <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter net salary" }]}
            >
              <InputNumber
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
                formatter={(value) =>
                  `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                placeholder="Enter net salary"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="bankAccount"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiFileText
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Bank Account <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter bank account" }]}
            >
              <Input
                placeholder="Enter bank account number"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="paymentDate"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Payment Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[
                { required: true, message: "Please select payment date" },
              ]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
                size="large"
                placeholder="Select payment date"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "16px",
                marginTop: "24px",
              }}
            >
              <Button
                onClick={onCancel}
                size="large"
                style={{
                  borderRadius: "8px",
                  padding: "0 24px",
                  height: "48px",
                  border: "1px solid #d9d9d9",
                  color: "#595959",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                style={{
                  borderRadius: "8px",
                  padding: "0 24px",
                  height: "48px",
                  background:
                    "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
                  border: "none",
                }}
              >
                Create Salary Record
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateSalary;
