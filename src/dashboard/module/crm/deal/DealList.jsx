import React from "react";
import { Table, Avatar, Dropdown, Button, message, Tag, Typography } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUser,
  FiMoreVertical,
  FiDollarSign,
  FiTarget,
  FiBriefcase
} from "react-icons/fi";
import { useGetDealsQuery, useDeleteDealMutation } from "./services/DealApi";
import dayjs from "dayjs";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLabelsQuery, useGetSourcesQuery } from "../crmsystem/souce/services/SourceApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

const DealList = ({ onEdit, onView }) => {
  const loggedInUser = useSelector(selectCurrentUser);
  const { data, isLoading, error } = useGetDealsQuery();
  const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();
  const { data: dealStages = [] } = useGetLeadStagesQuery();
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: labelsData } = useGetLabelsQuery(loggedInUser?.id);
  const navigate = useNavigate();
 
  const sources = sourcesData?.data || [];
  const labels = labelsData?.data || [];
  
  // Ensure data is always an array
  const deals = Array.isArray(data) ? data : [];

  // Function to get pipeline name by ID
  const getPipelineName = (pipelineId) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    return pipeline ? pipeline.pipeline_name : pipelineId;
  };

  // Function to get stage name by ID
  const getStageName = (stageId) => {
    const stage = dealStages.find(s => s.id === stageId);
    return stage ? stage.stageName : stageId;
  };

  // Function to get source name and color by ID
  const getSourceInfo = (sourceId) => {
    const source = sources.find(s => s.id === sourceId);
    return source ? { name: source.name, color: source.color } : { name: sourceId, color: "#d9d9d9" };
  };

  // Function to get label name and color by name
  const getLabelInfo = (labelName) => {
    const label = labels.find(l => l.name === labelName);
    return label ? { name: labelName, color: label.color } : { name: labelName, color: "#d9d9d9" };
  };

  const handleDelete = async (record) => {
    try {
      await deleteDeal(record.id).unwrap();
      message.success("Deal deleted successfully");
    } catch (error) {
      message.error(
        "Failed to delete deal: " + (error.data?.message || "Unknown error")
      );
    }
  };

  const handleDealClick = (dealId) => {
    navigate(`/dashboard/crm/deals/${dealId}`);
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => onEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record),
        danger: true,
        disabled: isDeleting,
      },
    ],
  });

  const getStatusTag = (status) => {
    let color = "";
    switch (status?.toLowerCase()) {
      case "won":
        color = "green";
        break;
      case "lost":
        color = "red";
        break;
      case "pending":
        color = "orange";
        break;
      
      default:
        color = "default";
    }
    return <Tag color={color}>{status || "Unknown"}</Tag>;
  };

  const columns = [
    {
      title: "Deal Name",
      dataIndex: "dealName",
      key: "dealName",
      sorter: (a, b) => (a.dealName || "").localeCompare(b.dealName || ""),
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar 
            icon={<FiBriefcase />} 
            style={{ 
              backgroundColor: "#e6f7ff", 
              color: "#1890ff",
              marginRight: "12px" 
            }} 
          />
          <div>
            <Text 
              strong 
              style={{ cursor: 'pointer' }}
              onClick={() => handleDealClick(record.id)}
            >
              {text || "-"}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.email || "-"}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (sourceId) => {
        const { name, color } = getSourceInfo(sourceId);
        return (
          <div className="source-tag" style={{ display: "flex", alignItems: "center" }}>
            <div className="tag-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, marginRight: "6px" }}></div>
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      title: "Label",
      dataIndex: "label",
      key: "label",
      render: (labelName) => {
        const { name, color } = getLabelInfo(labelName);
        return (
          <div className="label-tag" style={{ display: "flex", alignItems: "center" }}>
            <div className="tag-dot" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, marginRight: "6px" }}></div>
            <span>{name}</span>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Pipeline",
      dataIndex: "pipeline",
      key: "pipeline",
      sorter: (a, b) => {
        const nameA = getPipelineName(a.pipeline) || "";
        const nameB = getPipelineName(b.pipeline) || "";
        return nameA.localeCompare(nameB);
      },
      render: (pipelineId) => getPipelineName(pipelineId) || "-",
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      sorter: (a, b) => {
        const nameA = getStageName(a.stage) || "";
        const nameB = getStageName(b.stage) || "";
        return nameA.localeCompare(nameB);
      },
      render: (stageId) => getStageName(stageId) || "-",
    },
    {
      title: "Value",
      key: "value",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>

          <Text strong>
            {record.currency} {record.value ? `${record.value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-"}
          </Text>
        </div>
      ),
    },
    {
      title: "Closed Date",
      dataIndex: "closedDate",
      key: "closedDate",
      sorter: (a, b) => {
        const dateA = a.closedDate ? new Date(a.closedDate).getTime() : 0;
        const dateB = b.closedDate ? new Date(b.closedDate).getTime() : 0;
        return dateA - dateB;
      },
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return <div>Error loading deals: {error.message}</div>;
  }

  return (
    <div className="deal-content">
      <Table
        columns={columns}
        dataSource={deals}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} deals`,
        }}
        className="deal-table"
      />
    </div>
  );
};

export default DealList;
