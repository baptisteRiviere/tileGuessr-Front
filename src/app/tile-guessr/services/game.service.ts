import { Injectable } from '@angular/core';
import { IGameMap, IGameMapProperties } from '../interfaces/game'
import { geoJSON } from 'leaflet';
import pickRandom from 'pick-random';
import { Point } from 'geojson';
import { IRound, IRoundOption } from '../interfaces/round';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  /*
  * Fetch game map and return it as an observable
  */
  public fetchGameMapFromId$(id: string): Observable<IGameMap> {
    return this.http.get(`assets/${id}.geojson`).pipe(
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
    gameMap: IGameMap,
    numberOfRound: number,
    opt: IRoundOption
  ) {
    // init result
    let choosenRounds: IRound[] = []

    // checking number of features
    let places = gameMap.features.getLayers()
    if (places.length >= numberOfRound) {
      // randomly picking places in features 
      const choosenPlaces = pickRandom(places, { count: numberOfRound })
      choosenPlaces.forEach((place: any) => {
        // TODO : as any...
        const coordinates = (place.feature.geometry as Point).coordinates
        const name = place.feature.properties == null ? undefined : place.feature.properties["name"]
        const mapMinZoom = place.feature?.properties["mapMinZoom"] == null ?
          opt.satelliteMapMinZoom :
          place.feature.properties["mapMinZoom"]
        const boundSizeInMeters = place.feature?.properties["boundSizeInMeters"] == null ?
          opt.boundSizeInMeters :
          place.feature.properties["boundSizeInMeters"]
        const initZoom = place.feature?.properties["initZoom"] == null ?
          opt.initZoom :
          place.feature.properties["initZoom"]
        choosenRounds.push({
          latitude: coordinates[1],
          longitude: coordinates[0],
          name: name,
          mapMinZoom: mapMinZoom,
          initZoom: initZoom,
          boundSizeInMeters: boundSizeInMeters
        })
      })
      return choosenRounds
    } else {
      throw new Error('Not enough rounds');
    }

  }
}