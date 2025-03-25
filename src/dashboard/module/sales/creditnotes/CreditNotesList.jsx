import React, { useState } from "react";
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
  useGetCreditNotesQuery,
  useDeleteCreditNoteMutation,
} from "./services/creditNoteApi";
import EditCreditNotes from "./EditCreditNotes";

const { Text } = Typography;

const CreditNotesList = ({ onEdit, onView, searchText = "" }) => {
  const { data: credtdata = [], isLoading } = useGetCreditNotesQuery();
  const creditNotes = credtdata.data;
  const [deleteCreditNote] = useDeleteCreditNoteMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);

  const filteredCreditNotes = React.useMemo(() => {
    return creditNotes?.filter((creditNote) => {
      const searchLower = searchText.toLowerCase();
      const amount = creditNote?.amount?.toString().toLowerCase() || "";
      const category = creditNote?.category?.toLowerCase() || "";
      const description = creditNote?.description?.toLowerCase() || "";
      const status = creditNote?.status?.toLowerCase() || "";

      return (
        !searchText ||
        amount.includes(searchLower) ||
        category.includes(searchLower) ||
        description.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [creditNotes, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Credit Note",
      content: "Are you sure you want to delete this credit note?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteCreditNote(id).unwrap();
          message.success("Credit note deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete credit note");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedCreditNote(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedCreditNote(null);
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

  const columns = [
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (amount) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#1890ff",
            fontWeight: 500,
          }}
        >
          <FiDollarSign style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text strong>
            $
            {typeof amount === "number"
              ? amount.toFixed(2)
              : Number(amount).toFixed(2) || "0.00"}
          </Text>
        </div>
      ),
    },
    {
      title: "currency",
      dataIndex: "currency",
      key: "currency",
      sorter: (a, b) => (a?.currency || "").localeCompare(b?.currency || ""),
      render: (currency) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#595959",
          }}
        >
          <FiCalendar style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text>{currency}</Text>
        </div>
      ),
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      sorter: (a, b) =>
        (a?.created_by || "").localeCompare(b?.created_by || ""),
      render: (created_by) => (
        <Text style={{ color: "#262626" }}>{created_by}</Text>
      ),
    },
    // {
    //   title: "Category",
    //   dataIndex: "category",
    //   key: "category",
    //   sorter: (a, b) => (a?.category || "").localeCompare(b?.category || ""),
    //   render: (category) => (
    //     <Tag
    //       color="blue"
    //       style={{
    //         borderRadius: "4px",
    //         padding: "2px 8px",
    //         fontSize: "13px",
    //       }}
    //     >
    //       {category}
    //     </Tag>
    //   ),
    // },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      sorter: (a, b) =>
        (a?.description || "").localeCompare(b?.description || ""),
      render: (description) => (
        <Text
          style={{
            color: "#595959",
            fontSize: "13px",
          }}
        >
          {description}
        </Text>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (createdAt) => (
        <Text
          style={{
            color: "#8c8c8c",
            fontSize: "13px",
          }}
        >
          {dayjs(createdAt).format("MMM DD, YYYY")}
        </Text>
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
          overlayClassName="revenue-actions-dropdown"
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
      className="revenue-list"
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Table
        columns={columns}
        dataSource={filteredCreditNotes}
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
        className="revenue-table"
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
      {selectedCreditNote && (
        <EditCreditNotes
          open={editModalVisible}
          onCancel={handleEditModalClose}
          initialValues={selectedCreditNote}
        />
      )}
    </div>
  );
};

export default CreditNotesList;
