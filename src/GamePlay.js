
var AMOUNT_DIAMONDS = 30;
var AMOUNT_BOOBLES = 30;

GamePlayManager = {
    init: function() {
        console.log("init");
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;//para que la imagen se ajuste a nuestra pantalla
        /* para que se centre en la pantalla vertical y horizontalmente */
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
       
        
        this.flagFirstMouseDown = false;//para poder iniciar el juego, se capturara el clic del mouse para poner en true y poder iniciar el juego

        this.amountDiamondsCaught = 0; //para guardar todos los diamantes que se agarra
        this.endGame = false;

        this.countSmile = -1;

    },
    preload: function() {
        console.log("preload");
        //--('Id','ruta de la imagen');
        game.load.image('background','assets/images/background.png');
        //--('Id','ruta de la imagen',ancho img,alto img,cantidad de imagenes en el png);
        game.load.spritesheet('horse','assets/images/horse.png',84,156,2);//en este png hay 2 imagenes o dos caballitos, 84->que es la mitad del ancho del png

        //cargar diamantes
        game.load.spritesheet('diamonds','assets/images/diamonds.png',81,84,4);

        game.load.spritesheet('explosion','assets/images/explosion.png');
        
        //objeto decorativo
        game.load.spritesheet('shark','assets/images/shark.png');
        game.load.spritesheet('fishes','assets/images/fishes.png');
        game.load.spritesheet('mollusk','assets/images/mollusk.png');

        game.load.spritesheet('booble1','assets/images/booble1.png');
        game.load.spritesheet('booble2','assets/images/booble2.png');
        
        //game.load.spritesheet('play','assets/images/play.png');
        game.load.image('btnPlay','assets/images/play.png');       



    },
    create: function() {

        console.log("create");
        game.add.sprite(0,0,'background');  /* (cordanadaX,cordenadaY,'Id') */
        //this.play = game.add.sprite(0, 0,'play');
        //this.play.anchor.setTo(0.5);
        //this.play.x = game.width/2;
        //this.play.y = game.height/2-200;
        //this.horse.visible=false;
        //this.play.visible=true;

        this.bobleArray = [];
        for (let i = 0; i < AMOUNT_BOOBLES; i++) {
            var xBooble = game.rnd.integerInRange(1,1140);
            var yBooble = game.rnd.integerInRange(600,950);

            var booble = game.add.sprite(xBooble, yBooble, 'booble' + game.rnd.integerInRange(1,2));
            booble.vel = 0.2 + game.rnd.frac()*2;
            booble.alpha = 0.9;
            booble.scale.setTo(0.2 + game.rnd.frac());
            this.bobleArray[i] = booble;

        }


        this.mollusk = game.add.sprite(500,150,'mollusk');
        this.shark = game.add.sprite(500,20,'shark');
        this.fishes = game.add.sprite(100,550,'fishes');

        this.horse = game.add.sprite(0,0,'horse'); //gurdamos una instancia para poder acceder a horse. this para que estre en el objeto GameplayManager
        this.horse.frame = 0; //hace referencia al png horse. si es 0 -> primera mitad del png, si es 1 -> segunda mitad del horse
        //--//
        /* hubicamos al caballo en la mitad de la pantalla */ //pero no se encuentra en la mitad exactamente
        this.horse.x = game.width/2;
        this.horse.y = game.height/2;
        //el anchor del caballo es el inicio del png asi que lo movemos al centro del png para q la img quede totalmente cenetrada
        this.horse.anchor.setTo(0.5, 0.5);
        //------------------------------------------//   
        // this.horse.angle = 0/* 90 */; //rotar en grados el png
        // this.horse.scale.setTo(2);//escalado//tambien se puede escalar en su cordenada (1,2);
        // this.horse.alpha = 0.5;//trasparencia del horse de 0 a 1 


        /* this.play = game.add.sprite(0,0,'play'); */
        /* this.play.anchor.setTo(0.5); */
        /* this.play.x= game.width/2; */
        /* this.play.y= game.height/2; */
        /* this.play.visible=true; */

        game.input.onDown.add(this.onTap, this);

        //diamante
        this.diamonds = [];

        for (var i = 0; i < AMOUNT_DIAMONDS; i++){
            var diamond = game.add.sprite(100,100,'diamonds');
            diamond.frame = game.rnd.integerInRange(0,3);//aparezca la imagen 1 2 3 o 4 segun el randon
            diamond.scale.setTo(0.30 + game.rnd.frac()); // rnd.frac devulve un numero aleatorio de cero a uno, en este caso de 0.30 a 1.30
            diamond.anchor.setTo(0.5); 
            diamond.x = game.rnd.integerInRange(50, 50);
            diamond.y = game.rnd.integerInRange(50,50);

            //evitar que se superpongan uno encima de otro 

            this.diamonds[i]= diamond;

            var rectCurrentDiamond = this.getBoundsDiamond(diamond);
            var rectHorse = this.getBoundsDiamond(this.horse); 

            while(this.isOverLapingOtherDiamond(i,rectCurrentDiamond) || this.isRectangleOverLapping(rectHorse,rectCurrentDiamond) ){
                diamond.x = game.rnd.integerInRange(50, 1050);
                diamond.y = game.rnd.integerInRange(50,600);
                var rectCurrentDiamond = this.getBoundsDiamond(diamond);
            }
        }

        /* los grupos son para evitar delay o lag en el juego
        esto mejora en rendimiento el juego ya que wse crearian varios objetos y los podriamos
        ocupar cuando esten en desuso para evitar crear un objeto cada vez que lo necesitemos */
//ejemplo
       //this.explosionGroup = game.add.group();
        //var ex1 = this.explosionGroup.create(200,200,'explosion');
        //var ex2 = this.explosionGroup.create(400,200,'explosion');
        //this.explosionGroup.scale.setTo(0.5);
        //this.explosionGroup.x = 500;
        //ex2.kill();
        //
        //var newExplosion = this.explosionGroup.getFirstDead();
        //console.log('new explosion : '+newExplosion);
        //


        //se crea el explosionGreoup 
        this.explosionGroup = game.add.group();

        for (let i = 0; i < 10; i++) {                     

            //y se remplaza en la siquinete linea en la siguiente linea con
            // this.explosion = game.add.sprite(100,100,'explosion');
            this.explosion = this.explosionGroup.create(100,100,'explosion');


            var tween = game.add.tween(this.explosion);
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                x: [0.4, 0.8, 0.4],
                y: [0.4, 0.8, 0.4]
            },
                600,
                Phaser.Easing.Exponential.Out,
                false, //false para autoStart si queremos que el tweening arranque automaticamente
                0, //delay en este caso que arranque en cero
                0, // veces que se repiita el tweening
                false // si queremos que vaya y vuelva, en este caso no
            );

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                alpha: [1, 0.6, 0]
            },
                600,
                Phaser.Easing.Exponential.Out,
                false,
                0,
                0,
                false

            );  

            this.explosion.anchor.setTo(0.5);
            //this.explosion.visible = false;
            this.explosion.kill();


        }

        /* ejemplo de tweens
        tween.to({//que se mueva el sprite hacia las cordenadas 
            x:500,
            y:100
        },
        1500,//tiempo de animacion
        Phaser.Easing.Exponential.out //tipo de aceleracion del objet http://lets-gamedev.aserkop-do.de/phasereasings/
        );
        tween.start();
        */

        //agregar texto

        this.currentScore = 0;

        var style ={
            font: 'bold 30pt Arial',
            fill: '#fff',
            align: 'center'
        }

        this.scoreText = game.add.text(game.width/2, 40,'0', style);
        this.scoreText.anchor.setTo(0.5);
        //game.rnd.integerInRange(1,1140);
        this.totalTime = game.rnd.integerInRange(10,20);;//15;
        this.timerText = game.add.text(1000, 40,this.totalTime+'s', style);
        this.timerText.anchor.setTo(0.5);

        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            //console.log("TIMER");//se mira en consola que incrementa cada segundo 
            if (this.flagFirstMouseDown) {
                this.totalTime--;
                this.timerText.text = this.totalTime+'s';
                if (this.totalTime<=0) {
                    game.time.events.remove(this.timerGameOver);//eliminar el timer
                    this.endGame = true;
                    this.showFinalMessage('GAME OVER');
                }
            }


        },this);


        /* txt INICIAR JUEGO       */
        
        this.txt_iniciar =  game.add.text(game.width/2, game.height/2, 'CLIK PARA INICIAR JUEGO',{
            font:'bold 24px sans-serif',
            fill:'#001BFF',
            align:' center'
        });
        this.txt_iniciar.anchor.setTo(0.5);
        this.txt_iniciar.visible = true;
        /* fin txt iniciar juego */



    },
    increaseScore:function(){


        this.countSmile = 0;
        this.horse.frame = 1;

        //esta funcion es para el puntaje cada vez que se atrapa un diamante
        this.currentScore+=100;
        this.scoreText.text = this.currentScore;

        //se debe llamar la funcion cada vez que se destruye un diamante

        this.amountDiamondsCaught += 1;
        if(this.amountDiamondsCaught >= AMOUNT_DIAMONDS){
            game.time.events.remove(this.timerGameOver);//eliminar el timer
            this.endGame = true;
            this.showFinalMessage('Ganaste');
        }

    },
    showFinalMessage:function(msg){
        //para mostrar un cuadro en pantalla al ganar el juego
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000';
        bgAlpha.ctx.fillRect(0,0,game.width,game.height);
        var bg = game.add.sprite(0,0,bgAlpha); 
        bg.alpha = 0.5;//opacidad

        var style={
            font: 'bold 60pt Arial',
            fill: '#fff',
            align: 'center'
        }


        this.textFieldFinalMsg = game.add.text(game.width/2, game.height/2-100, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
        this.tweenMollusk.stop();

        this.replay();
        
    },

    onTap: function(){

        //this.play.visible=flase;
        this.txt_iniciar.visible=false;


        if (!this.flagFirstMouseDown) {
            this.tweenMollusk = game.add.tween(this.mollusk.position).to({
                y:-0.001
            },
                5800,
                Phaser.Easing.Cubic.InOut,
                true,
                0,
                1000,
                true
            ).loop(true);
        }
        
        this.flagFirstMouseDown = true;

    },
    getBoundsDiamond:function(currentDiamond){
        return new Phaser.Rectangle(currentDiamond.left,currentDiamond.top,currentDiamond.width, currentDiamond.height);

    },
    isRectangleOverLapping:function(rect1,rect2){
        if (rect1.x > rect2.x+rect2.width || rect2.x > rect1.x+rect1.width) {
            return false;            
        }
        if (rect1.y > rect2.y+rect2.height || rect2.y> rect1.y+rect1.height) {
            return false;
        }
        return true;
    },
    isOverLapingOtherDiamond:function(index,rect2){
        //comparar el rectangulo del nuevo diamante que estamos creando con todos los diamantes anteriores
        //y va a chequear si el nuevo rectangulo rect2 esta colisionando con alguno creado 
        for (let i = 0; i < index; i++) {
            var rect1 = this.getBoundsDiamond(this.diamonds[i]);
            if(this.isRectangleOverLapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },
    getBoundshorse:function(){
        var x0 = this.horse.x - Math.abs(this.horse.width)/4;//antes en 2
        var width = Math.abs(this.horse.width)/2; //antes no se dividia
        var y0 = this.horse.y - Math.abs(this.horse.height)/2;
        var height = this.horse.height;

        return new Phaser.Rectangle(x0,y0,width,height);
    },
    update: function() {

        if(this.flagFirstMouseDown && !this.endGame ){

            for (let i = 0; i < AMOUNT_BOOBLES; i++) {
                var booble = this.bobleArray[i];
                booble.y -= booble.vel;
                if (booble.y < -50) {
                    booble.y = 700;
                    booble.x = game.rnd.integerInRange(1,1140);
                }
            }

            if (this.countSmile >=0) {
                this.countSmile++;
                if(this.countSmile >50){
                    this.countSmile = -1
                    this.horse.frame = 0;
                }
            }

            this.shark.x--;
            if (this.shark.x < -300) {
                this.shark.x = 1300;
                
            }

            this.fishes.x+=0.3;
            if (this.shark.x > 1300) {
                this.shark.x = -300;
                
            }

            //console.log("update");
            //this.horse.angle += 1;//rotar png en uno por cada frame
    
            //obtener las cordenadas de nuestro mouse
            var pointerX = game.input.x;
            var pointerY = game.input.y;
            //console.log('x = '+pointerX+' '+'y = '+ pointerY);
    
            //calcular distancia de nuestro mouse y el horse
            var distX = pointerX - this.horse.x;
            var distY = pointerY - this.horse.y;
            //eñ sigte if para girar el horse de acuerdo a donde este el mouse
            if(distX>0){
                this.horse.scale.setTo(1,1);
            }else{
                this.horse.scale.setTo(-1,1);
            }
    
            //mover el horse
    
            this.horse.x += distX * 0.02;
            this.horse.y += distY * 0.02;

            for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
                var rectHorse = this.getBoundshorse();
                var rectDiamond = this.getBoundsDiamond(this.diamonds[i]);
                if(this.isRectangleOverLapping(rectHorse, rectDiamond) && this.diamonds[i].visible == true ){
                    //console.log("colision");
                    //llamar a la funcion de incrementar puntaje
                    this.increaseScore();
                    this.diamonds[i].visible = false;

                    var explosion = this.explosionGroup.getFirstDead();

                    if(explosion != null){

                        explosion.reset(this.diamonds[i].x, this.diamonds[i].y );                      
                        explosion.tweenScale.start();
                        explosion.tweenAlpha.start();

                        //hacer kill al objeto despues de terminar la animacion
                        explosion.tweenAlpha.onComplete.add(function (currentTarget, currentTween){
                            currentTarget.kill();
                        },
                        this
                        );
                    }
                }
            }
          
           
        }



    },
    //funcionn especial
    render:function(){
        //game.debug.spriteBounds(this.horse);//muestra el rectangulo del png

        for (var i = 0; i < AMOUNT_DIAMONDS; i++) {
            //game.debug.spriteBounds(this.diamonds[i]);//muestra el rectangulo del png        
        }

        

    },
    replay:function(){
        var btnPlay = this.add.button(game.width/2, game.height/2,'btnPlay',this.iniciarJuego,this,);
        btnPlay.anchor.setTo(0.5);

    },
    iniciarJuego:function(){
        console.log("btn play aa")
        //game.state.add("gameplay", GamePlayManager);
        game.state.start("gameplay");
    }

}

var game = new Phaser.Game(1136, 640, Phaser.CANVAS);
    
game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");