import React, { useState, useEffect } from 'react';
import {
    Card,
    message,
    Row,
    Col,
    Button,
    Space,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiHome,
    FiGrid,
    FiList,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CreateSubclient from './CreateSubclient';
import SubclientCard from './SubclientCard';
import SubclientList from './SubclientList';
import { useGetAllSubclientsQuery, useDeleteSubclientMutation } from './services/subClientApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import EditSubclient from './EditSubclient';
import './Subclient.scss';
import PageHeader from '../../../../components/PageHeader';

const SubClient = () => {
    const [searchText, setSearchText] = useState('');
    const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSubclient, setSelectedSubclient] = useState(null);
    const [subclients, setSubclients] = useState([]);
    const [filteredSubclients, setFilteredSubclients] = useState([]);
    const [viewMode, setViewMode] = useState('table');
    
    const { data: subclientsData, isLoading, refetch } = useGetAllSubclientsQuery();
    const { data: rolesData } = useGetRolesQuery();
    const [deleteSubclient] = useDeleteSubclientMutation();

    useEffect(() => {
        if (subclientsData?.data) {
            const transformedData = subclientsData.data.map(subclient => ({
                id: subclient.id,
                username: subclient.username || 'N/A',
                firstName: subclient.firstName || '',
                lastName: subclient.lastName || '',
                email: subclient.email || '',
                phone: subclient.phone || '',
                phoneCode: subclient.phoneCode || '',
                website: subclient.website || '',
                address: subclient.address || '',
                city: subclient.city || '',
                state: subclient.state || '',
                country: subclient.country || '',
                zipcode: subclient.zipcode || '',
                bankname: subclient.bankname || '',
                bankaccount: subclient.bankaccount || '',
                gstin: subclient.gstin || '',
                ifsc: subclient.ifsc || '',
                accountholder: subclient.accountholder || '',
                accountnumber: subclient.accountnumber || '',
                gstIn: subclient.gstIn || '',
                banklocation: subclient.banklocation || '',
                role_name: rolesData?.data?.find(role => role?.id === subclient?.role_id)?.role_name || 'N/A',
                created_at: subclient.createdAt || '-',
                updated_at: subclient.updatedAt || null,
                profilePic: subclient.profilePic || null,
                status: subclient.status || 'inactive',
                role_id: subclient.role_id,
                created_by: subclient.created_by,
                updated_by: subclient.updated_by
            }));
            setSubclients(transformedData);
        }
    }, [subclientsData, rolesData]);

    useEffect(() => {
        const filtered = subclients.filter(subclient =>
            subclient.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            subclient.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            subclient.role_name?.toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredSubclients(filtered);
    }, [subclients, searchText]);

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="users-page standard-page-container">
            <PageHeader
                title="Subclients"
                count={filteredSubclients.length}
                subtitle="Manage all subclients in the system"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "User Management" },
                    { title: "Subclients" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search subclients..."
                onAdd={() => setIsCreateFormVisible(true)}
                addText="Add Subclient"
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
                extraActions={[
                    <Space key="view-toggle" size={0} style={{ background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
                        <Button
                            type={viewMode === 'table' ? 'primary' : 'text'}
                            icon={<FiList size={14} />}
                            onClick={() => setViewMode('table')}
                            size="small"
                            style={{ borderRadius: '6px' }}
                        />
                        <Button
                            type={viewMode === 'card' ? 'primary' : 'text'}
                            icon={<FiGrid size={14} />}
                            onClick={() => setViewMode('card')}
                            size="small"
                            style={{ borderRadius: '6px' }}
                        />
                    </Space>
                ]}
            />

            <Card className="standard-content-card">
                {viewMode === 'table' ? (
                    <SubclientList
                        subclients={filteredSubclients}
                        loading={isLoading}
                        onEdit={(sub) => { setSelectedSubclient(sub); setIsEditModalOpen(true); }}
                        onDelete={async (record) => {
                            try {
                                await deleteSubclient(record.id).unwrap();
                                message.success('Subclient deleted successfully');
                                refetch();
                            } catch (e) {
                                message.error('Failed to delete subclient');
                            }
                        }}
                    />
                ) : (
                    <Row gutter={[12, 12]}>
                        {filteredSubclients.map(subclient => (
                            <Col xs={24} sm={12} md={8} lg={6} key={subclient.id}>
                                <SubclientCard
                                    subclient={subclient}
                                    onEdit={(sub) => { setSelectedSubclient(sub); setIsEditModalOpen(true); }}
                                    onDelete={async (record) => {
                                        try {
                                            await deleteSubclient(record.id).unwrap();
                                            message.success('Subclient deleted successfully');
                                            refetch();
                                        } catch (e) {
                                            message.error('Failed to delete subclient');
                                        }
                                    }}
                                />
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            <CreateSubclient
                open={isCreateFormVisible}
                onCancel={() => setIsCreateFormVisible(false)}
                onSuccess={() => { setIsCreateFormVisible(false); refetch(); }}
            />

            <EditSubclient
                open={isEditModalOpen}
                onCancel={() => { setIsEditModalOpen(false); setSelectedSubclient(null); }}
                initialValues={selectedSubclient}
            />
        </div>
    );
};

export default SubClient;
