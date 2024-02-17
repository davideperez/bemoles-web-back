const mercadopago = require("mercadopago");
const { PAYMENT_STATUS } = require("../lib/types/enums/paymentStatus");
const {
  createReserveByIdInMongoDB,
  getAllReserves,
  getReserve,
  updateReserveByIdInMongoDB,
  deleteReserveById,
  getReserveByQuery,
} = require("../models/reserves/reserves.model");

const {
  getEvent,
  updateEventByIdInMongoDB,
} = require("../models/events/events.model");

const {
  sendReserveConfirmationEmail,
} = require("../templates/reserve-confirmation");

const { sendStockAlertEmail } = require("../templates/stock-alert");
const {
  isExpiratedReserve,
  getExpirationDate,
  getFormatedDate,
} = require("../helpers/validateReserves");
const { adapterMPPaymentStatus } = require("../adapter/paymentStatus");
const {
  sendPaymentConfirmationEmail,
} = require("../templates/payment-confirmation");

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

/*  
- Recibe los datos de la solicitud de nueva reserva, 
- crea la "PREFERENCE en MP"(que seria la orden de compra con link de pago) 
- y actualiza la nueva reserva creada 
 */

async function httpAddNewReserve(req, res) {
  try {
    const reserve = req.body;

    //1 se chequea que la reserva que llego en la solicitud posea todos los campos requeridos.
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
    
    
    //2 Se carga el evento en cuestion usando el id de evento que venia en el el body de la solicitud de reserva.
    const event = await getEvent(reserve.event);
    console.log(event);
    
    //3 Se crea el link de pago (un mercadopagoREsponse a la preference)
    //3.1 Si valida que el evento no sea gratis:
    if (event.price) {
      // Se crea el objeto "preferencia", que son los datos necesarios para pedir a la API de MP un link de pago.
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
    
    // Se solicita a MP API un objeto mercadopagoResponse que contiene toda la info del "link de pago". 
    const response = await mercadopago.preferences.create(preference);

    console.log("//////////////////////////////// Este es la respuesta de MP API al pedido de creacino de link con el objeto preferencias: ",response,"//////////////////////////////////////////////////")
    
    // Se agrega el id del "objeto-preferencia" de MercadoPago a la reserva.
    reserve.MPPreferenceId = response.body.id;
    // Se agrega el id del "objeto-preferencia" de MercadoPago a la reserva.
    reserve.paymentLink = response.body.init_point;
    // Se setea el el estado del pago como "no pago" en la reserva.
    reserve.paymentStatus = PAYMENT_STATUS.NOT_PAID;
    //Se crea el array vacio que contendra los pagos que se realizen en la reserva.
    reserve.payments = [];

    // Si el precio del evento es 0, es decir es gratis, se anota paymentStatus como SUCCESS.
    } else {
      reserve.paymentStatus = PAYMENT_STATUS.SUCCESS;
    }
    console.log({ reserve });
       

    // 4 Se calcula el stock disponible
    const ticketsReserved = [...event.reserves, reserve].reduce(
      (reservesLength, reserve) => {
        const isValidatedReserve =
          !isExpiratedReserve(reserve.createdAt) ||
          [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.SUCCESS].includes(
            reserve.paymentStatus
          );
        const reservesLengthUpdated = reservesLength + (isValidatedReserve ? reserve.ticketQuantity : 0);
        return reservesLengthUpdated;
      },
      0
    );
    
    const ticketsAvailable = event.maxAttendance - ticketsReserved;
    
    console.log(
      `el cupo maximo del evento es: ${event.maxAttendance}, 
      las entradas reservadas: ${ticketsReserved}, 
      la disponibilidad luego de reservar: ${ticketsAvailable}.`
    );

    // 4.1 Si no hay stock se manda un mensaje de alerta:
    if (ticketsAvailable < 0)
      return res.status(409).json({ message: "El cupo esta completo" });
    
    // 4.2 Si el stock es menor a 10 :
    if (ticketsAvailable < 10)
      await sendStockAlertEmail(event, ticketsAvailable); // TO DO: Notificar a Gabriel cuando quedan menos de 10 entradas


    //////////  5 Se crea la reserva en la DB  //////////
    const reserveCreated = await createReserveByIdInMongoDB(reserve);
  
    ////////// 6 se agrega la reserva al evento //////////
    await updateEventByIdInMongoDB(reserve.event, {
      $push: { reserves: reserveCreated._id.toString() },
    });

    // 7 Se envia el mail de reserva.
    await sendReserveConfirmationEmail(reserve, event, { isFree: Boolean(!event.price)});


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

async function httpUpdateReserve(req, res) {
  try {
    return res.status(201).json(reserveUpdated);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

//UPDATE

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

async function httpSetReserveToPaid(req, res) {
  try {
    const reserveId = req.params.id
    const reserveToCancel = await getReserve(reserveId)
    
    // mandar update de reserva expirada en MercadoPago. 


    // marcar la reserva como paga en la db.
    
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
/* 
Objetos en juego:

reserve
  payment: mercadopago.payment
  merchantOrder: mercadopago.merchant_orders
  preference: merchantOrder.body

  */

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



async function httpGetFeedbackReserve(req, res) {
  try {
    if (req.query.payment_id === "null") throw new Error('No se ha encontrado el pago');
    const payment = await mercadopago.payment.findById(req.query.payment_id);
    // const merchantOrder = await mercadopago.merchant_orders.findById(payment.body.order.id);
    // const preferenceId = merchantOrder.body.preference_id;
    if (!payment?.body?.status) throw new Error("No se ha encontrado el pago");
    const status = payment.body.status;
    const paymentStatusKey = adapterMPPaymentStatus(status);
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

async function httpDeleteReserve(req, res) {
  try {
    // Se trae la reserva con el id que vino en la solicitud/request.
    const reserveFind = await getReserve(req.params.id);

    //Se valida q exista el evento y si no es asi se envia error.
    if (!reserveFind) return res.status(400).send({ success: false, message:"La reserva no existe." });

    // Se cancela el pago en MercadoPago. TBD.
    // TBD // // TBD // // TBD //

    // Se borra la reserva de la db.
    await deleteReserveById(req.params.id);

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
  httpUpdateReserve,
  httpPaymentReserveNotification,
  httpGetFeedbackReserve,
  httpGetReservePayment,
  httpCancelReserveOnMercadoPago,
  httpSetReserveToPaid,
  httpDeleteReserve,
};