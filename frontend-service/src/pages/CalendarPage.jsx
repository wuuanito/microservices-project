import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
// import 'moment/locale/es'; // Descomenta si la semana debe empezar en lunes
// moment.locale('es');

import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const localizer = momentLocalizer(moment);

const eventTypeOptions = [
  { value: '', label: 'Seleccionar tipo...', color: '#777777' },
  { value: 'Visitas', label: 'Visitas', color: '#3174ad' },
  { value: 'Visitas Clientes', label: 'Visitas Clientes', color: '#5cb85c' },
  { value: 'Proveedores', label: 'Proveedores', color: '#f0ad4e' },
  { value: 'Auditorias y Certificaciones', label: 'Auditorias y Certificaciones', color: '#6f42c1' },
  { value: 'Otros', label: 'Otros', color: '#6c757d' }
];

const roomReservedOptions = [
  { value: '', label: 'Seleccionar sala...' },
  { value: 'Gerencia', label: 'Gerencia' },
  { value: 'Meeting Room 2', label: 'Meeting Room 2' },
  { value: 'Project', label: 'Project' },
  { value: 'Formaciones', label: 'Formaciones' }
];
const actualRooms = roomReservedOptions.filter(opt => opt.value !== '');

// --- COMPONENTES DE EVENTO PERSONALIZADOS ---
const DetailedEventComponent = ({ event }) => (
  <div>
    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
      {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
    </div>
    <div style={{ marginBottom: '2px' }}>{event.title}</div>
    {event.roomReserved && (
      <div style={{ fontSize: '0.9em', opacity: 0.9 }}>
        <em>Sala: {event.roomReserved}</em>
      </div>
    )}
  </div>
);

const MonthEventComponent = ({ event }) => {
  const timeText = moment(event.start).format('HH:mm');
  const titleText = event.title.length > 18 ? `${event.title.substring(0, 16)}...` : event.title;
  const roomText = event.roomReserved ? (event.roomReserved.length > 12 ? `${event.roomReserved.substring(0, 10)}...` : event.roomReserved) : null;
  const fullTitleTooltip = `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')} | ${event.title}${event.roomReserved ? ` (Sala: ${event.roomReserved})` : ''}${event.description ? ` | Desc: ${event.description.substring(0,50)}...` : ''}`;

  return (
    <div title={fullTitleTooltip} style={{ fontSize: '0.78em', lineHeight: '1.25', padding: '1px 2px' }}>
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {timeText} - {titleText}
      </div>
      {roomText && (
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.85, fontSize: '0.9em' }}>
          <em>{roomText}</em>
        </div>
      )}
    </div>
  );
};
// --- FIN COMPONENTES DE EVENTO ---

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEventData, setNewEventData] = useState({
    title: '', description: '', responsible: user?.username || '',
    participants: [], roomReserved: '', eventType: '',
    startTime: new Date(), endTime: moment().add(1, 'hour').toDate(),
  });

  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRoomTab, setSelectedRoomTab] = useState(actualRooms.length > 0 ? actualRooms[0].value : '');

  const fetchEvents = useCallback(async (isAction = false) => {
    if (!isAction) setLoading(true);
    try {
      const response = await api.get('/calendar/api/events');
      const formattedEvents = response.data.map(evt => ({
        ...evt, id: evt.id, title: evt.title || 'Evento sin título',
        start: new Date(evt.startTime), end: new Date(evt.endTime),
        eventType: evt.eventType || 'Otros', roomReserved: evt.roomReserved || '',
        participants: evt.participants || [], description: evt.description || '',
        responsible: evt.responsible || (user?.username || '')
      }));
      setEvents(formattedEvents);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Fallo al cargar eventos.'); setEvents([]);
    }
    if (!isAction) setLoading(false);
  }, [user?.username]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);
  useEffect(() => {
    if (user?.username && !selectedEvent) {
        setNewEventData(prev => ({ ...prev, responsible: user.username }));
    }
  }, [user, selectedEvent]);

  const handleSelectSlot = useCallback(({ start, end }) => {
    setSelectedEvent(null);
    setNewEventData({
      title: '', description: '', responsible: user?.username || '',
      participants: [], roomReserved: '', eventType: '',
      startTime: start, endTime: end,
    });
    setModalError(null); setShowModal(true);
  }, [user]);

  const handleSelectEvent = useCallback((eventDataFromCalendar) => {
    setSelectedEvent(eventDataFromCalendar);
    setNewEventData({
      id: eventDataFromCalendar.id, title: eventDataFromCalendar.title,
      description: eventDataFromCalendar.description || '', responsible: eventDataFromCalendar.responsible,
      participants: eventDataFromCalendar.participants || [], roomReserved: eventDataFromCalendar.roomReserved || '',
      eventType: eventDataFromCalendar.eventType || '', startTime: new Date(eventDataFromCalendar.start),
      endTime: new Date(eventDataFromCalendar.end),
    });
    setModalError(null); setShowModal(true);
  }, []);
  
  const handleModalClose = () => {
    setShowModal(false); setSelectedEvent(null); setModalError(null);
    setNewEventData({
      title: '', description: '', responsible: user?.username || '',
      participants: [], roomReserved: '', eventType: '',
      startTime: new Date(), endTime: moment().add(1, 'hour').toDate(),
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'participants') {
      setNewEventData(prev => ({ ...prev, [name]: value.split(',').map(p => p.trim()).filter(p => p) }));
    } else {
      setNewEventData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date, fieldName) => {
    setNewEventData(prev => ({ ...prev, [fieldName]: date }));
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault(); setModalError(null);
    if (!newEventData.title.trim()) { setModalError('El título es obligatorio.'); return; }
    if (!newEventData.eventType) { setModalError('Por favor, selecciona un tipo de evento.'); return; }
    if (moment(newEventData.endTime).isSameOrBefore(moment(newEventData.startTime))) { setModalError('La hora de fin debe ser posterior a la hora de inicio.'); return; }
    setActionLoading(true);
    try {
      const payload = {
        ...newEventData, startTime: moment(newEventData.startTime).toISOString(), endTime: moment(newEventData.endTime).toISOString(),
        participants: Array.isArray(newEventData.participants) ? newEventData.participants.filter(p => p.trim() !== '') : (newEventData.participants || '').toString().split(',').map(p=>p.trim()).filter(p=>p.trim() !== '')
      };
      if (!payload.id) delete payload.id;
      if (selectedEvent && selectedEvent.id) {
        await api.put(`/calendar/api/events/${selectedEvent.id}`, payload);
      } else {
        await api.post('/calendar/api/events', payload);
      }
      await fetchEvents(true); handleModalClose();
    } catch (err) {
      console.error('Error saving event:', err);
      const apiErrorMessage = err.response?.data?.message || err.response?.data?.error || (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.map(e => e.message || e.msg).join(', ') : 'Fallo al guardar el evento.');
      setModalError(apiErrorMessage);
    }
    setActionLoading(false);
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent && selectedEvent.id) {
      if (!window.confirm("¿Estás seguro de que quieres eliminar este evento?")) return;
      setActionLoading(true); setModalError(null);
      try {
        await api.delete(`/calendar/api/events/${selectedEvent.id}`);
        await fetchEvents(true); handleModalClose();
      } catch (err) {
        console.error('Error deleting event:', err);
        setModalError(err.response?.data?.message || 'Fallo al eliminar el evento.');
      }
      setActionLoading(false);
    }
  };

  const handleShowMore = useCallback((slotEventsFromCalendar, date) => {
    setCurrentView(Views.DAY); setCurrentDate(date);
  }, []);

  const eventStyleGetter = useCallback((event, start, end, isSelected) => {
    const eventTypeConfig = eventTypeOptions.find(opt => opt.value === event.eventType);
    const backgroundColor = eventTypeConfig ? eventTypeConfig.color : '#777777';
    let style = {
      backgroundColor,
      borderRadius: '4px', opacity: isSelected ? 1 : 0.9, color: 'white',
      border: 'none', display: 'block',
      boxShadow: isSelected ? '0px 2px 6px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.15)',
      zIndex: isSelected ? 10 : 1,
    };
    return { style };
  }, []);

  // --- Lógica para el panel de salas: eventos de los próximos 7 días ---
  const today = moment().startOf('day');
  const sevenDaysLater = moment().add(7, 'days').endOf('day');

  const eventsForSelectedRoomInPanel = events
    .filter(event => {
      if (selectedRoomTab && event.roomReserved !== selectedRoomTab) {
        return false;
      }
      const eventStart = moment(event.start);
      const eventEnd = moment(event.end);
      // El evento debe solapar con el intervalo [hoy, hoy + 7 días]
      return eventStart.isBefore(sevenDaysLater) && eventEnd.isAfter(today);
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (loading && events.length === 0 && !showModal) {
    return <div className="container mt-5 text-center"><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Cargando calendario...</div>;
  }

  return (
    <div className="container-fluid py-3 calendar-page-container"> {/* Contenedor principal */}
      <div className="d-flex justify-content-between flex-wrap align-items-center pt-3 pb-2 mb-3 border-bottom page-header-actions">
        <h1 className="h2 mb-2 mb-md-0">Calendario</h1>
        <button className="btn btn-primary" onClick={() => handleSelectSlot({ start: new Date(), end: moment().add(1, 'hour').toDate() })}>
          <i className="bi bi-plus-circle me-2"></i> Nuevo Evento
        </button>
      </div>

      {error && !showModal && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error} <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
      </div>}

      <div className="event-legend">
        <h5 className="mb-2">Leyenda:</h5>
        <div className="d-flex flex-wrap">
          {eventTypeOptions.filter(opt => opt.value !== '').map(opt => (
            <div key={opt.value} className="legend-item me-3 mb-1 d-flex align-items-center">
              <span className="legend-color-chip me-2" style={{ backgroundColor: opt.color }}></span>
              <span>{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="row calendar-main-row"> {/* Fila principal para calendario y panel */}
        <div className="col-lg-9 col-md-8 mb-3 mb-md-0 calendar-column"> {/* Columna Calendario */}
          <div className="rbc-calendar-container">
            <Calendar
              localizer={localizer} events={events}
              startAccessor="start" endAccessor="end"
              style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }} // Altura ajustable
              selectable
              onSelectSlot={handleSelectSlot} onSelectEvent={handleSelectEvent}
              view={currentView} date={currentDate}
              onView={view => setCurrentView(view)} onNavigate={date => setCurrentDate(date)}
              onShowMore={handleShowMore}
              views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
              defaultView={Views.MONTH}
              eventPropGetter={eventStyleGetter}
              components={{ event: DetailedEventComponent, month: { event: MonthEventComponent } }}
              popup
              messages={{
                previous: 'Anterior', next: 'Siguiente', today: 'Hoy',
                month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
                showMore: total => `+${total} más...`, noEventsInRange: 'No hay eventos en este rango.',
              }}
            />
          </div>
        </div>

        <div className="col-lg-3 col-md-4 rooms-panel-column"> {/* Columna Panel de Salas */}
          <div className="rooms-panel sticky-top">
            <h5 className="mb-3 flex-shrink-0 rooms-panel-title">Eventos Próximos (7 días)</h5>
            <ul className="nav nav-tabs mb-3 flex-shrink-0" id="roomTabs" role="tablist">
              {actualRooms.map(room => (
                <li className="nav-item" role="presentation" key={room.value}>
                  <button
                    className={`nav-link room-tab-button ${selectedRoomTab === room.value ? 'active' : ''}`}
                    type="button" role="tab"
                    onClick={() => setSelectedRoomTab(room.value)}
                  >
                    {room.label}
                  </button>
                </li>
              ))}
              <li className="nav-item" role="presentation">
                <button
                    className={`nav-link room-tab-button ${selectedRoomTab === '' ? 'active' : ''}`}
                    type="button" role="tab"
                    onClick={() => setSelectedRoomTab('')}
                >
                    Todas
                </button>
              </li>
            </ul>
            <div className="room-events-list flex-grow-1">
              {actionLoading && selectedRoomTab && <div className="text-center my-2"><span className="spinner-border spinner-border-sm"></span></div>}
              {eventsForSelectedRoomInPanel.length === 0 && !actionLoading && (
                <p className="text-muted small mt-2">No hay eventos próximos para "{selectedRoomTab ? actualRooms.find(r=>r.value===selectedRoomTab)?.label : 'la selección'}" en los próximos 7 días.</p>
              )}
              {eventsForSelectedRoomInPanel.map(event => (
                <div key={event.id} className="card mb-2 shadow-sm room-event-card">
                  <div className="card-body p-2">
                    <h6 className="card-title mb-1" style={{fontSize: '0.85rem', color: eventTypeOptions.find(et => et.value === event.eventType)?.color || '#212529'}}>
                      {event.title}
                    </h6>
                    <p className="card-text mb-1" style={{fontSize: '0.75rem'}}>
                        <strong>{moment(event.start).format('ddd DD/MM')}</strong>: {moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}
                    </p>
                    {event.roomReserved && (selectedRoomTab === '' || selectedRoomTab !== event.roomReserved) && 
                        <p className="card-text mb-0" style={{fontSize: '0.75rem'}}><small>Sala: {event.roomReserved}</small></p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal (estructura interna sin cambios) */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
           <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" role="document">
            <div className="modal-content">
              <form onSubmit={handleSubmitEvent}>
                <div className="modal-header">
                  <h5 className="modal-title">{selectedEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}</h5>
                  <button type="button" className="btn-close" onClick={handleModalClose} aria-label="Close" disabled={actionLoading}></button>
                </div>
                <div className="modal-body">
                  {modalError && <div className="alert alert-danger">{modalError}</div>}
                  {/* Campos del formulario del modal */}
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">Título*</label>
                    <input type="text" className="form-control" id="title" name="title" value={newEventData.title} onChange={handleInputChange} required disabled={actionLoading} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="eventType" className="form-label">Tipo de Evento*</label>
                    <select className="form-select" id="eventType" name="eventType" value={newEventData.eventType} onChange={handleInputChange} required disabled={actionLoading}>
                      {eventTypeOptions.map(option => (
                        <option key={option.value} value={option.value} disabled={option.value === '' && option.label.includes('Seleccionar')}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Descripción</label>
                    <textarea className="form-control" id="description" name="description" rows="3" value={newEventData.description} onChange={handleInputChange} disabled={actionLoading}></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="startTime" className="form-label">Hora de Inicio*</label>
                      <input type="datetime-local" className="form-control" id="startTime" name="startTime" value={moment(newEventData.startTime).format('YYYY-MM-DDTHH:mm')} onChange={(e) => handleDateChange(new Date(e.target.value), 'startTime')} required disabled={actionLoading} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="endTime" className="form-label">Hora de Fin*</label>
                      <input type="datetime-local" className="form-control" id="endTime" name="endTime" value={moment(newEventData.endTime).format('YYYY-MM-DDTHH:mm')} onChange={(e) => handleDateChange(new Date(e.target.value), 'endTime')} required disabled={actionLoading} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="responsible" className="form-label">Responsable*</label>
                    <input type="text" className="form-control" id="responsible" name="responsible" value={newEventData.responsible} onChange={handleInputChange} required readOnly={!!user?.username} disabled={actionLoading || !!user?.username} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="participants" className="form-label">Participantes (separados por coma)</label>
                    <input type="text" className="form-control" id="participants" name="participants" value={Array.isArray(newEventData.participants) ? newEventData.participants.join(', ') : newEventData.participants} onChange={handleInputChange} disabled={actionLoading}/>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="roomReserved" className="form-label">Sala Reservada</label>
                    <select className="form-select" id="roomReserved" name="roomReserved" value={newEventData.roomReserved} onChange={handleInputChange} disabled={actionLoading}>
                      {roomReservedOptions.map(option => (
                        <option key={option.value} value={option.value} disabled={option.value === '' && option.label.includes('Seleccionar')}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  {selectedEvent && selectedEvent.id && (
                    <button type="button" className="btn btn-danger me-auto" onClick={handleDeleteEvent} disabled={actionLoading}>
                      {actionLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-trash me-2"></i>}
                      Eliminar
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={handleModalClose} disabled={actionLoading}>Cerrar</button>
                  <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                    {actionLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                    {selectedEvent ? 'Guardar Cambios' : 'Crear Evento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;