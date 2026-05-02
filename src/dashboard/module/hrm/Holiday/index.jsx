import React, { useState } from 'react';
import {
    Card,
    message,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './holiday.scss';
import CreateHoliday from './CreateHoliday';
import EditHoliday from './EditHoliday';
import HolidayList from './HolidayList';
import { Link } from 'react-router-dom';
import { useGetAllHolidaysQuery } from './services/holidayApi';
import dayjs from 'dayjs';
import PageHeader from '../../../../components/PageHeader';

const Holiday = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedHoliday, setSelectedHoliday] = useState(null);
    const [searchText, setSearchText] = useState('');

    const { data: holidayData, isLoading } = useGetAllHolidaysQuery();

    const handleEdit = (record) => {
        const formattedRecord = {
            ...record,
            start_date: record.start_date ? dayjs(record.start_date) : null,
            end_date: record.end_date ? dayjs(record.end_date) : null
        };
        setSelectedHoliday(formattedRecord);
        setIsEditModalOpen(true);
    };

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="holiday-page standard-page-container">
            <PageHeader
                title="Holidays"
                count={holidayData?.data?.length || 0}
                subtitle="Manage all holidays in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Holiday" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search holidays..."
                onAdd={() => setIsCreateModalOpen(true)}
                addText="Add Holiday"
                exportMenu={{
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <HolidayList
                    onEdit={handleEdit}
                    searchText={searchText}
                    loading={isLoading}
                />
            </Card>

            <CreateHoliday
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={() => { setIsCreateModalOpen(false); message.success('Holiday created successfully'); }}
            />

            <EditHoliday
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedHoliday(null);
                }}
                onSubmit={() => { setIsEditModalOpen(false); setSelectedHoliday(null); message.success('Holiday updated successfully'); }}
                initialValues={selectedHoliday}
            />
        </div>
    );
};

export default Holiday;