const nodemailer = require('nodemailer');
const logger = require('./logger');

// Configura el transporter de Nodemailer
// Es importante reemplazar esto con credenciales reales o un servicio de correo transaccional en producción.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Your Gmail App Password or account password (less secure)
  },
});

/**
 * Envía un correo electrónico.
 * @param {string} to - Destinatario del correo.
 * @param {string} subject - Asunto del correo.
 * @param {string} text - Cuerpo del correo en texto plano.
 * @param {string} html - Cuerpo del correo en HTML.
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Soporte NaturePharma" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to, // lista de receptores
      subject, // Asunto
      text, // cuerpo en texto plano
      html, // cuerpo en html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Correo enviado: ${info.messageId} a ${to}`);
    // Para Ethereal, puedes obtener la URL de vista previa así:
    if (process.env.EMAIL_HOST === 'smtp.ethereal.email') {
      logger.info(`URL de vista previa del correo: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    logger.error(`Error al enviar correo a ${to}: ${error.message}`);
    // Considera no lanzar el error para no detener el flujo principal si el correo es secundario,
    // o lánzalo si el correo es crítico.
    // throw new Error('Error al enviar el correo');
  }
};

module.exports = { sendEmail };