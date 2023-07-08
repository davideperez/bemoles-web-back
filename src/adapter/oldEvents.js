const convertOldEventDateToDate = (oldEventDate) => {
  var dateParts = oldEventDate.split(" ");
  var date = dateParts[0].split("-");
  var time = dateParts[1].split(":");

  // Crea el objeto Date
  var dateTime = new Date(
    parseInt(date[0]), // Año
    parseInt(date[1]) - 1, // Mes (los meses en JavaScript son indexados desde 0)
    parseInt(date[2]), // Día
    parseInt(time[0]), // Hora
    parseInt(time[1]) // Minutos
  );
  return dateTime;
};

const adapterOldEventToEvent = (oldEvent) => {
  if (oldEvent.active) { // ?? Emi aca te estas trayendo solo los eventos activos?? Si es asi, no deberiamos traernos todos? Y dejar en gris los inactivos y en blanco los activos? 
    return {
      title: oldEvent.nombre,
      date: convertOldEventDateToDate(`${oldEvent.fecha} ${oldEvent.hora}`),
      info: oldEvent.info,
      price: oldEvent.precio,
      maxAttendance: oldEvent.cupo,
      paymentLink: oldEvent.linkdepago,
      isTaller: oldEvent.taller,
    };
  }
};

const adapterOldEventToEventV2 = (oldEvent) => {
  if (oldEvent.active) { // ?? Emi aca te estas trayendo solo los eventos activos?? Si es asi, no deberiamos traernos todos? Y dejar en gris los inactivos y en blanco los activos? 
    return {
      title: oldEvent.nombre,
      date: convertOldEventDateToDate(`${oldEvent.fecha} ${oldEvent.hora}`),
      info: oldEvent.info,
      price: oldEvent.precio,
      maxAttendance: oldEvent.cupo,
      paymentLink: oldEvent.linkdepago,
      active: () => {
        if (oldEvent.activo == 1) {
          return true
        } else {
          return false
        }
      }
    }
  }
}

module.exports = adapterOldEventToEvent;