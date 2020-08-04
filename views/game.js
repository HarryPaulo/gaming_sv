var db = require('../DB/db');

getGames = (req, res) => {
    db.select(`SELECT * FROM GAME`).then((r) => {
        res.status(200).json(r);
    });
}

module.exports = {
    getGames,
};