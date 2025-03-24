import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiGrid, FiList, FiHome
} from 'react-icons/fi';
import './Subclient.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateSubclient from './CreateSubclient';
import SubclientCard from './SubclientCard';
import SubclientList from './SubclientList';
import { useGetAllSubclientsQuery, useDeleteSubclientMutation } from './services/subClientApi';
import { useGetRolesQuery } from '../../../../dashboard/module/hrm/role/services/roleApi';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import EditSubclient from './EditSubclient';

const { Title, Text } = Typography;

const Subclient = () => {
    const dispatch = useDispatch();
    const { data: subclientsData, isLoading: isLoadingSubclients, refetch } = useGetAllSubclientsQuery();
    const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
    const [deleteSubclient, { isLoading: isDeleting }] = useDeleteSubclientMutation();

    const [subclients, setSubclients] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSubclient, setSelectedSubclient] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [searchText, setSearchText] = useState('');
    const [filteredSubclients, setFilteredSubclients] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const searchInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (subclientsData?.data) {
            const transformedData = subclientsData.data.map(subclient => ({
                id: subclient.id,
                username: subclient.username || 'N/A',
                email: subclient.email || 'N/A',
                role_name: rolesData?.data?.find(role => role?.id === subclient?.role_id)?.role_name || 'N/A',
                created_at: subclient.createdAt || '-',
                updated_at: subclient.updatedAt || null,
                profilePic: subclient.profilePic || null,
                status: subclient.status || 'inactive'
            }));
            setSubclients(transformedData);
            setFilteredSubclients(transformedData);
        }
    }, [subclientsData]);

    useEffect(() => {
        let result = [...subclients];
        if (searchText) {
            result = result.filter(subclient =>
                subclient.username.toLowerCase().includes(searchText.toLowerCase()) ||
                subclient.email.toLowerCase().includes(searchText.toLowerCase()) ||
                (subclient.username && subclient.username.toLowerCase().includes(searchText.toLowerCase())) ||
                (subclient.email && subclient.email.toLowerCase().includes(searchText.toLowerCase()))
            );
        }
        setFilteredSubclients(result);
    }, [subclients, searchText]);

    const handleCreate = () => {
        setSelectedSubclient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (subclient) => {
        setSelectedSubclient(subclient);
        setIsEditModalOpen(true);
    };

    const handleDelete = (subclient) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this subclient?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: '24px' },
            onOk: async () => {
                try {
                    await deleteSubclient(subclient.id).unwrap();
                    message.success('Subclient deleted successfully');
                    refetch();
                } catch (error) {
                    message.error('Failed to delete subclient');
                }
            },
        });
    };

    const handleView = (subclient) => {
        setSelectedSubclient(subclient);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const exportMenu = (
        <Menu>
            <Menu.Item
                key="csv"
                icon={<FiDownload />}
                onClick={() => handleExport('csv')}
            >
                Export as CSV
            </Menu.Item>
            <Menu.Item
                key="excel"
                icon={<FiDownload />}
                onClick={() => handleExport('excel')}
            >
                Export as Excel
            </Menu.Item>
            <Menu.Item
                key="pdf"
                icon={<FiDownload />}
                onClick={() => handleExport('pdf')}
            >
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = subclients.map(subclient => ({
                'Subclient Name': subclient.username,
                'Email': subclient.email,
                'Role': subclient.role_name,
                'Created Date': moment(subclient.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'subclients_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'subclients_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'subclients_export');
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
            Object.keys(data[0]).join(','),
            ...data.map(item => Object.values(item).map(value =>
                `"${value?.toString().replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const exportToExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Subclients');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="subclient-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Subclient</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Subclients</Title>
                    <Text type="secondary">Manage all subclients in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search subclients by name, email, phone, or company type"
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                                value={searchText}
                                ref={searchInputRef}
                                className="search-input"
                            />
                            <div className="action-buttons">
                                <Button.Group className="view-toggle">
                                    <Button
                                        type={viewMode === 'table' ? 'primary' : 'default'}
                                        icon={<FiList size={16} />}
                                        onClick={() => setViewMode('table')}
                                    />
                                    <Button
                                        type={viewMode === 'card' ? 'primary' : 'default'}
                                        icon={<FiGrid size={16} />}
                                        onClick={() => setViewMode('card')}
                                    />
                                </Button.Group>
                                <Dropdown overlay={exportMenu} trigger={['click']}>
                                    <Button className="export-button">
                                        <FiDownload size={16} />
                                        <span>Export</span>
                                        <FiChevronDown size={14} />
                                    </Button>
                                </Dropdown>
                                <Button
                                    type="primary"
                                    icon={<FiPlus size={16} />}
                                    onClick={handleCreate}
                                    className="add-button"
                                >
                                    Add Subclient
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="subclient-table-card">
                {viewMode === 'table' ? (
                    <SubclientList
                        subclients={filteredSubclients}
                        loading={isLoadingSubclients || isDeleting}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                    />
                ) : (
                    <Row gutter={[16, 16]} className="subclient-cards-grid">
                        {filteredSubclients
                            .slice((currentPage - 1) * 10, currentPage * 10)
                            .map(subclient => (
                                <Col xs={24} sm={12} md={8} lg={6} key={subclient.id}>
                                    <SubclientCard
                                        subclient={subclient}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onView={handleView}
                                    />
                                </Col>
                            ))}
                        {filteredSubclients.length > 10 && (
                            <Col span={24} style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                <Table.Pagination
                                    current={currentPage}
                                    pageSize={10}
                                    total={filteredSubclients.length}
                                    showSizeChanger={false}
                                    showQuickJumper={false}
                                    onChange={(page) => setCurrentPage(page)}
                                />
                            </Col>
                        )}
                    </Row>
                )}
            </Card>

            <CreateSubclient
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                }}
            />

            <EditSubclient
                open={isEditModalOpen}
                bodyStyle={{ marginTop: '20px' }}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedSubclient(null);
                }}
                initialValues={selectedSubclient}
            />
        </div>
    );
};

export default Subclient;
