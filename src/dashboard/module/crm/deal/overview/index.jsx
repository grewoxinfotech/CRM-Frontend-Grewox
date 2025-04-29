import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Row, Col, Typography, Tag, Space, message, Tabs, Breadcrumb, Button, Tooltip } from 'antd';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiDollarSign,
    FiTarget,
    FiCalendar,
    FiUsers,
    FiActivity,
    FiFolder,
    FiClock,
    FiBriefcase,
    FiGlobe,
    FiHome,
    FiArrowLeft
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAllCountriesQuery, useGetAllCurrenciesQuery } from '../../../../module/settings/services/settingsApi';
import { useGetDealStagesQuery } from '../../crmsystem/dealstage/services/dealStageApi';
import { useGetPipelinesQuery } from '../../crmsystem/pipeline/services/pipelineApi';
import { useUpdateDealMutation } from '../services/dealApi';
import { useSelector } from 'react-redux';
import { selectDealStageOrder } from '../services/DealStageSlice';
import { selectCurrentUser } from '../../../../../auth/services/authSlice';
import { useGetSourcesQuery, useGetCategoriesQuery } from '../../crmsystem/souce/services/SourceApi';
import { useGetContactsQuery } from '../../contact/services/contactApi';
import { useGetCompanyAccountsQuery } from '../../companyacoount/services/companyAccountApi';
import '../../lead/overview/LeadOverview.scss';

const { Title, Text } = Typography;

const DealStageProgress = ({ stages = [], currentStageId, onStageClick, isWon, isLoading, dealStatus }) => {
    if (!stages || stages.length === 0) {
        return null;
    }
    const currentStageIndex = stages.findIndex(stage => stage.id === currentStageId);

    const handleItemClick = (stageId, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading || stageId === currentStageId || isWon || !onStageClick) {
            return;
        }
        onStageClick(stageId);
    };

    return (
        <div className={`lead-stage-progress-container ${isWon ? 'converted' : ''}`}>
            {stages.map((stage, index) => {
                const isCompleted = currentStageIndex > -1 && index < currentStageIndex;
                const isCurrent = stage.id === currentStageId;
                const isUpcoming = currentStageIndex === -1 || index > currentStageIndex;

                let statusClass = '';
                if (isCompleted) statusClass = 'completed';
                else if (isCurrent) statusClass = 'current';
                else if (isUpcoming) statusClass = 'upcoming';

                return (
                    <button
                        key={stage.id}
                        className={`stage-item ${statusClass} ${isLoading ? 'loading' : ''} ${isWon ? 'converted' : ''}`}
                        onClick={(e) => handleItemClick(stage.id, e)}
                        disabled={isLoading || isWon}
                        type="button"
                        aria-label={`Set stage to ${stage.stageName}`}
                        aria-current={isCurrent ? 'step' : undefined}
                        style={{ cursor: isLoading || isWon ? 'not-allowed' : 'pointer' }}
                    >
                        <span className="stage-name">{stage.stageName}</span>
                        {isLoading && isCurrent && <span className="loading-indicator">Updating...</span>}
                        {isWon && isCurrent && (
                            <span className="converted-indicator">
                                {dealStatus === 'won' ? 'Won' : dealStatus === 'lost' ? 'Lost' : ''}
                            </span>
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
                    content: '';
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
                    content: '';
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

                .stage-item.converted.current {
                    background: ${dealStatus === 'won' ? '#52c41a' : dealStatus === 'lost' ? '#ff4d4f' : '#1890ff'};
                }
            `}</style>
        </div>
    );
};

const DealOverview = ({ deal: initialDeal, currentStatus, onStageUpdate }) => {
    const [localDeal, setLocalDeal] = useState(initialDeal);
    const navigate = useNavigate();
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: currencies = [] } = useGetAllCurrenciesQuery();
    const { data: dealStages = [] } = useGetDealStagesQuery();
    const { data: pipelines = [] } = useGetPipelinesQuery();
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
    const { data: contactsData } = useGetContactsQuery();
    const { data: companyData } = useGetCompanyAccountsQuery();
    const savedStageOrder = useSelector(selectDealStageOrder);
    const [updateDeal, { isLoading: isUpdating }] = useUpdateDealMutation();
    const { data: countries = [] } = useGetAllCountriesQuery();

    const sources = sourcesData?.data || [];
    const categories = categoriesData?.data || [];
    const contactData = contactsData || [];
    const companies = companyData?.data || [];



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

    // Update localDeal when initialDeal changes
    React.useEffect(() => {
        setLocalDeal(initialDeal);
    }, [initialDeal]);

    if (!localDeal) return <div>Deal not found</div>;

    const getCompanyDetails = () => {
        if (!localDeal?.company_id) return null;
        return companies.find(company => company.id === localDeal.company_id);
    };

    const getContactDetails = () => {
        if (!localDeal?.contact_id) return null;
        return contactData?.data?.find(contact => contact.id === localDeal.contact_id);
    };

    const company = getCompanyDetails();
    const contact = getContactDetails();

    // Filter and sort stages using same logic as LeadOverview
    const filteredStages = useMemo(() => {
        if (!localDeal?.pipeline || !dealStages) return [];
        const stagesArray = Array.isArray(dealStages) ? dealStages : [];

        const filteredStages = stagesArray.filter(stage =>
            stage.pipeline === localDeal.pipeline && stage.stageType === 'deal'
        );

        if (savedStageOrder && savedStageOrder.length > 0) {
            const stageOrderMap = new Map(savedStageOrder.map((id, index) => [id, index]));

            return [...filteredStages].sort((a, b) => {
                const indexA = stageOrderMap.has(a.id) ? stageOrderMap.get(a.id) : Infinity;
                const indexB = stageOrderMap.has(b.id) ? stageOrderMap.get(b.id) : Infinity;

                if (indexA !== Infinity && indexB !== Infinity) {
                    return indexA - indexB;
                }
                if (indexA !== Infinity && indexB === Infinity) {
                    return -1;
                }
                if (indexA === Infinity && indexB !== Infinity) {
                    return 1;
                }
                return (a.order ?? 0) - (b.order ?? 0) || a.stageName.localeCompare(b.stageName);
            });
        } else {
            return filteredStages.sort((a, b) =>
                (a.order ?? 0) - (b.order ?? 0) || a.stageName.localeCompare(b.stageName)
            );
        }
    }, [localDeal?.pipeline, dealStages, savedStageOrder]);

    const handleStageChange = async (stageId) => {
        // Optimistically update the local state
        const updatedDeal = { ...localDeal, stage: stageId };
        setLocalDeal(updatedDeal);

        try {
            // Create a complete update payload with all necessary fields
            const updatePayload = {
                id: localDeal.id,
                stage: stageId,
                dealTitle: localDeal.dealTitle,
                pipeline: localDeal.pipeline,
                value: localDeal.value,
                currency: localDeal.currency,
                status: localDeal.status,
                is_won: localDeal.is_won,
                company_id: localDeal.company_id,
                contact_id: localDeal.contact_id,
                source: localDeal.source,
                category: localDeal.category,
                closedDate: localDeal.closedDate,
                deal_members: localDeal.deal_members,
                description: localDeal.description,
                createdAt: localDeal.createdAt,
                updatedAt: new Date().toISOString()
            };

            const result = await updateDeal(updatePayload).unwrap();

            // Update local state with the response from the server
            if (result?.data) {
                setLocalDeal(result.data);
            }

            message.success('Deal stage updated successfully');
            if (onStageUpdate) {
                onStageUpdate(stageId);
            }
        } catch (error) {
            // Revert the optimistic update on error
            setLocalDeal(initialDeal);
            message.error(error?.data?.message || 'Failed to update deal stage');
        }
    };

    const formatCurrency = (value, currencyId) => {
        const currencyDetails = currencies.find(c => c.id === currencyId);
        if (!currencyDetails) return `${value}`;

        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
    };

    const getPhoneWithCode = (phoneCode, phoneNumber) => {
        if (!phoneNumber) return "-";
        const country = countries.find(c => c.id === phoneCode);
        return country ? `${country.phoneCode} ${phoneNumber}` : phoneNumber;
    };


    const getStatusStyle = (status) => {
        // First check is_won flag
        if (localDeal?.is_won === true) {
            return {
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                color: '#52c41a',
                icon: <FiTarget className="status-icon" />,
                text: 'Won'
            };
        } else if (localDeal?.is_won === false) {
            return {
                background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                color: '#ff4d4f',
                icon: <FiTarget className="status-icon" />,
                text: 'Lost'
            };
        }

        // Default to pending if is_won is null - changed to yellow
        return {
            background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
            color: '#faad14',
            icon: <FiTarget className="status-icon" />,
            text: 'Pending'
        };
    };

    const statusStyle = getStatusStyle(currentStatus || localDeal?.status);

    const getSourceName = (sourceId) => {
        if (!sourceId) return '-';
        const source = sources.find(s => s.id === sourceId);
        return source?.name || source?.sourceName || '-';
    };

    const getCategoryName = (categoryId) => {
        if (!categoryId) return '-';
        const category = categories.find(c => c.id === categoryId);
        return category?.name || category?.categoryName || '-';
    };

    return (
        <div className="overview-content">
            <div className="stage-progress-card">
                <DealStageProgress
                    stages={filteredStages}
                    currentStageId={localDeal?.stage}
                    onStageClick={handleStageChange}
                    isWon={localDeal?.is_won !== null}
                    isLoading={isUpdating}
                    dealStatus={localDeal?.is_won === true ? 'won' : localDeal?.is_won === false ? 'lost' : 'pending'}
                />
            </div>

            <Card className="info-card contact-card">
                <div className="profile-header">
                    <div className="profile-main">
                        <div className="company-avatar">
                            {localDeal?.company_id ? (
                                <FiBriefcase size={24} />
                            ) : localDeal?.contact_id ? (
                                <FiUser size={24} />
                            ) : (
                                <FiUser size={24} />
                            )}
                        </div>
                        <div className="profile-info">
                            <h2 className="company-name">
                                {localDeal?.dealTitle}
                            </h2>
                            <div className="contact-details">
                                {localDeal?.company_id && companyData?.data?.[0] && localDeal?.contact_id && contactData?.data ? (
                                    <div className="combined-info">
                                        <div className="info-section company-section">
                                            <div className="icon-wrapper company">
                                                <FiBriefcase className="icon" />
                                            </div>
                                            <span className="name">{companyData.data[0].company_name}</span>
                                            {companyData.data[0].company_site && (
                                                <a href={companyData.data[0].company_site} target="_blank" rel="noopener noreferrer" className="website">
                                                    <div className="icon-wrapper website">
                                                        <FiGlobe className="icon" />
                                                    </div>
                                                    {companyData.data[0].company_site}
                                                </a>
                                            )}
                                        </div>
                                        <span className="separator">•</span>
                                        <div className="info-section contact-section">
                                            <div className="icon-wrapper contact">
                                                <FiUser className="icon" />
                                            </div>
                                            <span className="name">
                                                {contactData.data.find(c => c.id === localDeal.contact_id)?.first_name} {contactData.data.find(c => c.id === localDeal.contact_id)?.last_name}
                                            </span>
                                        </div>
                                    </div>
                                ) : localDeal?.company_id && companyData?.data?.[0] ? (
                                    <div className="company-info">
                                        <div className="icon-wrapper company">
                                            <FiBriefcase className="icon" />
                                        </div>
                                        <span className="name">{companyData.data[0].company_name}</span>
                                        {companyData.data[0].company_site && (
                                            <a href={companyData.data[0].company_site} target="_blank" rel="noopener noreferrer" className="website">
                                                <div className="icon-wrapper website">
                                                    <FiGlobe className="icon" />
                                                </div>
                                                {companyData.data[0].company_site}
                                            </a>
                                        )}
                                    </div>
                                ) : localDeal?.contact_id && contactData?.data ? (
                                    <div className="contact-info">
                                        <div className="icon-wrapper contact">
                                            <FiUser className="icon" />
                                        </div>
                                        <span className="name">
                                            {contactData.data.find(c => c.id === localDeal.contact_id)?.first_name} {contactData.data.find(c => c.id === localDeal.contact_id)?.last_name}
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
                {(localDeal?.contact_id || localDeal?.company_id) && (
                    <div className="profile-stats">
                        <div className="stat-item">
                            <div className="stat-icon">
                                <FiMail />
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Email Address</div>
                                {localDeal?.contact_id && contactData?.data ? (
                                    <a href={`mailto:${contactData.data.find(c => c.id === localDeal.contact_id)?.email}`} className="stat-value">
                                        {contactData.data.find(c => c.id === localDeal.contact_id)?.email || "-"}
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
                                {localDeal?.contact_id && contactData?.data ? (
                                    <a href={`tel:${contactData.data.find(c => c.id === localDeal.contact_id)?.phone}`} className="stat-value">
                                        {getPhoneWithCode(
                                            contactData.data.find(c => c.id === localDeal.contact_id)?.phone_code,
                                            contactData.data.find(c => c.id === localDeal.contact_id)?.phone
                                        )}
                                    </a>
                                ) : localDeal?.company_id && companyData?.data?.[0] ? (
                                    <a href={`tel:${companyData.data[0].phone_number}`} className="stat-value">
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
                                {localDeal?.contact_id && contactData?.data ? (
                                    <Tooltip title={
                                        `${contactData.data.find(c => c.id === localDeal.contact_id)?.address || ''} ${contactData.data.find(c => c.id === localDeal.contact_id)?.city ?
                                            `, ${contactData.data.find(c => c.id === localDeal.contact_id)?.city}` : ''
                                        }${contactData.data.find(c => c.id === localDeal.contact_id)?.state ?
                                            `, ${contactData.data.find(c => c.id === localDeal.contact_id)?.state}` : ''
                                        }${contactData.data.find(c => c.id === localDeal.contact_id)?.country ?
                                            `, ${contactData.data.find(c => c.id === localDeal.contact_id)?.country}` : ''
                                        }`
                                    }>
                                        <div className="stat-value truncate">
                                            {contactData.data.find(c => c.id === localDeal.contact_id)?.address || "-"}
                                            {contactData.data.find(c => c.id === localDeal.contact_id)?.city && `, ${contactData.data.find(c => c.id === localDeal.contact_id)?.city}`}
                                            {contactData.data.find(c => c.id === localDeal.contact_id)?.state && `, ${contactData.data.find(c => c.id === localDeal.contact_id)?.state}`}
                                            {contactData.data.find(c => c.id === localDeal.contact_id)?.country && `, ${contactData.data.find(c => c.id === localDeal.contact_id)?.country}`}
                                        </div>
                                    </Tooltip>
                                ) : localDeal?.company_id && companyData?.data?.[0] ? (
                                    <Tooltip title={
                                        `${companyData.data[0].billing_address || ''} ${companyData.data[0].billing_city ?
                                            `, ${companyData.data[0].billing_city}` : ''
                                        }${companyData.data[0].billing_state ?
                                            `, ${companyData.data[0].billing_state}` : ''
                                        }${companyData.data[0].billing_country ?
                                            `, ${companyData.data[0].billing_country}` : ''
                                        }`
                                    }>
                                        <div className="stat-value truncate">
                                            {companyData.data[0].billing_address || "-"}
                                            {companyData.data[0].billing_city && `, ${companyData.data[0].billing_city}`}
                                            {companyData.data[0].billing_state && `, ${companyData.data[0].billing_state}`}
                                            {companyData.data[0].billing_country && `, ${companyData.data[0].billing_country}`}
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

          .profile-header {
            padding: 24px;
            background: linear-gradient(135deg, #f6f8fd 0%, #f0f5ff 100%);
            border-bottom: 1px solid #e6e8f0;
          }

          .profile-main {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .company-avatar {
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

          .company-name {
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

          .company-info, .contact-info, .no-info {
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

          .icon {
            color: white;
            font-size: ${props => props.size || '16px'};
          }

          .profile-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
            padding: 24px;
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
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card lead-value-card">
                        <div className="metric-icon">
                            <FiDollarSign />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Lead Value</div>
                            <div className="metric-value">
                                {localDeal?.value
                                    ? formatCurrencyValue(
                                        localDeal.value,
                                        localDeal.currency
                                    )
                                    : "-"}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className={`metric-card status-card ${currentStatus || localDeal?.status}`}>
                        <div
                            className="metric-icon"
                            style={{
                                background: statusStyle.background
                            }}
                        >
                            {statusStyle.icon}
                        </div>
                        <div className="metric-content">
                            <div className="metric-label" style={{ color: statusStyle.color }}>Status</div>
                            <div
                                className="metric-value"
                                style={{ color: statusStyle.color }}
                            >
                                {statusStyle.text}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card created-date-card">
                        <div className="metric-icon">
                            <FiCalendar className="icon" />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Created</div>
                            <div className="metric-value">
                                {localDeal?.createdAt
                                    ? new Date(localDeal.createdAt).toLocaleDateString()
                                    : "-"}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card members-card">
                        <div className="metric-icon">
                            <FiUsers />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Deal Members</div>
                            <div className="metric-value">
                                {localDeal?.deal_members ? JSON.parse(localDeal.deal_members).deal_members.length : '0'}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div className="lead-details-section">
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card source-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiActivity />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Source</div>
                                    <div className="detail-value">
                                        {getSourceName(localDeal?.source)}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card category-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiFolder />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Category</div>
                                    <div className="detail-value">
                                        {getCategoryName(localDeal?.category)}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card date-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiClock />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Expected Close Date</div>
                                    <div className="detail-value">
                                        {localDeal?.closedDate ? dayjs(localDeal.closedDate).format('MMM DD, YYYY') : '-'}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card updated-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiUsers />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Last Updated</div>
                                    <div className="detail-value">
                                        {localDeal?.updatedAt ? dayjs(localDeal.updatedAt).format('MMM DD, YYYY') : '-'}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <style jsx>{`
                .sub-value {
                    font-size: 12px;
                    color: #6b7280;
                    margin-top: 2px;
                }
            `}</style>
        </div>
    );
};

export default DealOverview;