const nodemailer = require('nodemailer');
require('dotenv').config(); // To load environment variables

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const sendEventInvitationEmail = async (to, event) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: to.join(','), // Send to multiple participants
    subject: `Invitación al evento: ${event.title}`,
    html: `
      
      <p>Has sido invitado al siguiente evento:</p>
      <ul>
        <li><strong>Título:</strong> ${event.title}</li>
        <li><strong>Descripción:</strong> ${event.description || 'No especificada'}</li>
        <li><strong>Responsable:</strong> ${event.responsible}</li>
        <li><strong>Sala:</strong> ${event.roomReserved || 'No especificada'}</li>
        <li><strong>Inicio:</strong> ${new Date(event.startTime).toLocaleString()}</li>
        <li><strong>Fin:</strong> ${new Date(event.endTime).toLocaleString()}</li>
      </ul>
      <p>Por favor, confirma tu asistencia.</p>
      <p>Saludos,</p>
      <p>El equipo de NaturePharma</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Correo de invitación enviado a: ${to.join(',')}`);
  } catch (error) {
    console.error('Error al enviar el correo de invitación:', error);
    // Consider re-throwing the error or handling it as per application needs
    // throw new Error('Error al enviar el correo de invitación.');
  }
};

module.exports = {
  sendEventInvitationEmail,
};