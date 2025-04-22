import React from 'react';
import { Result, Card, Descriptions, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import './FormSubmitted.scss';

const { Title, Text } = Typography;

const FormSubmitted = ({ submissionData }) => {
    const formatArrayOrObject = (value) => {
        if (!value) return 'None';
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : 'None';
        }
        if (typeof value === 'object') {
            const selectedItems = Object.entries(value)
                .filter(([_, isSelected]) => isSelected)
                .map(([item]) => item);
            return selectedItems.length > 0 ? selectedItems.join(', ') : 'None';
        }
        return value || 'None';
    };

    const renderSubmissionDetails = () => {
        if (!submissionData) return null;

        const data = typeof submissionData === 'string'
            ? JSON.parse(submissionData)
            : submissionData;

        return (
            <Card className="submission-details">
                <Descriptions
                    title="Registration Details"
                    column={1}
                    bordered
                    className="details-list"
                >
                    <Descriptions.Item label="Participant Name">
                        {data.participantName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email Address">
                        {data.emailAddress}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone Number">
                        {data.phoneNumber}
                    </Descriptions.Item>
                    <Descriptions.Item label="Experience Level">
                        {data.experienceLevel}
                    </Descriptions.Item>
                    <Descriptions.Item label="Participant Type">
                        {data.participantType}
                    </Descriptions.Item>
                    <Descriptions.Item label="Preferred Schedule">
                        {data.preferredSchedule}
                    </Descriptions.Item>
                    <Descriptions.Item label="Certificate Option">
                        {data.certificateOption}
                    </Descriptions.Item>
                    <Descriptions.Item label="Merchandise Package">
                        {data.merchandisePackage}
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Preference">
                        {data.paymentPreference}
                    </Descriptions.Item>
                    <Descriptions.Item label="Equipment Access">
                        {formatArrayOrObject(data.equipmentAccess)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dietary Restrictions">
                        {formatArrayOrObject(data.dietaryRestrictions)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cuisine Preferences">
                        {formatArrayOrObject(data.cuisinePreferences)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Workshop Sessions">
                        {formatArrayOrObject(data.workshopSessions)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Special Accommodations">
                        {data.specialAccommodations || 'None'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Additional Notes">
                        {data.additionalNotes || 'None'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        );
    };

    return (
        <div className="form-submitted-page">
            <div className="form-submitted-container">
                <Result
                    icon={<CheckCircleFilled className="success-icon" />}
                    title="Thank You!"
                    subTitle="Your registration has been submitted successfully"
                />
                <div className="success-message">
                    <Text>We have received your registration details. Please review your submission below.</Text>
                </div>
                {renderSubmissionDetails()}
                <div className="next-steps">
                    <Title level={4}>Next Steps</Title>
                    <ul>
                        <li>You will receive a confirmation email shortly.</li>
                        <li>Our team will review your registration and contact you with further details.</li>
                        <li>Please keep this information for your reference.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FormSubmitted; 