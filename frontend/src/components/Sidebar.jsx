import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Settings,
    Ticket,
    BarChart3,
    LogOut,
    Building2,
    BookOpen,
    Box,
    DoorClosed,
    ShieldCheck,
    Users
} from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Raise Ticket', path: '/tickets/raise', icon: Ticket },
        { name: 'My Tickets', path: '/tickets/list', icon: Ticket },
    ];

    const adminItems = [
        { name: 'Departments', path: '/masters/departments', icon: Building2 },
        { name: 'Programmes', path: '/masters/programmes', icon: BookOpen },
        { name: 'Blocks', path: '/masters/blocks', icon: Box },
        { name: 'Rooms', path: '/masters/rooms', icon: DoorClosed },
        { name: 'Roles', path: '/masters/roles', icon: ShieldCheck },
        { name: 'Users', path: '/masters/users', icon: Users },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-3 text-primary-600 font-bold text-2xl">
                    <div className="bg-primary-600 p-2 rounded-lg text-white">
                        <Ticket size={24} />
                    </div>
                    <span>TMS.</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu</div>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                ? 'bg-primary-50 text-primary-600 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        {item.name}
                    </NavLink>
                ))}

                {(user?.role === 'SuperAdmin' || user?.role?.name === 'SuperAdmin') && (
                    <>
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-8 mb-2 px-2">Master Settings</div>
                        {adminItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${isActive
                                        ? 'bg-primary-50 text-primary-600 font-medium'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                {item.name}
                            </NavLink>
                        ))}
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
