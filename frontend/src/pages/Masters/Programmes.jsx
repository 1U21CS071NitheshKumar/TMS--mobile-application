import React from 'react';
import MasterScreen from './MasterScreen';

const Programmes = () => {
    const fields = [
        { label: 'Programme Name', key: 'name' },
        { label: 'Short Name', key: 'shortName' },
        {
            label: 'Department',
            key: 'department',
            type: 'select',
            relation: 'departments',
            render: (row) => row.department?.name || 'N/A'
        },
    ];

    const relations = [
        { name: 'departments', endpoint: '/master/departments' }
    ];

    return (
        <MasterScreen
            title="Programmes"
            endpoint="/master/programmes"
            fields={fields}
            relations={relations}
        />
    );
};

export default Programmes;
