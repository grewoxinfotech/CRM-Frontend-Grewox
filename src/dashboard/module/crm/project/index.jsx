import React, { useState } from 'react';
import {
    Card,
    message,
    Modal,
    Select
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './project.scss';
import { useGetAllProjectsQuery, useCreateProjectMutation } from './services/projectApi';
import CreateProjectModal from './CreateProjectModal';
import ProjectCard from './ProjectCard';
import { Link } from 'react-router-dom';
import PageHeader from "../../../../components/PageHeader";

const { Option } = Select;

const Project = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const { data: projects, isLoading } = useGetAllProjectsQuery();
    const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

    const handleCreateSubmit = async (values) => {
        try {
            await createProject(values).unwrap();
            message.success('Project created successfully');
            setIsModalOpen(false);
        } catch (error) {
            message.error(error.message || 'Failed to create project');
        }
    };

    const getStatuses = () => {
        if (!projects?.data) return [];
        return [...new Set(projects.data.map(p => p.status))].filter(Boolean);
    };

    const filteredProjects = () => {
        if (!projects?.data) return [];
        return projects.data.filter(p => {
            const matchesSearch = p.project_name.toLowerCase().includes(searchText.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
            const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    };

    return (
        <div className="project-page standard-page-container">
            <PageHeader
                title="Projects"
                count={projects?.data?.length || 0}
                subtitle="Manage all projects in the system"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Projects" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search projects..."
                onAdd={() => { setSelectedProject(null); setIsModalOpen(true); }}
                addText="Add Project"
                isSearchVisible={isSearchVisible}
                onSearchVisibleChange={setIsSearchVisible}
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => {} },
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => {} },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => {} },
                    ]
                }}
                extraActions={
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Select
                            defaultValue="all"
                            style={{ width: 130, height: '30px' }}
                            onChange={setSelectedStatus}
                            size="small"
                        >
                            <Option value="all">All Status</Option>
                            {getStatuses().map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                    </div>
                }
            />

            <Card className="standard-content-card">
                <ProjectCard
                    projects={filteredProjects()}
                    loading={isLoading}
                    onEdit={setSelectedProject}
                    onDelete={(p) => {
                        Modal.confirm({
                            title: 'Delete Project',
                            content: 'Are you sure?',
                            onOk: () => {}
                        });
                    }}
                    onView={setSelectedProject}
                    searchText={searchText}
                />
            </Card>

            <CreateProjectModal
                visible={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onSubmit={handleCreateSubmit}
                loading={isCreating}
            />
        </div>
    );
};

export default Project;