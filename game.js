
BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {

  create: function () {
    //look up tileSprites
    this.setupBackground(); 
    this.setupPlayer(); 
    this.setupEnemies(); 
    this.setupBullets(); 
    this.setupExplosions(); 
    this.setupText(); 
    
    if(!this.game.device.desktop){
      this.processPlayerInputMobile();
    }
    
    this.cursors = this.input.keyboard.createCursorKeys();
  
    
    

  },

  update: function () {
    this.checkCollisions();
    this.spawnEnemies();
  //if your desktop or laptop then run this code to move plane
    if(this.game.device.desktop){
      this.processPlayerInput();
    }
    this.processDelayedEffects();
    

    
  
    

    

    

  },  render: function() { 
    //this.game.debug.body(this.bullet); 
    this.game.debug.body(this.enemyPool); 
    this.game.debug.body(this.player);
  },
  checkCollisions: function(){
    
    this.physics.arcade.overlap( 
      this.bulletPool, 
      this.enemyPool, 
      this.enemyHit, 
      null, this 
    );
    
    this.physics.arcade.overlap(
      this.player,
      this.enemyPool,
      this.playerHit,
      null, this
    );
    
  },
  spawnEnemies: function (){
    
    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) { 
      this.nextEnemyAt = this.time.now + this.enemyDelay; 
      var enemy = this.enemyPool.getFirstExists(false); 
      
    // spawn at a random location top of the screen 
      enemy.reset(this.rnd.integerInRange(enemy.width, this.game.width - enemy.width), 0); 
      
    // also randomize the speed 
      enemy.body.velocity.y = this.rnd.integerInRange(30, 60); 
      enemy.play('fly'); 
      
    }
    
  },
  
  processPlayerInput: function(){
    //reset the velocity player
      this.player.body.velocity.x = 0; 
      this.player.body.velocity.y = 0;
      
    /*if the player  used the arrow keys*/
      if (this.cursors.left.isDown) { 
        this.player.body.velocity.x = -this.player.speed;
      }
      else if (this.cursors.right.isDown) { 
        this.player.body.velocity.x = this.player.speed; 
        
      }
      if (this.cursors.up.isDown) { 
        this.player.body.velocity.y = -this.player.speed; 
      } 
      else if (this.cursors.down.isDown) { 
        this.player.body.velocity.y = this.player.speed; 
      }
    /*end of arrow key movement*/
      
    /*shooting code*/
      if (this.input.keyboard.isDown(Phaser.Keyboard.Z) || 
          this.input.activePointer.isDown)
      {
        this.fire();
      }
  },
  processPlayerInputMobile: function(){
      gyro.frequency = 10;
  		// start gyroscope detection
      gyro.startTracking(function(o) {
          // updating player velocity
          this.player.body.velocity.x = 0; 
          this.player.body.velocity.y = 0;
          this.player.body.velocity.x += o.gamma * 8;
          this.player.body.velocity.y += o.beta * 8;
           
      }.bind(this));
      
      this.game.input.onDown.add(this.fire, this);
  },
  processDelayedEffects: function(){
    if (this.instructions.exists && this.time.now > this.instExpire) { 
      this.instructions.destroy(); 
    }
  },
  
  enemyHit: function (bullet, enemy) { 
    bullet.kill(); 
    
    this.explode(enemy)
    enemy.kill();
    
  },
  playerHit: function (player, enemy) {
    this.explode(enemy);
    enemy.kill();
    this.explode(player);
    player.kill();
  },
  explode: function (sprite){
    if(this.explosionPool.countDead() === 0){
      return;
    }
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y);
    explosion.play('boom', 15, false, true);
    
    // add the original sprite's velocity to the explosion
    explosion.body.velocity.x = sprite.body.velocity.x;
    explosion.body.velocity.y = sprite.body.velocity.y;
  },

  fire: function(){
    // if shot with this.shotDelay return
    if(!this.player.alive || this.nextShotAt > this.time.now){
      return;
    }
    //if all bullets have been shot
    if(this.bulletPool.countDead() === 0){
      return;
    }
    
    //else itterate this.nextShotAt up by shotDelay
    this.nextShotAt = this.time.now + this.shotDelay;

    
    //find the first dead bullet
    var bullet = this.bulletPool.getFirstExists(false);
    
    //reset the sprite and place it in a new location
    bullet.reset(this.player.x, this.player.y - 20);
    
    bullet.body.velocity.y = -500;
  },
  setupBackground: function(){
    this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
    this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
  },
  setupPlayer: function (){
    
    this.player = this.add.sprite(this.game.width/2, this.game.height - 100, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.physics.enable(this.player, Phaser.Physics.ARCADE);
    
  //just added speed to character
    this.player.speed = BasicGame.PLAYER_SPEED;
    
  // stop the player from going outside the world
    this.player.body.collideWorldBounds  = true;
    
  //change the size hitbox sizes
    this.player.body.setSize(40, 64, 0, 0);

  },
  setupEnemies: function (){
    
    this.enemyPool = this.add.group(); 
    this.enemyPool.enableBody = true; 
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE; 
    this.enemyPool.createMultiple(50, 'greenEnemy'); 
    this.enemyPool.setAll('anchor.x', 0.5); 
    this.enemyPool.setAll('anchor.y', 0.5); 
    this.enemyPool.setAll('outOfBoundsKill', true); 
    this.enemyPool.setAll('checkWorldBounds', true);
    // Set the animation for each sprite 
    
    this.enemyPool.forEach(function (enemy) { 
      enemy.animations.add('fly', [ 0, 1, 2 ], 20, true); 
    });
    
    this.nextEnemyAt = 0;
    this.enemyDelay = BasicGame.SPAWN_ENEMY_DELAY;
    
  },
  setupBullets: function (){
    this.bulletPool = this.add.group();
  //enables p hysics on all the sprites
    this.bulletPool.enableBody = true;
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
  //add 100 bullets sprites to the group
    this.bulletPool.createMultiple(100, 'bullet');
  //set anchors
    this.bulletPool.setAll('anchor.x', 0.5);
    this.bulletPool.setAll('anchor.y', 0.5);
  //automatically kill out of bounds
    this.bulletPool.setAll('outOfBoundsKill', true); 
    this.bulletPool.setAll('checkWorldBounds', true);
  /*glbal variables*/
    this.nextShotAt = 0;
    this.shotDelay = BasicGame.SHOT_DELAY;
  /*end of global vairables*/
  },
  
  setupExplosions: function (){
    
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true; 
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE; 
    this.explosionPool.createMultiple(100, 'explosion'); 
    this.explosionPool.setAll('anchor.x', 0.5); 
    this.explosionPool.setAll('anchor.y', 0.5); 
    this.explosionPool.forEach(function (explosion) { 
      explosion.animations.add('boom'); 
    });
    
  },
  setupText: function (){
    
    this.instructions = this.add.text( 400, 500, 'Use Arrow Keys to Move, Press Z to Fire\n' + 'Tapping/clicking does both', 
                                      { font: '20px monospace', fill: '#fff', align: 'center' } ); 
    this.instructions.anchor.setTo(0.5, 0.5); 
    this.instExpire = this.time.now + BasicGame.INSTRUCTION_EXPIRE;
    
  },
  
  quitGame: function (pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    this.state.start('MainMenu');

  }

};
