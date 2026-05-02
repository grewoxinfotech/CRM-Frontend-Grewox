import React, { useState } from "react";
import {
    Card,
    message,
    Modal,
} from "antd";
import {
    FiPlus,
    FiDownload,
    FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import CreateCompanyInquiry from "./CreateCompanyInquiry";
import CompanyInquiryList from "./CompanyInquiryList";
import EditCompanyInquiry from "./EditCompanyInquiry";
import "./CompanyInquiry.scss";
import {
    useGetCompanyInquiriesQuery,
    useDeleteCompanyInquiryMutation,
} from "./services/companyInquiryApi";
import PageHeader from "../../../../components/PageHeader";

const CompanyInquiry = () => {
    const [searchText, setSearchText] = useState("");
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const {
        data: inquiriesData,
        isLoading,
        refetch
    } = useGetCompanyInquiriesQuery();

    const [deleteInquiry] = useDeleteCompanyInquiryMutation();

    const handleExport = async (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="company-inquiry-page standard-page-container">
            <PageHeader
                title="Company Inquiries"
                count={inquiriesData?.data?.length || 0}
                subtitle="Manage all company inquiries in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
                    { title: "Company Inquiries" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search inquiries..."
                onAdd={() => { setSelectedInquiry(null); setCreateModalVisible(true); }}
                addText="New Inquiry"
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
                <CompanyInquiryList
                    data={inquiriesData?.data || []}
                    loading={isLoading}
                    onEdit={(record) => { setSelectedInquiry(record); setEditModalVisible(true); }}
                    onView={(record) => {}}
                    onDelete={(record) => {
                        Modal.confirm({
                            title: "Delete Inquiry",
                            content: "Are you sure?",
                            onOk: async () => {
                                await deleteInquiry(record._id || record.id).unwrap();
                                message.success("Deleted successfully");
                                refetch();
                            }
                        });
                    }}
                    searchText={searchText}
                />
            </Card>

            <CreateCompanyInquiry
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
            />

            <EditCompanyInquiry
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setSelectedInquiry(null);
                }}
                initialValues={selectedInquiry}
            />
        </div>
    );
};

export default CompanyInquiry;
