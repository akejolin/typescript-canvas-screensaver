import {State, Iposition} from './engine.types'

export interface ParticleProps {
  ww: number;
  wh: number;
  x: number;
  y: number;
  color: {
    r: string,
    g: string,
    b: string,
    a: string,
  };
  radius: number;
}

export default class Particle {
  x: number;
  vx: number;
  y: number;
  vy: number;
  accX: number;
  accY: number;
  friction: number;
  dest: Iposition;
  originPosition: Iposition;
  color: string;
  radius: number;
  radiusRef: number;
  grow: number;
  delete: boolean;

  constructor(props: ParticleProps) {

  this.x = Math.random() * props.ww;
  this.y = Math.random() * props.wh;

  this.dest = {
    x: props.x,
    y: props.y
  };

    this.originPosition = {
      x: props.x,
      y: props.y
    };

    this.vx = (Math.random() - 0.5) * 20;
    this.vy = (Math.random() - 0.5) * 20;
    this.accX = 0;
    this.accY = 0;
    this.friction = Math.random() * 0.05 + 0.94

    this.color = `rgba(${props.color.r}, ${props.color.g}, ${props.color.b}, ${props.color.a})`
    this.radius = props.radius || Math.random() * 4 + 2
    this.radiusRef = this.radius
    this.grow = 0
    this.delete = false
  }

  destroy() {
    this.delete = true;
  }
  delayedDestroy(milisec: number) {
    return new Promise<void> (resolve => {
      setTimeout(() => {
        this.destroy()
        resolve()
      }, milisec)
    })
  }
  setNewTarget({ x, y }:{x:number, y:number}) {
    this.dest = { x, y, }
  }
  changeRadius() {
    if (this.grow > 0) {
      this.radius = this.radius + 0.1
    } else {
      this.radius = this.radius - 0.1
    }
  }
  render(state:State) {
    const ctx = state.context

    if (!ctx) return;

    //if (this.grow !== this.grow_ref) {
     this.changeRadius()
    //}

    if (this.radius > this.radiusRef) {
      this.grow = -1
    }

    if (this.radius < 1.5) {
      this.grow = 1
    }

    this.accX = (this.dest.x - this.x) / 1000
    this.accY = (this.dest.y - this.y) / 1000
    this.vx += this.accX
    this.vy += this.accY
    this.vx *= this.friction
    this.vy *= this.friction

    this.x += this.vx
    this.y +=  this.vy

    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, Math.PI * 2, 0)
    ctx.fill()
    ctx.closePath()
  }
};