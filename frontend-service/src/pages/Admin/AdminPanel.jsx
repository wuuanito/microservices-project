import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form } from 'react-bootstrap';
import MainLayout from '../../components/layout/MainLayout';
import { useAuth } from '../../hooks/useAuth';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'director',
      department: 'informatica',
      isActive: true
    },
    {
      id: 2,
      username: 'tecnico1',
      email: 'tecnico1@example.com',
      firstName: 'Carlos',
      lastName: 'Técnico',
      role: 'empleado',
      department: 'informatica',
      isActive: true
    },
    {
      id: 3,
      username: 'rrhh1',
      email: 'rrhh1@example.com',
      firstName: 'Ana',
      lastName: 'Recursos',
      role: 'administrador',
      department: 'rrhh',
      isActive: true
    }
  ]);

  // Filtros
  const [filters, setFilters] = useState({
    department: '',
    role: '',
    status: ''
  });

  const [filteredUsers, setFilteredUsers] = useState(users);

  // Efecto para filtrar usuarios
  useEffect(() => {
    let result = [...users];

    if (filters.department) {
      result = result.filter(user => user.department === filters.department);
    }

    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      const isActive = filters.status === 'active';
      result = result.filter(user => user.isActive === isActive);
    }

    setFilteredUsers(result);
  }, [filters, users]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const toggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  // Determinar si el usuario actual puede editar otros usuarios
  const canEdit = user.role === 'director' || (user.role === 'administrador' && user.department === 'rrhh');

  return (
    <MainLayout>
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h1>Panel de Administración</h1>
            <p className="lead">
              Gestión de usuarios y permisos del sistema
            </p>
          </Col>
          {canEdit && (
            <Col xs="auto">
              <Button variant="primary">
                Nuevo Usuario
              </Button>
            </Col>
          )}
        </Row>

        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filtrar por Departamento</Form.Label>
              <Form.Select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
              >
                <option value="">Todos los departamentos</option>
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
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filtrar por Rol</Form.Label>
              <Form.Select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
              >
                <option value="">Todos los roles</option>
                <option value="director">Director</option>
                <option value="administrador">Administrador</option>
                <option value="empleado">Empleado</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Filtrar por Estado</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Listado de Usuarios</Card.Title>
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre de Usuario</th>
                      <th>Nombre Completo</th>
                      <th>Email</th>
                      <th>Departamento</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      {canEdit && <th>Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.department}</td>
                        <td>
                          {user.role === 'director' && <Badge bg="danger">Director</Badge>}
                          {user.role === 'administrador' && <Badge bg="warning">Administrador</Badge>}
                          {user.role === 'empleado' && <Badge bg="info">Empleado</Badge>}
                        </td>
                        <td>
                          {user.isActive ? 
                            <Badge bg="success">Activo</Badge> : 
                            <Badge bg="secondary">Inactivo</Badge>
                          }
                        </td>
                        {canEdit && (
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-2">
                              Editar
                            </Button>
                            <Button 
                              variant={user.isActive ? "outline-danger" : "outline-success"} 
                              size="sm"
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.isActive ? "Desactivar" : "Activar"}
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default AdminPanel;