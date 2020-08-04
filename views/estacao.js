const soFetch = require('../lib/soFetch.js');
const db = require('../DB/db.js');

startGameServ = (req, res) => {
    db.script('select * from proc_game_play_ini($1, $2)', [req.body.id_game, req.body.id_user]).then(estacao => {
        if (estacao && estacao.length > 0) {
            // let url = 'http://' + estacao[0].ds_ip + ':' + estacao[0].ds_porta + '/startGameServ';
            let url = 'http://' + estacao[0].ds_ip_local + ':' + estacao[0].ds_porta + '/startGameServ';            
            
            console.log('post: '+ url);
            soFetch.post(url, estacao[0]).then(r => {
                res.status(200).json(r);
            })
            // tratar excessao aqui.
        } else {
            // trata a excessao de que nao achou servidor para o jogo escolhido. 
            // res.status(200).json(r);
        }
        //res.status(200).json(estacao);
    }).then('unhandledRejection', (reason, promise) => {
        console.log('VERIFICAR AQUI - Unhandled Rejection at:', reason.stack || reason)
    })

}

getEstacao = (req, res) => {
    db.select('SELECT * FROM SERVIDOR where id_servidor_hash = $1 ', [req.body.id_servidor_hash]).then(r => {
        res.status(200).json(r);
    });
}

validaEstacao = (req, res) => {
    db.script('select * from PROC_ADD_SERVIDOR($1, $2, $3, $4)', [req.body.id_servidor_hash, req.body.ds_ip, req.body.ds_ipv6, req.body.ds_ip_local]).then(r => {
        res.status(200).json(r);
    });
    // validar excessao.
}

setProcessToGamePlay = (req, res) => {

    console.log('setProcessToGamePlay');
    console.log(req.body);
    db.script('update servidor_game_play set ds_pid_process = $1 , ds_ppid_process = $2, ds_process_name = $3 where id_servidor_game_play = $4'
            ,[req.body.ds_pid_process, req.body.ds_ppid_process, req.body.ds_process_name, req.body.id_servidor_game_play]).then(r => {
        res.status(200).json(r);
    });
}

module.exports = {
    startGameServ,
    validaEstacao,
    getEstacao,
    setProcessToGamePlay,
};