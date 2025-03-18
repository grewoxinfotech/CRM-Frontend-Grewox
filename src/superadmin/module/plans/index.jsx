import React, { useState } from 'react';
import {
    Row,
    Col,
    Input,
    Button,
    Typography,
    Breadcrumb,
    Card,
    Dropdown,
    Menu,
    message
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiGrid,
    FiList,
    FiHome
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import dayjs from 'dayjs';
import './plans.scss';

import {
    useGetAllPlansQuery,
    useDeletePlanMutation,
    useUpdatePlanMutation
} from './services/planApi';
import {
    setFilters,
    setViewMode,
    setSelectedPlan
} from './services/planSlice';

import PlanList from './PlanList';
import PlanCard from './PlanCard';
import AddPlan from './AddPlan';

const { Title, Text } = Typography;

const Plans = () => {
    const dispatch = useDispatch();
    const { filters, viewMode } = useSelector((state) => state.plan);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    const {
        data: plansData,
        isLoading,
        isFetching
    } = useGetAllPlansQuery(filters);

    const [deletePlan] = useDeletePlanMutation();
    const [updatePlan] = useUpdatePlanMutation();

    const handleSearch = (value) => {
        dispatch(setFilters({ search: value, page: 1 }));
    };

    const handleEdit = (id) => {
        const plan = plansData?.data.find((p) => p.id === id);
        if (plan) {
            dispatch(setSelectedPlan(plan));
        }
    };

    const handleDelete = async (id) => {
        try {
            await deletePlan(id).unwrap();
            message.success('Plan deleted successfully');
        } catch (error) {
            message.error('Failed to delete plan');
        }
    };

    const handleToggleStatus = async (id, newStatus) => {
        try {
            const currentPlan = plansData?.data.find(p => p.id === id);
            if (!currentPlan) {
                message.error('Plan not found');
                return;
            }

            const updateData = {
                id,
                name: currentPlan.name,
                currency: currentPlan.currency,
                price: currentPlan.price,
                duration: currentPlan.duration,
                trial_period: currentPlan.trial_period,
                max_users: currentPlan.max_users,
                max_clients: currentPlan.max_clients,
                max_customers: currentPlan.max_customers,
                max_vendors: currentPlan.max_vendors,
                storage_limit: currentPlan.storage_limit,
                status: newStatus
            };

            await updatePlan(updateData).unwrap();
            message.success(`Plan ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            message.error('Failed to update plan status: ' + (error.message || 'Unknown error'));
        }
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

    const handleExport = (type) => {
        try {
            const headers = ['Name', 'Type', 'Price', 'Status', 'Created At'];
            const data = plansData?.data.map(plan => ({
                'Name': plan.name,
                'Type': plan.type,
                'Price': `$${Number(plan.price).toFixed(2)}`,
                'Status': plan.status,
                'Created At': dayjs(plan.createdAt).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'plans_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'plans_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'plans_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error('Failed to export plans');
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
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const handlePageChange = (page, pageSize) => {
        dispatch(setFilters({ page, limit: pageSize }));
    };

    const renderCardView = () => (
        <div className="plans-cards-grid">
            {plansData?.data.map((plan) => (
                <PlanCard
                    key={plan.id}
                    plan={plan}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onView={() => handleEdit(plan.id)}
                />
            ))}
        </div>
    );

    return (
        <div className="plans-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Plans</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Plans</Title>
                    <Text type="secondary">Manage subscription plans</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search plans..."
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                                value={filters.search}
                                className="search-input"
                            />
                            <div className="action-buttons">
                                <Button.Group className="view-toggle">
                                    <Button
                                        type={viewMode === 'table' ? 'primary' : 'default'}
                                        icon={<FiList size={16} />}
                                        onClick={() => dispatch(setViewMode('table'))}
                                    />
                                    <Button
                                        type={viewMode === 'card' ? 'primary' : 'default'}
                                        icon={<FiGrid size={16} />}
                                        onClick={() => dispatch(setViewMode('card'))}
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
                                    onClick={() => setIsAddModalVisible(true)}
                                    className="add-button"
                                >
                                    Add Plan
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="plans-table-card">
                {viewMode === 'table' ? (
                    <PlanList
                        plans={plansData?.data}
                        loading={isLoading || isFetching}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        pagination={{
                            current: filters.page,
                            pageSize: filters.limit,
                            total: plansData?.total || 0
                        }}
                        onPageChange={handlePageChange}
                    />
                ) : (
                    renderCardView()
                )}
            </Card>

            <AddPlan
                visible={isAddModalVisible}
                onCancel={() => setIsAddModalVisible(false)}
            />
        </div>
    );
};

export default Plans; 