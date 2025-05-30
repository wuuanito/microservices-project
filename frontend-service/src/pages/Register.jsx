import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    department: 'sin_departamento',
    role: 'empleado',
    jobTitle: ''
  });
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setValidated(true);
    setLoading(true);
    setError('');

    try {
      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.error || 'Error al registrar usuario. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title className="text-center mb-4">Registro de Usuario</Card.Title>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="username">
                      <Form.Label>Nombre de usuario</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={userData.username}
                        onChange={handleChange}
                        required
                        minLength={3}
                        maxLength={50}
                      />
                      <Form.Control.Feedback type="invalid">
                        El nombre de usuario debe tener entre 3 y 50 caracteres.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa un email válido.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="firstName">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={userData.firstName}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa tu nombre.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="lastName">
                      <Form.Label>Apellido</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={userData.lastName}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Por favor ingresa tu apellido.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="department">
                      <Form.Label>Departamento</Form.Label>
                      <Form.Select
                        name="department"
                        value={userData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value="sin_departamento">Sin departamento</option>
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
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="jobTitle">
                      <Form.Label>Cargo</Form.Label>
                      <Form.Control
                        type="text"
                        name="jobTitle"
                        value={userData.jobTitle}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                  <Form.Control.Feedback type="invalid">
                    La contraseña debe tener al menos 6 caracteres.
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </Button>
                </div>
              </Form>
              <div className="text-center mt-3">
                <p>
                  ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;