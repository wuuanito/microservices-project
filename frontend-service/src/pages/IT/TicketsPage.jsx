import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Modal, Form } from 'react-bootstrap';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../hooks/useAuth';

const TicketsPage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: 'Problema con impresora',
      department: 'administracion',
      status: 'pendiente',
      priority: 'media',
      createdAt: '2023-05-15',
      description: 'La impresora de la oficina no responde.'
    },
    {
      id: 2,
      title: 'Error en el sistema de inventario',
      department: 'logistica',
      status: 'en_proceso',
      priority: 'alta',
      createdAt: '2023-05-14',
      description: 'No puedo acceder al módulo de inventario.'
    },
    {
      id: 3,
      title: 'Actualización de software',
      department: 'gerencia',
      status: 'completado',
      priority: 'baja',
      createdAt: '2023-05-10',
      description: 'Necesito actualizar el software de análisis de datos.'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    department: '',
    priority: 'media',
    description: ''
  });

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTicket({
      ...newTicket,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simular la creación de un nuevo ticket
    const ticket = {
      id: tickets.length + 1,
      ...newTicket,
      status: 'pendiente',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTickets([ticket, ...tickets]);
    setNewTicket({
      title: '',
      department: '',
      priority: 'media',
      description: ''
    });
    
    handleClose();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendiente':
        return <Badge bg="warning">Pendiente</Badge>;
      case 'en_proceso':
        return <Badge bg="primary">En Proceso</Badge>;
      case 'completado':
        return <Badge bg="success">Completado</Badge>;
      default:
        return <Badge bg="secondary">Desconocido</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'alta':
        return <Badge bg="danger">Alta</Badge>;
      case 'media':
        return <Badge bg="warning">Media</Badge>;
      case 'baja':
        return <Badge bg="info">Baja</Badge>;
      default:
        return <Badge bg="secondary">Normal</Badge>;
    }
  };

  return (
    <MainLayout>
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h1>Gestión de Tickets IT</h1>
            <p className="lead">
              Sistema de gestión de tickets para el departamento de informática
            </p>
          </Col>
          <Col xs="auto">
            <Button variant="primary" onClick={handleShow}>
              Nuevo Ticket
            </Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Tickets Activos</Card.Title>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Título</th>
                      <th>Departamento</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>Fecha</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>{ticket.id}</td>
                        <td>{ticket.title}</td>
                        <td>{ticket.department}</td>
                        <td>{getStatusBadge(ticket.status)}</td>
                        <td>{getPriorityBadge(ticket.priority)}</td>
                        <td>{ticket.createdAt}</td>
                        <td>
                          <Button variant="outline-primary" size="sm">
                            Ver
                          </Button>{' '}
                          {(user.role === 'director' || user.role === 'administrador') && (
                            <Button variant="outline-success" size="sm">
                              Editar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal para crear nuevo ticket */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={newTicket.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Departamento</Form.Label>
              <Form.Select
                name="department"
                value={newTicket.department}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar departamento</option>
                <option value="informatica">Informática</option>
                <option value="administracion">Administración</option>
                <option value="internacional">Internacional</option>
                <option value="compras">Compras</option>
                <option value="gerencia">Gerencia</option>
                <option value="oficina_tecnica">Oficina Técnica</option>
                <option value="calidad">Calidad</option>
                <option value="laboratorio">Laboratorio</option>
                <option value="rrhh">RRHH</option>
                <option value="logistica">Logística</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="softgel">Softgel</option>
                <option value="produccion">Producción</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prioridad</Form.Label>
              <Form.Select
                name="priority"
                value={newTicket.priority}
                onChange={handleChange}
                required
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={newTicket.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleClose} className="me-2">
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Crear Ticket
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </MainLayout>
  );
};

export default TicketsPage;