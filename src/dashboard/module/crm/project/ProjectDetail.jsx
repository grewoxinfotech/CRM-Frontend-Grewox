import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Tabs, Breadcrumb, Button, Typography } from 'antd';
import {
    FiArrowLeft, FiHome, FiBriefcase, FiUsers, FiFile,
    FiFlag, FiCheckSquare, FiFileText, FiDollarSign,
    FiCreditCard, FiBookmark, FiActivity
} from 'react-icons/fi';
import { useGetProjectByIdQuery } from './services/projectApi';
import ProjectOverview from './overview';
import ProjectMember from './overview/projectMember';
import ProjectFiles from './overview/files';
import ProjectMilestones from './overview/milestones';
import ProjectTasks from './overview/tasks';
import ProjectInvoices from './overview/invoices';
import ProjectExpenses from './overview/expenses';
import ProjectEstimates from './overview/estimates';
import ProjectPayments from './overview/payments';
import ProjectNotes from './overview/notes';
import ProjectActivity from './overview/activity';
import './project.scss';
import PageHeader from "../../../../components/PageHeader";

const { Title, Text } = Typography;

const ProjectDetail = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { data: project, isLoading } = useGetProjectByIdQuery(projectId);

    const items = [
        {
            key: 'overview',
            label: (
                <span>
                    <FiBriefcase /> Overview
                </span>
            ),
            children: <ProjectOverview project={project?.data} />,
        },
        {
            key: 'members',
            label: (
                <span>
                    <FiUsers /> Project Members
                </span>
            ),
            children: <ProjectMember project={project?.data} />,
        },
        {
            key: 'files',
            label: (
                <span>
                    <FiFile /> Files
                </span>
            ),
            children: <ProjectFiles project={project?.data} />,
        },
        {
            key: 'milestones',
            label: (
                <span>
                    <FiFlag /> Milestones
                </span>
            ),
            children: <ProjectMilestones project={project?.data} />,
        },
        {
            key: 'tasks',
            label: (
                <span>
                    <FiCheckSquare /> Tasks
                </span>
            ),
            children: <ProjectTasks project={project?.data} />,
        },
        {
            key: 'invoices',
            label: (
                <span>
                    <FiFileText /> Invoices
                </span>
            ),
            children: <ProjectInvoices project={project?.data} />,
        },
        {
            key: 'expenses',
            label: (
                <span>
                    <FiDollarSign /> Expenses
                </span>
            ),
            children: <ProjectExpenses project={project?.data} />,
        },
        {
            key: 'estimates',
            label: (
                <span>
                    <FiFileText /> Estimates
                </span>
            ),
            children: <ProjectEstimates project={project?.data} />,
        },
        {
            key: 'payments',
            label: (
                <span>
                    <FiCreditCard /> Payments
                </span>
            ),
            children: <ProjectPayments project={project?.data} />,
        },
        {
            key: 'notes',
            label: (
                <span>
                    <FiBookmark /> Notes
                </span>
            ),
            children: <ProjectNotes project={project?.data} />,
        },
        {
            key: 'activity',
            label: (
                <span>
                    <FiActivity /> Activity
                </span>
            ),
            children: <ProjectActivity project={project?.data} />,
        },
    ];

    return (
        <div className="project-page">
            <PageHeader
                title={project?.data?.project_name || 'Project Details'}
                subtitle="Manage project details and activities"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/dashboard">
                                <FiHome style={{ marginRight: "4px" }} /> Home
                            </Link>
                        )
                    },
                    {
                        title: (
                            <Link to="/dashboard/crm/project">
                                <FiBriefcase style={{ marginRight: "4px" }} /> Projects
                            </Link>
                        )
                    },
                    {
                        title: project?.data?.project_name || 'Project Details'
                    }
                ]}
                extraActions={
                    <Button
                        type="primary"
                        icon={<FiArrowLeft />}
                        onClick={() => navigate('/dashboard/crm/project')}
                        style={{
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            height: '30px',
                            padding: '0 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '8px',
                            fontWeight: '500'
                        }}
                    >
                        Back
                    </Button>
                }
            />

            <Card loading={isLoading}>
                <Tabs
                    defaultActiveKey="overview"
                    items={items}
                    className="project-tabs"
                    type="card"
                    size="large"
                    animated={{ inkBar: true, tabPane: true }}
                />
            </Card>
        </div>
    );
};

export default ProjectDetail; 