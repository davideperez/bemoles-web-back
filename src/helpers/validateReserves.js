const validateReserveExpiration = (createReserveDate) => {
    const currentTime = new Date();
    const createdReserveDate = new Date(createReserveDate);
    const timeDifference = currentTime - createdReserveDate;

    // Convierte 48 horas a milisegundos (48 * 60 * 60 * 1000)
    const fortyEightHoursInMilliseconds = 48 * 60 * 60 * 1000;

    // Comprueba si la diferencia de tiempo es mayor a 48 horas
    return timeDifference >= fortyEightHoursInMilliseconds;
}

const getExpirationDate = (date, expirationHours = 48) => {
    const expirationDate = new Date(date);
    expirationDate.setHours(expirationDate.getHours() + expirationHours);

    return expirationDate;
}

module.exports = { getExpirationDate, validateReserveExpiration };