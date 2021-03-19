const db = require('../db/db_connection');

const saveData = (req, res) => {
    db.none('INSERT INTO data(customer_id, type, made_at, data) VALUES(${customer_id}, ${type}, (SELECT NOW()::DATE), ${data})', req.body)
    .then(() => res.json({message: "The Data Has Been Saved", status: 200}))
    .catch(err => res.json({message: "ERR On Data Save", err, status: 402}))
}

module.exports = {
    saveData
}