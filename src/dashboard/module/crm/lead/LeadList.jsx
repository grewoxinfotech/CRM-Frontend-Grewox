import React from "react";
import { Table, Avatar, Dropdown, Button, message, Tag, Typography, Space, Tooltip } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUser,
  FiMoreVertical,
  FiDollarSign,
  FiZap,
  FiTarget,
  FiTrendingUp
} from "react-icons/fi";
import { useGetLeadsQuery, useDeleteLeadMutation } from "./services/LeadApi";
import { useGetSourcesQuery, useGetStatusesQuery, useGetLabelsQuery } from '../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../crmsystem/leadstage/services/leadStageApi';
import { useSelector } from "react-redux";
import { selectCurrentUser } from '../../../../auth/services/authSlice';

const { Text } = Typography;

const LeadList = ({ leads, onEdit, onView, onLeadClick }) => {
  const [deleteLead] = useDeleteLeadMutation();
  const loggedInUser = useSelector(selectCurrentUser);
  // Fetch all required data
  const { data: stagesData } = useGetLeadStagesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetLabelsQuery(loggedInUser?.id);

  // Filter and prepare data
  const stages = stagesData?.filter(stage => stage.stageType === "lead") || [];
  const sources = sourcesData?.data?.filter(item => item.lableType === "source") || [];
  const statuses = statusesData?.data?.filter(item => item.lableType === "status") || [];
  const categories = categoriesData?.data?.filter(item => item.lableType === "category") || [];

  const handleDelete = async (record) => {
    try {
      await deleteLead(record.id).unwrap();
      message.success("Lead deleted successfully");
    } catch (error) {
      message.error(
        "Failed to delete lead: " + (error.data?.message || "Unknown error")
      );
    }
  };


  // Get stage data
  const getStageData = (stageId) => {
    const stage = stages.find(s => s.id === stageId) || {};
    return {
      name: stage.stageName || "Unknown",
      color: stage.color || "#1890ff"
    };
  };

  // Get source data
  const getSourceData = (sourceId) => {
    const source = sources.find(s => s.id === sourceId) || {};
    return {
      name: source.name || "Unknown",
      color: source.color || "#1890ff"
    };
  };

  // Get status data
  const getStatusData = (statusId) => {
    const status = statuses.find(s => s.id === statusId) || {};
    return {
      name: status.name || "Unknown",
      color: status.color || "#1890ff"
    };
  };

  // Get category data
  const getCategoryData = (categoryId) => {
    const category = categories.find(c => c.id === categoryId) || {};
    return {
      name: category.name || "Unknown",
      color: category.color || "#1890ff"
    };
  };

  // Get interest level style
  const getInterestLevel = (level) => {
    const levels = {
      "high": {
        color: "#52c41a",
        bg: "rgba(82, 196, 26, 0.1)",
        border: "#b7eb8f",
        text: "High Interest",
        icon: <FiZap style={{ marginRight: '4px' }} />
      },
      "medium": {
        color: "#faad14",
        bg: "rgba(250, 173, 20, 0.1)",
        border: "#ffd591",
        text: "Medium Interest",
        icon: <FiTarget style={{ marginRight: '4px' }} />
      },
      "low": {
        color: "#ff4d4f",
        bg: "rgba(255, 77, 79, 0.1)",
        border: "#ffa39e",
        text: "Low Interest",
        icon: <FiTrendingUp style={{ marginRight: '4px' }} />
      }
    };
    return levels[level] || levels.medium;
  };

  // Format currency
  const formatCurrency = (value, currency = "INR") => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onLeadClick(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit Lead",
        onClick: () => onEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete Lead",
        onClick: () => handleDelete(record),
        danger: true,
      },
    ],
  });

  const columns = [
    {
      title: "Lead Title",
      dataIndex: "leadTitle",
      key: "leadTitle",
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#e6f4ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1890ff'
          }}>
            {record.profilePic ? (
              <img
                src={record.profilePic}
                alt={text}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <FiUser size={20} />
            )}
          </div>
          <div>
            <Text strong style={{ display: 'block', fontSize: '14px', cursor: 'default' }}>{text}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {getSourceData(record.source).name}
            </Text>
          </div>
        </div>
      ),
      width: '30%',
    },
    {
      title: "Lead Stage",
      dataIndex: "leadStage",
      key: "leadStage",
      render: (stageId) => {
        const stage = getStageData(stageId);
        return (
          <Tag
            color={stage.color}
            style={{
              textTransform: 'capitalize',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            {stage.name}
          </Tag>
        );
      },
    },
    {
      title: "Interest Level",
      dataIndex: "interest_level",
      key: "interest_level",
      render: (level) => {
        const interestStyle = getInterestLevel(level);
        return (
          <Tag style={{
            color: interestStyle.color,
            backgroundColor: interestStyle.bg,
            border: `1px solid ${interestStyle.border}`,
            borderRadius: '4px',
            padding: '4px 12px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            {interestStyle.icon}
            {interestStyle.text}
          </Tag>
        );
      },
    },
    {
      title: "Lead Value",
      key: "leadValue",
      render: (record) => (
        <Text strong style={{
          fontSize: '15px',
          background: 'linear-gradient(45deg, #52c41a, #36cfc9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          {formatCurrency(record.leadValue, record.currency)}
        </Text>
      ),
      sorter: (a, b) => a.leadValue - b.leadValue,
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <div onClick={e => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={['click']}
            placement="bottomRight"
            arrow
          >
            <Button
              type="text"
              icon={<FiMoreVertical />}
              className="action-button"
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={leads?.data || []}
      rowKey="id"
      loading={!leads}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} leads`,
      }}
      className="lead-table"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
      }}
      onRow={(record) => ({
        onClick: () => onLeadClick(record),
        style: { cursor: 'pointer' }
      })}
    />
  );
};

export default LeadList;
