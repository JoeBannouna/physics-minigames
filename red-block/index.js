"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// CLASSES OR MODELS
var Vector = /** @class */ (function () {
    function Vector(x, y) {
        this.capSpeed = false;
        this.x = x;
        this.y = y;
    }
    Vector.prototype.data = function () {
        return { x: this.x, y: this.y };
    };
    Vector.prototype.add = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.capVector();
    };
    Vector.prototype.mult = function (vector) {
        this.x *= vector.x;
        this.y *= vector.y;
        this.capVector();
    };
    Vector.prototype.cap = function (vector) {
        this.capSpeed = vector;
    };
    Vector.prototype.capVector = function () {
        if (this.capSpeed !== false) {
            if (this.x > this.capSpeed.x)
                this.x = this.capSpeed.x;
            if (this.x < -this.capSpeed.x)
                this.x = -this.capSpeed.x;
            if (this.y > this.capSpeed.y)
                this.y = this.capSpeed.y;
            if (this.y < -this.capSpeed.y)
                this.y = -this.capSpeed.y;
        }
    };
    return Vector;
}());
/**
 * Creates a basic physics object instance
 */
var BaseObject = /** @class */ (function () {
    function BaseObject(position, speed, forces, size) {
        if (speed === void 0) { speed = V(0, 0); }
        if (forces === void 0) { forces = []; }
        if (size === void 0) { size = V(10, 10); }
        this.position = position;
        this.speed = speed;
        this.forces = __spreadArray([], forces, true);
        this.size = size;
    }
    BaseObject.prototype.applyForce = function (vector) {
        this.forces.push(vector);
    };
    BaseObject.prototype.update = function () {
        var _this = this;
        this.forces.forEach(function (force) {
            _this.speed.add(force);
        });
        this.position.add(this.speed);
    };
    BaseObject.prototype.render = function () {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.position.x, this.position.y - this.size.y, this.size.x, this.size.y);
        this.update();
    };
    return BaseObject;
}());
/**
 * Creates a block object with a color and size and an 'interactable' prop, usually created for the player object to interact with or to add background aesthetics
 */
var BlockObject = /** @class */ (function (_super) {
    __extends(BlockObject, _super);
    function BlockObject(position, speed, forces, size, color) {
        if (speed === void 0) { speed = V(0, 0); }
        if (forces === void 0) { forces = []; }
        if (color === void 0) { color = 'black'; }
        var _this = _super.call(this, position, speed, forces, size) || this;
        _this.color = color;
        return _this;
    }
    BlockObject.prototype.render = function () {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y - this.size.y, this.size.x, this.size.y);
        this.update();
    };
    return BlockObject;
}(BaseObject));
/**
 * Creates a player instance with functionality like moving around, jumping, etc..
 */
var PlayerObject = /** @class */ (function (_super) {
    __extends(PlayerObject, _super);
    function PlayerObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onGround = false;
        _this.friction = V(0.9, 1);
        _this.touchingSurface = false;
        _this.relativeDirectionToObject = {};
        return _this;
    }
    PlayerObject.prototype.jump = function () {
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
    };
    PlayerObject.prototype.moveLeft = function () {
        this.speed.add(V(-1, 0));
    };
    PlayerObject.prototype.moveRight = function () {
        this.speed.add(V(1, 0));
    };
    PlayerObject.prototype.isOnGround = function () {
        return !(this.position.y < HEIGHT);
    };
    PlayerObject.prototype.isInside = function (object) {
        var _this = this;
        var info = { top: false, bottom: false, left: false, right: false };
        info['top'] = this.position.y < object.position.y - object.size.y;
        info['bottom'] = this.position.y > object.position.y + this.size.y;
        info['left'] = this.position.x < object.position.x - this.size.x;
        info['right'] = this.position.x > object.position.x + object.size.x;
        var inside = true;
        Object.keys(info).forEach(function (key) {
            if (info[key] == true) {
                _this.relativeDirectionToObject[object.id] = key;
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
    };
    PlayerObject.prototype.update = function () {
        var _this = this;
        // you can have initial casses
        var callbacks = {};
        // and you can create new entry with this function
        function add(_case, fn) {
            callbacks[_case] = callbacks[_case] || [];
            callbacks[_case].push(fn);
        }
        // this function work like switch(value)
        // to make the name shorter you can name it `cond` (like in scheme)
        var pseudoSwitch = function (value) {
            try {
                if (callbacks[value]) {
                    callbacks[value].forEach(function (fn) {
                        fn();
                        throw {};
                    });
                }
                else {
                    _this.speed.add(GRAVITY);
                }
            }
            catch (e) { }
        };
        add(+!(this.position.y < HEIGHT), function () {
            if (_this.position.y == HEIGHT) {
                _this.onGround = true;
            }
            else {
                _this.position = V(_this.position.x, HEIGHT);
                _this.speed.mult(V(1, 0));
            }
        });
        inanimateObjects.forEach(function (object) {
            var inside = _this.isInside(object);
            add(+(_this.relativeDirectionToObject[object.id] == 'top' && inside), function () {
                if (_this.position.y == object.position.y - object.size.y) {
                    _this.touchingSurface = true;
                }
                else {
                    _this.position = V(_this.position.x, object.position.y - object.size.y);
                    _this.speed.mult(V(1, 0));
                }
            });
        });
        pseudoSwitch(1);
        // Add up all the forces
        this.forces.forEach(function (force) {
            _this.speed.add(force);
        });
        // Add friction
        this.speed.mult(this.friction);
        // Update position
        this.position.add(this.speed);
    };
    return PlayerObject;
}(BaseObject));
function V(x, y) {
    return new Vector(x, y);
}
// GLOBAL VARIABLES
var WIDTH = 500;
var HEIGHT = 500;
var keys = {};
var GRAVITY = V(0, 0.6);
// CANVAS SETTING UP
var canvas = document.getElementById('canvas');
canvas.width = WIDTH;
canvas.height = HEIGHT;
var ctx = canvas.getContext('2d');
function setBackground() {
    ctx.fillStyle = '#1aa7c7';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
}
// LIFECYCLE LOGIC
var physicsObjects = [];
var inanimateObjects = [];
var playerPhysicsObjects = [];
function registerObject(object) {
    physicsObjects.push(object);
}
function registerInanimateObject(object) {
    registerObject(object);
    object.id = inanimateObjects.length;
    console.log(object.id);
    inanimateObjects.push(object);
}
function registerPlayer(object) {
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
    physicsObjects.forEach(function (object) {
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
document.body.addEventListener('keydown', function (e) {
    keys[e.key] = true;
});
document.body.addEventListener('keyup', function (e) {
    keys[e.key] = false;
});
// TESTING
var mainPlayer = new PlayerObject(V(30, 30), V(10, 0));
var block1 = new BlockObject(V(80, HEIGHT), undefined, undefined, V(80, 80));
var block2 = new BlockObject(V(180, HEIGHT - 80), undefined, undefined, V(80, 80));
var block3 = new BlockObject(V(200, HEIGHT - 160), undefined, undefined, V(80, 80));
var block4 = new BlockObject(V(300, HEIGHT - 210), undefined, undefined, V(80, 80));
registerPlayer(mainPlayer);
registerInanimateObject(block1);
registerInanimateObject(block2);
registerInanimateObject(block3);
registerInanimateObject(block4);
gameLoop();
