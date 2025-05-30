// En src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../components/layout/MainLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Personalizar mensaje según la hora del día
      const hour = new Date().getHours();
      let greeting = '';

      if (hour >= 5 && hour < 12) {
        greeting = 'Buenos días';
      } else if (hour >= 12 && hour < 18) {
        greeting = 'Buenas tardes';
      } else {
        greeting = 'Buenas noches';
      }

      setWelcomeMessage(`${greeting}, ${user?.firstName || user?.username}`);
    }
  }, [user]);

  if (loading || !user) {
    return <LoadingSpinner message="Cargando tu dashboard..." />;
  }

  return (
    <MainLayout>
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <h1>{welcomeMessage}</h1>
            <p className="lead">
              Bienvenido al panel de control del sistema de microservicios.
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Información del Usuario</Card.Title>
                <Card.Text>
                  <strong>Nombre:</strong> {user?.firstName} {user?.lastName}
                  <br />
                  <strong>Email:</strong> {user?.email}
                  <br />
                  <strong>Departamento:</strong> {user?.department}
                  <br />
                  <strong>Rol:</strong> {user?.role}
                  <br />
                  <strong>Cargo:</strong> {user?.jobTitle}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>Resumen</Card.Title>
                <Card.Text>
                  {user?.role === 'director' || user?.role === 'administrador' ? (
                    <>
                      Como {user.role}, tienes acceso a funciones administrativas y de gestión.
                      Puedes ver información detallada de tu departamento y gestionar usuarios.
                    </>
                  ) : (
                    <>
                      Como miembro del departamento de {user?.department}, tienes acceso a las
                      funciones básicas de tu área.
                    </>
                  )}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Sección específica según el departamento */}
        {user?.department === 'informatica' && (
          <Row>
            <Col md={12} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>Sistemas Informáticos</Card.Title>
                  <Card.Text>
                    Accede a la gestión de sistemas, tickets de soporte y mantenimiento de
                    infraestructura.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        
        {/* Aquí puedes añadir más secciones específicas para otros departamentos */}
      </Container>
    </MainLayout>
  );
};

export default Dashboard;