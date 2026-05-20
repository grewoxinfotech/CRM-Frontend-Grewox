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
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";
import { useGetCategoriesQuery } from "../../crm/crmsystem/souce/services/SourceApi";
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

  const { data: rolesData } = useGetRolesQuery(undefined, {
    skip: !currentUser || currentUser.roleName === 'super-admin' || currentUser.roleName === 'client'
  });

  const userRoleData = rolesData?.message?.data?.find(role => role.id === currentUser?.role_id);
  const userPermissions = React.useMemo(() => {
    if (!userRoleData?.permissions) return null;
    try {
      return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
    } catch (e) {
      return null;
    }
  }, [userRoleData]);

  const hasPermission = React.useCallback((action) => {
    if (!currentUser) return false;
    if (currentUser.roleName === 'super-admin' || currentUser.roleName === 'client') return true;
    if (!userPermissions) return false;
    const modulePerms = userPermissions['dashboards-sales-product-services'];
    if (!modulePerms || modulePerms.length === 0) return false;
    const allowed = modulePerms[0]?.permissions || [];
    return allowed.includes(action);
  }, [currentUser, userPermissions]);

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
  const { data: categoriesResponse } = useGetCategoriesQuery(currentUser?.id);

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
        onAdd={hasPermission('create') ? () => setIsCreateModalOpen(true) : undefined}
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
          categoriesData={categoriesResponse?.data}
          searchText={searchText}
          pagination={pagination}
          onChange={(newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }))}
          hasPermission={hasPermission}
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
