// src/components/Pacientes/PacienteDetalhesModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { getPacienteById, getAgendamentosByPacienteId, updatePaciente } from '../../services/apiService'; // <<< Adicionar updatePaciente
import Modal from '../Modal/Modal';
import Swal from 'sweetalert2';

// <<< Funções de formatação que usaremos no formulário de edição também
const formatarCPF = (value) => {
  const apenasDigitos = value.replace(/\D/g, '').slice(0, 11);
  let cpfFormatado = apenasDigitos.replace(/(\d{3})(\d)/, '$1.$2');
  cpfFormatado = cpfFormatado.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
  cpfFormatado = cpfFormatado.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
  return cpfFormatado;
};
const formatarTelefone = (value) => {
  let apenasDigitos = value.replace(/\D/g, '').slice(0, 11);
  if (apenasDigitos.length > 10) {
    return apenasDigitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (apenasDigitos.length > 6) {
    return apenasDigitos.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else if (apenasDigitos.length > 2) {
    return apenasDigitos.replace(/(\d{2})(\d*)/, '($1) $2');
  } else {
    return apenasDigitos.replace(/(\d*)/, '($1');
  }
};

// Funções utilitárias
const calculateAge = (birthDate) => { /* ...código existente... */ };
const formatField = (value, fallback = 'Não informado') => value || fallback;
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ' - ';


const PacienteDetalhesModal = ({ pacienteId, onClose }) => {
    const [activeTab, setActiveTab] = useState('dados');
    const [paciente, setPaciente] = useState(null);
    const [agendamentos, setAgendamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAgendamentos, setLoadingAgendamentos] = useState(false);

    // <<< NOVOS ESTADOS PARA O MODO DE EDIÇÃO
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        if (!pacienteId) return;
        setLoading(true);
        setPaciente(null); setAgendamentos([]); setActiveTab('dados'); setIsEditing(false); // Reset
        
        const fetchPacienteData = async () => {
            try {
                const data = await getPacienteById(pacienteId);
                setPaciente(data);
                setFormData(data); // Inicializa o formulário com os dados
            } catch (err) {
                Swal.fire('Erro!', 'Não foi possível carregar os dados do paciente.', 'error');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchPacienteData();
    }, [pacienteId, onClose]);

    const fetchAgendamentos = useCallback(() => { /* ...código existente... */ }, [pacienteId, agendamentos.length]);
    useEffect(() => { /* ...código existente... */ }, [activeTab, fetchAgendamentos]);

    // <<< NOVAS FUNÇÕES PARA O MODO DE EDIÇÃO
    const handleEditClick = () => {
        setFormData({ ...paciente, cpf: formatarCPF(paciente.cpf || ''), contato: formatarTelefone(paciente.contato || '') }); // Garante que o form comece formatado
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setFormData(paciente); // Restaura os dados originais
        setIsEditing(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpf') {
            setFormData(prev => ({ ...prev, cpf: formatarCPF(value) }));
        } else if (name === 'contato') {
            setFormData(prev => ({ ...prev, contato: formatarTelefone(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                cpf: formData.cpf.replace(/\D/g, ''),
                contato: formData.contato.replace(/\D/g, '')
            };
            const pacienteAtualizado = await updatePaciente(pacienteId, payload);
            setPaciente(pacienteAtualizado); // Atualiza os dados de visualização
            setIsEditing(false);
            Swal.fire('Sucesso!', 'Dados do paciente atualizados.', 'success');
            onClose(true); // <<< Passa 'true' para sinalizar que a lista principal deve ser atualizada
        } catch (err) {
            Swal.fire('Erro!', `Não foi possível salvar as alterações: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    

    const renderDadosTab = () => {
        // ... (código existente para renderizar a aba de dados)
        // A lógica de renderização será movida para dentro do return do modal para usar `isEditing`
    };
    
    const renderAgendamentosTab = () => {
        // ... (código existente para renderizar a aba de agendamentos)
    };

    return (
        <Modal show={true} onClose={onClose} title="Prontuário do Paciente" size="xl">
            {loading && !paciente ? (
                <div className="text-center py-5"><div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}></div></div>
            ) : (
            <div className="row g-0">
                {/* Sidebar do Modal */}
                <div className="col-md-3 border-end bg-light">
                    <div className="text-center p-3">
                        <i className="bi bi-person-circle display-1 text-secondary"></i>
                        <h4 className="mt-2 mb-1">{paciente?.nome}</h4>
                    </div>
                    <ul className="nav nav-pills flex-column p-2">
                        {/* ... Abas de navegação, sem alterações ... */}
                    </ul>
                </div>

                {/* Conteúdo do Modal */}
                <div className="col-md-9">
                    <div className="p-4">
                        {activeTab === 'dados' && (
                            <>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="mb-0"><i className="bi bi-person-lines-fill text-primary me-2"></i>Dados Gerais</h4>
                                    {/* Botões de Ação */}
                                    {!isEditing ? (
                                        <button className="btn btn-outline-primary btn-sm" onClick={handleEditClick}>
                                            <i className="bi bi-pencil-fill me-1"></i> Editar
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-outline-secondary btn-sm" onClick={handleCancelClick} disabled={isSubmitting}>Cancelar</button>
                                            <button className="btn btn-primary btn-sm" type="submit" form="editPatientForm" disabled={isSubmitting}>
                                                {isSubmitting ? 'Salvando...' : <><i className="bi bi-check-lg me-1"></i> Salvar</>}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {isEditing ? (
                                    // <<< MODO DE EDIÇÃO: Formulário
                                    <form id="editPatientForm" onSubmit={handleSaveChanges}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label htmlFor="edit-nome" className="form-label">Nome</label>
                                                <input type="text" id="edit-nome" name="nome" value={formData?.nome || ''} onChange={handleFormChange} className="form-control" />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="edit-cpf" className="form-label">CPF</label>
                                                <input type="text" id="edit-cpf" name="cpf" value={formData?.cpf || ''} onChange={handleFormChange} className="form-control" maxLength="14" />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="edit-data_nascimento" className="form-label">Data de Nascimento</label>
                                                <input type="date" id="edit-data_nascimento" name="data_nascimento" value={formData?.data_nascimento || ''} onChange={handleFormChange} className="form-control" />
                                            </div>
                                            <div className="col-md-6">
                                                <label htmlFor="edit-contato" className="form-label">Contato</label>
                                                <input type="tel" id="edit-contato" name="contato" value={formData?.contato || ''} onChange={handleFormChange} className="form-control" maxLength="15" />
                                            </div>
                                        </div>
                                    </form>
                                ) : (
                                    // <<< MODO DE VISUALIZAÇÃO: Texto estático (código anterior)
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="card shadow-sm">
                                                <div className="card-body">
                                                     <dl className="row mb-0">
                                                        <dt className="col-sm-4">Nome Completo</dt><dd className="col-sm-8">{formatField(paciente.nome)}</dd>
                                                        <dt className="col-sm-4">CPF</dt><dd className="col-sm-8">{formatarCPF(paciente.cpf)}</dd>
                                                        <dt className="col-sm-4">Data de Nasc.</dt><dd className="col-sm-8">{formatDate(paciente.data_nascimento)} ({calculateAge(paciente.data_nascimento)} anos)</dd>
                                                        <dt className="col-sm-4">Contato</dt><dd className="col-sm-8">{formatarTelefone(paciente.contato)}</dd>
                                                     </dl>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        {activeTab === 'agendamentos' && renderAgendamentosTab()}
                    </div>
                </div>
            </div>
            )}
        </Modal>
    );
};
export default PacienteDetalhesModal;