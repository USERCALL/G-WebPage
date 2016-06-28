$(document).ready(main);	//LO PRIMERO QUE SE EJECUTA EL CANVAS, QUE LLAMA AL RUN ESTE DA LA ORDEN PARA QUE PINTE Y SE MANEJE LOS ESTADOS

var

canvas,
ctx,				
width,
height,

fgpos =0,
frames = 0,

corriente,
estados ={
Golpe: 0, Jugando:1, Muerto:2
},

bird = {

		x:80,
		y: 0,
		frame: 0,
		velocidad: 0,
		animacion: [0,1,2,1],
		radio: 12,
		caida: 0.25,
		_salto: 4.6,

	salto: function(){
		this.velocidad = -this._salto;
	},

	update: function(){
		var n = corriente === estados.Golpe ? 10 : 5;					//SE CONTROLA LA VELOCIDAD DE SALTO Y DE CAIDA
		this.frame += frames % n === 0 ? 1 : 0;
		this.frame %= this.animacion.length;

		if(corriente === estados.Golpe){
			this.y = height - 280;
		}else{
			this.velocidad += this.caida;
			this.y += this.velocidad;

				if(this.y >= height - s_fg.height-10 ){					//PARA SABER SI TOCA EL SUELO
					this.y = height - s_fg.height-10;
					if(corriente === estados.Jugando){
						corriente = estados.Muerto;
					}
					this.velocidad = this._salto;
				}

		}
	},

	draw: function(ctx){
		ctx.save();
		ctx.translate(this.x,this.y);
		


		var n = this.animacion[this.frame];
		s_bird[n].draw(ctx, -s_bird[n].width/2, -s_bird[n].height/2);

		ctx.beginPath();									
		ctx.arc(0,0,this.radio, 0, 2*Math.PI);				 
		//ctx.stroke();							//	PARTE DEL CODIGO DONDE PODEMOS VER EL RADIO			
		//ctx.fill();							//	QUE SE LE DIO AL PAJARO

		ctx.restore();
	}
},

tubos={

	_tubos: [],


	update: function(){
	if(frames % 100===0){
		var _y = height - (s_pipeSouth.height+s_fg.height+120+200*Math.random());		//SE CREAN LOS TUBOS DE LA PARTE INFERIOR Y SE UTILIZA RANDOM
		this._tubos.push({																//PARA CAMBIAR SU ALTURA
			x:500,			
			y: _y,
			width: s_pipeSouth.width,
			height: s_pipeSouth.height
		});
	}
	for ( var i=0, len = this._tubos.length; i < len; i++){
		var p = this._tubos[i];

		if(i===0){																	//CONTROL DE COLISION, SE USAN LOS INDICES DEL FOR PARA DAR CON LA POSICION
			var cx = Math.min(Math.max(bird.x, p.x), p.x+ p.width);					//DE LOS TUBOS , SE CONTROLA LA POSICION DEL PAJARO Y CON EL RADIO DADO
			var cy1 = Math.min(Math.max(bird.y, p.y), p.y+ p.height);				//VERIFICA QUE NO SE ALTERE, SI SE ALTERA SIGNIFICA QUE TOCO ALGO
			var cy2 = Math.min(Math.max(bird.y, p.y+p.height+80), p.y+2*p.height+80); // PASA AL ESTADO MUERTO Y SE DETIENE EL JUEGO 

			var dx = bird.x -cx;									
			var dy1 = bird.y -cy1;
			var dy2 = bird.y - cy2;

			var d1 = dx*dx + dy1*dy1;
			var d2 = dx*dx + dy2*dy2;

			var r = bird.radio*bird.radio;

			if( r > d1 || r>d2){
				corriente = estados.Muerto;
			}
		}


		p.x -= 2 ;
		if(p.x < -50){
			this._tubos.splice(i, 1);
			i--;
			len--;
			}

		}
	},

	draw: function(ctx){
		for(var i =0, len= this._tubos.length; i<len; i++){				//UNA VEZ SE CREA EL TUVO INFERIOR , SE PINTA EL TUVO SUPERIOR EN LA MISMA POSICION
			var p = this._tubos[i];										//PERO CON UN ESPACIO DE 80 PX
			s_pipeSouth.draw(ctx, p.x, p.y);
			s_pipeNorth.draw(ctx, p.x, p.y+80+p.height);
		}
	}
};

function presiona(evt) {										//SE CONTROLAN LOS EVENTOS QUE AFECTAN AL CAMBAS, EL TOCUHSTART Y EL MOUSE DOWN
	switch (corriente) {										//AL PRIMER CLICK CAMBIA AL ESTA DE JUGANDO Y MIENTRAS ESTA ACTIVO EL ESTADO DE JUGANDO
																//PUEDE USAR EL MOUSEDOWN PARA MANTENER EL SALTO
		case estados.Golpe:
			corriente = estados.Jugando;
			bird.salto();
			break;

		case estados.Jugando:
			bird.salto();
			break;

		case estados.Muerto:
			break;
	}
	 
}

function main(){
	canvas = document.createElement("canvas");				//SE CREA EL CANVAS CON SUS DIMENSIONES Y UN BORDE DE 1 PX
															//SE AÑADEN LOS EVENTOS Y SON ASIGNADOS A EVT
	width= window.innerWidth;
	height = window.innerHeight;

	var evt = "touchstart";

	if (width >= 500) {
		width=320;
		height=480;
		canvas.style.border= "1px solid #000";
		evt = "mousedown";

	}

	document.addEventListener(evt, presiona);

	canvas.width=width;
	canvas.height=height;
	ctx=canvas.getContext("2d");

	corriente = estados.Golpe

	document.body.appendChild(canvas);

	var img = new Image();									//SE DA LA RUTA QUE EL CANVAS TRABAJA CON LA IMAGEN TODO
	img.onload = function(){								//Y TOMA EL COLOR DE S_BG
		initSprites(this);								
		ctx.fillStyle = s_bg.color;			
		run();
	}
	img.src = "Img/todo.png"



}

function run(){
	var loop = function(){									//MIENTRAS CORRE RE PINTA EL CANVAS
		update();
		dibujar();
		window.requestAnimationFrame(loop,canvas);
	}
	window.requestAnimationFrame(loop,canvas);
}


function update(){											//EL UPDATE EN ESTE CASO SE ENCARDA DE ESTAR PENDIENTE DE LOS ESTADOS
	frames++;												//MIENTRAS ESTE JUGANDO ORDENA PINTAR LOS TUBOS

	if(corriente !== estados.Muerto){		
	fgpos = (fgpos - 2)%14;
	}

	if (corriente === estados.Jugando) {
		tubos.update();
	}

	bird.update();
	
}


function dibujar(){										//COMO EL NOMBRE INDICA SE ENCARGA DE PINTAR 
	ctx.fillRect(0,0, width, height)					//SE TOMA EL ALTO Y ANCHO DEL CANVAS PARA ASEGURAR QUE PINTE DENTRO DEL MISMO
	s_bg.draw(ctx,0, height - s_bg.height);				//CADA ACTUALIZACION CORRE UN POCO LA IMAGEN DANDO LA ILUSION DE MOVIMIENTO
	s_bg.draw(ctx, s_bg.width, height - s_bg.height);

	
	tubos.draw(ctx);
	bird.draw(ctx);

	s_fg.draw(ctx,fgpos,height - s_fg.height)
	s_fg.draw(ctx, fgpos+s_fg.width, height - s_fg.height);

}

//main(); 				
