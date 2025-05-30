import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const Unauthorized = () => {
  return (
    <MainLayout>
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="text-center">
              <Card.Body>
                <Card.Title as="h1" className="text-danger">
                  Acceso No Autorizado
                </Card.Title>
                <Card.Text className="lead mt-3">
                  No tienes permiso para acceder a esta página.
                </Card.Text>
                <Card.Text>
                  Es posible que no tengas el rol o departamento requerido para ver este contenido.
                </Card.Text>
                <Button as={Link} to="/dashboard" variant="primary" className="mt-3">
                  Volver al Dashboard
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default Unauthorized;