import React, {useRef} from 'react';
import PropTypes from 'prop-types';


import ParticlesProgram from './particles-program'
import {
  clearAllIntervals,
} from './interval-handler'
import FlexView from '../flex-view'
import { randomNumBetween } from './helpers'

import {CanvasItem, State} from './engine.types'


export interface CanvasItemGroups {
  [key: string]: CanvasItem[]
}

export interface Iprops {}
export interface Particles {

}

class _cls extends React.Component {

  canvas;

  particles: CanvasItem[];
  emojis: string[];
  state: State;

  constructor(props: Iprops) {
    super(props)
    this.canvas = React.createRef<HTMLCanvasElement>();
    this.state = {
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1
      },
      context: null,
      count: 0,
      tilt: 0,
    }
    this.particles = []
    this.run = this.run.bind(this)
    this.emojis = [
      '😜','😍','🙏','👍','✌️',
      '🦊','🐷','🐶','🐱','🐰','🦁','🐯','🐮','🐵','🐌','🐍','🐳','🦋','🦀','🐸','🦄','🐘','👻',
      '🌎','🌏','⭐️','🪐',
      '☀️','🌞','🌙','💧','⚡️','🌈',
      '🔥','💥',
      '🌺','🍀','🌿','🎄','🌵','🌻',
      '🍄','🍇','🍎','🍊','🍌','🌽','🍉','🌶',
      '🍭','🍹','🎂','🧁','🍔','🌭','🍿',
      '🏀','⚽️','🏆','🎺','🎪','☂️','👠',
      '🚕','🚑','🚓','🚒','🚜',
      '🛴','🚲','🕹','🧲','⏰','🔑','❤️','🏖',
    ]
  }
  componentWillMount() {
    this.handleResize()
  }

  componentDidUpdate(prevProps:any, prevState:any, snapshot:any) {
    if (prevState.context !== this.state.context && prevState.context === null) {
      this.run()
    }
  }
  // -----------------------------------------------------
  componentDidMount() {
    const context = this.canvas.current ? this.canvas.current.getContext('2d') : null
    this.setState({ context })
  }

  // -----------------------------------------------------
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    clearAllIntervals()
  }

  run() {
    clearAllIntervals()
    const context = this.state.context
    if (!context) {
      return;
    }
    context.save()
    context.scale(this.state.screen.ratio, this.state.screen.ratio)

    // Motion trail
    context.fillStyle = '#000000'
    context.globalAlpha = 0.4
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height)
    context.globalAlpha = 1
    context.restore()

    requestAnimationFrame(() => this.update())
    window.addEventListener('resize',  () => this.handleResize())
    this.startProgram()
  }

  // -----------------------------------------------------
  handleResize() :void {

    const ratio = window.devicePixelRatio || 1
    const width = window.innerWidth * ratio
    const height = window.innerHeight * ratio

    this.setState({
      screen : {
        width,
        height,
        ratio,
        size: width > 600 ? 'L' : 'S'
      }
    })
  }

  // -----------------------------------------------------
  update() {

    const context = this.state.context
    if (!context) {
      return;
    }
    context.save()
    this.updateObjects(this.particles);
    context.restore()

    // Next frame
    requestAnimationFrame(() => this.update())
  }

  // -----------------------------------------------------
  updateObjects(items:CanvasItem[]) {
    let index = 0;

    for (let item of items) {
      if (item.delete) {
        //this[group].splice(index, 1)
        this.particles.splice(index, 1);
      } else {
        this.particles[index].render(this.state)
      }
      index++
    }
  }

  // -----------------------------------------------------
  startProgram() {
    const text = this.emojis[Math.floor(randomNumBetween(0, this.emojis.length - 1 ))]
    const _particlesProgram = new ParticlesProgram({
      text,
      emojis: this.emojis
    })
    _particlesProgram.init(this.state, text)

    this.createObject(_particlesProgram, 'particles');

  }

  // -----------------------------------------------------
  createObject(item:any, group: string) {
    this.particles.push(item);
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
  // -----------------------------------------------------
  optionClicked() {
    this.deleteAll('particles')
    this.startProgram()
  }

  // -----------------------------------------------------
  render() {
    return (
      <React.Fragment>
          <canvas
            style={{
              display: 'block',
              backgroundColor: 'black',
              color: 'white',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: `100vw`,
              height: `100vh`,
            }}
            ref={this.canvas}
            width={this.state.screen.width}
            height={this.state.screen.height}
          />
          <FlexView style={{position: 'absolute', zIndex: 9, bottom: 10, height: 60}}>
            <button style={{marginBottom: 0}} onClick={this.optionClicked.bind(this)}>New</button>
          </FlexView>
      </React.Fragment>
    )
  }
}

export default _cls