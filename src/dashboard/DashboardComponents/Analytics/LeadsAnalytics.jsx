import React from 'react';
import { Card, Row, Col } from 'antd';
import { Area, Pie, Gauge } from '@ant-design/plots';

const LeadsAnalytics = ({ leads }) => {
    // Process leads data for value over time
    const valueOverTime = leads?.map(lead => ({
        date: new Date(lead.createdAt).toLocaleDateString(),
        value: lead.leadValue || 0
    })) || [];

    // Process leads data for interest level distribution
    const interestData = leads?.reduce((acc, lead) => {
        const level = lead.interest_level || 'unknown';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});

    const interestPieData = Object.entries(interestData || {}).map(([level, count]) => ({
        type: level,
        value: count
    }));

    // Calculate conversion rate
    const totalLeads = leads?.length || 0;
    const convertedLeads = leads?.filter(lead => lead.is_converted)?.length || 0;
    const conversionRate = totalLeads ? (convertedLeads / totalLeads) : 0;

    const areaConfig = {
        data: valueOverTime,
        xField: 'date',
        yField: 'value',
        smooth: true,
        areaStyle: {
            fill: 'l(270) 0:#ffffff 0.5:#95de64 1:#52c41a',
        }
    };

    const pieConfig = {
        data: interestPieData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer'
        },
        interactions: [{ type: 'element-active' }],
        color: ['#52c41a', '#faad14', '#ff4d4f']
    };

    const gaugeConfig = {
        percent: conversionRate,
        range: {
            color: 'l(0) 0:#ff4d4f 0.5:#faad14 1:#52c41a',
        },
        indicator: {
            pointer: {
                style: {
                    stroke: '#D0D0D0',
                },
            },
            pin: {
                style: {
                    stroke: '#D0D0D0',
                },
            },
        },
        statistic: {
            content: {
                formatter: ({ percent }) => `${(percent * 100).toFixed(1)}%`,
                style: {
                    fontSize: '24px',
                }
            },
        },
    };

    return (
        <Row gutter={[24, 24]}>
            <Col span={24}>
                <Card title="Lead Value Trend">
                    <Area {...areaConfig} />
                </Card>
            </Col>
            <Col xs={24} lg={12}>
                <Card title="Interest Level Distribution">
                    <Pie {...pieConfig} />
                </Card>
            </Col>
            <Col xs={24} lg={12}>
                <Card title="Lead Conversion Rate">
                    <Gauge {...gaugeConfig} />
                </Card>
            </Col>
        </Row>
    );
};

export default LeadsAnalytics; 