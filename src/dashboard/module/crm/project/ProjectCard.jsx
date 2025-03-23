import React from 'react';
import { Card, Tag, Button, Tooltip, Avatar, Dropdown, Empty } from 'antd';
import {
    FiEdit2, FiTrash2, FiEye, FiCalendar,
    FiUser, FiMoreVertical, FiDollarSign
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ projects = [], loading, onEdit, onDelete, onView, searchText }) => {
    const navigate = useNavigate();

    const getDropdownItems = (project) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(project),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(project),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete(project),
                danger: true,
            },
        ],
    });

    const filteredProjects = projects?.filter(project =>
        project.project_name?.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    const handleCardClick = (project) => {
        navigate(`/dashboard/crm/project/${project.id}`);
    };

    if (!loading && (!filteredProjects || filteredProjects.length === 0)) {
        return (
            <div className="project-empty">
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <span>
                            {searchText ? 'No projects found matching your search' : 'No projects available'}
                        </span>
                    }
                />
            </div>
        );
    }

    return (
        <div className="project-grid">
            {filteredProjects.map((project) => (
                <Card
                    key={project.id}
                    className="project-card"
                    bordered={false}
                    onClick={() => handleCardClick(project)}
                    style={{ cursor: 'pointer' }}
                >
                    <div className="project-card-header">
                        <div className="project-main-info">
                            <Avatar
                                size={64}
                                icon={<FiUser />}
                                className="project-avatar"
                            />
                            <div className="project-info">
                                <h3>{project.project_name}</h3>
                                <Tag color={
                                    project.status === 'completed' ? 'success' :
                                        project.status === 'in-progress' ? 'processing' :
                                            'warning'
                                }>
                                    {project.status}
                                </Tag>
                            </div>
                        </div>

                        <Dropdown
                            menu={getDropdownItems(project)}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayClassName="project-actions-dropdown"
                        >
                            <Button
                                type="text"
                                icon={<FiMoreVertical />}
                                className="action-dropdown-button"
                                onClick={(e) => e.preventDefault()}
                            />
                        </Dropdown>
                    </div>

                    <div className="project-details">
                        <div className="detail-item">
                            <FiCalendar className="detail-icon" />
                            <Tooltip title="Project Duration">
                                <span className="detail-text">
                                    {new Date(project.startDate).toLocaleDateString()} -
                                    {new Date(project.endDate).toLocaleDateString()}
                                </span>
                            </Tooltip>
                        </div>
                        <div className="detail-item">
                            <FiDollarSign className="detail-icon" />
                            <span className="detail-text">
                                ${project.budget.toLocaleString()}
                            </span>
                        </div>
                        <div className="detail-item">
                            <FiUser className="detail-icon" />
                            <span className="detail-text">
                                {project.project_members?.length || 0} Members
                            </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default ProjectCard; 