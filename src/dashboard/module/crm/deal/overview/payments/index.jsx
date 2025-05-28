import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  Modal,
  Popover,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiGrid,
  FiList,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import "./payment.scss";
import CreatePayment from "./createpayment";
import PaymentsList from "./paymentsList";
import EditPayment from "./Editpayment";

const { Title, Text } = Typography;

const DealPayments = (deal) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleCreate = () => {
    setSelectedPayment(null);
    setCreateModalVisible(true);
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setEditModalVisible(true);
  };

  const handleDelete = (payment) => {
    Modal.confirm({
      title: "Delete Payment",
      content: "Are you sure you want to delete this payment?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // Handle delete action
      },
    });
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
  };

  const exportMenu = {
    items: [
      {
        key: "csv",
        label: "Export as CSV",
      },
      {
        key: "excel",
        label: "Export as Excel",
      },
      {
        key: "pdf",
        label: "Export as PDF",
      },
    ],
  };

  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search payments..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  return (
    <div className="payment-page">
      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Payments</Title>
          <Text className="page-description" type="secondary">Manage your payments</Text>
        </div>
        <div className="header-actions">
          <div className="desktop-actions">
            <div className="action-buttons">
              <div className="search-container">
                <Input
                  prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                  placeholder="Search payments..."
                  allowClear
                  onChange={(e) => setSearchText(e.target.value)}
                  value={searchText}
                  className="search-input"
                />
                <Popover
                  content={searchContent}
                  trigger="click"
                  open={isSearchVisible}
                  onOpenChange={setIsSearchVisible}
                  placement="bottomRight"
                  className="mobile-search-popover"
                >
                  <Button
                    className="search-icon-button"
                    icon={<FiSearch size={16} />}
                  />
                </Popover>
              </div>
              <Dropdown overlay={exportMenu} trigger={["click"]}>
                <Button className="export-button">
                  <FiDownload size={16} />
                  <span className="button-text">Export</span>
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<FiPlus size={16} />}
                onClick={handleCreate}
                className="add-button"
              >
                <span className="button-text">Add Payment</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="payment-content">
        <PaymentsList
          deal={deal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </Card>

      <CreatePayment
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        dealId={deal?.deal?.id}
      />

      <EditPayment
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedPayment(null);
        }}
        initialValues={selectedPayment}
        dealId={deal?.deal?.id}
      />
    </div>
  );
};

export default DealPayments;
