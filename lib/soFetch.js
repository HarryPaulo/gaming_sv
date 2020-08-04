const fetch = require('node-fetch');
const Bluebird = require('bluebird');
fetch.Promise = Bluebird;  

get = (url) => {
//  const url = 'https://api.coinmarketcap.com/v2/ticker/1/'; url de teste

  const requestInfo = {
    method: 'GET',
    //body: JSON.stringify(req.body),
    headers: {
        "Content-type": "application/json",
        // "Authorization": "Bearer"
    }
  };

  return fetch(url, requestInfo).then(res => {
    if (res.ok) {
      return res.json();
    }

    if (res.status === 401) {
      // erro de autenticaçao
    } else {
      throw new Error('Não foi possível completar a operação');
    }
  }).catch(e => {
    console.error(e.stack);
    reject(e.stack);
    client.end();
  })
  // .then(json => {
  //     console.log(json);
  //     res2.status(200).json(json);
  // });
}

post = (url, dados) => {
  
  const requestInfo = {
    method: 'POST',
    body: JSON.stringify(dados),
    headers: {  
        "Content-type": "application/json",
        // "Authorization": "Bearer"
    }
  };

  return fetch(url, requestInfo).then(res => {
    if (res.ok) {
      return res.json();
    }

    if (res.status === 401) {
      // erro de autenticaçao
    } else {
      throw new Error('Não foi possível completar a operação');
    }
  }).catch(e => {
    console.error(e.stack);
    reject(e.stack);
    client.end();
  })
}

// postFile = (path, fileName, file) => {
//   const url = soFetch.getUrlRest() + path;

//   const requestInfo = {
//     method: 'POST',
//     body: file,
//     headers: new Headers({
//       "Authorization": 'Bearer',
//       "Content-Disposition": 'attachment;filename=' + fileName
//     })
//   };

//   return fetch(url, requestInfo)
//     .then(res => {
//       if (res.ok) {
//         return res.json();
//       }

//       if (res.status === 401) {
//         // erro de autenticaçao
//       } else {
//         throw new Error('Não foi possível completar a operação');
//       }
//     }).catch(e => {
//       console.error(e.stack);
//       reject(e.stack);
//       client.end();
//     })
// }

module.exports = {
  get, 
  post, 
  // postFile
};