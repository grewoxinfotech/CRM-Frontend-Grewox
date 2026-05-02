import React, { useState, useEffect, useMemo } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu
} from 'antd';
import {
    FiPlus, FiSearch,
    FiDownload,
    FiHome
} from 'react-icons/fi';
import PageHeader from "../../../../components/PageHeader";
import './Ticket.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import CreateTicket from './CreateTicket';
import TicketList from './TicketList';
import { useGetAllTicketsQuery, useDeleteTicketMutation } from './services/ticketApi';

const { Title, Text } = Typography;

const Tickets = ({ isSupport = true }) => {
    const dispatch = useDispatch();
    const filterState = useSelector(state => state.ticket) || {};
    
    const { 
        filters = {}, 
        pagination = { 
            current: 1, 
            pageSize: 10,
            total: 0 
        }, 
        sorting = { 
            field: undefined, 
            order: undefined 
        } 
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

    const filteredTickets = useMemo(() => {
        if (!tickets?.data) return [];
        
        return tickets.data.filter(ticket => {
            if (!searchText) return true;
            
            const searchTerm = searchText.toLowerCase();
            return (
                ticket.ticketSubject?.toLowerCase().includes(searchTerm) ||
                ticket.description?.toLowerCase().includes(searchTerm) ||
                ticket.priority?.toLowerCase().includes(searchTerm) ||
                ticket.status?.toLowerCase().includes(searchTerm) ||
                (ticket.requestorName || ticket.requestor || '').toLowerCase().includes(searchTerm)
            );
        });
    }, [tickets, searchText]);

    const handleAddTicket = () => {
        setSelectedTicket(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditTicket = (ticket) => {
        setSelectedTicket(ticket);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
    };

    const handleFormClose = () => {
        setIsFormVisible(false);
        setSelectedTicket(null);
        setIsEditing(false);
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = filteredTickets.map(ticket => ({
                'Ticket ID': ticket.id,
                'Subject': ticket.ticketSubject,
                'Requester': ticket.requestorName || ticket.requestor,
                'Priority': ticket.priority || 'N/A',
                'Status': ticket.status,
                'Created Date': moment(ticket.createdAt).format('DD-MM-YYYY')
            }));

            if (type === 'excel') {
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Tickets");
                XLSX.writeFile(wb, "tickets_export.xlsx");
            } else if (type === 'pdf') {
                const doc = new jsPDF('l', 'pt', 'a4');
                doc.autoTable({
                    head: [Object.keys(data[0])],
                    body: data.map(item => Object.values(item)),
                });
                doc.save("tickets_export.pdf");
            } else if (type === 'csv') {
                const csvContent = [
                    Object.keys(data[0]).join(','),
                    ...data.map(item => Object.values(item).map(value =>
                        `"${value?.toString().replace(/"/g, '""')}"`
                    ).join(','))
                ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', "tickets_export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this ticket?',
            okType: 'danger',
            okText: 'Yes',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteTicket(record.id).unwrap();
                    message.success('Ticket deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete ticket');
                }
            },
        });
    };

    const searchContent = (
        <div className="search-popup">
            <Input
                prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                placeholder="Search tickets..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
                autoFocus
            />
        </div>
    );

    return (
        <div className="ticket-page">
            <PageHeader
                title="Company Tickets"
                count={tickets?.pagination?.total || 0}
                subtitle="Manage all company support tickets"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/super-admin">
                                <FiHome style={{ marginRight: "4px" }} />
                                Home
                            </Link>
                        ),
                    },
                    {
                        title: "Company Tickets",
                    },
                ]}
                searchText={searchText}
                onSearch={handleSearch}
                searchPlaceholder="Search tickets..."
                onAdd={handleAddTicket}
                addText="Create Ticket"
                mobileSearchContent={searchContent}
                isSearchVisible={isSearchVisible}
                onSearchVisibleChange={setIsSearchVisible}
                exportMenu={{
                    items: [
                        {
                            key: 'excel',
                            label: 'Export as Excel',
                            icon: <FiDownload />,
                            onClick: () => handleExport('excel'),
                        },
                        {
                            key: 'pdf',
                            label: 'Export as PDF',
                            icon: <FiDownload />,
                            onClick: () => handleExport('pdf'),
                        },
                        {
                            key: 'csv',
                            label: 'Export as CSV',
                            icon: <FiDownload />,
                            onClick: () => handleExport('csv'),
                        }
                    ]
                }}
            />

            <Card className="ticket-content">
                <TicketList
                    tickets={tickets}
                    onEdit={handleEditTicket}
                    onDelete={handleDelete}
                    onView={handleViewTicket}
                    loading={isLoading}
                    isSupport={isSupport}
                    searchText={searchText}
                />
            </Card>

            <CreateTicket
                open={isFormVisible}
                onCancel={handleFormClose}
                initialValues={selectedTicket}
                isEditing={isEditing}
                isSupport={isSupport}
            />
        </div>
    );
};

export default Tickets;
