import React, { useState } from 'react';
import {
    Card,
    message,
    Modal,
} from 'antd';
import {
    FiPlus,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './Salary.scss';
import dayjs from 'dayjs';
import CreateSalary from './CreateSalary';
import SalaryList from './SalaryList';
import { Link } from 'react-router-dom';
import { useGetSalaryQuery } from './services/salaryApi';
import PageHeader from '../../../../components/PageHeader';

const Salary = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [searchText, setSearchText] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    const { data: salaryData, isLoading: isSalaryLoading } = useGetSalaryQuery({
        page: currentPage,
        pageSize,
        search: searchText
    });

    const salaries = salaryData?.data || [];
    const total = salaryData?.pagination?.total || 0;

    const handleAddSalary = () => {
        setSelectedSalary(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditSalary = (salary) => {
        const formattedSalary = {
            ...salary,
            paymentDate: dayjs(salary.paymentDate),
        };
        setSelectedSalary(formattedSalary);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDeleteConfirm = (salary) => {
        setSelectedSalary(salary);
        setIsDeleteModalVisible(true);
    };

    const handleExport = (type) => {
        message.info(`Exporting as ${type.toUpperCase()}...`);
    };

    return (
        <div className="salary-page standard-page-container">
            <PageHeader
                title="Payroll Management"
                count={total}
                subtitle="Manage all salary records in the organization"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "HRM" },
                    { title: "Payroll" },
                ]}
                searchText={searchText}
                onSearch={setSearchText}
                searchPlaceholder="Search by employee, payslip..."
                onAdd={handleAddSalary}
                addText="Add Salary"
                exportMenu={{
                    items: [
                        { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
                        { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                    ]
                }}
            />

            <Card className="standard-content-card">
                <SalaryList
                    salaries={salaries}
                    loading={isSalaryLoading}
                    onEdit={handleEditSalary}
                    onDelete={handleDeleteConfirm}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: total,
                        onChange: (page, size) => { setCurrentPage(page); setPageSize(size); }
                    }}
                    searchText={searchText}
                />
            </Card>

            <CreateSalary
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={() => { setIsFormVisible(false); message.success('Operation successful'); }}
                isEditing={isEditing}
                initialValues={selectedSalary}
                loading={loading}
            />

            <Modal
                title="Delete Salary"
                open={isDeleteModalVisible}
                onOk={() => { setIsDeleteModalVisible(false); message.success('Salary deleted'); }}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this salary record?</p>
            </Modal>
        </div>
    );
};

export default Salary;
