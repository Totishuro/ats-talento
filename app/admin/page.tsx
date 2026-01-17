'use client';

import { useEffect, useState } from 'react';

interface Candidate {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
}

interface Job {
    id: string;
    title: string;
}

interface Application {
    id: string;
    currentStage: string;
    appliedAt: string;
    candidate: Candidate;
    job: Job;
}

const STAGES = [
    { id: 'APPLIED', name: 'Inscritos', color: 'bg-gray-100' },
    { id: 'SCREENING', name: 'Triagem', color: 'bg-blue-100' },
    { id: 'HR_INTERVIEW', name: 'Entrevista RH', color: 'bg-purple-100' },
    { id: 'TECHNICAL_INTERVIEW', name: 'Entrevista Técnica', color: 'bg-yellow-100' },
    { id: 'PROPOSAL_SENT', name: 'Proposta Enviada', color: 'bg-orange-100' },
    { id: 'HIRED', name: 'Contratado', color: 'bg-green-100' },
];

export default function AdminPanel() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState<Application | null>(null);

    useEffect(() => {
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

    const handleDrop = async (stageId: string) => {
        if (!draggedItem) return;

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

    const getApplicationsByStage = (stageId: string) => {
        return applications.filter((app) => app.currentStage === stageId);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg text-gray-600">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#0b1b2f] text-white p-6 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">ATS Talento - Admin</h1>
                            <p className="text-slate-300">Painel de Recrutamento</p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/admin/vagas'}
                            className="px-6 py-3 bg-[#1e3a5f] hover:bg-[#b8c5d6] hover:text-[#0b1b2f] rounded-lg font-semibold transition-colors"
                        >
                            📋 Gerenciar Vagas
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Total de Candidatos</div>
                        <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Novos (Hoje)</div>
                        <div className="text-2xl font-bold text-blue-600" suppressHydrationWarning>
                            {applications.filter(
                                (app) =>
                                    new Date(app.appliedAt).toDateString() === new Date().toDateString()
                            ).length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Em Entrevista</div>
                        <div className="text-2xl font-bold text-purple-600">
                            {getApplicationsByStage('HR_INTERVIEW').length +
                                getApplicationsByStage('TECHNICAL_INTERVIEW').length}
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-sm text-gray-600">Contratados</div>
                        <div className="text-2xl font-bold text-green-600">
                            {getApplicationsByStage('HIRED').length}
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">
                        Pipeline de Candidatos (Arraste para mover)
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {STAGES.map((stage) => (
                            <div
                                key={stage.id}
                                className={`${stage.color} rounded-lg p-4 min-h-[400px]`}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(stage.id)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-sm">{stage.name}</h3>
                                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium">
                                        {getApplicationsByStage(stage.id).length}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {getApplicationsByStage(stage.id).map((app) => (
                                        <div
                                            key={app.id}
                                            draggable
                                            onDragStart={() => handleDragStart(app)}
                                            className="bg-white p-3 rounded-md shadow-sm cursor-move hover:shadow-md transition-shadow border border-gray-200"
                                        >
                                            <div className="font-medium text-sm text-gray-900 mb-1">
                                                {app.candidate.fullName}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                {app.job.title}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2">
                                                {app.candidate.city}, {app.candidate.state}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                                                {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Candidate Database */}
                <div className="bg-white p-6 rounded-lg shadow mt-8">
                    <h2 className="text-xl font-semibold mb-4">Banco de Candidatos</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nome
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Telefone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Localização
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Data
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {app.candidate.fullName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{app.candidate.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{app.candidate.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">
                                                {app.candidate.city}, {app.candidate.state}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {STAGES.find((s) => s.id === app.currentStage)?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
                                            {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
