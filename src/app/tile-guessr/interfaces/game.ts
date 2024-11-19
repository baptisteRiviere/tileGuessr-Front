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

export enum GameStatus {
  LOADING, WAITING_FOR_START, PLAYING, RESULT, ENDED, ERROR,
}
