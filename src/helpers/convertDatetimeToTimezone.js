const formatDatetimeToTimezone = (date) => {
    const newDate = new Date(date);
    const localOffset = newDate.getTimezoneOffset() * 60000;
    const offsetFromArgentina = 3 * 60 * 60 * 1000;
    const adjustedDate = new Date(newDate.getTime() - localOffset + offsetFromArgentina);
    return adjustedDate;
  }

module.exports = { formatDatetimeToTimezone };