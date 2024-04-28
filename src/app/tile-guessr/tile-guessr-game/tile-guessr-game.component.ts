import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Point } from 'geojson';
import { tileLayer, MapOptions, LatLng, LatLngExpression, Circle, LatLngBounds, Rectangle, FeatureGroup, geoJSON, Layer, PathOptions, CircleOptions, Polyline, PolylineOptions, CircleMarker } from 'leaflet';
import pickRandom from 'pick-random';
import { Subject, takeUntil, timer } from 'rxjs';

// Constants for messages
const DEFAULT_LOADING_DESCRIPTION = "Loading game"
const DEFAULT_STARTING_DESCRIPTION = "Are you ready ?"
const DEFAULT_PLAYING_DESCRIPTION = "Where is this location ?"

// Constants for mapping
const DEFAULT_BOUND_SIZE_IN_METERS = 10000
const DEFAULT_SATELLITE_MAP_MIN_ZOOM = 13
const DEFAULT_INIT_ZOOM = 16
const DEFAULT_NUMBER_OF_ROUNDS = 5
const DEFAULT_MILLISECONDS_IN_A_ROUND = 1000 * 60 * 3
const DEFAULT_SATELLITE_MAX_ZOOM = 21
const DEFAULT_GUESSING_MAP_MIN_ZOOM = 20

// Constants for score management
const MAX_SCORE_FOR_DIST = 800 // max score reachable 
const COEF_DIST = 0.8 // this means that player will have 0 points for dist if the guess is more than 0.8 * max bounds 
const MAX_SCORE_FOR_TIME = 200
const MIN_TIME_MS = 5000 // Minimum time to guess for having the max amount of points
const COEF_TIME = 0.8 // this means that player will have 0 points for time if the guess is more than 0.8 * the accorded time

// Game status
const GameStatus = {
  LOADING: "LOADING",
  WAITING_FOR_START: "WAITING_FOR_START",
  PLAYING: "PLAYING",
  RESULT: "RESULT",
  ENDED: "ENDED",
  ERROR: "ERROR"
}

const DEFAULT_RECTANGLE_STYLE: PathOptions = {
  fill: false,
  color: 'red'
}
const FOUNDED_TILE_RECTANGLE_STYLE: PathOptions = {
  color: "#55ff33",
  fill: true,
  fillColor: "#a3ee95",
  opacity: 0.75
}
const NOT_FOUNDED_TILE_RECTANGLE_STYLE: PathOptions = {
  color: "#f88958",
  fill: true,
  fillColor: "#f88958",
  opacity: 0.75
}
const GUESSING_MARKER_OPTIONS: CircleOptions = {
  color: 'blue',
  radius: 8
}
const RESULT_LINE_OPTIONS: PolylineOptions = {
  color: 'gray',
  weight: 3,
  dashArray: '10, 10',
  opacity: .9
}

interface Round {
  latitude: number,
  longitude: number,
  name: string | undefined,
  initZoom: number,
  mapMinZoom: number,
  boundSizeInMeters: number,
}

@Component({
  selector: 'app-tg-map',
  templateUrl: './tile-guessr-game.component.html',
  styleUrls: ['./tile-guessr-game.component.css', '../tile-guessr-game.buttonSyle.css']
})
export class TileGuessrGameComponent implements OnInit, OnDestroy {
  private rounds: Round[] = []
  private destroyTimer$ = new Subject<void>();
  protected roundScore: number = 0
  protected gameScore: number = 0
  protected currentRoundIndex: number = -1
  protected description: string = DEFAULT_LOADING_DESCRIPTION
  protected remainingTime: number = DEFAULT_MILLISECONDS_IN_A_ROUND
  protected gameStatus: string = GameStatus.LOADING
  protected coordinatesToGuess: LatLng = new LatLng(0, 0)
  protected satelliteMapCenter: LatLng = new LatLng(0, 0)
  protected satelliteMaxBounds: LatLngBounds = new LatLngBounds(this.coordinatesToGuess, this.coordinatesToGuess)
  protected satelliteMapZoom: number = DEFAULT_INIT_ZOOM
  protected satelliteMapMinZoom: number = DEFAULT_SATELLITE_MAP_MIN_ZOOM
  protected materializedSatelliteMapTile: Rectangle = new Rectangle(this.satelliteMaxBounds)
  protected materializedGuessingMapTile: Rectangle = new Rectangle(this.satelliteMaxBounds)
  protected guessingMarker: CircleMarker | undefined = undefined
  protected resultLine: Polyline | undefined = undefined
  private defaultGuessingMapBounds = new LatLngBounds(
    new LatLng(90, 200),
    new LatLng(-90, -200)
  )
  protected guessingMapMaxBounds = this.defaultGuessingMapBounds
  protected guessingMapFitBounds = this.guessingMapMaxBounds


  protected satelliteMapOptions: MapOptions = {
    layers: [
      tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: DEFAULT_SATELLITE_MAX_ZOOM,
        attribution: '...',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      })
    ],
    minZoom: DEFAULT_SATELLITE_MAP_MIN_ZOOM,
    maxBoundsViscosity: 1,
    attributionControl: false,
  }

  protected guessingMapOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: DEFAULT_GUESSING_MAP_MIN_ZOOM,
        attribution: '...'
      })
    ],
    zoom: 2,
    center: new LatLng(0, 0),
    minZoom: 2,
    maxZoom: 19,
    keyboard: false,
    zoomControl: false,
    attributionControl: false,
  };

  ///////////////////////////////////////////////////////////////////////
  /////// CONSTRUCTOR
  ///////////////////////////////////////////////////////////////////////

  constructor(private route: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef) { }


  ///////////////////////////////////////////////////////////////////////
  /////// LIFECYCLE HOOKS
  ///////////////////////////////////////////////////////////////////////

  public ngOnInit() {
    this.initGame()
  }

  ngOnDestroy(): void {
    this.destroyTimer$.complete()
  }

  ///////////////////////////////////////////////////////////////////////
  /////// GAME LOGIC METHODS
  ///////////////////////////////////////////////////////////////////////

  private async initGame() {

    // Displaying title and changing game status to prevent loading
    this.gameStatus = GameStatus.LOADING
    this.description = DEFAULT_LOADING_DESCRIPTION

    try {

      // initializing index and scores
      this.currentRoundIndex = -1
      this.roundScore = 0
      this.gameScore = 0

      // getting geojson file
      const id = this.route.snapshot.paramMap.get("id")
      const response = await fetch(`assets/${id}.geojson`)
      const placesLayer: FeatureGroup = geoJSON(await response.json())
      this.defaultGuessingMapBounds = placesLayer.getBounds()

      // fitting guessing map bounds in the playing area
      this.guessingMapFitBounds = this.defaultGuessingMapBounds

      // drawing rounds
      this.rounds = await this.drawRounds(placesLayer.getLayers())

      // Displaying title and changing game status to start the game
      this.description = DEFAULT_STARTING_DESCRIPTION
      this.gameStatus = GameStatus.WAITING_FOR_START

    } catch (e) {
      this.gameStatus = GameStatus.ERROR
      console.error(e)
    }
  }

  private async drawRounds(places: Layer[]): Promise<Round[]> {
    let choosenRounds: Round[] = []
    if (places.length >= DEFAULT_NUMBER_OF_ROUNDS) {
      const choosenPlaces = pickRandom(places, { count: DEFAULT_NUMBER_OF_ROUNDS })
      choosenPlaces.forEach((place: any) => {
        // TODO : as any...
        const coordinates = (place.feature.geometry as Point).coordinates
        const name = place.feature.properties == null ? undefined : place.feature.properties["name"]
        const mapMinZoom = place.feature?.properties["mapMinZoom"] == null ?
          DEFAULT_SATELLITE_MAP_MIN_ZOOM :
          place.feature.properties["mapMinZoom"]
        const boundSizeInMeters = place.feature?.properties["boundSizeInMeters"] == null ?
          DEFAULT_BOUND_SIZE_IN_METERS :
          place.feature.properties["boundSizeInMeters"]
        const initZoom = place.feature?.properties["initZoom"] == null ?
          DEFAULT_INIT_ZOOM :
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

  private displayResult(score: number, dist: number | undefined, guessedIntoTheTile: boolean) {

    // getting current round
    const currentRound: Round = this.rounds[this.currentRoundIndex]

    // managing the score
    this.roundScore = score
    this.gameScore += score

    if (guessedIntoTheTile) {
      // if the player guessed into the tile, display materialized tiles in green
      this.materializedGuessingMapTile.setStyle(FOUNDED_TILE_RECTANGLE_STYLE)
      this.materializedSatelliteMapTile.setStyle(FOUNDED_TILE_RECTANGLE_STYLE)

      // centering map on tile
      this.guessingMapFitBounds = this.materializedGuessingMapTile.getBounds()

      // displaying tailored description
      this.description = `Congratulations, you found ${currentRound.name}`
    } else {
      // otherwise display materialized tiles in orange
      this.materializedGuessingMapTile.setStyle(NOT_FOUNDED_TILE_RECTANGLE_STYLE)
      this.materializedSatelliteMapTile.setStyle(NOT_FOUNDED_TILE_RECTANGLE_STYLE)

      if (this.guessingMarker != undefined) {
        if (dist != undefined) {
          // displaying tailored description
          this.description = `You were ${Math.round(dist / 1000)} km from ${currentRound.name}`
        }

        // adding a line between the guessing marker and the tile
        this.resultLine = new Polyline(
          [this.coordinatesToGuess, this.guessingMarker.getLatLng()],
          RESULT_LINE_OPTIONS
        )

        // centering the map to the line
        this.guessingMapFitBounds = this.resultLine.getBounds()

      } else {
        // displaying tailored description
        this.description = `You forgot to click on the map ! You were in ${currentRound.name}`

        // centering map on tile
        this.guessingMapFitBounds = this.materializedGuessingMapTile.getBounds()
      }
    }
  }

  private launchNextRound() {
    this.description = DEFAULT_PLAYING_DESCRIPTION
    this.currentRoundIndex++;

    // reinitializing objects on maps
    this.guessingMarker = undefined
    this.resultLine = undefined
    this.guessingMapFitBounds = this.defaultGuessingMapBounds

    if (this.currentRoundIndex < this.rounds.length) {
      const currentRound: Round = this.currentRound
      const coordinates = new LatLng(currentRound.latitude, currentRound.longitude)

      // display materialized tiles in red again
      this.materializedGuessingMapTile.setStyle(DEFAULT_RECTANGLE_STYLE)
      this.materializedSatelliteMapTile.setStyle(DEFAULT_RECTANGLE_STYLE)

      // each boundary is DEFAULT_BOUND_SIZE_IN_METERS/2 meters apart from coordinates
      this.satelliteMaxBounds = coordinates.toBounds(currentRound.boundSizeInMeters)
      this.coordinatesToGuess = coordinates.clone()
      this.materializedGuessingMapTile.setBounds(this.satelliteMaxBounds)
      this.materializedSatelliteMapTile.setBounds(this.satelliteMaxBounds)

      // updating zoom constraints
      this.satelliteMapMinZoom = currentRound.mapMinZoom

      // TODO : this is a temporary fix
      // https://angular.io/errors/NG0100
      // the value assigned to satelliteMaxBounds automatically update the map canvas view in a bounds corner
      // but satelliteMapCenter has to be updated before, that's not what happened without this timeout
      setTimeout(() => {
        this.satelliteMapCenter = coordinates.clone()
        this.satelliteMapZoom = currentRound.initZoom
      }, 0);

      // changing game status
      this.gameStatus = GameStatus.PLAYING

      // launching counter
      this.launchCounter()
    }
  }

  private guess(): void {
    // stoping timer 
    const remainingTimeInMs = this.stopCounter()

    // init dist and boolean for check if inside the tile
    let distInMeters: number | undefined = undefined
    let guessedIntoTheTile: boolean = false

    if (this.guessingMarker != undefined) {
      // computing distance and getting current round
      distInMeters = this.guessingMarker.getLatLng().distanceTo(this.coordinatesToGuess)

      // checking if the player guessed into the tile
      guessedIntoTheTile = this.satelliteMaxBounds.contains(this.guessingMarker.getLatLng())
    }

    // computing the score
    const score = this.computeRoundScore(remainingTimeInMs, distInMeters, guessedIntoTheTile)

    // changing game status
    this.gameStatus = GameStatus.RESULT

    // diplaying result
    this.displayResult(score, distInMeters, guessedIntoTheTile)
  }

  ///////////////////////////////////////////////////////////////////////
  /////// SCORE COMPUTING METHODS
  ///////////////////////////////////////////////////////////////////////

  private computeRoundScore(remainingTimeInMs: number, distScoreInMeters: number | undefined, guessedIntoTheTile: boolean) {
    let distScore = MAX_SCORE_FOR_DIST // by default, MAX SCORE is assigned to dist score
    if (!guessedIntoTheTile) {
      if (distScoreInMeters == undefined) {
        // the player didn't click on the map
        distScore = 0
      } else {
        // But if the player didn't guessed into the tile the dist score is recomputed
        distScore = this.secretScoreFunction(
          distScoreInMeters,
          MAX_SCORE_FOR_DIST,
          this.currentRound.boundSizeInMeters / 2, // the half size of the bounding box
          this.defaultGuessingMapBounds // max bounds size for the entire map
            .getSouthEast()
            .distanceTo(
              this.defaultGuessingMapBounds.getNorthEast()
            ) * COEF_DIST
        )
      }
    }

    // computing score for time 
    const timeScore = this.secretScoreFunction(
      DEFAULT_MILLISECONDS_IN_A_ROUND - remainingTimeInMs,
      MAX_SCORE_FOR_TIME,
      MIN_TIME_MS,
      DEFAULT_MILLISECONDS_IN_A_ROUND * COEF_TIME,
    )

    // rounding
    return Math.floor(distScore + timeScore)
  }

  /*
  This is the mathematical function used to compute the score as
    f(x) = maxY if x < A
    f(c) = 0 if x > B
    f(x) = a*cos(b(x-h))+ k otherwise

  for the function parameters, f respects the following rules :
    a = maxY /2 
    k = maxY /2
    h = A
    f(B) = 0 => permit to compute b
  */
  private secretScoreFunction(x: number, maxY: number, A: number, B: number): number {
    if (x < A) {
      return maxY
    } else if (x > B) {
      return 0
    } else {
      // parameters are recomputing each time
      const a: number = maxY / 2
      const k: number = maxY / 2
      const h: number = A
      const b = Math.acos(- k / a) / (B - h)
      return a * Math.cos(b * (x - h)) + k
    }
  }

  ///////////////////////////////////////////////////////////////////////
  /////// TIME MANAGEMENT
  ///////////////////////////////////////////////////////////////////////

  private launchCounter(): void {
    this.remainingTime = DEFAULT_MILLISECONDS_IN_A_ROUND
    timer(0, 1000).pipe(takeUntil(this.destroyTimer$)).subscribe(() => {
      if (this.remainingTime <= 0) {
        this.stopCounter()
        this.guess()
      } else {
        this.remainingTime -= 1000
      }
    });
  }

  private stopCounter(): number {
    this.destroyTimer$.next();
    return this.remainingTime
  }


  ///////////////////////////////////////////////////////////////////////
  /////// GETTERS
  ///////////////////////////////////////////////////////////////////////


  get currentRound(): Round {
    return this.rounds[this.currentRoundIndex]
  }

  get currentRoundIsTheLast(): boolean {
    return this.currentRoundIndex == DEFAULT_NUMBER_OF_ROUNDS - 1
  }

  ///////////////////////////////////////////////////////////////////////
  /////// LISTENERS
  ///////////////////////////////////////////////////////////////////////

  protected onPlayAgainClicked() {
    // initializing game
    this.initGame()
  }

  protected onStartClicked() {
    // Starting the game
    this.launchNextRound()
  }

  protected onLaunchNextRoundClicked() {
    // launching next round
    this.launchNextRound()
  }

  protected onGuessingMapClicked(event: { latlng: LatLngExpression; }) {
    if (this.gameStatus == GameStatus.PLAYING) {
      this.guessingMarker = new CircleMarker(event.latlng, GUESSING_MARKER_OPTIONS)
    }
  }

  protected onGuessClicked() {
    this.guess()
  }

  protected onRespawnClicked() {
    this.satelliteMapCenter = this.coordinatesToGuess.clone()
  }

  protected onEndGame() {
    this.description = "End of the game"
    this.gameStatus = GameStatus.ENDED
  }

}
