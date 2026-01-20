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
    cpf: string;
    birthDate?: string;
    email: string;
    phone: string;
    cep?: string;
    address: string;
    neighborhood?: string;
    city: string;
    state: string;
    country: string;
    aboutMe?: string;
    currentSalary?: number;
    expectedSalary?: number;
    employmentStatus?: string;
    startAvailability?: string;
    scheduleAvailability?: string;
    bestInterviewTime?: string;
    technicalSkills: string[];
    driverLicense: string[];
    linkedinUrl?: string;
    portfolioUrl?: string;
    resumeFileUrl?: string;
    recruiterNotes?: string;
    consentDate?: string;
    consentIp?: string;
    createdAt: string;
}

interface Job {
    id: string;
    title: string;
    companyName?: string;
}

interface Application {
    id: string;
    currentStage: ApplicationStage;
    appliedAt: string;
    createdAt: string;
    candidate: Candidate;
    job: Job;
    recruiterNotes?: string;
}



export default function AdminPanel() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState<Application | null>(null);
    const [mounted, setMounted] = useState(false);

    // Calculate KPIs
    const activeApplications = applications.filter(app =>
        app.currentStage !== 'REJECTED' && app.currentStage !== 'HIRED'
    );

    const avgHiringTime = applications.length > 0
        ? Math.round(
            applications.reduce((sum, app) => {
                const days = Math.floor(
                    (new Date().getTime() - new Date(app.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                );
                return sum + days;
            }, 0) / applications.length
        )
        : 0;

    const conversionRate = applications.length > 0
        ? Math.round((applications.filter(app => app.currentStage === 'HIRED').length / applications.length) * 100)
        : 0;

    // Rejection Modal State
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionApplication, setRejectionApplication] = useState<Application | null>(null);
    const [feedbackType, setFeedbackType] = useState<'positive' | 'constructive'>('constructive');
    const [rejectionReason, setRejectionReason] = useState('Falta de experiência técnica');
    const [rejectionFeedback, setRejectionFeedback] = useState('');
    const [ccEmail, setCcEmail] = useState('');
    const [ccHR, setCcHR] = useState(true);

    // Filter and Sort State
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'>('date-desc');
    const [showJobFilter, setShowJobFilter] = useState(false);
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Quick Edit Modal State
    const [isQuickEditOpen, setIsQuickEditOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);

    // Stage Management State
    const [stages, setStages] = useState([
        { id: 'TRIAGEM', name: 'Triagem / Entrada', color: 'bg-white border-l-4 border-gray-300' },
        { id: 'SCREENING', name: 'Hunting / Screening', color: 'bg-white border-l-4 border-blue-400' },
        { id: 'ENTREVISTA_RH', name: 'Entrevista RH', color: 'bg-white border-l-4 border-purple-400' },
        { id: 'ENTREVISTA_LIDERANCA', name: 'Alinhamento Liderança', color: 'bg-white border-l-4 border-yellow-400' },
        { id: 'PROPOSTA', name: 'Proposta Enviada', color: 'bg-white border-l-4 border-blue-400' },
        { id: 'STANDBY', name: 'Aguardando / Standby', color: 'bg-white border-l-4 border-orange-400' },
        { id: 'ADMISSAO', name: 'Proposta / Admissão', color: 'bg-white border-l-4 border-green-500' },
        { id: 'REPROVADO', name: 'Reprovado', color: 'bg-white border-l-4 border-red-500' },
    ]);
    const [editingStageId, setEditingStageId] = useState<string | null>(null);
    const [editingStageName, setEditingStageName] = useState('');
    const [showStageMenu, setShowStageMenu] = useState<string | null>(null);
    const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
    const [newStageName, setNewStageName] = useState('');
    const [draggedStageId, setDraggedStageId] = useState<string | null>(null);

    // Drill-down Modal State
    const [isDrillDownOpen, setIsDrillDownOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [savingNotes, setSavingNotes] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchApplications();
        fetchJobs();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.relative')) {
                setShowJobFilter(false);
                setShowSortMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    const fetchJobs = async () => {
        try {
            const response = await fetch('/api/jobs');
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Erro ao carregar vagas:', error);
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
        setRejectionApplication(app);
        setIsRejectionModalOpen(true);
    };

    const handleSaveNotes = async (appId: string, notes: string) => {
        setSavingNotes(true);
        try {
            const response = await fetch(`/api/applications/${appId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recruiterNotes: notes }),
            });
            if (response.ok) {
                await fetchApplications();
                // Update selected application locally to reflect changes
                if (selectedApplication?.id === appId) {
                    setSelectedApplication(prev => prev ? { ...prev, recruiterNotes: notes } : null);
                }
            }
        } catch (error) {
            console.error('Erro ao salvar notas:', error);
        } finally {
            setSavingNotes(false);
        }
    };

    const handleConfirmRejection = async () => {
        if (!rejectionApplication) return;

        try {
            const response = await fetch(`/api/applications/${rejectionApplication.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentStage: 'REJECTED',
                }),
            });

            if (response.ok) {
                setIsRejectionModalOpen(false);
                setRejectionApplication(null);
                await fetchApplications();
            } else {
                const error = await response.json();
                alert(error.error || 'Erro ao reprovar candidato');
            }
        } catch (error) {
            console.error('Erro ao confirmar reprovação:', error);
        }
    };

    const exportToCSV = () => {
        // CSV Headers
        const headers = ['Nome', 'Email', 'Telefone', 'CEP', 'Cidade', 'Estado', 'LinkedIn', 'Portfolio', 'Cadastrado em'];

        // Convert applications to CSV rows
        const rows = applications.map(app => [
            app.candidate.fullName,
            app.candidate.email,
            app.candidate.phone,
            app.candidate.cep || '-',
            app.candidate.city,
            app.candidate.state,
            app.candidate.linkedinUrl || '-',
            app.candidate.portfolioUrl || '-',
            new Date(app.createdAt).toLocaleDateString('pt-BR')
        ]);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `candidatos_${new Date().toISOString().split('T')[0]}.csv`;

        link.href = url;
        link.setAttribute('download', filename); // Ensure filename is used
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 100);
    };

    // Get unique jobs for filter
    const uniqueJobs = Array.from(new Set(applications.map(app => app.job.id)))
        .map(jobId => applications.find(app => app.job.id === jobId)!.job)
        .filter(Boolean);

    // Filter applications by selected jobs
    const filteredApplications = selectedJobs.length === 0
        ? applications
        : applications.filter(app => selectedJobs.includes(app.job.id));

    // Sort applications
    const sortedApplications = [...filteredApplications].sort((a, b) => {
        switch (sortBy) {
            case 'date-desc':
                return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
            case 'date-asc':
                return new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime();
            case 'name-asc':
                return a.candidate.fullName.localeCompare(b.candidate.fullName);
            case 'name-desc':
                return b.candidate.fullName.localeCompare(a.candidate.fullName);
            default:
                return 0;
        }
    });

    const getApplicationsByStage = (stageId: string) => {
        return sortedApplications.filter((app) => app.currentStage === stageId);
    };

    const toggleJobFilter = (jobId: string) => {
        setSelectedJobs(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    const clearJobFilters = () => {
        setSelectedJobs([]);
    };

    const getSortLabel = () => {
        switch (sortBy) {
            case 'date-desc': return 'Data (Recente)';
            case 'date-asc': return 'Data (Antiga)';
            case 'name-asc': return 'Nome (A-Z)';
            case 'name-desc': return 'Nome (Z-A)';
            default: return 'Data';
        }
    };

    // Stage Management Functions
    const handleEditStageName = (stageId: string) => {
        const stage = stages.find(s => s.id === stageId);
        if (stage) {
            setEditingStageId(stageId);
            setEditingStageName(stage.name);
            setShowStageMenu(null);
        }
    };

    const handleSaveStageName = () => {
        if (editingStageId && editingStageName.trim()) {
            setStages(prev => prev.map(s =>
                s.id === editingStageId ? { ...s, name: editingStageName.trim() } : s
            ));
            setEditingStageId(null);
            setEditingStageName('');
        }
    };

    const handleCancelEditStage = () => {
        setEditingStageId(null);
        setEditingStageName('');
    };

    const handleAddStage = () => {
        if (newStageName.trim()) {
            const newStage = {
                id: `CUSTOM_${crypto.randomUUID()}`,
                name: newStageName.trim(),
                color: 'bg-white border-l-4 border-cyan-400'
            };
            setStages(prev => [...prev, newStage]);
            setNewStageName('');
            setIsAddStageModalOpen(false);
        }
    };

    const handleDeleteStage = (stageId: string) => {
        const candidatesInStage = getApplicationsByStage(stageId);
        if (candidatesInStage.length > 0) {
            alert(`❌ Não é possível remover esta etapa pois existem ${candidatesInStage.length} candidato(s) vinculado(s).`);
            return;
        }
        if (stages.length <= 2) {
            alert('❌ Você deve manter pelo menos 2 etapas no pipeline.');
            return;
        }
        if (confirm(`Tem certeza que deseja remover a etapa "${stages.find(s => s.id === stageId)?.name}"?`)) {
            setStages(prev => prev.filter(s => s.id !== stageId));
            setShowStageMenu(null);
        }
    };

    const handleDragStageStart = (stageId: string) => {
        setDraggedStageId(stageId);
    };

    const handleDragStageOver = (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault();
        if (!draggedStageId || draggedStageId === targetStageId) return;

        const draggedIndex = stages.findIndex(s => s.id === draggedStageId);
        const targetIndex = stages.findIndex(s => s.id === targetStageId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            const newStages = [...stages];
            const [removed] = newStages.splice(draggedIndex, 1);
            newStages.splice(targetIndex, 0, removed);
            setStages(newStages);
        }
    };

    const handleDragStageEnd = () => {
        setDraggedStageId(null);
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
            {/* Drill-down Modal */}
            {isDrillDownOpen && selectedApplication && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
                        {/* Header */}
                        <div className="bg-[#0F172A] p-8 text-white relative">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-blue-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/20">
                                        {selectedApplication.candidate.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold mb-1">{selectedApplication.candidate.fullName}</h3>
                                        <div className="flex items-center gap-3 text-blue-200 font-medium">
                                            <span>{selectedApplication.job.title}</span>
                                            <span className="opacity-30">•</span>
                                            <span className="bg-blue-500/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider border border-blue-500/30">
                                                {stages.find(s => s.id === selectedApplication.currentStage)?.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDrillDownOpen(false)}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-white"
                                >
                                    <span className="text-2xl font-light">✕</span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Info Sections */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Personal Info */}
                                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="text-lg">👤</span> Dados Pessoais
                                        </h4>
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 block mb-1">CPF</label>
                                                <div className="font-bold text-slate-900">{selectedApplication.candidate.cpf}</div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 block mb-1">Nascimento</label>
                                                <div className="font-bold text-slate-900">
                                                    {selectedApplication.candidate.birthDate ? new Date(selectedApplication.candidate.birthDate).toLocaleDateString('pt-BR') : '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 block mb-1">Email</label>
                                                <div className="font-bold text-blue-600">{selectedApplication.candidate.email}</div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 block mb-1">WhatsApp</label>
                                                <div className="font-bold text-slate-900">{selectedApplication.candidate.phone}</div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 block mb-1">CEP</label>
                                                <div className="font-bold text-slate-900">{selectedApplication.candidate.cep || '-'}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs font-bold text-slate-400 block mb-1">Endereço</label>
                                                <div className="font-bold text-slate-900">
                                                    {selectedApplication.candidate.address}, {selectedApplication.candidate.neighborhood} — {selectedApplication.candidate.city}/{selectedApplication.candidate.state}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Professional Info */}
                                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <span className="text-lg">💼</span> Experiência e Pretensão
                                        </h4>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-xs font-bold text-slate-400 block mb-2">Resumo Profissional</label>
                                                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl italic">
                                                    "{selectedApplication.candidate.aboutMe || 'Nenhum resumo fornecido.'}"
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 block mb-1">Expectativa Salarial</label>
                                                    <div className="font-bold text-green-600 text-lg">
                                                        {selectedApplication.candidate.expectedSalary ? `R$ ${selectedApplication.candidate.expectedSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold text-slate-400 block mb-1">Disponibilidade</label>
                                                    <div className="font-bold text-slate-900">{selectedApplication.candidate.startAvailability || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Skills and Driver License */}
                                    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">🛠️ Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedApplication.candidate.technicalSkills?.map(skill => (
                                                        <span key={skill} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{skill}</span>
                                                    )) || '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">🚗 CNH</h4>
                                                <div className="flex gap-2">
                                                    {selectedApplication.candidate.driverLicense?.map(lic => (
                                                        <span key={lic} className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded text-xs font-black border border-blue-200">{lic}</span>
                                                    )) || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                {/* Right Column: Sidebar Actions & Notes */}
                                <div className="space-y-8">
                                    {/* Actions */}
                                    <section className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Ações Rápidas</h4>
                                        <button
                                            onClick={() => window.open(`/api/resume/${selectedApplication.candidate.id}`, '_blank')}
                                            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                        >
                                            📄 Abrir Currículo PDF
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedApplication.candidate.linkedinUrl && (
                                                <a href={selectedApplication.candidate.linkedinUrl} target="_blank" className="bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all text-center text-sm flex items-center justify-center gap-2">
                                                    <span>🔗</span> LinkedIn
                                                </a>
                                            )}
                                            {selectedApplication.candidate.portfolioUrl && (
                                                <a href={selectedApplication.candidate.portfolioUrl} target="_blank" className="bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-all text-center text-sm flex items-center justify-center gap-2">
                                                    <span>🌐</span> Portfolio
                                                </a>
                                            )}
                                        </div>
                                    </section>

                                    {/* Internal Notes */}
                                    <section className="bg-yellow-50/50 p-6 rounded-3xl border-2 border-yellow-100/50 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                                                <span className="text-lg">📝</span> Notas do Recrutador
                                            </h4>
                                            {savingNotes && <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded animate-pulse font-bold">SALVANDO...</span>}
                                        </div>
                                        <textarea
                                            defaultValue={selectedApplication.recruiterNotes || ''}
                                            onBlur={(e) => handleSaveNotes(selectedApplication.id, e.target.value)}
                                            className="w-full bg-white border-2 border-yellow-200 rounded-2xl p-4 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 min-h-[200px] transition-all"
                                            placeholder="Adicione observações internas sobre este candidato..."
                                        />
                                        <p className="text-[10px] text-yellow-600 font-medium">As notas são salvas automaticamente ao clicar fora do campo.</p>
                                    </section>

                                    {/* Meta Info */}
                                    <div className="px-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest space-y-2">
                                        <div>Aplicado em: {new Date(selectedApplication.appliedAt).toLocaleString('pt-BR')}</div>
                                        <div>Consentimento IP: {selectedApplication.candidate.consentIp || '127.0.0.1'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-4">
                            <button
                                onClick={() => setIsDrillDownOpen(false)}
                                className="bg-slate-100 text-slate-600 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                            >
                                Fechar Detalhes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal - Spec 5.3 */}
            {isRejectionModalOpen && rejectionApplication && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-[#EF4444] to-[#DC2626] p-8 rounded-t-3xl">
                            <h3 className="text-2xl font-bold text-white">⚠️ Confirmar Reprovação</h3>
                            <p className="text-red-100 mt-2 font-medium">Esta ação não pode ser desfeita. Revise cuidadosamente antes de prosseguir.</p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Candidato</label>
                                    <div className="font-bold text-[#0F172A]">{rejectionApplication.candidate.fullName}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Vaga</label>
                                    <div className="font-bold text-[#0F172A]">{rejectionApplication.job.title}</div>
                                </div>
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

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => handleConfirmRejection()}
                                    className="flex-1 bg-[#EF4444] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-[0.98] transition-all"
                                >
                                    Reprovar Candidato
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

            {/* Quick Edit Modal */}
            {isQuickEditOpen && editingApplication && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] p-8 rounded-t-3xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">✏️ Edição Rápida</h3>
                                    <p className="text-blue-100 mt-2 font-medium">Editar informações do candidato</p>
                                </div>
                                <button
                                    onClick={() => setIsQuickEditOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors text-white"
                                >
                                    <span className="text-2xl">✕</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Nome Completo</label>
                                    <div className="font-bold text-[#0F172A] text-lg">{editingApplication.candidate.fullName}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Email</label>
                                    <div className="font-medium text-[#0F172A]">{editingApplication.candidate.email}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Telefone</label>
                                    <div className="font-medium text-[#0F172A]">{editingApplication.candidate.phone}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Cidade</label>
                                    <div className="font-medium text-[#0F172A]">{editingApplication.candidate.city}</div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Estado</label>
                                    <div className="font-medium text-[#0F172A]">{editingApplication.candidate.state}</div>
                                </div>
                            </div>

                            <div className="mb-8 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                                <label className="text-sm font-bold text-[#0F172A] block mb-3">🏢 Vaga Vinculada</label>
                                <select
                                    value={editingApplication.job.id}
                                    onChange={async (e) => {
                                        const newJobId = e.target.value;
                                        try {
                                            const response = await fetch(`/api/applications/${editingApplication.id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ jobId: newJobId }),
                                            });
                                            if (response.ok) {
                                                await fetchApplications();
                                                setIsQuickEditOpen(false);
                                                alert('✅ Vaga alterada com sucesso!');
                                            }
                                        } catch (error) {
                                            console.error('Erro ao trocar vaga:', error);
                                            alert('❌ Erro ao trocar vaga');
                                        }
                                    }}
                                    className="w-full p-4 bg-white border-2 border-blue-200 rounded-xl font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    {jobs.map(job => (
                                        <option key={job.id} value={job.id}>{job.title}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-600 mt-2 font-medium">Alterar a vaga vinculada a este candidato</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        window.location.href = `/admin/candidatos`;
                                    }}
                                    className="flex-1 bg-[#0F172A] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all"
                                >
                                    Editar Dados Completos
                                </button>
                                <button
                                    onClick={() => setIsQuickEditOpen(false)}
                                    className="flex-1 bg-slate-100 text-slate-600 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Stage Modal */}
            {isAddStageModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-[#38BDF8] to-[#0EA5E9] p-8 rounded-t-3xl">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-white">➕ Nova Etapa</h3>
                                    <p className="text-blue-100 mt-2 font-medium">Adicionar etapa ao pipeline</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsAddStageModalOpen(false);
                                        setNewStageName('');
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/20 transition-colors text-white"
                                >
                                    <span className="text-2xl">✕</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="mb-6">
                                <label className="text-sm font-bold text-[#0F172A] block mb-3">🏷️ Nome da Etapa</label>
                                <input
                                    type="text"
                                    value={newStageName}
                                    onChange={(e) => setNewStageName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddStage();
                                        if (e.key === 'Escape') {
                                            setIsAddStageModalOpen(false);
                                            setNewStageName('');
                                        }
                                    }}
                                    placeholder="Ex: Teste Prático"
                                    className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-black"
                                    autoFocus
                                />
                                <p className="text-xs text-slate-600 mt-2 font-medium">A nova etapa será adicionada ao final do pipeline</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleAddStage}
                                    disabled={!newStageName.trim()}
                                    className="flex-1 bg-[#0F172A] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Adicionar Etapa
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAddStageModalOpen(false);
                                        setNewStageName('');
                                    }}
                                    className="flex-1 bg-slate-100 text-slate-600 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}



            <main className="p-8 w-full transition-all duration-300">
                {/* Header Section */}
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0F172A] mb-1">Visão Geral - Dashboard</h1>
                        <p className="text-black font-medium">Bem-vindo ao ATS Talento v2.0</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.href = '/admin/vagas'}
                            className="bg-white text-[#0F172A] px-5 py-2.5 rounded-lg font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            📋 Gerenciar Vagas
                        </button>
                        <button onClick={() => window.location.href = '/admin/vagas'} className="bg-[#38BDF8] text-[#0F172A] px-5 py-2.5 rounded-lg font-bold shadow-md hover:brightness-110 transition-all">
                            + Nova Vaga
                        </button>
                    </div>
                </header>

                {/* KPIs Dashboard - Spec 3.42 */}
                {/* KPIs Dashboard - Modern Design */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Active Candidates */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:border-blue-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Candidatos Ativos</p>
                                <h3 className="text-3xl font-extrabold text-slate-900">{activeApplications.length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                                👤
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400 font-medium">
                                {activeApplications.length === 0 ? 'Nenhum ativo no momento' : 'Em processos seletivos'}
                            </span>
                        </div>
                    </div>

                    {/* Hiring Time */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:border-purple-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Tempo de Contratação</p>
                                <h3 className="text-3xl font-extrabold text-slate-900">{avgHiringTime > 0 ? avgHiringTime : '-'} <span className="text-lg text-slate-400 font-medium">dias</span></h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                                ⏱️
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            {avgHiringTime > 21 ? (
                                <span className="text-red-500 font-bold flex items-center gap-1">
                                    ↑ Acima da meta (21d)
                                </span>
                            ) : (
                                <span className="text-green-500 font-bold flex items-center gap-1">
                                    ↓ Dentro da meta (21d)
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Final Stage */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:border-orange-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Fase Final/Proposta</p>
                                <h3 className="text-3xl font-extrabold text-slate-900">{getApplicationsByStage('PROPOSTA').length}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                                📄
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                    className="bg-orange-500 h-full rounded-full"
                                    style={{ width: `${(getApplicationsByStage('PROPOSTA').length / (applications.length || 1)) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-slate-400 text-xs whitespace-nowrap">vs Total</span>
                        </div>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 group hover:border-green-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Conversão em Contratação</p>
                                <h3 className="text-3xl font-extrabold text-slate-900">{conversionRate}%</h3>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                                📈
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500 font-medium">
                                {applications.filter(a => a.currentStage === 'HIRED').length} contratações realizadas
                            </span>
                        </div>
                    </div>
                </section>

                {/* Kanban Board - Spec 5.2 */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10 overflow-x-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                            Pipeline de Candidatos <span className="text-sm font-medium text-black">(Arraste para mover)</span>
                        </h2>
                        <div className="flex gap-2 relative">
                            {/* Job Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowJobFilter(!showJobFilter)}
                                    className="bg-slate-100 p-2 rounded-lg text-sm font-bold text-black px-4 hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    Filtrar por Vaga: {selectedJobs.length === 0 ? 'Todas' : `${selectedJobs.length} selecionada${selectedJobs.length > 1 ? 's' : ''}`}
                                    <span className="text-xs">▼</span>
                                </button>
                                {showJobFilter && (
                                    <div className="absolute top-full mt-2 right-0 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 min-w-[250px] max-h-[400px] overflow-y-auto">
                                        <div className="p-3 border-b border-slate-100">
                                            <button
                                                onClick={clearJobFilters}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-bold"
                                            >
                                                Limpar Filtros
                                            </button>
                                        </div>
                                        <div className="p-2">
                                            {uniqueJobs.map(job => (
                                                <label
                                                    key={job.id}
                                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedJobs.includes(job.id)}
                                                        onChange={() => toggleJobFilter(job.id)}
                                                        className="w-4 h-4 text-blue-600 rounded"
                                                    />
                                                    <span className="text-sm font-medium text-black flex-1">{job.title}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortMenu(!showSortMenu)}
                                    className="bg-slate-100 p-2 rounded-lg text-sm font-bold text-black px-4 hover:bg-slate-200 transition-colors flex items-center gap-2"
                                >
                                    Ordenar por: {getSortLabel()}
                                    <span className="text-xs">▼</span>
                                </button>
                                {showSortMenu && (
                                    <div className="absolute top-full mt-2 right-0 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 min-w-[200px]">
                                        <div className="p-2">
                                            {[
                                                { value: 'date-desc', label: 'Data (Recente)' },
                                                { value: 'date-asc', label: 'Data (Antiga)' },
                                                { value: 'name-asc', label: 'Nome (A-Z)' },
                                                { value: 'name-desc', label: 'Nome (Z-A)' }
                                            ].map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSortBy(option.value as any);
                                                        setShowSortMenu(false);
                                                    }}
                                                    className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-colors ${sortBy === option.value
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'text-black hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-6 min-h-[600px] overflow-x-auto pb-4 max-w-[calc(100vw-6rem)] lg:max-w-[calc(100vw-18rem)]">
                        {stages.map((stage) => (
                            <div
                                key={stage.id}
                                className={`flex-shrink-0 w-80 flex flex-col gap-4 ${draggedStageId === stage.id ? 'opacity-50' : ''}`}
                                draggable
                                onDragStart={() => handleDragStageStart(stage.id)}
                                onDragOver={(e) => handleDragStageOver(e, stage.id)}
                                onDragEnd={handleDragStageEnd}
                            >
                                <div className="flex items-center justify-between px-2 group">
                                    {editingStageId === stage.id ? (
                                        <div className="flex items-center gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editingStageName}
                                                onChange={(e) => setEditingStageName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveStageName();
                                                    if (e.key === 'Escape') handleCancelEditStage();
                                                }}
                                                className="flex-1 px-2 py-1 border-2 border-blue-500 rounded font-bold text-black text-sm uppercase"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSaveStageName}
                                                className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-green-600"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={handleCancelEditStage}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-600"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-bold text-black flex items-center gap-2 uppercase tracking-tight cursor-move">
                                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">⋮⋮</span>
                                                {stage.name}
                                                <span className="bg-[#0F172A] text-white text-xs py-0.5 px-2 rounded-full font-bold">
                                                    {getApplicationsByStage(stage.id).length}
                                                </span>
                                            </h3>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowStageMenu(showStageMenu === stage.id ? null : stage.id)}
                                                    className="text-xl text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    ⋮
                                                </button>
                                                {showStageMenu === stage.id && (
                                                    <div className="absolute top-full right-0 mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 min-w-[180px]">
                                                        <div className="p-2">
                                                            <button
                                                                onClick={() => handleEditStageName(stage.id)}
                                                                className="w-full text-left p-3 rounded-lg text-sm font-medium text-black hover:bg-slate-50 transition-colors flex items-center gap-2"
                                                            >
                                                                ✏️ Editar Nome
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteStage(stage.id)}
                                                                className="w-full text-left p-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                            >
                                                                🗑️ Remover Etapa
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col gap-4 p-1 rounded-2xl border-2 border-dashed border-transparent hover:border-slate-200 transition-all">
                                    {getApplicationsByStage(stage.id).map((app) => (
                                        <div
                                            key={app.id}
                                            draggable
                                            onDragStart={() => handleDragStart(app)}
                                            onClick={() => {
                                                setSelectedApplication(app);
                                                setIsDrillDownOpen(true);
                                            }}
                                            className={`${stage.color} p-5 rounded-2xl shadow-sm cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-white font-bold text-sm">
                                                    {app.candidate.fullName.charAt(0)}
                                                </div>
                                                <div className="flex gap-2">
                                                    {app.candidate.linkedinUrl && (
                                                        <a href={app.candidate.linkedinUrl} target="_blank" onClick={(e) => e.stopPropagation()} className="w-6 h-6 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                                                            in
                                                        </a>
                                                    )}
                                                    <span className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">⠿</span>
                                                </div>
                                            </div>

                                            <h4 className="font-bold text-[#0F172A] mb-1">{app.candidate.fullName}</h4>
                                            <p className="text-sm text-[#38BDF8] font-bold mb-3">{app.job.title}</p>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-xs text-black">
                                                    <span>📞</span> {app.candidate.phone}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-black">
                                                    <span>📍</span> {app.candidate.city}, {app.candidate.state}
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                                                <span className="text-black">⏱️ {new Date(app.appliedAt).toLocaleDateString('pt-BR')}</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingApplication(app);
                                                            setIsQuickEditOpen(true);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-bold"
                                                        title="Editar candidato"
                                                    >
                                                        ✏️ Vaga
                                                    </button>
                                                    <span className="text-[10px] font-bold text-blue-600 group-hover:underline">Ver mais →</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {getApplicationsByStage(stage.id).length === 0 && (
                                        <div className="py-12 flex flex-col items-center justify-center text-black grayscale opacity-50">
                                            <span className="text-4xl mb-2">📥</span>
                                            <span className="text-xs font-medium">Vazio</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add New Stage Button */}
                        <div className="flex-shrink-0 w-80 flex items-center justify-center">
                            <button
                                onClick={() => setIsAddStageModalOpen(true)}
                                className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-500 flex items-center justify-center text-2xl transition-colors">
                                    <span className="group-hover:text-white">+</span>
                                </div>
                                <span className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition-colors">
                                    Nova Etapa
                                </span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Candidate Database - Enhanced Table */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-black">Base de Talentos</h2>
                            <p className="text-black text-sm font-medium">Total de candidatos cadastrados na plataforma</p>
                        </div>
                        <button onClick={exportToCSV} className="text-[#38BDF8] font-bold text-sm hover:underline">📥 Exportar CSV</button>
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
                                                    <div className="text-xs text-black">{app.candidate.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-5 whitespace-nowrap">
                                            <div className="text-sm font-bold text-[#0F172A]">{app.job.title}</div>
                                            <span className="px-2 py-0.5 inline-flex text-[10px] items-center  font-bold rounded-full bg-blue-50 text-[#38BDF8] mt-1 uppercase">
                                                {stages.find((s) => s.id === app.currentStage)?.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-5 whitespace-nowrap text-sm text-black">
                                            {app.candidate.city}, {app.candidate.state}
                                        </td>
                                        <td className="px-4 py-5 whitespace-nowrap text-sm text-black" suppressHydrationWarning>
                                            {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-5 whitespace-nowrap text-right">
                                            <button className="text-black hover:text-[#0F172A] transition-colors">Ver Perfil</button>
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
