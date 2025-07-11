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
  FiCreditCard,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useCreateSalaryMutation } from "./services/salaryApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import "./Salary.scss";

const { Text } = Typography;
const { Option } = Select;

const CreateSalary = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [createSalary, { isLoading }] = useCreateSalaryMutation();
  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const { data: rolesData } = useGetRolesQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const { data: currenciesData, isLoading: isLoadingCurrencies } = useGetAllCurrenciesQuery();

  const employees = React.useMemo(() => {
    if (!employeesData?.data || !rolesData?.message?.data) return [];

    const rolesList = rolesData.message.data;
    const employeesList = employeesData.data;

    return employeesList.map(employee => {
      const userRole = rolesList.find(role => role.id === employee.role_id);
      const roleName = userRole?.role_name || 'N/A';

      // Map common role names to their style configurations
      const roleStyleMap = {
        'developer': {
          color: '#D46B08',
          bg: '#FFF7E6',
          border: '#FFD591'
        },
        'ui designer': {
          color: '#531CAD',
          bg: '#F9F0FF',
          border: '#D3ADF7'
        },
        'project manager': {
          color: '#237804',
          bg: '#F6FFED',
          border: '#B7EB8F'
        },
        'team lead': {
          color: '#096DD9',
          bg: '#E6F7FF',
          border: '#91D5FF'
        },
        'hr manager': {
          color: '#C41D7F',
          bg: '#FFF0F6',
          border: '#FFADD2'
        },
        'qa engineer': {
          color: '#08979C',
          bg: '#E6FFFB',
          border: '#87E8DE'
        }
      };

      // Get role style based on role name, with fallback to default style
      const roleStyle = roleStyleMap[roleName.toLowerCase()] || {
        color: '#1890FF',
        bg: '#E6F7FF',
        border: '#91D5FF'
      };

      return {
        ...employee,
        role: {
          role_name: roleName,
          style: roleStyle
        }
      };
    });
  }, [employeesData, rolesData]);

  const currencies = currenciesData || [];
  const [selectedCurrency, setSelectedCurrency] = useState('$');

  const handleSubmit = async (values) => {
    try {
      const selectedCurrency = currencies.find(curr => curr.currencyCode === values.salary_group?.currency);

      const payload = {
        employeeId: values.employeeId,
        payslipType: values.payslipType,
        currency: selectedCurrency?.id || values.salary_group?.currency,
        currencyCode: values.salary_group?.currency,
        salary: values.salary_group?.amount?.toString() || '0',
        netSalary: values.net_salary_group?.amount?.toString() || '0',
        bankAccount: values.bankAccount,
        paymentDate: values.paymentDate?.format("YYYY-MM-DD"),
        status: values.status,
      };

      await createSalary(payload).unwrap();
      message.success("Salary record created successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create salary record");
    }
  };

  const handleCurrencyChange = (value) => {
    const currencyDetails = currencies.find(curr => curr.id === value);
    if (currencyDetails) {
      setSelectedCurrency(currencyDetails.currencyIcon || '$');
      form.setFieldsValue({
        'salary_group.currency': value,
        'net_salary_group.currency': value
      });
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
                  Employee <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select an employee" }]}
            >
              <Select
                showSearch
                placeholder="Select employee"
                optionFilterProp="label"
                size="large"
                listHeight={100}
                dropdownStyle={{
                  Height: '100px',
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
                              background: employee.role?.style?.color || '#1890FF',
                              boxShadow: `0 0 8px ${employee.role?.style?.color || '#1890FF'}`,
                              animation: 'pulse 2s infinite'
                            }}
                          />
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: employee.role?.style?.bg || '#E6F7FF',
                            color: employee.role?.style?.color || '#1890FF',
                            border: `1px solid ${employee.role?.style?.border || '#91D5FF'}`,
                            fontWeight: 500,
                            textTransform: 'capitalize',
                            whiteSpace: 'nowrap'
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
                listHeight={100}
                dropdownStyle={{
                  Height: '100px',
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollBehavior: 'smooth'
                }}
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
          <Col span={24} style={{ marginTop: '22px' }}>
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
                placeholder="Select Status"
                size="large"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                }}
              >
                <Option value="paid">Paid</Option>
                <Option value="unpaid">Unpaid</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12} style={{ marginTop: '22px' }}>
            <Form.Item
              name="salary_group"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Salary <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter salary" }]}
              style={{ flex: 1 }}
              className="combined-input-item"
            >
              <Input.Group compact className="value-input-group" style={{
                display: 'flex',
                height: '48px',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e6e8eb',
                overflow: 'hidden',
                marginBottom: 0
              }}>
                <Form.Item
                  name={['salary_group', 'currency']}
                  noStyle
                  rules={[{ required: true }]}
                  initialValue="INR"
                >
                  <Select
                    size="large"
                    style={{
                      width: '120px',
                      height: '48px'
                    }}
                    className="currency-select"
                    dropdownStyle={{
                      padding: '8px',
                      borderRadius: '10px',
                    }}
                    showSearch
                    optionFilterProp="children"
                    defaultValue="INR"
                    onChange={handleCurrencyChange}
                  >
                    {currencies?.map(currency => (
                      <Option
                        key={currency.currencyCode}
                        value={currency.currencyCode}
                        selected={currency.currencyCode === 'INR'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{currency.currencyIcon} {currency.currencyCode}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['salary_group', 'amount']}
                  noStyle
                  rules={[{ required: true, message: 'Please enter salary' }]}
                >
                  <Input
                    placeholder="Enter salary"
                    size="large"
                    style={{
                      flex: 1,
                      width: '100%',
                      border: 'none',
                      borderLeft: '1px solid #e6e8eb',
                      borderRadius: 0,
                      height: '48px',
                    }}
                    min={0}
                    precision={2}
                    className="price-input"
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>

          <Col span={12} style={{ marginTop: '22px' }}>
            <Form.Item
              name="net_salary_group"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign
                    style={{ marginRight: "8px", color: "#1890ff" }}
                  />
                  Net Salary <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter net salary" }]}
              style={{ flex: 1 }}
              className="combined-input-item"
            >
              <Input.Group compact className="value-input-group" style={{
                display: 'flex',
                height: '48px',
                backgroundColor: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e6e8eb',
                overflow: 'hidden',
                marginBottom: 0
              }}>
                <Form.Item
                  name={['net_salary_group', 'currency']}
                  noStyle
                  rules={[{ required: true }]}
                  initialValue="INR"
                >
                  <Select
                    size="large"
                    style={{
                      width: '120px',
                      height: '48px'
                    }}
                    className="currency-select"
                    dropdownStyle={{
                      padding: '8px',
                      borderRadius: '10px',
                    }}
                    showSearch
                    optionFilterProp="children"
                    defaultValue="INR"
                    onChange={handleCurrencyChange}
                  >
                    {currencies?.map(currency => (
                      <Option
                        key={currency.currencyCode}
                        value={currency.currencyCode}
                        selected={currency.currencyCode === 'INR'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{currency.currencyIcon} {currency.currencyCode}</span>
                        </div>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name={['net_salary_group', 'amount']}
                  noStyle
                  rules={[{ required: true, message: 'Please enter net salary' }]}
                >
                  <Input
                    placeholder="Enter net salary"
                    size="large"
                    style={{
                      flex: 1,
                      width: '100%',
                      border: 'none',
                      borderLeft: '1px solid #e6e8eb',
                      borderRadius: 0,
                      height: '48px',
                    }}
                    min={0}
                    precision={2}
                    className="price-input"
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12} style={{ marginTop: '22px' }}>
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

          <Col span={12} style={{ marginTop: '22px' }}>
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
                format="DD-MM-YYYY"
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
