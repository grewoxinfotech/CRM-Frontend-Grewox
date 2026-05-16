import React from "react";
import { Card, Typography, Button, Result, Space } from "antd";
import { FiClock, FiArrowLeft, FiMail } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../PageHeader";

const { Title, Text, Paragraph } = Typography;

const ComingSoon = ({ title, subtitle, icon, showBreadcrumb = true }) => {
  return (
    <div className="coming-soon-component standard-page-container">
      {showBreadcrumb && (
        <PageHeader
          title={`${title}`}
          subtitle={subtitle || "Stay tuned for exciting new features"}
          breadcrumbItems={[
            { title: <Link to="/dashboard">Home</Link> },
            { title: title },
          ]}
        />
      )}

      <Card 
        className="standard-content-card" 
        style={{ 
          marginTop: showBreadcrumb ? '24px' : '0', 
          textAlign: 'center', 
          padding: '40px 0',
          borderRadius: '16px',
          border: 'none',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
        }}
      >
        <Result
          icon={
            <div style={{ 
              fontSize: '64px', 
              color: '#1890ff', 
              marginBottom: '20px',
              animation: 'bounce 2s infinite'
            }}>
              {icon || <FiClock />}
            </div>
          }
          title={<Title level={2}>{title} is Coming Soon!</Title>}
          subTitle={
            <Paragraph style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
              We are currently working hard to bring you this feature. 
              Stay tuned for updates!
            </Paragraph>
          }
          extra={[
            <Space size="middle" key="actions">
              <Link to="/dashboard">
                <Button type="primary" size="large" icon={<FiArrowLeft />} style={{ borderRadius: '8px' }}>
                  Back to Dashboard
                </Button>
              </Link>
              <Button size="large" icon={<FiMail />} style={{ borderRadius: '8px' }}>
                Notify Me
              </Button>
            </Space>
          ]}
        />
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-20px);}
            60% {transform: translateY(-10px);}
          }
        `}} />
      </Card>
    </div>
  );
};

export default ComingSoon;
