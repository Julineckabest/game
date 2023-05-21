
// -------------------------------------------------------------------------------------------------------------------------- //
// Global Variable declarations

let gameConfig
let game
let currScene
let titleThing
let buttonStart


let buttonLeft
let buttonRight
let player
let catchingAquarium

let fishPhysicsGroup
let spawnFish
let fishes

let edgesGroup
let worldEdgesGroup
let worldEdgesGroup2


let scoreCounterText
let totalfishCaught
let helpCounter
let fishcaught
let savedFish
let oneLife

let hearts
let lives
let endGame

let holdinFish
let swimFishLeft
let notSaved
let deadFishSpawnTime
let fullaquarium



// -------------------------------------------------------------------------------------------------------------------------- //
// Game Setup

window.onload = function ()
{
    
    gameConfig =
    {
        width: 580,
        height: 420,
        backgroundColor: 0xccccff,
        physics:
        {
            default: "arcade",
            arcade:
            {   
                gravity: {y: 200},
                debug: false
            }
        },
        scene:
        {
            preload: Preload,
            create: Create,
            update: Update
        }
        
    }
    game = new Phaser.Game(gameConfig)
    
}

// -------------------------------------------------------------------------------------------------------------------------- //
// Special Functions
function Preload()
{   

    currScene = this
    console.log("Preload is starting...")

    //LOAD IMAGES

    currScene.load.image("background", "Images/background2.png")
    currScene.load.image("gameover-screen", "Images/gameover-screen.png")
    currScene.load.image("button-left", "Images/button-left.png")
    currScene.load.image("button-right", "Images/button-right.png")
    currScene.load.image("player", "Images/player-left.png")
    currScene.load.image("player", "Images/player-right.png")
    currScene.load.image("aquarium", "Images/aquarium.png")
    currScene.load.image("dead-fish", "Images/fish-heaven.png")
    currScene.load.image("fish", "Images/fish.png")
    currScene.load.image("life", "Images/life.png")
    currScene.load.image("full-aquarium", "Images/full-aquarium.png")



    //LOAD AUDIO

    currScene.load.audio("startFX", "sounds/start-sound.wav")
    currScene.load.audio("caughtFX", "sounds/fish-caught-sound.wav")
    currScene.load.audio("jumpFX", "sounds/fish-jump-sound.wav")
    currScene.load.audio("savedFX", "sounds/fish-moved-sound.wav")
    currScene.load.audio("dieFX", "sounds/fish-die-sound.wav")
    currScene.load.audio("gameoverFX", "sounds/gameover-sound.wav")


    //LOAD ANIMATION SPRITE

    const fishSwimConfig = 
    {
        frameWidth: 40,    
        frameHeight: 20     
    }
   
    currScene.load.spritesheet("fishswim", "Images/fishAni.png", fishSwimConfig)


}

function Create()
{
    console.log("Create is starting!")

    //Adding audio to the game scene
    startFX = this.sound.add("startFX")
    jumpFX = this.sound.add("jumpFX")
    caughtFX = this.sound.add("caughtFX")
    savedFX = this.sound.add("savedFX")
    dieFX = this.sound.add("dieFX")
    gameoverFX = this.sound.add("gameoverFX")

    //Game scene 
    startFX.play()

    currScene.add.image(gameConfig.width / 2, gameConfig.height / 2, "background")

    buttonLeft = currScene.add.image(120, gameConfig.height - 58, "button-left")
    buttonLeft.setInteractive()
    buttonLeft.on("pointerdown", moveLeft)

    buttonRight = currScene.add.image(gameConfig.width -120, gameConfig.height -58, "button-right")
    buttonRight.setInteractive()
    buttonRight.on("pointerdown", moveRight)

    player = currScene.physics.add.image(gameConfig.width / 2, gameConfig.height / 2, "player")
    player.body.allowGravity = false
    player.setCollideWorldBounds(true);

    currScene.physics.world.setBounds(100, 0, gameConfig.width - 210, gameConfig.height);

    player.setData('notMoving', true);


    catchingAquarium = currScene.physics.add.image((gameConfig.width / 2) + 20, (gameConfig.height / 2) - 20, "aquarium")
    catchingAquarium.body.allowGravity = false
    catchingAquarium.setCircle(20, 2, 0)




    swimFishLeft = currScene.add.sprite(gameConfig.width - 70, gameConfig.height/2 - 25, "fishswim")


    const fishSwimAnimConfig =
    {
        key: "swimmyfish",     
        frames: currScene.anims.generateFrameNumbers("fishswim"), 
        frameRate: 8,       
        repeat: -1
      
    }

    currScene.anims.create(fishSwimAnimConfig)

    // Start the animation
    swimFishLeft.anims.play("swimmyfish")



    //SPAWN FISH
    fishPhysicsGroup = currScene.physics.add.group()
    currScene.physics.add.overlap(fishPhysicsGroup, catchingAquarium, fishCatchRight) //if player is hit - by ballons - do the function

    fishes = [ ]

    hearts = [ ]
    lives = 3

    const spawnFishConfig = 
    {
        delay: 3500,
        callback: fishJump,
        repeat: -1
        
    }

    spawnFish = currScene.time.addEvent(spawnFishConfig)

    edgesGroup = this.physics.add.staticGroup()
    currScene.physics.add.overlap(edgesGroup, fishPhysicsGroup, fishDie)

    //worldEdgesGroup = this.physics.add.staticGroup()
    //currScene.physics.add.collider(worldEdgesGroup, player)


    lifecount()

    let textConfig =
    {
        fontFamily: "gameFont", //The font to use (see index.html)
        fontSize: "25px", //The size of the font
        strokeThickness: 3, //The outline around the font
        stroke: "#000", // The colour of the outline
        color: "#FAB74B"
    }

    fishcaught = 0 
    savedFish = 0 
    scoreCounterText = currScene.add.text(40, 35, " SCORE: " + savedFish, textConfig)
    //helpCounter = currScene.add.text(200, 35, " HELP: " + fishcaught, textConfig)

    holdinFish = false
    endGame = false

    let rect = currScene.add.rectangle(gameConfig.width /2, gameConfig.height/2 + gameConfig.height/4 , gameConfig.width - 50, 10, 0xF50711)
    edgesGroup.add(rect)
    edgesGroup.setAlpha(0)


}


        

function Update()
{   
    //Player movement left-right
    if(player.x < 100)
    {
        emptyFish()
    }

    if (player.flipX == false)  // he's moving left
        catchingAquarium.x = Math.max(player.x - 40, 100)
    else    // he's moving right
        
        catchingAquarium.x = Math.min(player.x + 40, gameConfig.width - 110)
}

// -------------------------------------------------------------------------------------------------------------------------- //
// Custom Functions


function moveLeft()
{   
    const tweenConfig =
    {
        targets: player,
        x: (player.x - 100) 
    }
    currScene.tweens.add(tweenConfig)
    player.flipX=false;
}

function moveRight()
{   
    const tweenConfig =
    {
        targets: player,
        x: (player.x + 100) 
    }
    currScene.tweens.add(tweenConfig)
    player.flipX=true;
}


function fishJump()
{   
    console.log("Fish jump")

    let newFish = currScene.physics.add.image(gameConfig.width - 60, gameConfig.height/2 - 35, "fish")

    fishPhysicsGroup.add(newFish) 
    newFish.setCircle(12, 7, 2)
    newFish.setVelocity(Phaser.Math.Between(-200,-80), (Phaser.Math.Between(-200, -100)))
    newFish.setTint(Phaser.Math.Between(0x000000, 0xFFFFFF))

    fishes.push(newFish)

    jumpFX.play()  

}

function fishCatchRight(catchingAquarium, weeFish)
{
    if (holdinFish == true)
    {   
        return
    }
    console.log("Yeees!")
    fullaquarium = currScene.add.image(gameConfig.width /2, 65, "full-aquarium")



    caughtFX.play()
    fishPhysicsGroup.remove(weeFish, true, true)
    
    fishcaught = fishcaught + 1

  
    holdinFish = true
    console.log(fishcaught)
    //helpCounter.setText("Help: " + fishcaught)
    

}

function saveFish()
    {
        
        if (holdinFish == false)
        {
            return
        }
        console.log("She is saved!")

        
    }


function lifecount()
{
    for (let index = 1; index <= 3; index++) 
    {
        oneLife = currScene.add.image(gameConfig.width - (40 + index*50), gameConfig.height / 6, "life")

        hearts.push(oneLife)
        console.log("One life")
    }

    if (endGame == true) 
    {
        return
    }

}

function emptyFish()
{
    console.log("Empty fish!")
    if (fishcaught > 0)
    {
        fishcaught = fishcaught -1 
        savedFish = savedFish + 1 
        //helpCounter.setText("Help: " + fishcaught)
        savedFX.play()
        scoreCounterText.setText("Score: " + savedFish)
        fullaquarium.destroy()


        holdinFish = false

        if (holdinFish == false)
        {
            return
        }
    }
}

function fishDie(floor, otherThing)
{
    console.log("She died!")
   
    fishGoingToHeaven(otherThing.x, otherThing.y)

    endGame = true
    if (lives > 0) 
    {
        hearts[lives-1].destroy()
        lives--
    } 
    else 
    {
        gameOver()
    }
    dieFX.play()
    otherThing.destroy()
}

function fishGoingToHeaven(startX, startY)
{
    let fishGoingToHeaven = currScene.physics.add.image(startX, startY, "dead-fish")
    fishGoingToHeaven.body.allowGravity = false

    fishGoingToHeaven.setVelocity(0, -200)

}

function gameOver()
{
    currScene.add.image(gameConfig.width / 2, gameConfig.height / 2, "gameover-screen")
    buttonLeft = currScene.add.image(120, gameConfig.height - 58, "button-left")
    buttonRight = currScene.add.image(gameConfig.width -120, gameConfig.height -58, "button-right")

    player.destroy()
    catchingAquarium.destroy()
    spawnFish.destroy()

    gameoverFX.play()

    let firstLineGO = currScene.add.text(gameConfig.width - 200, gameConfig.height / 2 - 90, " GAME OVER", {fontFamily: "gameFont",fontSize: "45px", strokeThickness: 3, stroke: "#000", color: "#D77273"})
    firstLineGO.setOrigin(0.5)

    let secondLineGO = currScene.add.text(gameConfig.width - 200, gameConfig.height / 2, " SCORE: " + savedFish, {fontFamily: "gameFont",fontSize: "25px", strokeThickness: 3, stroke: "#000", color: "#D77273"})
    secondLineGO.setOrigin(0.5)
}