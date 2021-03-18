const db = require('../db/db_connection');

const getSystems = (req, res) => {
    db.any('SELECT * FROM systems')
    .then(data => res.json({message: "retrieve systems success", pulledData: data, status: 200}))
    .catch(err => res.json({message: "didnt retrive stysems ERR", err, status: 402}))
}

module.exports = {
    getSystems
}