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
  FiBox,
  FiTag,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "./services/productApi";
import EditProduct from "./EditProduct";

const { Text } = Typography;

const ProductList = ({ onEdit, onView, searchText = "" }) => {
  const { data: productsData = [], isLoading } = useGetProductsQuery();
  const products = productsData.data;
  const [deleteProduct] = useDeleteProductMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = React.useMemo(() => {
    return products?.filter((product) => {
      const searchLower = searchText.toLowerCase();
      const name = product?.name?.toLowerCase() || "";
      const category = product?.category?.toLowerCase() || "";
      const price = product?.price?.toString().toLowerCase() || "";
      const sku = product?.sku?.toLowerCase() || "";
      const description = product?.description?.toLowerCase() || "";

      return (
        !searchText ||
        name.includes(searchLower) ||
        category.includes(searchLower) ||
        price.includes(searchLower) ||
        sku.includes(searchLower) ||
        description.includes(searchLower)
      );
    });
  }, [products, searchText]);

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      message.success("Product deleted successfully");
    } catch (error) {
      message.error(error?.data?.message || "Failed to delete product");
    }
  };

  const handleEdit = (record) => {
    setSelectedProduct(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedProduct(null);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a?.name || "").localeCompare(b?.name || ""),
      render: (name) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#1890ff",
            fontWeight: 500,
          }}
        >
          <FiBox style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text strong>{name}</Text>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      sorter: (a, b) => (a?.category || "").localeCompare(b?.category || ""),
      render: (category) => (
        <Tag
          color="blue"
          style={{
            borderRadius: "4px",
            padding: "2px 8px",
            fontSize: "13px",
          }}
        >
          {category}
        </Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => (
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
            {typeof price === "number"
              ? price.toFixed(2)
              : Number(price).toFixed(2) || "0.00"}
          </Text>
        </div>
      ),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (sku) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#595959",
          }}
        >
          <FiTag style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text>{sku}</Text>
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
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<FiEye />}
              onClick={() => onView(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<FiEdit2 />}
              onClick={() => onEdit(record)}
              style={{ color: "#52c41a" }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<FiTrash2 />}
              onClick={() => {
                Modal.confirm({
                  title: "Delete Product",
                  content: "Are you sure you want to delete this product?",
                  okText: "Yes",
                  okType: "danger",
                  cancelText: "No",
                  onOk: () => handleDelete(record.id),
                });
              }}
              style={{ color: "#ff4d4f" }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={filteredProducts}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} products`,
        }}
        scroll={{ x: true }}
      />

      <EditProduct
        open={editModalVisible}
        onCancel={handleEditModalClose}
        initialValues={selectedProduct}
      />
    </>
  );
};

export default ProductList;
