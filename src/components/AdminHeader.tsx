import { useNavigate } from 'react-router-dom';

interface AdminHeaderProps {
    userName?: string;
}

export default function AdminHeader({ userName = 'Admin' }: AdminHeaderProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const apiUrl = import.meta.env.VITE_API_BASE_URL;
                await fetch(`${apiUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Logout failed', error);
            }
        }
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleMobileSidebar = () => {
        window.dispatchEvent(new CustomEvent('wlcm:toggle-admin-sidebar'));
    };

    return (
        <header className="flex items-center justify-between bg-soft-linen px-4 sm:px-6 py-3.5 sm:py-4 shadow">
            <div className="flex items-center gap-3 min-w-0">
                <button
                    type="button"
                    onClick={toggleMobileSidebar}
                    aria-label="Open navigation menu"
                    className="md:hidden w-10 h-10 rounded-xl bg-midnight-teal text-soft-linen flex items-center justify-center shrink-0 hover:bg-midnight-teal/90 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span className="text-base sm:text-xl font-sans text-midnight-teal truncate">
                    Welcome, {userName}
                </span>
            </div>
            <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg text-sm sm:text-base text-harvest-orange font-bold hover:bg-harvest-orange/10 transition-colors shrink-0"
            >
                Logout
            </button>
        </header>
    );
}
