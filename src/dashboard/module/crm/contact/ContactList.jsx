import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Input,
  Space,
  Tooltip,
  Typography,
  Modal,
  message,
  Avatar,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiBriefcase,
  FiMail,
  FiPhone,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import EditContact from "./EditContact";
import CreateContact from "./CreateContact";
import { useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { useDeleteContactMutation } from './services/contactApi';

const { Text } = Typography;

const ContactList = ({ onEdit, onView, searchText = "", contactsResponse, isLoading, companyAccountsResponse, isCompanyAccountsLoading, loggedInUser, onDelete }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const navigate = useNavigate();
  const [deleteContact] = useDeleteContactMutation();

  // Fetch countries data
  const { data: countriesData } = useGetAllCountriesQuery();


  // Safely handle contacts data
  const contacts = React.useMemo(() => {
    if (!contactsResponse) return [];
    if (Array.isArray(contactsResponse)) return contactsResponse;
    if (contactsResponse?.data && Array.isArray(contactsResponse.data)) {
      return contactsResponse.data;
    }
    return [];
  }, [contactsResponse]);

  // Safely handle company accounts data
  const companyAccounts = React.useMemo(() => {
    if (!companyAccountsResponse) return [];
    if (Array.isArray(companyAccountsResponse)) return companyAccountsResponse;
    if (companyAccountsResponse?.data && Array.isArray(companyAccountsResponse.data)) {
      return companyAccountsResponse.data;
    }
    return [];
  }, [companyAccountsResponse]);

  // Create a map of company IDs to company names
  const companyMap = React.useMemo(() => {
    return companyAccounts.reduce((acc, company) => {
      acc[company.id] = company.company_name;
      return acc;
    }, {});
  }, [companyAccounts]);

  // Enhance contacts with company names
  const enhancedContacts = React.useMemo(() => {
    return contacts.map(contact => ({
      ...contact,
      company_display_name: companyMap[contact.company_name] || contact.company_name
    }));
  }, [contacts, companyMap]);

  const handleView = (record) => {
    navigate(`/dashboard/crm/contact/${record.id}`);
  };

  const filteredContacts = React.useMemo(() => {
    if (!enhancedContacts || !Array.isArray(enhancedContacts)) {
      return [];
    }
    return enhancedContacts.filter((contact) => {
      const searchLower = searchText.toLowerCase();
      const firstName = contact?.first_name?.toLowerCase() || "";
      const lastName = contact?.last_name?.toLowerCase() || "";
      const email = contact?.email?.toLowerCase() || "";
      const phone = contact?.phone?.toLowerCase() || "";
      const company = contact?.company_display_name?.toLowerCase() || "";
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
  }, [enhancedContacts, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Contact',
      content: 'Are you sure you want to delete this contact? This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteContact(id).unwrap();
          message.success('Contact deleted successfully');
        } catch (error) {
          console.error("Delete Error:", error);
          message.error(error?.data?.message || 'Failed to delete contact');
        }
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
        onClick: () => handleView(record),
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
      key: "first_name",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search contact name"
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
        record.first_name.toLowerCase().includes(value.toLowerCase()) ||
        record.last_name.toLowerCase().includes(value.toLowerCase()),
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            style={{
              backgroundColor: record.company_name ? '#1890ff' : '#52c41a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {record.first_name ? record.first_name[0].toUpperCase() : 'C'}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: '14px', cursor: 'pointer', color: '#1890ff' }} onClick={() => handleView(record)}>
              {`${record.first_name || ''} ${record.last_name || ''}`}
            </Text>
            {record.company_name && (
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                <FiBriefcase style={{ marginRight: '4px' }} />
                {companyMap[record.company_name] || record.company_name}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
      render: (email) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiMail style={{ color: '#8c8c8c' }} />
          <Text>
            {email || '-'}
          </Text>
        </div>
      )
    },
    {
      title: "Phone",
      key: "phone",
      sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
      render: (_, record) => {
        const country = countriesData?.find(c => c.id === record.phone_code);
        const phoneCode = country ? `+${country.phoneCode.replace('+', '')}` : '';
        const formattedPhone = record.phone ?
          (phoneCode ? `${phoneCode} ${record.phone}` : record.phone) :
          '-';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiPhone style={{ color: '#8c8c8c' }} />
            <Text>
              {formattedPhone}
            </Text>
          </div>
        );
      }
    },
    {
      title: "Company",
      dataIndex: "company_display_name",
      key: "company_display_name",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search company name"
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
        (record.company_display_name || '').toLowerCase().includes(value.toLowerCase()) ||
        (record.company_name || '').toLowerCase().includes(value.toLowerCase()),
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBriefcase style={{ color: '#8c8c8c' }} />
          <Text>
            {record.company_display_name || record.company_name || '-'}
          </Text>
        </div>
      )
    },
    {
      title: "Contact Owner",
      dataIndex: "contact_owner",
      key: "contact_owner",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search contact owner"
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
        (record.contact_owner || '').toLowerCase().includes(value.toLowerCase()),
      render: (ownerId) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser style={{ color: '#8c8c8c' }} />
          <Text>{ownerId === loggedInUser?.id ? loggedInUser?.username : ownerId}</Text>
        </div>
      )
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar style={{ color: '#8c8c8c' }} />
          <Text>{dayjs(date).format("DD-MM-YYYY")}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<FiMoreVertical style={{ fontSize: '16px', color: '#8c8c8c' }} />}
              className="action-btn"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="contact-list" style={{ background: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
        <Table
          columns={columns}
          dataSource={filteredContacts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} contacts`,
            style: {
              margin: "16px 24px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            },
          }}
          className="contact-table"
          onRow={(record) => ({
            onClick: () => handleView(record),
            style: { cursor: 'pointer' }
          })}
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

      <style jsx global>{`
        .contact-table {
          .ant-table {
            border-radius: 8px;
            overflow: hidden;

            .ant-table-thead > tr > th {
              background: #fafafa !important;
              color: #1f2937;
              font-weight: 600;
              border-bottom: 1px solid #f0f0f0;
              padding: 16px;

              &::before {
                display: none;
              }
            }

            .ant-table-tbody > tr {
              &:hover > td {
                background: rgba(24, 144, 255, 0.04) !important;
              }

              > td {
                padding: 16px;
                transition: all 0.3s ease;
              }

              &:nth-child(even) {
                background-color: #fafafa;
                
                &:hover > td {
                  background: rgba(24, 144, 255, 0.04) !important;
                }
              }
            }
          }

          .ant-table-filter-trigger {
            color: #8c8c8c;
            &:hover {
              color: #1890ff;
            }
            &.active {
              color: #1890ff;
            }
          }

          .ant-table-filter-dropdown {
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);

            .ant-dropdown-menu {
              max-height: 300px;
              overflow-y: auto;
              padding: 4px;
              border-radius: 6px;
            }

            .ant-input {
              border-radius: 4px;
              &:hover, &:focus {
                border-color: #1890ff;
              }
            }

            .ant-btn {
              border-radius: 4px;
              &:not(:last-child) {
                margin-right: 8px;
              }
            }
          }
        }

        .action-btn {
          width: 32px;
          height: 32px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.3s;
          
          &:hover {
            color: #1890ff;
            background: rgba(24, 144, 255, 0.1);
          }
        }
      `}</style>
    </>
  );
};

export default ContactList;
