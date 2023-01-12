// TYPES AND INTERFACES
type Direction = 'top' | 'bottom' | 'left' | 'right';

// CLASSES OR MODELS
class Vector {
  x: number;
  y: number;
  capSpeed: false | Vector = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  data() {
    return { x: this.x, y: this.y };
  }

  add(vector: Vector) {
    this.x += vector.x;
    this.y += vector.y;

    this.capVector();
  }

  mult(vector: Vector) {
    this.x *= vector.x;
    this.y *= vector.y;

    this.capVector();
  }

  cap(vector: Vector | false) {
    this.capSpeed = vector;
  }

  capVector() {
    if (this.capSpeed !== false) {
      if (this.x > this.capSpeed.x) this.x = this.capSpeed.x;
      if (this.x < -this.capSpeed.x) this.x = -this.capSpeed.x;
      if (this.y > this.capSpeed.y) this.y = this.capSpeed.y;
      if (this.y < -this.capSpeed.y) this.y = -this.capSpeed.y;
    }
  }
}

/**
 * Creates an instance of any object that has physical properties i.e position, speed, forces
 */
interface PhysicsObject {
  /** The position vector of the object */
  position: Vector;

  /** The speed vector of the object */
  speed: Vector;

  /** An array of force vectors that are affecting the object */
  forces: Vector[];

  /** A vector indicating the width and length for the object */
  size: Vector;

  /**
   * Upplies the forces of an object upon itself to update its position for one moment in time
   * @param vector A vector force that will be applied to the object.
   */
  applyForce(vector: Vector): void;

  /** Updates the position of the object at one moment in time using its forces. */
  update(): void;

  /** The function to render the object on the canvas */
  render(): void;
}

/**
 * An interface for objects that require interacting with the environment (friction, ground, etc)
 */
interface InteractablePhysicsObject {
  /** Friction applied to an abject */
  friction?: Vector;

  /** The status of whether the object is on a ground or not */
  onGround?: boolean;

  /** Checked whether the object is on the ground */
  isOnGround?(): boolean;
}

/**
 * Interface for player objects
 */
interface PlayerPhysicsObject extends PhysicsObject, InteractablePhysicsObject {
  /** A function to  check if a player is touching an inanimate object */
  // isTouching(inanimate: PhysicsObject): void;

  /** A function to  check if a player is standing ontop of an inanimate object */
  touchingSurface: boolean;

  /** A function that enables the player to jump upwards */
  jump(): void;

  /** A function to move left */
  moveLeft(): void;

  /** A function to move right */
  moveRight(): void;

  /** The direction of the object relative to the player's position */
  relativeDirectionToObject: { [key: number]: Direction };
}

/**
 * Interface for objects that can be used either for players to interact with, or to provide aesthetic effects
 */
interface BlockPhysicsObject extends PhysicsObject, InteractablePhysicsObject {
  id: number;
  color: string;
}

type RelativeDirections = {
  [key in Direction]: boolean;
};

type RelativeDirection = keyof RelativeDirections;

/**
 * Creates a basic physics object instance
 */
class BaseObject implements PhysicsObject {
  position: Vector;
  speed: Vector;
  forces: Vector[];
  size: Vector;

  constructor(position: Vector, speed: Vector = V(0, 0), forces: Vector[] = [], size: Vector = V(10, 10)) {
    this.position = position;
    this.speed = speed;
    this.forces = [...forces];
    this.size = size;
  }

  applyForce(vector: Vector) {
    this.forces.push(vector);
  }

  update() {
    this.forces.forEach((force: Vector) => {
      this.speed.add(force);
    });
    this.position.add(this.speed);
  }

  render() {
    ctx.fillStyle = 'red';
    ctx.fillRect(this.position.x, this.position.y - this.size.y, this.size.x, this.size.y);

    this.update();
  }
}

/**
 * Creates a block object with a color and size and an 'interactable' prop, usually created for the player object to interact with or to add background aesthetics
 */
class BlockObject extends BaseObject implements BlockPhysicsObject {
  id!: number;
  color: string;

  constructor(position: Vector, speed: Vector = V(0, 0), forces: Vector[] = [], size: Vector, color: string = 'black') {
    super(position, speed, forces, size);

    this.color = color;
  }

  render() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y - this.size.y, this.size.x, this.size.y);

    this.update();
  }
}

/**
 * Creates a player instance with functionality like moving around, jumping, etc..
 */
class PlayerObject extends BaseObject implements PlayerPhysicsObject {
  onGround = false;
  friction = V(0.9, 1);
  touchingSurface = false;
  relativeDirectionToObject: { [key: number]: Direction } = {};

  jump() {
    switch (true) {
      case this.touchingSurface || this.onGround:
        this.onGround = false;
        this.touchingSurface = false;
        this.speed.add(V(0, -5));
        break;

      default:
        break;
    }

    console.log(this.relativeDirectionToObject);
  }

  moveLeft() {
    this.speed.add(V(-1, 0));
  }

  moveRight() {
    this.speed.add(V(1, 0));
  }

  isOnGround() {
    return !(this.position.y < HEIGHT);
  }

  isInside(object: BlockObject) {
    const info: RelativeDirections = { top: false, bottom: false, left: false, right: false };

    info['top'] = this.position.y < object.position.y - object.size.y;
    info['bottom'] = this.position.y > object.position.y + this.size.y;
    info['left'] = this.position.x < object.position.x - this.size.x;
    info['right'] = this.position.x > object.position.x + object.size.x;

    let inside = true;
    Object.keys(info).forEach(key => {
      if (info[key as RelativeDirection] == true) {
        this.relativeDirectionToObject[object.id] = key as RelativeDirection;
        inside = false;
      }
    });

    switch (this.relativeDirectionToObject[object.id]) {
      case 'bottom':
        this.touchingSurface = false;
        if (inside) {
          this.speed.mult(V(1, 0));
          this.position.y = object.position.y + this.size.y;
        }
        break;

      case 'left':
        this.touchingSurface = false;
        if (inside) {
          // this.speed.mult(V(0, 1));
          this.speed.x = this.speed.x < 0 ? this.speed.x : 0;
          this.position.x = object.position.x - this.size.x;
        }
        break;

      case 'right':
        this.touchingSurface = false;
        if (inside) {
          // this.speed.mult(V(0, 1));
          this.speed.x = this.speed.x > 0 ? this.speed.x : 0;
          this.position.x = object.position.x + object.size.x;
        }
        break;

      default:
        this.touchingSurface = false;
        break;
    }

    return inside;
  }

  update() {
    // you can have initial casses
    const callbacks: any = {};

    // and you can create new entry with this function
    function add(_case: any, fn: any) {
      callbacks[_case] = callbacks[_case] || [];
      callbacks[_case].push(fn);
    }

    // this function work like switch(value)
    // to make the name shorter you can name it `cond` (like in scheme)
    const pseudoSwitch = (value: any) => {
      try {
        if (callbacks[value]) {
          callbacks[value].forEach(function (fn: any) {
            fn();
            throw {};
          });
        } else {
          this.speed.add(GRAVITY);
        }
      } catch (e) {}
    };

    add(+!(this.position.y < HEIGHT), () => {
      if (this.position.y == HEIGHT) {
        this.onGround = true;
      } else {
        this.position = V(this.position.x, HEIGHT);
        this.speed.mult(V(1, 0));
      }
    });

    inanimateObjects.forEach((object: BlockPhysicsObject) => {
      const inside = this.isInside(object);
      add(+(this.relativeDirectionToObject[object.id] == 'top' && inside), () => {
        if (this.position.y == object.position.y - object.size.y) {
          this.touchingSurface = true;
        } else {
          this.position = V(this.position.x, object.position.y - object.size.y);
          this.speed.mult(V(1, 0));
        }
      });
    });

    pseudoSwitch(1);

    // Add up all the forces
    this.forces.forEach((force: Vector) => {
      this.speed.add(force);
    });

    // Add friction
    this.speed.mult(this.friction);

    // Update position
    this.position.add(this.speed);
  }
}

function V(x: number, y: number) {
  return new Vector(x, y);
}

// GLOBAL VARIABLES
const WIDTH = 500;
const HEIGHT = 500;
const keys: { [key: string]: boolean } = {};
const GRAVITY = V(0, 0.6);

// CANVAS SETTING UP
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

canvas.width = WIDTH;
canvas.height = HEIGHT;

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

function setBackground() {
  ctx.fillStyle = '#1aa7c7';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
}

// LIFECYCLE LOGIC
const physicsObjects: PhysicsObject[] = [];
const inanimateObjects: BlockPhysicsObject[] = [];
const playerPhysicsObjects: PlayerPhysicsObject[] = [];

function registerObject(object: PhysicsObject) {
  physicsObjects.push(object);
}

function registerInanimateObject(object: BlockPhysicsObject) {
  registerObject(object);
  object.id = inanimateObjects.length;
  console.log(object.id);
  inanimateObjects.push(object);
}

function registerPlayer(object: PlayerPhysicsObject) {
  registerObject(object);
  playerPhysicsObjects.push(object);
}

function gameLoop() {
  // Request next frame from browser
  requestAnimationFrame(gameLoop);

  // Move player from key arrows
  movePlayer();

  // Reset frame with background before repainting the frame
  setBackground();

  // // Looping through all players to check interactions
  // playerPhysicsObjects.forEach((player: PlayerPhysicsObject) => {
  //   inanimateObjects.forEach((inanimate: BlockPhysicsObject) => {
  //     player.isTouching(inanimate);
  //     // console.log(isTouching);
  //   });
  // });

  // Looping through all objects to update
  physicsObjects.forEach((object: PhysicsObject) => {
    object.render();
  });
}

// CONTROLS LOGIC
function movePlayer() {
  // check the keys and do the movement.
  if (keys['ArrowLeft']) {
    mainPlayer.moveLeft();
  }
  if (keys['ArrowRight']) {
    mainPlayer.moveRight();
  }
  if (keys['ArrowUp']) {
    mainPlayer.jump();
  }
  if (keys['ArrowDown']) {
  }
}

document.body.addEventListener('keydown', function (e: KeyboardEvent) {
  keys[e.key] = true;
});

document.body.addEventListener('keyup', function (e: KeyboardEvent) {
  keys[e.key] = false;
});

// TESTING
const mainPlayer = new PlayerObject(V(30, 30), V(10, 0));
const block1 = new BlockObject(V(80, HEIGHT), undefined, undefined, V(80, 80));
const block2 = new BlockObject(V(180, HEIGHT - 80), undefined, undefined, V(80, 80));
const block3 = new BlockObject(V(200, HEIGHT - 160), undefined, undefined, V(80, 80));
const block4 = new BlockObject(V(300, HEIGHT - 210), undefined, undefined, V(80, 80));

registerPlayer(mainPlayer);
registerInanimateObject(block1);
registerInanimateObject(block2);
registerInanimateObject(block3);
registerInanimateObject(block4);

gameLoop();
