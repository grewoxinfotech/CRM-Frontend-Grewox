import React, { useState, useCallback } from "react";
import {
    Card,
    message,
} from "antd";
import {
    FiPlus,
    FiDownload,
    FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import CustomFormList from "./CustomFormList";
import CreateCustomForm from "./CreateCustomForm";
import EditCustomForm from "./EditCustomForm";
import GenerateLinkModal from "./GenerateLinkModal";
import {
    useGetCustomFormsQuery,
    useCreateCustomFormMutation,
    useUpdateCustomFormMutation,
    useDeleteCustomFormMutation,
} from "./services/customFormApi";
import "./CustomForm.scss";
import PageHeader from "../../../../components/PageHeader";

const CustomFormPage = () => {
    const [searchText, setSearchText] = useState("");
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [generateLinkModalVisible, setGenerateLinkModalVisible] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [loading, setLoading] = useState(false);

    const {
        data: formsData,
        isLoading,
        refetch
    } = useGetCustomFormsQuery();

    const [createForm] = useCreateCustomFormMutation();
    const [updateForm] = useUpdateCustomFormMutation();
    const [deleteForm] = useDeleteCustomFormMutation();

    const forms = Array.isArray(formsData?.data) ? formsData.data : [];

    const handleCreate = async (values) => {
        try {
            await createForm(values).unwrap();
            message.success("Custom form created successfully");
            setCreateModalVisible(false);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || "Failed to create custom form");
        }
    };

    const handleEditClick = useCallback((record) => {
        setSelectedForm(record);
        setIsEditModalOpen(true);
    }, []);

    const handleEditSubmit = useCallback(async (values) => {
        try {
            const { id, ...data } = values;
            await updateForm({ id, data }).unwrap();
            message.success('Form updated successfully');
            setIsEditModalOpen(false);
        } catch (error) {
            message.error(error?.data?.message || 'Failed to update form');
        }
    }, [updateForm]);

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="custom-form-container standard-page-container">
            <PageHeader
                title="Custom Forms"
                count={forms.length}
                subtitle="Manage all custom forms in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
                    { title: "CRM" },
                    { title: "Custom Forms" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search forms..."
                onAdd={() => setCreateModalVisible(true)}
                addText="Create Form"
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <CustomFormList
                    data={forms}
                    loading={isLoading}
                    onEdit={handleEditClick}
                    onDelete={(record) => {
                        const recordId = record._id || record.id;
                        Modal.confirm({
                            title: "Delete Custom Form",
                            content: "Are you sure?",
                            onOk: async () => {
                                try {
                                    await deleteForm(recordId).unwrap();
                                    message.success("Deleted successfully");
                                    refetch();
                                } catch (error) {
                                    message.error("Failed to delete");
                                }
                            }
                        });
                    }}
                    onGenerateLink={(record) => {
                        setSelectedForm(record);
                        setGenerateLinkModalVisible(true);
                    }}
                    searchText={searchText}
                />
            </Card>

            <CreateCustomForm
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                onSubmit={handleCreate}
                loading={loading}
            />

            <EditCustomForm
                open={isEditModalOpen}
                onCancel={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                loading={loading}
                initialValues={selectedForm}
            />

            <GenerateLinkModal
                open={generateLinkModalVisible}
                onCancel={() => {
                    setGenerateLinkModalVisible(false);
                    setSelectedForm(null);
                }}
                formData={selectedForm}
            />
        </div>
    );
};

export default CustomFormPage;
