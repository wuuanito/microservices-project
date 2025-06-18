const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email.service');
const logger = require('../utils/logger');

/**
 * @route POST /api/email/send
 * @desc Enviar email usando SMTP
 * @access Private
 */
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    // Validar campos requeridos
    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Los campos "to" y "subject" son obligatorios'
      });
    }

    // Enviar el email
    await sendEmail(to, subject, text, html);

    logger.info(`Email enviado exitosamente a: ${to}`);
    
    res.status(200).json({
      success: true,
      message: 'Email enviado correctamente',
      data: {
        to,
        subject,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error al enviar email:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al enviar email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route POST /api/email/suggestion
 * @desc Enviar sugerencia por email
 * @access Private
 */
router.post('/suggestion', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validar campos requeridos
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son obligatorios: name, email, subject, message'
      });
    }

    // Crear contenido HTML del email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin: 0; font-size: 24px;">🌿 Nature Pharma</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Sistema de Sugerencias</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin-bottom: 25px;">
            <h2 style="color: #0c4a6e; margin: 0 0 10px 0; font-size: 18px;">💡 Nueva Sugerencia Recibida</h2>
            <p style="color: #075985; margin: 0;">Se ha recibido una nueva sugerencia para mejorar la aplicación.</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📋 Detalles de la Sugerencia</h3>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 15px;">
              <p style="margin: 0 0 8px 0;"><strong style="color: #374151;">👤 Nombre:</strong> <span style="color: #6b7280;">${name}</span></p>
              <p style="margin: 0 0 8px 0;"><strong style="color: #374151;">📧 Email:</strong> <span style="color: #6b7280;">${email}</span></p>
              <p style="margin: 0;"><strong style="color: #374151;">📝 Asunto:</strong> <span style="color: #6b7280;">${subject}</span></p>
            </div>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px;">
              <p style="margin: 0 0 10px 0;"><strong style="color: #374151;">💬 Mensaje:</strong></p>
              <div style="background-color: white; padding: 15px; border-radius: 4px; border: 1px solid #e5e7eb;">
                <p style="color: #6b7280; margin: 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; border: 1px solid #bbf7d0; margin-bottom: 25px;">
            <p style="color: #166534; margin: 0; font-size: 14px;">⏰ <strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-ES')}</p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; margin: 0; font-size: 12px;">Este email fue generado automáticamente por el sistema Nature Pharma</p>
            <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} Nature Pharma - Todos los derechos reservados</p>
          </div>
        </div>
      </div>
    `;

    // Crear contenido de texto plano
    const textContent = `
Nueva Sugerencia para Nature Pharma

Nombre: ${name}
Email: ${email}
Asunto: ${subject}

Mensaje:
${message}

---
Fecha de envío: ${new Date().toLocaleString('es-ES')}
Enviado desde el sistema Nature Pharma
    `;

    // Enviar el email
    await sendEmail(
      'desarrollos@naturepharma.es',
      `Sugerencia Nature Pharma: ${subject}`,
      textContent,
      htmlContent
    );

    logger.info(`Sugerencia enviada exitosamente de: ${name} (${email})`);
    
    res.status(200).json({
      success: true,
      message: 'Sugerencia enviada correctamente',
      data: {
        from: email,
        name,
        subject,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error al enviar sugerencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al enviar sugerencia',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;