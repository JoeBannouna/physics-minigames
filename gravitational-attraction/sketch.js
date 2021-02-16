const PVector = p5.Vector;

const width = window.innerWidth * 1;
const height = window.innerHeight * 1;

function setup() {
  createCanvas(width, height);
}

// Adapted from Dan Shiffman, natureofcode.com

var Mover = function (x, y) {
  this.position = new PVector(x, y);
  this.velocity = new PVector(0, 0);
  this.acceleration = new PVector(0, 0);
  this.history = [];
};

Mover.prototype.update = function () {
  var mouse = new PVector(mouseX, mouseY);
  var dir = PVector.sub(mouse, this.position);

  // this.gravitationalFieldRadius = new PVector(width, height).mag();
  this.gravitationalFieldRadius = 300;

  // var closeness = (this.gravitationalFieldRadius - dir.mag()) / this.gravitationalFieldRadius;
  var closeness = 1 - map(dir.mag(), 0, this.gravitationalFieldRadius, 0, 1);

  dir.normalize();
  if (PVector.sub(mouse, this.position).mag() > this.gravitationalFieldRadius) {
    dir.mult(0);
  } else {
    dir.mult(closeness * 0.3);
  }
  this.acceleration = dir;
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.gravitationalFieldRadius / 10);
  this.position.add(this.velocity);

  if (this.history.length > 50) {
    this.history.shift();
  }

  this.history.push({ x: this.position.x, y: this.position.y });
};

Mover.prototype.display = function () {
  noStroke();
  fill(255, 0, 0, 30);
  ellipse(mouseX, mouseY, this.gravitationalFieldRadius * 2);

  stroke(0);
  strokeWeight(2);

  fill(127);
  ellipse(this.position.x, this.position.y, 10, 10);
};

Mover.prototype.checkEdges = function () {
  // if (this.position.x > width) {
  //     this.position.x = 0;
  // } else if (this.position.x < 0) {
  //     this.position.x = width;
  // }
  // if (this.position.y > height) {
  //     this.position.y = 0;
  // } else if (this.position.y < 0) {
  //     this.position.y = height;
  // }
};

var mover = new Mover(500, 599);

var draw = function () {
  background(255, 255, 255);

  mover.history.reduce((prevPos, currPos) => {
    prevPos && line(prevPos.x, prevPos.y, currPos.x, currPos.y);

    return currPos;
  }, false);

  mover.update();
  mover.checkEdges();
  mover.display();

  // noStroke();
  fill(255, 200, 0);
  ellipse(mouseX, mouseY, 20);
};
