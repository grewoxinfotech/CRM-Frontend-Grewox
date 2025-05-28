import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Card,
  Tabs,
  Breadcrumb,
  Button,
  Typography,
  Tag,
  Space,
  Row,
  Col,
  Descriptions,
  message,
  Tooltip,
} from "antd";
import {
  FiArrowLeft,
  FiHome,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiDollarSign,
  FiTarget,
  FiCalendar,
  FiActivity,
  FiFileText,
  FiUsers,
  FiClock,
  FiPaperclip,
  FiFolder,
  FiTrendingUp,
  FiTrendingDown,
  FiMinusCircle,
  FiPhoneCall,
  FiBox,
  FiBriefcase,
  FiGlobe,
} from "react-icons/fi";
import { useGetLeadQuery, useUpdateLeadMutation } from "../services/LeadApi";
import {
  useGetAllCurrenciesQuery,
  useGetAllCountriesQuery,
} from "../../../../module/settings/services/settingsApi";
import { useGetCompanyAccountsQuery } from "../../companyacoount/services/companyAccountApi";
import { useGetContactsQuery } from "../../contact/services/contactApi";
import CreateDeal from "../../deal/CreateDeal";
import { useGetPipelinesQuery } from "../../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../../crmsystem/leadstage/services/leadStageApi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../auth/services/authSlice.js";
import { selectStageOrder } from "../../crmsystem/leadstage/services/leadStageSlice";
import dayjs from "dayjs";
import {
  useGetSourcesQuery,
  useGetStatusesQuery,
  useGetCategoriesQuery,
} from "../../crmsystem/souce/services/SourceApi.js";

import LeadActivity from "./activity";
import LeadNotes from "./notes";
import LeadFiles from "./files";
import LeadMembers from "./members";
import LeadFollowup from "./followup/index.jsx";
import "./LeadOverview.scss";

const { Title, Text } = Typography;

const LeadStageProgress = ({
  stages = [],
  currentStageId,
  onStageClick,
  isWon,
  isLoading,
}) => {
  const [hasScroll, setHasScroll] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        const hasHorizontalScroll = containerRef.current.scrollWidth > containerRef.current.clientWidth;
        setHasScroll(hasHorizontalScroll);
      }
    };

    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1000);
    };

    // Initial checks
    checkScroll();
    checkScreenSize();

    // Add listeners
    window.addEventListener('resize', checkScroll);
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkScroll);
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [stages]);

  if (!stages || stages.length === 0) {
    return null;
  }

  const currentStageIndex = stages.findIndex(
    (stage) => stage.id === currentStageId
  );

  const handleItemClick = (stageId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading || stageId === currentStageId || isWon || !onStageClick) {
      return;
    }
    onStageClick(stageId);
  };

  return (
    <div
      ref={containerRef}
      className={`lead-stage-progress-container ${isWon ? "converted" : ""} ${hasScroll ? "has-scroll" : ""}`}
      role="progressbar"
      aria-valuenow={currentStageIndex + 1}
      aria-valuemin={1}
      aria-valuemax={stages.length}
      style={{ 
        display: 'flex', 
        justifyContent: isSmallScreen ? 'flex-start' : 'flex-end',
        transition: 'justify-content 0.3s ease',
        overflowX: 'auto',
        scrollbarWidth: 'thin',
        msOverflowStyle: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {stages.map((stage, index) => {
        const isCompleted = currentStageIndex > -1 && index < currentStageIndex;
        const isCurrent = stage.id === currentStageId;
        const isUpcoming =
          currentStageIndex === -1 || index > currentStageIndex;

        let statusClass = "";
        if (isCompleted) statusClass = "completed";
        else if (isCurrent) statusClass = "current";
        else if (isUpcoming) statusClass = "upcoming";

        return (
          <button
            key={stage.id}
            className={`stage-item ${statusClass} ${isLoading ? "loading" : ""} ${
              isWon ? "converted" : ""
            }`}
            onClick={(e) => handleItemClick(stage.id, e)}
            disabled={isLoading || isWon}
            type="button"
            aria-label={`Set stage to ${stage.stageName}`}
            aria-current={isCurrent ? "step" : undefined}
            style={{ 
              cursor: isLoading || isWon ? "not-allowed" : "pointer",
              flexShrink: 0
            }}
          >
            <span className="stage-name" title={stage.stageName}>
              {stage.stageName}
            </span>
            {isLoading && isCurrent && (
              <span className="loading-indicator">Updating...</span>
            )}
            {isWon && isCurrent && (
              <span className="converted-indicator">Converted</span>
            )}
          </button>
        );
      })}
      <style jsx>{`
        .lead-stage-progress-container {
          position: relative;
          display: flex;
          gap: 2px;
          width: 100%;
          margin: 20px 0;
          padding: 0 16px;
        }

        .lead-stage-progress-container.converted::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.6);
          pointer-events: none;
          z-index: 1;
          border-radius: 8px;
        }

        .stage-item {
          flex: 1;
          position: relative;
          padding: 12px 16px;
          background: #f0f2f5;
          border: none;
          color: #8c8c8c;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          transition: all 0.3s ease;
          min-width: 120px;
        }

        .stage-item:first-child {
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
        }

        .stage-item:last-child {
          border-top-right-radius: 8px;
          border-bottom-right-radius: 8px;
        }

        .stage-item.completed {
          background: #52c41a;
          color: white;
        }

        .stage-item.current {
          background: #1890ff;
          color: white;
          font-weight: 600;
        }

        .stage-item.upcoming {
          background: #f0f2f5;
          color: #8c8c8c;
        }

        .stage-item.loading {
          opacity: 0.7;
        }

        .stage-item.converted {
          opacity: 0.8;
          cursor: not-allowed;
        }

        .loading-indicator {
          font-size: 12px;
          color: #ffffff;
          margin-left: 8px;
          opacity: 0.8;
        }

        .converted-indicator {
          font-size: 12px;
          color: #ffffff;
          margin-left: 8px;
          opacity: 0.8;
          font-style: italic;
        }

        .stage-item:not(:last-child)::after {
          content: "";
          position: absolute;
          right: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 20px;
          height: 2px;
          background: #e8e8e8;
          z-index: 0;
        }

        .stage-item.completed:not(:last-child)::after {
          background: #52c41a;
        }

        .stage-item:hover:not(.converted):not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

const LeadOverviewContent = ({
  leadData: initialLeadData,
  pipelineStages,
  onStageUpdate,
  isUpdating,
}) => {
  const loggedInUser = useSelector(selectCurrentUser);
  const [localLeadData, setLocalLeadData] = useState(initialLeadData);
  const { data: currencies = [] } = useGetAllCurrenciesQuery();
  const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
  const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
  const { data: companyData } = useGetCompanyAccountsQuery();
  const { data: contactData } = useGetContactsQuery();
  const { data: countries = [] } = useGetAllCountriesQuery();

  const sources = sourcesData?.data || [];
  const categories = categoriesData?.data || [];
  const statuses = statusesData?.data || [];

  // Update local state when prop changes
  React.useEffect(() => {
    setLocalLeadData(initialLeadData);
  }, [initialLeadData]);

  const formatCurrencyValue = (value, currencyId) => {
    const currencyDetails = currencies?.find(
      (c) => c.id === currencyId || c.currencyCode === currencyId
    );
    if (!currencyDetails) return `${value}`;

    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace(/^/, currencyDetails.currencyIcon + " ");
  };

  const getSourceName = (sourceId) => {
    const source = sources.find((s) => s.id === sourceId);
    return source?.name || "N/A";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "N/A";
  };

  const getStatusName = (statusId) => {
    const status = statuses.find((s) => s.id === statusId);
    return status?.name || "Pending";
  };

  const getPhoneWithCode = (phoneCode, phoneNumber) => {
    if (!phoneNumber) return "-";
    const country = countries.find((c) => c.id === phoneCode);
    return country ? `${country.phoneCode} ${phoneNumber}` : phoneNumber;
  };

  const handleLocalStageUpdate = async (newStageId) => {
    // Optimistically update local state
    setLocalLeadData((prev) => ({
      ...prev,
      leadStage: newStageId,
    }));

    // Call parent handler
    onStageUpdate(newStageId);
  };

  return (
    <div className="overview-content">
      <div className="stage-progress-card">
        <LeadStageProgress
          stages={pipelineStages}
          currentStageId={localLeadData?.leadStage}
          onStageClick={handleLocalStageUpdate}
          isWon={localLeadData?.is_converted}
          isLoading={isUpdating}
        />
      </div>

      <Card className="info-card contact-card">
        <div className="profile-header">
          <div className="profile-main">
            <div className="company-avatars">
              {localLeadData?.company_id ? (
                <FiBriefcase size={24} />
              ) : localLeadData?.contact_id ? (
                <FiUser size={24} />
              ) : (
                <FiUser size={24} />
              )}
            </div>
            <div className="profile-info">
              <h2 className="company-names">{localLeadData?.leadTitle}</h2>
              <div className="contact-details">
                {localLeadData?.company_id &&
                  companyData?.data?.[0] &&
                  localLeadData?.contact_id &&
                  contactData?.data ? (
                  <div className="combined-info">
                    <div className="info-section company-section">
                      <div className="icon-wrapper company">
                        <FiBriefcase className="icon" />
                      </div>
                      <span className="name">
                        {companyData.data[0].company_name}
                      </span>
                      {companyData.data[0].company_site && (
                        <a
                          href={companyData.data[0].company_site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="website"
                        >
                          <div className="icon-wrapper website">
                            <FiGlobe className="icon" />
                          </div>
                          {companyData.data[0].company_site}
                        </a>
                      )}
                    </div>
                    <div className="separator-container" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <span className="separator">•</span>
                    <div className="info-section contact-section">
                      <div className="icon-wrapper contact">
                        <FiUser className="icon" />
                      </div>
                      <span className="name">
                        {
                          contactData.data.find(
                            (c) => c.id === localLeadData.contact_id
                          )?.first_name
                        }{" "}
                        {
                          contactData.data.find(
                            (c) => c.id === localLeadData.contact_id
                          )?.last_name
                        }
                      </span>
                    </div>
                    </div>
                  </div>
                ) : localLeadData?.company_id && companyData?.data?.[0] ? (
                  <div className=".company-infoo">
                    <div className="icon-wrapper company">
                      <FiBriefcase className="icon" />
                    </div>
                    <span className="name">
                      {companyData.data[0].company_name}
                    </span>
                    {companyData.data[0].company_site && (
                      <a
                        href={companyData.data[0].company_site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="website"
                      >
                        <div className="icon-wrapper website">
                          <FiGlobe className="icon" />
                        </div>
                        {companyData.data[0].company_site}
                      </a>
                    )}
                  </div>
                ) : localLeadData?.contact_id && contactData?.data ? (
                  <div className="contact-info">
                    <div className="icon-wrapper contact">
                      <FiUser className="icon" />
                    </div>
                    <span className="name">
                      {
                        contactData.data.find(
                          (c) => c.id === localLeadData.contact_id
                        )?.first_name
                      }{" "}
                      {
                        contactData.data.find(
                          (c) => c.id === localLeadData.contact_id
                        )?.last_name
                      }
                    </span>
                  </div>
                ) : (
                  <div className="no-info">
                    <div className="icon-wrapper default">
                      <FiUser className="icon" />
                    </div>
                    <span>No Company or Contact Associated</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {(localLeadData?.contact_id || localLeadData?.company_id) && (
          <div className="profile-stats" >
            <div className="stat-item">
              <div className="stat-icon">
                <FiMail />
              </div>
              <div className="stat-content">
                <div className="stat-label">Email Address</div>
                {localLeadData?.contact_id && contactData?.data ? (
                  <a
                    href={`mailto:${contactData.data.find(
                      (c) => c.id === localLeadData.contact_id
                    )?.email
                      }`}
                    className="stat-value"
                  >
                    {contactData.data.find(
                      (c) => c.id === localLeadData.contact_id
                    )?.email || "-"}
                  </a>
                ) : (
                  <span className="stat-value">-</span>
                )}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <FiPhone />
              </div>
              <div className="stat-content">
                <div className="stat-label">Phone Number</div>
                {localLeadData?.contact_id && contactData?.data ? (
                  <a
                    href={`tel:${contactData.data.find(
                      (c) => c.id === localLeadData.contact_id
                    )?.phone
                      }`}
                    className="stat-value"
                  >
                    {getPhoneWithCode(
                      contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.phone_code,
                      contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.phone
                    )}
                  </a>
                ) : localLeadData?.company_id && companyData?.data?.[0] ? (
                  <a
                    href={`tel:${companyData.data[0].phone_number}`}
                    className="stat-value"
                  >
                    {getPhoneWithCode(
                      companyData.data[0].phone_code,
                      companyData.data[0].phone_number
                    )}
                  </a>
                ) : (
                  <span className="stat-value">-</span>
                )}
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <FiMapPin />
              </div>
              <div className="stat-content">
                <div className="stat-label">Location</div>
                {localLeadData?.contact_id && contactData?.data ? (
                  <Tooltip
                    title={`${contactData.data.find(
                      (c) => c.id === localLeadData.contact_id
                    )?.address || ""
                      } ${contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.city
                        ? `, ${contactData.data.find(
                          (c) => c.id === localLeadData.contact_id
                        )?.city
                        }`
                        : ""
                      }${contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.state
                        ? `, ${contactData.data.find(
                          (c) => c.id === localLeadData.contact_id
                        )?.state
                        }`
                        : ""
                      }${contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.country
                        ? `, ${contactData.data.find(
                          (c) => c.id === localLeadData.contact_id
                        )?.country
                        }`
                        : ""
                      }`}
                  >
                    <div className="stat-value truncate">
                      {contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.address || "-"}
                      {contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.city &&
                        `, ${contactData.data.find(
                          (c) => c.id === localLeadData.contact_id
                        )?.city
                        }`}
                      {contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.state &&
                        `, ${contactData.data.find(
                          (c) => c.id === localLeadData.contact_id
                        )?.state
                        }`}
                      {contactData.data.find(
                        (c) => c.id === localLeadData.contact_id
                      )?.country &&
                        `, ${contactData.data.find(
                          (c) => c.id === localLeadData.contact_id
                        )?.country
                        }`}
                    </div>
                  </Tooltip>
                ) : localLeadData?.company_id && companyData?.data?.[0] ? (
                  <Tooltip
                    title={`${companyData.data[0].billing_address || ""} ${companyData.data[0].billing_city
                      ? `, ${companyData.data[0].billing_city}`
                      : ""
                      }${companyData.data[0].billing_state
                        ? `, ${companyData.data[0].billing_state}`
                        : ""
                      }${companyData.data[0].billing_country
                        ? `, ${companyData.data[0].billing_country}`
                        : ""
                      }`}
                  >
                    <div className="stat-value truncate">
                      {companyData.data[0].billing_address || "-"}
                      {companyData.data[0].billing_city &&
                        `, ${companyData.data[0].billing_city}`}
                      {companyData.data[0].billing_state &&
                        `, ${companyData.data[0].billing_state}`}
                      {companyData.data[0].billing_country &&
                        `, ${companyData.data[0].billing_country}`}
                    </div>
                  </Tooltip>
                ) : (
                  <span className="stat-value">-</span>
                )}
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .info-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            transition: all 0.3s ease;
          }

          // .profile-header {
          //   padding: 24px;
          //   background: linear-gradient(135deg, #f6f8fd 0%, #f0f5ff 100%);
          //   border-bottom: 1px solid #e6e8f0;
          // }

          .profile-main {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .company-avatars {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          }

          .profile-info {
            flex: 1;
          }

          .company-names {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
            line-height: 1.3;
          }

          .contact-details {
            margin-top: 8px;
          }

          .combined-info {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255, 255, 255, 0.9);
            padding: 8px 16px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;
          }

          .info-section {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 8px;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .info-section:hover {
            background: rgba(0, 0, 0, 0.02);
          }

          .company-section .name {
            color: #1890ff;
            font-weight: 600;
          }

          .contact-section .name {
            color: #52c41a;
            font-weight: 600;
          }

          .separator {
            color: #d9d9d9;
            font-size: 20px;
            margin: 0 4px;
          }

          .website {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 6px;
            background: rgba(114, 46, 209, 0.1);
            color: #722ed1;
            text-decoration: none;
            transition: all 0.3s ease;
            margin-left: 8px;
          }

          .website:hover {
            background: rgba(114, 46, 209, 0.15);
            transform: translateY(-1px);
          }

          .company-infoo,
          .contact-info,
          .no-info {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            border: 1px solid #f0f0f0;
          }

          .icon-wrapper {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          }

          .icon-wrapper.company {
            background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
            box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
          }

          .icon-wrapper.contact {
            background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
            box-shadow: 0 4px 12px rgba(82, 196, 26, 0.15);
          }

          .icon-wrapper.website {
            background: linear-gradient(135deg, #722ed1 0%, #531dab 100%);
            box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15);
            width: 24px;
            height: 24px;
          }

          .icon-wrapper.default {
            background: linear-gradient(135deg, #f5222d 0%, #cf1322 100%);
            box-shadow: 0 4px 12px rgba(245, 34, 45, 0.15);
          }

          .profile-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            padding-top: 24px;
            background: #ffffff;
          }

          .stat-item {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            transition: all 0.3s ease;
          }

          .stat-item:hover {
            background: #f0f5ff;
            transform: translateY(-2px);
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .stat-content {
            flex: 1;
          }

          .stat-label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 4px;
            font-weight: 500;
          }

          .stat-value {
            font-size: 15px;
            color: #1f2937;
            font-weight: 500;
            word-break: break-word;
          }

          .stat-value a {
            color: #1890ff;
            text-decoration: none;
            transition: color 0.3s ease;
          }

          .stat-value a:hover {
            color: #096dd9;
            text-decoration: underline;
          }

          .stat-value.truncate {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            display: block;
          }

          .stat-item:hover .stat-value.truncate {
            color: #1890ff;
            cursor: pointer;
          }

          @media (max-width: 768px) {
            .profile-stats {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </Card>

      <Row gutter={[16, 16]} className="metrics-row">
        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
          <Card className="metric-card lead-value-card">
            <div className="metric-icon">
              <FiDollarSign />
            </div>
            <div className="metric-content">
              <div className="metric-label">Lead Value</div>
              <div className="metric-value">
                {localLeadData?.leadValue
                  ? formatCurrencyValue(
                    localLeadData.leadValue,
                    localLeadData.currency
                  )
                  : "-"}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
          <Card
            className={`metric-card interest-level-card ${localLeadData?.interest_level || "medium"
              }`}
          >
            <div
              className={`metric-icon ${localLeadData?.interest_level || "medium"
                }`}
            >
              <FiTarget />
            </div>
            <div className="metric-content">
              <div
                className={`metric-label ${localLeadData?.interest_level || "medium"
                  }`}
              >
                Interest Level
              </div>
              <div className="metric-value">
                {localLeadData?.interest_level === "high" ? (
                  <span className="interest-text high">
                    <FiTrendingUp className="icon" /> High Interest
                  </span>
                ) : localLeadData?.interest_level === "low" ? (
                  <span className="interest-text low">
                    <FiTrendingDown className="icon" /> Low Interest
                  </span>
                ) : (
                  <span className="interest-text medium">
                    <FiMinusCircle className="icon" /> Medium Interest
                  </span>
                )}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
          <Card className="metric-card created-date-card">
            <div className="metric-icon">
              <FiCalendar className="icon" />
            </div>
            <div className="metric-content">
              <div className="metric-label">Created</div>
              <div className="metric-value">
                {localLeadData?.createdAt
                  ? new Date(localLeadData.createdAt).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={12} xl={6}>
          <Card className="metric-card members-card">
            <div className="metric-icon">
              <FiUsers />
            </div>
            <div className="metric-content">
              <div className="metric-label">Lead Members</div>
              <div className="metric-value">
                {(() => {
                  try {
                    if (!localLeadData?.lead_members) return "0";
                    const parsedMembers =
                      typeof localLeadData.lead_members === "string"
                        ? JSON.parse(localLeadData.lead_members)
                        : localLeadData.lead_members;
                    return parsedMembers?.lead_members?.length || "0";
                  } catch (error) {
                    console.error("Error parsing lead members:", error);
                    return "0";
                  }
                })()}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="lead-details-section">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <div className="detail-card source-card">
              <div className="detail-content">
                <div className="detail-icon">
                  <FiPhone />
                </div>
                <div className="detail-info">
                  <div className="detail-label">Source</div>
                  <div className="detail-value">
                    {getSourceName(localLeadData?.source)}
                  </div>
                </div>
                <div className="detail-indicator" />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <div className="detail-card category-card">
              <div className="detail-content">
                <div className="detail-icon">
                  <FiFolder />
                </div>
                <div className="detail-info">
                  <div className="detail-label">Category</div>
                  <div className="detail-value">
                    {getCategoryName(localLeadData?.category)}
                  </div>
                </div>
                <div className="detail-indicator" />
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <div className="detail-card status-card">
              <div className="detail-content">
                <div className="detail-icon">
                  <FiClock />
                </div>
                <div className="detail-info">
                  <div className="detail-label">Status</div>
                  <div className="detail-value">
                    {getStatusName(localLeadData?.status)}
                  </div>
                </div>
                <div className="detail-indicator" />
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={12} lg={12} xl={6}>
            <div className="detail-card updated-card">
              <div className="detail-content">
                <div className="detail-icon">
                  <FiUsers />
                </div>
                <div className="detail-info">
                  <div className="detail-label">Last Updated</div>
                  <div className="detail-value">
                    {localLeadData?.updatedAt
                      ? dayjs(localLeadData.updatedAt).format("MMM DD, YYYY")
                      : "-"}
                  </div>
                </div>
                <div className="detail-indicator" />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

const LeadOverview = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { data: lead, isLoading: isLoadingLead } = useGetLeadQuery(leadId);
  const { data: pipelines = [] } = useGetPipelinesQuery();
  const { data: allStagesData, isLoading: isLoadingStages } =
    useGetLeadStagesQuery();
  const [updateLead, { isLoading: isUpdatingLead }] = useUpdateLeadMutation();
  const currentUser = useSelector(selectCurrentUser);
  const [isCreateDealModalOpen, setIsCreateDealModalOpen] = useState(false);
  const [localLeadData, setLocalLeadData] = useState(lead?.data);
  const savedStageOrder = useSelector(selectStageOrder);

  // Update local state when lead data changes
  React.useEffect(() => {
    setLocalLeadData(lead?.data);
  }, [lead?.data]);

  const pipelineStages = useMemo(() => {
    if (!localLeadData?.pipeline || !allStagesData) return [];
    const stagesArray = Array.isArray(allStagesData)
      ? allStagesData
      : allStagesData.data || [];

    const filteredStages = stagesArray.filter(
      (stage) =>
        stage.pipeline === localLeadData.pipeline && stage.stageType === "lead"
    );

    if (savedStageOrder && savedStageOrder.length > 0) {
      const stageOrderMap = new Map(
        savedStageOrder.map((id, index) => [id, index])
      );

      return [...filteredStages].sort((a, b) => {
        const indexA = stageOrderMap.has(a.id)
          ? stageOrderMap.get(a.id)
          : Infinity;
        const indexB = stageOrderMap.has(b.id)
          ? stageOrderMap.get(b.id)
          : Infinity;

        if (indexA !== Infinity && indexB !== Infinity) {
          return indexA - indexB;
        }
        if (indexA !== Infinity && indexB === Infinity) {
          return -1;
        }
        if (indexA === Infinity && indexB !== Infinity) {
          return 1;
        }
        return (
          (a.order ?? 0) - (b.order ?? 0) ||
          a.stageName.localeCompare(b.stageName)
        );
      });
    } else {
      return filteredStages.sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) ||
          a.stageName.localeCompare(b.stageName)
      );
    }
  }, [localLeadData?.pipeline, allStagesData, savedStageOrder]);

  const formattedLeadData = useMemo(() => {
    if (!localLeadData) return null;
    return {
      id: localLeadData.id,
      leadTitle: localLeadData.leadTitle,
      contact_id: localLeadData.contact_id,
      company_id: localLeadData.company_id,
      source: localLeadData.source,
      pipeline: localLeadData.pipeline,
      stage: localLeadData.leadStage,
      currency: localLeadData.currency,
      value: localLeadData.leadValue,
      category: localLeadData.category,
      status: localLeadData.status,
      interest_level: localLeadData.interest_level,
      lead_members: localLeadData.lead_members
        ? JSON.parse(localLeadData.lead_members).lead_members
        : [],
      is_converted: localLeadData.is_converted,
    };
  }, [localLeadData]);

  const handleConvertToDeal = () => {
    if (localLeadData?.is_converted) {
      message.warning("This lead has already been converted to a deal");
      return;
    }
    setIsCreateDealModalOpen(true);
  };

  const handleStageUpdate = async (newStageId) => {
    if (newStageId === localLeadData?.leadStage) {
      return;
    }

    if (isUpdatingLead) return;

    // Optimistically update local state
    setLocalLeadData((prev) => ({
      ...prev,
      leadStage: newStageId,
    }));

    try {
      await updateLead({
        id: leadId,
        data: {
          leadStage: newStageId,
          updated_by: currentUser?.username || "system",
        },
      }).unwrap();
      message.success("Lead stage updated successfully!");
    } catch (error) {
      // Revert optimistic update on error
      setLocalLeadData((prev) => ({
        ...prev,
        leadStage: prev.leadStage,
      }));
      message.error(error?.data?.message || "Failed to update lead stage.");
    }
  };

  const items = [
    {
      key: "overview",
      label: (
        <span>
          <FiFileText /> Overview
        </span>
      ),
      children: (
        <LeadOverviewContent
          leadData={localLeadData}
          pipelineStages={pipelineStages}
          onStageUpdate={handleStageUpdate}
          isUpdating={isUpdatingLead}
        />
      ),
    },
    {
      key: "members",
      label: (
        <span>
          <FiUsers /> Lead Members
        </span>
      ),
      children: <LeadMembers leadId={leadId} />,
    },
    {
      key: "activity",
      label: (
        <span>
          <FiActivity /> Activity
        </span>
      ),
      children: <LeadActivity leadId={leadId} />,
    },
    {
      key: "notes",
      label: (
        <span>
          <FiFileText /> Notes
        </span>
      ),
      children: <LeadNotes leadId={leadId} />,
    },
    {
      key: "files",
      label: (
        <span>
          <FiPaperclip /> Files
        </span>
      ),
      children: <LeadFiles leadId={leadId} />,
    },
    {
      key: "followup",
      label: (
        <span>
          <FiPhoneCall /> Follow-up
        </span>
      ),
      children: <LeadFollowup leadId={leadId} />,
    },
  ];

  const isLoading = isLoadingLead || isLoadingStages;

  return (
    <div className="project-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/crm/leads">
              <FiUser /> Leads
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            {localLeadData?.leadTitle || "Lead Details"}
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="header-left">
          <Title level={2}>Lead Details</Title>
          <Text type="secondary" className="subtitle">
            Manage lead details and activities
          </Text>
          {localLeadData?.is_converted && (
            <Tag
              color="success"
              style={{ marginLeft: "8px", fontSize: "14px" }}
            >
              Converted to Deal
            </Tag>
          )}
        </div>
        <div className="header-right">
          <Space>
            <Button
              type="primary"
              icon={<FiArrowLeft />}
              onClick={() => navigate("/dashboard/crm/leads")}
              style={{
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                border: "none",
                height: "44px",
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "10px",
                fontWeight: "500",
              }}
            >
              Back to Leads
            </Button>
            {!localLeadData?.is_converted && (
              <Button
                type="primary"
                onClick={handleConvertToDeal}
                style={{
                  background:
                    "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                  border: "none",
                  height: "44px",
                  padding: "0 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  borderRadius: "10px",
                  fontWeight: "500",
                }}
              >
                Convert to Deal
              </Button>
            )}
          </Space>
        </div>
      </div>

      <div className="page-contentt">
        <div className="content-main">
          <Card loading={isLoading || isUpdatingLead}>
            <Tabs
              defaultActiveKey="overview"
              items={items}
              className="project-tabs"
              type="card"
              size="large"
              animated={{ inkBar: true, tabPane: true }}
            />
          </Card>
        </div>
      </div>

      <CreateDeal
        open={isCreateDealModalOpen}
        onCancel={() => setIsCreateDealModalOpen(false)}
        leadData={formattedLeadData}
        pipelines={pipelines}
      />
    </div>
  );
};

export default LeadOverview;
