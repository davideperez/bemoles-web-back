const { MP_PAYMENT_STATUS } = require("../lib/types/enums/paymentStatus");

const adapterMPPaymentStatus = (status) =>
  Object.entries(MP_PAYMENT_STATUS).find((e) => e[1] === status)[0];

module.exports = { adapterMPPaymentStatus };