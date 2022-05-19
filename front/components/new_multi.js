import {Component} from "react";
import Modal from "./ui/modal/modal";
import style from "./engine.module.css";
import Confetti from 'react-dom-confetti';
import Link from 'next/link';
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
let msPerFrame = 1000.0 /70.0;

const numResource = 51;
let resourceLoaded = 0;

let images = {};
let audios = {};
let inputkeys = {" ":false, ArrowLeft:false, ArrowRight:false, up:true};
// let keys= {};
let blocks = [];
let walls = [];
let goals = [];
const speed = 2.7*2;
const gravity = 0.19*2*2;
const globalFriction = 0.992;
const groundFriction = 0.76;
const sideJump = 5.1*2;
const boundFriction = 0.66;
const JumpConst = 15.0;
const chargingConst = 600.0;
const locations = [[200,156], [400,156], [600,156], [800,156]];
const players = [];
let player;
let myIdx;
let level = 0;
let goalLevel = 2;
let levelMax = 0;
// const stomp = this.props.stomp;
// const roomId = this.props.roomId;
// const userInfo = this.props.userInfo;
// const groupInfo = this.props.groupInfo;
let stomp;
let roomId;
let userInfo;
let groupInfo;
let flag = false;
let winner;
let roomSeq;

class Vector
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    normalize()
    {
        let len = this.getLength();

        this.x /= len;
        this.y /= len;
    }

    getLength()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    dot(v)
    {
        return this.x * v.x + this.y * v.y;
    }

    cross(v)
    {
        return this.y * v.x - this.x * v.y;
    }

    add(v)
    {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    sub(v)
    {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    div(v)
    {
        return new Vector(this.x / v, this.y / v);
    }

    mul(v)
    {
        return new Vector(this.x * v, this.y * v);
    }

    equals(v)
    {
        return this.x == v.x && this.y == v.y;
    }
}
class Goal
{
    constructor(level, aabb)
    {
        this.level = level;
        this.aabb = aabb;
    }

    convert()
    {
        return new AABB(this.aabb.x, this.aabb.y + this.level * HEIGHT, this.aabb.width, this.aabb.height);
    }
}
class Wall
{
    constructor(level, x0, y0, wx, wy)
    {
        this.level = level;
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x0 + wx;
        this.y1 = y0 + wy;
        this.wx = wx;
        this.wy = wy;
    }

    checkCollideAABB(aabb, vx, vy)
    {
        let collide =
            this.checkCollide(aabb.x, aabb.y, aabb.x + vx, aabb.y + vy) ? new Vector(aabb.x, aabb.y) :
                this.checkCollide(aabb.X, aabb.y, aabb.X + vx, aabb.y + vy) ? new Vector(aabb.X, aabb.y) :
                    this.checkCollide(aabb.x, aabb.Y, aabb.x + vx, aabb.Y + vy) ? new Vector(aabb.x, aabb.Y) :
                        this.checkCollide(aabb.X, aabb.Y, aabb.X + vx, aabb.Y + vy) ? new Vector(aabb.X, aabb.Y) : undefined;

        if (collide != undefined)
            return { collide, endPoint: false };
        else
        {
            collide =
                aabb.checkCollidePoint(this.x0, this.y0) ? new Vector(this.x0, this.y0) :
                    aabb.checkCollidePoint(this.x1, this.y1) ? new Vector(this.x1, this.y1) : undefined;

            return { collide, endPoint: collide ? true : false }
        }
    }

    checkCollide(ax, ay, bx, by)
    {
        let z0 = (this.x1 - this.x0) * (ay - this.y0) - (this.y1 - this.y0) * (ax - this.x0);
        let z1 = (this.x1 - this.x0) * (by - this.y1) - (this.y1 - this.y0) * (bx - this.x1);

        let z2 = (bx - ax) * (this.y0 - ay) - (by - ay) * (this.x0 - ax);
        let z3 = (bx - ax) * (this.y1 - by) - (by - ay) * (this.x1 - bx);

        return (z0 * z1) < 0 && (z2 * z3) < 0;
    }

    getNormal()
    {
        let res = new Vector(this.y1 - this.y0, this.x0 - this.x1);
        res.normalize();

        return res;
    }

    convert()
    {
        return new Wall(this.level, this.x0, this.y0 + this.level * HEIGHT, this.wx, this.wy);
    }
}

class AABB
{
    constructor(x, y, w, h)
    {
        this.x = x;
        this.y = y;
        this.X = x + w;
        this.Y = y + h;
        this.width = w;
        this.height = h;
    }

    checkCollidePoint(px, py)
    {
        if (px > this.x && px < this.X && py > this.y && py < this.Y)
            return true;
        else
            return false;
    }

    checkCollideBox(aabb)
    {
        let rlb = this.checkCollidePoint(aabb.x, aabb.y);
        let rrb = this.checkCollidePoint(aabb.X, aabb.y);
        let rlt = this.checkCollidePoint(aabb.x, aabb.Y);
        let rrt = this.checkCollidePoint(aabb.X, aabb.Y);

        let res =
        {
            collide: rlb || rrb || rlt || rrt,
            lb: rlb,
            rb: rrb,
            lt: rlt,
            rt: rrt,
        };

        return res;
    }

    move(dx, dy)
    {
        this.x += dx;
        this.y += dy;
        this.X += dx;
        this.Y += dy;
    }
}

class Block
{
    constructor(level, aabb)
    {
        this.level = level;
        this.aabb = aabb;
    }

    convert()
    {
        return new AABB(this.aabb.x, this.aabb.y + this.level * HEIGHT, this.aabb.width, this.aabb.height);
    }
}

class Player
{
    constructor(x, y)
    {
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
        this.radius = this.size / 2.0 * 1.414;
        this.jumpGauge = 0;
        this.keys = {" ":false, ArrowLeft:false, ArrowRight:false};
        this.index = 0;
        this.skin = 1;
    }

    aabb()
    {
        return new AABB(this.x, this.y, this.size, this.size);
    }

    getCenter()
    {
        let res =
        {
            x: this.x + this.size / 2,
            y: this.y + this.size / 2
        }

        return res;
    }

    getDrawImage()
    {
        if (this.crouching)
            return 'crouch';
        else
            return 'normal';
    }

    collideToLeft(w)
    {
        this.x = w;
        this.vx *= -1 * boundFriction;
        audios.bounce.start();
    }

    collideToRight(w)
    {
        this.x = w - this.size;
        this.vx *= -1 * boundFriction;
        audios.bounce.start();
    }

    collideToTop(w)
    {
        this.y = w - this.size;
        this.vy *= -1 * boundFriction;
        audios.bounce.start();
    }

    collideToBottom(w)
    {
        this.onGround = true;
        this.y = w;
        this.vx = 0;
        this.vy = 0;
        if (isTouch)
        {
            this.keys.ArrowLeft = false;
            this.keys.ArrowRight = false;
            this.keys.up= false;
        }
        audios.landing.start();
    }

    collideToWall(s, r)
    {
        this.x = s.x;
        this.y = s.y;
        this.vx = r.x * boundFriction;
        this.vy = r.y;
        audios.bounce.start();
        // this.onGround = false;
    }

    update(delta)
    {

        //Apply previous acceleration
        this.vx *= globalFriction;
        this.vy *= globalFriction;
        if (Math.abs(this.vx) < 0.0001) this.vx = 0;
        if (Math.abs(this.vy) < 0.0001) this.vy = 0;
        this.x += this.vx;
        if(this.vy!=0){
            this.y += this.vy-gravity/2;
        }
        else{
            this.y += this.vy;
        }
        //if (this.x > )
        let c;

        //Calculate current level
        level = Math.trunc(this.y / HEIGHT);
        levelMax = level > levelMax ? level : levelMax;
        
        // let moving = this.vx * this.vx + this.vy + this.vy;
        // let falling = this.vy < 0 ? true : false;
        if (this.keys.ArrowLeft){
            this.direction_L = true
        }else if (this.keys.ArrowRight){
            this.direction_L = false
        }
        if (this.onGround)
        {
            this.vx *= groundFriction;

            if (this.keys[' '] && !this.crouching)
            {
                this.running_R=false
                this.running_L=false
                this.crouching = true;
            }
            else if (this.keys[' '] && this.crouching)
            {
                this.jumpGauge >= 1 ? this.jumpGauge = 1 : this.jumpGauge += delta / chargingConst;
            }
            else if (this.keys.ArrowLeft && !this.crouching)
            {
                c = this.testCollide(-speed, 0);
                this.running_R = false
                this.running_L = true
                this.runningTime += 1
                this.runningTime = this.runningTime%16
                if (c.side == undefined)
                    this.vx = -speed;
                else
                    this.vx = 0;
            }
            else if (this.keys.ArrowRight && !this.crouching)
            {
                this.running_R = true
                this.running_L = false
                this.runningTime += 1
                this.runningTime = this.runningTime%16
                c = this.testCollide(speed, 0);

                if (c.side == undefined)
                    this.vx = speed;
                else
                    this.vx = 0;
            }
            else if (!this.keys[' '] && this.crouching)
            {
                if (this.keys.ArrowLeft) this.vx = -sideJump;
                else if (this.keys.ArrowRight) this.vx = sideJump;
                audios.jump.start();

                this.vy = this.jumpGauge * JumpConst * 2;
                this.jumpGauge = 0;
                this.onGround = false;
                this.crouching = false;
            }
            else if(!this.keys.ArrowRight && !this.keys.ArrowLeft){
                this.running_R=false
                this.running_L=false
                this.runningTime=0
            }
        }

        //Apply gravity
        c = this.testCollide(0, -gravity);
        if (c.side == undefined)
        {
            if(this.vy > -100){
                this.vy -= gravity;
            }
            
            this.onGround = false;
        }

        //Test if current acceleration make collision happen or not 
        c = this.testCollide(this.vx, this.vy);
        if (c.side != undefined)
        {
            if (c.side != 'error')
                this.reponseCollide(c);
        }

    }

    testCollide(nvx, nvy)
    {
        let side;
        let set;

        let box = this.aabb();
        box.move(nvx, nvy);

        if (box.x < 0)
        {
            side = 'left';
            set = 0;
        }
        else if (box.X > WIDTH)
        {
            side = 'right';
            set = WIDTH;
        }
        else if (box.y < 0)
        {
            side = 'bottom';
            set = 0;
        }
        else
        {
            for (let g of goals){
                if(g.level != level) continue;
                if(g.level != goalLevel) continue;
                let aabb = g.convert();
                let r = aabb.checkCollideBox(box);
                if(r.collide)
                {
                    // console.log("Goal!!!!")
                    flag = true;
                    winner = this.index;
                    // console.log('goal!!!', this.index, groupInfo);
                }
            }
            for (let b of blocks)
            {
                if (b.level != level) continue;

                let aabb = b.convert();
                let r = aabb.checkCollideBox(box);

                if (r.collide)
                {
                    if (r.lb && r.lt)
                    {
                        side = 'left';
                        set = aabb.X;
                    }
                    else if (r.rb && r.rt)
                    {
                        side = 'right';
                        set = aabb.x;
                    }
                    else if (r.lb && r.rb)
                    {
                        side = 'bottom';
                        set = aabb.Y;
                    }
                    else if (r.lt && r.rt)
                    {
                        side = 'top';
                        set = aabb.y;
                    }
                    else if (r.lb)
                    {
                        let bx = box.x - this.vx;
                        if (bx > aabb.X)
                        {
                            side = 'left';
                            set = aabb.X;
                        }
                        else
                        {
                            side = 'bottom';
                            set = aabb.Y;
                        }
                    }
                    else if (r.rb)
                    {
                        let bx = box.X - this.vx;
                        if (bx < aabb.x)
                        {
                            side = 'right';
                            set = aabb.x;
                        }
                        else
                        {
                            side = 'bottom';
                            set = aabb.Y;
                        }
                    }
                    else if (r.lt)
                    {
                        let bx = box.x - this.vx;
                        if (bx > aabb.X)
                        {
                            side = 'left';
                            set = aabb.X;
                        }
                        else
                        {
                            side = 'top';
                            set = aabb.y;
                        }
                    }
                    else if (r.rt)
                    {
                        let bx = box.X - this.vx;
                        if (bx < aabb.x)
                        {
                            side = 'right';
                            set = aabb.x;
                        }
                        else
                        {
                            side = 'top';
                            set = aabb.y;
                        }
                    }

                    return { side, set };
                }
            }

            for (let w of walls)
            {
                if (w.level != level) continue;

                w = w.convert();

                let r = w.checkCollideAABB(box, nvx, nvy);

                if (r.collide != undefined)
                {
                    side = 'wall';
                    let nv = new Vector(nvx, nvy);
                    let n;

                    if (!r.endPoint)
                    {
                        let hitPoint = getIntersect(w.x0, w.y0, w.x1, w.y1, r.collide.x, r.collide.y, r.collide.x + nvx, r.collide.y + nvy);

                        set = new Vector(box.x, box.y).add(hitPoint.sub(r.collide));
                        n = w.getNormal();

                    }
                    else
                    {
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

    reponseCollide(c)
    {
        switch (c.side)
        {
            case 'left':
                this.collideToLeft(c.set);
                break;
            case 'right':
                this.collideToRight(c.set);
                break;
            case 'bottom':
                this.collideToBottom(c.set);
                break;
            case 'top':
                this.collideToTop(c.set);
                break;
            case 'wall':
                this.collideToWall(c.set, c.ref);
                break;

        }
    }

    render()
    {
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
              images[`running_${this.skin}_L${parseInt(this.runningTime / 8) + 1}`],
              this.x,
              HEIGHT - this.size - this.y + level * HEIGHT,
              this.size,
              this.size
            );
          } else {
            gfx.drawImage(
              images[`running_${this.skin}_R${parseInt(this.runningTime / 8) + 1}`],
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
// if(userInfo){
//   window.onload = function ()
//   {
//       console.log('load!!!!')
//       socketConnect();
//       init();
//       run();
//   };

// }

// function start(){
//   socketConnect();
//   init();
//   run();
// }

function init()
{
    cvs = document.getElementById("cvs");
    gfx = cvs.getContext("2d");
    gfx.font = "20px Georgia";
    gfx.lineWidth = 2;
    mute = document.getElementById("mute");

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    {
        guideMsg = 'Touch bottom left, right side to move';
        guideMsg2 = 'Touch top left, right, middle side to jump';
    }

    document.onkeydown = keyDown;
    document.onkeyup = keyUp;

    cvs.addEventListener('click', function (e)
    {
        let mousePos = getMousePos(cvs, e);
        let message = mousePos.x + ', ' + mousePos.y;
        // console.log(message);
    }, false);

    // cvs.addEventListener('touchstart', function (e)
    // {
    //     let pos = getTouchPos(cvs, e);

    //     if (pos.x < WIDTH / 2 && pos.y < HEIGHT / 2)
    //     {
    //         keys.ArrowLeft = true;
    //     }
    //     else if (pos.x >= WIDTH / 2 && pos.y < HEIGHT / 2)
    //     {
    //         keys.ArrowRight = true;
    //     }
    //     else if (pos.x < WIDTH / 5 * 2 && pos.y >= HEIGHT / 2)
    //     {
    //         keys[' '] = true;
    //         keys.ArrowLeft = true;
    //     }
    //     else if (pos.x >= WIDTH / 5 * 3 && pos.y >= HEIGHT / 2)
    //     {
    //         keys[' '] = true;
    //         keys.ArrowRight = true;
    //     }
    //     else if (pos.x >= WIDTH / 5 * 2 && pos.x < WIDTH / 5 * 3 && pos.y >= HEIGHT / 2)
    //     {
    //         keys[' '] = true;
    //     }

    //     isTouch = true;
    // }, false);

    // cvs.addEventListener('touchend', function (e)
    // {
    //     if (!keys[' '])
    //     {
    //         keys.ArrowLeft = false;
    //         keys.ArrowRight = false;
    //     }
    //     else
    //         keys[' '] = false;
    // }, false);

    mute.addEventListener('click', function (e)
    {
        isMuted = !isMuted;
    }, false);

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
    images.stage1_bg.src = "/images/STAGE1_bg_multi.png";
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
    images.stage1_bg_before.src = "/images/STAGE1_bg_multi_before.png";
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

    audios.landing.start = function ()
    {
        if (isMuted) return;
        audios.landing.pause();
        audios.landing.currentTime = 0;
        audios.landing.play();
    };
    audios.bounce.start = function ()
    {
        if (isMuted) return;
        audios.bounce.pause();
        audios.bounce.currentTime = 0;
        audios.bounce.play();
    };
    audios.jump.start = function ()
    {
        if (isMuted) return;
        audios.jump.pause();
        audios.jump.currentTime = 0;
        audios.jump.play();
    };
    
    // player = new Player((WIDTH - 32) / 2.0,156);
    // player2 = new Player(833,156);
    // players.push(player);
    // players.push(player2);
    for (var i=0; i < groupInfo.length; i++){
    //   console.log('i!!',i);
        players.push(new Player(locations[i][0],locations[i][1]));
        if(groupInfo[i].skinSeq){
            players[i].skin = groupInfo[i].skinSeq;
        }else{
            players[i].skin = 1
        }
        if(userInfo.userSeq === groupInfo[i].userSeq){            
            myIdx = i;
        }
    }
    // console.log('players',players, 'groupInfo',groupInfo);
    players.push(players[myIdx]);
    groupInfo.push(groupInfo[myIdx]);
    groupInfo.splice(myIdx,1);
    players.splice(myIdx,1);
    myIdx = players.length - 1;
    player = players[myIdx];
    players[myIdx].index = myIdx;
    for (var j=0; j < groupInfo.length-1; j++){
        players[j].index = j;
    }
    // console.log(players);
    initLevels();
}

//Make game levels
function initLevels()
{
    let stagelist = [
        [0,1,2],
        [0,2,1],
        [1,0,2],
        [1,2,0],
        [2,0,1],
        [2,1,0],
    ]
    
    let stages = stagelist[roomSeq%6];
    
    blocks.push(new Block(stages[0], new AABB(0, 100, 400, 34)));
    blocks.push(new Block(stages[0], new AABB(500, 230, 150, 34)));
    blocks.push(new Block(stages[0], new AABB(710, 410, 300, 34)));
    //blocks.push(new Block(stages[0], new AABB(530,530,150,34)))
    blocks.push(new Block(stages[0], new AABB(330, 660, 150, 34)));
    blocks.push(new Block(stages[0], new AABB(70, 620, 150, 34)));
    goals.push(new Block(stages[0], new AABB(388,694,34,34)))

    //walls.push(new Wall(1, 200, 100, 0, 200));
    blocks.push(new Block(stages[1], new AABB(270, 200, 300, 34)));
    blocks.push(new Block(stages[1], new AABB(800, 200, 200, 34)));
    blocks.push(new Block(stages[1], new AABB(700,400, 300,34)))
    blocks.push(new Block(stages[1], new AABB(670, 600, 180, 90)));
    blocks.push(new Block(stages[1], new AABB(200,500,300,34)))
    goals.push(new Block(stages[1], new AABB(746,690,34,34)))
    
    //blocks.push(new Block(stages[1], new AABB(0, 200, 48, 34)));

    //blocks.push(new Block(stages[2], new AABB(130, 10, 100, 45)));
    blocks.push(new Block(stages[2], new AABB(130, 200, 400, 45)));
    blocks.push(new Block(stages[2], new AABB(540, 535, 120, 45)));
    blocks.push(new Block(stages[2], new AABB(800, 615, 120, 45)));
    goals.push(new Block(stages[2], new AABB(838,660,34,34)))
    
}
//플레이어의 위치 스테이지,이동처리가 됐을 때 바뀐 스테이정보, 다른 플레이어 정보(같은 스테이지에 있는), 최고높이는 둘다 가지고 있는게, 유저 토큰, 토큰값도 바꾸고, DB도 바꾸고
//키입력 True False로 가능, while()

function keyDown(e)
{   if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
        inputkeys[e.key] = true;
        // console.log(players);
        // if(player.onGround)
        {
            stomp.send('/pub/play/message',{},JSON.stringify({type:'MOVE',id:userInfo.userSeq, roomCode:roomId,sender:userInfo.userId, space:inputkeys[" "], left:inputkeys['ArrowLeft'], right:inputkeys['ArrowRight'],
                x:players[myIdx].x, y:players[myIdx].y, vx:players[myIdx].vx, vy:players[myIdx].vy}));
            // stomp.send('/pub/play/message',{},JSON.stringify({type:'MOVE',id:userInfo.userSeq, roomCode:roomId,sender:userInfo.userId, message:'keys'}));       
        }

    }
}

function keyUp(e)
{
    if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
        inputkeys[e.key] = false;
        // console.log(keys);
        // if(player.onGround)
        {
            stomp.send('/pub/play/message',{},JSON.stringify({type:'MOVE',id:userInfo.userSeq, roomCode:roomId,sender:userInfo.userId, space:inputkeys[" "], left:inputkeys['ArrowLeft'], right:inputkeys['ArrowRight'],
                x:players[myIdx].x, y:players[myIdx].y, vx:players[myIdx].vx, vy:players[myIdx].vy}));        
            // stomp.send('/pub/play/message',{},JSON.stringify({type:'MOVE',id:userInfo.userSeq, roomCode:roomId,sender:userInfo.userId, message:'keys'})); 
        }

    }
}



function update(delta)
{
    // player2.update(delta);
    players.map(player => player.update(delta));
}

function render()
{
    
    if (resourceLoaded != numResource)
        return;

    gfx.clearRect(0, 0, WIDTH, HEIGHT);

    if (level < levelMax) {
        let stage_bg = `stage${level + 1}_bg`;
    
        gfx.drawImage(images[stage_bg], 0, 0, 1000, 800);
      }else if (level <8){
        let stage_bg = `stage${level + 1}_bg_before`;
    
        gfx.drawImage(images[stage_bg], 0, 0, 1000, 800);
      }
    

    goals.forEach(g =>{
        
        if(g.level != level) return;
        if(g.level != goalLevel) {
            
            return;
        }
        // console.log(g.level)
        drawGoal(g.aabb);
    })

    blocks.forEach(b =>
    {
        if (b.level != level) return;

        drawAABB(b.aabb);
    });

    walls.forEach(w =>
    {
        if (w.level != level) return;

        drawWall(w);
    });
    // player.render();
    // player2.render();
    players.map(player => player.render())
    if (levelMax == 0)
    {
        gfx.fillText("Let's go up!", 550, HEIGHT - 80);
        gfx.fillText(guideMsg, 550, HEIGHT - 45);
        gfx.fillText(guideMsg2, 550, HEIGHT - 25);
    }
    if (level == 7)
    {
        gfx.fillText("Goal!", 880, HEIGHT - 700);
        gfx.fillText("↓", 890, HEIGHT - 680);
        gfx.fillText("Thanks for playing~", 810, HEIGHT - 550);
    }
    
}

function drawWall(wall)
{
    
    gfx.beginPath();
    gfx.moveTo(wall.x0, HEIGHT - wall.y0);
    gfx.lineTo(wall.x1, HEIGHT - wall.y1);
    if(level <levelMax && level >= 3){
        gfx.strokeStyle='white'
    }
    gfx.stroke();
    if(level <levelMax){
        gfx.strokeStyle='black'
    }
}

function drawAABB(aabb)
{
    drawBlock(aabb.x, aabb.y, aabb.width, aabb.height);
}

function drawBlock(x, y, w, h)
{
    
    gfx.beginPath();
    gfx.rect(x, HEIGHT - y, w, -h);
    
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
    if (x==942 && y== 780 && w== Math.trunc(player.jumpGauge * 50)&& h== 12){
        gfx.fillStyle='rgb(255,0,0)'
        gfx.fill();
        gfx.fillStyle='rgb(0,0,0)'
    }
    
    
}

function getMousePos(canvas, evt)
{
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.trunc(evt.clientX - rect.left),
        y: HEIGHT - Math.trunc(evt.clientY - rect.top)
    };
}

function getTouchPos(canvas, evt)
{
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.trunc(evt.touches[0].clientX - rect.left),
        y: HEIGHT - Math.trunc(evt.touches[0].clientY - rect.top)
    };
}

function getIntersect(x1, y1, x2, y2, x3, y3, x4, y4)
{
    let x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    let y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    return new Vector(x, y);
}

function drawGoal(aabb){
    let x = aabb.x;
    let y = aabb.y;
    let w = aabb.width;
    let h = aabb.height;
    gfx.beginPath();
    gfx.rect(x, HEIGHT - y, w, -h);

    gfx.drawImage(images["goal"], x, HEIGHT - y, w, -h);
}

function socketConnect(){
    // stomp.connect({},
    //     function(){
    //         console.log('stomp',stomp.webSocket._transport.url);
    //         const strings = stomp.webSocket._transport.url.split('/');
    //         const sessionId = strings[strings.length-2];
    //         stomp.subscribe(`/sub/room/`+roomId, function(message){
    //             console.log('message',message);
    //             var recv = JSON.parse(message.body);
    //             receiveMessage(recv);
    //         });
    //         stomp.send(`/pub/room/entrance`,{},JSON.stringify({roomCode:roomId, sessionId:sessionId, userSeq:userInfo.userSeq, userId:userInfo.userId}));
    //     },
    //     function(error){
    //         console.log('error', error.headers.message);
    //     }
    // )
    // console.log(stomp);
    stomp.subscribe('/sub/room/' + roomId, function(message){
        // console.log('game Start!!');
        var recv = JSON.parse(message.body);
        receiveMessage(recv);
    })
}

function receiveMessage(msg){
    // console.log('msg',msg);
    // console.log('level!!!',level, levelMax);
    // console.log(players);
    for (var i=0; i<groupInfo.length; i++){
        if(groupInfo[i].userSeq === msg.id){
            if(players[i].x !== msg.x) {
                players[i].x = msg.x;
            }
            if(players[i].y !== msg.y) {
                players[i].y = msg.y;
            }
            const tempKeys = {" ":msg.space, ArrowLeft:msg.left, ArrowRight:msg.right};
            players[i].keys = tempKeys;
            // console.log('x,y!!',players[i].x,players[i].y);
            // console.log('x,y!!!',msg.x, msg.y);
            break;
        }
    }
}

class Engine extends Component {
  constructor(props) {
    super(props);
    stomp = this.props.stomp;
    roomId = this.props.roomId;
    userInfo = this.props.userInfo;
    groupInfo = this.props.groupInfo;
    roomSeq = this.props.roomSeq;
    this.state = {
        modalShow: false
    }
    this.confetti = false;
    
  }

  openModal = () => {
      this.setState({modalShow:true})
      if(myIdx === winner){
          this.confetti = true;
      }
      stomp.send('/pub/play/message',{},JSON.stringify({type:'MOVE',id:groupInfo[winner].userSeq, roomCode:roomId,sender:groupInfo[winner].userId, space:false, left:false, right:false,
      x:players[winner].x, y:players[winner].y, vx:players[winner].vx, vy:players[winner].vy}));
  }

  run(time){
    let currentTime = new Date().getTime();
    passedTime += currentTime - previousTime;
    previousTime = currentTime;

    while (passedTime >= msPerFrame)
    {
        update(msPerFrame);
        render();
        passedTime -= msPerFrame;

        if(flag){
        //   console.log('end!!');
          this.openModal();

          return;
        }
    }

    if(flag){
      
      this.openModal()
    }
    if(!flag){
      requestAnimationFrame(this.run.bind(this));
    }
  }

  componentDidMount() {    
    // console.log(groupInfo);
    socketConnect();
    init();
    this.run();
  }
  
  

  
  render() {
    //Make game levels
    //플레이어의 위치 스테이지,이동처리가 됐을 때 바뀐 스테이정보, 다른 플레이어 정보(같은 스테이지에 있는), 최고높이는 둘다 가지고 있는게, 유저 토큰, 토큰값도 바꾸고, DB도 바꾸고
    //키입력 True False로 가능, while()
    return (
    <>
        <Confetti active={ this.confetti } config={ config }/>
        <canvas id="cvs" width="1000" height="800" />
        
        {this.state.modalShow && <Modal visible={this.state.modalShow}>
            {(myIdx === winner)?<h1 className={style.resultText}>축하합니다!!!</h1>:<h1 className={style.resultText}>아쉽네요ㅠㅠ</h1>}            
            <h2 className={style.resultText}>winner: {groupInfo[winner].userId}</h2>
            <Link href={'/'} passHref>
            <a><h3 className={style.resultText}>Back</h3></a>
            </Link>
        </Modal>}
    </>
    )
  }
}
export default Engine;