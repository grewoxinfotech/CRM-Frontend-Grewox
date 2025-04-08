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
} from "react-icons/fi";
import dayjs from "dayjs";
import EditContact from "./EditContact";
import CreateContact from "./CreateContact";

const { Text } = Typography;

const ContactList = ({ onEdit, onView, searchText = "" }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Mock data for contacts
  const contacts = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      company: "ABC Corp",
      jobTitle: "Sales Manager",
      status: "Active",
      createdAt: "2023-01-01"
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@example.com", 
      phone: "+0987654321",
      company: "XYZ Ltd",
      jobTitle: "Marketing Director",
      status: "Inactive",
      createdAt: "2023-02-01"
    }
  ];

  const filteredContacts = React.useMemo(() => {
    return contacts?.filter((contact) => {
      const searchLower = searchText.toLowerCase();
      const firstName = contact?.firstName?.toLowerCase() || "";
      const lastName = contact?.lastName?.toLowerCase() || "";
      const email = contact?.email?.toLowerCase() || "";
      const phone = contact?.phone?.toLowerCase() || "";
      const company = contact?.company?.toLowerCase() || "";
      const status = contact?.status?.toLowerCase() || "";

      return (
        !searchText ||
        firstName.includes(searchLower) ||
        lastName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        company.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [contacts, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Contact",
      content: "Are you sure you want to delete this contact?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: () => {
        message.success("Contact deleted successfully");
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedContact(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedContact(null);
  };

  const handleCreateModalClose = () => {
    setCreateModalVisible(false);
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
      title: "Name",
      key: "name",
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      render: (_, record) => (
        <Text style={{ fontWeight: 500 }}>
          {`${record.firstName} ${record.lastName}`}
        </Text>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      sorter: (a, b) => a.company.localeCompare(b.company),
    },
    {
      title: "Job Title",
      dataIndex: "jobTitle",
      key: "jobTitle",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
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
          overlayClassName="contact-actions-dropdown"
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
    <>
      <div
        className="contact-list"
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredContacts}
          rowKey="id"
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
          className="contact-table"
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
      </div>

      <EditContact
        open={editModalVisible}
        onCancel={handleEditModalClose}
        contactData={selectedContact}
      />

      <CreateContact
        open={createModalVisible}
        onCancel={handleCreateModalClose}
      />
    </>
  );
};

export default ContactList;
