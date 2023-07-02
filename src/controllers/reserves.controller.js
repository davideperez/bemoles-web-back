const {
    createReserveByIdInMongoDB,
    getAllReserves,
    getReserve,
    updateReserveByIdInMongoDB,
    deleteReserveById,
  } = require("../models/reserves/reserves.model");


async function httpAddNewReserve(req, res) {
    try {
        return res.status(201).json(reserveCreated)
    } catch (error) {
        return res.status(500).json({
            error: err.message,
        })
    }
}


async function httpGetAllReserves(req, res) {
    try {
        const { search, page, items } = req.query;
        return res.status(200).json(await getAllReserves(+page, +items, search));
    } catch (error) {
        return res.status(500).json({
            error: err.message,
        })
    }
}

async function httpGetReserve(req, res) {
    try {
        return res.status(200).json(await getReserve(req.params.id));
    } catch (error) {
        return res.status(500).json({
            error: err.message,
        })
    }
}

async function httpUpdateReserve (req, res) {
    try {

        return res.status(201).json(reserveUpdated);
    } catch (error) {
        return res.status(500).json({
            error: err.message,
        })
    }
}

async function httpDeleteReserve (req, res) {
    try {

        return res.status(200).json({ success: true, message: "the reserve is deleted!" });
    } catch (error) {
        return res.status(500).json({
            error: err.message,
        })
    }
}


module.exports = {
    httpAddNewReserve,
    httpGetAllReserves,
    httpGetReserve,
    httpDeleteReserve,
    httpUpdateReserve
};