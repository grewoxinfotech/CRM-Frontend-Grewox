import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    DatePicker,
    InputNumber,
    Upload,
    Row,
    Col,
    Card,
    message,
    Spin
} from 'antd';
import {
    FiUser,
    FiBriefcase,
    FiDollarSign,
    FiCalendar,
    FiX,
    FiUpload,
    FiMail,
    FiFileText,
    FiMapPin
} from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import TextArea from 'antd/es/input/TextArea';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useUpdateOfferLetterMutation } from './services/offerLetterApi';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

const { Text } = Typography;
const { Option } = Select;

const EditOfferLetter = ({ open, onCancel, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [updateOfferLetter, { isLoading: updateLoading }] = useUpdateOfferLetterMutation();
    const [fileList, setFileList] = useState([]);

    const { data: jobApplications, isLoading: applicationsLoading } = useGetAllJobApplicationsQuery();
    const { data: jobs, isLoading: isLoadingJobs } = useGetAllJobsQuery();
    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    useEffect(() => {
        if (open && initialValues) {
            form.resetFields();

            // Handle file list
            if (initialValues.file) {
                setFileList([
                    {
                        uid: '-1',
                        name: initialValues.file.split('/').pop(),
                        status: 'done',
                        url: initialValues.file
                    }
                ]);
            } else {
                setFileList([]);
            }

            // Format and set form values
            const formattedValues = {
                ...initialValues,
                offer_expiry: initialValues.offer_expiry ? dayjs(initialValues.offer_expiry) : undefined,
                expected_joining_date: initialValues.expected_joining_date ? dayjs(initialValues.expected_joining_date) : undefined,
                currency: initialValues.currency?.id || initialValues.currency
            };

            form.setFieldsValue(formattedValues);
        }
    }, [open, form, initialValues]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Create payload
            const payload = {
                ...values,
                offer_expiry: values.offer_expiry ? values.offer_expiry.format('YYYY-MM-DD') : null,
                expected_joining_date: values.expected_joining_date ? values.expected_joining_date.format('YYYY-MM-DD') : null,
                salary: parseFloat(values.salary),
                status: initialValues.status || 'pending',
                client_id: localStorage.getItem('client_id'),
                created_by: localStorage.getItem('user_id')
            };

            let response;
            if (fileList?.[0]?.originFileObj) {
                const formData = new FormData();
                formData.append('file', fileList[0].originFileObj);
                Object.entries(payload).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value);
                    }
                });
                response = await updateOfferLetter({
                    id: initialValues.id,
                    data: formData
                }).unwrap();
            } else {
                response = await updateOfferLetter({
                    id: initialValues.id,
                    data: payload
                }).unwrap();
            }

            if (response.success) {
                message.success('Offer letter updated successfully');
                setFileList([]);
                form.resetFields();
                onCancel();
            } else {
                message.error(response.message || 'Failed to update offer letter');
            }
        } catch (error) {
            console.error('Failed to update offer letter:', error);
            message.error(error.data?.message || 'Failed to update offer letter');
        }
    };

    const handleFileChange = (info) => {
        setFileList(info.fileList.slice(-1));
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiFileText style={{ fontSize: '20px', color: '#1890ff' }} />
                    <span>Edit Offer Letter</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            width={800}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{ padding: "24px" }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="job"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Job Position</span>}
                        rules={[{ required: true, message: 'Please select a job position' }]}
                    >
                        <Select
                            placeholder="Select job position"
                            loading={isLoadingJobs}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {jobs?.data?.map((job) => (
                                <Option key={job.id} value={job.id}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FiBriefcase style={{ color: '#1890ff', fontSize: '16px', marginRight: '8px' }} />
                                        <span>{job.title}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="job_applicant"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Job Applicant
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select an applicant' }]}
                    >
                        <Select
                            loading={applicationsLoading}
                            placeholder="Select applicant"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                            optionFilterProp="children"
                            showSearch
                            filterOption={(input, option) =>
                                option?.children?.props?.children[1]?.props?.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        >
                            {jobApplications?.data?.map((application) => (
                                <Option key={application.id} value={application.id}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FiUser style={{ color: '#1890ff', fontSize: '16px', marginRight: '8px' }} />
                                        <span>{application.name}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="offer_expiry"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Offer Expire On
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select expiry date' }]}
                    >
                        <DatePicker
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            format="YYYY-MM-DD"
                            placeholder="Select expiry date"
                        />
                    </Form.Item>

                    <Form.Item
                        name="expected_joining_date"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Expected Joining Date
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select joining date' }]}
                    >
                        <DatePicker
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            format="YYYY-MM-DD"
                            placeholder="Select joining date"
                        />
                    </Form.Item>

                    <Form.Item
                        name="salary"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Salary
                            </span>
                        }
                        rules={[{ required: true, message: 'Please enter salary' }]}
                    >
                        <Input.Group compact>
                            <Form.Item
                                name="currency"
                                noStyle
                                rules={[{ required: true, message: 'Please select a currency' }]}
                            >
                                <Select
                                    size="large"
                                    style={{
                                        width: '120px',
                                        height: '48px'
                                    }}
                                    loading={currenciesLoading}
                                    className="currency-select"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) => {
                                        const currency = currencies?.find(c => c.id === option.value);
                                        return currency?.currencyCode.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                                    }}
                                >
                                    {currencies?.map((currency) => (
                                        <Option key={currency.id} value={currency.id}>
                                            {currency.currencyCode}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <InputNumber
                                size="large"
                                style={{
                                    width: 'calc(100% - 120px)',
                                    height: '48px'
                                }}
                                min={0}
                                placeholder="Enter salary amount"
                            />
                        </Input.Group>
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Description
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea
                        placeholder="Enter detailed description"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="file"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Offer Letter Document
                        </span>
                    }
                    className="full-width"
                >
                    <Upload.Dragger
                        name="file"
                        multiple={false}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept=".pdf,.doc,.docx"
                        fileList={fileList}
                        onChange={handleFileChange}
                    >
                        <p className="ant-upload-drag-icon">
                            <FiUpload style={{ fontSize: '24px', color: '#1890ff' }} />
                        </p>
                        <p className="ant-upload-text">Click or drag file to upload document</p>
                        <p className="ant-upload-hint">
                            Support for PDF, DOC, DOCX files
                        </p>
                    </Upload.Dragger>
                </Form.Item>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '24px'
                    }}
                >
                    <Button
                        onClick={onCancel}
                        size="large"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            border: '1px solid #e6e8eb',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading || updateLoading}
                        size="large"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                        }}
                    >
                        Update Offer Letter
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default EditOfferLetter; 