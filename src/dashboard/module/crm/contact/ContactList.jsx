import React, { useState, useEffect } from "react";
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
  FiMapPin,
  FiCheck,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import EditContact from "./EditContact";
import CreateContact from "./CreateContact";
import { useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';
import { useDeleteContactMutation } from './services/contactApi';
import "./contact.scss";

const { Text } = Typography;

const ContactList = ({
  onEdit,
  onView,
  searchText = "",
  contactsResponse,
  isLoading,
  companyAccountsResponse,
  isCompanyAccountsLoading,
  loggedInUser,
  onDelete,
  pagination
}) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate();
  const [deleteContact] = useDeleteContactMutation();



  // Fetch countries data
  const { data: countriesData } = useGetAllCountriesQuery();

  // Safely handle contacts data
  const contacts = React.useMemo(() => {
    if (!contactsResponse?.data) return [];
    return contactsResponse?.data;
  }, [contactsResponse]);

  // Safely handle company accounts data
  const companyAccounts = React.useMemo(() => {
    if (!companyAccountsResponse?.data) return [];
    return companyAccountsResponse.data;
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
      company_display_name: companyMap[contact.company_name] || contact.company_name || 'N/A'
    }));
  }, [contacts, companyMap]);

  // Clear selections when contacts data changes
  useEffect(() => {
    setSelectedRowKeys([]);
  }, [contacts]);

  const handleChange = (newPagination, filters, sorter) => {
    if (pagination?.onChange) {
      pagination.onChange(newPagination, filters, sorter);
    }
  };

  const handleDelete = (recordOrIds) => {
    if (onDelete) {
      onDelete(recordOrIds);
      setSelectedRowKeys([]);
    }
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const handleRowClick = (event, record) => {
    // Don't navigate if clicking on the actions button or its dropdown
    if (event.target.closest('.action-button') || event.target.closest('.ant-dropdown')) {
      return;
    }
    navigate(`/dashboard/crm/contact/${record.id}`);
  };
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

  // const getDropdownItems = (record) => ({
  //   items: [
  //     {
  //       key: "view",
  //       label: (
  //         <Button
  //           type="text"
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             handleRowClick(e, record);
  //           }}
  //         >
  //           View Details
  //         </Button>
  //       ),
  //     },
  //     {
  //       key: "edit",
  //       label: (
  //         <Button
  //           type="text"
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             handleEdit(record);
  //           }}
  //         >
  //           Edit Contact
  //         </Button>
  //       ),
  //     },
  //     {
  //       key: "delete",
  //       label: (
  //         <Button
  //           type="text"
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             handleDelete(record.id);
  //           }}
  //         >
  //           Delete Contact
  //         </Button>
  //       ),
  //     },
  //   ],
  // });

  const columns = [
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
              {record.profile_pic ? (
                <Avatar src={record.profile_pic} />
              ) : (
                <FiUser className="item-icon" />
              )}
            </div>
            <div className="info-wrapper">
              <div className="name">
                {record.first_name} {record.last_name}
              </div>
              <div className="meta">
                <FiMail size={12} />
                {record.email}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Company",
      key: "company",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
              <FiBriefcase className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">{record.company_display_name}</div>
              <div className="meta">
                <FiPhone size={12} />
                {record.phone}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#059669", background: "rgba(5, 150, 105, 0.1)" }}>
              <FiMapPin className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">{record.city}</div>
              <div className="meta">{record.country}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Created",
      key: "created_at",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
              <FiCalendar className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">{dayjs(record.created_at).format('MMM DD, YYYY')}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: 'right',
      // render: (_, record) => (
      //   <Dropdown
      //     menu={getDropdownItems(record)}
      //     trigger={['click']}
      //     placement="bottomRight"
      //   >
      //     <Button
      //       type="text"
      //       icon={<FiMoreVertical />}
      //       className="action-button"
      //       onClick={(e) => e.stopPropagation()}
      //     />
      //   </Dropdown>
      // ),
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            icon: <FiEye style={{ fontSize: '16px' }} />,
            label: 'View',
            onClick: () => {
           
              handleView(record);
            }
          },
          {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => {
              handleEdit(record);
            }
          },
          {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => {
              handleDelete(record.id);
            }
          }
        ];

        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="action-dropdown"
          >
            <Button
              type="text"
              icon={<FiMoreVertical size={16} />}
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </Dropdown>
        );
      }
    },
  ];

  // Bulk actions component
  const BulkActions = () => (
    <div className="bulk-actions">
      {selectedRowKeys.length > 0 && (
        <Button
          type="primary"
          danger
          icon={<FiTrash2 size={16} />}
          onClick={() => handleDelete(selectedRowKeys)}
          className="delete-button"
        >
          Delete Selected ({selectedRowKeys.length})
        </Button>
      )}
    </div>
  );

  return (
    <div className="contact-list-container">
      {/* Bulk Actions */}
      <BulkActions />

      {/* Contact Table */}
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
          selectedRowKeys,
          onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
        onRow={(record) => ({
          onClick: (e) => handleRowClick(e, record),
          style: { cursor: 'pointer' }
        })}
        columns={columns}
        dataSource={enhancedContacts}
        loading={isLoading || isCompanyAccountsLoading}
        rowKey="id"
        className="modern-table"
        onChange={handleChange}
        pagination={pagination}
        scroll={{ x: "max-content", y: "100%" }}
      />

      {/* Edit Modal */}
      {editModalVisible && (
        <EditContact
          open={editModalVisible}
          onCancel={handleEditModalClose}
          contactData={selectedContact}
          isLoading={isLoading}
          loggedInUser={loggedInUser}
          contactsResponse={contactsResponse}
          companyAccountsResponse={companyAccountsResponse}
          isCompanyAccountsLoading={isCompanyAccountsLoading}
        />
      )}

      {/* Create Modal */}
      {createModalVisible && (
        <CreateContact
          open={createModalVisible}
          onCancel={handleCreateModalClose}
          isLoading={isLoading}
          loggedInUser={loggedInUser}
          contactsResponse={contactsResponse}
          companyAccountsResponse={companyAccountsResponse}
          isCompanyAccountsLoading={isCompanyAccountsLoading}
        />
      )}
    </div>
  );
};

export default ContactList;
