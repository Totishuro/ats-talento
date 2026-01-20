'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

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

// Helper for masking
const maskCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
const maskPhone = (value: string) => value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
const maskCEP = (value: string) => value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1');
const maskCurrency = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    if (!numeric) return '';
    const formatted = (Number(numeric) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return formatted;
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
    { uf: 'SC', name: 'Santa Catarina' }, { uf: 'SP', name: 'São Paulo' }, { uf: 'SE', name: 'Sergipe' }, { uf: 'TO', name: 'Tocantins' }
];

const TECHNICAL_SKILLS_OPTIONS = ['Excel', 'Inglês', 'Espanhol', 'Power BI', 'Python', 'Vendas', 'Gestão de Projetos'];
const DRIVER_LICENSE_OPTIONS = ['A', 'B', 'AB', 'C', 'D', 'E'];

export default function CandidateForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const jobId = searchParams.get('jobId');

    const [formData, setFormData] = useState({
        fullName: '',
        cpf: '',
        birthDate: '',
        email: '',
        phone: '',
        cep: '',
        address: '',
        neighborhood: '',
        city: '',
        state: '',
        country: 'Brasil',
        aboutMe: '',
        currentSalary: '',
        expectedSalary: '',
        employmentStatus: '',
        startAvailability: '',
        scheduleAvailability: '',
        bestInterviewTime: '',
        technicalSkills: [] as string[],
        driverLicense: [] as string[],
        linkedinUrl: '',
        portfolioUrl: '',
        otherSkills: '',
        resumeFile: null as File | null,
    });
    const [newSkill, setNewSkill] = useState('');
    const [customAvailability, setCustomAvailability] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lgpdConsent, setLgpdConsent] = useState(false);
    const [progress, setProgress] = useState(0);

    // Auto-suggestion states
    const [stateSuggestions, setStateSuggestions] = useState<{ uf: string, name: string }[]>([]);
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [showStateSuggestions, setShowStateSuggestions] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const [filteredCitySuggestions, setFilteredCitySuggestions] = useState<string[]>([]);

    // Duplicate Challenge State
    const [isChallengeOpen, setIsChallengeOpen] = useState(false);
    const [challengeData, setChallengeData] = useState<{ id: string, maskedPhone: string, maskedEmail: string }>({ id: '', maskedPhone: '', maskedEmail: '' });
    const [challengeInput, setChallengeInput] = useState('');
    const [challengeError, setChallengeError] = useState('');

    useEffect(() => {
        // Calculate progress
        const fields = [
            formData.fullName, formData.cpf, formData.birthDate, formData.email,
            formData.phone, formData.city, formData.state, formData.resumeFile
        ];
        const filled = fields.filter(f => !!f).length;
        setProgress(Math.round((filled / fields.length) * 100));
    }, [formData]);

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
        }
    };

    const fetchAddress = async (cep: string) => {
        const rawCep = cep.replace(/\D/g, '');
        if (rawCep.length !== 8) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
            const data = await response.json();

            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    address: data.logradouro || '',
                    neighborhood: data.bairro || '',
                    city: data.localidade || '',
                    state: data.uf || '',
                }));
            }
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'cpf') newValue = maskCPF(value);
        if (name === 'phone') newValue = maskPhone(value);
        if (name === 'cep') {
            newValue = maskCEP(value);
            if (newValue.length === 9) {
                fetchAddress(newValue);
            }
        }
        if (name === 'currentSalary' || name === 'expectedSalary') newValue = maskCurrency(value);
        if (name === 'state') {
            newValue = value.toUpperCase();
            setStateSuggestions(BRAZILIAN_STATES.filter(s => s.uf.includes(newValue) || s.name.toLowerCase().startsWith(newValue.toLowerCase())));
            setShowStateSuggestions(newValue.length > 0);
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleCheckboxChange = (name: 'technicalSkills' | 'driverLicense', value: string) => {
        setFormData(prev => {
            const current = [...prev[name]];
            if (current.includes(value)) {
                return { ...prev, [name]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [name]: [...current, value] };
            }
        });
    };

    const handleAddOtherSkill = () => {
        if (newSkill.trim() && !formData.technicalSkills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                technicalSkills: [...prev.technicalSkills, newSkill.trim()],
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            technicalSkills: prev.technicalSkills.filter(s => s !== skill),
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const MAX_SIZE = 5 * 1024 * 1024;
            if (file.size > MAX_SIZE) {
                alert('⚠️ O arquivo é muito grande! Máximo 5MB.');
                e.target.value = '';
                return;
            }
            setFormData(prev => ({ ...prev, resumeFile: file }));
        }
    };

    const checkCandidateExists = async () => {
        try {
            const res = await fetch(`/api/candidates/check?cpf=${formData.cpf.replace(/\D/g, '')}`);
            const data = await res.json();
            return data;
        } catch (e) {
            return { exists: false };
        }
    };

    const handleChallengeSubmit = async () => {
        // Simple client-side validation for demo (in prod, use server verify)
        // Here we just accept if they know their phone or email or CEP
        if (challengeInput.replace(/\D/g, '') === formData.phone.replace(/\D/g, '') ||
            challengeInput.toLowerCase() === formData.email.toLowerCase() ||
            challengeInput.replace(/\D/g, '') === formData.cep.replace(/\D/g, '')) {
            setIsChallengeOpen(false);
            await submitForm(true); // Force update
        } else {
            setChallengeError('Dados incorretos. A atualização foi bloqueada para segurança.');
        }
    };

    const submitForm = async (forceUpdate: boolean) => {
        try {
            setLoading(true);
            const submitData = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'technicalSkills' || key === 'driverLicense') {
                    (value as string[]).forEach(item => submitData.append(key, item));
                } else if (key === 'startAvailability' && value === 'outro') {
                    submitData.append(key, customAvailability);
                } else if (key === 'resumeFile') {
                    if (value) submitData.append(key, value as File);
                } else if (key === 'currentSalary' || key === 'expectedSalary') {
                    const numeric = (value as string).replace(/\D/g, '');
                    submitData.append(key, (Number(numeric) / 100).toString());
                } else {
                    submitData.append(key, value as string);
                }
            });

            if (jobId) submitData.append('jobId', jobId);
            if (forceUpdate) submitData.append('forceUpdate', 'true');

            const response = await fetch('/api/candidates', {
                method: 'POST',
                body: submitData,
            });

            if (!response.ok) throw new Error('Erro ao enviar cadastro');

            alert('✅ Cadastro enviado com sucesso!');
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!lgpdConsent) {
            setError('Você precisa concordar com os termos da LGPD.');
            setLoading(false);
            return;
        }
        if (!validateCPF(formData.cpf)) { setError('CPF inválido'); setLoading(false); return; }


        // Check for duplicates first
        const check = await checkCandidateExists();
        if (check.exists) {
            setChallengeData(check);
            setIsChallengeOpen(true);
            setLoading(false);
            return;
        }

        await submitForm(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="bg-[#0F172A] text-white py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <img src="/LogoBranco.png" alt="Talento" className="w-16 h-16 object-contain" />
                        <div>
                            <h1 className="text-3xl font-bold">Talento Connection</h1>
                            <p className="text-blue-200">Plataforma Inteligente de Carreira</p>
                        </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
                        <div className="text-sm font-medium mb-1 text-white">Progresso do Cadastro</div>
                        <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="text-right text-xs mt-1 text-blue-100">{progress}% concluído</div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 -mt-8 pb-20">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100 space-y-12">
                    {/* Seção 1: Perfil Profissional */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-blue-500 pb-3">
                            <span className="text-2xl">👤</span>
                            <h2 className="text-xl font-bold text-slate-900">Perfil Profissional</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-900 mb-2">Nome Completo *</label>
                                <input name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">CPF * (Chave Única)</label>
                                <input name="cpf" required value={formData.cpf} onChange={handleChange} maxLength={14} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Data de Nascimento *</label>
                                <input name="birthDate" type="date" required value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Email *</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">WhatsApp/Telefone *</label>
                                <input name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: Localização */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-blue-500 pb-3">
                            <span className="text-2xl">📍</span>
                            <h2 className="text-xl font-bold text-slate-900">Onde você mora?</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">CEP *</label>
                                <input name="cep" required value={formData.cep} onChange={handleChange} maxLength={9} placeholder="00000-000" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div className="md:col-span-1 hidden md:block"></div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-900 mb-2">Endereço (Rua e Nº) *</label>
                                <input name="address" required value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Bairro *</label>
                                <input name="neighborhood" required value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Estado *</label>
                                    <input name="state" required value={formData.state} onChange={handleChange} maxLength={2} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium uppercase text-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-900 mb-2">Cidade *</label>
                                    <input name="city" required value={formData.city} onChange={(e) => {
                                        setFormData(p => ({ ...p, city: e.target.value }));
                                        const filtered = citySuggestions.filter(c => c.toLowerCase().startsWith(e.target.value.toLowerCase())).slice(0, 5);
                                        setFilteredCitySuggestions(filtered);
                                        setShowCitySuggestions(filtered.length > 0);
                                    }} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                                    {showCitySuggestions && (
                                        <div className="absolute z-10 w-64 bg-white border border-slate-200 rounded-xl shadow-xl mt-1">
                                            {filteredCitySuggestions.map(c => (
                                                <div key={c} onClick={() => { setFormData(p => ({ ...p, city: c })); setShowCitySuggestions(false); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm font-medium">{c}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Carreira e Venda Pessoal */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-blue-500 pb-3">
                            <span className="text-2xl">💼</span>
                            <h2 className="text-xl font-bold text-slate-900">Sobre sua Carreira</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-slate-900 mb-2">Sua Venda Pessoal (Resumo Profissional) *</label>
                            <textarea name="aboutMe" required value={formData.aboutMe} onChange={handleChange} rows={4} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" placeholder="Conte-nos um pouco sobre suas experiências e conquistas..." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Status Atual *</label>
                                <select name="employmentStatus" required value={formData.employmentStatus} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-900">
                                    <option value="">Selecione...</option>
                                    <option value="Trabalhando">Empregado (Buscando recolocação)</option>
                                    <option value="Disponível">Desempregado / Disponível</option>
                                    <option value="Freelancer">Freelancer / Autônomo</option>
                                    <option value="Estudante">Estudante / Estagiário</option>
                                    <option value="Transição">Em transição de carreira</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Disponibilidade de Início *</label>
                                <select name="startAvailability" required value={formData.startAvailability} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-900">
                                    <option value="">Selecione...</option>
                                    <option value="Imediata">Imediata</option>
                                    <option value="15 dias">15 dias</option>
                                    <option value="30 dias">30 dias</option>
                                    <option value="outro">Outro (Especificar)</option>
                                </select>
                                {formData.startAvailability === 'outro' && (
                                    <input
                                        type="text"
                                        required
                                        value={customAvailability}
                                        onChange={(e) => setCustomAvailability(e.target.value)}
                                        placeholder="Informe sua disponibilidade..."
                                        className="mt-2 w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Último Salário (ou Atual)</label>
                                <input name="currentSalary" value={formData.currentSalary} onChange={handleChange} placeholder="R$ 0,00" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Pretensão Salarial *</label>
                                <input name="expectedSalary" required value={formData.expectedSalary} onChange={handleChange} placeholder="R$ 0,00" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                        </div>
                    </div>

                    {/* Seção 4: Disponibilidade e Entrevistas */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-blue-500 pb-3">
                            <span className="text-2xl">⏰</span>
                            <h2 className="text-xl font-bold text-slate-900">Agenda e Disponibilidade</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Disponibilidade de Horário *</label>
                                <select name="scheduleAvailability" required value={formData.scheduleAvailability} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-900">
                                    <option value="">Selecione...</option>
                                    <option value="Manhã">Manhã</option>
                                    <option value="Tarde">Tarde</option>
                                    <option value="Integral">Integral (Manhã e Tarde)</option>
                                    <option value="Sábado">Inclui Sábados</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Melhor Horário para Entrevista *</label>
                                <select name="bestInterviewTime" required value={formData.bestInterviewTime} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium bg-white text-slate-900">
                                    <option value="">Selecione...</option>
                                    <option value="Manhã (08h - 12h)">Manhã (08h - 12h)</option>
                                    <option value="Tarde (13h - 18h)">Tarde (13h - 18h)</option>
                                    <option value="Horário de almoço">Horário de almoço</option>
                                    <option value="Fora do comercial (início da noite)">Fora do comercial (início da noite)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Seção 5: Conhecimentos e CNH */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-blue-500 pb-3">
                            <span className="text-2xl">🛠️</span>
                            <h2 className="text-xl font-bold text-slate-900">Conhecimentos e Habilitação</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-4">Conhecimentos Técnicos</label>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {TECHNICAL_SKILLS_OPTIONS.map(skill => (
                                        <label key={skill} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={formData.technicalSkills.includes(skill)} onChange={() => handleCheckboxChange('technicalSkills', skill)} className="w-5 h-5 rounded border-2 border-slate-300 text-blue-600 focus:ring-blue-500" />
                                            <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{skill}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Campos Abertos para Skills */}
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newSkill}
                                            onChange={(e) => setNewSkill(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOtherSkill())}
                                            placeholder="Adicionar outro conhecimento..."
                                            className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm font-medium text-slate-900"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddOtherSkill}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.technicalSkills.filter(s => !TECHNICAL_SKILLS_OPTIONS.includes(s)).map(skill => (
                                            <div key={skill} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100">
                                                {skill}
                                                <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-blue-600">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-4">Carteira de Motorista (CNH)</label>
                                <div className="flex flex-wrap gap-4">
                                    {DRIVER_LICENSE_OPTIONS.map(lic => (
                                        <label key={lic} className="flex flex-col items-center gap-1 cursor-pointer group">
                                            <input type="checkbox" checked={formData.driverLicense.includes(lic)} onChange={() => handleCheckboxChange('driverLicense', lic)} className="hidden" />
                                            <div className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-bold transition-all ${formData.driverLicense.includes(lic) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-slate-400 group-hover:border-blue-400'}`}>
                                                {lic}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Seção 6: Currículo e Redes */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b-2 border-blue-500 pb-3">
                            <span className="text-2xl">📄</span>
                            <h2 className="text-xl font-bold text-slate-900">Currículo e Links</h2>
                        </div>
                        <div className="p-8 border-2 border-dashed border-blue-200 rounded-3xl bg-blue-50/30 text-center space-y-4">
                            <label className="block">
                                <span className="sr-only">Upload CV</span>
                                <input type="file" required accept=".pdf,.doc,.docx" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                            </label>
                            <p className="text-xs text-slate-500 font-medium">Formatos aceitos: PDF, Word (Doc/Docx). Tamanho máximo: 5MB.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">LinkedIn URL</label>
                                <input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-900 mb-2">Portfolio/GitHub</label>
                                <input name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://github.com/..." className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900" />
                            </div>
                        </div>
                    </div>

                    {/* LGPD e Submit */}
                    <div className="pt-8 border-t-2 border-slate-100 space-y-6">
                        <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100">
                            <label className="flex items-start gap-4 cursor-pointer">
                                <input type="checkbox" checked={lgpdConsent} onChange={(e) => setLgpdConsent(e.target.checked)} className="mt-1 w-6 h-6 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <span className="text-sm text-slate-900 leading-relaxed font-bold">
                                    Declaro que concordo com o tratamento dos meus dados pessoais para fins exclusivos de recrutamento e seleção, conforme a <strong>LGPD</strong>. Autorizo o armazenamento do meu currículo na base da <strong>Talento Connection</strong>.
                                </span>
                            </label>
                        </div>

                        {error && <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm font-bold">⚠️ {error}</div>}

                        <button type="submit" disabled={loading || !lgpdConsent} className="w-full bg-[#0F172A] text-white py-5 rounded-2xl text-xl font-bold shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
                            {loading ? 'Processando Candidatura...' : '🚀 Finalizar e Enviar Candidatura'}
                        </button>
                    </div>
                </form>
                {/* Challenge Modal */}
                {isChallengeOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">⚠️</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Cadastro Existente Encontrado</h3>
                                <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                                    Identificamos um cadastro anterior com este CPF. Para sua segurança e evitar duplicidades incorretas, confirme sua identidade para atualizar seus dados.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-slate-700">Confirme um dos dados abaixo (Telefone, Email ou CEP):</p>
                                <input
                                    type="text"
                                    value={challengeInput}
                                    onChange={(e) => setChallengeInput(e.target.value)}
                                    placeholder="Digite seu Email, Tel ou CEP atual..."
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                                />
                                {challengeError && <p className="text-red-500 text-xs font-bold">{challengeError}</p>}

                                <button
                                    onClick={handleChallengeSubmit}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                                >
                                    Confirmar e Atualizar
                                </button>
                                <button
                                    onClick={() => setIsChallengeOpen(false)}
                                    className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

