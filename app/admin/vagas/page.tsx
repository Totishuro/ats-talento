'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Job {
    id: string;
    title: string;
    department: string;
    companyName: string;
    description: string;
    requirements: string;
    location: string;
    city: string;
    state: string;
    workMode: string;
    salaryRange?: string;
    salaryBudget?: string;
    status: string;
    createdAt: string;
    _count?: {
        applications: number;
    };
}

export default function JobsManagement() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        companyName: '',
        description: '',
        requirements: '',
        location: '',
        city: '',
        state: '',
        workMode: 'PRESENCIAL',
        salaryRange: '',
        salaryBudget: '',
        status: 'DRAFT',
    });

    // Auto-suggestion states for Job Form
    const [stateSuggestions, setStateSuggestions] = useState<{ uf: string, name: string }[]>([]);
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showStateSuggestions, setShowStateSuggestions] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const [filteredCitySuggestions, setFilteredCitySuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (formData.state.length === 2) {
            fetchCities(formData.state);
        }
    }, [formData.state]);

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

    const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase();
        setFormData({ ...formData, state: value });

        const suggestions = BRAZILIAN_STATES.filter(state =>
            state.uf.includes(value) ||
            state.name.toLowerCase().startsWith(value.toLowerCase())
        );
        setStateSuggestions(suggestions);
        setShowStateSuggestions(value.length > 0);
    };

    const handleSelectState = (state: { uf: string, name: string }) => {
        setFormData({ ...formData, state: state.uf });
        setShowStateSuggestions(false);
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData({ ...formData, city: value });

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
        setFormData({ ...formData, city });
        setShowCitySuggestions(false);
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        const response = await fetch('/api/jobs');
        const data = await response.json();
        setJobs(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const url = '/api/jobs';
        const method = editingJob ? 'PATCH' : 'POST';
        const body = editingJob ? { id: editingJob.id, ...formData } : formData;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            await fetchJobs();
            setShowForm(false);
            setEditingJob(null);
            setFormData({
                title: '',
                department: '',
                companyName: '',
                description: '',
                requirements: '',
                location: '',
                city: '',
                state: '',
                workMode: 'PRESENCIAL',
                salaryRange: '',
                salaryBudget: '',
                status: 'DRAFT',
            });
        }
    };

    const handleEdit = (job: Job) => {
        setEditingJob(job);
        setFormData({
            title: job.title,
            department: job.department,
            companyName: job.companyName,
            description: job.description,
            requirements: job.requirements,
            location: job.location || '',
            city: job.city || '',
            state: job.state || '',
            workMode: job.workMode,
            salaryRange: job.salaryRange || '',
            salaryBudget: job.salaryBudget || '',
            status: job.status,
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja deletar esta vaga?')) return;

        await fetch('/api/jobs', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        await fetchJobs();
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            DRAFT: 'bg-gray-100 text-gray-800',
            OPEN: 'bg-green-100 text-green-800',
            CLOSED: 'bg-red-100 text-red-800',
        };
        const labels: Record<string, string> = {
            DRAFT: 'Rascunho',
            OPEN: 'Aberta',
            CLOSED: 'Fechada',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
                {labels[status]}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#0b1b2f] text-white p-6 shadow-lg">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Gerenciamento de Vagas</h1>
                        <p className="text-slate-300">Crie e gerencie as oportunidades</p>
                    </div>
                    <button
                        onClick={() => router.push('/admin')}
                        className="px-4 py-2 bg-[#1e3a5f] hover:bg-[#b8c5d6] hover:text-[#0b1b2f] rounded-lg transition-colors"
                    >
                        ← Voltar ao Painel
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Action Button */}
                <div className="mb-6">
                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingJob(null);
                            setFormData({
                                title: '',
                                department: '',
                                companyName: '',
                                description: '',
                                requirements: '',
                                location: '',
                                city: '',
                                state: '',
                                workMode: 'PRESENCIAL',
                                salaryRange: '',
                                salaryBudget: '',
                                status: 'DRAFT',
                            });
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                        {showForm ? '✕ Cancelar' : '+ Nova Vaga'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingJob ? 'Editar Vaga' : 'Nova Vaga'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-sm text-blue-900 font-bold mb-2">🏢 Empresa Cliente</p>
                                <p className="text-sm text-blue-800 mb-3">A Talento conecta talentos com empresas. Informe qual empresa está contratando:</p>
                                <input
                                    type="text"
                                    required
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="w-full px-4 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: Tech Solutions LTDA"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Título da Vaga *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md"
                                        placeholder="Ex: Desenvolvedor Full Stack"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Departamento *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md"
                                        placeholder="Ex: Tecnologia"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição da Vaga</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-md"
                                    placeholder="Descreva as responsabilidades e atividades..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Requisitos</label>
                                <textarea
                                    rows={4}
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-md"
                                    placeholder="Liste os requisitos necessários..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1">Estado (UF)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.state}
                                        onChange={handleStateChange}
                                        onFocus={() => formData.state.length > 0 && setShowStateSuggestions(true)}
                                        maxLength={2}
                                        autoComplete="off"
                                        className="w-full px-4 py-2 border rounded-md"
                                        placeholder="EX: SP"
                                    />
                                    {showStateSuggestions && stateSuggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {stateSuggestions.map((state) => (
                                                <div
                                                    key={state.uf}
                                                    className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-slate-800"
                                                    onClick={() => handleSelectState(state)}
                                                >
                                                    <span className="font-bold text-blue-600 mr-2">{state.uf}</span> {state.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1">Cidade</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.city}
                                        onChange={handleCityChange}
                                        onFocus={() => formData.city.length > 1 && setShowCitySuggestions(true)}
                                        autoComplete="off"
                                        className="w-full px-4 py-2 border rounded-md"
                                        placeholder="Ex: São Paulo"
                                    />
                                    {showCitySuggestions && filteredCitySuggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {filteredCitySuggestions.map((city) => (
                                                <div
                                                    key={city}
                                                    className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-slate-800"
                                                    onClick={() => handleSelectCity(city)}
                                                >
                                                    {city}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Modelo de Trabalho</label>
                                    <select
                                        value={formData.workMode}
                                        onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md"
                                    >
                                        <option value="PRESENCIAL">Presencial</option>
                                        <option value="HIBRIDO">Híbrido</option>
                                        <option value="REMOTO">Remoto</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Faixa Salarial Pública</label>
                                    <input
                                        type="text"
                                        value={formData.salaryRange}
                                        onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-md"
                                        placeholder="Ex: R$ 5.000 - 8.000"
                                    />
                                    <p className="text-xs text-gray-800 mt-1">Será exibida para candidatos</p>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <label className="block text-sm font-bold text-yellow-900 mb-1">
                                    🔒 Budget Confidencial do Gestor
                                </label>
                                <p className="text-sm text-yellow-800 mb-2">Esta informação é PRIVADA e nunca será exibida para candidatos</p>
                                <input
                                    type="text"
                                    value={formData.salaryBudget}
                                    onChange={(e) => setFormData({ ...formData, salaryBudget: e.target.value })}
                                    className="w-full px-4 py-2 border border-yellow-300 rounded-md bg-white"
                                    placeholder="Ex: R$ 10.000 (máximo que a empresa vai pagar)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-md"
                                >
                                    <option value="DRAFT">Rascunho (não visível)</option>
                                    <option value="OPEN">Aberta (publicada)</option>
                                    <option value="CLOSED">Fechada</option>
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                    {editingJob ? 'Atualizar Vaga' : 'Criar Vaga'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingJob(null);
                                    }}
                                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Jobs List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Vagas Cadastradas ({jobs.length})</h2>

                        {jobs.length === 0 ? (
                            <p className="text-gray-800 text-center py-8">
                                Nenhuma vaga cadastrada ainda. Clique em "Nova Vaga" para começar.
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold">{job.title}</h3>
                                                    {getStatusBadge(job.status)}
                                                </div>
                                                <p className="text-sm font-semibold text-blue-600 mb-1">🏢 {job.companyName}</p>
                                                <p className="text-sm text-gray-900 mb-2">{job.department}</p>
                                                {job.description && (
                                                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                                                        {job.description}
                                                    </p>
                                                )}
                                                <div className="flex flex-wrap gap-3 text-sm text-gray-800">
                                                    {(job.city || job.state) && <span>📍 {job.city}{job.city && job.state ? ', ' : ''}{job.state}</span>}
                                                    {job.workMode && <span>💼 {job.workMode}</span>}
                                                    {job.salaryRange && <span>💰 Público: {job.salaryRange}</span>}
                                                    {job.salaryBudget && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">🔒 Budget: {job.salaryBudget}</span>}
                                                    <span>👥 {job._count?.applications || 0} candidatos</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleEdit(job)}
                                                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job.id)}
                                                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
