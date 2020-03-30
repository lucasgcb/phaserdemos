var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    audio:{
        disableWebAudio: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y:300},
            debug:false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var gameOver = false
var score = 0
var scoreText
function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.audio('bg', 'assets/rasp.mp3')
    this.load.spritesheet('dude', 
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    let progressBar = this.add.graphics();
    let progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(240, 270, 320, 50);
    this.load.on('progress', function (value) {
        console.log(value);
        progressBar.clear();
        progressBar.fillStyle(0xffffff, 1);
        progressBar.fillRect(250, 280, 300 * value, 30);
    });
                
    this.load.on('fileprogress', function (file) {
        console.log(file.src);
    });
    
    this.load.on('complete', function () {
        console.log('complete');
        progressBox.destroy();
        progressBar.destroy();
    });
}

function setupPlayer(physics,anims,x,y,key)
{
    let player = physics.add.sprite(x,y,key)
    player.setCollideWorldBounds(true);
    anims.create(
        {
            key: 'left',
            frames: anims.generateFrameNumbers('dude',{start:0, end:3}),
            frameRate: 10,
            repeat: -1
        });
    anims.create(
        {
            key: 'turn',
            frames: anims.generateFrameNumbers('dude',{start:4, end:4}),
            frameRate: 20,
        });
    anims.create(
        {
            key:'right',
            frames: anims.generateFrameNumbers('dude', { start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });
        
    player.setTint(0x0);
    return player
}
function setupEnvironment(physics,key)
{
    let platforms = physics.add.staticGroup();
    platforms.create(400, 568, key).setScale(2).refreshBody();
    platforms.create(600, 400, key);
    platforms.create(50, 250, key);
    platforms.create(750, 220, key);
    return platforms
}
function setupCollectables(physics,num)
{
    let stars = physics.add.group({
                key: 'star',
                repeat: num,
                setXY: { x: 12, y: 0, stepX: 70 }
                });
                stars.children.iterate(function (child) {

                    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

                });
    return stars
}
function setupEnemies(physics,num)
{
    let bombs = physics.add.group({key: 'bomb',
                                    repeat: num,
                                    setXY: { x: 100, y: 0, stepX: 170 }
                                    });
                                    bombs.children.iterate(function (child) {
                                    child.setBounce(1)
                                    child.setVelocity(Phaser.Math.Between(-200, 200), 20);
                                        child.setCollideWorldBounds(true);
                                    });
    return bombs                                    
}
function setupUI(add, text)
{
    scoreText = add.text(16,16,text, {fontSize: '32px', fill: '#000'});
    maxScoreText = add.text(16,46,"Max Score:", {fontSize: '32px', fill: '#000'});
}
function setupAudio(sound,key)
{
    let bgMusic = sound.play('bg', {
                        mute: false,
                        volume: 1,
                        rate: 1,
                        detune: 0,
                        seek: 0,
                        loop: true,
                        delay: 0
                    })
    sound.setRate(1)
    return bgMusic
}
var stuff = new Array();
function create ()
{
    
    this.add.image(400,300,'sky');

    helloButton.on('pointerover', () => { console.log('pointerover'); });

    platforms = setupEnvironment(this.physics,'ground')
    player = setupPlayer(this.physics,this.anims,100,450,'dude')
    stars = setupCollectables(this.physics,11)
    bombs = setupEnemies(this.physics,2)
    bomb_extras = setupEnemies(this.physics,-1)
    stuff.push(stars)
    stuff.push(bombs)
    stuff.push(player)
    stuff.push(bomb_extras)
    stuff[3].children.iterate(function (child) {
        console.log(child)
        if(child!=null)
        {
            child.destroy()
        }
    });
    setupUI(this.add,"Score: 0")
    bgMusic = setupAudio(this.sound,'bg')
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bomb_extras, platforms);
    this.physics.add.collider(player, bomb_extras, hitBomb, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
  
}

function reset(sound,physics)
{
    setupAudio(sound,'bg')
    stuff[0].children.iterate(function (child) {
    child.disableBody(true,true)
    child.enableBody(true, child.x, 0, true, true);
    });

    stuff[1].children.iterate(function (child) {
    child.disableBody(true,true)
    child.enableBody(true, child.x, 0, true, true);
    child.setVelocity(Phaser.Math.Between(-200, 200), 20);
    });

    stuff[2].setPosition(100,450)
    scoreText.setText("Score : 0" )
    stuff[2].setTint(0x0);

    stuff[3].clear(true)

    physics.resume()
    detuneMod = 0
    playerBaseMod = 0
    musicRateMod = 0
    score = 0
}

function hitBomb (player, bomb)
{
    this.physics.pause();
    try{
    this.sound.stopAll()
    }
    catch(err)
    {

    }
    player.setTint(0xff0000);

    player.anims.play('turn');
    gameOver = true;
}

function collectStar (player, star)
{
    star.disableBody(true, true);
    score+=10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);
            
        });
        playerBaseMod += 50
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        
        var bomb = stuff[3].create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            
        musicRate += 0.2
        this.sound.setRate(musicRate + musicRateMod)
        detuneMod +=200
        this.sound.setDetune(detuneBase + detuneMod)
    }
}

var playerBaseVel = 160
var playerBaseMod = 0
var musicRate = 1
var musicRateMod = 0
var detuneBase = 50
var detuneMod = 0

var maxScore = 0
function update ()
{
    if(score > maxScore)
    {
        maxScore = score
        maxScoreText.setText('Max Score: ' + maxScore)
    }
    
    cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown)
    {
        player.setVelocityX(-(playerBaseVel+playerBaseMod));

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX((playerBaseVel+playerBaseMod));

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }
    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-(330));
    }

    if(gameOver)
    {
        setTimeout(reset,500,this.sound,this.physics)
        gameOver = false;
    }
    
}