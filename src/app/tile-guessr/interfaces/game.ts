import { FeatureGroup, LatLngBounds } from "leaflet";
import { IRoundOption } from "./round";

export interface IGameMap {
  id: string,
  properties: IGameMapProperties,
  features: FeatureGroup
}

export interface IGameMapProperties {
  name: string,
  desc: string,
  defaultRoundOptions?: IRoundOption,
}

export enum GameStatus {
  LOADING, WAITING_FOR_START, PLAYING, RESULT, ENDED, ERROR,
}
