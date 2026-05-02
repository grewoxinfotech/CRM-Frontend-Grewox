import React, { useState } from "react";
import { FiList, FiLayers, FiDatabase, FiTag, FiFileText, FiHome, FiSettings } from "react-icons/fi";
import Pipeline from "./pipeline";
import LeadStages from "./leadstage/index";
import DealStages from "./dealstage/index";
import "./crmsystem.scss";
import Source from "./souce/index";
import Lable from "./lable/index";
import ContractType from "./contractType";
import PageHeader from "../../../../components/PageHeader";
import { Link } from "react-router-dom";
import { Card, Typography } from "antd";

const { Title } = Typography;

export default function Crmsystem() {
  const [activeSection, setActiveSection] = useState("Pipeline");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const menuItems = [
    { title: "Pipeline", icon: <FiList /> },
    { title: "Lead Stages", icon: <FiLayers /> },
    { title: "Deal Stages", icon: <FiLayers /> },
    { title: "Sources", icon: <FiDatabase /> },
    { title: "Labels", icon: <FiTag /> },
    { title: "Contract Type", icon: <FiFileText /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "Pipeline": return <Pipeline isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />;
      case "Lead Stages": return <LeadStages isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />;
      case "Deal Stages": return <DealStages isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />;
      case "Sources": return <Source isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />;
      case "Labels": return <Lable isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />;
      case "Contract Type": return <ContractType isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />;
      default: return <div>Content for {activeSection} will be implemented soon.</div>;
    }
  };

  return (
    <div className="crm-system-setup standard-page-container">
      <PageHeader
        title="CRM System Setup"
        subtitle={`Configure your platform's ${activeSection.toLowerCase()} architecture`}
        breadcrumbItems={[
            { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
            { title: "CRM Setup" },
        ]}
        onAdd={() => setIsModalOpen(true)}
        addText={`Add ${activeSection}`}
      />

      <div className="crm-system-modern-layout">
        <Card className="standard-content-card crm-setup-sidebar" bodyStyle={{ padding: '12px' }}>
            <div className="sidebar-menu-list">
              <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiSettings color="#64748b" />
                <span style={{ fontWeight: 600, color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Setup Menu</span>
              </div>
              {menuItems.map((item) => (
                  <div
                    key={item.title}
                    className={`modern-sidebar-item ${activeSection === item.title ? "active" : ""}`}
                    onClick={() => setActiveSection(item.title)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      marginBottom: '4px',
                      color: activeSection === item.title ? '#3b82f6' : '#64748b',
                      background: activeSection === item.title ? '#eff6ff' : 'transparent',
                      fontWeight: activeSection === item.title ? 600 : 500
                    }}
                  >
                    <span style={{ fontSize: '18px', display: 'flex' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px' }}>{item.title}</span>
                  </div>
              ))}
            </div>
        </Card>

        <Card className="standard-content-card content-display-area" bodyStyle={{ padding: '24px' }}>
            <div className="content-view-header" style={{ marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <Title level={4} style={{ margin: 0, color: '#1e293b' }}>{activeSection} Configuration</Title>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>Manage and organize your {activeSection.toLowerCase()} settings</p>
            </div>
            <div className="content-view-body">{renderContent()}</div>
        </Card>
      </div>
    </div>
  );
}
