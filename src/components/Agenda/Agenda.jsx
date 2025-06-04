import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import 'moment/locale/pt-br'; // Importar locale pt-br para moment
import Swal from 'sweetalert2'; // Para alertas
import { getAgendamentos } from '../../services/apiService';
import './Agenda.css';

// eslint-disable-next-line react/prop-types
const Agenda = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(moment());
  const [currentView, setCurrentView] = useState('week'); // 'day', 'week', 'month'
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null); // Controla qual dropdown de "mais" está aberto

  moment.locale('pt-br');

  const fetchAppointmentsCallback = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const start = currentDate.clone().startOf(currentView).format('YYYY-MM-DD');
      const end = currentDate.clone().endOf(currentView).format('YYYY-MM-DD');
      const alunoId = currentUser ? currentUser.id : null; // Usar o ID do usuário mockado

      // No db.json, os agendamentos não têm aluno_id.
      // Se você adicionar, o apiService pode ser ajustado para enviar esse parâmetro.
      // Por ora, o filtro de aluno_id no backend/json-server não está implementado.
      const data = await getAgendamentos(start, end /*, alunoId */);
      setAppointments(data);
    } catch (err) {
      console.error('Erro ao carregar agenda:', err);
      setError(err.message || 'Não foi possível carregar a agenda.');
      Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar agenda',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [currentDate, currentView, currentUser]);

  useEffect(() => {
    fetchAppointmentsCallback();
  }, [fetchAppointmentsCallback]);

  const updatePeriodLabel = () => {
    if (currentView === 'day') {
      return currentDate.format('DD [de] MMMM [de] YYYY');
    } else if (currentView === 'week') {
      const start = currentDate.clone().startOf('week');
      const end = currentDate.clone().endOf('week');
      if (start.month() === end.month()) {
        return `${start.format('DD')} a ${end.format('DD [de] MMMM [de] YYYY')}`;
      }
      return `${start.format('DD [de] MMMM')} a ${end.format('DD [de] MMMM [de] YYYY')}`;
    } else { // month
      return currentDate.format('MMMM [de] YYYY');
    }
  };

  const handlePrev = () => setCurrentDate(prev => prev.clone().subtract(1, currentView));
  const handleNext = () => setCurrentDate(prev => prev.clone().add(1, currentView));
  const handleToday = () => setCurrentDate(moment());
  const handleViewChange = (view) => setCurrentView(view);

  const toggleAppointmentsDropdown = (slotId, e) => {
    e.stopPropagation(); // Previne que o click feche o dropdown imediatamente se estiver em outro elemento clicável
    setActiveDropdown(activeDropdown === slotId ? null : slotId);
  };

  // Fecha o dropdown se clicar fora dele
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);


  const renderAppointmentsList = (apps, slotIdBase) => {
    const visibleCount = currentView === 'month' ? 1 : 2; // Mostrar menos no mês
    const visibleApps = apps.slice(0, visibleCount);
    const hiddenApps = apps.slice(visibleCount);

    return (
      <>
        {visibleApps.map(app => (
          <div
            className="appointment"
            key={app.id}
            title={`${app.paciente_nome} - ${app.disciplina_nome} (${app.situacao}) às ${app.time}`}
            // onClick={() => handleAppointmentClick(app)} // Adicionar handler para modal de detalhes
          >
            {app.time.slice(0,5)} {app.paciente_nome} ({app.disciplina_nome})
          </div>
        ))}
        {hiddenApps.length > 0 && (
          <div className="dropdown-appointments">
            <span className="more-appointments" onClick={(e) => toggleAppointmentsDropdown(`${slotIdBase}-more`, e)}>
              Mais {hiddenApps.length} <i className="bi bi-caret-down-fill"></i>
            </span>
            {activeDropdown === `${slotIdBase}-more` && (
              <div className="appointments-dropdown-menu show" onClick={(e) => e.stopPropagation()}>
                {hiddenApps.map(app => (
                  <div
                    className="dropdown-item"
                    key={app.id}
                    title={`${app.paciente_nome} - ${app.disciplina_nome} (${app.situacao}) às ${app.time}`}
                    // onClick={() => handleAppointmentClick(app)}
                  >
                    {app.time.slice(0,5)} {app.paciente_nome} - {app.disciplina_nome} ({app.situacao})
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </>
    );
  };


  const renderDayView = () => {
    const dateStr = currentDate.format('YYYY-MM-DD');
    const hoursSlots = [];
    for (let h = 8; h <= 18; h++) { // Horários de 8h às 18h
      const timePrefix = `${h.toString().padStart(2, '0')}`;
      const appsInSlot = appointments.filter(a => a.date === dateStr && a.time.startsWith(timePrefix));
      hoursSlots.push(
        <div className="list-group-item day-slot" key={timePrefix}>
          <strong>{`${timePrefix}:00`}</strong>
          {appsInSlot.length > 0 ? renderAppointmentsList(appsInSlot, `day-${dateStr}-${timePrefix}`) : <div className="no-appointments"></div>}
        </div>
      );
    }
    return <div className="day-view"><div className="list-group">{hoursSlots}</div></div>;
  };

  const renderWeekView = () => {
    const startOfWeek = currentDate.clone().startOf('week');
    const daysHeader = [];
    for (let i = 0; i < 7; i++) {
      daysHeader.push(startOfWeek.clone().add(i, 'days'));
    }

    const hoursRows = [];
    for (let h = 8; h <= 18; h++) { // Horas
      const timePrefix = `${h.toString().padStart(2, '0')}`;
      hoursRows.push(
        <tr key={timePrefix}>
          <td className="time-label">{`${timePrefix}:00`}</td>
          {daysHeader.map(day => {
            const dayStr = day.format('YYYY-MM-DD');
            const appsInSlot = appointments.filter(a => a.date === dayStr && a.time.startsWith(timePrefix));
            return (
              <td key={dayStr} className={day.isSame(moment(), 'day') ? 'today' : ''}>
                {appsInSlot.length > 0 ? renderAppointmentsList(appsInSlot, `week-${dayStr}-${timePrefix}`) : <div className="no-appointments"></div>}
              </td>
            );
          })}
        </tr>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table week-table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Hora</th>
              {daysHeader.map(day => <th key={day.format('YYYY-MM-DD')}>{day.format('ddd DD/MM')}</th>)}
            </tr>
          </thead>
          <tbody>
            {hoursRows}
          </tbody>
        </table>
      </div>
    );
  };

 const renderMonthView = () => {
    const startDisplay = currentDate.clone().startOf('month').startOf('week');
    const endDisplay = currentDate.clone().endOf('month').endOf('week');
    const today = moment();
    const weeks = [];
    let dayIterator = startDisplay.clone();

    while (dayIterator.isSameOrBefore(endDisplay, 'day')) {
      const currentWeek = [];
      for (let i = 0; i < 7; i++) {
        currentWeek.push(dayIterator.clone());
        dayIterator.add(1, 'day');
      }
      weeks.push(currentWeek);
    }

    return (
      <table className="table month-table table-bordered">
        <thead className="table-light">
          <tr>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <th key={d}>{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map(day => {
                const dateStr = day.format('YYYY-MM-DD');
                const isCurrentMonth = day.month() === currentDate.month();
                const appsInDay = appointments.filter(a => a.date === dateStr);
                return (
                  <td
                    key={dateStr}
                    className={`
                      ${isCurrentMonth ? '' : 'other-month'}
                      ${day.isSame(today, 'day') ? 'today' : ''}
                      ${appsInDay.length > 0 && isCurrentMonth ? 'has-appointments' : ''}
                    `}
                  >
                    <div className="day-number">{day.format('D')}</div>
                    {isCurrentMonth && appsInDay.length > 0 && renderAppointmentsList(appsInDay, `month-${dateStr}`)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };


  const renderCurrentView = () => {
    if (loading) return <div className="d-flex justify-content-center align-items-center" style={{minHeight: '300px'}}><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Carregando...</span></div></div>;
    if (error && !loading) return <div className="alert alert-danger" role="alert">Erro ao carregar agendamentos: {error}</div>;

    switch (currentView) {
      case 'day': return renderDayView();
      case 'week': return renderWeekView();
      case 'month': return renderMonthView();
      default: return <p>Visualização não selecionada.</p>;
    }
  };

  return (
    <div className="agenda-component-container">
      <div className="agenda-controls d-flex justify-content-between align-items-center mb-3 p-3 bg-light border rounded">
        <div className="btn-group" role="group" aria-label="Navegação de data">
          <button type="button" className="btn btn-outline-secondary" onClick={handlePrev} title="Anterior"><i className="bi bi-arrow-left"></i></button>
          <button type="button" className="btn btn-outline-secondary" onClick={handleToday} title="Hoje"><i className="bi bi-calendar-event"></i> Hoje</button>
          <button type="button" className="btn btn-outline-secondary" onClick={handleNext} title="Próximo"><i className="bi bi-arrow-right"></i></button>
        </div>
        <h3 className="agenda-period-label mb-0 mx-3 text-primary">{updatePeriodLabel()}</h3>
        <div className="btn-group" role="group" aria-label="Seleção de visualização">
          <button type="button" className={`btn btn-outline-primary ${currentView === 'day' ? 'active' : ''}`} onClick={() => handleViewChange('day')}>Dia</button>
          <button type="button" className={`btn btn-outline-primary ${currentView === 'week' ? 'active' : ''}`} onClick={() => handleViewChange('week')}>Semana</button>
          <button type="button" className={`btn btn-outline-primary ${currentView === 'month' ? 'active' : ''}`} onClick={() => handleViewChange('month')}>Mês</button>
        </div>
      </div>
      <div className="agenda-view-area">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default Agenda;