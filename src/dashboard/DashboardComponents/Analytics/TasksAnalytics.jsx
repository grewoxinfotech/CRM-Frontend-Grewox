import React from 'react';
import { Card, Row, Col } from 'antd';
import { Pie, Column, DualAxes } from '@ant-design/plots';

const TasksAnalytics = ({ tasks }) => {
    // Process tasks data for status distribution
    const statusData = tasks?.reduce((acc, task) => {
        const status = task.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const statusPieData = Object.entries(statusData || {}).map(([status, count]) => ({
        type: status,
        value: count
    }));

    // Process tasks data for priority distribution
    const priorityData = tasks?.reduce((acc, task) => {
        const priority = task.priority || 'unknown';
        const status = task.status || 'unknown';
        acc[priority] = acc[priority] || {};
        acc[priority][status] = (acc[priority][status] || 0) + 1;
        return acc;
    }, {});

    const priorityColumnData = Object.entries(priorityData || {}).flatMap(([priority, statuses]) =>
        Object.entries(statuses).map(([status, count]) => ({
            priority,
            status,
            count
        }))
    );

    // Process tasks data for timeline
    const timelineData = tasks?.map(task => ({
        task: task.taskName,
        start: new Date(task.startDate).getTime(),
        end: new Date(task.dueDate).getTime(),
        status: task.status
    })) || [];

    const pieConfig = {
        data: statusPieData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            type: 'outer'
        },
        interactions: [{ type: 'element-active' }],
        color: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f']
    };

    const columnConfig = {
        data: priorityColumnData,
        isGroup: true,
        xField: 'priority',
        yField: 'count',
        seriesField: 'status',
        color: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'],
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        }
    };

    const timelineConfig = {
        data: [timelineData],
        xField: 'task',
        yField: ['start', 'end'],
        meta: {
            start: {
                alias: 'Start Date',
            },
            end: {
                alias: 'Due Date',
            },
        }
    };

    return (
        <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
                <Card title="Task Status Distribution">
                    <Pie {...pieConfig} />
                </Card>
            </Col>
            <Col xs={24} lg={12}>
                <Card title="Tasks by Priority and Status">
                    <Column {...columnConfig} />
                </Card>
            </Col>
            <Col span={24}>
                <Card title="Task Timeline">
                    <DualAxes {...timelineConfig} />
                </Card>
            </Col>
        </Row>
    );
};

export default TasksAnalytics; 