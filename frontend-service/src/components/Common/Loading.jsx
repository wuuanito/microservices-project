// src/components/Common/Loading.jsx
import React from 'react'

const Loading = ({ message = 'Cargando...' }) => {
  return (
    <div className="loading-container">
      <div className="text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">{message}</p>
      </div>
    </div>
  )
}

export default Loading

