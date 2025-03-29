import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Menu,
  Row,
  Col,
  Breadcrumb,
  Table,
  List,
  Empty,
  Spin,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiGrid,
  FiList,
  FiHome,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiMessageSquare,
} from "react-icons/fi";
import "./notes.scss";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CreateCompany from "./createNotes";

import CompanyList from "./NotesList";
import {
  useGetAllNotesQuery,
  useDeleteNotesMutation,
} from "../../../../../../superadmin/module/notes/services/notesApi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import CreateNotes from "./createNotes";
import EditNotes from "./EditNotes";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const DealNotes = (deal) => {
  const id = deal.deal?.id;
  const [deleteNotes, { isLoading: isDeleting }] = useDeleteNotesMutation();
  const user = useSelector(selectCurrentUser);

  const {
    data: notesData = [],
    isLoading: isLoadingNotes,
    refetch,
  } = useGetAllNotesQuery(id || "");

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filteredNotes, setFilteredNotes] = useState([]);

  // Transform and filter notes data
  useEffect(() => {
    if (notesData) {
      let notes = notesData.map((note) => ({
        id: note.id,
        note_title: note.note_title || "N/A",
        description: note.description || "N/A",
        created_by: note.created_by || "N/A",
        created_at: note.createdAt || "-",
      }));

      if (searchText) {
        notes = notes.filter(
          (note) =>
            note.note_title.toLowerCase().includes(searchText.toLowerCase()) ||
            note.description.toLowerCase().includes(searchText.toLowerCase()) ||
            note.created_by.toLowerCase().includes(searchText.toLowerCase())
        );
      }

      setFilteredNotes(notes);
    }
  }, [notesData, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleDeleteNote = (id) => {
    Modal.confirm({
      title: "Delete Note",
      content: "Are you sure you want to delete this note?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteNotes(id).unwrap();
          message.success("Note deleted successfully");
          refetch();
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete note");
        }
      },
    });
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setEditModalVisible(true);
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "note_title",
      key: "note_title",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Text ellipsis={{ tooltip: text }}>
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </Text>
      ),
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Action",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                icon: <FiEdit2 />,
                label: "Edit",
                onClick: () => handleEditNote(record),
              },
              {
                key: "delete",
                icon: <FiTrash2 />,
                label: "Delete",
                onClick: () => handleDeleteNote(record.id),
                danger: true,
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="notes-page">
      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Notes</Title>
          <Text type="secondary">Manage all notes</Text>
        </div>
        <Row justify="center" className="header-actions-wrapper">
          <Col xs={24} sm={24} md={20} lg={16} xl={14}>
            <div className="header-actions">
              <Input
                prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                placeholder="Search notes..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
              />
              <Button
                type="primary"
                icon={<FiPlus size={16} />}
                onClick={() => setCreateModalVisible(true)}
                className="add-button"
              >
                Add Note
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      <Card className="notes-table-card">
        <Table
          columns={columns}
          dataSource={filteredNotes}
          rowKey="id"
          loading={isLoadingNotes}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} notes`,
          }}
        />
      </Card>

      <CreateNotes
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        dealId={id}
        currentUser={user}
      />

      <EditNotes
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
        dealId={id}
      />
    </div>
  );
};

export default DealNotes;
