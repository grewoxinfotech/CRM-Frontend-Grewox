import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  message,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import InvoiceList from "./InvoiceList";
import CreateInvoice from "./CreateInvoice";
import EditInvoice from "./EditInvoice";
import "./invoices.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const { Title, Text } = Typography;

const DealInvoice = (deal) => {



  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch invoices
      const response = await fetch("/api/invoices");
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Fetch Error:", error);
      // message.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      setLoading(true);
      // TODO: Implement API call to create invoice
      await fetch("/api/invoices", {
        method: "POST",
        body: formData,
      });
      message.success("Invoice created successfully");
      setCreateModalVisible(false);
      fetchInvoices();
    } catch (error) {
      console.error("Create Error:", error);
      message.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (formData) => {
    try {
      setLoading(true);
      // TODO: Implement API call to update invoice
      await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PUT",
        body: formData,
      });
      message.success("Invoice updated successfully");
      setEditModalVisible(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error("Edit Error:", error);
      message.error("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      // TODO: Implement API call to delete invoice
      await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      message.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      console.error("Delete Error:", error);
      message.error("Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (invoice) => {
    // TODO: Implement view invoice functionality
    console.log("View invoice:", invoice);
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = invoices.map((invoice) => ({
        "Invoice Number": invoice.invoice_number,
        Customer: invoice.customer_name,
        Date: moment(invoice.date).format("YYYY-MM-DD"),
        "Due Date": moment(invoice.due_date).format("YYYY-MM-DD"),
        Status: invoice.status,
        Total: invoice.total,
        "Created Date": moment(invoice.created_at).format("YYYY-MM-DD"),
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "invoices_export");
          break;
        case "excel":
          exportToExcel(data, "invoices_export");
          break;
        case "pdf":
          exportToPDF(data, "invoices_export");
          break;
        default:
          break;
      }
      message.success(`Successfully exported as ${type.toUpperCase()}`);
    } catch (error) {
      message.error(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((item) =>
        Object.values(item)
          .map((value) => `"${value?.toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
      margin: { top: 20 },
      styles: { fontSize: 8 },
    });
    doc.save(`${filename}.pdf`);
  };

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="csv"
        icon={<FiDownload />}
        onClick={() => handleExport("csv")}
      >
        Export as CSV
      </Menu.Item>
      <Menu.Item
        key="excel"
        icon={<FiDownload />}
        onClick={() => handleExport("excel")}
      >
        Export as Excel
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FiDownload />}
        onClick={() => handleExport("pdf")}
      >
        Export as PDF
      </Menu.Item>
    </Menu>
  );

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
        <div className="page-title">
          <Title level={2}>Invoices</Title>
          <Text type="secondary">Manage all invoices in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="search-filter-group">
            <Input
              prefix={
                <FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />
              }
              placeholder="Search invoices..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              value={searchText}
              className="search-input"
              style={{ width: 300 }}
            />
          </div>
          <div className="action-buttons">
            <Dropdown overlay={exportMenu} trigger={["click"]}>
              <Button
                className="export-button"
                icon={<FiDownload size={16} />}
                loading={loading}
              >
                Export
                <FiChevronDown size={16} />
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<FiPlus size={16} />}
              onClick={() => setCreateModalVisible(true)}
              className="add-button"
            >
              Create Invoice
            </Button>
          </div>
        </div>
      </div>

      <Card className="invoice-table-card">
        <InvoiceList
            deal={deal}
          loading={loading}
          invoices={invoices}
          searchText={searchText}
          onEdit={(invoice) => {
            setSelectedInvoice(invoice);
            setEditModalVisible(true);
          }}
          onDelete={handleDelete}
          onView={handleView}
        />
      </Card>

      <CreateInvoice
        open={createModalVisible}
        deal={deal}
        onCancel={() => setCreateModalVisible(false)}
        onSubmit={handleCreate}
        setCreateModalVisible={setCreateModalVisible}
      />

      <EditInvoice
        open={editModalVisible}
        deal={deal}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleEdit}
        initialValues={selectedInvoice}
      />
    </div>
  );
};

export default DealInvoice;








// import React, { useState } from 'react';
// import { Card, Table, Button, Tag, Modal, Form, Input, DatePicker, Select, InputNumber } from 'antd';
// import { FiPlus, FiFileText, FiDollarSign, FiCalendar, FiDownload, FiSend, FiEye } from 'react-icons/fi';
// import './invoices.scss';

// const ProjectInvoices = ({ project }) => {
//     const [isModalVisible, setIsModalVisible] = useState(false);
//     const [form] = Form.useForm();

//     // Dummy data for demonstration
//     const invoices = [
//         {
//             id: 'INV-2024-001',
//             date: '2024-03-15',
//             dueDate: '2024-04-15',
//             amount: 5000,
//             status: 'paid',
//             description: 'Project Phase 1 Development',
//             client: 'Acme Corporation'
//         },
//         {
//             id: 'INV-2024-002',
//             date: '2024-03-20',
//             dueDate: '2024-04-20',
//             amount: 3500,
//             status: 'pending',
//             description: 'UI/UX Design Services',
//             client: 'Acme Corporation'
//         },
//         {
//             id: 'INV-2024-003',
//             date: '2024-03-25',
//             dueDate: '2024-04-25',
//             amount: 2800,
//             status: 'overdue',
//             description: 'Additional Feature Development',
//             client: 'Acme Corporation'
//         }
//     ];

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'paid':
//                 return 'success';
//             case 'pending':
//                 return 'warning';
//             case 'overdue':
//                 return 'error';
//             default:
//                 return 'default';
//         }
//     };

//     const columns = [
//         {
//             title: 'Invoice',
//             dataIndex: 'id',
//             key: 'id',
//             render: (text, record) => (
//                 <div className="invoice-info">
//                     <FiFileText className="invoice-icon" />
//                     <div className="invoice-details">
//                         <h4>{text}</h4>
//                         <p>{record.description}</p>
//                     </div>
//                 </div>
//             ),
//         },
//         {
//             title: 'Amount',
//             dataIndex: 'amount',
//             key: 'amount',
//             render: (amount) => (
//                 <div className="amount-info">
//                     <FiDollarSign />
//                     <span>{amount.toLocaleString()}</span>
//                 </div>
//             ),
//         },
//         {
//             title: 'Date',
//             dataIndex: 'date',
//             key: 'date',
//             render: (date) => (
//                 <div className="date-info">
//                     <FiCalendar />
//                     <span>{new Date(date).toLocaleDateString()}</span>
//                 </div>
//             ),
//         },
//         {
//             title: 'Due Date',
//             dataIndex: 'dueDate',
//             key: 'dueDate',
//             render: (date) => (
//                 <div className="date-info">
//                     <FiCalendar />
//                     <span>{new Date(date).toLocaleDateString()}</span>
//                 </div>
//             ),
//         },
//         {
//             title: 'Status',
//             dataIndex: 'status',
//             key: 'status',
//             render: (status) => (
//                 <Tag color={getStatusColor(status)}>
//                     {status.charAt(0).toUpperCase() + status.slice(1)}
//                 </Tag>
//             ),
//         },
//         {
//             title: 'Actions',
//             key: 'actions',
//             render: (_, record) => (
//                 <div className="action-buttons">
//                     <Button
//                         type="text"
//                         icon={<FiEye />}
//                         className="view-button"
//                         onClick={() => handleView(record)}
//                     />
//                     <Button
//                         type="text"
//                         icon={<FiDownload />}
//                         className="download-button"
//                         onClick={() => handleDownload(record)}
//                     />
//                     <Button
//                         type="text"
//                         icon={<FiSend />}
//                         className="send-button"
//                         onClick={() => handleSend(record)}
//                     />
//                 </div>
//             ),
//         },
//     ];

//     const handleAddInvoice = () => {
//         setIsModalVisible(true);
//     };

//     const handleModalOk = () => {
//         form.validateFields().then(values => {
//             console.log('New invoice values:', values);
//             setIsModalVisible(false);
//             form.resetFields();
//         });
//     };

//     const handleView = (record) => {
//         console.log('View invoice:', record);
//     };

//     const handleDownload = (record) => {
//         console.log('Download invoice:', record);
//     };

//     const handleSend = (record) => {
//         console.log('Send invoice:', record);
//     };

//     return (
//         <div className="project-invoices">
//             <Card
//                 title="Project Invoices"
//                 extra={
//                     <Button
//                         type="primary"
//                         icon={<FiPlus />}
//                         onClick={handleAddInvoice}
//                     >
//                         Create Invoice
//                     </Button>
//                 }
//             >
//                 <Table
//                     columns={columns}
//                     dataSource={invoices}
//                     rowKey="id"
//                     pagination={{
//                         pageSize: 10,
//                         total: invoices.length,
//                         showTotal: (total) => `Total ${total} invoices`
//                     }}
//                 />
//             </Card>

//             <Modal
//                 title="Create New Invoice"
//                 open={isModalVisible}
//                 onOk={handleModalOk}
//                 onCancel={() => setIsModalVisible(false)}
//                 okText="Create Invoice"
//                 width={600}
//             >
//                 <Form
//                     form={form}
//                     layout="vertical"
//                 >
//                     <Form.Item
//                         name="description"
//                         label="Description"
//                         rules={[{ required: true, message: 'Please enter description' }]}
//                     >
//                         <Input placeholder="Enter invoice description" />
//                     </Form.Item>

//                     <div className="form-row">
//                         <Form.Item
//                             name="amount"
//                             label="Amount"
//                             rules={[{ required: true, message: 'Please enter amount' }]}
//                         >
//                             <InputNumber
//                                 prefix={<FiDollarSign />}
//                                 style={{ width: '100%' }}
//                                 placeholder="Enter amount"
//                                 formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
//                                 parser={value => value.replace(/\$\s?|(,*)/g, '')}
//                             />
//                         </Form.Item>

//                         <Form.Item
//                             name="date"
//                             label="Invoice Date"
//                             rules={[{ required: true, message: 'Please select date' }]}
//                         >
//                             <DatePicker style={{ width: '100%' }} />
//                         </Form.Item>
//                     </div>

//                     <div className="form-row">
//                         <Form.Item
//                             name="dueDate"
//                             label="Due Date"
//                             rules={[{ required: true, message: 'Please select due date' }]}
//                         >
//                             <DatePicker style={{ width: '100%' }} />
//                         </Form.Item>

//                         <Form.Item
//                             name="status"
//                             label="Status"
//                             rules={[{ required: true, message: 'Please select status' }]}
//                         >
//                             <Select placeholder="Select status">
//                                 <Select.Option value="pending">Pending</Select.Option>
//                                 <Select.Option value="paid">Paid</Select.Option>
//                             </Select>
//                         </Form.Item>
//                     </div>

//                     <Form.Item
//                         name="notes"
//                         label="Notes"
//                     >
//                         <Input.TextArea
//                             placeholder="Enter additional notes"
//                             rows={4}
//                         />
//                     </Form.Item>
//                 </Form>
//             </Modal>
//         </div>
//     );
// };

// export default ProjectInvoices; 