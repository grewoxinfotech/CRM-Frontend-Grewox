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
import "./invoices.scss";
import CreateInvoice from "./CreateInvoice";
import InvoiceList from "./InvoiceList";
import EditInvoice from "./EditInvoice";

const { Title, Text } = Typography;

const DealInvoice = (deal) => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchText, setSearchText] = useState("");

  const handleCreate = () => {
    setSelectedInvoice(null);
    setCreateModalVisible(true);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setEditModalVisible(true);
  };

  const handleDelete = (invoice) => {
    Modal.confirm({
      title: "Delete Invoice",
      content: "Are you sure you want to delete this invoice?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // Handle delete action
      },
    });
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
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

  return (
    <div className="invoice-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/sales">Sales</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Invoices</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="header-left">
          <h2>Invoices</h2>
          <Text className="subtitle">Manage your invoices</Text>
        </div>

        <div className="header-right">
          <Input
            prefix={<FiSearch style={{ color: "#9CA3AF" }} />}
            placeholder="Search invoices..."
            className="search-input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Dropdown menu={exportMenu} trigger={["click"]}>
            <Button>
              <FiDownload /> Export <FiChevronDown />
            </Button>
          </Dropdown>
          <Button type="primary" icon={<FiPlus />} onClick={handleCreate}>
            Add Invoice
          </Button>
        </div>
      </div>

      <Card className="invoice-content">
        <InvoiceList
          deal={deal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </Card>

      <CreateInvoice
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        dealId={deal?.deal?.id}
      />

      <EditInvoice
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedInvoice(null);
        }}
        initialValues={selectedInvoice}
        dealId={deal?.deal?.id}
      />
    </div>
  );
};

export default DealInvoice; 