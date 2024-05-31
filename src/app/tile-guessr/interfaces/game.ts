import { FeatureGroup, LatLngBounds } from "leaflet";

export interface IGameMap {
    id: string,
    properties: IGameMapProperties,
    features: FeatureGroup
}

export interface IGameMapProperties {
    name: string,
    desc: string,
    initZoom: number,
    mapMinZoom: number,
    boundSizeInMeters: number,
}

export interface IRound {
  latitude: number,
  longitude: number,
  name: string | undefined,
  initZoom: number,
  mapMinZoom: number,
  boundSizeInMeters: number,
}

export interface IRound2 {
  bounds: LatLngBounds,
  opt: IRoundOption
  name?: string
}

export interface IRoundOption {
  satelliteMapMinZoom: number,
  boundSizeInMeters: number,
  initZoom: number
}

export interface IRoundOption2 {
  initZoom: number,
  satelliteMapMinZoom: number,
  liberties: {
    exceed: boolean,
    move: boolean,
    zoom: boolean
  }
}

export enum GameStatus {
  LOADING, WAITING_FOR_START, PLAYING, RESULT, ENDED, ERROR,
}
