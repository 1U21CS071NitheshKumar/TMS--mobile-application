import React from 'react';
import MasterScreen from './MasterScreen';

const Departments = () => {
    const fields = [
        { label: 'Department Name', key: 'name' },
        { label: 'Short Name', key: 'shortName' },
    ];

    return (
        <MasterScreen
            title="Departments"
            endpoint="/master/departments"
            fields={fields}
        />
    );
};

export default Departments;
