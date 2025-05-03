import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Table, Card, Button, Space, Popconfirm, message, Typography, Tag, Tooltip, Avatar, Dropdown } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetFormSubmissionsQuery,
    useDeleteFormSubmissionMutation,
    useGetCustomFormByIdQuery,
} from './services/customFormApi';
import dayjs from 'dayjs';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiFile, FiDownload, FiArrowLeft, FiUserPlus, FiCheck, FiChevronRight, FiChevronLeft, FiCalendar, FiUser, FiPhone, FiBriefcase, FiAward, FiMail, FiMapPin, FiClock, FiClipboard, FiFileText } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import './CustomForm.scss';
import { useGetLeadsQuery } from '../lead/services/LeadApi';

const { Title, Text } = Typography;
const TruncatedText = ({ text, maxLength = 100 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text || text.length <= maxLength) {
        return <span>{text}</span>;
    }

    const displayText = isExpanded ? text : text.slice(0, maxLength);

    return (
        <div style={{ position: 'relative', lineHeight: '1.5' }}>
            <div>
                <Text>
                    {displayText}
                    {!isExpanded && '... '}
                    <Button
                        type="link"
                        size="small"
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            padding: '0 4px',
                            height: 'auto',
                            lineHeight: '1.5',
                            fontSize: '12px'
                        }}
                    >
                        {isExpanded ? 'Show Less' : 'Show More'}
                    </Button>
                </Text>
            </div>
        </div>
    );
};

const FormSubmissions = () => {
    const { formId } = useParams();
    const navigate = useNavigate();
    const { data: submissionsData, isLoading } = useGetFormSubmissionsQuery(formId);
    const { data: formData } = useGetCustomFormByIdQuery(formId);
    const [deleteSubmission] = useDeleteFormSubmissionMutation();
    const { data: leads } = useGetLeadsQuery();
    const tableRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);

    const handleDelete = async (id) => {
        try {
            await deleteSubmission(id).unwrap();
            message.success('Submission deleted successfully');
        } catch (error) {
            message.error(error.data?.message || 'Failed to delete submission');
        }
    };

    const parseSubmissionData = (submission) => {
        try {
            if (typeof submission.submission_data === 'string') {
                return {
                    ...submission,
                    submission_data: JSON.parse(submission.submission_data)
                };
            }
            return submission;
        } catch (error) {
            console.error('Error parsing submission data:', error);
            return submission;
        }
    };

    const formatFieldName = (fieldName) => {
        return fieldName
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
    };

    const renderValue = (value) => {
        if (value === null || value === undefined || value === '') return '-';
        if (typeof value === 'boolean') {
            return (
                <Tag color={value ? 'green' : 'red'}>
                    {value ? 'Yes' : 'No'}
                </Tag>
            );
        }
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : 'None';
        }
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        // If text is longer than 100 characters, use TruncatedText component
        if (typeof value === 'string' && value.length > 100) {
            return <TruncatedText text={value} />;
        }
        return String(value);
    };

    const handleConvertToLead = (submission) => {
        if (!submission) {
            message.error('No submission data available');
            return;
        }

        // Navigate to lead page with only the submission ID
        navigate('/dashboard/crm/leads', {
            state: {
                openCreateForm: true,
                formSubmissionId: submission.id
            }
        });

        message.success('Opening lead creation form...');
    };

    const getDropdownItems = (record) => {
        console.log('Leads data:', leads?.data);
        console.log('Record ID:', record.id);
        // Check if this submission is already converted to a lead
        const isConverted = leads?.data?.some(lead => lead.inquiry_id === record.id);

        return {
            items: [
                {
                    key: 'view',
                    icon: <FiEye />,
                    label: 'View Details',
                    onClick: () => console.log('View', record),
                },
                {
                    key: 'convert',
                    icon: <FiUserPlus style={{ color: isConverted ? '#8c8c8c' : '#52c41a' }} />,
                    label: (
                        <Text style={{ color: isConverted ? '#8c8c8c' : '#52c41a' }}>
                            {isConverted ? 'Already Converted' : 'Convert to Lead'}
                        </Text>
                    ),
                    onClick: () => !isConverted && handleConvertToLead(record),
                    disabled: isConverted
                },
                {
                    key: 'delete',
                    icon: <FiTrash2 />,
                    label: 'Delete',
                    onClick: () => handleDelete(record.id),
                    danger: true,
                    disabled: isConverted
                },
            ],
        }
    };

    const getFieldIcon = (fieldName) => {
        const lowerField = fieldName.toLowerCase();
        if (lowerField.includes('schedule') || lowerField.includes('date') || lowerField.includes('time')) return <FiCalendar />;
        if (lowerField.includes('name') || lowerField.includes('participant')) return <FiUser />;
        if (lowerField.includes('phone') || lowerField.includes('contact')) return <FiPhone />;
        if (lowerField.includes('experience') || lowerField.includes('level')) return <FiBriefcase />;
        if (lowerField.includes('certificate')) return <FiAward />;
        if (lowerField.includes('email')) return <FiMail />;
        if (lowerField.includes('address') || lowerField.includes('location')) return <FiMapPin />;
        if (lowerField.includes('duration')) return <FiClock />;
        if (lowerField.includes('notes') || lowerField.includes('additional')) return <FiClipboard />;
        return <FiFileText />;
    };

    const getFieldColor = (fieldName) => {
        const lowerField = fieldName.toLowerCase();
        if (lowerField.includes('schedule') || lowerField.includes('date') || lowerField.includes('time')) return '#2196f3';
        if (lowerField.includes('name') || lowerField.includes('participant')) return '#4caf50';
        if (lowerField.includes('phone') || lowerField.includes('contact')) return '#ff9800';
        if (lowerField.includes('experience') || lowerField.includes('level')) return '#9c27b0';
        if (lowerField.includes('certificate')) return '#f44336';
        if (lowerField.includes('email')) return '#00bcd4';
        if (lowerField.includes('address') || lowerField.includes('location')) return '#795548';
        if (lowerField.includes('duration')) return '#607d8b';
        if (lowerField.includes('notes') || lowerField.includes('additional')) return '#ff5722';
        return '#3f51b5';
    };

    const handleScroll = (e) => {
        const element = e.target;
        const scrollWidth = element.scrollWidth - element.clientWidth;
        const scrolled = (element.scrollLeft / scrollWidth) * 100;
        setScrollPosition(scrolled);
    };

    const renderCellContent = (value, field) => {
        const content = renderValue(value);
        const getTooltipContent = () => {
            if (React.isValidElement(content)) {
                return value === null || value === undefined ? '-' : String(value);
            }
            return typeof content === 'string' ? content : String(value);
        };

        return (
            <Tooltip title={getTooltipContent()} placement="topLeft">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '32px',
                }}>
                    <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%'
                    }}>
                        {content}
                    </div>
                </div>
            </Tooltip>
        );
    };

    const columns = useMemo(() => {
        if (!submissionsData?.data?.[0]) return [];

        const firstSubmission = parseSubmissionData(submissionsData.data[0]);
        const allFields = Object.keys(firstSubmission.submission_data || {});

        // Status column
        const statusColumn = {
            title: 'Status',
            key: 'status',
            width: 120,
            fixed: 'left',
            render: (_, record) => {
                const isConverted = leads?.data?.some(lead => lead.inquiry_id === record.id);
                return (
                    <Tag color={isConverted ? 'success' : 'default'} style={{
                        margin: 0,
                        borderRadius: '16px',
                        padding: '4px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '13px',
                        fontWeight: 500,
                        border: 'none',
                        background: isConverted ? '#e6f4ff' : '#f5f5f5',
                        color: isConverted ? '#1890ff' : '#666',
                        height: '24px'
                    }}>
                        {isConverted ? (
                            <>
                                <FiCheck style={{ fontSize: '14px' }} />
                                Converted
                            </>
                        ) : 'Not Converted'}
                    </Tag>
                );
            }
        };

        // First 5 fields
        const visibleFields = allFields.slice(0, 5);
        const dataColumns = visibleFields.map((field) => ({
            title: formatFieldName(field),
            dataIndex: ['submission_data', field],
            key: field,
            width: 200,
            render: (_, record) => {
                const parsed = parseSubmissionData(record);
                const value = parsed.submission_data?.[field];
                return renderCellContent(value, field);
            }
        }));

        // Remaining fields
        const remainingFields = allFields.slice(5);
        const remainingColumns = remainingFields.map((field) => ({
            title: formatFieldName(field),
            dataIndex: ['submission_data', field],
            key: field,
            width: 200,
            render: (_, record) => {
                const parsed = parseSubmissionData(record);
                const value = parsed.submission_data?.[field];
                return renderCellContent(value, field);
            }
        }));

        // Action column
        const actionColumn = {
            title: (
                <div style={{
                    padding: '0 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#262626'
                }}>
                    Action
                </div>
            ),
            key: 'actions',
            width: 100,
            fixed: 'left',
            render: (_, record) => (
                <div className="action-cell">
                    <Dropdown
                        menu={getDropdownItems(record)}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical style={{ fontSize: '16px' }} />}
                            className="action-button"
                        />
                    </Dropdown>
                </div>
            )
        };

        return [
            actionColumn,
            statusColumn,
            ...dataColumns,
            ...remainingColumns
        ];
    }, [submissionsData?.data, leads?.data]);

    const exportToExcel = () => {
        try {
            const exportData = submissionsData?.data.map(submission => {
                const parsedSubmission = parseSubmissionData(submission);
                const exportRow = {
                    ...parsedSubmission.submission_data,
                    'Submission Date': dayjs(parsedSubmission.createdAt).format('MMM DD, YYYY HH:mm')
                };

                // Format boolean values as Yes/No
                Object.keys(exportRow).forEach(key => {
                    if (typeof exportRow[key] === 'boolean') {
                        exportRow[key] = exportRow[key] ? 'Yes' : 'No';
                    }
                });

                return exportRow;
            });

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

            const fileName = `${formData?.data?.title || 'Form'}_Submissions_${dayjs().format('YYYY-MM-DD')}.xlsx`;
            XLSX.writeFile(wb, fileName);

            message.success('Submissions exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            message.error('Failed to export submissions');
        }
    };

    const processedData = submissionsData?.data?.map(parseSubmissionData) || [];

    return (
        <Card bodyStyle={{ padding: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size={24}>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Space>
                        <Button
                            icon={<FiArrowLeft />}
                            onClick={() => navigate('/dashboard/crm/custom-form')}
                        >
                            Back
                        </Button>
                        <Title level={4} style={{ margin: 0 }}>
                            {formData?.data?.title || 'Form'} - Submissions
                        </Title>
                    </Space>

                    <Button
                        type="default"
                        icon={<FiDownload />}
                        onClick={exportToExcel}
                        disabled={!submissionsData?.data?.length}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Export
                    </Button>
                </Space>

                <div className="table-container">
                    <style>
                        {`
                            .table-container {
                                position: relative;
                                border-radius: 8px;
                                overflow: hidden;
                                background: #fff;
                            }

                            .ant-table-wrapper {
                                overflow: hidden;
                            }

                            .ant-table {
                                background: #fff;
                            }

                            .ant-table-container {
                                padding-bottom: 0;
                            }

                            .ant-table-header {
                                background: #fff;
                            }

                            .ant-table-body {
                                overflow-x: auto !important;
                                overflow-y: auto !important;
                                max-height: calc(100vh - 280px) !important;
                                min-height: 400px;
                            }

                            .ant-table-thead > tr > th {
                                background: #fafafa !important;
                                font-weight: 600;
                                padding: 12px 16px;
                                border-bottom: 1px solid #f0f0f0;
                            }

                            .ant-table-tbody > tr > td {
                                padding: 12px 16px;
                                border-bottom: 1px solid #f0f0f0;
                            }

                            .ant-table-tbody > tr:hover > td {
                                background: #fafafa !important;
                            }

                            /* Pagination Styles */
                            .ant-pagination {
                                margin: 16px 0 !important;
                                padding: 0 24px;
                            }

                            .ant-pagination-total-text {
                                color: #666;
                                font-size: 13px;
                            }

                            .ant-pagination-item {
                                border-radius: 4px;
                                font-size: 13px;
                            }

                            .ant-pagination-item-active {
                                background: #1890ff;
                                border-color: #1890ff;
                            }

                            .ant-pagination-item-active a {
                                color: #fff;
                            }

                            /* Action Column Styles */
                            .action-cell {
                                display: flex;
                                align-items: center;
                                padding: 0 12px !important;
                                opacity: 1 !important;
                                visibility: visible !important;
                            }
                            
                            .action-button {
                                width: 32px;
                                height: 32px;
                                border-radius: 4px;
                                display: flex !important;
                                align-items: center;
                                justify-content: center;
                                color: #666;
                                transition: all 0.3s;
                                border: none;
                                background: transparent;
                                opacity: 1 !important;
                                visibility: visible !important;
                            }

                            .action-button:hover {
                                background: #f5f5f5;
                                color: #1890ff;
                            }

                            /* Override any hover visibility styles */
                            .ant-table-tbody > tr > td .action-cell,
                            .ant-table-tbody > tr > td .action-button {
                                opacity: 1 !important;
                                visibility: visible !important;
                                display: flex !important;
                            }

                            .ant-table-tbody > tr > td {
                                padding: 12px 16px;
                                border-bottom: 1px solid #f0f0f0;
                            }

                            .ant-table-tbody > tr:hover > td {
                                background: #fafafa !important;
                            }

                            /* Ensure dropdown trigger is always visible */
                            .ant-dropdown-trigger {
                                display: inline-flex !important;
                                align-items: center;
                                justify-content: center;
                                opacity: 1 !important;
                                visibility: visible !important;
                            }
                        `}
                    </style>

                    <Table
                        ref={tableRef}
                        columns={columns}
                        dataSource={processedData}
                        loading={isLoading}
                        rowKey="id"
                        scroll={{
                            y: 'calc(100vh - 280px)'
                        }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} submissions`,
                            position: ['bottomRight'],
                            style: {
                                padding: '16px 24px',
                                background: '#fff',
                                borderTop: '1px solid #f0f0f0'
                            }
                        }}
                        size="middle"
                    />
                </div>
            </Space>
        </Card>
    );
};

export default FormSubmissions;