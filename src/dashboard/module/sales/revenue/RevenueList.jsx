import React from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Tooltip,
  Typography,
  Modal,
  message,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiCalendar,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetRevenueQuery,
  useDeleteRevenueMutation,
} from "./services/revenueApi";

const { Text } = Typography;

const RevenueList = ({
  onEdit,
  onDelete,
  onView,
  searchText = "",
  revenues = [],
}) => {
  const { data: revenueData, isLoading } = useGetRevenueQuery();
  const [deleteRevenue] = useDeleteRevenueMutation();
  const revdata = revenueData?.data;
  const filteredRevenues = React.useMemo(() => {
    return revdata?.filter((revenue) => {
      const searchLower = searchText.toLowerCase();
      const amount = revenue?.amount?.toString().toLowerCase() || "";
      const category = revenue?.category?.toLowerCase() || "";
      const description = revenue?.description?.toLowerCase() || "";
      const status = revenue?.status?.toLowerCase() || "";

      return (
        !searchText ||
        amount.includes(searchLower) ||
        category.includes(searchLower) ||
        description.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [revenues, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Revenue",
      content: "Are you sure you want to delete this revenue?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteRevenue(id).unwrap();
          message.success("Revenue deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete revenue");
        }
      },
    });
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
        onClick: () => onEdit?.(record),
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

  const columns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiDollarSign style={{ color: "#1890ff" }} />
          <Text strong>${amount?.toFixed(2)}</Text>
        </div>
      ),
    },
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
      sorter: (a, b) => (a?.account || "").localeCompare(b?.account || ""),
      render: (account) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiCalendar style={{ color: "#1890ff" }} />
          <Text>{account}</Text>
        </div>
      ),
    },
    // {
    //   title: "Customer",
    //   dataIndex: "customer",
    //   key: "customer",
    //   sorter: (a, b) => (a?.customer || "").localeCompare(b?.customer || ""),
    // },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => (a?.category || "").localeCompare(b?.category || ""),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
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
          overlayClassName="revenue-actions-dropdown"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="revenue-list">
      <Table
        columns={columns}
        dataSource={revdata}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        className="revenue-table"
      />
    </div>
  );
};

export default RevenueList;
