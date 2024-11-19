import { LatLngBounds } from "leaflet";

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
