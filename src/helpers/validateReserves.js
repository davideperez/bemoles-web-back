const isExpiratedReserve  = (createReserveDate) => {
  const currentTime = new Date();
  const createdReserveDate = new Date(createReserveDate);
  const initialFeatureDate = new Date(process.env.INITIAL_DATE_PAYMENT_GATEWAY_FEATURE)
  if (initialFeatureDate > createdReserveDate) return false;

  const timeDifference = currentTime - createdReserveDate;

  // Convierte 48 horas a milisegundos (48 * 60 * 60 * 1000)
  const fortyEightHoursInMilliseconds = 48 * 60 * 60 * 1000;

  // Comprueba si la diferencia de tiempo es mayor a 48 horas
  return timeDifference >= fortyEightHoursInMilliseconds;
};

const getExpirationDate = (date) => {
  const expirationDate = new Date(date);
  const expirationHours = Number(process.env.EXPIRATION_HOURS || 48);
  expirationDate.setHours(expirationDate.getHours() + expirationHours);

  return expirationDate;
};

const getFormatedDate = (date) => {
    // Obtener la fecha y hora actual
  const dateToFormat = new Date(date);

  // Función para formatear un número con ceros a la izquierda
  const formatWithLeadingZeros = (num, length) => {
    return num.toString().padStart(length, '0');
  };

  // Obtener los componentes de la fecha
  const año = dateToFormat.getFullYear();
  const mes = formatWithLeadingZeros(dateToFormat.getMonth() + 1, 2);
  const dia = formatWithLeadingZeros(dateToFormat.getDate(), 2);
  const hora = formatWithLeadingZeros(dateToFormat.getHours(), 2);
  const minutos = formatWithLeadingZeros(dateToFormat.getMinutes(), 2);
  const segundos = formatWithLeadingZeros(dateToFormat.getSeconds(), 2);
  const milisegundos = formatWithLeadingZeros(dateToFormat.getMilliseconds(), 3);

  // Obtener la zona horaria en formato +/-HH:mm
  const offset = dateToFormat.getTimezoneOffset();
  const offsetSigno = offset >= 0 ? '-' : '+';
  const offsetHoras = formatWithLeadingZeros(Math.abs(Math.floor(offset / 60)), 2);
  const offsetMinutos = formatWithLeadingZeros(Math.abs(offset) % 60, 2);
  const zonaHoraria = `${offsetSigno}${offsetHoras}:${offsetMinutos}`;

  // Formatear la fecha en el formato deseado
  const nuevoFormato = `${año}-${mes}-${dia}T${hora}:${minutos}:${segundos}.${milisegundos}${zonaHoraria}`;

  console.log(nuevoFormato);
    return nuevoFormato;
};

module.exports = { getExpirationDate, getFormatedDate, isExpiratedReserve };
