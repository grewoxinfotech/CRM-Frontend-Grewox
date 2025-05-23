import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Dropdown,
  Typography,
  Modal,
  message,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Tooltip,
  Menu,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiUser,
  FiTrendingUp,
  FiPercent,
  FiArrowUpRight,
  FiArrowDownRight,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useGetProductsQuery } from "../product&services/services/productApi";
import { useGetCustomersQuery } from "../customer/services/custApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useLocation, useNavigate } from "react-router-dom";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import './revenue.scss';

const { Text } = Typography;
const { Option } = Select;

const RevenueList = ({
  onEdit,
  onDelete,
  onView,
  data = [],
  loading,
  searchText = "",
  pagination = {}
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Get customer from location state if coming from customer list
  const customerFromList = location.state?.selectedCustomer;
  const productFromList = location.state?.selectedProduct;

  // Set initial customer if coming from customer list
  React.useEffect(() => {
    if (customerFromList) {
      setSelectedCustomer(customerFromList.id);
    }
    if (productFromList) {
      setSelectedProduct(productFromList.id);
    }
  }, [customerFromList, productFromList]);

  const loggedInUser = useSelector(selectCurrentUser);
  const { data: productsData } = useGetProductsQuery(loggedInUser?.id);
  const { data: customersData } = useGetCustomersQuery();
  const { data: currencies } = useGetAllCurrenciesQuery();

  const products = productsData?.data || [];
  const customers = customersData?.data || [];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Process revenue data to include parsed products
  const processedRevenue = useMemo(() => {
    try {
      return (data || []).map((revenue) => {
        // Products are already parsed in the API response
        const parsedProducts = Array.isArray(revenue.products) ? revenue.products : [];

        return {
          ...revenue,
          parsedProducts,
        };
      });
    } catch (error) {
      console.error("Error processing revenue data:", error);
      return [];
    }
  }, [data]);

  // Calculate product-wise revenue
  const productRevenue = useMemo(() => {
    try {
      const revenueMap = new Map();
      (processedRevenue || []).forEach((revenue) => {
        const products = Array.isArray(revenue?.parsedProducts)
          ? revenue.parsedProducts
          : [];
        products.forEach((product) => {
          if (!product?.product_id) return;

          const existing = revenueMap.get(product.product_id) || {
            total_revenue: 0,
            total_profit: 0,
            quantity_sold: 0,
            product_name: product.name || "Unknown Product",
          };

          existing.total_revenue += Number(product.total) || 0;
          existing.total_profit += Number(product.profit) || 0;
          existing.quantity_sold += Number(product.quantity) || 0;

          revenueMap.set(product.product_id, existing);
        });
      });

      return Array.from(revenueMap.entries()).map(([id, data]) => ({
        id,
        ...data,
      }));
    } catch (error) {
      console.error("Error calculating product revenue:", error);
      return [];
    }
  }, [processedRevenue]);

  // Calculate customer-wise revenue
  const customerRevenue = useMemo(() => {
    try {
      const revenueMap = new Map();
      (processedRevenue || []).forEach((revenue) => {
        if (!revenue?.customer) return;

        const customerId = revenue.customer;
        const existing = revenueMap.get(customerId) || {
          total_revenue: 0,
          total_profit: 0,
          transaction_count: 0,
        };

        existing.total_revenue += Number(revenue.amount) || 0;
        existing.total_profit += Number(revenue.profit) || 0;
        existing.transaction_count += 1;

        revenueMap.set(customerId, existing);
      });

      return Array.from(revenueMap.entries()).map(([id, data]) => ({
        id,
        ...data,
      }));
    } catch (error) {
      console.error("Error calculating customer revenue:", error);
      return [];
    }
  }, [processedRevenue]);

  // Filter revenue based on selected product and customer
  const filteredRevenue = useMemo(() => {
    return processedRevenue
      .filter((revenue) => {
        const products = Array.isArray(revenue?.parsedProducts)
          ? revenue.parsedProducts
          : [];
        const matchesProduct =
          !selectedProduct ||
          products.some((p) => p.product_id === selectedProduct);
        const matchesCustomer =
          !selectedCustomer || revenue.customer === selectedCustomer;
        const matchesSearch =
          !searchText ||
          revenue.description
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          revenue.category?.toLowerCase().includes(searchText.toLowerCase());

        return matchesProduct && matchesCustomer && matchesSearch;
      })
      .map((revenue) => {
        const products = Array.isArray(revenue?.parsedProducts)
          ? revenue.parsedProducts
          : [];

        // If product is selected, only show that product's profit
        if (selectedProduct) {
          const selectedProducts = products.filter(
            (p) => p.product_id === selectedProduct
          );
          const productTotal = selectedProducts.reduce(
            (sum, p) => sum + (Number(p.total) || 0),
            0
          );
          const productCost = selectedProducts.reduce(
            (sum, p) =>
              sum + (Number(p.buying_price) * Number(p.quantity) || 0),
            0
          );
          const productProfit = productTotal - productCost;

          return {
            ...revenue,
            amount: productTotal,
            profit: productProfit,
            cost_of_goods: productCost,
            profit_margin_percentage:
              productCost > 0 ? (productProfit / productCost) * 100 : 0,
            parsedProducts: selectedProducts.map((product) => ({
              ...product,
              profit:
                Number(product.total) -
                Number(product.buying_price) * Number(product.quantity),
            })),
          };
        }
        return {
          ...revenue,
          parsedProducts: products.map((product) => ({
            ...product,
            profit:
              Number(product.total) -
              Number(product.buying_price) * Number(product.quantity),
          })),
        };
      });
  }, [processedRevenue, selectedProduct, selectedCustomer, searchText]);

  const handleDelete = (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    const title = isMultiple ? 'Delete Revenues' : 'Delete Revenue';
    const content = isMultiple
      ? `Are you sure you want to delete ${recordOrIds.length} selected revenues? This action cannot be undone.`
      : 'Are you sure you want to delete this revenue?';

    Modal.confirm({
      title,
      content,
      okText: "Delete",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        onDelete(recordOrIds);
      },
    });
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    if (newPagination.current !== pagination.current) {
      pagination.onChange?.(newPagination.current);
    }
    if (newPagination.pageSize !== pagination.pageSize) {
      pagination.onSizeChange?.(newPagination.pageSize);
    }
  };

  const getCurrencyDetails = (currencyId) => {
    if (!currencyId || !currencies)
      return { currencyIcon: "₹", currencyCode: "INR" };
    const currency = currencies.find((c) => c.id === currencyId);
    return currency || { currencyIcon: "₹", currencyCode: "INR" };
  };

  const formatAmount = (amount, currencyId) => {
    if (amount === undefined || amount === null) return "₹ 0.00";
    const currency = getCurrencyDetails(currencyId);
    const numericAmount = Number(amount) || 0;
    return `${currency.currencyIcon} ${numericAmount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  };

  const getCustomerName = (customerId) => {
    if (!customerId || !customersData?.data) return "N/A";
    const customer = customersData.data.find(c => c.id === customerId);
    return customer?.name || customer?.companyName || "N/A";
  };

  // const rowSelection = {
  //   selectedRowKeys,
  //   onChange: (newSelectedRowKeys) => {
  //     setSelectedRowKeys(newSelectedRowKeys);
  //   },
  // };

  const columns = [
    {
      title: "Revenue Details",
      key: "details",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <FiTrendingUp className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">
                {record.description || `Payment for Invoice ${record.salesInvoiceNumber}`}
              </div>
              <div className="meta" style={{ color: '#4b5563' }}>
                {getCustomerName(record.customer)}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      key: "date",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <FiCalendar className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="main-info">
                <Text>{dayjs(record.date).format('DD MMM YYYY')}</Text>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      sorter: (a, b) => a.amount - b.amount,
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="info-wrapper" style={{ padding: '8px 0' }}>
              <div className="name" style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                {formatAmount(record.amount, record.currency)}
              </div>
              <div className="meta">
                <Tag color={record.profit >= 0 ? 'success' : 'error'} style={{ margin: 0 }}>
                  {record.profit >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
                  {` ${Math.abs(record.profit).toFixed(2)}%`}
                </Tag>
              </div>
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
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              {/* <Menu.Item key="view" icon={<FiEye style={{ fontSize: "14px" }} />} onClick={() => onView(record)}>
                View Details
              </Menu.Item>
              <Menu.Item key="edit" icon={<FiEdit2 style={{ fontSize: "14px" }} />} onClick={() => onEdit(record)}>
                Edit Revenue
              </Menu.Item> */}
              <Menu.Item key="delete" icon={<FiTrash2 />} danger onClick={() => handleDelete(record.id)}>
                Delete Revenue
              </Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<FiMoreVertical size={16} />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  // Calculate totals for stats
  const stats = useMemo(() => {
    return filteredRevenue.reduce(
      (acc, rev) => ({
        total_revenue: acc.total_revenue + (Number(rev.amount) || 0),
        total_profit: acc.total_profit + (Number(rev.profit) || 0),
        total_margin:
          acc.total_margin + (Number(rev.profit_margin_percentage) || 0),
        count: acc.count + 1,
      }),
      { total_revenue: 0, total_profit: 0, total_margin: 0, count: 0 }
    );
  }, [filteredRevenue]);

  const clearCustomerFilter = () => {
    setSelectedCustomer(null);
    navigate("/dashboard/sales/revenue", { replace: true });
  };

  const clearProductFilter = () => {
    setSelectedProduct(null);
    navigate("/dashboard/sales/revenue", { replace: true });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  // Use only numbers for mobile/tablet, and AntD default for desktop
  const paginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} customers`,
    pageSizeOptions: isMobile ? ["5", "10", "15", "20", "25"] : ["10", "20", "50", "100"],
    locale: {
      items_per_page: isMobile ? "" : "/ page",
    },
  };

  return (
    <div className="overview-content">
      <Row gutter={[16, 16]} className="metrics-row">
        <Col xs={24} sm={12} md={12}>
          <Card className="Metric-card revenue-card">
            <div className="metric-icon">
              <FiDollarSign />
            </div>
            <div className="metric-content">
              <div className="metric-label">TOTAL REVENUE</div>
              <div className="metric-value">
                ₹{filteredRevenue.reduce((sum, rev) => sum + (Number(rev.amount) || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="metric-subtitle">
                {filteredRevenue.length} Total Transactions
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12}>
          <Card className="Metric-card deals-card">
            <div className="metric-icon">
              <FiTrendingUp />
            </div>
            <div className="metric-content">
              <div className="metric-label">TOTAL PROFIT</div>
              <div className="metric-value">
                ₹{Math.abs(filteredRevenue.reduce((sum, rev) => sum + (Number(rev.profit) || 0), 0)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </div>
              <div className="metric-subtitle">
                Net {filteredRevenue.reduce((sum, rev) => sum + (Number(rev.profit) || 0), 0) >= 0 ? 'Profit' : 'Loss'}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12}>
          <Card className="Metric-card leads-card">
            <div className="metric-icon">
              <FiPercent />
            </div>
            <div className="metric-content">
              <div className="metric-label">PROFIT MARGIN</div>
              <div className="metric-value">
                {(filteredRevenue.length > 0
                  ? filteredRevenue.reduce((sum, rev) => sum + (Number(rev.profit_margin_percentage) || 0), 0) /
                  filteredRevenue.length
                  : 0
                ).toFixed(2)}%
              </div>
              <div className="metric-subtitle">
                Average Margin
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={12}>
          <Card className="Metric-card created-card">
            <div className="metric-icon">
              <FiPackage />
            </div>
            <div className="metric-content">
              <div className="metric-label">PRODUCTS SOLD</div>
              <div className="metric-value">
                {productRevenue.reduce((sum, p) => sum + (p.quantity_sold || 0), 0)}
              </div>
              <div className="metric-subtitle">
                Total Units
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="revenue-container">
        <Row gutter={[16, 16]} className="revenue-filters">
          {selectedRowKeys.length > 0 && (
            <Col xs={24}>
              <div className="bulk-actions" style={{ marginBottom: '16px' }}>
                <Button
                  type="primary"
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => handleDelete(selectedRowKeys)}
                >
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </div>
            </Col>
          )}
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select Product"
              allowClear
              style={{ width: "100%" }}
              onChange={setSelectedProduct}
              value={selectedProduct}
            >
              {products.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select Customer"
              allowClear
              style={{ width: "100%" }}
              onChange={setSelectedCustomer}
              value={selectedCustomer}
            >
              {customers.map((customer) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <div className="revenue-tables">
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredRevenue}
            rowKey="id"
            loading={loading}
            onChange={handleTableChange}
            pagination={{
              ...pagination,
              ...paginationConfig,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              pageSizeOptions: ['10', '20', '50', '100'],
              position: ['bottomRight'],
              hideOnSinglePage: false,
              showQuickJumper: true
            }}
            scroll={{x:"max-content",y:"100%"}}

            className="revenue-table"
          />
        </div>
      </div>
    </div>
  );
};

export default RevenueList;
