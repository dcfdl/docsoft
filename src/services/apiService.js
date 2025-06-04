const API_BASE_URL = 'http://localhost:3001'; // Your JSON Server URL

// Generic error handler
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// --- Pacientes ---
export const getPacientes = async () => {
  const response = await fetch(`${API_BASE_URL}/pacientes`);
  return handleResponse(response);
};

export const getPacienteById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/pacientes/${id}`);
  return handleResponse(response);
};

export const addPaciente = async (pacienteData) => {
  const response = await fetch(`${API_BASE_URL}/pacientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pacienteData),
  });
  return handleResponse(response);
};

export const updatePaciente = async (id, pacienteData) => {
  const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
    method: 'PUT', // or PATCH for partial updates
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pacienteData),
  });
  return handleResponse(response);
};

export const deletePaciente = async (id) => {
  const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
    method: 'DELETE',
  });
  // Delete usually returns 200 OK with empty body or 204 No Content
  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return { success: true, id }; // Or just response.ok
};


// --- Consultas ---
export const getConsultas = async () => {
  const response = await fetch(`${API_BASE_URL}/consultas`);
  return handleResponse(response);
};

export const addConsulta = async (consultaData) => {
  const response = await fetch(`${API_BASE_URL}/consultas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(consultaData),
  });
  return handleResponse(response);
};

// --- Estatisticas (para os gráficos) ---
export const getEstatisticasPacientes = async () => {
  const response = await fetch(`${API_BASE_URL}/estatisticasPacientes`);
  return handleResponse(response);
};

export const getEstatisticasConsultas = async () => {
  const response = await fetch(`${API_BASE_URL}/estatisticasConsultas`);
  return handleResponse(response);
};

// --- Agendamentos --- (NOVO)
/**
 * Busca agendamentos filtrando por data.
 * Nota: Seu db.json tem 'date' e 'time'. O PHP API usa 'data_agendamento' e 'hora_agendamento'.
 * Ajustei para usar 'date' como no db.json.
 * O filtro por aluno_id pode ser adicionado se necessário.
 */
export const getAgendamentos = async (startDate, endDate /*, alunoId */) => {
  // json-server suporta _gte (maior ou igual) e _lte (menor ou igual) para filtragem
  // e & para múltiplos filtros.
  let url = `${API_BASE_URL}/agendamentos?date_gte=${startDate}&date_lte=${endDate}`;

  // Exemplo se você adicionar aluno_id aos seus agendamentos no db.json:
  // if (alunoId) {
  //   url += `&aluno_id=${alunoId}`;
  // }
  const response = await fetch(url);
  return handleResponse(response);
};
