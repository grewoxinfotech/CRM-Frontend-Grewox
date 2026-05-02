import React, { useMemo } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message, Space, Switch, Avatar } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiFileText,
  FiUser
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useDeleteSalaryMutation,
  useUpdateSalaryMutation,
} from "./services/salaryApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";

const { Text } = Typography;

const SalaryList = ({ onEdit, salaries = [], loading, pagination }) => {
  const { data: employeesData } = useGetEmployeesQuery();
  const [deleteSalary] = useDeleteSalaryMutation();
  const [updateSalary] = useUpdateSalaryMutation();

  const employeeMap = useMemo(() => {
    if (!employeesData?.data) return {};
    return employeesData.data.reduce((acc, employee) => {
      acc[employee.id] = employee;
      return acc;
    }, {});
  }, [employeesData]);

  const handleStatusChange = async (checked, record) => {
    try {
      await updateSalary({
        id: record.id,
        data: {
          ...record,
          status: checked ? 'paid' : 'unpaid',
        }
      }).unwrap();
      message.success(`Status updated to ${checked ? 'paid' : 'unpaid'}`);
    } catch (error) {
      message.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (id) => {
        const emp = employeeMap[id] || {};
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Avatar size="small" src={emp.profilePic} icon={!emp.profilePic && <FiUser />} style={{ background: '#eef2ff', color: '#4f46e5' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text strong style={{ fontSize: '13px', color: '#1e293b' }}>{`${emp.firstName || ''} ${emp.lastName || ''}`}</Text>
                <Text type="secondary" style={{ fontSize: '11px' }}>{emp.employee_code}</Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "Salary Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (date) => <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM YYYY')}</Text>,
    },
    {
      title: "Amount",
      dataIndex: "netSalary",
      key: "netSalary",
      render: (amount) => (
        <Text strong style={{ color: '#059669' }}>
          ₹{Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Space size={8}>
          <Switch
            size="small"
            checked={status === 'paid'}
            onChange={(checked) => handleStatusChange(checked, record)}
          />
          <Tag color={status === 'paid' ? 'success' : 'warning'} style={{ borderRadius: '4px', border: 'none', margin: 0 }}>
            {status?.toUpperCase()}
          </Tag>
        </Space>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "payslip", icon: <FiFileText />, label: "Payslip", onClick: () => message.info('Generating Payslip...') },
              { key: "edit", icon: <FiEdit2 />, label: "Edit", onClick: () => onEdit(record) },
              { key: "delete", icon: <FiTrash2 />, label: "Delete", danger: true, onClick: () => {
                Modal.confirm({
                    title: 'Delete Salary Record',
                    content: 'Are you sure?',
                    onOk: async () => {
                        try {
                            await deleteSalary(record.id).unwrap();
                            message.success('Deleted successfully');
                        } catch (error) {
                            message.error('Failed to delete');
                        }
                    }
                });
              }}
            ]
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="salary-list-container">
      <Table
        columns={columns}
        dataSource={salaries}
        rowKey="id"
        loading={loading}
        size="small"
        className="compact-table"
        pagination={{
          ...pagination,
          showTotal: (total) => `Total ${total} items`
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default SalaryList;
