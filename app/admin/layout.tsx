import Sidebar from '@/app/components/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <div className="flex-1 ml-20 transition-all duration-300"> {/* ml-20 matches collapsed sidebar width */}
                {children}
            </div>
        </div>
    );
}
