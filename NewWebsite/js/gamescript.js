// Shop

var price1 = 50;
var price2 = 70;
var price3 = 500;

// Player definitions

var step = 7;
var queueDirection = [];
var aimDirection = [];
var money = 10000;
var projectileColor = "white";
var score = 0;

// maybe plyaer upgrade that let him autoshoot at 80% efficiency -> little slower so its fair
// something like soy milk that decreases dmg but drastically increases firerate
// dmg multiplicator should be a number stored seperately so dmg multiplicator is addative and can be increased and decreased with upgrades

var playerObject = {maxHitpointsPlayer: 5,hitpointsPlayer: 5, playerLevel: 1, weapon: "basic", weaponLevelPlayer: 1, attackspeedPlayer: 250, lastTimehitPlayer: 0, invincibilityDuration: 500, baseDamage: 1};

var playerProjectiles = [];

// player constants
const playerWeapons = [
    "basic",
    "sniper",
    "laser"
];
const playerProjectileTypes = [
    "slash", // melee attack that has a large aoe but no knockback
    "air_push", // melee attack that has knockback on projectiles -> shoots them in the opposite direction but doesnt turn them friendly but damages enemies (neutral bullet ig) -> homing still homes to player
    "projectile", // basic projectile that shoots in a straight line
    "blast", // on contact with enemy_type expodes in a small to big radius -> depending on upgrade
    "scatter", // on contact or after certain distance explodes in small radius and shoots out little basic projectiles in each direction -> how many directions scales with upgrade
];
const playerProjectileMovement = [
    "line", // mormal projectile speed
    "bouncy", // bounces off walls -> will be ground projectiles please ._. i dont want to deal with straight ones
    "zigzag", // yes a zigzag pattern
];

const circle = document.getElementById("circle");
const barrel = document.getElementById("barrel");

// Enenmy Definitions

var difficulty = 1; // Will rise with time ind can be the multiplier for enemy health and damage with some tweaks
var spawnersFull = false;
var baseHealth = 5;

const spawnerPos = [
    [10,10],[500,10],[990,10],
    [10,500],        [990,500],
    [10,990],[500,990],[990,990]
];

var usedEnemyTypes = ["","","","","","","",""];
var usedSpawnerPos = [0,0,0,0,0,0,0,0];
const fullSpawnerPos = [1,1,1,1,1,1,1,1];


var spawnDelay = 2500 + Math.floor(Math.random()*1000);
var lastSpawnTime = Date.now();

const keysPressed = {};
var ring_x = 250;
var ring_y = 250;

const enemyProjectileMovement = [
    "basic",
    "homing"
];

const enemyTypes = [
    "basic",
    "sniper",
    "tank",
    "gunner"
];

const enemyBagRefill = [
    "basic","basic","basic","basic",
    "sniper","sniper",
    "tank","tank",
    "gunner"
];
var enemyBag = [...enemyBagRefill];


const basicProjectileTypes = [
    "basic","basic","basic","basic","basic","basic","basic",
    "scatter","scatter","scatter","scatter",
    "leave_behind_obstackle","leave_behind_obstackle","leave_behind_obstackle",
    "scatter_mini_missile",
    "scatter_mini_homing_missile",
];
var basicProjectileTypesBag = [...basicProjectileTypes];


const sniperProjectileTypes = [
    "basic","basic","basic","basic",
    "scatter","scatter","scatter","scatter",
    "scatter_mini_missile","scatter_mini_missile","scatter_mini_missile","scatter_mini_missile","scatter_mini_missile",
    "scatter_mini_homing_missile","scatter_mini_homing_missile","scatter_mini_homing_missile",
];
var sniperProjectileTypesBag = [...sniperProjectileTypes];


const tankProjectileTypes = [
    "basic","basic","blast","blast","blast","blast",
    "scatter","scatter","scatter","scatter","scatter","scatter",
    "leave_behind_obstackle","leave_behind_obstackle",
    "scatter_mini_missile",
    "scatter_mini_homing_missile",
];
var tankProjectileTypesBag = [...tankProjectileTypes];


const gunnerProjectileTypes = [
    "basic","basic","basic","basic","basic","basic","basic","basic",
    "scatter","scatter","scatter","scatter","scatter","scatter","scatter","scatter",
];
var gunnerProjectileTypesBag = [...gunnerProjectileTypes];

var enemyObjects = [
    {spawnerIndex: 0, rendered: false, spawnerPos: spawnerPos[0], enemyType: "", projectileType: "", enemyLevel: 1, enemyHealth: 3, enemyDamage: 1,reloadSpeed: 2000, lastTimeShot: 0, projectileSpeed: 5, attackSpeed: 1000, drop: 20},
    {spawnerIndex: 1, rendered: false, spawnerPos: spawnerPos[1], enemyType: "", projectileType: "", enemyLevel: 1, enemyHealth: 3, enemyDamage: 1,reloadSpeed: 2000, lastTimeShot: 0, projectileSpeed: 5, attackSpeed: 1000, drop: 20},
    {spawnerIndex: 2, rendered: false, spawnerPos: spawnerPos[2], enemyType: "", projectileType: "", enemyLevel: 1, enemyHealth: 3, enemyDamage: 1,reloadSpeed: 2000, lastTimeShot: 0, projectileSpeed: 5, attackSpeed: 1000, drop: 20},
    {spawnerIndex: 3, rendered: false, spawnerPos: spawnerPos[3], enemyType: "", projectileType: "", enemyLevel: 1, enemyHealth: 3, enemyDamage: 1,reloadSpeed: 2000, lastTimeShot: 0, projectileSpeed: 5, attackSpeed: 1000, drop: 20},
    {spawnerIndex: 4, rendered: false, spawnerPos: spawnerPos[4], enemyType: "", projectileType: "", enemyLevel: 1, enemyHealth: 3, enemyDamage: 1,reloadSpeed: 2000, lastTimeShot: 0, projectileSpeed: 5, attackSpeed: 1000, drop: 20},
    {spawnerIndex: 5, rendered: false, spawnerPos: spawnerPos[5], enemyType: "", projectileType: "", enemyLevel: 1, enemyHealth: 3, enemyDamage: 1,reloadSpeed: 2000, lastTimeShot: 0, projectileSpeed: 5, attackSpeed: 1000, drop: 20},
    {spawnerIndex: 6, rendered: false, spawnerPos: spawnerPos[6], enemyType: "", projectileType: "", enemyLevel: 1, enemyHealth: 3, enemyDamage: 1,reloadSpeed: 2000, lastTimeShot: 0, projectileSpeed: 5, attackSpeed: 1000, drop: 20},
    {spawnerIndex: 7, rendered: false, spawnerPos: spawnerPos[7], enemyType: "", projectileType: "", enemyLevel: 1, enemyHealth: 3, enemyDamage: 1,reloadSpeed: 2000, lastTimeShot: 0, projectileSpeed: 5, attackSpeed: 1000, drop: 20}
];
var enemyProjectiles = [
    [//First spawner
        {type: "basic", movement: "basic", rendered: false, x1: 0, y1: 0, x2: 0, y2: 0, direction: [0,1], projectileSpeed: 2.5}
    ],
    [//Second Spawner
        {type: "basic", movement: "basic", rendered: false, x1: 0, y1: 0, x2: 0, y2: 0, direction: [1,1], projectileSpeed: 2.5}
    ],
    [//Third Spawner
        {type: "basic", movement: "basic", rendered: false, x1: 0, y1: 0, x2: 0, y2: 0, direction: [1,0], projectileSpeed: 2.5}
    ],
    [//Fourth Spawner
        {type: "basic", movement: "basic", rendered: false, x1: 0, y1: 0, x2: 0, y2: 0, direction: [0,0], projectileSpeed: 2.5}
    ],
    [//Fifth Spawner
        {type: "basic", movement: "basic", rendered: false, x1: 0, y1: 0, x2: 0, y2: 0, direction: [0,0], projectileSpeed: 2.5}
    ],
    [//Sixth Spawner
        {type: "basic", movement: "basic", rendered: false, x1: 0, y1: 0, x2: 0, y2: 0, direction: [0,0], projectileSpeed: 2.5}
    ],
    [//Seventh Spawner
        {type: "basic", movement: "basic", rendered: false, x1: 0, y1: 0, x2: 0, y2: 0, direction: [0,0], projectileSpeed: 2.5}
    ],
    [//Eighth Spawner
        {type: "basic", movement: "basic", rendered: false, x1: 0, y1: 0, x2: 0, y2: 0, direction: [0,0], projectileSpeed: 2.5}
    ]
];

var pausedTime = 0;
var e_death_t = 0;

window.addEventListener('keydown', function(event) {
    keysPressed[event.key] = true;
});

window.addEventListener('keyup', function(event) {
    keysPressed[event.key] = false;
});

document.getElementById('sendPlayerDataButton').addEventListener('click', function(event) {
    document.getElementById('sendPlayerDataButton').style.display = 'none';
    document.getElementById('leaderRoute').style.display = 'block';
    savePlayerScore();
});
document.getElementById('leaderRoute').addEventListener('click', function(event) {
    window.open('Leaderboard');
});

// shop
document.getElementById('shopReroll').addEventListener('click', function(event) {
    rerollShop();
});
document.getElementById('shopSlot1').addEventListener('click', buyShop);
document.getElementById('shopSlot2').addEventListener('click', buyShop);
document.getElementById('shopSlot3').addEventListener('click', buyShop);

function rerollShop() {
    let audio = document.getElementById("RerollAudio");
    if (audio) {
        audio.play();
    }
    document.getElementById('shopSlot1').innerHTML = 'Cost: 100 Currency';
    document.getElementById('shopSlot1').addEventListener('click',buyShop);
    document.getElementById('shopSlot2').innerHTML = 'Cost: 100 Currency';
    document.getElementById('shopSlot2').addEventListener('click',buyShop);
    document.getElementById('shopSlot3').innerHTML = 'Cost: 500 Currency';
    document.getElementById('shopSlot3').addEventListener('click',buyShop);
    get_shop();
}

function buyShop(event) {
    let shopslot = event.currentTarget.id; 
    let object = event.currentTarget;
    console.log(object);
    if (shopslot == "shopSlot1" && money > price1) {
        money-=price1;
        price1+=50;
        playerObject.baseDamage += 1;
    }
    else if (shopslot == "shopSlot2" && money > price2) {
        money-=price2;
        price2+= 50;
        playerObject.maxHitpointsPlayer +=3;
    }
    else if (shopslot == "shopSlot3" && money > price3) {
        money-=price3;
        price3+=200;
        step+=0.5;
    }
    console.log(shopslot)
    object.innerHTML = 'Bought';
    document.getElementById(shopslot).removeEventListener('click',buyShop);
}

var initialTime;
var pID;
var lastTimeShotPlayer = 0;
var paused = false;
const day = 24 * 60 * 60 * 1000;
var gameEndTime;

var want_cookies = false;
var inShop = false;

function gamePause() {
    if (playerObject.hitpointsPlayer <= 0) {
        gameEndTime = Date.now();
        document.getElementById("gameOver").showPopover();
    }
    if (inShop == true) {
        document.getElementById("shop").showPopover();
        if (keysPressed['u']) {
            updateMaxHealth();
            updatePlayerStats();
            pausedTime = Date.now() - pausedTime;
            requestAnimationFrame(gameLoop);
            document.getElementById("shop").hidePopover();
            inShop = false;
            return;
        }
        requestAnimationFrame(gamePause);
    }
    else {
        if (paused == true) {
            document.getElementById("pauseMenu").showPopover();
            if (keysPressed['u']) {
                pausedTime = Date.now() - pausedTime;
                requestAnimationFrame(gameLoop);
                document.getElementById("pauseMenu").hidePopover();
                paused = false;
                return;
            }
            requestAnimationFrame(gamePause);
        }
    }
}

function setColorfromTier(input, option) {
    switch (input) {
        case '1': document.getElementById(option).style.backgroundColor = '#7d7b74'; break;
        case '2': document.getElementById(option).style.backgroundColor = '#4591a8'; break;
        case '3': document.getElementById(option).style.backgroundColor = '#23ad2a'; break;
        case '4': document.getElementById(option).style.backgroundColor = '#dba70b'; break;
        case '5': document.getElementById(option).style.backgroundColor = '#e8391a'; break;
    }
}

function get_shop() {
    fetch("/getShop", {
        method: 'POST'
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then((data) => {
        document.getElementById('option1_Name').innerHTML = data.type_1;
        document.getElementById('option2_Name').innerHTML = data.type_2;
        document.getElementById('option3_Name').innerHTML = data.type_3;
        document.getElementById('option1_UpgradeInfo').innerHTML = data.content_1;
        document.getElementById('option2_UpgradeInfo').innerHTML = data.content_2;
        document.getElementById('option3_UpgradeInfo').innerHTML = data.content_3;
        setColorfromTier(data.tier_1, 'Options_1');
        setColorfromTier(data.tier_2, 'Options_2');
        setColorfromTier(data.tier_3, 'Options_3');

    })
    .catch(error => console.error('Failed to fetch data:', error));
}

function gameLoop() {
    if (keysPressed['i']) {
        inShop = true;
        document.getElementById('shopSlot1').innerHTML = 'Cost: 100 Currency';
        document.getElementById('shopSlot1').addEventListener('click',buyShop);
        document.getElementById('shopSlot2').innerHTML = 'Cost: 100 Currency';
        document.getElementById('shopSlot2').addEventListener('click',buyShop);
        document.getElementById('shopSlot3').innerHTML = 'Cost: 500 Currency';
        document.getElementById('shopSlot3').addEventListener('click',buyShop);
        pausedTime = Date.now();
        updatePlayerStats();
        requestAnimationFrame(gamePause);
        get_shop();
        return;
    }

    if (keysPressed['p']) {
        paused = true;
        pausedTime = Date.now();
        requestAnimationFrame(gamePause);
        return;
    }

    if (initialTime == undefined) {
        initialTime = Date.now();
    }
    if (compare_arrays(usedSpawnerPos, fullSpawnerPos) != true && pausedTime + lastSpawnTime + spawnDelay < Date.now()) {
        pausedTime = 0;
        spawnEnemy();
        renderEnemy();
        lastSpawnTime = Date.now();
    }

    for (let i = 0; i < enemyObjects.length; i++) {
        const enemy = enemyObjects[i];
        if (enemy.rendered && (pausedTime + enemy.lastTimeShot + (enemy.reloadSpeed * 1000)) < Date.now()) {
            pausedTime = 0;
            projectileColor = "red";
            let randomShotSound = Math.floor(Math.random()*3+1);
            let audio = document.getElementById("EnemyShot"+randomShotSound);
            if (audio) {
                audio.play();
            }
            const newProjectile = createEnemyProjectile(enemy);
            enemyProjectiles[i].push(newProjectile);
            enemy.lastTimeShot = Date.now();
        }
    }

    for (let i = 0; i < enemyProjectiles.length; i++) {
        for (let j = 0; j < enemyProjectiles[i].length; j++) {
            const projectile = enemyProjectiles[i][j];
            var projectileHit = false;
            if (projectile.rendered) {
                moveProjectile(projectile);
                drawProjectile(projectile.id, projectile.x1, projectile.y1, projectile.x2, projectile.y2);

                const projectileHitbox = { x: projectile.x1, y: projectile.y1, radius: 5 };
                const playerHitbox = { x: ring_x, y: ring_y, radius: 10 };

                    if (checkCollision(projectileHitbox, playerHitbox) && playerObject.lastTimehitPlayer + playerObject.invincibilityDuration < Date.now()) {
                        playerObject.lastTimehitPlayer = Date.now();
                        playerObject.hitpointsPlayer -= 1;
                        updatePlayerHealth();
                        projectileHit = true;
                        if (playerObject.hitpointsPlayer <= 0) {
                            requestAnimationFrame(gamePause);
                            return;
                        }
                        break;
                    }
                if (projectile.x1 < -5 || projectile.x1 > 1005 || projectile.y1 < -5 || projectile.y1 > 1005 || projectileHit) {
                    const projectileElement = document.getElementById(projectile.id);
                    if (projectileElement) {
                        projectileElement.remove();
                    }

                    enemyProjectiles[i].splice(j, 1);
                    j--;
                }
                drawProjectile(projectile.id, projectile.x1, projectile.y1, projectile.x2, projectile.y2);
            }
        }
    }

    queueDirection = [0,0];

    if (keysPressed['w'] || keysPressed['k']) queueDirection[1] -= step;
    if (keysPressed['a'] || keysPressed['l']) queueDirection[0] -= step;
    if (keysPressed['s'] || keysPressed['j']) queueDirection[1] += step;
    if (keysPressed['d'] || keysPressed['h']) queueDirection[0] += step;

    if (queueDirection[0] != 0 && queueDirection[1] != 0) {
        var new_x_y = normalizeVector([0,0],queueDirection);
        ring_x += new_x_y[0]*step;
        ring_y += new_x_y[1]*step;
    }
    else {
        ring_x += queueDirection[0];
        ring_y += queueDirection[1];
    }

    if (ring_x > 1000) ring_x = 0;
    if (ring_x < 0) ring_x = 1000;
    if (ring_y > 1000) ring_y = 0;
    if (ring_y < 0) ring_y = 1000;
    circle.setAttribute("cx", ring_x);
    circle.setAttribute("cy", ring_y);
    
    aimDirection = [0,0];
    if (keysPressed['ArrowUp']) aimDirection[1] -= step;
    if (keysPressed['ArrowLeft']) aimDirection[0] -= step;
    if (keysPressed['ArrowDown']) aimDirection[1] += step;
    if (keysPressed['ArrowRight']) aimDirection[0] += step;

    if ((aimDirection[0] != 0 || aimDirection[1] != 0) && (playerObject.attackspeedPlayer + lastTimeShotPlayer) < Date.now()) {
        lastTimeShotPlayer = Date.now();
        projectileColor = "white";
        let randomShotSound = Math.floor(Math.random()*5);
        let audio = document.getElementById("PlayerShot"+1);
        if (audio) {
            audio.play();
        }
        createPlayerProjectile(aimDirection);
    }

    for (let i = 0; i < playerProjectiles.length; i++) {
        const projectile = playerProjectiles[i];

        if (projectile && projectile.rendered) {
            moveProjectile(projectile);

            let projectileHit = false;
            //Collision Check
            for (let y = 0; y < enemyObjects.length; y++) {
                const enemy = enemyObjects[y];

                if (enemy.rendered) {
                    const projectileHitbox = { x: projectile.x1, y: projectile.y1, radius: 5 };
                    const enemyHitbox = { x: enemy.spawnerPos[0], y: enemy.spawnerPos[1], radius: 25 }; //enemyradius

                    if (checkCollision(projectileHitbox, enemyHitbox)) {
                        enemy.enemyHealth -= projectile.damage;

                        // Handle enemy death
                        if (enemy.enemyHealth <= 0) {
                            enemy.rendered = false;
                            scoreSystem(enemy.enemyType);
                            document.getElementById("enemy_" + (y + 1)).style.display = "none";
                            usedSpawnerPos[y] = 0; // Free up the spawner
                            money += Math.floor(enemy.drop);
                            e_death_t = Date.now();
                        }

                        projectileHit = true; // Mark the projectile to be removed.
                        break; // Stop checking this bullet against other enemies.
                    }
                }
            }

            drawProjectile(projectile.id, projectile.x1, projectile.y1, projectile.x2, projectile.y2);

            // 4. Cleanup: Remove the projectile if it either hit something OR went off-screen.
            if (projectileHit || projectile.x1 < -5 || projectile.x1 > 1005 || projectile.y1 < -5 || projectile.y1 > 1005) {
                const projectileElement = document.getElementById(projectile.id);
                if (projectileElement) {
                    projectileElement.remove();
                }
                playerProjectiles.splice(i, 1);
                i--; // Adjust the loop counter!
            }
        }
    }

    updateMoney();
    requestAnimationFrame(gameLoop);
}

function updatePlayerHealth() {
    updateHealthBar();
    if (playerObject.hitpointsPlayer <= 0) {
        let audio = document.getElementById("playerDeath");
        if (audio) {
            audio.play();
        }
    }
    else {
        let audio = document.getElementById("playerHit");
        if (audio) {
            audio.play();
        }
    }
}

function updateMoney() {
    document.getElementById("Money").innerHTML = "Currency: " + money;
}

function updateMaxHealth() {
    playerObject.hitpointsPlayer = playerObject.maxHitpointsPlayer;
    document.getElementById("maxHealth").innerHTML = "Max Health: " + playerObject.maxHitpointsPlayer;
    updateHealthBar();
}

function updateHealthBar() {
    document.getElementById("healthBar").setAttribute("max", playerObject.maxHitpointsPlayer);
    document.getElementById("healthBar").setAttribute("value", playerObject.hitpointsPlayer);
}

function updatePlayerStats() {
    let damage = calculatePlayerAttributes();
    document.getElementById("playerLevel").innerHTML = "Level: "+playerObject.playerLevel;
    document.getElementById("damageNum").innerHTML = "Damage: " + damage[0];
    document.getElementById("maxHealth").innerHTML = "Max Health: " + playerObject.maxHitpointsPlayer;
    document.getElementById("attackSpeed").innerHTML = "Attackspeed: " + playerObject.attackspeedPlayer;
    document.getElementById("step").innerHTML = "Movespeed: " + step;
    document.getElementById("Money").innerHTML = "Currency: " + money;
    document.getElementById("weapon").innerHTML = "Weapon: "+ playerObject.weapon;
}

function savePlayerScore() {
    let playtime = (gameEndTime - gameStartTime) / 1000;
    Username = 'Gast';
    fetch('/verifyLogin', {
        method: 'POST',
        credentials: 'include'
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then((data) => {
        Username = data.username;
        console.log(Username);
        fetch("/submitScore", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
            username: Username,
            score: score,
            time: playtime
        }),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response;
        })
        .catch((fetchError) => {
            console.error('There was a problem with the fetch operation: ', fetchError);
        });
        document.getElementById('score_data').style.display = 'none';
        document.getElementById('leaderRoute').style.display = 'block';
    })
    .catch((fetchError) => {
        console.error('There was a problem with the fetch operation: ', fetchError);
    });
}

function enterName() {
    let name = 'Anonym';
    if (document.getElementById('playerName').value.trim() != "") {
        name=document.getElementById('playerName').value;
    }
    return name;
}

function scoreSystem(type) {
    switch (type) {
        case 'basic': score += 50; break;
        case 'sniper': score += 100; break;
        case 'tank': score += 125; break;
        case 'gunner': score += 150; break;
    }
}

function checkCollision(circle1, circle2) {
    const dx = circle2.x - circle1.x;
    const dy = circle2.y - circle1.y;
    const distanceSquared = (dx * dx) + (dy * dy);
    const radiiSumSquared = (circle1.radius + circle2.radius) * (circle1.radius + circle2.radius);
    return distanceSquared < radiiSumSquared;
}

function areAllProjectilesRendered(projectilesArray) {
  return projectilesArray.every(projectile => projectile.rendered === true);
}


function spawnEnemy() {
    const chosenPos = chooseSpawnerPos();
    const enemyType = chooseEnemy();
    const chosenProjectileType = chooseProjectile(enemyType);
    
    eO = enemyObjects[chosenPos];
    eO.enemyType = enemyType;
    eO.projectileType = chosenProjectileType;
    switch (enemyType) {
            case "basic": eO.enemyHealth =  (playerObject.baseDamage/3) * (playerObject.attackspeedPlayer / 100) * baseHealth +5; eO.reloadSpeed = 1;  eO.projectileSpeed = step+4; break;
            case "sniper": eO.enemyHealth =  (playerObject.baseDamage/3) * (playerObject.attackspeedPlayer / 100) * baseHealth +4; eO.reloadSpeed = 3; eO.projectileSpeed = step+10; break; 
            case "tank": eO.enemyHealth =  (playerObject.baseDamage/3) * (playerObject.attackspeedPlayer / 100) * baseHealth +7; eO.reloadSpeed = 2; eO.projectileSpeed = step+3.5; break;
            case "gunner": eO.enemyHealth =  (playerObject.baseDamage/3) * (playerObject.attackspeedPlayer / 100) * baseHealth +3; eO.reloadSpeed = 0.75; eO.projectileSpeed = step+3; break;

    }
    eO.enemyDamage = 1; // später base damage * total time / 5000 + (playerLevel * 0.3) -> min 1  kp ob das balanced ist xD
    eO.drop = 2 * eO.enemyHealth;// baseDrop * enemyHealth * enemyDamage * attackSpeed
    eO.rendered = true;
    eO.lastTimeShot = Date.now()-(eO.reloadSpeed*1000/2);
}

function chooseSpawnerPos() {
    const availableSpots = [];
    for (let i = 0; i < usedSpawnerPos.length; i++) {
        if (usedSpawnerPos[i] !== 1) {
            availableSpots.push(i);
        }
    }
    if (availableSpots.length === 0) {
        spawnersFull = true;
        return null;
    }
    const randomIndex = Math.floor(Math.random() * availableSpots.length);
    const chosenPos = availableSpots[randomIndex];
    usedSpawnerPos[chosenPos] = 1;
    return chosenPos;
}

var firstSpawned = false;
function chooseEnemy() {
    if (firstSpawned == false) {
        console.log("Returned enemy: basic");
        firstSpawned = true;
        return "basic";
    }
    else {
        var chosenEnemy = Math.floor(Math.random() * enemyBag.length);
        var returnableEnemy = enemyBag[chosenEnemy];
        console.log("Returned enemy: " + returnableEnemy);
        enemyBag.splice(chosenEnemy, 1);
        if (enemyBag.length == 0) {
            enemyBag.push(...enemyBagRefill);
        }
        
        return returnableEnemy;
    }
}

function chooseProjectile(enemyType) {
    switch (enemyType) {
        case "basic":
            if (basicProjectileTypesBag.length == 0) {
                basicProjectileTypesBag.push(...basicProjectileTypes);
            }
            var chosenWeaponIdx = Math.floor(Math.random() * basicProjectileTypesBag.length);
            chosenWeapon = basicProjectileTypesBag[chosenWeaponIdx];
            basicProjectileTypesBag.splice(chosenWeaponIdx, 1);
            return chosenWeapon;

        case "tank":
            if (tankProjectileTypesBag.length == 0) {
                tankProjectileTypesBag.push(...tankProjectileTypes);
            }
            var chosenWeaponIdx = Math.floor(Math.random() * tankProjectileTypesBag.length);
            chosenWeapon = tankProjectileTypesBag[chosenWeaponIdx];
            tankProjectileTypesBag.splice(chosenWeaponIdx, 1);
            return chosenWeapon;

        case "sniper":
            if (sniperProjectileTypesBag.length == 0) {
                sniperProjectileTypesBag.push(...sniperProjectileTypes);
            }
            var chosenWeaponIdx = Math.floor(Math.random() * sniperProjectileTypesBag.length);
            chosenWeapon = sniperProjectileTypesBag[chosenWeaponIdx];
            sniperProjectileTypesBag.splice(chosenWeaponIdx, 1);
            return chosenWeapon;

        case "gunner":
            if (gunnerProjectileTypesBag.length == 0) {
                gunnerProjectileTypesBag.push(...gunnerProjectileTypes);
            }
            var chosenWeaponIdx = Math.floor(Math.random() * gunnerProjectileTypesBag.length);
            chosenWeapon = gunnerProjectileTypesBag[chosenWeaponIdx];
            gunnerProjectileTypesBag.splice(chosenWeaponIdx, 1);
            return chosenWeapon;
    }
}

let nextProjectileId = 0;

function createEnemyProjectile(enemy) {
    // Get the starting position from the enemy
    const startPos = { x: enemy.spawnerPos[0], y: enemy.spawnerPos[1] };
    const targetPos = { x: ring_x, y: ring_y }; // Target the player's current position
    // Calculate the direction vector (a unit vector with length 1)
    const direction = normalizeVector([startPos.x, startPos.y], [targetPos.x, targetPos.y]);

    // Create and return the new projectile object
    const newProjectile = {
        id: `enemy_projectile_${nextProjectileId++}`,
        type: enemy.projectileType,
        movement: chooseEnemyMovement(), // Your existing function
        rendered: true,
        x1: startPos.x,
        y1: startPos.y,
        x2: startPos.x, // For a line projectile, x1/y1 and x2/y2 can be the same
        y2: startPos.y,
        direction: { x: direction[0], y: direction[1] }, // Store direction as an object
        projectileSpeed: enemy.projectileSpeed,
    };
    return newProjectile;
}

function createPlayerProjectile(aimDirection) {
    // Get the calculated damage and speed
    const attributes = getAttributesForProjectile();
    
    // Normalize the aim direction
    const normalizedDir = normalizeVector([0, 0], aimDirection);

    const newProjectile = {
        // FIX #1: Use the global counter for a unique, permanent ID
        id: `player_projectile_${nextProjectileId++}`, 
        
        // FIX #2: Add the missing 'rendered' property
        rendered: true, 

        type: attributes[0],
        movement: attributes[1],
        damage: attributes[2],
        projectileSpeed: attributes[3],
        x1: ring_x,
        y1: ring_y,
        x2: ring_x, // Start x2/y2 at the same position
        y2: ring_y,
        direction: { x: normalizedDir[0], y: normalizedDir[1],  }
    };
    playerProjectiles.push(newProjectile);
    
    // Return the new permanent ID
    return newProjectile.id; 
}

function getAttributesForProjectile() {
    pO = playerObject;
    attributes = calculatePlayerAttributes();
    type = playerProjectileTypes[Math.floor(Math.random()*playerProjectileTypes.length)];
    movement = playerProjectileMovement[Math.floor(Math.random()*playerProjectileMovement.length)];
    return [type,movement,attributes[0],attributes[1]];
}

function calculatePlayerAttributes() {
    pO = playerObject;
    var damageMult;
    var weaponBaseDamage;
    switch (pO.weapon) {
        case "basic": weaponBaseDamage = 1.5; damageMult = 1; projectileSpeed = step+3;break;
        case "sniper": weaponBaseDamage = 2; damageMult = 1.5; projectileSpeed = (step*3)+3; pO.attackspeedPlayer = 400; break;
    }
    damageMult += pO.weaponLevelPlayer/5;

    // crit chance -> currently fixed with 1/5 and 25% more dmg
    if (Math.floor(Math.random() * 10) == 1 || Math.floor(Math.random() * 10) == 10) {
        damageMult += 0.25;
    }

    damage = (pO.baseDamage + weaponBaseDamage) * damageMult;
    return [damage,projectileSpeed];
}

function chooseEnemyMovement() {
    chosenMov = Math.floor(Math.random() * enemyProjectileMovement.length);
    return enemyProjectileMovement[chosenMov];
}

// Projectile: creates svg with given parameters and/or sets position
function moveProjectile(projectile) {
    if (projectile.rendered) {
        // The core movement logic: position += direction * speed
        projectile.x1 += projectile.direction.x * projectile.projectileSpeed;
        projectile.y1 += projectile.direction.y * projectile.projectileSpeed;

        // Update x2 and y2 as well so the line draws correctly
        projectile.x2 = projectile.x1;
        projectile.y2 = projectile.y1;
    }
}

function drawProjectile(projectileId, x1, y1, x2, y2) {
    const svgCanvas = document.getElementById("svgCanvas");
    let projectileElement = document.getElementById(projectileId);

    if (!projectileElement) {
        const svgNamespace = "http://www.w3.org/2000/svg";
        projectileElement = document.createElementNS(svgNamespace, 'line');

        // Set attributes that don't change, like ID and appearance.
        projectileElement.setAttribute('id', projectileId);
        projectileElement.setAttribute('stroke', projectileColor);
        projectileElement.setAttribute('stroke-width', 10);
        projectileElement.setAttribute('stroke-linecap', 'round');

        svgCanvas.appendChild(projectileElement);
    }

    projectileElement.setAttribute('x1', x1);
    projectileElement.setAttribute('y1', y1);
    projectileElement.setAttribute('x2', x2);
    projectileElement.setAttribute('y2', y2);

    projectileElement.style.display = 'block';
}

function renderEnemy() {
    for (let i = 0; i < enemyObjects.length; i++) {
        if (enemyObjects[i].rendered) {
            document.getElementById("enemy_"+(i+1)).style.display = "block";
        }
    }
}

function normalizeVector(startPoint,endPoint) {
  const vectorX = endPoint[0] - startPoint[0];
  const vectorY = endPoint[1] - startPoint[1];

  const magnitude = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

  if (magnitude === 0) {
    return [0,0];
  }

  const directionX = vectorX / magnitude;
  const directionY = vectorY / magnitude;

  return [directionX,directionY];
}

function compare_arrays(a, b) {
    return a.toString() === b.toString();
}

console.log("Starting");
updatePlayerStats();
const gameStartTime = Date.now();
requestAnimationFrame(gameLoop);