const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

// // 16:9 aspect ratio
// canvas.width = 1024;
// canvas.height = 576;

const gravity = 0.5;

class Player {
  constructor({ imageSrc }) {
    this.speed = 10;
    this.position = {
      x: 100,
      y: 300,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.image = new Image();
    // this.image.onload = () => {};
    this.width = 66;
    this.height = 150;
    this.image.src = imageSrc;
    this.frames = 0;
    this.sprites = {
      stand: {
        right: "./img/spriteStandRight.png",
        left: "./img/spriteStandLeft.png",
        cropWidth: 177,
        width: 66,
      },
      run: {
        right: "./img/spriteRunRight.png",
        left: "./img/spriteRunLeft.png",
        cropWidth: 341,
        width: 127.875,
      },
    };
    this.currentSprite = this.sprites.stand.right;
    this.currentCropWidth = this.sprites.stand.cropWidth;
  }

  draw() {
    // c.fillStyle = "red";
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    c.drawImage(this.image, this.currentCropWidth * this.frames, 0, this.currentCropWidth, 400, this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.frames++;
    if (this.frames > 29) this.frames = 0;
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.y + this.height + this.velocity.y <= canvas.height) this.velocity.y += gravity;
  }
}

class Platform {
  constructor({ x, y, imageSrc }) {
    this.position = {
      x: x,
      y: y,
    };
    this.image = new Image();
    this.image.onload = () => {
      this.width = this.image.width;
      this.height = this.image.height;
    };
    this.image.src = imageSrc;
  }

  draw() {
    // fillrect was a platform before image was added
    // c.fillStyle = "blue";
    // c.fillRect(this.position.x, this.position.y, this.width, this.height);
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

// decoration objects
class GenericObject {
  constructor({ x, y, imageSrc }) {
    this.position = {
      x: x,
      y: y,
    };
    this.image = new Image();
    this.image.onload = () => {
      this.width = this.image.width;
      this.height = this.image.height;
    };
    this.image.src = imageSrc;
  }

  draw() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

let player = new Player({
  imageSrc: "./img/spriteStandRight.png",
});
const platformImageWidth = 580; // console.logged from image width in platform class constructor (spares me initialization of classes before I place them in the array beneath)
const platformSmallTallImageWidth = 291;
let platforms = [];
let genericObjects = [];

const keys = {
  right: {
    pressed: false,
  },
  left: {
    pressed: false,
  },
};

let scrollOffset = 0;

function init() {
  player = new Player({
    imageSrc: "./img/spriteStandRight.png",
  });
  platforms = [
    new Platform({
      x: (platformImageWidth - 3) * 4 + 300 + platformImageWidth - platformSmallTallImageWidth,
      y: 270,
      imageSrc: "./img/platformSmallTall.png",
    }),
    new Platform({
      x: -1,
      y: 470,
      imageSrc: "./img/platform.png",
    }),
    new Platform({
      x: platformImageWidth - 3,
      y: 470,
      imageSrc: "./img/platform.png",
    }),
    new Platform({
      x: (platformImageWidth - 3) * 2 + 100,
      y: 470,
      imageSrc: "./img/platform.png",
    }),
    new Platform({
      x: (platformImageWidth - 3) * 3 + 300,
      y: 470,
      imageSrc: "./img/platform.png",
    }),
    new Platform({
      x: (platformImageWidth - 3) * 4 + 300,
      y: 470,
      imageSrc: "./img/platform.png",
    }),
    new Platform({
      x: (platformImageWidth - 3) * 5 + 900,
      y: 470,
      imageSrc: "./img/platform.png",
    }),
  ];
  genericObjects = [new GenericObject({ x: -1, y: -1, imageSrc: "./img/background.png" }), new GenericObject({ x: -1, y: -1, imageSrc: "./img/hills.png" })];

  scrollOffset = 0;
}

function animate() {
  requestAnimationFrame(animate);

  // fillRect with style "white" instead of clearRect
  // c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "white";
  c.fillRect(0, 0, canvas.width, canvas.height);

  genericObjects.forEach((genericObject) => {
    genericObject.draw();
  });

  platforms.forEach((platform) => {
    platform.draw();
  });

  player.update();

  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = player.speed;
  } else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;

    if (keys.right.pressed) {
      scrollOffset += player.speed;
      platforms.forEach((platform) => {
        platform.position.x -= player.speed;
      });
      genericObjects.forEach((genericObject) => {
        genericObject.position.x -= player.speed * 0.66;
      });
    } else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset -= player.speed;
      platforms.forEach((platform) => {
        platform.position.x += player.speed;
      });
      genericObjects.forEach((genericObject) => {
        genericObject.position.x += player.speed * 0.66;
      });
    }
  }

  platforms.forEach((platform) => {
    // platform collision detection
    if (
      // if the bottom of a jumping player goes past the height of the platform
      player.position.y + player.height <= platform.position.y &&
      // and if the bottom of the player plus the players velocity touches the platform surface
      player.position.y + player.height + player.velocity.y >= platform.position.y &&
      // and if the player is within the width of the platform
      player.position.x + player.width >= platform.position.x && // track left side of platform (right side of player)
      player.position.x <= platform.position.x + platform.width // track right side of platform (left side of player)
    ) {
      player.velocity.y = 0;
    }
  });

  // win condition (player reaches the end of the level)
  if (scrollOffset > (platformImageWidth - 3) * 5 + 600) {
    console.log("You win!");
  }

  // lose condition (player falls off the screen)
  if (player.position.y > canvas.height) {
    init();
  }
}

init();
animate();

window.addEventListener("keydown", ({ code }) => {
  switch (code) {
    case "KeyA":
      keys.left.pressed = true;
      player.width = player.sprites.run.width;
      player.image.src = player.sprites.run.left;
      player.currentCropWidth = player.sprites.run.cropWidth;
      break;
    case "KeyS":
      break;
    case "KeyD":
      keys.right.pressed = true;
      player.width = player.sprites.run.width;
      player.image.src = player.sprites.run.right;
      player.currentCropWidth = player.sprites.run.cropWidth;
      break;
    case "KeyW":
      player.velocity.y -= 15;
      break;
  }
});

window.addEventListener("keyup", ({ code }) => {
  switch (code) {
    case "KeyA":
      keys.left.pressed = false;
      player.width = player.sprites.stand.width;
      player.image.src = player.sprites.stand.left;
      player.currentCropWidth = player.sprites.stand.cropWidth;
      break;
    case "KeyS":
      break;
    case "KeyD":
      keys.right.pressed = false;
      player.width = player.sprites.stand.width;
      player.image.src = player.sprites.stand.right;
      player.currentCropWidth = player.sprites.stand.cropWidth;
      break;
    case "KeyW":
      break;
  }
});
