const game = document.getElementById('game');
const plane = document.getElementById('plane');
const scoreboard = document.getElementById('scoreboard');
const gameOverText = document.getElementById('gameOver');

const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const shootBtn = document.getElementById('shootBtn');

const gameWidth = 400;
const gameHeight = 600;

let planeX = 180;
const planeWidth = 40;
const planeHeight = 60;

let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let gameOverFlag = false;
let shootingInterval = null;
let level = 1;
let enemySpeed = 2;
let enemySpawnInterval = 2000;


let isDragging = false;
let dragStartX = 0;
let planeStartX = 0;

game.addEventListener('touchstart', e => {
  e.preventDefault();
  isDragging = true;
  dragStartX = e.touches[0].clientX;
  planeStartX = planeX;
});

game.addEventListener('touchmove', e => {
  if (!isDragging) return;
  e.preventDefault();

  const touchX = e.touches[0].clientX;
  const deltaX = touchX - dragStartX;

  planeX = planeStartX + deltaX;
  planeX = Math.max(0, Math.min(gameWidth - planeWidth, planeX));
});

game.addEventListener('touchend', e => {
  e.preventDefault();
  isDragging = false;
});



const keys = {};

// --- KEYBOARD CONTROLS ---
document.addEventListener('keydown', e => {
  keys[e.key] = true;
});
document.addEventListener('keyup', e => {
  keys[e.key] = false;
});

// --- TOUCH CONTROLS ---
let touchLeft = false;
let touchRight = false;

leftBtn.addEventListener('touchstart', e => { e.preventDefault(); touchLeft = true; });
leftBtn.addEventListener('touchend', e => { e.preventDefault(); touchLeft = false; });

rightBtn.addEventListener('touchstart', e => { e.preventDefault(); touchRight = true; });
rightBtn.addEventListener('touchend', e => { e.preventDefault(); touchRight = false; });

// --- SHOOT FUNCTION WITH HOMING BULLET ---
function shoot() {
  if (gameOver) return;

  const bulletEl = document.createElement('div');
  bulletEl.classList.add('bullet');
  game.appendChild(bulletEl);

  const bullet = {
    x: planeX + planeWidth / 2 - 3, // center bullet horizontally on plane
    y: gameHeight - planeHeight,
    dx: 0,
    dy: -7,  // straight up with speed 7 pixels/frame
    el: bulletEl
  };

  bulletEl.style.left = bullet.x + 'px';
  bulletEl.style.top = bullet.y + 'px';

  bullets.push(bullet);
}




function createEnemy() {
  if (gameOver) return;

  const enemy = document.createElement('div');
  const type = Math.random();

  if (type < 0.7) {
    enemy.classList.add('enemy'); // normal enemy
  } else {
    enemy.classList.add('enemy-strong'); // stronger enemy, maybe bigger or faster
  }

  const x = Math.floor(Math.random() * (gameWidth - 40));
  enemy.style.left = x + 'px';
  enemy.style.top = '-40px';
  game.appendChild(enemy);

  enemies.push({
    el: enemy,
    x: x,
    y: -40,
    type: type < 0.7 ? 'normal' : 'strong',
    health: type < 0.7 ? 1 : 2 // set health here
  });
}




// --- COLLISION CHECK ---
function isColliding(a, b) {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

// --- UPDATE GAME STATE ---
function update() {
  if (gameOver) return;

  // Move plane left/right
  if (keys['ArrowLeft'] || keys['a'] || touchLeft) {
    planeX = Math.max(0, planeX - 6);
  }
  if (keys['ArrowRight'] || keys['d'] || touchRight) {
    planeX = Math.min(gameWidth - planeWidth, planeX + 6);
  }
  plane.style.left = planeX + 'px';

  // Move bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].dx;
    bullets[i].y += bullets[i].dy;

    bullets[i].el.style.left = bullets[i].x + 'px';
    bullets[i].el.style.top = bullets[i].y + 'px';

    // Remove off-screen bullets
    if (
      bullets[i].x < 0 || bullets[i].x > gameWidth ||
      bullets[i].y < 0 || bullets[i].y > gameHeight
    ) {
      bullets[i].el.remove();
      bullets.splice(i, 1);
      continue;
    }

    // Collision check with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const dx = bullets[i].x - (enemies[j].x + 20);
      const dy = bullets[i].y - (enemies[j].y + 20);
      if (Math.hypot(dx, dy) < 30) {
        bullets[i].el.remove();
        bullets.splice(i, 1);

        enemies[j].health--;  // reduce health by 1
        if (enemies[j].health <= 0) {
          enemies[j].el.remove();
          enemies.splice(j, 1);
          score++;
          scoreboard.innerText = `Score: ${score}`;
        }
        break;  // bullet can only hit one enemy
      }
    }
  }

  // Move enemies downward (outside bullet loop)
  const enemySpeed = 1.5; // Adjust enemy speed here
  for (let i = enemies.length - 1; i >= 0; i--) {
  enemies[i].y += enemySpeed;
  enemies[i].el.style.top = enemies[i].y + 'px';

  const enemyHeight = 40;
  if (enemies[i].y + enemyHeight >= gameHeight) {
    endGame();
  }
}

}




function endGame() {
  gameOver = true;
  gameOverText.style.display = 'flex';
}


// --- GAME LOOP ---
function gameLoop() {
  update();
  requestAnimationFrame(gameLoop);
}
gameLoop();


// Start auto shooting immediately after game starts:
const autoFireInterval = setInterval(() => {
  if (!gameOver) {
    shoot();
  } else {
    clearInterval(autoFireInterval);
  }
}, 300);  // fires every 300ms, tweak the interval to your liking


// --- BUTTON SHOOT ---
shootBtn.addEventListener('click', () => {
  shoot();
});
setInterval(() => {
  if (!gameOver) createEnemy();
}, 2000);



function triggerGameOver() {
  gameOverFlag = true;
  document.getElementById("gameOver").style.display = "flex";
}


setInterval(() => {
  level++;
  enemySpeed += 0.5;  // speed up enemies
  enemySpawnInterval = Math.max(500, enemySpawnInterval - 200); // spawn faster but min 500ms
  clearInterval(spawnInterval);
  spawnInterval = setInterval(createEnemy, enemySpawnInterval);
  console.log('Level up! Level:', level);
}, 30000);

// Spawn enemies interval
let spawnInterval = setInterval(createEnemy, enemySpawnInterval);



