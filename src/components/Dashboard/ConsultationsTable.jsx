import React, { useState, useEffect } from 'react';
import { getConsultas } from '../../services/apiService'; // Updated import

const ConsultationsTable = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getConsultas();
        setConsultations(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch consultations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, []);

  if (loading) return <div className="card"><div className="card-body d-flex justify-content-center align-items-center"><p>Carregando consultas...</p></div></div>;
  if (error) return <div className="card"><div className="card-body"><p className="text-danger">Erro ao carregar consultas: {error}</p></div></div>;

  return (
    <div className="card">
      <div className="card-header">Próximas Consultas</div>
      <div className="card-body">
        <div className="table-responsive">
          <table id="consultationsDataTable" className="table table-striped">
            <thead>
              <tr>
                <th>Paciente</th>
                {/* <th>CPF</th> // Assuming CPF is not directly in consulta object, but in related Paciente */}
                <th>Disciplina/Clínica</th>
                <th>Data</th>
                <th>Hora</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length > 0 ? (
                consultations.map(consulta => (
                  <tr key={consulta.id}>
                    <td>{consulta.pacienteNome || 'N/A'}</td>
                    {/* <td>{Fetch patient CPF based on consulta.pacienteId if needed}</td> */}
                    <td>{consulta.disciplina}</td>
                    <td>{new Date(consulta.data + 'T00:00:00').toLocaleDateString()}</td>
                    <td>{consulta.hora}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-muted">Nenhuma consulta agendada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default ConsultationsTable;