var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started.");

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var dotX;
var dotY;
dotX=(Math.floor(Math.random()*25))*20 ;
dotY=(Math.floor(Math.random()*25))*20 ;
//console.log(dotX +" "+dotY);
var Tail=function(x,y){
      this.x=x;
      this.y=y;
    
    //console.log("kislay");
    };
var Player =function(id){
	var self={
		x:240,
		y:240,
		dx:20,
		dy:20,
		id:id,
		number:"" + Math.floor(10*Math.random()),
		rightPressed:false,
		leftPressed:false,
		upPressed:false,
		downPressed:false,
		tailList:[]
     }
     self.updatePosition=function(){
           if(self.rightPressed)
           	self.x += self.dx ;
           if(self.leftPressed)
           	self.x -= self.dx ;
           if(self.upPressed)
           	self.y -= self.dy ;
           if(self.downPressed)
           	self.y += self.dy ;

     }
     return self ;
}
var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	
	SOCKET_LIST[socket.id] = socket;

	var player=Player(socket.id);
	PLAYER_LIST[socket.id]=player ;

	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
	});
	socket.on('sendMsgToServer',function(data){
        var playerName = ("" + socket.id).slice(2,7);
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
        }
    });
	socket.on('keyPress',function(data){
		     
            if(data.inputId ==='left' && player.rightPressed==false )
            	{   
            		player.leftPressed=data.state;
            		player.rightPressed=false;
		            player.upPressed=false;
		            player.downPressed=false;
            	}
            else if(data.inputId ==='right' && player.leftPressed==false)
            	{player.rightPressed=data.state;
            		player.leftPressed=false;
            		player.upPressed=false;
		            player.downPressed=false;
            	}
            else if(data.inputId ==='up' && player.downPressed==false)
            	{player.upPressed=data.state;
            		player.leftPressed=false;
		            player.rightPressed=false;
		            player.downPressed=false;
            	}

            else if(data.inputId ==='down' && player.upPressed==false )
            	{player.downPressed=data.state;
            		player.leftPressed=false;
		            player.rightPressed=false;
		            player.upPressed=false;
            	}


	});
	
});
function collisionDetection() {
  for(var i in PLAYER_LIST){

  	var player = PLAYER_LIST[i] ;
  	if(player.x==dotX && player.y==dotY)
    {  
       player.tailList.push(new Tail(dotX,dotY));
      // for(var j=0;j<player.tailList.length;j++)
      //  console.log(i + " "+player.tailList[j].x+" "+player.tailList[j].y);
        dotX=(Math.floor(Math.random()*25))*20 ;
        dotY=(Math.floor(Math.random()*25))*20  ;
       // console.log(dotX+" "+dotY);
       
       //console.log(tailList[0].x);
        return true ;
        
    }
    for(var l in PLAYER_LIST)
	    {
	    	var playe2 =PLAYER_LIST[l];
	    	if(player != playe2)
	    	{
	    		 for(var k=0;k<playe2.tailList.length;k++)
  		           {
            if(player.x==playe2.tailList[k].x && player.y==playe2.tailList[k].y )
            	playe2.tailList.splice(k,((playe2.tailList.length)-k));
  		           }
	    	}
	    }
  	for(var k=0;k<player.tailList.length;k++)
  		{
            if(player.x==player.tailList[k].x && player.y==player.tailList[k].y )
            	player.tailList.splice(0,((player.tailList.length)));
  		}
    
  }
}

setInterval(function(){

	var pack=[];
	collisionDetection();
	for(var i in PLAYER_LIST){

		var player = PLAYER_LIST[i];
		if(player.tailList.length==6)
			alert("game over");
		//var tails=[];
		//if(player.tailList.length>=0)
		//console.log(i + " "+player.tailList[0].x+" "+player.tailList[0].y);
		if(player.x<0)
			player.x=500;
		if(player.x>500)
			player.x=-20;
		if(player.y<0)
			player.y=500;
		if(player.y>500)
			player.y=-20;
        
		for(var k=(player.tailList.length)-1;k>=0;k--)
    {   
        //console.log(k);
        if(k==0)
        {
            player.tailList[k].x=player.x;
            player.tailList[k].y=player.y;
        }
        else
        {
            player.tailList[k].x=player.tailList[k-1].x;
            player.tailList[k].y=player.tailList[k-1].y;
            
        }
        
    }
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number,
            dotX:dotX,
            dotY:dotY,
            tailList:player.tailList
        });    
	}
	for(var i in SOCKET_LIST){
		var socket=SOCKET_LIST[i];
		socket.emit('headMessage',pack);
        //socket.emit('dotMessage',{dotX,dotY});
	}


},140);