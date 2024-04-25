export interface Iposition {
    x: number,
    y: number,
  }
export interface CanvasItem {
    position: Iposition,
    originPosition?: Iposition,
    delete: boolean,
    create: Function,
    render: Function,
    type: string,
    destroy: Function,
    radius: number,
    isInRadar?: boolean,
    radarRadius?: number,
    id?:number,
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