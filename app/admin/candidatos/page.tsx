'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Candidate {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    createdAt: string;
    applications: Array<{
        id: string;
        currentStage: string;
        job: {
            title: string;
        };
    }>;
}

export default function CandidatesPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response = await fetch('/api/applications');
            const applications = await response.json();

            // Extract unique candidates from applications
            const uniqueCandidates = applications.reduce((acc: Candidate[], app: any) => {
                const existing = acc.find(c => c.id === app.candidate.id);
                if (!existing) {
                    acc.push({
                        ...app.candidate,
                        applications: [app]
                    });
                } else {
                    existing.applications.push(app);
                }
                return acc;
            }, []);

            setCandidates(uniqueCandidates);
        } catch (error) {
            console.error('Erro ao carregar candidatos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStageLabel = (stage: string) => {
        const labels: Record<string, string> = {
            APPLIED: 'Inscrito',
            SCREENING: 'Triagem',
            HR_INTERVIEW: 'RH',
            TECHNICAL_INTERVIEW: 'Técnica',
            PROPOSAL_SENT: 'Proposta',
            HIRED: 'Contratado',
            REJECTED: 'Reprovado',
            TALENT_POOL: 'Banco de Talentos'
        };
        return labels[stage] || stage;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-white rounded-full animate-spin"></div>
                    <div className="text-lg font-medium text-black">Carregando candidatos...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F1F5F9]">
            {/* Sidebar */}
            <nav className="fixed left-0 top-0 h-full w-64 bg-[#0F172A] text-white p-6 hidden lg:block shadow-2xl">
                <div className="mb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#38BDF8] to-white rounded-lg"></div>
                    <span className="text-xl font-bold tracking-tight">Talento</span>
                </div>

                <div className="space-y-4">
                    <div
                        onClick={() => router.push('/admin')}
                        className="p-3 hover:bg-[#1e293b] rounded-lg cursor-pointer flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="text-xl">📊</span> Dashboard
                    </div>
                    <div
                        onClick={() => router.push('/admin/vagas')}
                        className="p-3 hover:bg-[#1e293b] rounded-lg cursor-pointer flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="text-xl">📋</span> Vagas
                    </div>
                    <div className="p-3 bg-[#1e293b] rounded-lg cursor-pointer flex items-center gap-3">
                        <span className="text-xl">👤</span> Candidatos
                    </div>
                </div>
            </nav>

            <main className="lg:ml-64 p-8">
                {/* Header */}
                <header className="mb-10">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-black mb-1">Base de Candidatos</h1>
                            <p className="text-black/70 font-medium">
                                {candidates.length} {candidates.length === 1 ? 'candidato cadastrado' : 'candidatos cadastrados'}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="bg-white text-[#0F172A] px-5 py-2.5 rounded-lg font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            ← Voltar ao Dashboard
                        </button>
                    </div>
                </header>

                {/* Candidates Table */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    {candidates.length === 0 ? (
                        <div className="py-16 text-center">
                            <div className="text-6xl mb-4">👥</div>
                            <h3 className="text-2xl font-bold text-black mb-2">
                                Nenhum candidato cadastrado ainda
                            </h3>
                            <p className="text-black/60 font-medium mb-6">
                                Os candidatos que se registrarem aparecerão aqui.
                            </p>
                            <button
                                onClick={() => window.open('/candidatar', '_blank')}
                                className="bg-[#38BDF8] text-white px-6 py-3 rounded-lg font-bold hover:brightness-110 transition-all"
                            >
                                🔗 Abrir Formulário de Candidatura
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b-2 border-slate-100">
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Candidato</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Contato</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Localização</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Vagas</th>
                                        <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Cadastro</th>
                                        <th className="px-4 py-4 text-right text-xs font-bold text-black uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {candidates.map((candidate) => (
                                        <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center font-bold text-white">
                                                        {candidate.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-black">{candidate.fullName}</div>
                                                        <div className="text-sm text-black/60 font-medium">ID: {candidate.id.substring(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-sm text-black font-medium">{candidate.email}</div>
                                                <div className="text-sm text-black/60 font-medium">{candidate.phone}</div>
                                            </td>
                                            <td className="px-4 py-5 whitespace-nowrap">
                                                <div className="text-sm text-black font-medium">
                                                    📍 {candidate.city}, {candidate.state}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                {candidate.applications.map((app, idx) => (
                                                    <div key={app.id} className="mb-1">
                                                        <span className="text-sm font-bold text-black">{app.job.title}</span>
                                                        <span className="ml-2 text-xs bg-slate-100 text-black px-2 py-1 rounded-full font-bold">
                                                            {getStageLabel(app.currentStage)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </td>
                                            <td className="px-4 py-5 whitespace-nowrap">
                                                <div className="text-sm text-black/60 font-medium">
                                                    {new Date(candidate.createdAt).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    {candidate.linkedinUrl && (
                                                        <a
                                                            href={candidate.linkedinUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#38BDF8] hover:text-[#0F172A] font-bold text-sm transition-colors"
                                                        >
                                                            LinkedIn
                                                        </a>
                                                    )}
                                                    {candidate.portfolioUrl && (
                                                        <a
                                                            href={candidate.portfolioUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[#38BDF8] hover:text-[#0F172A] font-bold text-sm transition-colors"
                                                        >
                                                            Portfolio
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
