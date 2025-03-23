import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Breadcrumb, Button } from 'antd';
import {
    FiArrowLeft, FiHome, FiBriefcase, FiUsers, FiFile,
    FiFlag, FiCheckSquare, FiFileText, FiDollarSign,
    FiCreditCard, FiBookmark, FiPackage, FiActivity
} from 'react-icons/fi';
import { useGetProjectByIdQuery } from './services/projectApi';
import ProjectOverview from './overview';
import './project.scss';

const ProjectDetail = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { data: project, isLoading } = useGetProjectByIdQuery(projectId);

    const items = [
        {
            key: 'overview',
            label: 'Overview',
            icon: <FiBriefcase />,
            children: <ProjectOverview project={project?.data} />,
        },
        {
            key: 'members',
            label: 'Project Members',
            icon: <FiUsers />,
            children: 'Project Members Content',
        },
        {
            key: 'files',
            label: 'Files',
            icon: <FiFile />,
            children: 'Files Content',
        },
        {
            key: 'milestones',
            label: 'Milestones',
            icon: <FiFlag />,
            children: 'Milestones Content',
        },
        {
            key: 'tasks',
            label: 'Tasks',
            icon: <FiCheckSquare />,
            children: 'Tasks Content',
        },
        {
            key: 'invoices',
            label: 'Invoices',
            icon: <FiFileText />,
            children: 'Invoices Content',
        },
        {
            key: 'expenses',
            label: 'Expenses',
            icon: <FiDollarSign />,
            children: 'Expenses Content',
        },
        {
            key: 'estimates',
            label: 'Estimates',
            icon: <FiFileText />,
            children: 'Estimates Content',
        },
        {
            key: 'payments',
            label: 'Payments',
            icon: <FiCreditCard />,
            children: 'Payments Content',
        },
        {
            key: 'notes',
            label: 'Notes',
            icon: <FiBookmark />,
            children: 'Notes Content',
        },
        {
            key: 'products',
            label: 'Products & Services',
            icon: <FiPackage />,
            children: 'Products & Services Content',
        },
        {
            key: 'activity',
            label: 'Activity',
            icon: <FiActivity />,
            children: 'Activity Content',
        },
    ];

    return (
        <div className="project-detail-page">
            <div className="page-header">
                <div className="header-content">
                    <Button
                        type="text"
                        icon={<FiArrowLeft />}
                        onClick={() => navigate('/dashboard/crm/project')}
                        className="back-button"
                    />
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <FiHome /> Home
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <FiBriefcase /> Projects
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {project?.data?.project_name || 'Project Details'}
                        </Breadcrumb.Item>
                    </Breadcrumb>
                </div>
            </div>

            <Card loading={isLoading}>
                <Tabs
                    defaultActiveKey="overview"
                    items={items}
                    className="project-tabs"
                    tabPosition="left"
                    style={{ minHeight: '600px' }}
                />
            </Card>
        </div>
    );
};

export default ProjectDetail; 