import React from 'react';
import { Container } from 'react-bootstrap';
import AppNavbar from './Navbar';

const MainLayout = ({ children }) => {
  return (
    <>
      <AppNavbar />
      <Container fluid className="mt-5 pt-3">
        <main>{children}</main>
      </Container>
    </>
  );
};

export default MainLayout;