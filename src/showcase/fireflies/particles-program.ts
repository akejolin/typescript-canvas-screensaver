import Particle from './particle'
import { randomNumBetween } from './helpers'
import {
  addInterval as aIntv,
  removeInterval,
} from './interval-handler'
import {State} from './engine.types'




const wait = (ms:number) => new Promise<void>(
  resolve => setTimeout(() => {
    clearTimeout(this);
    resolve()
  }, ms)
)

function shuffle(array: Particle[]) {
  var currentIndex = array.length, temporaryValue, randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export interface iProps {
  text: string;
  emojis: string[];
}

export default class ParticlesProgram {
  particles: Particle[];
  preparticles: Particle[];
  text: string;
  type: string;
  hasStarted: boolean;
  tilt: number;
  delete: boolean;
  emojis: string[];

  // ---------------------------------------------------
  constructor(props:iProps) {

    this.particles = []
    this.preparticles = []
    this.text = props.text
    this.type = 'text'
    this.hasStarted = false
    this.tilt = 0
    this.delete = false
    this.emojis = props.emojis
  }
  // ---------------------------------------------------
  getFont(width:number) {
    const fontBase = 1000
    const fontSize = 200
    var ratio = fontSize / fontBase   // calc ratio
    var size = width * ratio   // get font size based on current width
    return (size | 0) + 'px helvetica' // set font
  }
  // ---------------------------------------------------
  async drawText(state: State, text:string) {

    const ctx = state.context
    if (!ctx) {
      return;
    }
    let { width, height } = state.screen
    return new Promise<void>((resolve) => {
      ctx.save()
      ctx.clearRect(0, 0, width, height)
      ctx.font = this.getFont(width)
      ctx.textAlign = "center";
      ctx.fillText(text, width/2, height/2 + 250/2);
      ctx.restore()
      resolve()
    })
  }
  // ---------------------------------------------------
  async createNew(state: State, text:string) {
    const ctx = state.context;
    if (!ctx) {
      return;
    }
    await this.drawText(state, text ? text : this.text)
    let { width, height } = state.screen

    const imageData  = await ctx.getImageData(0, 0, width, height)

    const data = imageData.data
    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = "screen"
    const particles = []

    const getColorIndicesForCoord = (x: number, y: number, width: number) => {
      const red = y * (width * 4) + x * 4;
      return [red, red + 1, red + 2, red + 3];
    };

    const radiusDelta = state.screen.size === 'L' ? state.screen.ratio * 3 : .1

    for (var i=0; i < width; i += Math.round(width/150)) {
      for (var j=0; j < height; j += Math.round(width/150)) {
        const colorIndices = getColorIndicesForCoord(i, j, width);
        const [redIndex, greenIndex, blueIndex, alphaIndex] = colorIndices;
        if (data[ ((i + j * width) * 4) + 3] > 150) {
          particles.push(new Particle({
            x: i,
            y: j,
            ww: width,
            wh: height,
            color: {
              r: `${data[redIndex]}`,
              g: `${data[greenIndex]}`,
              b: `${data[blueIndex]}`,
              a: `${data[alphaIndex]}`
            },
            radius: Math.random() * radiusDelta + 2
          }))
        }
      }
    }
    ctx.restore()
    return particles
  }
  // ---------------------------------------------------
  async init(state:State, text=this.emojis[Math.floor(randomNumBetween(0, this.emojis.length - 1 ))]) {
    this.preparticles = await this.createNew(state, text) || []
    this.startAddParticlesToRender(state)
  }

  // ---------------------------------------------------
  async startAddParticlesToRender(state: State) {
    let { particles, preparticles } = this
    preparticles = shuffle(preparticles)

    let i = preparticles.length
    let maxdelay = 8000


    while (i > 0) {
      i--
      maxdelay = maxdelay > 0 ? maxdelay - 1 : 0
      this.delay(randomNumBetween(0, maxdelay), () => {
        particles.push(preparticles[i])
      })
    }

    wait(10000).then(() => {
      this.newAction(state)
    })

  }
  // ---------------------------------------------------
  async deleteParticlesViaRender(state: State) {
    let { particles } = this
    particles = shuffle(particles)
    let pi = particles.length
    
    let maxdelay = 2000

    const promiseMove = (i:number, d:number) => new Promise<void>(resolve => {
      particles[i].setNewTarget({
        x: particles[i].originPosition.x + randomNumBetween(0 - (particles[i].x + 200), particles[i].x + 200),
        y: particles[i].originPosition.y + randomNumBetween(0 - (particles[i].y + 200), particles[i].y + 200),
      })
      setTimeout(() => resolve(), randomNumBetween(0, d))
    })

    removeInterval('time-to-remove')
    aIntv('time-to-remove', 500, async () => {
      removeInterval('time-to-remove')
      const promises = []
      while (pi > 0) {
        pi = pi - 1
        maxdelay = maxdelay > 0 ? maxdelay - 1 : 0
        promiseMove(pi, 2)
        promises.push(particles[pi].delayedDestroy(randomNumBetween(0, 1000)))
      }
      await Promise.all(promises)
      await wait(500)
      this.init(state)
    })

    // ToDo: something new should happen here
    /*

      this.init(state)

    */

  }


  // -----------------------------------------------------
  deleteAll(group:string) {
    const { particles } = this
    var ip = particles.length
    while (ip > 0 ) {
      ip--
      particles[ip].delete = true
    }
  }

  // ---------------------------------------------------
  delay(ms: number, callback: Function) {
    setTimeout(callback(), ms)
  }
  // ---------------------------------------------------
  newAction(state: State) {

    let particles = this.particles
    let pi = particles.length
    let rounds = 0

    const moveToNewTarget = async () => {
      rounds = rounds + 1
      particles = shuffle(particles)

      const approxFontSize = Math.round(250/2)
      const deltaX = randomNumBetween(Math.round(0 - ((state.screen.width/2) - approxFontSize)), Math.round((state.screen.width/2) - approxFontSize))
      const deltaY = randomNumBetween(Math.round(0 - ((state.screen.height/2) - approxFontSize)), Math.round((state.screen.height/2) - approxFontSize))

      const promiseShape = (i: number, d:number) => new Promise<void>(resolve => {
        particles[i].setNewTarget({
          x: particles[i].originPosition.x + deltaX,
          y: particles[i].originPosition.y + deltaY,
        })
        setTimeout(() => resolve(), randomNumBetween(0, d))
      })
      const promiseMove = (i:number, d:number) => new Promise<void>(resolve => {
        particles[i].setNewTarget({
          x: particles[i].originPosition.x + randomNumBetween(-deltaX, deltaX),
          y: particles[i].originPosition.y + randomNumBetween(-deltaY, deltaY),
        })
        setTimeout(() => resolve(), randomNumBetween(0, d))
      })

      let maxdelay = 8000

      removeInterval('time-to-move')
      aIntv('time-to-move', 500, () => {
        removeInterval('time-to-move')
        pi = particles.length
        while (pi > 0) {
          pi = pi - 1
          maxdelay = maxdelay > 0 ? maxdelay - 1 : 0
          promiseMove(pi, maxdelay)
        }
      })
      removeInterval('time-to-shape')
      aIntv('time-to-shape', 1000, () => {
        removeInterval('time-to-shape')
        pi = particles.length
        while (pi > 0) {
          pi = pi - 1
          maxdelay = maxdelay > 0 ? maxdelay - 1 : 0
          promiseShape(pi, maxdelay)
        }
      })

      removeInterval('time-for-next-round')
      aIntv('time-for-next-round', 15000, () => {
        removeInterval('time-for-next-round')
        if (rounds > 2  ) {
          this.deleteParticlesViaRender(state)
        } else {
          moveToNewTarget()
        }
      })
    }
    moveToNewTarget()
  }
  // ---------------------------------------------------
  setTilt(value:number) {
    this.tilt = value
  }
  // ---------------------------------------------------
  render(state:State) {
    const { width, height } = state.screen
    const ctx = state.context
    if (!ctx) {
      return;
    }

    if (state.tilt !== this.tilt) {
      this.setTilt(state.tilt)
    }

    ctx.clearRect(0, 0, width, height)

    const { particles } = this
    var ip = particles.length
    while (ip > 0 ) {
      ip--
      if (particles[ip].delete === true) {
        particles.splice(ip, 1)
      } else {
        particles[ip].render(state)
      }
    }
  }
}
