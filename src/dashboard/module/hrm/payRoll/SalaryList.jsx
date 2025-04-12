import React, { useState, useMemo } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message, Input, Space } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiFileText
} from "react-icons/fi";
import dayjs from "dayjs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  useGetSalaryQuery,
  useDeleteSalaryMutation,
  useUpdateSalaryMutation,
} from "./services/salaryApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import EditSalary from "./EditSalary";

const { Text } = Typography;

const SalaryList = ({ onEdit, onView, searchText = "" }) => {
  const { data: salarydata = [], isLoading } = useGetSalaryQuery();
  const { data: employeesData } = useGetEmployeesQuery();
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const salary = salarydata.data || [];
  const employees = employeesData?.data || [];
  const currencies = currenciesData?.data || [];
  const [deleteSalary] = useDeleteSalaryMutation();
  const [updateSalary] = useUpdateSalaryMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [processingSalaryId, setProcessingSalaryId] = useState(null);
  const [processedSalary, setProcessedSalary] = useState(new Set());

  // Define status options
  const statusOptions = [
    { text: 'Paid', value: 'paid' },
    { text: 'Unpaid', value: 'unpaid' },
  ];

  // Create a map of employee IDs to employee names
  const employeeMap = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = `${employee.firstName} ${employee.lastName}`;
      return acc;
    }, {});
  }, [employees]);


  const getCurrencyIcon = (currencyId) => {
    const currency = currenciesData?.find(curr => curr.id === currencyId);
    return currency?.currencyIcon || '₹';
  };
  // Create a map of currency IDs to currency details
  const currencyMap = useMemo(() => {
    return currencies.reduce((acc, currency) => {
      acc[currency.id] = {
        name: currency.currencyName,
        code: currency.currencyCode,
        icon: currency.currencyIcon
      };
      return acc;
    }, {});
  }, [currencies]);

  

  const filteredSalary = React.useMemo(() => {
    return salary?.filter((salary) => {
      const searchLower = searchText.toLowerCase();
      const payslipType = salary?.payslipType?.toLowerCase() || "";
      const status = salary?.status?.toLowerCase() || "";
      const currency = salary?.currency?.toLowerCase() || "";

      return (
        !searchText ||
        payslipType.includes(searchLower) ||
        status.includes(searchLower) ||
        currency.includes(searchLower)
      );
    });
  }, [salary, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Salary Record",
      content: "Are you sure you want to delete this salary record?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteSalary(id).unwrap();
          message.success("Salary record deleted successfully");
        } catch (error) {
          message.error(
            error?.data?.message || "Failed to delete salary record"
          );
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedSalary(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedSalary(null);
  };

  const handleSalaryAction = async (id, status, employeeId) => {
    setProcessingSalaryId(id);
    try {
      await updateSalary({
        id,
        data: {
          status,
          employeeId,
          remarks:
            status === "approved" ? "Salary approved." : "Salary rejected.",
        },
      }).unwrap();
      setProcessedSalary((prev) => new Set([...prev, id]));
      message.success(
        `Salary ${status === "approved" ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      message.error(error?.data?.message || `Failed to ${status} salary`);
    } finally {
      setProcessingSalaryId(null);
    }
  };

  const generatePayslip = (record) => {
    try {
      const doc = new jsPDF();
      const employeeName = employeeMap[record.employeeId] || "Unknown Employee";
      // const currencyIcon = getCurrencyIcon(record.currency);

      // Add Header
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20); 
      doc.text('PAYSLIP', 105, 20, { align: 'center' });
      
      // Reset color
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      
      // Employee Details
      doc.setFillColor(240, 240, 240);
      doc.rect(10, 40, doc.internal.pageSize.width - 20, 35, 'F');
      
      doc.setFont(undefined, 'bold');
      doc.text('Employee Details:', 20, 50);
      doc.setFont(undefined, 'normal');
      doc.text(`Name: ${employeeName}`, 20, 60);
      doc.text(`Date: ${dayjs(record.paymentDate).format('DD-MM-YYYY')}`, 20, 70);
      doc.text(`Bank Account: ${record.bankAccount || 'N/A'}`, 120, 60);
      doc.text(`Type: ${record.payslipType}`, 120, 70);

      // Create salary table
      const tableData = [
        [{ content: 'Salary Details', colSpan: 2, styles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], halign: 'center' } }],
        ['Basic Salary', ` ${Number(record.salary || 0).toFixed(2)}`],
        ['Allowances', ` ${Number(record.allowances || 0).toFixed(2)}`],
        ['Deductions', ` ${Number(record.deductions || 0).toFixed(2)}`],
        [{ content: 'Net Salary', styles: { fontStyle: 'bold' } }, 
         { content: ` ${Number(record.netSalary || 0).toFixed(2)}`, styles: { fontStyle: 'bold' } }]
      ];

      doc.autoTable({
        startY: 85,
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 6,
        },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 80, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      });


      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(8);
      doc.text('This is a computer-generated document.', 105, pageHeight - 10, { align: 'center' });

      // Save PDF
      doc.save(`Payslip-${employeeName}-${dayjs(record.paymentDate).format('MMM-YYYY')}.pdf`);
      message.success('Payslip generated successfully!');
    } catch (error) {
      console.error('Error generating payslip:', error);
      message.error('Failed to generate payslip');
    }
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView?.(record),
      },
      {
        key: "generatePayslip",
        icon: <FiFileText />,
        label: "Generate Payslip",
        onClick: () => generatePayslip(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => handleEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record.id),
        danger: true,
      },
    ],
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "employeeId",
      key: "employeeId",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search employee name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.employeeId.toLowerCase().includes(value.toLowerCase()) ||
        record.company_name?.toLowerCase().includes(value.toLowerCase()),
      render: (employeeId) => (
        <Text style={{ color: "#262626" }}>
          {employeeMap[employeeId] || "Unknown Employee"}
        </Text>
      ),
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
      sorter: (a, b) =>
        dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
      render: (paymentDate) => (
        <Text style={{ color: "#262626" }}>
          {dayjs(paymentDate).format("DD-MM-YYYY")}
        </Text>
      ),
    },
    {
      title: "Payslip Type",
      dataIndex: "payslipType",
      key: "payslipType",
      sorter: (a, b) =>
        (a?.payslipType || "").localeCompare(b?.payslipType || ""),
      render: (payslipType) => (
        <Tag
          color="blue"
          style={{ borderRadius: "4px", padding: "2px 8px", fontSize: "13px" }}
        >
          {payslipType}
        </Tag>
      ),
    },
   
  
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      sorter: (a, b) => a.salary - b.salary,
      render: (salary, record) => {
        const currencyIcon = getCurrencyIcon(record.currency);
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1890ff",
              // fontWeight: 500,
            }}
          >
            <Text strong>
              {currencyIcon}
              {typeof salary === "number"
                ? salary.toFixed(2)
                : Number(salary).toFixed(2) || "0.00"}
            </Text>
          </div>
        );
      },
    },
   {
      title: "Net Salary",
      dataIndex: "netSalary",
      key: "netSalary",
      sorter: (a, b) => a.netSalary - b.netSalary,
      render: (netSalary, record) => {
        const currencyIcon = getCurrencyIcon(record.currency);
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#1890ff",
              // fontWeight: 500,
            }}
          >
            <Text strong>
              {currencyIcon}
              {typeof netSalary === "number"
                ? netSalary.toFixed(2)
                : Number(netSalary).toFixed(2) || "0.00"}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Bank Account",
      dataIndex: "bankAccount",
      key: "bankAccount",
      sorter: (a, b) =>
        (a?.bankAccount || "").localeCompare(b?.bankAccount || ""),
      render: (bankAccount) => (
        <Text style={{ color: "#262626" }}>{bankAccount}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: statusOptions,
      onFilter: (value, record) => record.status?.toLowerCase() === value.toLowerCase(),
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{ borderRadius: "4px", padding: "2px 8px", fontSize: "13px" }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="salary-actions-dropdown"
        >
          <Button
            type="text"
            icon={
              <FiMoreVertical style={{ fontSize: "18px", color: "#8c8c8c" }} />
            }
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
            style={{
              padding: "4px",
              borderRadius: "4px",
              "&:hover": {
                background: "#f5f5f5",
              },
            }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div
      className="salary-list"
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Table
        columns={columns}
        dataSource={filteredSalary}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          style: {
            margin: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          },
        }}
        className="salary-table"
        style={{
          "& .ant-table-thead > tr > th": {
            background: "#fafafa",
            fontWeight: 600,
            color: "#262626",
          },
          "& .ant-table-tbody > tr:hover > td": {
            background: "#f5f5f5",
          },
        }}
      />
      {selectedSalary && (
        <EditSalary
          open={editModalVisible}
          onCancel={handleEditModalClose}
          initialValues={selectedSalary}
        />
      )}
    </div>
  );
};

export default SalaryList;
