import { Component } from "react";
import style from "./engine.module.css";
import Link from 'next/link';
import Modal from "./ui/modal/modal";
import axios from 'axios'
import Confetti from 'react-dom-confetti';
import { forwardRef, useImperativeHandle } from "react";
const config = {
  angle: 90,
  spread: 360,
  startVelocity: 40,
  elementCount: 70,
  dragFriction: 0.12,
  duration: 3000,
  stagger: 3,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

let cvs;
let gfx;
let mute;

const WIDTH = 1000;
const HEIGHT = 800;
const volume = 0.3;
let guideMsg = '[←, →, space] to play';
let guideMsg2 = '';
let isMuted = false;
let isTouch = false;

let d = new Date();
let previousTime = 0;
let currentTime = 0;
let passedTime = 0;
let msPerFrame = 1000.0 /140.0;

const numResource = 51;
let resourceLoaded = 0;
let startTime;
let playingTime;

let images = {};
let audios = {};
let keys = {};
let blocks = [];
let walls = [];
let goals = [];
const speed = 2.7;
const gravity = 0.19;
const globalFriction = 0.996;
const groundFriction = 0.88;
const sideJump = 5.1;
const boundFriction = 0.66;
const JumpConst = 15.0;
const chargingConst = 600.0;
let player;
let userSeq;
let flag = false;
let flag2 = false;
let level = 0;
let levelMax = -1;
let goalLevel = 7;

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  normalize() {
    let len = this.getLength();

    this.x /= len;
    this.y /= len;
  }

  getLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v) {
    return this.y * v.x - this.x * v.y;
  }

  add(v) {
    return new Vector(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new Vector(this.x - v.x, this.y - v.y);
  }

  div(v) {
    return new Vector(this.x / v, this.y / v);
  }

  mul(v) {
    return new Vector(this.x * v, this.y * v);
  }

  equals(v) {
    return this.x == v.x && this.y == v.y;
  }
}
class Goal {
  constructor(level, aabb) {
    this.level = level;
    this.aabb = aabb;
  }

  convert() {
    return new AABB(this.aabb.x, this.aabb.y + this.level * HEIGHT, this.aabb.width, this.aabb.height);
  }
}
class Wall {
  constructor(level, x0, y0, wx, wy) {
    this.level = level;
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x0 + wx;
    this.y1 = y0 + wy;
    this.wx = wx;
    this.wy = wy;
  }

  checkCollideAABB(aabb, vx, vy) {
    let collide = this.checkCollide(aabb.x, aabb.y, aabb.x + vx, aabb.y + vy)
      ? new Vector(aabb.x, aabb.y)
      : this.checkCollide(aabb.X, aabb.y, aabb.X + vx, aabb.y + vy)
      ? new Vector(aabb.X, aabb.y)
      : this.checkCollide(aabb.x, aabb.Y, aabb.x + vx, aabb.Y + vy)
      ? new Vector(aabb.x, aabb.Y)
      : this.checkCollide(aabb.X, aabb.Y, aabb.X + vx, aabb.Y + vy)
      ? new Vector(aabb.X, aabb.Y)
      : undefined;

    if (collide != undefined) return { collide, endPoint: false };
    else {
      collide = aabb.checkCollidePoint(this.x0, this.y0)
        ? new Vector(this.x0, this.y0)
        : aabb.checkCollidePoint(this.x1, this.y1)
        ? new Vector(this.x1, this.y1)
        : undefined;

      return { collide, endPoint: collide ? true : false };
    }
  }

  checkCollide(ax, ay, bx, by) {
    let z0 = (this.x1 - this.x0) * (ay - this.y0) - (this.y1 - this.y0) * (ax - this.x0);
    let z1 = (this.x1 - this.x0) * (by - this.y1) - (this.y1 - this.y0) * (bx - this.x1);

    let z2 = (bx - ax) * (this.y0 - ay) - (by - ay) * (this.x0 - ax);
    let z3 = (bx - ax) * (this.y1 - by) - (by - ay) * (this.x1 - bx);

    return z0 * z1 < 0 && z2 * z3 < 0;
  }

  getNormal() {
    let res = new Vector(this.y1 - this.y0, this.x0 - this.x1);
    res.normalize();

    return res;
  }

  convert() {
    return new Wall(this.level, this.x0, this.y0 + this.level * HEIGHT, this.wx, this.wy);
  }
}
class AABB {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.X = x + w;
    this.Y = y + h;
    this.width = w;
    this.height = h;
  }

  checkCollidePoint(px, py) {
    if (px > this.x && px < this.X && py > this.y && py < this.Y) return true;
    else return false;
  }

  checkCollideBox(aabb) {
    let rlb = this.checkCollidePoint(aabb.x, aabb.y);
    let rrb = this.checkCollidePoint(aabb.X, aabb.y);
    let rlt = this.checkCollidePoint(aabb.x, aabb.Y);
    let rrt = this.checkCollidePoint(aabb.X, aabb.Y);

    let res = {
      collide: rlb || rrb || rlt || rrt,
      lb: rlb,
      rb: rrb,
      lt: rlt,
      rt: rrt,
    };

    return res;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    this.X += dx;
    this.Y += dy;
  }
}
class Block {
  constructor(level, aabb) {
    this.level = level;
    this.aabb = aabb;
  }

  convert() {
    return new AABB(this.aabb.x, this.aabb.y + this.level * HEIGHT, this.aabb.width, this.aabb.height);
  }
}
class Player {
  constructor(x, y) {
    this.direction_L = false;
    this.runningTime = 0;
    this.crouching = false;
    this.running_R = false;
    this.running_L = false;
    this.onGround = true;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.size = 32;
    this.radius = (this.size / 2.0) * 1.414;
    this.jumpGauge = 0;
    this.skin = 3;
  }

  aabb() {
    return new AABB(this.x, this.y, this.size, this.size);
  }

  getCenter() {
    let res = {
      x: this.x + this.size / 2,
      y: this.y + this.size / 2,
    };

    return res;
  }

  getDrawImage() {
    if (this.crouching) return "crouch";
    else return "normal";
  }

  collideToLeft(w) {
    if(this.y+this.vy >=156){
      this.x = w;
    }
    this.vx *= -1 * boundFriction;
    audios.bounce.start();
  }

  collideToRight(w) {
    this.x = w - this.size;
    this.vx *= -1 * boundFriction;
    audios.bounce.start();
  }

  collideToTop(w) {
    this.y = w - this.size;
    this.vy *= -1 * boundFriction;
    audios.bounce.start();
  }

  collideToBottom(w) {
    this.onGround = true;
    this.y = w;
    this.vx = 0;
    this.vy = 0;
    if (isTouch) {
      keys.ArrowLeft = false;
      keys.ArrowRight = false;
    }
    audios.landing.start();
  }

  collideToWall(s, r) {
    this.x = s.x;
    this.y = s.y;
    this.vx = r.x * boundFriction;
    this.vy = r.y;
    audios.bounce.start();
    // this.onGround = false;
  }

  update(delta) {
    //Apply previous acceleration
    this.vx *= globalFriction;
    this.vy *= globalFriction;
    if (Math.abs(this.vx) < 0.0001) this.vx = 0;
    if (Math.abs(this.vy) < 0.0001) this.vy = 0;
    this.x += this.vx;
    if (this.vy != 0) {
      this.y += this.vy - gravity / 2;
    } else {
      this.y += this.vy;
    }
    //if (this.x > )
    let c;

    //Calculate current level
    level = Math.trunc(this.y / HEIGHT);
    levelMax = level > levelMax ? level : levelMax;

    // let moving = this.vx * this.vx + this.vy + this.vy;
    // let falling = this.vy < 0 ? true : false;
    if (keys.ArrowLeft) {
      this.direction_L = true;
    } else if (keys.ArrowRight) {
      this.direction_L = false;
    }
    if (this.onGround) {
      this.vx *= groundFriction;

      if (keys[" "] && !this.crouching) {
        this.running_R = false;
        this.running_L = false;
        this.crouching = true;
      } else if (keys[" "] && this.crouching) {
        this.jumpGauge >= 1 ? (this.jumpGauge = 1) : (this.jumpGauge += delta / chargingConst);
      } else if (keys.ArrowLeft && !this.crouching) {
        c = this.testCollide(-speed, 0);
        this.running_R = false;
        this.running_L = true;
        this.runningTime += 1;
        this.runningTime = this.runningTime % 32;
        if (c.side == undefined) this.vx = -speed;
        else this.vx = 0;
      } else if (keys.ArrowRight && !this.crouching) {
        this.running_R = true;
        this.running_L = false;
        this.runningTime += 1;
        this.runningTime = this.runningTime % 32;
        c = this.testCollide(speed, 0);

        if (c.side == undefined) this.vx = speed;
        else this.vx = 0;
      } else if (!keys[" "] && this.crouching) {
        if (keys.ArrowLeft) this.vx = -sideJump;
        else if (keys.ArrowRight) this.vx = sideJump;
        audios.jump.start();

        this.vy = this.jumpGauge * JumpConst;
        this.jumpGauge = 0;
        this.onGround = false;
        this.crouching = false;
      } else if (!keys.ArrowRight && !keys.ArrowLeft) {
        this.running_R = false;
        this.running_L = false;
        this.runningTime = 0;
      }
    }
    
    // console.log(this.onGround)
    //Apply gravity
    c = this.testCollide(0, -gravity);
    if (c.side == undefined) {
      
      this.vy -= gravity;
      

      this.onGround = false;
    }

    //Test if current acceleration make collision happen or not
    c = this.testCollide(this.vx, this.vy);
    if (c.side != undefined) {
      if (c.side != "error") this.reponseCollide(c);
    }
    if(this.y <156){
      this.collideToBottom(156);
      
    } 
    
  }

  testCollide(nvx, nvy) {
    let side;
    let set;

    let box = this.aabb();
    box.move(nvx, nvy);

    if (box.x < 0) {
      side = "left";
      set = 0;
    } else if (box.X > WIDTH) {
      side = "right";
      set = WIDTH;
    } else if (box.y < 0) {
      side = "bottom";
      set = 0;
    } else {
      for (let g of goals) {
        if (g.level != level) continue;
        if (g.level != goalLevel) continue;
        let aabb = g.convert();
        let r = aabb.checkCollideBox(box);
        if (r.collide) {
          // console.log("Goal!!!!");
          flag = true;
          
        }
      }
      for (let b of blocks) {
        if (b.level != level) continue;

        let aabb = b.convert();
        let r = aabb.checkCollideBox(box);

        if (r.collide) {
          if (r.lb && r.lt) {
            side = "left";
            set = aabb.X;
          } else if (r.rb && r.rt) {
            side = "right";
            set = aabb.x;
          } else if (r.lb && r.rb) {
            side = "bottom";
            set = aabb.Y;
          } else if (r.lt && r.rt) {
            side = "top";
            set = aabb.y;
          } else if (r.lb) {
            let bx = box.x - this.vx;
            if (bx > aabb.X) {
              side = "left";
              set = aabb.X;
            } else {
              side = "bottom";
              set = aabb.Y;
            }
          } else if (r.rb) {
            let bx = box.X - this.vx;
            if (bx < aabb.x) {
              side = "right";
              set = aabb.x;
            } else {
              side = "bottom";
              set = aabb.Y;
            }
          } else if (r.lt) {
            let bx = box.x - this.vx;
            if (bx > aabb.X) {
              side = "left";
              set = aabb.X;
            } else {
              side = "top";
              set = aabb.y;
            }
          } else if (r.rt) {
            let bx = box.X - this.vx;
            if (bx < aabb.x) {
              side = "right";
              set = aabb.x;
            } else {
              side = "top";
              set = aabb.y;
            }
          }

          return { side, set };
        }
      }

      for (let w of walls) {
        if (w.level != level) continue;

        w = w.convert();

        let r = w.checkCollideAABB(box, nvx, nvy);

        if (r.collide != undefined) {
          side = "wall";
          let nv = new Vector(nvx, nvy);
          let n;

          if (!r.endPoint) {
            let hitPoint = getIntersect(
              w.x0,
              w.y0,
              w.x1,
              w.y1,
              r.collide.x,
              r.collide.y,
              r.collide.x + nvx,
              r.collide.y + nvy
            );

            set = new Vector(box.x, box.y).add(hitPoint.sub(r.collide));
            n = w.getNormal();
          } else {
            n = new Vector(w.x0, w.y0).sub(new Vector(w.x1, w.y1));
            n.normalize();
            set = new Vector(box.x, box.y).sub(nv.mul(3));
          }

          let ref = nv.sub(n.mul(2).mul(nv.dot(n)));
          // let ref = nv.sub(n.mul(nv.dot(n)));

          return { side, set, ref };
        }
      }
    }

    return { side, set };
  }

  reponseCollide(c) {
    switch (c.side) {
      case "left":
        this.collideToLeft(c.set);
        break;
      case "right":
        this.collideToRight(c.set);
        break;
      case "bottom":
        this.collideToBottom(c.set);
        break;
      case "top":
        this.collideToTop(c.set);
        break;
      case "wall":
        this.collideToWall(c.set, c.ref);
        break;
    }
  }

  render() {
    
    if (this.running_L == false && this.running_R == false && this.direction_L && !this.crouching) {
      gfx.drawImage(
        images[`running_${this.skin}_L1`],
        this.x,
        HEIGHT - this.size - this.y + level * HEIGHT,
        this.size,
        this.size
      );
    } else if (this.running_L == false && this.running_R == false && this.direction_L && this.crouching) {
      gfx.drawImage(
        images[`running_${this.skin}_L1`],
        this.x,
        HEIGHT - this.size * (1 - this.jumpGauge * 0.2) - this.y + level * HEIGHT,
        this.size,
        this.size * (1 - this.jumpGauge * 0.2)
      );
    } else if (this.running_L == false && this.running_R == false && !this.direction_L && !this.crouching) {
      gfx.drawImage(
        images[`running_${this.skin}_R1`],
        this.x,
        HEIGHT - this.size - this.y + level * HEIGHT,
        this.size,
        this.size
      );
    } else if (this.running_L == false && this.running_R == false && !this.direction_L && this.crouching) {
      gfx.drawImage(
        images[`running_${this.skin}_R1`],
        this.x,
        HEIGHT - this.size * (1 - this.jumpGauge * 0.2) - this.y + level * HEIGHT,
        this.size,
        this.size * (1 - this.jumpGauge * 0.2)
      );
    } else if (this.running_L) {
      gfx.drawImage(
        images[`running_${this.skin}_L${parseInt(this.runningTime / 16) + 1}`],
        this.x,
        HEIGHT - this.size - this.y + level * HEIGHT,
        this.size,
        this.size
      );
    } else {
      gfx.drawImage(
        images[`running_${this.skin}_R${parseInt(this.runningTime / 16) + 1}`],
        this.x,
        HEIGHT - this.size - this.y + level * HEIGHT,
        this.size,
        this.size
      );
    }
    gfx.beginPath();
    gfx.rect(941, HEIGHT - 779, 52, -14);
    gfx.stroke();
    //gfx.fillStyle= 'rgb(0,0,0)'
    drawBlock(942, 780, Math.trunc(player.jumpGauge * 50), 12);
  }
}

function init() {
  axios({
    url:`https://k6a401.p.ssafy.io/api/user/information/`,
    method:'get',
    headers: {
      "Authorization": sessionStorage.getItem("token")
    }
  }).then(res=>{
    // console.log(res.data)
    levelMax = res.data.maxLevel
    userSeq = res.data.userSeq
    // console.log(userSeq)
    // console.log(levelMax)
    if(res.data.skinSeq){
      player.skin = res.data.skinSeq
    }else{
      player.skin = 1
    }
  }).catch(err=>console.error(err))
  
  cvs = document.getElementById("cvs");
  gfx = cvs.getContext("2d");
  
  gfx.font = "20px Georgia";
  gfx.lineWidth = 2;
  mute = document.getElementById("mute");

  // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  //   guideMsg = "Touch bottom left, right side to move";
  //   guideMsg2 = "Touch top left, right, middle side to jump";
  // }

  document.onkeydown = keyDown;
  document.onkeyup = keyUp;

  cvs.addEventListener(
    "click",
    function (e) {
      let mousePos = getMousePos(cvs, e);
      let message = mousePos.x + ", " + mousePos.y;
      // console.log(message);
    },
    false
  );

  cvs.addEventListener(
    "touchstart",
    function (e) {
      let pos = getTouchPos(cvs, e);

      if (pos.x < WIDTH / 2 && pos.y < HEIGHT / 2) {
        keys.ArrowLeft = true;
      } else if (pos.x >= WIDTH / 2 && pos.y < HEIGHT / 2) {
        keys.ArrowRight = true;
      } else if (pos.x < (WIDTH / 5) * 2 && pos.y >= HEIGHT / 2) {
        keys[" "] = true;
        keys.ArrowLeft = true;
      } else if (pos.x >= (WIDTH / 5) * 3 && pos.y >= HEIGHT / 2) {
        keys[" "] = true;
        keys.ArrowRight = true;
      } else if (pos.x >= (WIDTH / 5) * 2 && pos.x < (WIDTH / 5) * 3 && pos.y >= HEIGHT / 2) {
        keys[" "] = true;
      }

      isTouch = true;
    },
    false
  );

  cvs.addEventListener(
    "touchend",
    function (e) {
      if (!keys[" "]) {
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
      } else keys[" "] = false;
    },
    false
  );

  mute.addEventListener(
    "click",
    function (e) {
      isMuted = !isMuted;
    },
    false
  );

  previousTime = new Date().getTime();

  //Images
  images.goal = new Image();
  images.goal.src = "/images/goal.png";
  images.goal.onload = function () {
    resourceLoaded++;
    
  };
  //1
  images.normal = new Image();
  images.normal.src = "/images/normal.png";
  images.normal.onload = function () {
    resourceLoaded++;
  };
  //2
  images.crouch = new Image();
  images.crouch.src = "/images/crouch.png";
  images.crouch.onload = function () {
    resourceLoaded++;
  };
  //3
  images.stage1 = new Image();
  images.stage1.src = "/images/STAGE1.png";
  images.stage1.onload = function () {
    resourceLoaded++;
  };
  //4
  images.stage2 = new Image();
  images.stage2.src = "/images/STAGE2.png";
  images.stage2.onload = function () {
    resourceLoaded++;
  };
  //5
  images.stage3 = new Image();
  images.stage3.src = "/images/STAGE3.png";
  images.stage3.onload = function () {
    resourceLoaded++;
  };
  //6
  images.stage4 = new Image();
  images.stage4.src = "/images/STAGE4.png";
  images.stage4.onload = function () {
    resourceLoaded++;
  };
  //7
  images.stage5 = new Image();
  images.stage5.src = "/images/STAGE5.png";
  images.stage5.onload = function () {
    resourceLoaded++;
  };
  //8
  images.stage6 = new Image();
  images.stage6.src = "/images/STAGE6.png";
  images.stage6.onload = function () {
    resourceLoaded++;
  };
  //9
  images.stage7 = new Image();
  images.stage7.src = "/images/STAGE7.png";
  images.stage7.onload = function () {
    resourceLoaded++;
  };
  //10
  images.stage8 = new Image();
  images.stage8.src = "/images/STAGE8.png";
  images.stage8.onload = function () {
    resourceLoaded++;
  };
  //11
  images.stage1_bg = new Image();
  images.stage1_bg.src = "/images/STAGE1_bg.png";
  images.stage1_bg.onload = function () {
    resourceLoaded++;
  };
  //12
  images.stage2_bg = new Image();
  images.stage2_bg.src = "/images/STAGE2_bg.png";
  images.stage2_bg.onload = function () {
    resourceLoaded++;
  };
  //13
  images.stage3_bg = new Image();
  images.stage3_bg.src = "/images/STAGE3_bg.png";
  images.stage3_bg.onload = function () {
    resourceLoaded++;
  };
  //14
  images.stage4_bg = new Image();
  images.stage4_bg.src = "/images/STAGE4_bg.png";
  images.stage4_bg.onload = function () {
    resourceLoaded++;
  };
  //15
  images.stage5_bg = new Image();
  images.stage5_bg.src = "/images/STAGE5_bg.png";
  images.stage5_bg.onload = function () {
    resourceLoaded++;
  };
  //16
  images.stage6_bg = new Image();
  images.stage6_bg.src = "/images/STAGE6_bg.png";
  images.stage6_bg.onload = function () {
    resourceLoaded++;
  };
  //17
  images.stage7_bg = new Image();
  images.stage7_bg.src = "/images/STAGE7_bg.png";
  images.stage7_bg.onload = function () {
    resourceLoaded++;
  };
  //18
  images.stage8_bg = new Image();
  images.stage8_bg.src = "/images/STAGE8_bg.png";
  images.stage8_bg.onload = function () {
    resourceLoaded++;
  };
  //19
  images.running_1_R1 = new Image();
  images.running_1_R1.src = "/images/1/running_R1.png";
  images.running_1_R1.onload = function () {
    resourceLoaded++;
  };
  //20
  images.running_1_R2 = new Image();
  images.running_1_R2.src = "/images/1/running_R2.png";
  images.running_1_R2.onload = function () {
    resourceLoaded++;
  };
  //21
  images.running_1_L1 = new Image();
  images.running_1_L1.src = "/images/1/running_L1.png";
  images.running_1_L1.onload = function () {
    resourceLoaded++;
  };
  //22
  images.running_1_L2 = new Image();
  images.running_1_L2.src = "/images/1/running_L2.png";
  images.running_1_L2.onload = function () {
    resourceLoaded++;
    
  };
  //23
  images.running_2_R1 = new Image();
  images.running_2_R1.src = "/images/2/running_R1.png";
  images.running_2_R1.onload = function () {
    resourceLoaded++;
  };
  //24
  images.running_2_R2 = new Image();
  images.running_2_R2.src = "/images/2/running_R2.png";
  images.running_2_R2.onload = function () {
    resourceLoaded++;
  };
  //25
  images.running_2_L1 = new Image();
  images.running_2_L1.src = "/images/2/running_L1.png";
  images.running_2_L1.onload = function () {
    resourceLoaded++;
  };
  //26
  images.running_2_L2 = new Image();
  images.running_2_L2.src = "/images/2/running_L2.png";
  images.running_2_L2.onload = function () {
    resourceLoaded++;
    // console.log("loadFinish")
  };
  //27
  images.running_3_R1 = new Image();
  images.running_3_R1.src = "/images/3/running_R1.png";
  images.running_3_R1.onload = function () {
    resourceLoaded++;
  };
  //28
  images.running_3_R2 = new Image();
  images.running_3_R2.src = "/images/3/running_R2.png";
  images.running_3_R2.onload = function () {
    resourceLoaded++;
  };
  //29
  images.running_3_L1 = new Image();
  images.running_3_L1.src = "/images/3/running_L1.png";
  images.running_3_L1.onload = function () {
    resourceLoaded++;
  };
  //30
  images.running_3_L2 = new Image();
  images.running_3_L2.src = "/images/3/running_L2.png";
  images.running_3_L2.onload = function () {
    resourceLoaded++;
    // console.log("loadFinish")
  };
  //31
  images.running_4_R1 = new Image();
  images.running_4_R1.src = "/images/4/running_R1.png";
  images.running_4_R1.onload = function () {
    resourceLoaded++;
  };
  //32
  images.running_4_R2 = new Image();
  images.running_4_R2.src = "/images/4/running_R2.png";
  images.running_4_R2.onload = function () {
    resourceLoaded++;
  };
  //33
  images.running_4_L1 = new Image();
  images.running_4_L1.src = "/images/4/running_L1.png";
  images.running_4_L1.onload = function () {
    resourceLoaded++;
  };
  //34
  images.running_4_L2 = new Image();
  images.running_4_L2.src = "/images/4/running_L2.png";
  images.running_4_L2.onload = function () {
    resourceLoaded++;
    // console.log("loadFinish")
  };
  //35
  images.stage1_before = new Image();
  images.stage1_before.src = "/images/STAGE1_before.png";
  images.stage1_before.onload = function () {
    resourceLoaded++;
  };
  //4
  images.stage2_before = new Image();
  images.stage2_before.src = "/images/STAGE2_before.png";
  images.stage2_before.onload = function () {
    resourceLoaded++;
  };
  //5
  images.stage3_before = new Image();
  images.stage3_before.src = "/images/STAGE3_before.png";
  images.stage3_before.onload = function () {
    resourceLoaded++;
  };
  //6
  images.stage4_before = new Image();
  images.stage4_before.src = "/images/STAGE4_before.png";
  images.stage4_before.onload = function () {
    resourceLoaded++;
  };
  //7
  images.stage5_before = new Image();
  images.stage5_before.src = "/images/STAGE5_before.png";
  images.stage5_before.onload = function () {
    resourceLoaded++;
  };
  //8
  images.stage6_before = new Image();
  images.stage6_before.src = "/images/STAGE6_before.png";
  images.stage6_before.onload = function () {
    resourceLoaded++;
  };
  //9
  images.stage7_before = new Image();
  images.stage7_before.src = "/images/STAGE7_before.png";
  images.stage7_before.onload = function () {
    resourceLoaded++;
  };
  //10
  images.stage8_before = new Image();
  images.stage8_before.src = "/images/STAGE8_before.png";
  images.stage8_before.onload = function () {
    resourceLoaded++;
  };
  //11
  images.stage1_bg_before = new Image();
  images.stage1_bg_before.src = "/images/STAGE1_bg_before.png";
  images.stage1_bg_before.onload = function () {
    resourceLoaded++;
  };
  //12
  images.stage2_bg_before = new Image();
  images.stage2_bg_before.src = "/images/STAGE2_bg_before.png";
  images.stage2_bg_before.onload = function () {
    resourceLoaded++;
  };
  //13
  images.stage3_bg_before = new Image();
  images.stage3_bg_before.src = "/images/STAGE3_bg_before.png";
  images.stage3_bg_before.onload = function () {
    resourceLoaded++;
  };
  //14
  images.stage4_bg_before = new Image();
  images.stage4_bg_before.src = "/images/STAGE4_bg_before.png";
  images.stage4_bg_before.onload = function () {
    resourceLoaded++;
  };
  //15
  images.stage5_bg_before = new Image();
  images.stage5_bg_before.src = "/images/STAGE5_bg_before.png";
  images.stage5_bg_before.onload = function () {
    resourceLoaded++;
  };
  //16
  images.stage6_bg_before = new Image();
  images.stage6_bg_before.src = "/images/STAGE6_bg_before.png";
  images.stage6_bg_before.onload = function () {
    resourceLoaded++;
  };
  //17
  images.stage7_bg_before = new Image();
  images.stage7_bg_before.src = "/images/STAGE7_bg_before.png";
  images.stage7_bg_before.onload = function () {
    resourceLoaded++;
  };
  //18
  images.stage8_bg_before = new Image();
  images.stage8_bg_before.src = "/images/STAGE8_bg_before.png";
  images.stage8_bg_before.onload = function () {
    resourceLoaded++;
  };


  //Audios
  audios.landing = new Audio();
  audios.landing.src = "/audios/landing.wav";
  audios.landing.volume = volume;
  audios.bounce = new Audio();
  audios.bounce.src = "/audios/bounce.wav";
  audios.bounce.volume = volume;
  audios.jump = new Audio();
  audios.jump.src = "/audios/jump2.wav";
  audios.jump.volume = volume;

  audios.landing.start = function () {
    if (isMuted) return;
    audios.landing.pause();
    audios.landing.currentTime = 0;
    audios.landing.play();
  };
  audios.bounce.start = function () {
    if (isMuted) return;
    audios.bounce.pause();
    audios.bounce.currentTime = 0;
    audios.bounce.play();
  };
  audios.jump.start = function () {
    if (isMuted) return;
    audios.jump.pause();
    audios.jump.currentTime = 0;
    audios.jump.play();
  };

  player = new Player((WIDTH - 32) / 2.0, 156);
  
  initLevels();
}

function initLevels() {
  blocks.push(new Block(0, new AABB(0, 0, 1000, 156)));
  blocks.push(new Block(0, new AABB(330, 230, 150, 34)));
  blocks.push(new Block(0, new AABB(710, 410, 116, 34)));
  blocks.push(new Block(0, new AABB(330, 660, 150, 34)));
  blocks.push(new Block(0, new AABB(70, 620, 150, 34)));

  walls.push(new Wall(1, 200, 100, 0, 100));
  blocks.push(new Block(1, new AABB(0, 200, 48, 34)));
  blocks.push(new Block(1, new AABB(530, 200, 60, 34)));
  blocks.push(new Block(1, new AABB(860, 200, 140, 34)));
  blocks.push(new Block(1, new AABB(670, 570, 180, 90)));

  blocks.push(new Block(2, new AABB(130, 10, 100, 45)));
  blocks.push(new Block(2, new AABB(130, 300, 100, 45)));
  blocks.push(new Block(2, new AABB(540, 535, 120, 45)));
  blocks.push(new Block(2, new AABB(800, 615, 120, 45)));

  blocks.push(new Block(3, new AABB(460, 10, 110, 34)));
  blocks.push(new Block(3, new AABB(46, 236, 100, 34)));
  //walls.push(new Wall(3, 300, 280, 0, -34));
  //walls.push(new Wall(3, 300, 400, 0, -34));
  walls.push(new Wall(3, 300, 400, -50, 150));
  walls.push(new Wall(3, 300, 246, -50, -150));
  walls.push(new Wall(3, 480, 550, 350, -52.5));
  //walls.push(new Wall(3, 680, 520, 100, -15));
  blocks.push(new Block(3, new AABB(890, 450, 110, 34)));

  blocks.push(new Block(4, new AABB(390, 10, 90, 34)));
  blocks.push(new Block(4, new AABB(90, 20, 150, 200)));
  blocks.push(new Block(4, new AABB(510, 380, 150, 200)));
  blocks.push(new Block(4, new AABB(850, 715, 150, 85)));

  blocks.push(new Block(5, new AABB(850, 0, 150, 65)));
  blocks.push(new Block(5, new AABB(800, 200, 99, 34)));
  walls.push(new Wall(5, 505, 450, 25, -50));
  walls.push(new Wall(5, 365, 450, -25, -50));
  walls.push(new Wall(5, 340, 400, 0, -100));
  walls.push(new Wall(5, 530, 400, 0, -240));
  blocks.push(new Block(5, new AABB(340, 160, 190, 34)));
  blocks.push(new Block(5, new AABB(50, 160, 80, 34)));
  blocks.push(new Block(5, new AABB(160, 600, 80, 34)));
  blocks.push(new Block(5, new AABB(160, 600, 80, 34)));
  walls.push(new Wall(5, 87, 680, 50, 50));

  walls.push(new Wall(6, 200, 280, 50, -50));
  blocks.push(new Block(6, new AABB(50, 130, 80, 34)));
  walls.push(new Wall(6, 310, 380, 50, 50));
  blocks.push(new Block(6, new AABB(330, 130, 80, 34)));
  blocks.push(new Block(6, new AABB(410, 130, 100, 200)));
  walls.push(new Wall(6, 650, 140, 150, 0));
  blocks.push(new Block(6, new AABB(908, 265, 100, 34)));
  blocks.push(new Block(6, new AABB(500, 444, 150, 200)));
  blocks.push(new Block(6, new AABB(50, 650, 100, 34)));

  blocks.push(new Block(7, new AABB(100, 300, 100, 34)));
  blocks.push(new Block(7, new AABB(520, 430, 100, 34)));
  blocks.push(new Block(7, new AABB(877, 600, 100, 34)));
  walls.push(new Wall(7, 715, 430, 0, 300));
  goals.push(new Block(7, new AABB(877, 634, 100, 34)));
  startTime = new Date();
}

function keyDown(e) {
  keys[e.key] = true;
  // console.log(e);
}

function keyUp(e) {
  keys[e.key] = false;
}

// function run(time) {
  
//   let currentTime = new Date().getTime();
//   passedTime += currentTime - previousTime;
//   previousTime = currentTime;
//   playingTime.innerText = `${parseInt((currentTime - startTime) / 1000)}초`;
//   while (passedTime >= msPerFrame) {
//     update(msPerFrame);
    
//     rendering();
    
//     passedTime -= msPerFrame;
//     if(flag){
//       //console.log("goal!@#!@#!@#")
//       return;
//     }
//   }
//   if(!flag){
//     requestAnimationFrame(run);
//   }
// }

function update(delta) {

  player.update(delta);
}

function rendering() {
  
  if ( numResource>resourceLoaded || resourceLoaded%numResource!=0 || levelMax==-1) return;
  
  gfx.clearRect(0, 0, WIDTH, HEIGHT);
  
  if (level < levelMax) {
    let stage_bg = `stage${level + 1}_bg`;

    gfx.drawImage(images[stage_bg], 0, 0, 1000, 800);
  }else if (level <8){
    let stage_bg = `stage${level + 1}_bg_before`;

    gfx.drawImage(images[stage_bg], 0, 0, 1000, 800);
  }

  goals.forEach((g) => {
    if (g.level != level) return;
    if (g.level != goalLevel) return;
    drawGoal(g.aabb);
  });

  blocks.forEach((b) => {
    if (b.level != level) return;

    drawAABB(b.aabb);
  });

  walls.forEach((w) => {
    if (w.level != level) return;

    drawWall(w);
  });
  
  player.render();
}

function drawWall(wall) {
  gfx.beginPath();
  gfx.moveTo(wall.x0, HEIGHT - wall.y0);
  gfx.lineTo(wall.x1, HEIGHT - wall.y1);
  if (level < levelMax || level >= 3) {
    gfx.strokeStyle = "white";
  }
  gfx.stroke();
  if (level < levelMax) {
    gfx.strokeStyle = "black";
  }
}
function drawGoal(aabb) {
  let x = aabb.x;
  let y = aabb.y;
  let w = aabb.width;
  let h = aabb.height;
  gfx.beginPath();
  gfx.rect(x, HEIGHT - y, w, -h);

  gfx.drawImage(images["goal"], x, HEIGHT - y, w, -h);
}
function drawAABB(aabb) {
  drawBlock(aabb.x, aabb.y, aabb.width, aabb.height);
}

function drawBlock(x, y, w, h) {
  gfx.beginPath();
  gfx.rect(x, HEIGHT - y, w, -h);
  if (level>=8){
    return
  }
  if (level < levelMax) {
    let stage = `stage${level + 1}`;
    //console.log(stage)
    if (level == 0 && x == 0 && y == 0) {
    } else {
      gfx.drawImage(images[stage], x, HEIGHT - y, w, -h);
    } //gfx.fillStyle = 'rgb(255,221,0)'
  } else {
    if (level == 0 && x == 0 && y == 0) {
    } else {
      let stage = `stage${level + 1}_before`;
      gfx.drawImage(images[stage], x, HEIGHT - y, w, -h);
    }
    
  }
  if (x == 942 && y == 780 && w == Math.trunc(player.jumpGauge * 50) && h == 12) {
    gfx.fillStyle = "rgb(255,0,0)";
    gfx.fill();
    gfx.fillStyle = "rgb(0,0,0)";
  }
}
function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
    
  // player.x=927;
  // player.y =695+7*HEIGHT;
  return {
    x: Math.trunc(evt.clientX - rect.left),
    y: HEIGHT - Math.trunc(evt.clientY - rect.top),
    
  };
}
function getTouchPos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();
  return {
    x: Math.trunc(evt.touches[0].clientX - rect.left),
    y: HEIGHT - Math.trunc(evt.touches[0].clientY - rect.top),
  };
}
function getIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  let x =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  let y =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
    ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

  return new Vector(x, y);
}


class Engine extends Component {

  constructor(props) {
    super(props);
    this.state = {
      Modalshow:false,
      currentTime:null,
    }
    this.confetti=false;
    
  }
  
  reset() {
    // console.log("reset??")
    player.x = (WIDTH - 32) / 2.0
    player.y = 156
  }
  
  componentDidMount() {
    // console.log("onload");
    
    init();
    //// console.log(sessionStorage,"sessionStorage")
    playingTime = document.getElementById("time");
    
    this.run();

    axios({
      url:`https://k6a401.p.ssafy.io/api/single/entrance`,
      method:'POST'
    }).then(res=>console.log(res))
    .catch(err=>console.error(err))
  }
  openModal = () => {
    // // console.log("abcd")
    // console.log(userSeq)
    // console.log(levelMax)
    
    axios({
      url:`https://k6a401.p.ssafy.io/api/single/record/`,
      method:'POST',
      headers: {
        "Authorization": sessionStorage.getItem("token")
      },
      data:{
        "maxLevel":levelMax,
        "userSeq": userSeq,
        "record":this.currentTime-startTime,
      }
    }).then(res=>{
      // console.log(res)
      
    }).catch(err=>console.error(err))
    this.setState({Modalshow:true})
    this.confetti=true;
  }
  closeModal = () => {
    this.setState({ Modalshow:false})
  }
  refresh () {
    
    location.reload();
  }
  
  componentWillUnmount() {
    flag2 = true
    axios({
      url:`https://k6a401.p.ssafy.io/api/single/record/`,
      method:'POST',
      headers: {
        "Authorization": sessionStorage.getItem("token")
      },
      data:{
        "maxLevel":levelMax,
        "userSeq": userSeq,
        "record": 0,
        
      }
    }).then(res=>{
      // console.log(res)
      
    }).catch(err=>console.error(err))
  }
  
  
  
  run(time) {
  
    this.currentTime = new Date().getTime();
    passedTime += this.currentTime - previousTime;
    previousTime = this.currentTime;
    playingTime.innerText = `${parseInt((this.currentTime - startTime) / 1000)}초`;
    while (passedTime >= msPerFrame) {
      update(msPerFrame);
      rendering();
      passedTime -= msPerFrame;
      if(flag2){
        return;
      }
      if(flag){
        // console.log(startTime)
        levelMax = 8
        this.openModal()
        
        return;
      }
    }
    if(flag){
      
      this.openModal()
    }
    if(!flag&&!flag2){
      requestAnimationFrame(this.run.bind(this));
    }
  }
  
  render() {
    //Make game levels
    //플레이어의 위치 스테이지,이동처리가 됐을 때 바뀐 스테이정보, 다른 플레이어 정보(같은 스테이지에 있는), 최고높이는 둘다 가지고 있는게, 유저 토큰, 토큰값도 바꾸고, DB도 바꾸고
    //키입력 True False로 가능, while()
    return (
      <div>
        <canvas id="cvs" width="1000" height="800" />
        <div className={style.buttons}>
          <a className={style.h3button} onClick={()=>{
            // console.log("reset?")
            this.reset()
          }}><h3 className={style.replayBtn}>Reset</h3></a>
          <Link href={'/'} passHref>
            <a className={style.h3button}><h3>Back</h3></a>
          </Link>
        </div>
        <Modal visible={this.state.Modalshow}> 
        <Confetti active={ this.confetti } config={ config }/>
          <h1 className={style.resultText}>축하합니다!!!</h1>
          <h2 className={style.resultText}>{parseInt((this.currentTime - startTime)/60000)}분 {parseInt(((this.currentTime - startTime)%60000)/1000)}초 {parseInt(((this.currentTime - startTime)%1000)/10)}</h2>
          <Link href={''} passHref>
            <a onClick={this.refresh}><h3 className={style.resultText}>Replay</h3></a>
          </Link>
          <Link href={'/'} passHref>
            <a><h3 className={style.resultText}>Back</h3></a>
          </Link> 
        </Modal>
      </div>
    )
      
  }
}
export default Engine;