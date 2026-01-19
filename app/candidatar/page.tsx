'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Helper for CPF validation
const validateCPF = (cpf: string) => {
    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(rawCpf)) return false;

    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) sum = sum + parseInt(rawCpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(rawCpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum = sum + parseInt(rawCpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(rawCpf.substring(10, 11))) return false;

    return true;
};

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

export default function CandidateForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        cpf: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        country: 'Brasil',
        linkedinUrl: '',
        portfolioUrl: '',
        resumeFile: null as File | null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lgpdConsent, setLgpdConsent] = useState(false);

    // Auto-suggestion states
    const [stateSuggestions, setStateSuggestions] = useState<{ uf: string, name: string }[]>([]);
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showStateSuggestions, setShowStateSuggestions] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const [filteredCitySuggestions, setFilteredCitySuggestions] = useState<string[]>([]);

    useEffect(() => {
        if (formData.state.length === 2) {
            fetchCities(formData.state);
        } else {
            setCitySuggestions([]);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!lgpdConsent) {
            setError('Você deve aceitar os termos de consentimento da LGPD');
            return;
        }

        // Validate CPF
        if (!validateCPF(formData.cpf)) {
            setError('CPF inválido. Por favor, verifique os números digitados.');
            return;
        }

        // Validate Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('E-mail inválido.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create FormData to support file upload
            const submitData = new FormData();

            // Add all form fields
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof typeof formData];
                if (value !== null && value !== undefined) {
                    if (key === 'resumeFile' && value instanceof File) {
                        submitData.append('resumeFile', value);
                    } else if (typeof value === 'string') {
                        submitData.append(key, value);
                    }
                }
            });

            // Add jobId
            submitData.append('jobId', 'default-job-id');

            const response = await fetch('/api/candidates', {
                method: 'POST',
                body: submitData, // Send FormData instead of JSON
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

        setFormData({ ...formData, [name]: newValue });
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const MAX_SIZE = 5 * 1024 * 1024; // 5MB

            if (file.size > MAX_SIZE) {
                alert('⚠️ O arquivo é muito grande! Por favor, envie um arquivo com no máximo 5MB.');
                e.target.value = ''; // Clear input
                setFormData({ ...formData, resumeFile: null });
                return;
            }

            setFormData({ ...formData, resumeFile: file });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#F1F5F9] to-white">
            {/* Header com branding */}
            <div className="bg-[#0F172A] text-white py-8 shadow-2xl">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <img src="/LogoBranco.png" alt="Talento" className="w-12 h-12 object-contain" />
                        <h1 className="text-3xl font-bold">ATS Talento</h1>
                    </div>
                    <p className="text-lg text-white">Faça parte do nosso banco de talentos</p>
                </div>
            </div>

            {/* Main Form */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-black mb-2">
                            Cadastre-se no Banco de Talentos
                        </h2>
                        <p className="text-slate-700 font-medium">
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
                                        País *
                                    </label>
                                    <input
                                        type="text"
                                        name="country"
                                        required
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                        placeholder="Brasil"
                                    />
                                </div>

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

                                <div className="relative">
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
                                        maxLength={20}
                                        autoComplete="off"
                                    />
                                    {showStateSuggestions && stateSuggestions.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-100 rounded-xl shadow-xl overflow-hidden">
                                            {stateSuggestions.map((state) => (
                                                <div
                                                    key={state.uf}
                                                    onClick={() => handleSelectState(state)}
                                                    className="px-5 py-3 hover:bg-slate-50 cursor-pointer text-black font-medium transition-colors"
                                                >
                                                    <span className="font-bold">{state.uf}</span> - {state.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold text-black mb-2">
                                    Cidade *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleCityChange}
                                    className="w-full px-5 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#38BDF8] focus:border-[#38BDF8] transition-all font-medium text-black"
                                    placeholder="Comece a digitar..."
                                    autoComplete="off"
                                />
                                {showCitySuggestions && filteredCitySuggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-100 rounded-xl shadow-xl overflow-hidden">
                                        {filteredCitySuggestions.map((city) => (
                                            <div
                                                key={city}
                                                onClick={() => handleSelectCity(city)}
                                                className="px-5 py-3 hover:bg-slate-50 cursor-pointer text-black font-medium transition-colors"
                                            >
                                                {city}
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                <p className="text-xs text-slate-600 mt-2 font-medium">
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

                        <p className="text-center text-sm text-slate-600 font-medium">
                            Após o envio, nossa equipe analisará seu perfil e entrará em contato quando houver oportunidades compatíveis.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
