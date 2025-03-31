import React, { useMemo } from 'react';
import { Table, Button, Tag, Dropdown, Menu, Avatar } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiUserCheck, FiLock, FiUser, FiEye, FiShield, FiBriefcase, FiUsers } from 'react-icons/fi';
import moment from 'moment';
import { useGetRolesQuery } from '../role/services/roleApi'; // Adjust the import path as needed
import { useGetAllBranchesQuery } from '../Branch/services/branchApi'; // Add this import
import { useGetEmployeesQuery } from './services/employeeApi';
import { useGetAllDepartmentsQuery } from '../Department/services/departmentApi';
import { useGetAllDesignationsQuery } from '../Designation/services/designationApi';

const EmployeeList = ({ employees, onEdit, onDelete, onView }) => {
    // Fetch roles data
    const { data: rolesData } = useGetRolesQuery();
   


    // Add branch data fetch
    const { data: branchesData } = useGetAllBranchesQuery();
    const { data: departmentsData } = useGetAllDepartmentsQuery();
    const { data: designationsData } = useGetAllDesignationsQuery();


 

    // Function to get role name from role_id
    const getRoleName = (role_id) => {
        const role = rolesData?.data?.find(r => r.id === role_id);
        return role ? role.role_name : 'N/A';
    };

    // Helper functions to find names using find method
    const getBranchName = (branchId) => {
        const branch = branchesData?.data?.find(b => b.id === branchId);
        return branch ? branch.branchName : 'N/A';
    };

    const getDepartmentName = (departmentId) => {
        const department = departmentsData?.find(d => d.id === departmentId);
        return department ? department.department_name : 'N/A';
    };

    const getDesignationName = (designationId) => {
        const designation = designationsData?.find(d => d.id === designationId);
        return designation ? designation.designation_name : 'N/A';
    };

    // Function to get role color similar to user list
    const getRoleColor = (role) => {
        const roleColors = {
            'super-admin': {
                color: '#531CAD',
                bg: '#F9F0FF',
                border: '#D3ADF7'
            },
            'client': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE'
            },
            'sub-client': {
                color: '#389E0D',
                bg: '#F6FFED',
                border: '#B7EB8F'
            },
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591'
            },
            'default': {
                color: '#595959',
                bg: '#FAFAFA',
                border: '#D9D9D9'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const getInitials = (username) => {
        return username
            ? username.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : 'U';
    };

    const getActionMenu = (record) => (
        <Menu className="action-menu">
            <Menu.Item
                key="view"
                icon={<FiEye />}
                onClick={() => onView(record)}
            >
                View Details
            </Menu.Item>
            <Menu.Item
                key="edit"
                icon={<FiEdit2 />}
                onClick={() => onEdit(record)}
            >
                Edit Employee
            </Menu.Item>
            <Menu.Item
                key="status"
                icon={<FiUserCheck />}
                onClick={() => console.log('Change status')}
            >
                Change Status
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<FiTrash2 />}
                danger
                onClick={() => onDelete(record)}
            >
                Delete Employee
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profilePic',
            key: 'profilePic',
            render: (profilePic, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                    size={40}
                    src={profilePic}
                    icon={!profilePic && <FiUser />}
                    style={{
                        backgroundColor: !profilePic ? '#1890ff' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    >
                        {!profilePic && getInitials(record.name)}
                    </Avatar>
                </div>
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div style={{
                    fontWeight: 500,
                    color: '#262626',
                    fontSize: '14px'
                }}>
                    {text}
                </div>
            ),
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: 'Role',
            dataIndex: 'role_id',
            key: 'role_id',
            render: (role_id) => (
                <span style={{ 
                    color: '#595959', 
                    fontSize: '14px',
                    padding: '4px 8px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    {getRoleName(role_id)}
                </span>
            ),
            sorter: (a, b) => {
                const roleNameA = getRoleName(a.role_id);
                const roleNameB = getRoleName(b.role_id);
                return roleNameA.localeCompare(roleNameB);
            },
          
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            render: (branchId) => (
                <span style={{ 
                    color: '#595959', 
                    fontSize: '14px',
                    padding: '4px 8px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    {getBranchName(branchId)}
                </span>
            ),
            sorter: (a, b) => {
                const branchNameA = getBranchName(a.branch);
                const branchNameB = getBranchName(b.branch);
                return branchNameA.localeCompare(branchNameB);
            },
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            render: (departmentId) => (
                <span style={{ 
                    color: '#595959', 
                    fontSize: '14px',
                    padding: '4px 8px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    {getDepartmentName(departmentId)}
                </span>
            ),
            sorter: (a, b) => {
                const deptNameA = getDepartmentName(a.department);
                const deptNameB = getDepartmentName(b.department);
                return deptNameA.localeCompare(deptNameB);
            },
        },
        {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
            render: (designationId) => (
                <span style={{ 
                    color: '#595959', 
                    fontSize: '14px',
                    padding: '4px 8px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    display: 'inline-block'
                }}>
                    {getDesignationName(designationId)}
                </span>
            ),
            sorter: (a, b) => {
                const desigNameA = getDesignationName(a.designation);
                const desigNameB = getDesignationName(b.designation);
                return desigNameA.localeCompare(desigNameB);
            },
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => (
                <div className="date-cell">
                    <span className="date">
                        {moment(date).format('MMM DD, YYYY')}
                    </span>
                    <span className="time">
                        {moment(date).format('h:mm A')}
                    </span>
                </div>
            ),
            sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
        },
        {
            title: 'Updated At',
            dataIndex: 'updated_at',
            key: 'updated_at',
            render: (date) => (
                <div className="date-cell">
                    {date ? (
                        <>
                            <span className="date">
                                {moment(date).format('MMM DD, YYYY')}
                            </span>
                            <span className="time">
                                {moment(date).format('h:mm A')}
                            </span>
                        </>
                    ) : (
                        <span className="no-date">-</span>
                    )}
                </div>
            ),
            sorter: (a, b) => {
                if (!a.updated_at) return -1;
                if (!b.updated_at) return 1;
                return moment(a.updated_at).unix() - moment(b.updated_at).unix();
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    overlay={getActionMenu(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="user-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical size={16} />}
                        className="action-button"
                        onClick={(e) => e.stopPropagation()}
                    />
                </Dropdown>
            ),
        },
    ];

    // Transform the employees data
    const transformedEmployees = useMemo(() => {
        if (!employees) return [];
        return employees.map(emp => ({
            ...emp,
            key: emp.id,
            name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            branchName: getBranchName(emp.branch),
            departmentName: getDepartmentName(emp.department),
            designationName: getDesignationName(emp.designation)
        }));
    }, [employees, branchesData, departmentsData, designationsData]);

    return (
        <Table
            columns={columns}
            dataSource={transformedEmployees} // Use transformed data
            rowKey="id"
            pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `Total ${total} employees`,
            }}
            className="custom-table"
            scroll={{ x: 1000 }}
            style={{
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}
        />
    );
};

export default EmployeeList;
