import React from 'react';
import MasterScreen from './MasterScreen';

const Roles = () => {
    const fields = [
        { label: 'Role Name', key: 'name' },
    ];

    return (
        <MasterScreen
            title="Roles"
            endpoint="/master/roles"
            fields={fields}
        />
    );
};

export default Roles;
