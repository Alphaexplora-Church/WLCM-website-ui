import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
    className?: string;
}

const NAV_ITEMS = [
    { label: 'Content', path: '/admin/events' },
    { label: 'Journeys', path: '/admin/journeys' },
    { label: 'Registrations', path: '/admin/registrations' },
] as const;

export default function AdminSidebar({ className = '' }: AdminSidebarProps) {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => setMobileOpen(prev => !prev);
        window.addEventListener('wlcm:toggle-admin-sidebar', handleToggle);
        return () => window.removeEventListener('wlcm:toggle-admin-sidebar', handleToggle);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!mobileOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [mobileOpen]);

    const renderNavLinks = (onNavigate?: () => void) => (
        <nav className="flex-1 p-4 sm:p-6 space-y-2">
            {NAV_ITEMS.map(item => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={onNavigate}
                        className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                            isActive
                                ? 'bg-soft-linen/10 text-harvest-orange'
                                : 'text-soft-linen/80 hover:bg-soft-linen/5 hover:text-harvest-orange'
                        }`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <>
            {/* Persistent Left Sidebar on Desktop (>= 768px) */}
            <aside className={`hidden md:flex md:w-64 md:shrink-0 bg-midnight-teal text-soft-linen flex-col ${className}`}>
                <div className="p-6 font-serif text-2xl text-center border-b border-soft-linen/20">
                    WLCM Admin
                </div>
                {renderNavLinks()}
            </aside>

            {/* Slide-Over Drawer on Mobile (< 768px) */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                        aria-hidden="true"
                    />
                    <aside className="relative z-10 w-64 max-w-[80vw] bg-midnight-teal text-soft-linen flex flex-col h-full shadow-2xl">
                        <div className="px-5 py-5 font-serif text-xl border-b border-soft-linen/20 flex items-center justify-between">
                            <span>WLCM Admin</span>
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                aria-label="Close navigation menu"
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-soft-linen/70 hover:text-soft-linen hover:bg-soft-linen/10 text-2xl leading-none transition-colors"
                            >
                                ×
                            </button>
                        </div>
                        {renderNavLinks(() => setMobileOpen(false))}
                    </aside>
                </div>
            )}
        </>
    );
}
