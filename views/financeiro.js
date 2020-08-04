var db = require('../DB/db');

getAssinatura = (req, res) => {
    console.log(req.params);
    // console.log(req.param('id_user'));
    // console.log(req.param('token_site'));

    db.select(`select id_assinatura
                    ,id_assinatura_ext
                    ,fl_status
                    ,id_plano
                    ,dt_ini 
                    ,dt_fim 
                    ,dt_cadastro 
                    ,case lower(a.fl_status) 
                        when 'paid' then 'Ativo'
                        when 'pending_payment' then 'Pagamento pendente'
                        when 'unpaid' then 'bloqueado'            
                    end as fl_status_ext
                from assinatura a
                     join users u on (u.id_user = a.id_user)
                where lower(a.fl_status) <> 'canceled'
                and   a.id_user = $1 
                and   u.token_site = $2 `, [req.params.id_user, req.params.token_site]).then((r) => {
        res.status(200).json(r[0]); // atualmente cada usuario só pode possuir 1 plano.
    });
}



module.exports = {
    getAssinatura,
};

