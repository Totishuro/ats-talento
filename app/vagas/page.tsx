'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Job {
    id: string;
    title: string;
    department: string;
    companyName: string;
    description: string;
    requirements: string;
    location: string;
    workMode: string;
    salaryRange?: string;
    // salaryBudget is NEVER included - confidential!
    _count?: {
        applications: number;
    };
}

export default function VagasPublicas() {
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch('/api/jobs/public');
            const data = await response.json();
            setJobs(data);
        } catch (error) {
            console.error('Erro ao carregar vagas:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWorkModeLabel = (mode: string) => {
        const labels: Record<string, string> = {
            PRESENCIAL: '🏢 Presencial',
            HIBRIDO: '🔄 Híbrido',
            REMOTO: '🌐 Remoto',
        };
        return labels[mode] || mode;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-lg text-gray-900">Carregando vagas...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white shadow-lg border-b-4 border-[#0b1b2f]">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img src="/logo-dark.png" alt="Talento" className="h-16 w-auto" />
                            <div>
                                <h1 className="text-2xl font-bold text-[#0b1b2f]">Talento</h1>
                                <p className="text-gray-900 text-sm mt-1">Oportunidades de Carreira</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 text-[#0b1b2f] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            ← Início
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Venha fazer parte do nosso time!
                    </h2>
                    <p className="text-xl text-gray-900">
                        {jobs.length} {jobs.length === 1 ? 'vaga disponível' : 'vagas disponíveis'}
                    </p>
                </div>

                {jobs.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Nenhuma vaga disponível no momento
                        </h3>
                        <p className="text-gray-900">
                            Acompanhe esta página para ser notificado de novas oportunidades!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {job.title}
                                        </h3>
                                        <p className="text-lg text-blue-600 mb-4">{job.department}</p>

                                        {job.description && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">Descrição:</h4>
                                                <p className="text-gray-900 whitespace-pre-line">{job.description}</p>
                                            </div>
                                        )}

                                        {job.requirements && (
                                            <div className="mb-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">Requisitos:</h4>
                                                <p className="text-gray-900 whitespace-pre-line">{job.requirements}</p>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-4 text-sm text-gray-900 mb-6">
                                            {job.location && (
                                                <div className="flex items-center gap-2">
                                                    <span>📍</span>
                                                    <span>{job.location}</span>
                                                </div>
                                            )}
                                            {job.workMode && (
                                                <div className="flex items-center gap-2">
                                                    <span>{getWorkModeLabel(job.workMode)}</span>
                                                </div>
                                            )}
                                            {job.salaryRange && (
                                                <div className="flex items-center gap-2">
                                                    <span>💰</span>
                                                    <span>{job.salaryRange}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/candidatar?vaga=${job.id}`)}
                                    className="w-full bg-[#0b1b2f] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#1e3a5f] transition-colors text-lg"
                                >
                                    Candidatar-se para esta vaga →
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white mt-16">
                <div className="max-w-6xl mx-auto px-6 py-8 text-center text-gray-900">
                    <p>© 2026 Talento. Sistema de Recrutamento e Seleção</p>
                </div>
            </div>
        </div>
    );
}
