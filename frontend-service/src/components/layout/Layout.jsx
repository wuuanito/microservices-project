// src/components/Layout/Layout.jsx - ARREGLADO para usar DynamicSidebar
import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'


const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar superior */}
      <Navbar />
      
      {/* Contenido principal */}
      <div className="flex-grow-1">
        <div className="container-fluid">
          <div className="row">
            {/* Contenido principal - Ocupa todo el ancho ahora */}
            <main className="col-12 px-md-4 main-content">
              <div className="pt-3 pb-2 mb-3">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout