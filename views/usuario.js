var db = require('../DB/db');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');

const selectUsuario = `SELECT id_user, login, email, nr_telefone, ds_endereco, ds_cidade, ds_cep, id_pais 
                             ,nr_telefone_ddd, ds_cpf_cnpj, ds_nome , ds_rua, ds_numero
                             ,ds_complemento, ds_bairro, dt_nascimento, ds_uf, password`
login = (req, res) => {
    db.select(selectUsuario
        + `    ,'' as token
               FROM USERS 
               where (UPPER(login) = $1 or UPPER(email) = $1)
               and   password = $2`, [req.body.login.toUpperCase(), CryptoJS.MD5(req.body.pass).toString()]).then((r) => {
            if (r && r.length > 0) {
                const user = {
                    exp: Math.floor(Date.now() / 1000) + (60 * 60),
                    id: r[0].id_user,
                    login: r[0].login,
                    password: r[0].password,
                }

                jwt.sign({ user }, 'mysecretkey', (err, token) => {
                    r[0].token = token;
                    console.log(token);
                    db.script('update USERS set token_site = $1 where id_user = $2', [token, r[0].id_user]);
                    res.status(200).json(r[0]);
                });
            } else {
                res.status(200).json({});
            }
        });
}

// generateToken = (n) => {
//     var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//     var token = '';
//     for(var i = 0; i < n; i++) {
//         token += chars[Math.floor(Math.random() * chars.length)];
//     }
//     return token;
// }

cadastro = (req, res) => {
    console.log(CryptoJS.MD5(req.body.senha).toString());
    // db.script(`INSERT INTO users (id_user, login, password, email) VALUES ((nextval('seq_usuario')), ?, ?, ?)`, [req.body.usuario, CryptoJS.MD5(req.body.senha), req.body.email]).then(r => {
    db.script('select * from proc_add_usuario($1,$2,$3)', [req.body.usuario, CryptoJS.MD5(req.body.senha).toString(), req.body.email]).then(r => {
        // return res.status(200).json({ success: true, data: 'cadastro' });
        res.status(200).json(r);
    });
}

validaNovoUsuario = (req, res) => {
    console.log(req.body);
    db.select(`select (select u.login
                       from users u
                       where lower(u.login) = lower($1) ) as usuario
                     ,(select u.email
                       from users u
                       where lower(u.email) = lower($2)) as email`, [req.body.usuario, req.body.email]).then((r) => {
        res.status(200).json(r[0]);
    });
}

getPerfil = (req, res) => {
    console.log(req.param.id);
    console.log(req.body);
    db.select(`SELECT * FROM USERS where UPPER(login) = 'HARRY' `, []).then((r) => {
        res.status(200).json(r[0]);
    });
}

putPerfil = (req, res) => {
    // console.log(req.param.id);
    db.script(`update USERS set ds_nome = $2
                               ,nr_telefone = $1 
                               ,nr_telefone_ddd = $3
                               ,ds_cpf_cnpj = $4
                               ,ds_cep = $5
                               ,ds_rua = $6
                               ,ds_numero = $7
                               ,ds_complemento = $8
                               ,ds_bairro = $9
                               ,ds_cidade = $10
                               ,ds_uf = $11
                               ,email = $12
                               ,dt_nascimento = $13
               where id_user = $14 `
        , [
            req.body.ds_nome,
            req.body.nr_telefone,
            req.body.nr_telefone_ddd,
            req.body.ds_cpf_cnpj,
            req.body.ds_cep,
            req.body.ds_rua,
            req.body.ds_numero,
            req.body.ds_complemento,
            req.body.ds_bairro,
            req.body.ds_cidade,
            req.body.ds_uf,
            req.body.email,
            req.body.dt_nascimento,
            req.body.id_user]).then(r => {
                res.status(200).json(r);
            });


}

module.exports = {
    login,
    cadastro,
    validaNovoUsuario,
    getPerfil,
    putPerfil
};


