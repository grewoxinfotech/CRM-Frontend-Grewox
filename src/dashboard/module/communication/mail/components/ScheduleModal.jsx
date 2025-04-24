import React from 'react';
import { Modal, Space, DatePicker, TimePicker, Button, Typography, Row, Col, Form } from 'antd';
import { FiCalendar, FiClock, FiCheck, FiX } from 'react-icons/fi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Add UTC and timezone plugins to dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;

const ScheduleModal = ({
  visible,
  onCancel,
  onConfirm,
  scheduleDate,
  setScheduleDate,
  scheduleTime,
  setScheduleTime
}) => {
  const handleConfirm = () => {
    if (scheduleDate && scheduleTime) {
      // Get the local timezone offset in minutes
      const timezoneOffset = new Date().getTimezoneOffset();
      
      // Combine date and time
      const combinedDateTime = dayjs(scheduleDate)
        .hour(scheduleTime.hour())
        .minute(scheduleTime.minute())
        .second(0);

      // Add the timezone offset to compensate for UTC conversion
      const adjustedDateTime = combinedDateTime.add(timezoneOffset, 'minute');
      
      // Convert to UTC ISO string
      const utcDateTime = adjustedDateTime.toISOString();
      
      onConfirm(scheduleDate, scheduleTime, utcDateTime);
    }
  };

  return (
    <Modal
      title={
        <div className="schedule-header">
          <FiCalendar className="header-icon" />
          <span>Schedule Email</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      className="schedule-modal"
      bodyStyle={{ padding: '0' }}
    >
      <div className="schedule-body">
        <div className="schedule-content">
          <Title level={5} className="schedule-title">When would you like to send this email?</Title>
          <Text type="secondary" className="schedule-description">
            Select a date and time to schedule your email for later delivery.
          </Text>
          
          <Form layout="vertical" className="schedule-form">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item 
                  label="Date" 
                  className="schedule-form-item"
                >
                  <DatePicker
                    value={scheduleDate}
                    onChange={setScheduleDate}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                    style={{ width: '100%' }}
                    placeholder="Select date"
                    format="YYYY-MM-DD"
                    showToday={true}
                    className="schedule-datepicker"
                    suffixIcon={<FiCalendar className="picker-icon" />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item 
                  label="Time" 
                  className="schedule-form-item"
                >
                  <TimePicker
                    value={scheduleTime}
                    onChange={setScheduleTime}
                    format="hh:mm A"
                    style={{ width: '100%' }}
                    placeholder="Select time"
                    minuteStep={1}
                    use12Hours={true}
                    showNow={true}
                    allowClear={true}
                    inputReadOnly={true}
                    popupClassName="time-picker-popup"
                    hideDisabledOptions={true}
                    className="schedule-timepicker"
                    suffixIcon={<FiClock className="picker-icon" />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          
          <div className="schedule-preview">
            {scheduleDate && scheduleTime ? (
              <div className="preview-content">
                <Text strong>Email will be sent on:</Text>
                <Text className="preview-date">
                  {scheduleDate.format('dddd, MMMM D, YYYY')} at {scheduleTime.format('h:mm A')}
                </Text>
              </div>
            ) : (
              <Text type="secondary">Select a date and time to see when your email will be sent.</Text>
            )}
          </div>
        </div>
        
        <div className="schedule-footer">
          <Space>
            <Button 
              type="primary" 
              onClick={handleConfirm}
              disabled={!scheduleDate || !scheduleTime}
              icon={<FiCheck />}
              className="schedule-button"
            >
              Schedule
            </Button>
            <Button 
              onClick={onCancel}
              icon={<FiX />}
              className="cancel-button"
            >
              Cancel
            </Button>
          </Space>
        </div>
      </div>

      <style jsx>{`
        .schedule-header {
          display: flex;
          align-items: center;
          padding: 16px 24px;
          background: linear-gradient(135deg, #4361ee, #4895ef);
          color: white;
          border-radius: 8px 8px 0 0;
        }
        .header-icon {
          margin-right: 12px;
          font-size: 20px;
        }
        .schedule-body {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .schedule-content {
          padding: 24px;
          flex: 1;
        }
        .schedule-title {
          margin-bottom: 8px;
          color: #333;
        }
        .schedule-description {
          display: block;
          margin-bottom: 24px;
        }
        .schedule-form {
          margin-bottom: 24px;
        }
        .schedule-form-item {
          margin-bottom: 16px;
        }
        .schedule-datepicker, .schedule-timepicker {
          height: 40px;
          border-radius: 4px;
          border: 1px solid #d9d9d9;
          transition: all 0.3s;
        }
        .schedule-datepicker:hover, .schedule-timepicker:hover {
          border-color: #4361ee;
        }
        .schedule-datepicker:focus, .schedule-timepicker:focus {
          border-color: #4361ee;
          box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
        }
        .picker-icon {
          color: #8c8c8c;
        }
        .schedule-preview {
          background-color: #f8f9fa;
          padding: 16px;
          border-radius: 4px;
          margin-top: 16px;
        }
        .preview-content {
          display: flex;
          flex-direction: column;
        }
        .preview-date {
          font-size: 16px;
          margin-top: 8px;
          color: #4361ee;
        }
        .schedule-footer {
          padding: 16px 24px;
          background-color: #f8f9fa;
          border-top: 1px solid #e8e8e8;
          display: flex;
          justify-content: flex-end;
        }
        .schedule-button {
          background: linear-gradient(135deg, #4361ee, #4895ef);
          border: none;
          height: 40px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cancel-button {
          height: 40px;
          padding: 0 24px;
        }
      `}</style>
    </Modal>
  );
};

export default ScheduleModal;