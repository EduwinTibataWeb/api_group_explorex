import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_EMAIL,
    pass: process.env.EMAIL_PASS
  }
})

export const sendMail = async ({ to, subject, reservationDetails, passengers }) => {
  function generatePassengersList (passengers) {
    // Verifica si el parámetro 'passengers' es un array
    if (!Array.isArray(passengers)) {
      throw new TypeError('Passengers data is not an array')
    }

    return `
            <ul>
              ${passengers.map((passenger, index) => `
                <li>
                  <h2>Passanger #${index + 1}</h2>
                  <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                    <tr>
                      <td> <strong>Type: </strong> </br>${passenger.type}</td>
                      <td colspan="2"> <strong>Name: </strong> </br> ${passenger.first_name} ${passenger.last_name}</td>
                    </tr>
                    <tr>
                      <td><strong>Birth date: </strong> </br>${new Date(passenger.birth_date).toLocaleDateString()}</td>
                      <td><strong>Gender: </strong> </br>${passenger.gender}</td>
                      <td><strong>Nationality: </strong> </br>${passenger.nationality}</td>
                    </tr>
                  </table>
                </li>
              `).join('')}
            </ul>
        `
  }

  const generateReservationDetails = (reservationDetails) => `
      <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tr>
          <td colspan="2"><strong>Name:</strong> ${reservationDetails.first_name} ${reservationDetails.last_name}</td>
        </tr>
        <tr>
          <td><strong>Email:</strong> ${reservationDetails.email}</td>
          <td><strong>Phone:</strong> ${reservationDetails.phone}</td>
        </tr>
        <tr>
          <td><strong>Origin:</strong> ${reservationDetails.origin}</td>
          <td><strong>Destination:</strong> ${reservationDetails.destination}</td>
        </tr>
        <tr>
          <td><strong>Departure Date:</strong> ${reservationDetails.departure_date}</td>
          <td><strong>Number of Days:</strong> ${reservationDetails.number_days}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Travel Type:</strong> ${reservationDetails.type_travel}</td>
        </tr>
        <tr>
          <td><strong>Children Count:</strong> ${reservationDetails.children_count}</td>
          <td><strong>Adults Count:</strong> ${reservationDetails.adults_count}</td>
        </tr>
        <tr>
          <td colspan="2"><strong >Approximate Budget:</strong> $ ${reservationDetails.aproximate_budget}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Message:</strong> ${reservationDetails.message}</td>
        </tr>
      </table>
    `

  // Genera el contenido del correo basado en si hay pasajeros o detalles de reserva
  const content = passengers
    ? `<h1>Passenger Information</h1><p>Here are the details of the passengers:</p><ul>${generatePassengersList(passengers)}</ul>`
    : `<h1>New Reservation Created</h1><p>Dear Eduwin,</p><p>A new reservation has been created with the following details:</p>${generateReservationDetails(reservationDetails)}`

  const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reservation Alert</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  border-radius: 8px;
                  overflow: hidden;
              }
              .header {
                  background-color: #f39c12;
                  color: white;
                  text-align: center;
                  padding: 20px;
                  font-size: 24px;
              }
              .content {
                  padding: 20px;
              }
              .content h1 {
                  color: #333;
              }
              .content p {
                  color: #666;
                  line-height: 1.6;
              }
              .footer {
                  background-color: #f39c12;
                  color: white;
                  text-align: center;
                  padding: 10px;
                  font-size: 14px;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #f39c12;
                  color: white;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
              }
              ul {
                  list-style-type: none;
                  padding: 0;
              }
              li {
                  margin: 5px 0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  Reservation Alert
              </div>
              <div class="content">
                  ${content}
              </div>
              <div class="footer">
                  &copy; 2024 Group Explorex. All rights reserved.
              </div>
          </div>
      </body>
      </html>
    `

  try {
    const info = await transporter.sendMail({
      from: '"Group Explorex" <groupexplorex@gmail.com>',
      to,
      subject,
      text: 'Please check your email for details.',
      html: htmlContent
    })

    console.log('Message sent: %s', info.messageId)
  } catch (error) {
    console.error('Error sending email:', error)
  }
}
