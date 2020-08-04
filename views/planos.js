var db = require('../DB/db');

getPlanos = (req, res) => {
    console.log('getPlanos');
    db.select(` select *
                      ,(select array_to_json(array_agg(row_to_json(pp2))) from (select * from planos_pacote pp where pp.id_planos = p.id_plano order by pp.id_planos_pacote) pp2) as pacotes
                from planos p
                where p.fl_ativo = 'S'
                order by p.vl_plano `, []).then((r) => {
        res.status(200).json(r);
    });
}

module.exports = {
    getPlanos,
};