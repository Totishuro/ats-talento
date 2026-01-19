'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Candidate {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    cpf: string;
    city: string;
    state: string;
    country?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    resumeFileUrl?: string;
    createdAt: string;
    applications: Array<{
        id: string;
        currentStage: string;
        job: {
            title: string;
        };
    }>;
}

const BRAZILIAN_STATES = [
    { uf: 'AC', name: 'Acre' }, { uf: 'AL', name: 'Alagoas' }, { uf: 'AP', name: 'Amapá' },
    { uf: 'AM', name: 'Amazonas' }, { uf: 'BA', name: 'Bahia' }, { uf: 'CE', name: 'Ceará' },
    { uf: 'DF', name: 'Distrito Federal' }, { uf: 'ES', name: 'Espírito Santo' }, { uf: 'GO', name: 'Goiás' },
    { uf: 'MA', name: 'Maranhão' }, { uf: 'MT', name: 'Mato Grosso' }, { uf: 'MS', name: 'Mato Grosso do Sul' },
    { uf: 'MG', name: 'Minas Gerais' }, { uf: 'PA', name: 'Pará' }, { uf: 'PB', name: 'Paraíba' },
    { uf: 'PR', name: 'Paraná' }, { uf: 'PE', name: 'Pernambuco' }, { uf: 'PI', name: 'Piauí' },
    { uf: 'RJ', name: 'Rio de Janeiro' }, { uf: 'RN', name: 'Rio Grande do Norte' }, { uf: 'RS', name: 'Rio Grande do Sul' },
    { uf: 'RO', name: 'Rondônia' }, { uf: 'RR', name: 'Roraima' }, { uf: 'SC', name: 'Santa Catarina' },
    { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' }
];

// Helper for CPF masking
const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

// Helper for Phone masking
const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};

export default function CandidatesPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Edit states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
    const [editFormData, setEditFormData] = useState({
        fullName: '',
        cpf: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        country: 'Brasil',
        linkedinUrl: '',
        portfolioUrl: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [editError, setEditError] = useState('');

    // Auto-suggestion states for Edit Modal
    const [stateSuggestions, setStateSuggestions] = useState<{ uf: string, name: string }[]>([]);
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showStateSuggestions, setShowStateSuggestions] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const [filteredCitySuggestions, setFilteredCitySuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (editFormData.state.length === 2 && isEditModalOpen) {
            fetchCities(editFormData.state);
        }
    }, [editFormData.state, isEditModalOpen]);

    const fetchCities = async (uf: string) => {
        try {
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
            const data = await response.json();
            setCitySuggestions(data.map((city: any) => city.nome));
        } catch (error) {
            console.error('Erro ao buscar cidades:', error);
            setCitySuggestions([]);
        }
    };

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

    const handleEdit = (candidate: Candidate) => {
        setEditingCandidate(candidate);
        setEditFormData({
            fullName: candidate.fullName,
            cpf: maskCPF(candidate.cpf),
            email: candidate.email,
            phone: maskPhone(candidate.phone),
            city: candidate.city,
            state: candidate.state,
            country: candidate.country || 'Brasil',
            linkedinUrl: candidate.linkedinUrl || '',
            portfolioUrl: candidate.portfolioUrl || ''
        });
        setEditError('');
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'cpf') {
            newValue = maskCPF(value);
        } else if (name === 'phone') {
            newValue = maskPhone(value);
        } else if (name === 'state') {
            newValue = value.toUpperCase();
            const suggestions = BRAZILIAN_STATES.filter(state =>
                state.uf.includes(newValue) ||
                state.name.toLowerCase().startsWith(newValue.toLowerCase())
            );
            setStateSuggestions(suggestions);
            setShowStateSuggestions(newValue.length > 0);
        }

        setEditFormData({ ...editFormData, [name]: newValue });
    };

    const handleSelectState = (state: { uf: string, name: string }) => {
        setEditFormData({ ...editFormData, state: state.uf });
        setShowStateSuggestions(false);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEditFormData({ ...editFormData, city: value });

        if (value.length > 1) {
            const filtered = citySuggestions.filter(city =>
                city.toLowerCase().startsWith(value.toLowerCase())
            ).slice(0, 5);
            setFilteredCitySuggestions(filtered);
            setShowCitySuggestions(filtered.length > 0);
        } else {
            setShowCitySuggestions(false);
        }
    };

    const handleSelectCity = (city: string) => {
        setEditFormData({ ...editFormData, city });
        setShowCitySuggestions(false);
    };

    const handleUpdateCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCandidate) return;

        setIsSaving(true);
        setEditError('');

        try {
            const response = await fetch(`/api/candidates/${editingCandidate.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao atualizar candidato');
            }

            // Refresh list
            await fetchCandidates();
            setIsEditModalOpen(false);
            setEditingCandidate(null);
            alert('✅ Candidato atualizado com sucesso!');
        } catch (error: any) {
            setEditError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const exportToCSV = () => {
        // CSV Headers
        const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Estado', 'LinkedIn', 'Portfolio', 'Cadastrado em'];

        // Convert candidates to CSV rows
        const rows = candidates.map(c => [
            c.fullName,
            c.email,
            c.phone,
            c.city,
            c.state,
            c.linkedinUrl || '-',
            c.portfolioUrl || '-',
            new Date(c.createdAt).toLocaleDateString('pt-BR')
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
        const filename = `candidatos_base_${new Date().toISOString().split('T')[0]}.csv`;

        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(url), 100);
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
                    <img src="/LogoBranco.png" alt="Talento" className="w-10 h-10 object-contain" />
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
                            <p className="text-slate-700 font-medium">
                                {candidates.length} {candidates.length === 1 ? 'candidato cadastrado' : 'candidatos cadastrados'}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={exportToCSV}
                                className="text-[#38BDF8] font-bold text-sm hover:underline"
                            >
                                📥 Exportar CSV
                            </button>
                            <button
                                onClick={() => router.push('/admin')}
                                className="bg-white text-[#0F172A] px-5 py-2.5 rounded-lg font-semibold shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                ← Voltar ao Dashboard
                            </button>
                        </div>
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
                            <p className="text-slate-600 font-medium mb-6">
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
                                    <tr className="bg-slate-50">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Candidato</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Contato</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Localização</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Candidaturas</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Cadastrado</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Currículo</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Links</th>
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
                                                        <div className="text-sm text-slate-500 font-medium">ID: {candidate.id.substring(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <div className="text-sm text-black font-medium">{candidate.email}</div>
                                                <div className="text-sm text-slate-500 font-medium">{candidate.phone}</div>
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
                                                <div className="text-sm text-slate-500 font-medium">
                                                    {new Date(candidate.createdAt).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-5 whitespace-nowrap">
                                                {candidate.resumeFileUrl ? (
                                                    <a
                                                        href={candidate.resumeFileUrl}
                                                        download
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#38BDF8] text-white rounded-lg font-bold text-xs hover:brightness-110 transition-all"
                                                    >
                                                        📄 Baixar CV
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400 font-medium">-</span>
                                                )}
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
                                                    <button
                                                        onClick={() => handleEdit(candidate)}
                                                        className="text-slate-600 hover:text-[#0F172A] font-bold text-sm transition-colors border-l pl-2 border-slate-200"
                                                    >
                                                        📝 Editar
                                                    </button>
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

            {/* Edit Candidate Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in duration-200">
                        <div className="sticky top-0 bg-white/80 backdrop-blur-md px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-black">Editar Candidato</h2>
                                <p className="text-sm text-slate-500 font-medium">Atualize as informações de {editingCandidate?.fullName}</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-black"
                            >
                                <span className="text-2xl">✕</span>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateCandidate} className="p-8 space-y-6">
                            {editError && (
                                <div className="p-4 bg-red-50 border-2 border-red-100 rounded-xl text-red-700 text-sm font-bold">
                                    ⚠️ {editError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-black mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        value={editFormData.fullName}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">CPF</label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        required
                                        value={editFormData.cpf}
                                        onChange={handleEditChange}
                                        maxLength={14}
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">E-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={editFormData.email}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">Telefone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        required
                                        value={editFormData.phone}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">País</label>
                                    <input
                                        type="text"
                                        name="country"
                                        required
                                        value={editFormData.country}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-bold text-black mb-2">Estado</label>
                                    <input
                                        type="text"
                                        name="state"
                                        required
                                        value={editFormData.state}
                                        onChange={handleEditChange}
                                        onFocus={() => editFormData.state.length > 0 && setShowStateSuggestions(true)}
                                        maxLength={2}
                                        autoComplete="off"
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                    />
                                    {showStateSuggestions && stateSuggestions.length > 0 && (
                                        <div className="absolute z-[110] w-full mt-1 bg-white border-2 border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                            {stateSuggestions.map((state) => (
                                                <div
                                                    key={state.uf}
                                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-black font-medium border-b border-slate-50 last:border-0 transition-colors"
                                                    onClick={() => handleSelectState(state)}
                                                >
                                                    <span className="font-bold text-[#38BDF8] mr-2">{state.uf}</span> {state.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="md:col-span-2 relative">
                                    <label className="block text-sm font-bold text-black mb-2">Cidade</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={editFormData.city}
                                        onChange={handleCityChange}
                                        onFocus={() => editFormData.city.length > 1 && setShowCitySuggestions(true)}
                                        autoComplete="off"
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                    />
                                    {showCitySuggestions && filteredCitySuggestions.length > 0 && (
                                        <div className="absolute z-[110] w-full mt-1 bg-white border-2 border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                            {filteredCitySuggestions.map((city) => (
                                                <div
                                                    key={city}
                                                    className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-black font-medium border-b border-slate-50 last:border-0 transition-colors"
                                                    onClick={() => handleSelectCity(city)}
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="font-bold text-black">Links e Currículo</h3>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">LinkedIn</label>
                                    <input
                                        type="url"
                                        name="linkedinUrl"
                                        value={editFormData.linkedinUrl}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">Portfolio</label>
                                    <input
                                        type="url"
                                        name="portfolioUrl"
                                        value={editFormData.portfolioUrl}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl focus:border-[#38BDF8] ring-0 outline-none transition-all font-medium text-black"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-6 py-3.5 border-2 border-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-[#0F172A] text-white px-6 py-3.5 rounded-xl font-bold shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
