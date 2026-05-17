import React, { useState } from 'react';
import {
    Card,
    message,
    Modal,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './proposal.scss';
import { Link } from 'react-router-dom';
import CreateProposal from './CreateProposal';
import ProposalList from './ProposalList';
import { useGetAllProposalsQuery, useDeleteProposalMutation } from './services/proposalApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import PageHeader from "../../../../components/PageHeader";

const Proposal = () => {
    const filterState = useSelector(state => state.proposal) || {};
    const { pagination = { current: 1, pageSize: 10 }, filters = {} } = filterState;
    
    const { data: proposalsData, isLoading } = useGetAllProposalsQuery({
        ...filters,
        page: pagination?.current || 1,
        limit: pagination?.pageSize || 10,
    });

    const [deleteProposal] = useDeleteProposalMutation();
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const currentUser = useSelector(selectCurrentUser);
    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !currentUser || currentUser.roleName === 'super-admin' || currentUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === currentUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);
    const hasPermission = React.useCallback((action) => {
        if (!currentUser) return false;
        if (currentUser.roleName === 'super-admin' || currentUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const perms = userPermissions['dashboards-proposal'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [currentUser, userPermissions]);

    const handleExport = async (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="proposals-page standard-page-container">
            <PageHeader
                title="Proposals"
                count={proposalsData?.pagination?.total || 0}
                subtitle="Manage all proposals for your leads"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Proposals" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search proposals..."
                onAdd={hasPermission('create') ? () => { setSelectedProposal(null); setIsEditing(false); setIsCreateModalVisible(true); } : undefined}
                addText="Create Proposal"
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
                <ProposalList
                    proposals={proposalsData?.data || []}
                    loading={isLoading}
                    onEdit={(p) => { setSelectedProposal(p); setIsEditing(true); setIsCreateModalVisible(true); }}
                    onDelete={(p) => {
                        Modal.confirm({
                            title: 'Delete Proposal',
                            content: 'Are you sure?',
                            onOk: async () => {
                                await deleteProposal(p.id).unwrap();
                                message.success('Deleted successfully');
                            }
                        });
                    }}
                    onView={(p) => console.log('View proposal:', p)}
                    searchText={searchText}
                    hasPermission={hasPermission}
                />
            </Card>

            <CreateProposal
                open={isCreateModalVisible}
                onCancel={() => { setIsCreateModalVisible(false); setSelectedProposal(null); }}
                initialValues={selectedProposal}
                isEditing={isEditing}
            />
        </div>
    );
};

export default Proposal;
