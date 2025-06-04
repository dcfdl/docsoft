import React, { useEffect, useRef, useState } from 'react';
import { getEstatisticasPacientes } from '../../services/apiService'; // Updated import

const PatientsChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEstatisticasPacientes();
        setChartData(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch patient statistics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (chartRef.current && chartData) {
      const ctx = chartRef.current.getContext('2d');
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      chartInstance.current = new window.Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Número de Pacientes',
            data: chartData.data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]); // Re-run effect when chartData changes

  if (loading) return <div className="card card-graph"><div className="card-body d-flex justify-content-center align-items-center"><p>Carregando estatísticas de pacientes...</p></div></div>;
  if (error) return <div className="card card-graph"><div className="card-body"><p className="text-danger">Erro ao carregar dados: {error}</p></div></div>;
  if (!chartData) return <div className="card card-graph"><div className="card-body"><p>Nenhuma estatística de paciente disponível.</p></div></div>;

  return (
    <div className="card card-graph">
      <div className="card-header">
        <span className="h5">Pacientes</span>
        <span className="badge bg-primary ms-2">
          {chartData.total}
        </span>
      </div>
      <div className="card-body" style={{ position: 'relative', height: '300px' }}>
        <canvas id="patientsChartCanvas" ref={chartRef}></canvas> {/* Changed ID to avoid conflict if Chart.js auto-uses it */}
      </div>
    </div>
  );
};
export default PatientsChart;