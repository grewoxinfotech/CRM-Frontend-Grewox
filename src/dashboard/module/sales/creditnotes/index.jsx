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
import CreateCreditNotes from "./CreateCreditNotes";
import CreditNotesList from "./CreditNotesList";
import EditCreditNotes from "./EditCreditNotes";
import "./creditnotes.scss";
import {
  useGetCreditNotesQuery,
  useCreateCreditNoteMutation,
  useUpdateCreditNoteMutation,
} from "./services/creditNoteApi";
import PageHeader from "../../../../components/PageHeader";

const CreditNotes = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const { data: creditNotesData, isLoading } = useGetCreditNotesQuery({
    page: currentPage,
    pageSize,
    search: searchText
  });

  const [createCreditNote] = useCreateCreditNoteMutation();
  const [updateCreditNote] = useUpdateCreditNoteMutation();

  const handleExport = (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  const handleCreateSubmit = async (values) => {
    try {
      setLoading(true);
      await createCreditNote(values).unwrap();
      message.success("Credit note created successfully");
      setIsCreateModalOpen(false);
    } catch (error) {
      message.error(error?.data?.message || "Failed to create credit note");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      setLoading(true);
      await updateCreditNote({ id: selectedCreditNote.id, ...values }).unwrap();
      message.success("Credit note updated successfully");
      setIsEditModalOpen(false);
      setSelectedCreditNote(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to update credit note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="credit-notes-page standard-page-container">
      <PageHeader
        title="Credit Notes"
        count={creditNotesData?.pagination?.total || 0}
        subtitle="Manage all credit notes in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Sales" },
          { title: "Credit Notes" },
        ]}
        searchText={searchText}
        onSearch={(val) => { setSearchText(val); setCurrentPage(1); }}
        searchPlaceholder="Search credit notes..."
        onAdd={() => setIsCreateModalOpen(true)}
        addText="Add Credit Note"
        exportMenu={{
          items: [
            { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
            { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
            { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
          ]
        }}
      />

      <Card className="standard-content-card">
        <CreditNotesList
          data={creditNotesData?.data || []}
          loading={isLoading}
          onEdit={(record) => { setSelectedCreditNote(record); setIsEditModalOpen(true); }}
          onDelete={(record) => {
            Modal.confirm({
              title: "Delete Credit Note",
              content: "Are you sure?",
              onOk: () => message.success("Deleted successfully")
            });
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total: creditNotesData?.pagination?.total || 0,
            onChange: (page) => setCurrentPage(page),
            onSizeChange: (size) => { setPageSize(size); setCurrentPage(1); }
          }}
        />
      </Card>

      <CreateCreditNotes
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={loading}
      />

      <EditCreditNotes
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedCreditNote(null);
        }}
        onSubmit={handleEditSubmit}
        creditNote={selectedCreditNote}
        loading={loading}
      />
    </div>
  );
};

export default CreditNotes;
