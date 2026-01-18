'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CandidateForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        cpf: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        linkedinUrl: '',
        portfolioUrl: '',
        resumeFile: null as File | null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lgpdConsent, setLgpdConsent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!lgpdConsent) {
            setError('Você deve aceitar os termos de consentimento da LGPD');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    jobId: 'default-job-id', // Sempre usa vaga padrão/Talent Pool
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erro ao enviar cadastro');
            }

            // Success message
            alert('✅ Cadastro enviado com sucesso! Nossa equipe de RH analisará seu perfil e entrará em contato.');
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, resumeFile: e.target.files[0] });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F1F5F9] to-white">
            {/* Header com branding */}
            <div className="bg-[#0F172A] text-white py-8 shadow-2xl">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-tr from-[#38BDF8] to-white rounded-lg"></div>
                        <h1 className="text-3xl font-bold">ATS Talento</h1>
                    </div>
                    <p className="text-lg text-white/80">Faça parte do nosso banco de talentos</p>
                </div>
            </div>

            {/* Main Form */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-black mb-2">
                            Cadastre-se no Banco de Talentos
                        </h2>
                        <p className="text-black/70 font-medium">
                            Envie seus dados e currículo. Nossa equipe entrará em contato quando surgirem oportunidades que combinem com seu perfil.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Dados Pessoais */}
                        <div className="space-y-5">
                            <h3 className="text-lg font-bold text-black border-b-2 border-[#38BDF8] pb-2 mb-4">
                                📋 Dados Pessoais
                            </h3>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Nome Completo *
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                    placeholder="João Silva"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">
                                        CPF *
                                    </label>
                                    <input
                                        type="text"
                                        name="cpf"
                                        required
                                        value={formData.cpf}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                        placeholder="123.456.789-00"
                                        maxLength={14}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                        placeholder="joao@email.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">
                                        Telefone (WhatsApp) *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">
                                        Estado *
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        required
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                        placeholder="SP"
                                        maxLength={2}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Cidade *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                    placeholder="São Paulo"
                                />
                            </div>
                        </div>

                        {/* Currículo */}
                        <div className="space-y-5 pt-6 border-t-2 border-slate-100">
                            <h3 className="text-lg font-bold text-black border-b-2 border-[#38BDF8] pb-2 mb-4">
                                📄 Currículo
                            </h3>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Envie seu currículo (PDF ou DOCX - Máx. 5MB)
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    className="w-full px-5 py-3.5 border-2 border-dashed border-[#38BDF8] rounded-xl bg-blue-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-[#38BDF8] file:text-white hover:file:brightness-110 cursor-pointer transition-all"
                                />
                                <p className="text-xs text-black/60 mt-2 font-medium">
                                    💡 Dica: Ao enviar seu currículo, nosso sistema preencherá automaticamente alguns dados.
                                </p>
                            </div>
                        </div>

                        {/* Links Profissionais */}
                        <div className="space-y-5 pt-6 border-t-2 border-slate-100">
                            <h3 className="text-lg font-bold text-black border-b-2 border-[#38BDF8] pb-2 mb-4">
                                🔗 Links Profissionais (Opcional)
                            </h3>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    LinkedIn
                                </label>
                                <input
                                    type="url"
                                    name="linkedinUrl"
                                    value={formData.linkedinUrl}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                    placeholder="https://linkedin.com/in/seuperfil"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-black mb-2">
                                    Portfolio/GitHub
                                </label>
                                <input
                                    type="url"
                                    name="portfolioUrl"
                                    value={formData.portfolioUrl}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                    placeholder="https://github.com/seuusuario"
                                />
                            </div>
                        </div>

                        {/* LGPD Consent */}
                        <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-200">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={lgpdConsent}
                                    onChange={(e) => setLgpdConsent(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-[#38BDF8] border-2 border-slate-300 rounded focus:ring-2 focus:ring-[#38BDF8]"
                                />
                                <span className="text-sm text-black/80 font-medium leading-relaxed">
                                    Eu concordo com o tratamento dos meus dados pessoais de acordo com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Entendo que meus dados serão utilizados exclusivamente para fins de recrutamento e seleção.
                                </span>
                            </label>
                        </div>

                        {error && (
                            <div className="p-5 bg-red-50 border-2 border-red-200 rounded-xl">
                                <p className="text-sm text-red-700 font-bold">⚠️ {error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !lgpdConsent}
                            className="w-full bg-[#0F172A] text-white py-4 px-8 rounded-xl font-bold text-lg shadow-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                        >
                            {loading ? '📤 Enviando...' : '✅ Enviar Cadastro'}
                        </button>

                        <p className="text-center text-sm text-black/60 font-medium">
                            Após o envio, nossa equipe analisará seu perfil e entrará em contato quando houver oportunidades compatíveis.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
