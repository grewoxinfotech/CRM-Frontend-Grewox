import React, { useState } from "react";
import {
  Card,
  message,
} from "antd";
import {
  FiPlus,
  FiDownload,
  FiHome,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import CreateProduct from "./CreateProduct";
import ProductList from "./ProductList";
import EditProduct from "./EditProduct";
import {
  useGetProductsQuery,
  useCreateProductMutation,
} from "./services/productApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import PageHeader from "../../../../components/PageHeader";

const ProductServices = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const {
    data: productsData = [],
    isLoading,
    refetch,
  } = useGetProductsQuery({
    id: currentUser?.id,
    page: pagination.current,
    pageSize: pagination.pageSize,
    search: searchText
  });

  const [createProduct] = useCreateProductMutation();
  const { data: currenciesData } = useGetAllCurrenciesQuery();

  const handleCreateSubmit = async (formData) => {
    try {
      setLoading(true);
      await createProduct({ id: currentUser?.id, data: formData }).unwrap();
      message.success("Product created successfully");
      setIsCreateModalOpen(false);
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="product-page standard-page-container">
      <PageHeader
        title="Products & Services"
        count={productsData?.pagination?.total || 0}
        subtitle="Manage all products and services in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Sales" },
          { title: "Products & Services" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        searchPlaceholder="Search products..."
        onAdd={() => setIsCreateModalOpen(true)}
        addText="Add Product"
        exportMenu={{
          items: [
            { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
            { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
            { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
          ]
        }}
      />

      <Card className="standard-content-card">
        <ProductList
          data={productsData}
          loading={isLoading}
          onEdit={(record) => { setSelectedProduct(record); setEditModalVisible(true); }}
          onProductRevenueClick={(product) => navigate(`/dashboard/sales/revenue`, { state: { selectedProduct: product } })}
          currenciesData={currenciesData}
          searchText={searchText}
          pagination={pagination}
          onChange={(newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }))}
        />
      </Card>

      <CreateProduct
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        currenciesData={currenciesData}
        loading={loading}
      />

      <EditProduct
        open={editModalVisible}
        currenciesData={currenciesData}
        onCancel={() => { setEditModalVisible(false); setSelectedProduct(null); }}
        initialValues={selectedProduct}
      />
    </div>
  );
};

export default ProductServices;
