var express = require('express');
var cors = require('cors');
var bodyParse = require('body-parser');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

var storyPart = [];
var mongoose = require('mongoose');
var Word = require('./Model/word');

const dbMongo = 'mongodb://localhost:27017/dbStory';
const port = 8085;

var currentWord = '';
app.use(express.static('./public'));
app.use(bodyParse.urlencoded({extends:false}));
app.use(bodyParse.json());
app.use(cors());

mongoose.connect(dbMongo,function(err,res){
	if (err) {
		console.log(`Error al conectar a la bd ${err}`);
	}
	else{
		console.log('conexion exitosa');
	}
});

server.listen(port, function(){
	console.log('Corriendo por el puerto' + port);
});

app.post('/api/setWord',function(req,res){
	let word = new Word();
	word.word = req.param('inputWord');
	word.save(function(err,storeWord){
		if (err) {
			res.status(500);
			res.send({message: `Error al guardar palabra`}); 
		}else{
			res.status(200);
			res.redirect('/');
			res.end();
		}
	});
});

function randomWord(callback){
	Word.find({},function(err,words){
		if (err){
			console.log(`Error al conectar a la bd ${err}`);
		}
		else{
			var number= Math.floor(Math.random()*words.lenght);
			currentWord = words[number].word;
			callback(0,currentWord);
		}
	});
}

io.on('connection',function(socket){
	console.log('Alguien se ha conectado con sockets');
	socket.emit('story',storyPart);
	socket.emit('new-word',currentWord);
	socket.on('sent-story',function(){
		storyPart.push(data);
		io.sockets.emit('story');
		randomWord(function(err,data){
			io.emit('new-word',data);
		});
	});
});