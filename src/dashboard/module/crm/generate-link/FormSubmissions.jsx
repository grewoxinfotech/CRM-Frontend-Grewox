import React, { useMemo, useState } from 'react';
import { Table, Card, Button, Space, Popconfirm, message, Typography, Tag, Tooltip, Avatar, Dropdown } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetFormSubmissionsQuery,
    useDeleteFormSubmissionMutation,
    useGetCustomFormByIdQuery
} from './services/customFormApi';
import dayjs from 'dayjs';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiFile, FiDownload, FiArrowLeft } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import './CustomForm.scss';

const { Title, Text } = Typography;

// Column width configurations
const COLUMN_WIDTHS = {
    companyName: 180,
    industryType: 150,
    website: 150,
    contactPerson: 120,
    emailAddress: 200,
    currentCrmSystem: 150,
    requirements: 300,
    default: 150
};

// Modern scrollbar styles
const scrollbarStyles = {
    '.custom-table-container': {
        width: '100%',
        overflow: 'auto',
        // For Webkit browsers (Chrome, Safari)
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
            '&:hover': {
                background: '#555',
            },
        },
        // For Firefox
        scrollbarWidth: 'thin',
        scrollbarColor: '#888 #f1f1f1',
    },
    '.ant-table-body': {
        '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
            '&:hover': {
                background: '#555',
            },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: '#888 #f1f1f1',
    }
};

// Text truncation component
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
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') {
            return (
                <Tag color={value ? 'green' : 'red'}>
                    {value ? 'Yes' : 'No'}
                </Tag>
            );
        }
        if (Array.isArray(value)) {
            return value.join(', ');
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

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => console.log('View', record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => handleDelete(record.id),
                danger: true,
            },
        ],
    });

    const getColumnWidth = (fieldName) => COLUMN_WIDTHS[fieldName] || COLUMN_WIDTHS.default;

    const columns = useMemo(() => {
        if (!submissionsData?.data?.[0]) return [];

        const firstSubmission = parseSubmissionData(submissionsData.data[0]);
        const fields = Object.keys(firstSubmission.submission_data || {});

        const dynamicColumns = fields.map((field, index) => ({
            title: formatFieldName(field),
            dataIndex: ['submission_data', field],
            key: field,
            fixed: index === 0 ? 'left' : false,
            width: getColumnWidth(field),
            ellipsis: false,
            render: (_, record) => {
                const parsed = parseSubmissionData(record);
                const value = parsed.submission_data?.[field];
                return renderValue(value);
            },
            sorter: (a, b) => {
                const parsedA = parseSubmissionData(a);
                const parsedB = parseSubmissionData(b);
                const valueA = parsedA.submission_data?.[field];
                const valueB = parsedB.submission_data?.[field];

                if (typeof valueA === 'number' && typeof valueB === 'number') {
                    return valueA - valueB;
                }
                if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
                    return valueA === valueB ? 0 : valueA ? -1 : 1;
                }
                return String(valueA || '').localeCompare(String(valueB || ''));
            }
        }));

        return [
            ...dynamicColumns,
            {
                title: 'Submission Date',
                dataIndex: 'createdAt',
                key: 'createdAt',
                width: 120,
                render: (date) => dayjs(date).format('MMM DD, YYYY')
            },
            {
                title: 'Action',
                key: 'actions',
                fixed: 'right',
                width: 80,
                align: 'center',
                render: (_, record) => (
                    <Dropdown
                        menu={getDropdownItems(record)}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical />}
                            onClick={(e) => e.preventDefault()}
                        />
                    </Dropdown>
                ),
            }
        ];
    }, [submissionsData?.data]);

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
                        type="primary"
                        icon={<FiDownload />}
                        onClick={exportToExcel}
                        disabled={!submissionsData?.data?.length}
                    >
                        Export to Excel
                    </Button>
                </Space>

                <div className="table-wrapper">
                    <style>
                        {`
                            .table-wrapper {
                                background: #fff;
                                border-radius: 8px;
                            }
                            .ant-table {
                                border-radius: 8px;
                            }
                            .ant-table-thead > tr > th {
                                background: #fafafa;
                                padding: 12px 16px;
                                font-weight: 500;
                            }
                            .ant-table-tbody > tr > td {
                                padding: 12px 16px;
                                line-height: 1.5;
                            }
                            .ant-table-tbody > tr:hover > td {
                                background: #fafafa;
                            }
                            .ant-table-cell {
                                font-size: 14px;
                            }
                            .ant-table-thead > tr > th {
                                font-size: 14px;
                                font-weight: 500;
                                color: #1f2937;
                            }
                            .custom-table-container::-webkit-scrollbar,
                            .ant-table-body::-webkit-scrollbar {
                                width: 6px;
                                height: 6px;
                            }
                            .custom-table-container::-webkit-scrollbar-thumb,
                            .ant-table-body::-webkit-scrollbar-thumb {
                                background: #d1d5db;
                                border-radius: 3px;
                            }
                            .custom-table-container::-webkit-scrollbar-track,
                            .ant-table-body::-webkit-scrollbar-track {
                                background: #f3f4f6;
                                border-radius: 3px;
                            }
                            .ant-pagination {
                                margin: 16px 0;
                            }
                            .ant-table-container table > thead > tr:first-child th:first-child {
                                border-top-left-radius: 8px;
                            }
                            .ant-table-container table > thead > tr:first-child th:last-child {
                                border-top-right-radius: 8px;
                            }
                        `}
                    </style>
                    <Table
                        columns={columns}
                        dataSource={processedData}
                        loading={isLoading}
                        rowKey="id"
                        scroll={{ x: 'max-content' }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                            position: ['bottomRight'],
                            size: 'default'
                        }}
                        size="middle"
                    />
                </div>
            </Space>
        </Card>
    );
};

export default FormSubmissions;