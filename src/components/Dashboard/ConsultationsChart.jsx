import React, { useEffect, useRef, useState } from 'react';
import { getEstatisticasConsultas } from '../../services/apiService'; // Updated import

const ConsultationsChart = () => {
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
        const data = await getEstatisticasConsultas();
        setChartData(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch consultation statistics:", err);
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
        type: 'bar',
        data: {
          labels: chartData.labels,
          datasets: [{
            label: 'Número de Consultas',
            data: chartData.data,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
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
  }, [chartData]);

  if (loading) return <div className="card card-graph"><div className="card-body d-flex justify-content-center align-items-center"><p>Carregando estatísticas de consultas...</p></div></div>;
  if (error) return <div className="card card-graph"><div className="card-body"><p className="text-danger">Erro ao carregar dados: {error}</p></div></div>;
  if (!chartData) return <div className="card card-graph"><div className="card-body"><p>Nenhuma estatística de consulta disponível.</p></div></div>;

  return (
    <div className="card card-graph">
      <div className="card-header">
        <span className="h5">Consultas</span>
        <span className="badge bg-primary ms-2">
          {chartData.total}
        </span>
      </div>
      <div className="card-body" style={{ position: 'relative', height: '300px' }}>
        <canvas id="consultationsChartCanvas" ref={chartRef}></canvas> {/* Changed ID */}
      </div>
    </div>
  );
};
export default ConsultationsChart;