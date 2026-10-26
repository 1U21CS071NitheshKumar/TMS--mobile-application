import React from 'react';
import MasterScreen from './MasterScreen';

const UserManagement = () => {
    const fields = [
        { label: 'Username', key: 'username' },
        { label: 'Password', key: 'password', type: 'password', hideInTable: true },
        { label: 'Email', key: 'email' },
        {
            label: 'Role',
            key: 'role',
            type: 'select',
            relation: 'roles',
            render: (row) => row.role?.name || 'N/A'
        },
        {
            label: 'Department',
            key: 'department',
            type: 'select',
            relation: 'departments',
            render: (row) => row.department?.name || 'N/A'
        },
        {
            label: 'Programme',
            key: 'programme',
            type: 'select',
            relation: 'programmes',
            render: (row) => row.programme?.name || 'N/A'
        },
    ];

    const relations = [
        { name: 'roles', endpoint: '/master/roles' },
        { name: 'departments', endpoint: '/master/departments' },
        { name: 'programmes', endpoint: '/master/programmes' }
    ];

    return (
        <MasterScreen
            title="User Management"
            endpoint="/master/users"
            fields={fields}
            relations={relations}
        />
    );
};

export default UserManagement;
