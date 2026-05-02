import React, { useState } from 'react';
import {
    Card, message, Modal,
} from 'antd';
import {
    FiPlus, FiDownload, FiHome
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import VendorList from './VendorList';
import CreateVendor from './CreateVendor';
import EditVendor from './EditVendor';
import './vendor.scss';
import { useGetVendorsQuery, useDeleteVendorMutation } from './services/vendorApi';
import PageHeader from "../../../../components/PageHeader";

const Vendor = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const { data: vendors, isLoading, refetch } = useGetVendorsQuery({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
    });

    const [deleteVendor] = useDeleteVendorMutation();

    const handleExport = async (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="vendor-page standard-page-container">
            <PageHeader
                title="Vendors"
                count={vendors?.pagination?.total || 0}
                subtitle="Manage all vendors in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Vendors" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search vendors..."
                onAdd={() => { setSelectedVendor(null); setIsCreateModalOpen(true); }}
                addText="Add Vendor"
                isSearchVisible={isSearchVisible}
                onSearchVisibleChange={setIsSearchVisible}
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <VendorList
                    searchText={searchText}
                    onEdit={(record) => { setSelectedVendor(record); setIsEditModalOpen(true); }}
                    onDelete={(record) => {
                        Modal.confirm({
                            title: 'Delete Vendor',
                            content: 'Are you sure?',
                            onOk: async () => {
                                await deleteVendor(record.id).unwrap();
                                message.success('Deleted successfully');
                                refetch();
                            }
                        });
                    }}
                    loading={isLoading}
                    data={vendors}
                    pagination={pagination}
                    onChange={(newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }))}
                />
            </Card>

            <CreateVendor
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
            />

            <EditVendor
                open={isEditModalOpen}
                onCancel={() => { setIsEditModalOpen(false); setSelectedVendor(null); }}
                initialValues={selectedVendor}
            />
        </div>
    );
};

export default Vendor;
