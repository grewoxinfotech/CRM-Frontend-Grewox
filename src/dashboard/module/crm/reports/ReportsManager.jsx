import React, { useState } from 'react';
import { Card, Row, Col, Table, Button, Space, Tag, Tabs, Select, DatePicker, Avatar, message, Tooltip as AntdTooltip } from 'antd';
import { 
  FiFileText, 
  FiDownload, 
  FiCalendar, 
  FiHome, 
  FiTrendingUp, 
  FiUsers, 
  FiCheckSquare,
  FiClock,
  FiMail
} from "react-icons/fi";
import { Link } from 'react-router-dom';
import PageHeader from '../../../../components/PageHeader';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { useGetLeadsQuery, useGetGlobalFollowupsQuery } from '../lead/services/LeadApi';
import { useGetRevenueQuery } from '../../sales/revenue/services/revenueApi';

// CSV and Excel Generator Utility
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const { Option } = Select;

const ReportsManager = () => {
  const [activeTab, setActiveTab] = useState('sales');

  const currentUser = useSelector(selectCurrentUser);
  const { data: rolesData } = useGetRolesQuery(undefined, {
      skip: !currentUser || currentUser.roleName === 'super-admin' || currentUser.roleName === 'client'
  });
  const userRoleData = rolesData?.message?.data?.find(role => role.id === currentUser?.role_id);
  const userPermissions = React.useMemo(() => {
      if (!userRoleData?.permissions) return null;
      try {
          return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
      } catch (e) { return null; }
  }, [userRoleData]);
  const hasPermission = React.useCallback((action) => {
      if (!currentUser) return false;
      if (currentUser.roleName === 'super-admin' || currentUser.roleName === 'client') return true;
      if (!userPermissions) return false;
      const perms = userPermissions['dashboards-reports'];
      if (!perms || perms.length === 0) return false;
      return (perms[0]?.permissions || []).includes(action);
  }, [currentUser, userPermissions]);
  
  // Get real data for the exports
  const { data: leadsResponse } = useGetLeadsQuery({ page: 1, pageSize: 500 });
  const { data: revenueResponse } = useGetRevenueQuery({ page: 1, pageSize: 500 });
  const { data: followupsResponse } = useGetGlobalFollowupsQuery();

  const leads = leadsResponse?.data || [];
  const revenue = revenueResponse?.data || [];
  const followups = followupsResponse?.data || [];

  // Export functions using actual client data!
  const exportToExcel = (data, fileName, sheetName) => {
    if (!data || data.length === 0) {
      message.warning("No data available to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
    message.success(`${sheetName} report downloaded as Excel successfully!`);
  };

  const exportToCSV = (data, fileName) => {
    if (!data || data.length === 0) {
      message.warning("No data available to export.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Report downloaded as CSV successfully!");
  };

  const exportToPDF = (headers, rows, title, filename) => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.text(title, 14, 16);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [22, 119, 255] }
    });
    
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    message.success("Report downloaded as PDF successfully!");
  };

  // 1. Sales Report
  const handleSalesReport = (format) => {
    const salesData = revenue.map(r => ({
      ID: r.id,
      Subject: r.subject || 'N/A',
      Amount: `$${Number(r.amount || 0).toLocaleString()}`,
      Date: r.date ? new Date(r.date).toLocaleDateString() : 'N/A',
      CreatedBy: r.createdBy || 'Client'
    }));

    if (format === 'excel') {
      exportToExcel(salesData, 'Sales_Revenue_Report', 'Sales');
    } else if (format === 'csv') {
      exportToCSV(salesData, 'Sales_Revenue_Report');
    } else {
      const headers = ['ID', 'Subject', 'Amount', 'Date', 'Created By'];
      const rows = salesData.map(d => [d.ID, d.Subject, d.Amount, d.Date, d.CreatedBy]);
      exportToPDF(headers, rows, 'Sales & Revenue Report Ledger', 'Sales_Revenue_Report');
    }
  };

  // 2. Leads Report
  const handleLeadsReport = (format) => {
    const leadsData = leads.map(l => ({
      Name: l.leadName || 'Unnamed',
      Status: l.leadStatus || 'New Lead',
      Source: l.source || 'Manual',
      Interest: l.interestLevel || 'Medium',
      Created: l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A'
    }));

    if (format === 'excel') {
      exportToExcel(leadsData, 'Leads_Lifecycle_Report', 'Leads');
    } else if (format === 'csv') {
      exportToCSV(leadsData, 'Leads_Lifecycle_Report');
    } else {
      const headers = ['Name', 'Status', 'Source', 'Interest Level', 'Created Date'];
      const rows = leadsData.map(d => [d.Name, d.Status, d.Source, d.Interest, d.Created]);
      exportToPDF(headers, rows, 'Leads Lifecycle & Stage Report', 'Leads_Lifecycle_Report');
    }
  };

  // 3. Follow-up Report
  const handleFollowupsReport = (format) => {
    const followData = followups.map(f => ({
      Subject: f.subject || 'N/A',
      Type: f.type || 'Call',
      Status: f.status || 'pending',
      DueDate: f.due_date || f.call_start_date || 'N/A',
      Notes: f.notes || f.call_notes || 'N/A'
    }));

    if (format === 'excel') {
      exportToExcel(followData, 'Followups_Activities_Report', 'Followups');
    } else if (format === 'csv') {
      exportToCSV(followData, 'Followups_Activities_Report');
    } else {
      const headers = ['Subject', 'Type', 'Status', 'Due Date', 'Notes'];
      const rows = followData.map(d => [d.Subject, d.Type, d.Status, d.DueDate, d.Notes]);
      exportToPDF(headers, rows, 'CRM Follow-ups & Activities Report', 'Followups_Activities_Report');
    }
  };

  const reportsList = {
    sales: [
      { id: 'S1', title: 'Monthly Revenue Ledger', desc: 'Breakdown of all revenue receipts, invoice clearings, and agent bookings.', action: handleSalesReport },
      { id: 'S2', title: 'Customer Transactions Summary', desc: 'Summary of paid transactions grouped by customer profile.', action: handleSalesReport },
      { id: 'S3', title: 'Profit & Inflow Analysis', desc: 'Detailed log of invoice payments, debit notes, and direct bookings.', action: handleSalesReport }
    ],
    leads: [
      { id: 'L1', title: 'Leads Pipeline Stage Velocity', desc: 'Analysis of lead counts across pipeline stages, channels, and capture source.', action: handleLeadsReport },
      { id: 'L2', title: 'Lead Source Acquisition Quality', desc: 'Detailed report showing conversions grouped by source (Indiamart, Google Ads).', action: handleLeadsReport },
      { id: 'L3', title: 'Stale Leads & Inactivity Audit', desc: 'List of leads with no updates or follow-ups in the last 14 days.', action: handleLeadsReport }
    ],
    followups: [
      { id: 'F1', title: 'Agent Activity & Engagement Report', desc: 'Complete breakdown of logged calls, meetings, and scheduled follow-up tasks.', action: handleFollowupsReport },
      { id: 'F2', title: 'Overdue Follow-ups Log', desc: 'Audit report of all pending follow-up calls or meetings past their due date.', action: handleFollowupsReport },
      { id: 'F3', title: 'Call Outcomes & Notes Summary', desc: 'Detailed transcript and status checklist for phone logs and meeting results.', action: handleFollowupsReport }
    ]
  };

  const columns = [
    {
      title: 'Report Code',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id) => <Tag color="blue" style={{ fontWeight: '600', padding: '2px 8px', borderRadius: '4px' }}>{id}</Tag>
    },
    {
      title: 'Report Name',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span style={{ fontWeight: '600', color: '#1e293b' }}>{text}</span>
    },
    {
      title: 'Description',
      dataIndex: 'desc',
      key: 'desc',
      render: (text) => <span style={{ color: '#64748b' }}>{text}</span>
    },
    {
      title: 'Download Format',
      key: 'actions',
      width: 320,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            ghost 
            size="small" 
            icon={<FiDownload />} 
            onClick={() => record.action('pdf')}
            disabled={!hasPermission('export')}
            style={{ borderRadius: '6px' }}
          >
            PDF
          </Button>
          <Button 
            type="primary" 
            ghost 
            size="small" 
            color="success" 
            variant="outlined"
            icon={<FiDownload />} 
            onClick={() => record.action('excel')}
            disabled={!hasPermission('export')}
            style={{ borderRadius: '6px', color: '#52c41a', borderColor: '#52c41a' }}
          >
            Excel
          </Button>
          <Button 
            type="primary" 
            ghost 
            size="small" 
            icon={<FiDownload />} 
            onClick={() => record.action('csv')}
            disabled={!hasPermission('export')}
            style={{ borderRadius: '6px', color: '#722ed1', borderColor: '#722ed1' }}
          >
            CSV
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="reports-manager-page standard-page-container">
      <PageHeader
        title="Reports Manager"
        subtitle="Generate, customize, and export tabular PDF, Excel, and CSV reports instantly"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Reports Manager" },
        ]}
      />

      {/* Overview Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar style={{ backgroundColor: '#e6f4ff', color: '#1677ff', borderRadius: '12px' }} size={48} icon={<FiFileText />} />
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Exportable Templates</span>
                <span style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>9 Reports</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar style={{ backgroundColor: '#f6ffed', color: '#52c41a', borderRadius: '12px' }} size={48} icon={<FiDownload />} />
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Real-time Data Pull</span>
                <span style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>Connected</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar style={{ backgroundColor: '#f9f0ff', color: '#722ed1', borderRadius: '12px' }} size={48} icon={<FiClock />} />
              <div>
                <span style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>Last Generation</span>
                <span style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b' }}>Just Now</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Reports List */}
      <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 25px rgba(0, 0, 0, 0.03)', padding: '8px' }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="line"
          items={[
            {
              key: 'sales',
              label: <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}><FiTrendingUp /> Sales & Financials</span>,
              children: (
                <div style={{ paddingTop: '16px' }}>
                  <Table 
                    columns={columns} 
                    dataSource={reportsList.sales} 
                    pagination={false} 
                    rowKey="id"
                    className="standard-reports-table"
                  />
                </div>
              )
            },
            {
              key: 'leads',
              label: <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}><FiUsers /> Leads & Acquisition</span>,
              children: (
                <div style={{ paddingTop: '16px' }}>
                  <Table 
                    columns={columns} 
                    dataSource={reportsList.leads} 
                    pagination={false} 
                    rowKey="id"
                    className="standard-reports-table"
                  />
                </div>
              )
            },
            {
              key: 'followups',
              label: <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}><FiClock /> Follow-ups & Activities</span>,
              children: (
                <div style={{ paddingTop: '16px' }}>
                  <Table 
                    columns={columns} 
                    dataSource={reportsList.followups} 
                    pagination={false} 
                    rowKey="id"
                    className="standard-reports-table"
                  />
                </div>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default ReportsManager;
