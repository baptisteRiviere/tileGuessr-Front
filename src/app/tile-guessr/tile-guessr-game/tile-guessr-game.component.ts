import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Point } from 'geojson';
import { tileLayer, MapOptions, LatLng, LatLngExpression, Circle, LatLngBounds, Rectangle, FeatureGroup, geoJSON, Layer, PathOptions, CircleOptions, Polyline, PolylineOptions } from 'leaflet';
import pickRandom from 'pick-random';
import { Subject, takeUntil, timer } from 'rxjs';

// Constants for messages
const DEFAULT_LOADING_DESCRIPTION = "Loading game"
const DEFAULT_STARTING_DESCRIPTION = "Are you ready ?"
const DEFAULT_PLAYING_DESCRIPTION = "Where is this location ?"

// Constants for mapping
const BOUND_SIZE_IN_METTERS = 10000
const SATELLITE_MAP_MIN_ZOOM = 12
const NUMBER_OF_ROUNDS = 5
const MILLISECONDS_IN_A_ROUND = 1000 * 60 * 3

// Constants for score management
const MAX_SCORE_FOR_DIST = 800 // max score reachable 
const COEF_DIST = 0.8 // this means that player will have 0 points for dist if the guess is more than 0.8 * max bounds 
const MAX_SCORE_FOR_TIME = 200
const MIN_TIME_MS = 5 // Minimum time to guess for having the max amount of points
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
  color: 'red',
  radius: 100
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
  name: string | undefined
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
  protected remainingTime: number = MILLISECONDS_IN_A_ROUND
  protected gameStatus: string = GameStatus.LOADING
  protected coordinatesToGuess: LatLng = new LatLng(0, 0)
  protected satelliteMapCenter: LatLng = new LatLng(0, 0)
  protected satelliteMaxBounds: LatLngBounds = new LatLngBounds(this.coordinatesToGuess, this.coordinatesToGuess)
  protected materializedSatelliteMapTile: Rectangle = new Rectangle(this.satelliteMaxBounds)
  protected materializedGuessingMapTile: Rectangle = new Rectangle(this.satelliteMaxBounds)
  protected guessingMarker: Circle | undefined = undefined
  protected resultLine: Polyline | undefined = undefined
  private defaultGuessingMapBounds = new LatLngBounds(
    new LatLng(90, 200),
    new LatLng(-90, -200)
  )
  protected guessingMapMaxBounds = this.defaultGuessingMapBounds
  protected guessingMapFitBounds = this.guessingMapMaxBounds


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
      const response = await fetch('assets/frenchCities.geojson')
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
    if (places.length >= NUMBER_OF_ROUNDS) {
      const choosenPlaces = pickRandom(places, { count: NUMBER_OF_ROUNDS })
      choosenPlaces.forEach((place: any) => {
        // TODO : as any...
        const coordinates = (place.feature.geometry as Point).coordinates
        const name = place.feature.properties == null ? undefined : place.feature.properties["name"]
        choosenRounds.push({
          latitude: coordinates[1],
          longitude: coordinates[0],
          name: name
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

    // displaying description
    if (dist == undefined) {
      this.description = `You forgot to click on the map ! You were in ${currentRound.name}`
    } else {
      this.description = `You were ${Math.round(dist / 1000)} km from ${currentRound.name}`
    }

    if (guessedIntoTheTile) {
      // if the player guessed into the tile, display materialized tiles in green
      this.materializedGuessingMapTile.setStyle(FOUNDED_TILE_RECTANGLE_STYLE)
      this.materializedSatelliteMapTile.setStyle(FOUNDED_TILE_RECTANGLE_STYLE)

      // centering map on tile
      this.guessingMapFitBounds = this.materializedGuessingMapTile.getBounds()
    } else {
      // otherwise display materialized tiles in orange
      this.materializedGuessingMapTile.setStyle(NOT_FOUNDED_TILE_RECTANGLE_STYLE)
      this.materializedSatelliteMapTile.setStyle(NOT_FOUNDED_TILE_RECTANGLE_STYLE)

      if (this.guessingMarker != undefined) {
        // adding a line between the guessing marker and the tile
        this.resultLine = new Polyline(
          [this.coordinatesToGuess, this.guessingMarker.getLatLng()],
          RESULT_LINE_OPTIONS
        )
        // centering the map to the line
        this.guessingMapFitBounds = this.resultLine.getBounds()
      } else {
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
    this.guessingMapFitBounds = this.defaultGuessingMapBounds // TODO : no effects

    if (this.currentRoundIndex < this.rounds.length) {
      const currentRound: Round = this.currentRound
      const coordinates = new LatLng(currentRound.latitude, currentRound.longitude)


      // display materialized tiles in red again
      this.materializedGuessingMapTile.setStyle(DEFAULT_RECTANGLE_STYLE)
      this.materializedSatelliteMapTile.setStyle(DEFAULT_RECTANGLE_STYLE)

      // each boundary is BOUND_SIZE_IN_METTERS/2 meters apart from coordinates
      this.satelliteMaxBounds = coordinates.toBounds(BOUND_SIZE_IN_METTERS)
      this.coordinatesToGuess = coordinates.clone()
      this.materializedGuessingMapTile.setBounds(this.satelliteMaxBounds)
      this.materializedSatelliteMapTile.setBounds(this.satelliteMaxBounds)

      // TODO : this is a temporary fix
      // the value assigned to satelliteMaxBounds automatically update the map canvas view in a bounds corner
      // but satelliteMapCenter has to be updated before, that's not what happened without this timeout
      setTimeout(() => {
        this.satelliteMapCenter = coordinates.clone()
      }, 100);

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
          BOUND_SIZE_IN_METTERS / 2, // the half size of the bounding box
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
      MILLISECONDS_IN_A_ROUND - remainingTimeInMs,
      MAX_SCORE_FOR_TIME,
      MILLISECONDS_IN_A_ROUND - MIN_TIME_MS,
      MILLISECONDS_IN_A_ROUND * COEF_TIME,
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
    this.remainingTime = MILLISECONDS_IN_A_ROUND
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
    return this.currentRoundIndex == NUMBER_OF_ROUNDS - 1
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
      this.guessingMarker = new Circle(event.latlng, GUESSING_MARKER_OPTIONS)
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
