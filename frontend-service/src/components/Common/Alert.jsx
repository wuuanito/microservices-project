import React from 'react'

const Alert = ({ type = 'info', message, onClose }) => {
  const alertClass = `alert alert-${type} ${onClose ? 'alert-dismissible' : ''}`

  return (
    <div className={alertClass} role="alert">
      {message}
      {onClose && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        ></button>
      )}
    </div>
  )
}

export default Alert