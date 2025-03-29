import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Tabs, Breadcrumb, Button, Typography } from 'antd';
import {
    FiArrowLeft, FiHome, FiBriefcase, FiUsers, FiFile,
    FiFlag, FiCheckSquare, FiFileText, FiDollarSign,
    FiCreditCard, FiBookmark, FiActivity
} from 'react-icons/fi';

import DealOverview from './overview';
import DealMember from './overview/dealMember';
import DealFiles from './overview/files';

// import DealTasks from './overview/tasks';
import DealInvoices from './overview/invoices';

import DealPayments from './overview/payments';
import DealNotes from './overview/notes';
import DealActivity from './overview/activity';
import './deal.scss';
import { useGetDealsQuery } from './services/DealApi';

const { Title, Text } = Typography;

const DealDetail = () => {
    const { dealId } = useParams();

    // console.log("dealId",dealId);
    const navigate = useNavigate();
    const { data, isLoading, error } = useGetDealsQuery();

    const deals = Array.isArray(data) ? data : [];

    const deal = deals.find(deal => deal.id === dealId);


    const items = [
        {
            key: 'overview',
            label: (
                <span>
                    <FiBriefcase /> Overview
                </span>
            ),
            children: <DealOverview deal={deal} />,
        },
        {
            key: 'members',
            label: (
                <span>
                    <FiUsers /> Deal Members
                </span>
            ),
            children: <DealMember deal={deal} />,
        },
        {
            key: 'files',
            label: (
                <span>
                    <FiFile /> Files
                </span>
            ),
            children: <DealFiles deal={deal} />,
        },
        // {
        //     key: 'tasks',
        //     label: (
        //         <span>
        //             <FiCheckSquare /> Tasks
        //         </span>
        //     ),
        //     children: <DealTasks deal={deal} />,
        // },
        {
            key: 'invoices',
            label: (
                <span>
                    <FiFileText /> Invoices
                </span>
            ),
            children: <DealInvoices deal={deal} />,
        },
        
        {
            key: 'payments',
            label: (
                <span>
                    <FiCreditCard /> Payments
                </span>
            ),
            children: <DealPayments deal={deal} />,
        },
        {
            key: 'notes',
            label: (
                <span>
                    <FiBookmark /> Notes
                </span>
            ),
            children: <DealNotes deal={deal} />,
        },
        {
            key: 'activity',
            label: (
                <span>
                    <FiActivity /> Activity
                </span>
            ),
            children: <DealActivity deal={deal} />,
        },
    ];

    return (
        <div className="project-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome /> Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm/deal">
                            <FiBriefcase /> Deals
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {deal?.data?.deal_name || 'Deal Details'}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <Title level={2}>{deal?.data?.deal_name || 'Deal Details'}</Title>
                    <Text type="secondary" className="subtitle">
                        Manage deal details and activities
                    </Text>
                </div>
                <div className="header-right">
                    <Button
                        type="primary"
                        icon={<FiArrowLeft />}
                        onClick={() => navigate('/dashboard/crm/deal')}
                        style={{
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            height: '44px',
                            padding: '0 24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '10px',
                            fontWeight: '500'
                        }}
                    >
                        Back to Deals
                    </Button>
                </div>
            </div>

            <Card loading={isLoading}>
                <Tabs
                    defaultActiveKey="overview"
                    items={items}
                    className="deal-tabs"
                    type="card"
                    size="large"
                    animated={{ inkBar: true, tabPane: true }}
                />
            </Card>
        </div>
    );
};

export default DealDetail; 