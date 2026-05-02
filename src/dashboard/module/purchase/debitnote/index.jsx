import React, { useState } from "react";
import {
  Card,
  message,
  Modal,
  Alert,
} from "antd";
import {
  FiPlus,
  FiDownload,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import DebitNoteList from "./DebitNoteList";
import CreateDebitNote from "./CreateDebitNote";
import "./debitnote.scss";
import {
  useGetDebitNotesQuery,
  useDeleteDebitNoteMutation,
} from "./services/debitnoteApi";
import { useSelector } from "react-redux";
import PageHeader from "../../../../components/PageHeader";

const getCompanyId = (state) => {
  const user = state.auth.user;
  return user?.companyId || user?.company_id || user?.id;
};

const DebitNote = () => {
  const companyId = useSelector(getCompanyId);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const {
    data: debitNotes,
    isLoading,
    refetch,
  } = useGetDebitNotesQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    search: searchText,
    company_id: companyId
  }, {
    skip: !companyId
  });

  const [deleteDebitNote] = useDeleteDebitNoteMutation();

  const handleExport = async (type) => {
    message.info(`Exporting as ${type.toUpperCase()}...`);
  };

  return (
    <div className="debitnote-page standard-page-container">
      <PageHeader
        title="Debit Notes"
        count={debitNotes?.pagination?.total || 0}
        subtitle="Manage all debit notes in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Purchase" },
          { title: "Debit Notes" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        searchPlaceholder="Search debit notes..."
        onAdd={() => setIsCreateModalVisible(true)}
        addText="Add Debit Note"
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

      {!companyId && (
        <Alert
          message="Warning"
          description="Company ID not found. Some features may not work properly."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card className="standard-content-card">
        <DebitNoteList
          debitNotes={debitNotes?.data || []}
          onEdit={(record) => console.log('Edit:', record)}
          onDelete={(record) => {
            Modal.confirm({
              title: "Delete Debit Note",
              content: "Are you sure?",
              onOk: async () => {
                await deleteDebitNote(record.id || record._id).unwrap();
                message.success("Deleted successfully");
                refetch();
              },
            });
          }}
          onView={(record) => console.log('View:', record)}
          searchText={searchText}
          loading={isLoading}
          pagination={pagination}
          onChange={(newPagination) => setPagination(prev => ({ ...prev, current: newPagination.current, pageSize: newPagination.pageSize }))}
        />
      </Card>

      <CreateDebitNote
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
      />
    </div>
  );
};

export default DebitNote;
