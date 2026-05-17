import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Tag,
  Dropdown,
  Typography,
  Modal,
  message,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiSearch,
  FiLayers,
} from "react-icons/fi";

import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
} from "../souce/services/SourceApi";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";
import "./category.scss";

const { Text } = Typography;

const Categories = ({ isModalOpen, setIsModalOpen, hasPermission }) => {
  const [searchText, setSearchText] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const currentUser = useSelector(selectCurrentUser);

  const { data: categoriesData, isLoading, refetch } = useGetCategoriesQuery(currentUser?.id);
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleDelete = async (record) => {
    Modal.confirm({
      title: "Delete Category",
      content: "Are you sure you want to delete this category?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteCategory(record.id).unwrap();
          message.success("Category deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete category");
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedCategory(record);
    setEditModalVisible(true);
  };

  const filteredCategories = React.useMemo(() => {
    const categories = categoriesData?.data || [];
    if (!searchText) return categories;

    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categoriesData, searchText]);

  const getDropdownItems = (record) => {
    const items = [];
    if (!hasPermission || hasPermission('update')) {
      items.push({
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => handleEdit(record),
      });
    }
    if (!hasPermission || hasPermission('delete')) {
      items.push({
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record),
        danger: true,
      });
    }
    return { items };
  };

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: record.color || '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}
          >
            <FiLayers />
          </div>
          <Text strong style={{ color: '#1e293b' }}>{text}</Text>
        </div>
      ),

    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },

    {
      title: "Action",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => {
        const { items } = getDropdownItems(record);
        if (items.length === 0) return null;
        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<FiMoreVertical />}
              className="action-button"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="category-container">




      <Table
        columns={columns}
        dataSource={filteredCategories}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} categories`,
        }}
      />

      <AddCategoryModal
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      />


      {selectedCategory && (
        <EditCategoryModal
          visible={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedCategory(null);
          }}
          initialValues={selectedCategory}
        />
      )}
    </div>
  );
};

export default Categories; 