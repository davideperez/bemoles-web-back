const reservesDataBase = require('./reserves.mongo')

//CREATE
async function createReserveByIdInMongoDB (reserve) {
    try {
        const newReserve = new reservesDataBase(reserve);
        return await newReserve.save();
    } catch (err) {
        console.error(`No se pudo crear la reserva en la base de datos: ${err}`)
    }
}

async function sendReservationEmail (email, firstName, lastName) {
    try {
       
    } catch (err) {
        console.error(`No se pudo crear la reserva en la base de datos: ${err}`)
    }
} 

//READ
async function getAllReserves (page, items, search) {
    try {
        const query = {};
        if (search) query.title = { $regex: `${search}`, $options: 'i' }; // leer sobre esta linea !!
        
        const reserves = await reservesDataBase.find(query, {'__v': 0}) // leer sobre esta linea.
        .skip((page - 1) * items) // leer sobre esta linea.
        .limit(items) // leer sobre esta linea.
        .sort({createdAt: 'desc'}); // leer sobre esta linea.
        
        const count = await reservesDataBase.find(query).countDocuments();
        
        return ({values: reserves, count});
    } catch(err) {
        console.error(`No se pudieron traer los datos de todas las reservas desde mongoDB: ${err}`)
    }
}

//READ
async function getReserve (reserveId) {
    try {
       return await reservesDataBase.findById(reserveId);
    } catch(err) {
        console.error(`No se pudo traer la reserva desde mongoDB: ${err}`)
    }
}

//UPDATE
async function updateReserveByIdInMongoDB (reserveId, reserve) {
    try {
        await reservesDataBase.findByIdAndUpdate(reserveId, reserve, { new: true }) 
    } catch (err) {
        console.error(`No se pudo actualziar la reserva en la base de datos: ${err}`)
    }
} 

//DELETE
async function deleteReserveById (reserveId) { 
    await reservesDataBase.findByIdAndDelete(reserveId)
} 

//-----------------------------------------------------------------------------------------------------//
// Exports //
//-----------------------------------------------------------------------------------------------------//

module.exports = {
    createReserveByIdInMongoDB,
    getAllReserves,
    getReserve,
    updateReserveByIdInMongoDB,
    deleteReserveById,
}