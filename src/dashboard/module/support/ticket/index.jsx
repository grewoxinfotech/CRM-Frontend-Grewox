import React, { useState } from 'react';
import {
    Card, Typography, Modal, message,
} from 'antd';
import {
    FiPlus, FiSearch, FiDownload, FiHome
} from 'react-icons/fi';
import PageHeader from "../../../../components/PageHeader";
import './Ticket.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CreateTicket from './CreateTicket';
import TicketList from './TicketList';
import { useGetAllTicketsQuery, useDeleteTicketMutation } from './services/ticketApi';
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useGetRolesQuery } from "../../hrm/role/services/roleApi";

const Tickets = ({ isSupport = false }) => {
    const filterState = useSelector(state => state.ticket) || {};
    const { 
        filters = {}, 
        pagination = { current: 1, pageSize: 10 }, 
        sorting = {} 
    } = filterState;
    
    const { data: tickets, isLoading } = useGetAllTicketsQuery({
        ...filters,
        page: pagination?.current || 1,
        limit: pagination?.pageSize || 10,
        sortField: sorting?.field,
        sortOrder: sorting?.order,
        is_sadmin_support: isSupport
    });

    const [deleteTicket] = useDeleteTicketMutation();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const loggedInUser = useSelector(selectCurrentUser);
    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !loggedInUser || loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);
    const hasPermission = React.useCallback((action) => {
        if (!loggedInUser) return false;
        if (loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const permKey = isSupport ? 'dashboards-support-help' : 'dashboards-support-ticket';
        const perms = userPermissions[permKey];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions, isSupport]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = (tickets?.data || []).map(ticket => ({
                'Subject': ticket.ticketSubject,
                'Priority': ticket.priority,
                'Status': ticket.status,
                'Requester': ticket.requester,
                'Date': moment(ticket.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv': exportToCSV(data, 'tickets'); break;
                case 'excel': exportToExcel(data, 'tickets'); break;
                case 'pdf': exportToPDF(data, 'tickets'); break;
            }
            message.success(`Exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error("Export failed");
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        const csv = [Object.keys(data[0]).join(","), ...data.map(i => Object.values(i).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
    };

    const exportToExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tickets");
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF("l", "pt", "a4");
        doc.autoTable({ head: [Object.keys(data[0])], body: data.map(i => Object.values(i)) });
        doc.save(`${filename}.pdf`);
    };

    return (
        <div className="ticket-page standard-page-container">
            <PageHeader
                title={isSupport ? "Help Support" : "Support Tickets"}
                count={tickets?.pagination?.total || 0}
                subtitle={isSupport ? "Manage support requests" : "Manage internal support tickets"}
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
                    { title: isSupport ? "Help Support" : "Tickets" },
                ]}
                searchText={searchText}
                onSearch={handleSearch}
                onAdd={hasPermission('create') ? () => { setSelectedTicket(null); setIsEditing(false); setIsFormVisible(true); } : undefined}
                addText="Create Ticket"
                isSearchVisible={isSearchVisible}
                onSearchVisibleChange={setIsSearchVisible}
                exportMenu={hasPermission('export') ? {
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                } : undefined}
            />

            <Card className="standard-content-card">
                <TicketList
                    tickets={tickets}
                    onEdit={(t) => { setSelectedTicket(t); setIsEditing(true); setIsFormVisible(true); }}
                    onDelete={(t) => {
                        Modal.confirm({
                            title: 'Delete Ticket',
                            content: 'Are you sure?',
                            onOk: async () => {
                                await deleteTicket(t.id).unwrap();
                                message.success('Deleted');
                            }
                        });
                    }}
                    onView={setSelectedTicket}
                    loading={isLoading}
                    isSupport={isSupport}
                    searchText={searchText}
                    hasPermission={hasPermission}
                />
            </Card>

            <CreateTicket
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                initialValues={selectedTicket}
                isEditing={isEditing}
                isSupport={isSupport}
            />
        </div>
    );
};

export default Tickets;
