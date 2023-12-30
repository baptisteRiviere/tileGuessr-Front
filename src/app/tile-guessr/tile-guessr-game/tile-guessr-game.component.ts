import { Time } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Feature, FeatureCollection, Point } from 'geojson';
import { tileLayer, MapOptions, LatLng, LatLngExpression, Circle, LatLngBounds, Rectangle } from 'leaflet';
import { Subject, takeUntil, timer } from 'rxjs';

const SATELLITE_MAP_MIN_ZOOM = 12
const NUMBER_OF_ROUNDS = 5
const MILLISECONDS_IN_A_ROUND = 5000

interface Round {
  latitude: number,
  longitude: number,
  name: string | undefined
}

@Component({
  selector: 'app-tg-map',
  templateUrl: './tile-guessr-game.component.html',
  styleUrls: ['./tile-guessr-game.component.css']
})
export class TileGuessrGameComponent implements OnInit, OnDestroy {
  private rounds: Round[] = []
  private currentRoundIndex: number = -1
  protected readonly title: string = "Tile Guessr"
  protected description: string = "Find the city:"
  protected remainingTime: number = MILLISECONDS_IN_A_ROUND
  private destroyTimer$ = new Subject<void>();
  protected coordinatesToGuess: LatLng = new LatLng(0, 0)
  protected satelliteMapCenter: LatLng = new LatLng(0, 0)
  protected satelliteMaxBounds: LatLngBounds = new LatLngBounds(this.coordinatesToGuess, this.coordinatesToGuess)
  protected materializedBounds: Rectangle = new Rectangle(this.satelliteMaxBounds, {
    fill: false,
    color: 'red'
  })
  protected guessingMarker: Circle = new Circle(new LatLng(0, 0), {
    color: 'red',
    radius: 100
  })
  protected guessingMapMaxBounds = {
    northEast: {
      lat: 90,
      lng: 200
    },
    southWest: {
      lat: -90,
      lng: -200
    }
  }


  protected satelliteMapOptions: MapOptions = {
    layers: [
      tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 18, attribution: '...', subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] })
    ],
    zoom: SATELLITE_MAP_MIN_ZOOM + 2,
    minZoom: SATELLITE_MAP_MIN_ZOOM
  }

  protected guessingMapOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 2,
    center: new LatLng(0, 0),
    minZoom: 2,
    maxZoom: 19,
    keyboard: false,
    zoomControl: false,
  };

  ///////////////////////////////////////////////////////////////////////
  /////// CONSTRUCTOR
  ///////////////////////////////////////////////////////////////////////

  constructor(private cdr: ChangeDetectorRef) { }


  ///////////////////////////////////////////////////////////////////////
  /////// LIFECYCLE HOOKS
  ///////////////////////////////////////////////////////////////////////

  public async ngOnInit() {
    this.currentRoundIndex = -1
    const roundsDrawed = await this.drawRounds()
    if (roundsDrawed) {
      // Starting the game
      this.launchNextRound()
    }
  }

  ngOnDestroy(): void {
    this.destroyTimer$.complete()
  }


  ///////////////////////////////////////////////////////////////////////
  /////// GAME LOGIC METHODS
  ///////////////////////////////////////////////////////////////////////


  private async drawRounds(): Promise<boolean> {
    const response = await fetch('assets/cities.geojson')
    const placesLayer: FeatureCollection = await response.json()
    const places: Feature[] = placesLayer.features

    if (places.length >= NUMBER_OF_ROUNDS) {
      const choosenPlaces = places.sort(() => 0.5 - Math.random()).slice(0, NUMBER_OF_ROUNDS)
      choosenPlaces.forEach((place: Feature) => {
        const coordinates = (place.geometry as Point).coordinates
        const name = place.properties == null ? undefined : place.properties["name"]
        this.rounds.push({
          latitude: coordinates[1],
          longitude: coordinates[0],
          name: name
        })
      })
      return true
    } else {
      return false
    }
  }


  private launchNextRound() {
    this.currentRoundIndex++;

    if (this.currentRoundIndex < this.rounds.length) {
      const currentRound: Round = this.currentRound
      const coordinates = new LatLng(currentRound.latitude, currentRound.longitude)
      const southWest = new LatLng(currentRound.latitude - 0.1, currentRound.longitude - 0.2)
      const northEast = new LatLng(currentRound.latitude + 0.1, currentRound.longitude + 0.2)

      this.satelliteMaxBounds = new LatLngBounds(southWest, northEast)
      this.materializedBounds.setBounds(this.satelliteMaxBounds)
      this.coordinatesToGuess = coordinates.clone()
      this.satelliteMapCenter = coordinates.clone()

      // launching counter
      this.launchCounter()
    }
  }

  private guess(): void {
    if (this.currentRoundIndex < this.rounds.length) {
      const dist = this.guessingMarker.getLatLng().distanceTo(this.coordinatesToGuess)
      const currentRound: Round = this.rounds[this.currentRoundIndex]
      this.description = `You were ${Math.round(dist / 1000)} km from ${currentRound.name}`

      this.launchNextRound()
    } else {
      this.description = 'end of the game'
    }
  }

  ///////////////////////////////////////////////////////////////////////
  /////// TIME MANAGEMENT
  ///////////////////////////////////////////////////////////////////////

  private launchCounter(): void {
    this.remainingTime = MILLISECONDS_IN_A_ROUND
    timer(0, 1000).pipe(takeUntil(this.destroyTimer$)).subscribe(() => {
      if (this.remainingTime <= 0) {
        this.stopCounter()
      } else {
        this.remainingTime -= 1000
      }
    });
  }

  private stopCounter(): void {
    this.destroyTimer$.next();
    this.guess()
  }


  ///////////////////////////////////////////////////////////////////////
  /////// GETTERS
  ///////////////////////////////////////////////////////////////////////


  get currentRound(): Round {
    return this.rounds[this.currentRoundIndex]
  }

  ///////////////////////////////////////////////////////////////////////
  /////// LISTENERS
  ///////////////////////////////////////////////////////////////////////

  protected onGuessingMapClicked(event: { latlng: LatLngExpression; }) {
    this.guessingMarker.setLatLng(event.latlng)
  }

  protected onGuessClicked() {
    this.guess()
  }

  protected onRespawnClicked() {
    this.satelliteMapCenter = this.coordinatesToGuess.clone()
  }

}
