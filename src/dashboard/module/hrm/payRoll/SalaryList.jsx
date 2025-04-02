import React, { useState, useMemo } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
} from "react-icons/fi";
import dayjs from "dayjs";
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

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView?.(record),
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
      sorter: (a, b) =>
        (employeeMap[a.employeeId] || "").localeCompare(
          employeeMap[b.employeeId] || ""
        ),
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
      sorter: (a, b) => (a?.status || "").localeCompare(b?.status || ""),
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
