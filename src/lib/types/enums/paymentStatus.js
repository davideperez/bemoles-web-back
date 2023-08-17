const PAYMENT_STATUS = Object.freeze({
    NOT_PAID: 'NOT_PAID', 
    FAILURE: 'FAILURE', 
    PENDING: 'PENDING', 
    SUCCESS: 'SUCCESS'
});

const MP_PAYMENT_STATUS = Object.freeze({
    FAILURE: 'rejected', 
    PENDING: 'in_process', 
    SUCCESS: 'approved'
});

module.exports = { MP_PAYMENT_STATUS, PAYMENT_STATUS };