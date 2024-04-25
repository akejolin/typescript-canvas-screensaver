export interface Iposition {
    x: number,
    y: number,
  }

  export interface State {
    context: CanvasRenderingContext2D | null,
    screen: {
      width: number,
      height: number,
      ratio: number,
      size?: string;
    },
    count: number,
    tilt: number,
  }