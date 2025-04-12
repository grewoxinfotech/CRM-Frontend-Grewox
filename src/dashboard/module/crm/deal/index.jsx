import React, { useState } from 'react';
import {
    Card, Typography, Button, Input,
    Dropdown, Menu, Space, Breadcrumb, Modal
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiGrid, FiList, FiHome
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import './Deal.scss';
import CreateDeal from './CreateDeal';
import DealCard from './DealCard';
import DealList from './DealList';
import EditDeal from './EditDeal';
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLeadStagesQuery } from "../crmsystem/leadstage/services/leadStageApi";
import { useDeleteDealMutation, useGetDealsQuery } from './services/dealApi';

const { Title, Text } = Typography;

const Deal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    // Fetch pipelines and deal stages
    const { data: pipelines = [] } = useGetPipelinesQuery();
    const { data: dealStages = [] } = useGetLeadStagesQuery();
    const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();
    const { data, isLoading, error } = useGetDealsQuery();

    // Filter deals based on search text
    const filteredDeals = React.useMemo(() => {
        if (!data) return [];
        if (!searchText) return data;

        const searchLower = searchText.toLowerCase();
        return data.filter(deal => 
            deal.dealTitle?.toLowerCase().includes(searchLower) ||
            deal.company_name?.toLowerCase().includes(searchLower)
        );
    }, [data, searchText]);

    const handleDealClick = (deal) => {
        navigate(`/dashboard/crm/deals/${deal.id}`);
    };


    const handleCreate = () => {
        setSelectedDeal(null);
        setIsModalOpen(true);
    };

    const handleEdit = (deal) => {
        setSelectedDeal(deal);
        setIsEditModalOpen(true);
    };

    const handleDelete = (deal) => {
        Modal.confirm({
            title: 'Delete Deal',
            content: 'Are you sure you want to delete this deal?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                deleteDeal(deal.id);
            },
        });
    };

    const handleView = (deal) => {
        setSelectedDeal(deal);
    };

    const exportMenu = {
        items: [
            {
                key: 'csv',
                label: 'Export as CSV',
            },
            {
                key: 'excel',
                label: 'Export as Excel',
            },
            {
                key: 'pdf',
                label: 'Export as PDF',
            },
        ],
    };

    return (
        <div className="deal-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Deal</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <h2>Deals</h2>
                    <Text className="subtitle">Manage your deals</Text>
                </div>

                <div className="header-right">
                    <Input
                        prefix={<FiSearch style={{ color: '#9CA3AF' }} />}
                        placeholder="Search deals..."
                        className="search-input"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                    <div className="view-buttons">
                        <div className="view-toggle">
                            <Button
                                type={viewMode === 'table' ? 'primary' : 'default'}
                                icon={<FiList />}
                                onClick={() => setViewMode('table')}
                            />
                            <Button
                                type={viewMode === 'card' ? 'primary' : 'default'}
                                icon={<FiGrid />}
                                onClick={() => setViewMode('card')}
                            />
                        </div>
                    </div>
                    <Dropdown menu={exportMenu} trigger={['click']}>
                        <Button>
                            <FiDownload /> Export <FiChevronDown />
                        </Button>
                    </Dropdown>
                    <Button type="primary" icon={<FiPlus />} onClick={handleCreate}>
                        Add Deal
                    </Button>
                </div>
            </div>

            <Card className="deal-content">
                {viewMode === 'card' ? (
                    <DealCard
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        onDealClick={handleDealClick}
                        deals={filteredDeals}
                    />
                ) : (
                    <DealList
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        onDealClick={handleDealClick}
                        deals={filteredDeals}
                        searchText={searchText}
                    />
                )}
            </Card>

            <CreateDeal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                pipelines={pipelines}
                dealStages={dealStages}
      
            />

            <EditDeal
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedDeal(null);
                }}
                initialValues={selectedDeal}
                pipelines={pipelines}
                dealStages={dealStages}
            />

            {/* <CompanyDealList
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onDealClick={handleDealClick}
                deleteDeal={deleteDeal}
            /> */}
        </div>
    );
};

export default Deal;
