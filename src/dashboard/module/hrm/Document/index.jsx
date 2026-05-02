import React, { useState } from "react";
import { message, Space, Button, Dropdown, Menu } from "antd";
import { FiPlus, FiDownload, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./document.scss";
import moment from "moment";
import * as XLSX from "xlsx";
import CreateDocument from "./CreateDocument";
import DocumentList from "./DocumentList";
import { useGetDocumentsQuery, useDeleteDocumentMutation } from "./services/documentApi";
import PageHeader from "../../../../components/PageHeader";

const Document = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const { data: response, isLoading } = useGetDocumentsQuery({
    page: currentPage,
    pageSize,
    search: searchText
  });

  const documents = response?.message?.data || [];
  const pagination = response?.message?.pagination || { total: 0, current: 1, pageSize: 10 };

  const handleEditDocument = (document) => {
    setSelectedDocument(document);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteDocument(id).unwrap();
      message.success("Document deleted successfully");
    } catch (error) {
      message.error(error.data?.message || "Failed to delete document");
    }
  };

  const handleExport = (type) => {
    const formattedData = documents.map(doc => ({
      'Name': doc.name || '-',
      'Role': doc.role || '-',
      'Description': doc.description || '-',
      'Created By': doc.created_by || '-',
      'Created Date': doc.createdAt ? moment(doc.createdAt).format('DD-MM-YYYY') : '-',
    }));
    if (type === 'excel') {
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Documents');
      XLSX.writeFile(wb, `documents_${moment().format('DD-MM-YYYY')}.xlsx`);
    }
    message.success(`Successfully exported as ${type.toUpperCase()}`);
  };

  const exportMenu = (
    <Menu>
      <Menu.Item key="excel" onClick={() => handleExport('excel')}>Excel</Menu.Item>
    </Menu>
  );

  return (
    <div className="document-page standard-page-container">
      <PageHeader
        title="Documents"
        subtitle="Manage all documents in the organization"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{ marginRight: "4px" }} /> Home</Link> },
          { title: "Documents" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        onAdd={() => { setSelectedDocument(null); setIsEditing(false); setIsFormVisible(true); }}
        addText="Create Document"
        extraActions={[
          <Dropdown key="export" overlay={exportMenu} trigger={['click']}>
            <Button icon={<FiDownload />}>Export</Button>
          </Dropdown>
        ]}
      />

      <div className="standard-content-card" style={{ marginTop: '12px' }}>
        <DocumentList
          loading={isLoading || isDeleting}
          documents={documents}
          pagination={pagination}
          onEdit={handleEditDocument}
          onDelete={handleDeleteConfirm}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <CreateDocument
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        onSubmit={() => setIsFormVisible(false)}
        initialValues={selectedDocument}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Document;
