const {
  getFormatedDate,
  getExpirationDate,
  isExpiratedReserve,
} = require("../helpers/validateReserves");
const mercadopago = require("mercadopago");
const {
  getReserve,
  getAllReserves,
  deleteReserveById,
  getReserveByQuery,
  updateReserveByIdInMongoDB,
  createReserveByIdInMongoDB,
} = require("../models/reserves/reserves.model");
const {
  getEvent,
  updateEventByIdInMongoDB,
} = require("../models/events/events.model");
const {
  sendPaymentConfirmationEmail,
} = require("../templates/payment-confirmation");
const { sendStockAlertEmail } = require("../templates/stock-alert");
const { adapterMPPaymentStatus } = require("../adapter/paymentStatus");
const { PAYMENT_STATUS } = require("../lib/types/enums/paymentStatus");
const { sendReserveConfirmationEmail } = require("../templates/reserve-confirmation");

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

/*  - Para Solicitar el posteo de una nueva reserva en mongodb. */

async function httpAddNewReserve(req, res) {
  try {
    /* 01 Descarga el body de la solicitud, que es el objeto reserva. */

    const reserve = req.body;

    /* 02 Valida que el objeto reserva contenga los campos requeridos. */

    if (
      !reserve.firstName ||
      !reserve.lastName ||
      !reserve.dni ||
      !reserve.ticketQuantity ||
      !reserve.email ||
      !reserve.event
    ) {
      return res.status(400).json({
        success: false,
        message: "Falta cargar una de las propiedades de la reserva.",
      });
    }
    
    
    /* 03 Descarga objeto evento de la DB, este es objeto padre de la reserva. */

    const event = await getEvent(reserve.event);
    console.log(event);
    
    /* 04 Si el evento tiene precio, se crea una "preference" 
    con la configuracion para solicitar la creacion de una orden de pago a MP. */

    if (event.price) {
      let preference = {
        items: [
          {
            title: `Reserva: ${event.title}`,
            unit_price: event.price,
            quantity: reserve.ticketQuantity,
            currency_id: "ARS",
          },
        ],
        back_urls: {
          success: `${process.env.URL_FRONTEND}/feedback/${event._id}`,
          failure: `${process.env.URL_FRONTEND}/feedback/${event._id}`,
          pending: `${process.env.URL_FRONTEND}/feedback/${event._id}`,
        },
        auto_return: "approved",
        expires: true,
        expiration_date_from: getFormatedDate(new Date()),
        expiration_date_to: getFormatedDate(getExpirationDate(new Date())),
      };
    
    /* 05 Se solicita(await) la creacion (.create()), se recibe y se almacena 
    (const), de la API de MP, una orden de pago. Se usa la preference antes creada. */
      
    const response = await mercadopago.preferences.create(preference);
    console.log("//////////////////////////////// Respuesta de MP API a la Creacion de la reserva: ", reserve.id, response,"//////////////////////////////////////////////////")
    
    /* 06 Se completan las propiedades del objeto reserva con la informacion 
    de la nueva orden enviada como respuesta por la API de MP. Id de la Preferencia, 
    Linke de Pago, Estado del Pago, y el array de pagos realizados.*/

    reserve.paymentStatus = PAYMENT_STATUS.NOT_PAID;
    reserve.MPPreferenceId = response.body.id;
    reserve.paymentLink = response.body.init_point;
    reserve.payments = [];

    /* 07 Si el precio del evento es 0, es decir es gratis, solo se completa la propiedad "Estado del Pago"*/

    } else {
      reserve.paymentStatus = PAYMENT_STATUS.SUCCESS;
    }

    /* 08 Se calcula el stock de entradas disponible del evento actual */

    /*Se desplegan en un array las reservas del evento y la reserva actual para contar 
    las ENTRADAS de las reservas confirmadas, con un reduce. */
    const confirmmedReserves = [...event.reserves, reserve].reduce(
      (totalConfirmmedReserves, aReserve) => {
        const isCurrentReserve =
          // filtro1, no contar las entradas de reservas que expiraron.
          !isExpiratedReserve(aReserve.createdAt) ||
          //filtro2, solo contar las entradas de reservas con estado success y pending.
          [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS].includes(
            aReserve.paymentStatus
          );
        /* Se acumulan las entras de las reservas que cumplen con las condiciones en totalConfirmmedReserves */
        const updatedTotalConfirmmedReserves = totalConfirmmedReserves + (isCurrentReserve ? aReserve.ticketQuantity : 0);
        return updatedTotalConfirmmedReserves;
      },
      0
    );
    //Se calculan las entradas disponibles.
    const ticketsAvailable = event.maxAttendance - confirmmedReserves;
    
    console.log(
      `Cupo maximo de entradas del evento es: ${event.maxAttendance}, 
      Entradas reservadas incluyendo la reserva actual: ${confirmmedReserves}, 
      Entradas disponibles incluyendo la reserva actual: ${ticketsAvailable}.`
    );

    /* 09.1 Si no hay stock de entradas disponibles se manda un mensaje de alerta: */

    if (ticketsAvailable < 0)
      return res.status(409).json({ message: "El cupo esta completo" });
    
    // 09.2 Si el stock es menor a 10 :
    if (ticketsAvailable < 10)
      await sendStockAlertEmail(event, ticketsAvailable);


    /* 10 Se crea la reserva en la DB de Reservas y se guarda la respuesta en reserveCreated..*/

    const reserveCreated = await createReserveByIdInMongoDB(reserve);
  
    /* 11 Se actualiza el evento en la DB agregando el id de la reserva recientemente creada.*/

    await updateEventByIdInMongoDB(reserve.event, {
      $push: { reserves: reserveCreated._id.toString() },
    });

    /* 12 Se notifica al que reservo, via email que la reserva fue realizada con exito.*/

    await sendReserveConfirmationEmail(reserve, event, { isFree: Boolean(!event.price)});

    /* 13 Se notifica al reservas@losbemoles.com.ar sobre la nueva reserva realizada.*/ //TBD

    /* 14 Se devuelve el header http 200 y la reserva recientemente creada.*/
  
    return res.status(201).json(reserveCreated);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpGetAllReserves(req, res) {
  try {
    const { search, page, items } = req.query;
    return res.status(200).json(await getAllReserves(+page, +items, search));
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpGetReserve(req, res) {
  try {
    const reserveId = req.params.id
    return res.status(200).json(await getReserve(reserveId));
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

//UPDATE

//TBD
async function httpCancelReserveOnMercadoPago(req, res) {
  try {
    const reserveId = req.params.id
    const reserveToCancel = await getReserve(reserveId)
    //
    console.log("Esta es la reserva a CANCELAR: ", reserveToCancel)

    //    
   
    return res.status(200).json({ success: true, message: "La reserva ha sido cancelada en Mercadopago" });
  } catch (err) {
    console.log("Ha ocurrido un error al CANCELAR la Reserva en Mercadopago", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}

//TBD
async function httpSetReserveToPaid(req, res) {
  try {

    // 01 se copia el id de la reserva enviada por parametros.
    const reserveId = req.params.id

    //02 Se pide la reserva a la DB.
    const reserveToUpdate = await getReserve(reserveId)
    
    //03 Se manda el update de reserva expirada a MercadoPago. //TBD
    

    // Se marca la reserva como paga en la db.
    reserveToUpdate.paymentStatus = PAYMENT_STATUS.SUCCESS
    
    //se actualiza el stock de reservas en el evento??
   
    return res.status(200).json({ success: true, message: "La reserva ha sido marcada como PAGA" });
  } catch (err) {
    console.log("Ha ocurrido un error al marcar la Reserva como PAGA.", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}

//Para que MP le avise al sistema que se realizo un pago sobre una orden.

  async function httpPaymentReserveNotification(req, res) {
  try {
    //TBD: Validar origen de la notificación
    
    //1- Se busca el payment-object mediante el id que viene el body del request.
    const payment = await mercadopago.payment.findById(req.body.data.id);
    
    //2- Se envia un mensaje de OK aa MP validando que se recibio correctamente la notificacion. 
    res.status(200).send("OK");
    
    //3A- Se bifurca en escenario de testing o escenario de produccion.
    if (req.body.type == "test") {
      console.log("Notificación de pago de prueba recibida");
    
    //3B- Si es un caso de produccion, es decir "hay id de pago"
    } else if (req.body.data.id) {

      //Busca la orden-object usando el id que se enceuntra en las propiedades del payment-object.
      const merchantOrder = await mercadopago.merchant_orders.findById(payment.body.order.id);

      //Se obtiene el id del preference-object
      const MPPreferenceId = merchantOrder.body.preference_id;

      //Se obtiene el status del payment-object
      const status = payment.body.status;

      //Se obtiene el reserve-object buscandola en ???? usando el id del preference-object.
      const reserve = await getReserveByQuery({ MPPreferenceId });
      console.log("reserve:", reserve);
      
      //Impresion en Consola para controlar el estado del pago recibido.
      if (!reserve)
        throw new Error(
          "La reserva no ha sido encontrada por su campo MPPreferenceId"
        );
      console.log(
        `El estado del pago en mercadopago para la reserva del evento ${reserve.event.title} es ${status}`
      );

      //Conversion del valor que viene de MP a los valores que usamos en el back. 
      const paymentStatusKey = adapterMPPaymentStatus(status);

      const paymentIdExist = reserve.payments.some(
        (p) => p.paymentId === req.body.data.id.toString()
      );


      await updateReserveByIdInMongoDB(
        reserve._id,
        {
          ...(paymentIdExist
            ? {}
            : {
                $push: {
                  payments: { paymentId: req.body.data.id.toString() },
                },
              }),
          paymentStatus: PAYMENT_STATUS[paymentStatusKey],
        },
        { new: true }
      );


      if (PAYMENT_STATUS[paymentStatusKey] === PAYMENT_STATUS.SUCCESS) {
        //Cambia la fecha de expiracion por la actual para darlo de baja. 
        await mercadopago.preferences.update({
          id: MPPreferenceId,
          expiration_date_to: getFormatedDate(new Date()),
        });
        //
        await sendPaymentConfirmationEmail(reserve, reserve.event);
      }
    }
  } catch (err) {
    console.log(
      "Ha ocurrido un error en la validación de un pago con el webhook de mercadopago:",
      err
    );
  }
}


// Consulta el estado del pago de la reserva???

async function httpGetFeedbackReserve(req, res) {
  try {
    // 01 Si no hay id de pago en la query
    if (req.query.payment_id === "null") throw new Error('No se ha encontrado el pago');
    const payment = await mercadopago.payment.findById(req.query.payment_id);
    // const merchantOrder = await mercadopago.merchant_orders.findById(payment.body.order.id);
    // const preferenceId = merchantOrder.body.preference_id;
    
    //02
    if (!payment?.body?.status) throw new Error("No se ha encontrado el pago");
    
    const status = payment.body.status;
    
    const paymentStatusKey = adapterMPPaymentStatus(status);
    //
    res.status(200).send({ status: PAYMENT_STATUS[paymentStatusKey] });
  } catch (err) {
    console.log("Ha ocurrido un error en la validación del pago - ", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}

async function httpGetReservePayment(req, res) {
  try {
    const reserve = await getReserve(req.params.id);
    const payments = await Promise.all(
      reserve.payments.map(async (p) => {
        const payment = await mercadopago.payment.findById(p.paymentId);
        return {
          _id: p._id,
          status:
            PAYMENT_STATUS[adapterMPPaymentStatus(payment.response.status)],
          total_amount: payment.response.transaction_details.total_paid_amount,
          net_received_amount: payment.response.transaction_details.net_received_amount,
          client_email: payment.response.payer.email,
          client_phone: payment.response.payer.phone,
          currency_id: payment.response.currency_id,
          date_approved: payment.response.date_approved,
          date_created: payment.response.date_created,
          date_last_updated: payment.response.date_last_updated,
        };
      })
    );
    res.status(200).send(payments);
  } catch (err) {
    console.log("Ha ocurrido un error en la validación del pago - ", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}

//TBD

async function httpDeleteReserve(req, res) {
  try {

    // 01 Se trae la reserva con el id que vino en la request.
    const reserve = await getReserve(req.params.id);

    //02 Se valida q exista la reserva y si no es asi se envia error.
    if (!reserve) return res.status(400).send({ success: false, message:"La reserva no existe." });

    //03 Si es pago de MP, se cancela el pago en MercadoPago. //TBD.



    //04 Se borra la reserva de la db.
    await deleteReserveById(reserve.id);

    //05 Se devuelve un htttp 200, un true y un mensaje de exito.
    return res.status(200).json({ success: true, message: "La reserva ha sido ELIMINADA" });
  
  } catch (err) {
    console.log("Ha ocurrido un error al ELIMINAR la Reserva", err);
    return res.status(500).json({
      error: err.message,
    });
  }
}

module.exports = {
  httpAddNewReserve,
  httpGetAllReserves,
  httpGetReserve,
  httpPaymentReserveNotification,
  httpGetFeedbackReserve,
  httpGetReservePayment,
  httpCancelReserveOnMercadoPago,
  httpSetReserveToPaid,
  httpDeleteReserve,
};