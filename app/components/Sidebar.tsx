'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(false);
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav
            className={`fixed left-0 top-0 h-full bg-[#0F172A] text-white shadow-2xl transition-all duration-300 z-50 ${isExpanded ? 'w-64' : 'w-20'
                }`}
        >
            <div className="flex flex-col items-center py-6 space-y-6 w-full">
                {/* Expand Button */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-12 h-12 flex items-center justify-center bg-[#38BDF8] hover:bg-[#0EA5E9] rounded-lg cursor-pointer transition-colors mb-4 shadow-lg text-white"
                    title={isExpanded ? "Recolher menu" : "Expandir menu"}
                >
                    {isExpanded ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    )}
                </button>

                {/* Logo */}
                <div className={`transition-all duration-300 flex items-center justify-center ${isExpanded ? 'px-4' : ''}`}>
                    <img alt="Talento" className="w-10 h-10 object-contain" src="/LogoBranco.png" />
                    {isExpanded && <span className="ml-2 text-xl font-bold tracking-tight text-white">Talento</span>}
                </div>

                <div className="w-10 h-px bg-white/20"></div>

                {/* Navigation Links */}
                <div className="flex flex-col space-y-4 w-full px-4">
                    <NavItem
                        href="/admin"
                        icon="📊"
                        label="Dashboard"
                        isExpanded={isExpanded}
                        active={isActive('/admin')}
                    />
                    <NavItem
                        href="/admin/vagas"
                        icon="📋"
                        label="Vagas"
                        isExpanded={isExpanded}
                        active={isActive('/admin/vagas')}
                    />
                    <NavItem
                        href="/admin/candidatos"
                        icon="👤"
                        label="Candidatos"
                        isExpanded={isExpanded}
                        active={isActive('/admin/candidatos')}
                    />
                </div>
            </div>
        </nav>
    );
}

function NavItem({ href, icon, label, isExpanded, active }: { href: string, icon: string, label: string, isExpanded: boolean, active: boolean }) {
    return (
        <Link href={href} className="w-full">
            <div
                className={`
                    relative flex items-center h-12 rounded-xl cursor-pointer transition-all duration-200 group
                    ${active ? 'bg-[#38BDF8] text-white shadow-lg shadow-blue-900/20' : 'hover:bg-[#1e293b] text-slate-400 hover:text-white'}
                    ${isExpanded ? 'px-4' : 'justify-center'}
                `}
                title={!isExpanded ? label : ''}
            >
                <span className="text-xl shrink-0">{icon}</span>

                {isExpanded && (
                    <span className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden animate-in fade-in duration-200">
                        {label}
                    </span>
                )}

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-[#1e293b] text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-slate-700">
                        {label}
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-[#1e293b] rotate-45 border-l border-b border-slate-700"></div>
                    </div>
                )}
            </div>
        </Link>
    );
}
