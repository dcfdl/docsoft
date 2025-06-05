// src/components/Pacientes/Pacientes.jsx (CORRIGIDO)

// A correção está nesta linha, adicionando 'useCallback'
import React, { useState, useEffect, useCallback } from 'react'; 
import { getPacientes, addPaciente } from '../../services/apiService';
import PacienteDetalhesModal from './PacienteDetalhesModal';
import Modal from '../Modal/Modal';
import Swal from 'sweetalert2';
import './Pacientes.css';

// ... (as funções formatarCPF e formatarTelefone permanecem aqui, sem alterações)
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


const Pacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('');

    const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
    const [selectedPacienteId, setSelectedPacienteId] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialPacienteState = {
        nome: '',
        cpf: '',
        data_nascimento: '',
        contato: '',
        ativo: true
    };
    const [newPacienteData, setNewPacienteData] = useState(initialPacienteState);

    // Envolvemos a função em useCallback para que ela não seja recriada a cada renderização,
    // o que é bom para a performance e para usá-la como dependência em useEffect.
    const fetchPacientes = useCallback(async () => {
        try {
            // Não precisa mais do setLoading(true) aqui, pois é chamado no useEffect
            const data = await getPacientes();
            setPacientes(data);
        } catch (err) {
            setError('Não foi possível carregar a lista de pacientes.');
            Swal.fire('Erro!', 'Não foi possível carregar a lista de pacientes.', 'error');
        } finally {
            setLoading(false);
        }
    }, []); // A array de dependências vazia significa que a função em si nunca muda

    useEffect(() => {
        setLoading(true);
        fetchPacientes();
    }, [fetchPacientes]);


    const handleCloseDetalhesModal = useCallback((dadosForamAtualizados) => {
        setIsDetalhesModalOpen(false);
        setSelectedPacienteId(null);
        if (dadosForamAtualizados) {
            fetchPacientes(); // Busca a lista atualizada se uma edição foi salva
        }
    }, [fetchPacientes]); // Adicionamos fetchPacientes como dependência

    const handleOpenDetalhesModal = (pacienteId) => {
        setSelectedPacienteId(pacienteId);
        setIsDetalhesModalOpen(true);
    };

    const handleOpenCreateModal = () => {
        setNewPacienteData(initialPacienteState);
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleNewPacienteChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpf') {
            setNewPacienteData(prev => ({ ...prev, cpf: formatarCPF(value) }));
        } else if (name === 'contato') {
            setNewPacienteData(prev => ({ ...prev, contato: formatarTelefone(value) }));
        } else {
            setNewPacienteData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveNewPaciente = async (e) => {
        e.preventDefault();
        if (!newPacienteData.nome) {
            Swal.fire('Campo Obrigatório', 'O nome do paciente precisa ser preenchido.', 'warning');
            return;
        }
        setIsSubmitting(true);
        try {
            const pacienteSalvoComID = await addPaciente(newPacienteData);
            setPacientes(prev => [...prev, pacienteSalvoComID].sort((a,b) => a.nome.localeCompare(b.nome)));
            handleCloseCreateModal();
            Swal.fire('Sucesso!', 'Novo paciente criado com sucesso.', 'success');
        } catch (err) {
            console.error("Erro ao criar paciente:", err);
            Swal.fire('Erro!', `Não foi possível criar o paciente: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const pacientesFiltrados = pacientes.filter(paciente =>
        paciente.nome.toLowerCase().includes(filtro.toLowerCase()) ||
        (paciente.cpf && paciente.cpf.includes(filtro))
    );

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Carregando...</span></div></div>;
    }
    
    // ... (o return com todo o JSX permanece o mesmo da resposta anterior)
    return (
        <div className="pacientes-container p-3 p-md-4">
            <div className="card shadow-sm">
                <div className="card-header bg-light d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <h4 className="mb-0"><i className="bi bi-people-fill me-2"></i>Lista de Pacientes</h4>
                    <div className="d-flex w-100 w-md-auto">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar por nome ou CPF..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                        <button className="btn btn-primary ms-2 flex-shrink-0" onClick={handleOpenCreateModal}>
                            <i className="bi bi-plus-lg"></i>
                            <span className="d-none d-md-inline ms-1">Novo</span>
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Nome</th>
                                    <th>CPF</th>
                                    <th>Contato</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientesFiltrados.length > 0 ? (
                                    pacientesFiltrados.map(paciente => (
                                        <tr key={paciente.id} title="Clique para ver o prontuário">
                                            <td
                                                className="paciente-nome-clicavel"
                                                onClick={() => handleOpenDetalhesModal(paciente.id)}
                                            >
                                                {paciente.nome}
                                            </td>
                                            <td>{paciente.cpf || 'Não informado'}</td>
                                            <td>{paciente.contato || 'Não informado'}</td>
                                            <td>
                                                <span className={`badge ${paciente.ativo ? 'bg-success' : 'bg-danger'}`}>
                                                    {paciente.ativo ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center text-muted py-4">Nenhum paciente encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isDetalhesModalOpen && (
                <PacienteDetalhesModal
                    pacienteId={selectedPacienteId}
                    onClose={handleCloseDetalhesModal}
                />
            )}

            {isCreateModalOpen && (
                <Modal
                    show={isCreateModalOpen}
                    onClose={handleCloseCreateModal}
                    title="Criar Novo Paciente"
                    footer={
                        <>
                            <button type="button" className="btn btn-outline-secondary" onClick={handleCloseCreateModal} disabled={isSubmitting}>
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="createPatientForm"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Salvando...' : 'Salvar Paciente' }
                            </button>
                        </>
                    }
                >
                    <form id="createPatientForm" onSubmit={handleSaveNewPaciente}>
                        <div className="mb-3">
                            <label htmlFor="nome" className="form-label">Nome Completo <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="nome"
                                name="nome"
                                value={newPacienteData.nome}
                                onChange={handleNewPacienteChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label htmlFor="cpf" className="form-label">CPF</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="cpf"
                                    name="cpf"
                                    placeholder="000.000.000-00"
                                    value={newPacienteData.cpf}
                                    onChange={handleNewPacienteChange}
                                    disabled={isSubmitting}
                                    maxLength="14"
                                />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label htmlFor="data_nascimento" className="form-label">Data de Nascimento</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    id="data_nascimento"
                                    name="data_nascimento"
                                    value={newPacienteData.data_nascimento}
                                    onChange={handleNewPacienteChange}
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                             <label htmlFor="contato" className="form-label">Telefone / Contato</label>
                             <input
                                type="tel"
                                className="form-control"
                                id="contato"
                                name="contato"
                                placeholder="(42) 99999-9999"
                                value={newPacienteData.contato}
                                onChange={handleNewPacienteChange}
                                disabled={isSubmitting}
                                maxLength="15"
                            />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Pacientes;