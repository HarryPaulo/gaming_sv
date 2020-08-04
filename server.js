const port = 3003;
var http = require('http');
var path = require('path')
var express = require('express');
// var router = express.Router();
var cors = require('cors')
var cons = require('consolidate');
// var ejs = require('ejs');
var db = require('./DB/db');
var bodyParser = require('body-parser');
var dust = require('dustjs-helpers');
var game = require('./views/game.js');
var usuario = require('./views/usuario.js');
var estacao = require('./views/estacao.js');
var planos = require('./views/planos.js');
var pagarme = require('./views/pagarme');
var financeiro = require('./views/financeiro');
var jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');
var app = express();

const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

app.use(cors());
app.use(jsonParser);
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: false }));
// server.get('/login', (req,res) => {console.log('get')});

// ##################  usuario  ##################
app.use('/login', jsonParser, (req, res) => { usuario.login(req, res) });
app.use('/usuarioCad', (req, res) => { usuario.cadastro(req, res) });
app.use('/validaNovoUsuario', (req, res) => { usuario.validaNovoUsuario(req, res) });

// ##################  perfil  ##################

app.get('/perfil/:id', verificaToken, jsonParser, (req, res) => { usuario.getPerfil(req, res) });
app.get('/perfil', verificaToken, jsonParser, (req, res) => { usuario.getPerfil(req, res); console.log('getPerfil') });
app.put('/perfil', verificaToken, jsonParser, (req, res) => { usuario.putPerfil(req, res) });

// ##################  planos  ##################
app.get('/getPlanos', jsonParser, (req, res) => { planos.getPlanos(req, res); console.log('planos'); });

// ##################  Pagarme  ##################
app.use('/criaAssinatura', verificaToken, jsonParser, (req, res) => { pagarme.criaAssinatura(req, res); console.log('criaAssinatura'); });
app.post('/cancelarAssinatura', verificaToken, jsonParser, (req, res) => { pagarme.cancelarAssinatura(req, res); console.log('cancelarAssinatura'); });
app.use('/postbackAssinaturaPagarme', jsonParser, (req, res) => { pagarme.postbackAssinaturaPagarme(req, res); console.log('postbackAssinaturaPagarme') });

// ##################  Financeiro  ##################
app.get('/getAssinatura/:id_user/:token_site', verificaToken, jsonParser, (req, res) => { financeiro.getAssinatura(req, res); console.log('getAssinatura'); });

// ##################  estacao  ##################
app.use('/startGameServ', jsonParser, (req, res) => { estacao.startGameServ(req, res) });
app.use('/validaEstacao', jsonParser, (req, res) => { estacao.validaEstacao(req, res) });
app.use('/getEstacao', jsonParser, (req, res) => { estacao.getEstacao(req, res) });
app.use('/setProcessToGamePlay', jsonParser, (req, res) => { estacao.setProcessToGamePlay(req, res) });

// ##################  game  ##################
app.use('/games', jsonParser, (req, res) => { game.getGames(req, res) });

app.get('/', (req, res) => { console.log('teste'); res.send('<h1> home </h1>') });

app.post('/', (req, res) => { console.log('teste'); res.send('<h1> home </h1>') });

function verificaToken (req, res, next) {
	const bearerHeader = req.headers['authorization'];

	if (typeof bearerHeader !== 'undefined') {
		const bearer = bearerHeader.split(' ');
		const bearerToken = bearer[1];

		req.token = bearerToken; 
		console.log(req.token);
		jwt.verify(req.token, 'mysecretkey', (err, authData) => {
			console.log('verify err: '+err);
			if (err) {
				res.sendStatus(403);				
			} else {
				console.log(authData);
				next();
			}
		});
	} else {
		res.sendStatus(403);
	}
}
// http.listen(port, () => {
// http.createServer(server).listen(port, () => {
server.listen(port, () => {
	console.log('Server online on port ' + port)
});

// Add headers 
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader('Access-Control-Allow-Credentials', true);
	// Pass to next layer of middleware
	next();
});

app.use(function (req, res, next) {
	var err = new Error('Error 404: Page not found!');
	err.status = 404;
	next(err);
});

if (app.get('env') === 'development') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', { message: err.message, error: err });
	})
}

// server.engine('ejs', ejs.renderFile);
// server.set('view engine', 'ejs');

app.engine('dust', cons.dust);

app.set('view engine', 'dust');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


var onlineUsers = {}; // user list
var onlineCount = 0;

io.on('connection', function (socket) {
	console.log('a server become online');
	console.log(onlineUsers);

	socket.on('login', function (obj) {
		console.log('socket startou "login" usuario [' + obj.userid + '] - ' + obj.username);
		socket.name = obj.userid;

		//find a user in the list, if dont find add.
		if (!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username;
			//add user
			onlineCount++;
		}

		//send a broadcast to all user, to say the user was logged in
		io.emit('login', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj });
		console.log(obj.username + ' Entrou na sala de chat');
	});

	//disconnect
	socket.on('disconnect', function () {
		console.log('socket "disconnect" - ' + socket.name);
		//remove user logged from the list
		if (onlineUsers.hasOwnProperty(socket.name)) {
			var obj = { userid: socket.name, username: onlineUsers[socket.name] };

			//remove
			delete onlineUsers[socket.name];
			//decrement
			onlineCount--;

			//send a broadcast to all user, to say the user was logged out
			io.emit('logout', { onlineUsers: onlineUsers, onlineCount: onlineCount, user: obj });
			console.log(obj.username + 'Saiu da sala de chat');
		}
	});

	// send a broadcast message
	socket.on('broadcast', function (obj) {
		io.emit('broadcast', obj);
		console.log(obj.username + ' said: ' + obj.content + ' to evebody');
	});

	// send a private message
	socket.on('private', function (obj) {
		io.emit(`cli_${obj.to}`, obj);
		console.log('private msg - ' + obj.username + ' said: ' + obj.content + ' to ID[' + obj.to + '] - ' + onlineUsers[obj.to]);
	});

});


module.exports = { server };