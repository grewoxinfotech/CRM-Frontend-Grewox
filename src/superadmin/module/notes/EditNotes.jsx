import React from "react";
import { Modal, Form, Input, Button, Typography, message, Select } from "antd";
import { FiX, FiFileText, FiUser } from "react-icons/fi";
import { useUpdateNotesMutation } from "./services/notesApi";
import { useGetEmployeesQuery } from "../../../dashboard/module/hrm/Employee/services/employeeApi";
import { useGetRolesQuery } from "../../../dashboard/module/hrm/role/services/roleApi";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EditNotes = ({ visible, onCancel, initialValues, loading }) => {
  const [form] = Form.useForm();
  const [updateNotes, { isLoading: isUpdating }] = useUpdateNotesMutation();
  const { data: employeesData } = useGetEmployeesQuery();
  const { data: rolesData } = useGetRolesQuery();

  const employees = React.useMemo(() => {
    if (!employeesData?.data || !rolesData?.data) return [];
    
    const rolesList = Array.isArray(rolesData.data) ? rolesData.data : [];
    const employeesList = Array.isArray(employeesData.data) ? employeesData.data : [];

    // Filter only employees with 'employee' role
    return employeesList
      .filter(employee => {
        const userRole = rolesList.find(role => role.id === employee.role_id);
        return userRole?.role_name?.toLowerCase() === 'employee';
      })
      .map(employee => {
        const userRole = rolesList.find(role => role.id === employee.role_id);
        return {
          ...employee,
          role: userRole
        };
      });
  }, [employeesData, rolesData]);

  React.useEffect(() => {
    if (visible && initialValues) {
      // Reset form first
      form.resetFields();

      try {
        // Get employee ID directly from employees field
        const employeeId = initialValues.employees; // It's directly the ID now
        
        console.log("Initial Values:", initialValues);
        console.log("Employee ID:", employeeId);

        // Create form values object with the correct field names
        const formValues = {
          note_title: initialValues.title || "", // Using title from initialValues
          notetype: initialValues.type || "", // Using type from initialValues
          description: initialValues.description || "",
          employee: employeeId // Set employee ID directly
        };

        console.log("Setting form values:", formValues);

        // Set form values
        form.setFieldsValue(formValues);

      } catch (error) {
        console.error("Error setting form values:", error);
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      // Transform the form values to match the backend schema
      const formattedData = {
        note_title: values.note_title || "",
        notetype: values.notetype || "",
        description: values.description || "",
        employees: {
          employee: values.employee  // Match the API structure
        }
      };

      console.log("Formatted Data:", formattedData);

      updateNotes({ id: initialValues.id, data: formattedData })
        .unwrap()
        .then(() => {
          message.success("Note updated successfully");
          onCancel();
        })
        .catch((error) => {
          message.error(error?.data?.message || "Failed to update note");
        });
    });
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={720}
      destroyOnClose={true}
      centered
      closeIcon={null}
      className="pro-modal custom-modal"
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
          background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
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
              Edit Note
            </h2>
            <Text
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              Update note information
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
        <div
          style={{
            display: "grid",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <Form.Item
            name="note_title"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Note Title
              </span>
            }
            rules={[{ required: true, message: "Please enter note title" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (!/[a-z]/.test(value) && !/[A-Z]/.test(value)) {
                  return Promise.reject(
                      new Error('Note title must contain both uppercase or lowercase English letters')
                  );
              }
              return Promise.resolve();
              }
            }]}
          >
            <Input
              prefix={
                <FiFileText style={{ color: "#1890ff", fontSize: "16px" }} />
              }
              placeholder="Enter note title"
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

          <Form.Item
            name="notetype"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Note Type
              </span>
            }
          >
            <Select
              placeholder="Select note type"
              size="large"
              style={{
                width: "100%",
                height: "48px",
              }}
              dropdownStyle={{
                padding: "8px",
                borderRadius: "10px",
              }}
            >
              <Option value="general">General</Option>
              <Option value="important">Important</Option>
              <Option value="urgent">Urgent</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Description
              </span>
            }
          >
            <TextArea
              placeholder="Enter note description"
              rows={4}
              style={{
                borderRadius: "10px",
                padding: "12px 16px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e6e8eb",
                transition: "all 0.3s ease",
              }}
            />
          </Form.Item>

          <Form.Item
            name="employee"
            label={
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Employee 
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
              options={employees.map(employee => ({
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
                      gap: '8px',
                      flex: 1
                    }}>
                      <span style={{
                        fontWeight: 500,
                        color: 'rgba(0, 0, 0, 0.85)',
                        fontSize: '14px'
                      }}>
                        {`${employee.firstName} ${employee.lastName}`}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: '#F9F0FF',
                        color: '#531CAD',
                        border: '1px solid #D3ADF7',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {employee.role?.role_name || 'User'}
                      </span>
                    </div>
                  </div>
                ),
                value: employee.id
              }))}
            />
          </Form.Item>
        </div>

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
          >
            Cancel
          </Button>
          <Button
            size="large"
            type="primary"
            onClick={handleSubmit}
            loading={isUpdating || loading}
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
            Save Changes
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditNotes;
