'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Job {
    id: string;
    title: string;
    department: string;
}

export default function CandidateForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vagaId = searchParams.get('vaga');

    const [job, setJob] = useState<Job | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        cpf: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        linkedinUrl: '',
        portfolioUrl: '',
        jobId: vagaId || 'default-job-id', // In production, this would come from job selection
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao enviar candidatura');
            }

            alert('Candidatura enviada com sucesso!');
            router.push('/admin');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (vagaId && vagaId !== 'default-job-id') {
            fetchJob();
        }
    }, [vagaId]);

    const fetchJob = async () => {
        try {
            const response = await fetch('/api/jobs');
            const jobs = await response.json();
            const selectedJob = jobs.find((j: Job) => j.id === vagaId);
            if (selectedJob) {
                setJob(selectedJob);
            }
        } catch (error) {
            console.error('Erro ao carregar vaga:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        ATS Talento
                    </h1>
                    {job ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                            <p className="text-sm text-blue-600 font-medium">Candidatura para:</p>
                            <p className="text-lg font-bold text-blue-900">{job.title}</p>
                            <p className="text-sm text-blue-700">{job.department}</p>
                        </div>
                    ) : (
                        <p className="text-gray-600">Formulário de Candidatura</p>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Dados Pessoais */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Dados Pessoais
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nome Completo *
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="João Silva"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CPF *
                                </label>
                                <input
                                    type="text"
                                    name="cpf"
                                    required
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="123.456.789-00"
                                    maxLength={14}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="joao@email.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefone (WhatsApp) *
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    required
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="SP"
                                    maxLength={2}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cidade *
                            </label>
                            <input
                                type="text"
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="São Paulo"
                            />
                        </div>
                    </div>

                    {/* Links Profissionais */}
                    <div className="space-y-4 pt-6 border-t">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Links Profissionais (Opcional)
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                LinkedIn
                            </label>
                            <input
                                type="url"
                                name="linkedinUrl"
                                value={formData.linkedinUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://linkedin.com/in/seuper fil"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Portfolio/GitHub
                            </label>
                            <input
                                type="url"
                                name="portfolioUrl"
                                value={formData.portfolioUrl}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://github.com/seuusua rio"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#0b1b2f] text-white py-3 px-6 rounded-md font-semibold hover:bg-[#1e3a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Enviando...' : 'Enviar Candidatura'}
                    </button>

                    <p className="text-xs text-gray-500 text-center">
                        Ao enviar, você concorda com os termos da LGPD
                    </p>
                </form>
            </div>
        </div>
    );
}
