import React from 'react';
import MasterScreen from './MasterScreen';

const Blocks = () => {
    const fields = [
        { label: 'Block Name', key: 'name' },
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
        { name: 'departments', endpoint: '/master/departments' },
        { name: 'programmes', endpoint: '/master/programmes' }
    ];

    return (
        <MasterScreen
            title="Blocks"
            endpoint="/master/blocks"
            fields={fields}
            relations={relations}
        />
    );
};

export default Blocks;
