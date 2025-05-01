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
import { useUpdateSalaryMutation } from "./services/salaryApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import "./salary.scss";

const { Text } = Typography;
const { Option } = Select;

const EditSalary = ({ open, onCancel, initialValues }) => {


  const [form] = Form.useForm();
  const [updateSalary, { isLoading }] = useUpdateSalaryMutation();
  const { data: employeesData, isLoading: isLoadingEmployees } = useGetEmployeesQuery();
  const { data: currenciesData, isLoading: isLoadingCurrencies } = useGetAllCurrenciesQuery();
  const { data: rolesData } = useGetRolesQuery();
  const employees = React.useMemo(() => {
    if (!employeesData?.data || !rolesData?.data) return [];
    
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
  const currencies = currenciesData || [];
  const [selectedCurrency, setSelectedCurrency] = useState('$');

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        employeeId: initialValues.employeeId,
        employeeName: initialValues.employeeName,
        payslipType: initialValues.payslipType,
        salary_group: {
          currency: initialValues.currency,
          amount: initialValues.salary
        },
        net_salary_group: {
          currency: initialValues.currency,
          amount: initialValues.netSalary
        },
        bankAccount: initialValues.bankAccount,
        payment_date: initialValues.paymentDate ? dayjs(initialValues.paymentDate) : null,
        salary_date: initialValues.salary_date ? dayjs(initialValues.salary_date) : null,
        status: initialValues.status
      });
      
      // Update selected currency
      setSelectedCurrency(initialValues.currency);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      const payload = {
        id: initialValues.id,
        data: {
          employeeId: values.employeeId,
          payslipType: values.payslipType,
          currency: values.salary_group.currency,
          salary: String(values.salary_group.amount),
          netSalary: String(values.net_salary_group.amount),
          bankAccount: values.bankAccount,
          payment_date: values.payment_date ? values.payment_date.format("DD-MM-YYYY") : null,
          salary_date: values.salary_date ? values.salary_date.format("DD-MM-YYYY") : null,
          status: values.status
        }
      };

      const response = await updateSalary(payload).unwrap();

      if (response.success) {
        message.success("Salary record updated successfully");
        onCancel();
      }
    } catch (error) {
      message.error(error?.data?.message || "Failed to update salary record");
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
              Edit Salary Record
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update the salary record information
            </Text>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        requiredMark={false}
        style={{ padding: "24px" }}
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
                disabled={true}
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
                                        padding: '2px 8px',
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
              name="payslipType"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiTag style={{ marginRight: "8px", color: "#1890ff" }} />
                  Payslip Type <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select payslip type" }]}
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
              name="salary_group"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
                  Salary <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter salary" }]}
              style={{ flex: 1 }}
            >
              <Input.Group compact className="price-input-group" style={{
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
                      width: '100px',
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

          <Col span={12}>
            <Form.Item
              name="net_salary_group"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiDollarSign style={{ marginRight: "8px", color: "#1890ff" }} />
                  Net Salary <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please enter net salary" }]}
              style={{ flex: 1 }}
            >
              <Input.Group compact className="price-input-group" style={{
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
                      width: '100px',
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
      
          <Col span={12}>
            <Form.Item
              name="bankAccount"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCreditCard style={{ marginRight: "8px", color: "#1890ff" }} />
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
              name="salary_date"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
                  Salary Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select salary date" }]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
                size="large"
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </Col>
      
          <Col span={12}>
            <Form.Item
              name="payment_date"
              label={
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  <FiCalendar style={{ marginRight: "8px", color: "#1890ff" }} />
                  Payment Date <span style={{ color: "#ff4d4f" }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Please select payment date" }]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  height: "48px",
                }}
                size="large"
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px", marginTop: "24px" }}>
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
                  background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
                  border: "none",
                }}
              >
                Update Salary Record
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditSalary;
