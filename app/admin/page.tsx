'use client';

import { useEffect, useState } from 'react';
import { ApplicationStage } from '@prisma/client';

interface Note {
    id: string;
    content: string;
}

interface Candidate {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    notes: Note[];
}

interface Job {
    id: string;
    title: string;
}

interface Application {
    id: string;
    currentStage: ApplicationStage;
    appliedAt: string;
    candidate: Candidate;
    job: Job;
    salaryExpectation?: string;
    score?: number;
}

const STAGES = [
    { id: 'APPLIED', name: 'Inscritos', color: 'bg-white border-l-4 border-gray-300' },
    { id: 'SCREENING', name: 'Triagem', color: 'bg-white border-l-4 border-blue-400' },
    { id: 'HR_INTERVIEW', name: 'Entrevista RH', color: 'bg-white border-l-4 border-purple-400' },
    { id: 'TECHNICAL_INTERVIEW', name: 'Entrevista Técnica', color: 'bg-white border-l-4 border-yellow-400' },
    { id: 'PROPOSAL_SENT', name: 'Proposta Enviada', color: 'bg-white border-l-4 border-orange-400' },
    { id: 'HIRED', name: 'Contratado', color: 'bg-white border-l-4 border-green-500' },
    { id: 'REJECTED', name: 'Reprovado', color: 'bg-white border-l-4 border-red-500' },
    { id: 'TALENT_POOL', name: 'Banco de Talentos', color: 'bg-white border-l-4 border-indigo-400' },
];

export default function AdminPanel() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState<Application | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Rejection Modal State
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionData, setRejectionData] = useState<{
        id: string;
        candidateName: string;
        jobTitle: string;
        preview: string;
        validations: any;
    } | null>(null);
    const [rejectionReason, setRejectionReason] = useState('Falta de experiência técnica');

    useEffect(() => {
        setMounted(true);
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await fetch('/api/applications');
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            console.error('Erro ao carregar aplicações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (app: Application) => {
        setDraggedItem(app);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (stageId: ApplicationStage) => {
        if (!draggedItem) return;

        if (stageId === 'REJECTED') {
            await openRejectionModal(draggedItem);
            setDraggedItem(null);
            return;
        }

        try {
            const response = await fetch('/api/applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: draggedItem.id,
                    currentStage: stageId,
                }),
            });

            if (response.ok) {
                await fetchApplications();
            }
        } catch (error) {
            console.error('Erro ao atualizar aplicação:', error);
        }

        setDraggedItem(null);
    };

    const openRejectionModal = async (app: Application) => {
        try {
            const response = await fetch(`/api/applications/${app.id}/rejection`);
            const data = await response.json();
            setRejectionData({
                id: app.id,
                candidateName: app.candidate.fullName,
                jobTitle: app.job.title,
                preview: data.preview,
                validations: data.validations
            });
            setIsRejectionModalOpen(true);
        } catch (error) {
            console.error('Erro ao preparar reprovação:', error);
        }
    };

    const handleConfirmRejection = async (scheduledFor?: string) => {
        if (!rejectionData) return;

        try {
            const response = await fetch(`/api/applications/${rejectionData.id}/rejection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rejectionReason,
                    emailContent: rejectionData.preview,
                    scheduledFor
                }),
            });

            if (response.ok) {
                setIsRejectionModalOpen(false);
                setRejectionData(null);
                await fetchApplications();
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao reprovar candidato');
            }
        } catch (error) {
            console.error('Erro ao confirmar reprovação:', error);
        }
    };

    const getApplicationsByStage = (stageId: string) => {
        return applications.filter((app) => app.currentStage === stageId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-white rounded-full animate-spin"></div>
                    <div className="text-lg font-medium text-[#0F172A]">Carregando ATS Talento...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F1F5F9]">
            {/* Rejection Modal - Spec 5.3 */}
            {isRejectionModalOpen && rejectionData && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-[#EF4444] p-6 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                ⚠️ Confirmar Reprovação Segura
                            </h3>
                            <button onClick={() => setIsRejectionModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Candidato</label>
                                    <div className="font-bold text-[#0F172A]">{rejectionData.candidateName}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Vaga</label>
                                    <div className="font-bold text-[#0F172A]">{rejectionData.jobTitle}</div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    ✅ Verificações de Segurança (Anti-Gafe)
                                </h4>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <span className="text-green-500 font-bold">✓</span> Nome verificado: <span className="text-[#0F172A]">{rejectionData.validations.name}</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <span className="text-green-500 font-bold">✓</span> Email ativo: <span className="text-[#0F172A]">{rejectionData.validations.email}</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <span className="text-green-500 font-bold">✓</span> Template de "{rejectionData.jobTitle}" carregado
                                    </li>
                                </ul>
                            </div>

                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Razão da Reprovação (Interno)</label>
                                <select
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                >
                                    <option>Falta de experiência técnica</option>
                                    <option>Expectativa salarial acima do budget</option>
                                    <option>Candidato não compareceu à entrevista</option>
                                    <option>Perfil comportamental desalinhado</option>
                                    <option>Contratamos outro candidato</option>
                                </select>
                            </div>

                            <div className="mb-8">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Preview do Email</label>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-600 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap font-sans">
                                    {rejectionData.preview}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => handleConfirmRejection()}
                                    className="flex-1 bg-[#EF4444] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
                                >
                                    Enviar Agora
                                </button>
                                <button
                                    onClick={() => handleConfirmRejection(new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString())}
                                    className="flex-1 bg-white text-[#EF4444] border-2 border-[#EF4444] font-bold py-4 rounded-xl hover:bg-red-50 transition-all"
                                >
                                    Agendar p/ 2h
                                </button>
                                <button
                                    onClick={() => setIsRejectionModalOpen(false)}
                                    className="flex-1 bg-slate-100 text-slate-400 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Toggle Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 lg:hidden bg-[#0F172A] text-white p-3 rounded-lg shadow-xl hover:brightness-110 transition-all"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block fixed top-4 z-30 bg-[#0F172A] text-white p-2.5 rounded-r-lg shadow-xl hover:brightness-110 transition-all"
                style={{ left: sidebarOpen ? '256px' : '0px' }}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {sidebarOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    )}
                </svg>
            </button>

            {/* Sidebar / Sidebar Mock (Simplified based on spec) */}
            <nav className={`fixed left-0 top-0 h-full w-64 bg-[#0F172A] text-white p-6 shadow-2xl transition-transform duration-300 z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="mb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#38BDF8] to-white rounded-lg"></div>
                    <span className="text-xl font-bold tracking-tight">Talento</span>
                </div>

                <div className="space-y-4">
                    <div className="p-3 bg-[#1e293b] rounded-lg cursor-pointer flex items-center gap-3">
                        <span className="text-xl">📊</span> Dashboard
                    </div>
                    <div
                        onClick={() => window.location.href = '/admin/vagas'}
                        className="p-3 hover:bg-[#1e293b] rounded-lg cursor-pointer flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="text-xl">📋</span> Vagas
                    </div>
                    <div
                        onClick={() => window.location.href = '/admin/candidatos'}
                        className="p-3 hover:bg-[#1e293b] rounded-lg cursor-pointer flex items-center gap-3 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="text-xl">👤</span> Candidatos
                    </div>
                </div>
            </nav>

            <main className={`p-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
                }`}>
                {/* Header Section */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F172A] mb-1">Visão Geral - Dashboard</h1>
                        <p className="text-slate-500 font-medium">Bem-vindo ao ATS Talento v2.0</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.href = '/admin/vagas'}
                            className="bg-white text-[#0F172A] px-5 py-2.5 rounded-lg font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            📋 Gerenciar Vagas
                        </button>
                        <button className="bg-[#38BDF8] text-[#0F172A] px-5 py-2.5 rounded-lg font-bold shadow-md hover:brightness-110 transition-all">
                            + Nova Vaga
                        </button>
                    </div>
                </header>

                {/* KPIs Dashboard - Spec 3.42 */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-slate-500 font-medium uppercase text-xs tracking-wider">Candidatos Ativos</span>
                            <span className="bg-blue-50 text-blue-600 p-2 rounded-lg text-lg">👤</span>
                        </div>
                        <div className="text-3xl font-bold text-[#0F172A]">{applications.length}</div>
                        <div className="mt-2 text-sm text-green-500 font-medium">↑ 12% desde ontem</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-slate-500 font-medium uppercase text-xs tracking-wider">Tempo Médio (Hiring)</span>
                            <span className="bg-purple-50 text-purple-600 p-2 rounded-lg text-lg">⏱️</span>
                        </div>
                        <div className="text-3xl font-bold text-[#0F172A]">18 dias</div>
                        <div className="mt-2 text-sm text-slate-400 font-medium">Meta: 21 dias</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-slate-500 font-medium uppercase text-xs tracking-wider">Etapa Final</span>
                            <span className="bg-orange-50 text-orange-600 p-2 rounded-lg text-lg">📄</span>
                        </div>
                        <div className="text-3xl font-bold text-[#0F172A]">
                            {getApplicationsByStage('PROPOSAL_SENT').length}
                        </div>
                        <div className="mt-2 text-sm text-slate-400 font-medium font-medium">Candidatos com proposta</div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-slate-500 font-medium uppercase text-xs tracking-wider">Taxa de Conversão</span>
                            <span className="bg-green-50 text-green-600 p-2 rounded-lg text-lg">📈</span>
                        </div>
                        <div className="text-3xl font-bold text-[#0F172A]">64%</div>
                        <div className="mt-2 text-sm text-green-500 font-medium">↑ 5% este mês</div>
                    </div>
                </section>

                {/* Kanban Board - Spec 5.2 */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10 overflow-x-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                            Pipeline de Candidatos <span className="text-sm font-medium text-slate-400">(Arraste para mover)</span>
                        </h2>
                        <div className="flex gap-2">
                            <div className="bg-slate-100 p-2 rounded-lg text-sm font-bold text-black px-4">Filtrar por Vaga: Todas</div>
                            <div className="bg-slate-100 p-2 rounded-lg text-sm font-bold text-black px-4">Ordenar por: Data</div>
                        </div>
                    </div>

                    <div className="flex gap-6 min-h-[600px] overflow-x-auto pb-4">
                        {STAGES.map((stage) => (
                            <div
                                key={stage.id}
                                className="flex-shrink-0 w-80 flex flex-col gap-4"
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(stage.id as ApplicationStage)}
                            >
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="font-bold text-black flex items-center gap-2 uppercase tracking-tight">
                                        {stage.name}
                                        <span className="bg-[#0F172A] text-white text-xs py-0.5 px-2 rounded-full font-bold">
                                            {getApplicationsByStage(stage.id).length}
                                        </span>
                                    </h3>
                                    <span className="text-xl text-slate-400">⋮</span>
                                </div>

                                <div className="flex-1 flex flex-col gap-4 p-1 rounded-2xl border-2 border-dashed border-transparent hover:border-slate-200 transition-all">
                                    {getApplicationsByStage(stage.id).map((app) => (
                                        <div
                                            key={app.id}
                                            draggable
                                            onDragStart={() => handleDragStart(app)}
                                            className={`${stage.color} p-5 rounded-2xl shadow-sm cursor-move hover:shadow-xl hover:-translate-y-1 transition-all group`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-sm">
                                                    {app.candidate.fullName.charAt(0)}
                                                </div>
                                                <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">⠿</span>
                                            </div>

                                            <h4 className="font-bold text-[#0F172A] mb-1">{app.candidate.fullName}</h4>
                                            <p className="text-sm text-[#38BDF8] font-bold mb-3">{app.job.title}</p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <span>📍</span> {app.candidate.city}, {app.candidate.state}
                                                </div>
                                                {app.salaryExpectation && (
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <span>💰</span> R$ {app.salaryExpectation}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                                                <span className="text-slate-400">⏱️ {new Date(app.appliedAt).toLocaleDateString('pt-BR')}</span>
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px]">⭐</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {getApplicationsByStage(stage.id).length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center text-slate-300 grayscale opacity-50">
                                            <span className="text-4xl mb-2">📥</span>
                                            <span className="text-xs font-medium">Vazio</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Candidate Database - Enhanced Table */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-black">Base de Talentos</h2>
                            <p className="text-black/60 text-sm font-medium">Total de candidates cadastrados na plataforma</p>
                        </div>
                        <button className="text-[#38BDF8] font-bold text-sm hover:underline">📥 Exportar CSV</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Candidato</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Vaga / Status</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Localização</th>
                                    <th className="px-4 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Última Atividade</th>
                                    <th className="px-4 py-4 text-right text-xs font-bold text-black uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#0F172A]">
                                                    {app.candidate.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-[#0F172A]">{app.candidate.fullName}</div>
                                                    <div className="text-xs text-slate-400">{app.candidate.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-[#0F172A]">{app.job.title}</div>
                                            <span className="px-2 py-0.5 inline-flex text-[10px] items-center  font-bold rounded-full bg-blue-50 text-[#38BDF8] mt-1 uppercase">
                                                {STAGES.find((s) => s.id === app.currentStage)?.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 whitespace-nowrap text-sm text-slate-500">
                                            {app.candidate.city}, {app.candidate.state}
                                        </td>
                                        <td className="px-4 py-5 whitespace-nowrap text-sm text-slate-400" suppressHydrationWarning>
                                            {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-5 whitespace-nowrap text-right">
                                            <button className="text-slate-300 hover:text-[#0F172A] transition-colors">Ver Perfil</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
