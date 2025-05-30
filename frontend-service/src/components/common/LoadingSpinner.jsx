// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { Spinner, Container } from 'react-bootstrap';

const LoadingSpinner = ({ fullScreen = true, message = "Cargando..." }) => {
  if (fullScreen) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">{message}</span>
          </Spinner>
          <h3 className="mt-3">{message}</h3>
        </div>
      </Container>
    );
  }
  
  return (
    <div className="d-flex justify-content-center p-5">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">{message}</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;