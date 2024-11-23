import { Injectable } from '@angular/core';
import { IGameMap, IGameMapProperties } from '../interfaces/game'
import { geoJSON, Layer } from 'leaflet';
import pickRandom from 'pick-random';
import { Point } from 'geojson';
import { IRound, IRoundOption } from '../interfaces/round';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameInitService {

  constructor(private http: HttpClient) { }

  /*
  * Fetch game map and return it as an observable
  */
  public fetchGameMapFromId$(id: string): Observable<IGameMap> {
    return this.http.get(`assets/games/${id}.geojson`).pipe(
      map((res: any) => {
        return {
          id: id,
          properties: res.properties,
          features: geoJSON(res)
        }
      })
      // TODO : handle error
    )
  }

  /*
  * Fetch game map and return its properties as an observable
  */
  public fetchGameMapPropertiesFromId$(id: string): Observable<IGameMapProperties> {
    return this.fetchGameMapFromId$(id)
      .pipe(map((gameMap: IGameMap) => gameMap.properties))
  }

  /*
  * Draw rounds in features
  * 
  * gameMap : game map
  * opt : Default options for a round
  */
  public drawRoundsFromGameMap(
    places: Layer[],
    numberOfRound: number,
    defaultRoundOption: IRoundOption
  ) {
    if (places.length >= numberOfRound) {
      // randomly picking places in features and building rounds from them
      const choosenPlaces = pickRandom(places, { count: numberOfRound })
      return choosenPlaces.map((place) => this.buildRound(place, defaultRoundOption))
    } else {
      throw new Error('Not enough rounds');
    }
  }

  /*
  * Build rounds from place description and options
  *
  */
  private buildRound(place: any, defaultRoundOption: IRoundOption): IRound {
    const coordinates = (place.feature.geometry as Point).coordinates
    const placeProperties = place.feature.properties
    if (placeProperties == undefined) {
      throw new Error('no properties for the given place')
    }
    return {
      latitude: coordinates[1],
      longitude: coordinates[0],
      name: placeProperties["name"] ?? undefined,
      ...placeProperties.roundOptions,
      ...defaultRoundOption
    }
  }
}