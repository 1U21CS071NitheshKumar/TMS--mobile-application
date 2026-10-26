import React from 'react';
import MasterScreen from './MasterScreen';

const Rooms = () => {
    const fields = [
        { label: 'Room Number', key: 'number' },
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
        {
            label: 'Block',
            key: 'block',
            type: 'select',
            relation: 'blocks',
            render: (row) => row.block?.name || 'N/A'
        },
    ];

    const relations = [
        { name: 'departments', endpoint: '/master/departments' },
        { name: 'programmes', endpoint: '/master/programmes' },
        { name: 'blocks', endpoint: '/master/blocks' }
    ];

    return (
        <MasterScreen
            title="Room Numbers"
            endpoint="/master/rooms"
            fields={fields}
            relations={relations}
        />
    );
};

export default Rooms;
