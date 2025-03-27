import React, { useState } from 'react';
import { Card, Button, Input, List, Typography, Space, Avatar } from 'antd';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const { TextArea } = Input;
const { Text } = Typography;

const LeadNotes = ({ leadId }) => {
    const [newNote, setNewNote] = useState('');
    // You'll need to implement the API calls to fetch and manage notes
    const notes = []; // Replace with actual API data

    const handleAddNote = () => {
        // Implement note creation
    };

    const handleEditNote = (noteId) => {
        // Implement note editing
    };

    const handleDeleteNote = (noteId) => {
        // Implement note deletion
    };

    return (
        <div className="lead-notes">
            <Card className="note-editor">
                <TextArea
                    rows={4}
                    placeholder="Write a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                />
                <Button
                    type="primary"
                    icon={<FiPlus />}
                    onClick={handleAddNote}
                    style={{ marginTop: 16 }}
                >
                    Add Note
                </Button>
            </Card>

            <List
                className="notes-list"
                itemLayout="vertical"
                dataSource={notes}
                renderItem={note => (
                    <Card className="note-item" key={note.id}>
                        <div className="note-header">
                            <Space>
                                <Avatar src={note.user.avatar} />
                                <div>
                                    <Text strong>{note.user.name}</Text>
                                    <Text type="secondary" style={{ display: 'block' }}>
                                        {new Date(note.timestamp).toLocaleString()}
                                    </Text>
                                </div>
                            </Space>
                            <Space>
                                <Button
                                    type="text"
                                    icon={<FiEdit2 />}
                                    onClick={() => handleEditNote(note.id)}
                                />
                                <Button
                                    type="text"
                                    danger
                                    icon={<FiTrash2 />}
                                    onClick={() => handleDeleteNote(note.id)}
                                />
                            </Space>
                        </div>
                        <div className="note-content">
                            <Text>{note.content}</Text>
                        </div>
                    </Card>
                )}
            />
        </div>
    );
};

export default LeadNotes; 