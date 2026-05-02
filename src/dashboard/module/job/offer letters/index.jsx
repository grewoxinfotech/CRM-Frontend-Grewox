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
import './offerLetters.scss';
import CreateOfferLetter from './CreateOfferLetter';
import OfferLetterList from './OfferLetterList';
import { Link } from 'react-router-dom';
import { useGetAllOfferLettersQuery, useDeleteOfferLetterMutation } from './services/offerLetterApi';
import PageHeader from '../../../../components/PageHeader';

const OfferLetters = () => {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedLetter, setSelectedLetter] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const { data: offerLettersData, isLoading, refetch } = useGetAllOfferLettersQuery({
        page: currentPage,
        pageSize,
        search: searchText,
    });

    const [deleteOfferLetter] = useDeleteOfferLetterMutation();

    const handleAddLetter = () => {
        setSelectedLetter(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditLetter = (letter) => {
        setSelectedLetter(letter);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="offer-letters-page standard-page-container">
            <PageHeader
                title="Offer Letters"
                count={offerLettersData?.pagination?.total || 0}
                subtitle="Manage all offer letters in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Job" },
                    { title: "Offer Letters" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search offer letters..."
                onAdd={handleAddLetter}
                addText="Add Offer Letter"
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <OfferLetterList
                    offerLetters={offerLettersData?.data || []}
                    onEdit={handleEditLetter}
                    onDelete={async (record) => {
                        try {
                            await deleteOfferLetter(record.id).unwrap();
                            message.success('Offer letter deleted successfully');
                            refetch();
                        } catch (e) {
                            message.error('Failed to delete offer letter');
                        }
                    }}
                    loading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: offerLettersData?.pagination?.total || 0,
                        onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
                    }}
                />
            </Card>

            {isFormVisible && (
                <CreateOfferLetter
                    open={isFormVisible}
                    onCancel={() => setIsFormVisible(false)}
                    onSubmit={() => { setIsFormVisible(false); refetch(); }}
                    initialValues={selectedLetter}
                    isEditing={isEditing}
                />
            )}
        </div>
    );
};

export default OfferLetters;
