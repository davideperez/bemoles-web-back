const nodeMailer = require('nodemailer')
require("dotenv").config()

function getCurrentYear() {
    return new Date().getFullYear();
}

async function sendReserveConfirmationEmail(reserve, event) {
    
    const { title: eventTitle , date: eventDate , paymentLink: eventPaymentLink, image } = event
    const { email: receiverEmail, firstName: receiverFirstName, lastName: receiverLastName, ticketQuantity } = reserve
    const currentYear = getCurrentYear()

    // Date and Time formatting:
    const eventDateTime = new Date(eventDate);

    const dateOptions = {
        weekday: 'long',    // Displays the day of the week in long format (e.g., "Miercoles")
        day: 'numeric',     // Displays the day of the month (e.g., "19")
        month: 'long',      // Displays the month in long format (e.g., "Julio")
        year: 'numeric',    // Displays the full year (e.g., "2023")
    };

    const timeOptions = {
        hour: '2-digit',    // Displays the hours in 2-digit format (e.g., "12")
        minute: '2-digit',  // Displays the minutes in 2-digit format (e.g., "49")
    };

    const formattedDate = eventDateTime.toLocaleString('es-ES', dateOptions);
    const formattedTime = eventDateTime.toLocaleString('es-ES', timeOptions);

    function capitalizeFirstLetter(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    }

    const upperCasedDate = capitalizeFirstLetter(formattedDate);

    //Email Template
    const emailHtml = `
    <html>
    <head>
        <style>
            /* Add your preferred styling here */
            body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
            }

            .container {
                max-width: 600px;
                margin: 20px auto;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                background-color: #fff;
            }

            .header {
                background: linear-gradient(to bottom, #2b2b2b, #525252);
                color: #fff;
                text-align: center;
                padding: 50px 0;
                border-radius: 5px 5px 0 0;
                position: relative;
                margin-bottom: 20px;
            }

            .header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: normal;
                align-items: center;
            }

            .header p {
                font-size: 18px;
            }

            p {
                margin: 5px 0;
                color:#000;
                font-size: 16px
            }

            .event-info {
                margin-bottom: 15px;
                padding-left: 10px;
            }

            .event-info p {
                margin: 5px 0;
                font-size: 16px;
                color: #555;
                display: flex;
                align-items: center;
            }

            .event-info p strong {
                margin-right: 10px;
            }

            .payment-link {
                text-align: center;
                margin: 30px 0;
            }

            .payment-link a {
                display: inline-block;
                background-color: #1a73e8;
                color: #fff;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 5px;
                font-weight: bold;
                transition: background-color 0.3s ease;
            }

            .payment-link a:hover {
                background-color: #0e62cb;
            }

            .footer {
                text-align: center;
                padding-top: 15px;
                border-top: 1px solid #ddd;
            }

            .footer p {
                margin: 5px 0;
                color: #777;
                font-size: 12px;
                align-content: center;
            }

            .bemoles-logo {
                max-width: 350px;
                max-height: 350px;
                margin-top: 20px;
                margin-bottom: 20px;
            }

            .bemoles-iso {
                max-width: 50px;
                max-height: 50px;
                margin-top: 20px;
                margin-bottom: 20px;
            }

            .event-image {
                max-width: 700px;
                max-height: 650px;
                margin-top: 20px;
                margin-bottom: 20px;
                align-self: center;
            }

            .header-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.5;
                background-image: url('header-background.jpg');
                background-size: cover;
                background-position: center;
                border-radius: 5px 5px 0 0;
                z-index: -1;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="header-background"></div>
                <img class='bemoles-logo'src="https://res.cloudinary.com/dlwra6psn/image/upload/v1689882547/web_resources/bemoles_logo_v9ojyh.png" alt="Bemoles-Logo">
                <h2>Espacio de Cultura y Encuentro</h2>
            </div>
            <p>Hola ${receiverFirstName} ${receiverLastName},</p>
            <p>Tu reserva fue realizada con éxito.</p>
            <p>Para completar tu compra, haz clic en el link de pago.</p>
            <div class="event-info">
                <img src="${image}" alt="Imagen-del-evento" class="event-image"/>
                <p><strong>Evento:</strong> ${eventTitle}</p>
                <p><strong>Fecha:</strong> ${upperCasedDate}</p>
                <p><strong>Horario:</strong> ${formattedTime}</p>
                <p><strong>Cantidad de Entradas Reservadas:</strong> ${ticketQuantity}</p>
                <p><strong>Link de Pago:</strong> ${eventPaymentLink}</p>

            <div class="footer">
                <p>&copy; ${currentYear} Espacio de Cultura y Encuentro Los Bemoles. Todos los derechos reservados.</p>
                <img src="https://res.cloudinary.com/dlwra6psn/image/upload/v1689966858/web_resources/iso_w4m7tx.png" alt="Logo" class="bemoles-iso"/>
            </div>
        </div>
    </body>
</html>
`

    const transporterSettings = nodeMailer.createTransport({
        host: process.env.EMAIL_SERVER,
        port: 465,
        secure: true,
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_PASS,
        }
    })
    try {
        //it returns if the information was sent or not, if it wass succesful or not. 
        const info = await transporterSettings.sendMail({
            from: `${process.env.SENDER_NAME} <${process.env.SENDER_EMAIL}>`,
            to: receiverEmail,
            subject: 'Reservas - Los Bemoles',
            html: emailHtml
        })
        
        console.log("Message sent. messageId: " + info.messageId)
    } catch (err) {
        console.log(err.message)
        return err
    }


}

module.exports = {sendReserveConfirmationEmail}