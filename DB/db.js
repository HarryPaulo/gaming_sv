var bodyParser = require('body-parser'); //json
var cons = require('consolidate');
var pg = require('pg');
var dust = require('dustjs-helpers');
const strConn = 'postgres://postgres:123@localhost:5432/maindb'
connect = () => {
    // client.connect().then(() => {
    //     console.log('abriu conexao com DB!');
    // })
}

const select = (sql, param) => {
    return new Promise((resolve, reject) => {
        const SQLQuery = {
            name: 'fetch-user',
            text: sql,
            values: param
        }
        const client = new pg.Client(strConn);
        return client.connect().then(() => {
            return client.query(SQLQuery).then(result => {
                console.log(result.rows);
                resolve(result.rows)
                client.end();    
            }).catch(e => {
                console.error(e.stack);
                reject(e.stack);
                client.end();    
            })
        })
    }).catch(e => {
        console.error(e.stack);
        reject(e.stack);
        client.end();    
    })
}

const script = (sql, param) => {
    return new Promise((resolve, reject) => {
        const SQLQuery = {
            name: 'fetch-user',
            text: sql,
            values: param
        }
        const client = new pg.Client(strConn);
        return client.connect().then(() => {
            return client.query(SQLQuery).then(result => {
                console.log(result.rows);
                resolve(result.rows)
                client.end();    
            }).catch(e => {
                console.error(e.stack);
                reject(e.stack);
                client.end();    
            })
        })
    }).catch(e => {
        console.error(e.stack);
        reject(e.stack);
        client.end();    
    })
}

module.exports = {
    connect,
    select,
    script,
} 