import React, { useState, useEffect } from 'react';
import { getPacientes } from '../../services/apiService'; // Updated import

const UpcomingPatients = () => {
  const [filter, setFilter] = useState('today');
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getISODateString = (offset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchAndSetPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPacientes(); // Fetch all patients
        setAllPatients(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAndSetPatients();
  }, []);

  useEffect(() => {
    if (allPatients.length > 0) {
      let dateToFilter;
      if (filter === 'today') {
        dateToFilter = getISODateString(0);
      } else if (filter === 'tomorrow') {
        dateToFilter = getISODateString(1);
      } else { // after_tomorrow
        dateToFilter = getISODateString(2);
      }
      // Assuming patients have 'dataISOProximaConsulta' and 'horarioProximaConsulta' from db.json
      const patientsToList = allPatients.filter(p => p.dataISOProximaConsulta === dateToFilter && p.ativo);
      setFilteredPatients(patientsToList);
    } else {
      setFilteredPatients([]);
    }
  }, [filter, allPatients]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };
  
  let content;
  if (loading) {
    content = <p className="text-muted p-3">Carregando próximos pacientes...</p>;
  } else if (error) {
    content = <p className="text-danger p-3">Erro ao carregar pacientes: {error}</p>;
  } else if (filteredPatients.length > 0) {
    content = (
      <ul className="list-group list-group-flush">
        {filteredPatients.map(patient => (
          <li key={patient.id} className="list-group-item d-flex justify-content-between align-items-center">
            {patient.nome}
            <span className="badge bg-info rounded-pill">{patient.horarioProximaConsulta || 'N/A'}</span>
          </li>
        ))}
      </ul>
    );
  } else {
    content = <p className="text-muted p-3">Nenhum paciente para {filter === 'today' ? 'hoje' : filter === 'tomorrow' ? 'amanhã' : 'depois de amanhã'}.</p>;
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Próximos Pacientes</h5>
        <div>
          {['today', 'tomorrow', 'after_tomorrow'].map(f => (
            <button 
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-primary'} me-1`} 
              onClick={() => handleFilterChange(f)}>
              {f === 'today' ? 'Hoje' : f === 'tomorrow' ? 'Amanhã' : 'Depois'}
            </button>
          ))}
        </div>
      </div>
      <div className="card-body" style={{ minHeight: '150px' }}>
        {content}
      </div>
    </div>
  );
};
export default UpcomingPatients;