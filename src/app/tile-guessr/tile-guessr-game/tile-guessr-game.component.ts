import { Component, OnInit, OnDestroy } from '@angular/core';
import { tileLayer, MapOptions, LatLng, LatLngExpression, LatLngBounds, Rectangle, Polyline, CircleMarker } from 'leaflet';
import { Observable, Subject, takeUntil } from 'rxjs';
import { GameInitService } from '../services/game-init.service';
import { IGameMap, GameStatus } from '../interfaces/game';
import { ActivatedRoute, Router } from '@angular/router';
import { defaultGeometryStyles } from '../parameters/geometry-styles.default'
import { defaultMappingOptions } from '../parameters/mapping-options.default'
import messages from '../parameters/en'
import { IGuessResult } from '../services/round.service';
import { GameService } from '../services/game.service';
import { TimeService } from '../services/time.service';


@Component({
  selector: 'app-tg-map',
  templateUrl: './tile-guessr-game.component.html',
  styleUrls: ['./tile-guessr-game.component.css', '../tile-guessr-game.shared.css']
})
export class TileGuessrGameComponent implements OnInit, OnDestroy {
  private gameMapId: string | undefined = undefined
  private destroyGame$ = new Subject<void>();
  protected currentRoundIndex: number = 0
  protected roundScore: number = 0
  protected gameScore: number = 0
  protected description: string = messages.loadingGame
  protected remainingTime: number = defaultMappingOptions.millisecondsInARound
  protected gameMap$: Observable<IGameMap> = new Observable<IGameMap>()
  protected gameStatus: GameStatus = GameStatus.LOADING
  protected gameStatusEnum = GameStatus
  protected coordinatesToGuess: LatLng = new LatLng(0, 0)
  protected satelliteMapCenter: LatLng = new LatLng(0, 0)
  protected satelliteMaxBounds: LatLngBounds = new LatLngBounds(this.coordinatesToGuess, this.coordinatesToGuess)
  protected satelliteMapZoom: number = defaultMappingOptions.initZoom
  protected satelliteMapMinZoom: number = defaultMappingOptions.satelliteMapMinZoom
  protected materializedSatelliteMapTile: Rectangle = new Rectangle(this.satelliteMaxBounds)
  protected materializedGuessingMapTile: Rectangle = new Rectangle(this.satelliteMaxBounds)
  protected guessingMarker: CircleMarker | undefined = undefined
  protected resultLine: Polyline | undefined = undefined
  protected guessingMapMaxBounds = new LatLngBounds(
    new LatLng(90, 200),
    new LatLng(-90, -200)
  )
  protected guessingMapFitBounds = new LatLngBounds(
    new LatLng(90, 200),
    new LatLng(-90, -200)
  )


  protected satelliteMapOptions: MapOptions = {
    layers: [
      tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: defaultMappingOptions.satelliteMapMaxZoom,
        attribution: '...',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      })
    ],
    minZoom: defaultMappingOptions.satelliteMapMinZoom,
    keyboard: true,
    zoomControl: false,
    maxBoundsViscosity: 1,
    attributionControl: false,
  }

  protected guessingMapOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: defaultMappingOptions.guessingMapMinZoom,
        attribution: '...'
      })
    ],
    zoom: 2,
    center: new LatLng(0, 0),
    keyboard: false,
    zoomControl: false,
    attributionControl: false,
  };

  ///////////////////////////////////////////////////////////////////////
  /////// CONSTRUCTOR
  ///////////////////////////////////////////////////////////////////////

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameInitService: GameInitService,
    private gameService: GameService,
    private timeService: TimeService
  ) { }


  ///////////////////////////////////////////////////////////////////////
  /////// LIFECYCLE HOOKS
  ///////////////////////////////////////////////////////////////////////

  public ngOnInit() {
    this.subscribeToSharedData()
    this.gameMapId = this.route.snapshot.paramMap.get("id") ?? undefined
    if (this.gameMapId != undefined) {
      this.gameMap$ = this.gameInitService.fetchGameMapFromId$(this.gameMapId)
      this.gameMap$.subscribe((gameMap) => {
        this.initGame(gameMap)
      })
    }
    // TODO : handle else
  }

  public ngOnDestroy(): void {
    this.destroyGame$.next();
    this.destroyGame$.complete();
  }

  ///////////////////////////////////////////////////////////////////////
  /////// GAME LOGIC METHODS
  ///////////////////////////////////////////////////////////////////////

  private async initGame(gameMap: IGameMap) {
    // Displaying title and changing game status to prevent loading
    this.gameStatus = GameStatus.LOADING
    this.description = messages.loadingGame

    await this.gameService.initGame(gameMap)

    // fitting guessing map bounds in the playing area
    this.guessingMapFitBounds = this.gameService.getGuessingMapBounds()

    // Displaying title and changing game status to start the game
    this.launchNextRound()
    this.gameStatus = GameStatus.PLAYING
  }

  private displayResult(result: IGuessResult) {

    // getting current round name
    const currentRoundName = this.gameService.getCurrentRound().name

    // managing the score
    this.roundScore = result.score
    this.gameScore += result.score

    if (result.guessedIntoTheTile) {
      // if the player guessed into the tile, display materialized tiles in green
      this.materializedGuessingMapTile.setStyle(defaultGeometryStyles.foundedTileRectangle)
      this.materializedSatelliteMapTile.setStyle(defaultGeometryStyles.foundedTileRectangle)

      // centering map on tile
      this.guessingMapFitBounds = this.materializedGuessingMapTile.getBounds()

      // displaying tailored description
      this.description = `Congratulations, you found ${currentRoundName}`
    } else {
      // otherwise display materialized tiles in orange
      this.materializedGuessingMapTile.setStyle(defaultGeometryStyles.notFoundedTileRectangle)
      this.materializedSatelliteMapTile.setStyle(defaultGeometryStyles.foundedTileRectangle)

      if (this.guessingMarker != undefined) {
        if (result.distance != undefined) {
          // displaying tailored description
          this.description = `You were ${Math.round(result.distance / 1000)} km from ${currentRoundName}`
        }

        // adding a line between the guessing marker and the tile
        this.resultLine = new Polyline(
          [this.coordinatesToGuess, this.guessingMarker.getLatLng()],
          defaultGeometryStyles.resultLine
        )

        // centering the map to the line
        this.guessingMapFitBounds = this.resultLine.getBounds()

      } else {
        // displaying tailored description
        this.description = `You forgot to click on the map ! You were in ${currentRoundName}`

        // centering map on tile
        this.guessingMapFitBounds = this.materializedGuessingMapTile.getBounds()
      }
    }
  }

  private launchNextRound() {
    this.description = messages.playingDescription
    this.gameService.incrementRoundIndex();

    // reinitializing objects on maps
    this.guessingMarker = undefined
    this.resultLine = undefined
    this.guessingMapFitBounds = this.gameService.getGuessingMapBounds()

    // getting current round
    const currentRound = this.gameService.getCurrentRound()

    if (currentRound !== undefined) {
      const coordinates = new LatLng(currentRound.latitude, currentRound.longitude)

      // display materialized tiles in red again
      this.materializedGuessingMapTile.setStyle(defaultGeometryStyles.rectangle)
      this.materializedSatelliteMapTile.setStyle(defaultGeometryStyles.rectangle)

      // each boundary is DEFAULT_BOUND_SIZE_IN_METERS/2 meters apart from coordinates
      this.satelliteMaxBounds = coordinates.toBounds(currentRound.boundSizeInMeters)
      this.coordinatesToGuess = coordinates.clone()
      this.materializedGuessingMapTile.setBounds(this.satelliteMaxBounds)
      this.materializedSatelliteMapTile.setBounds(this.satelliteMaxBounds)

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

      // launching round
      this.timeService.launchCounter()
    }
  }

  private async guess(): Promise<void> {
    // stopping timer 
    const remainingTimeInMs = this.timeService.stopCounter()

    const result = await this.gameService.guess(
      this.guessingMarker?.getLatLng() ?? new LatLng(0, 0), // TODO
      this.satelliteMaxBounds,
      remainingTimeInMs,
    )

    // changing game status
    this.gameStatus = GameStatus.RESULT

    // diplaying result
    this.displayResult(result)
  }

  ///////////////////////////////////////////////////////////////////////
  /////// GETTERS
  ///////////////////////////////////////////////////////////////////////

  get currentRoundIsTheLast(): boolean {
    return this.currentRoundIndex == defaultMappingOptions.numberOfRounds - 1
  }

  ///////////////////////////////////////////////////////////////////////
  /////// LISTENERS
  ///////////////////////////////////////////////////////////////////////

  protected onLaunchNextRoundClicked() {
    this.launchNextRound()
  }

  protected onGuessingMapClicked(event: { latlng: LatLngExpression; }) {
    if (this.gameStatus == GameStatus.PLAYING) {
      this.guessingMarker = new CircleMarker(event.latlng, defaultGeometryStyles.guessingMarker)
    }
  }

  protected onGuessClicked() {
    this.guess()
  }

  protected onRespawnClicked() {
    this.satelliteMapCenter = this.coordinatesToGuess.clone()
  }

  protected onEndGame() {
    this.description = messages.endOfTheGame
    this.gameStatus = GameStatus.ENDED
  }

  protected onPlayAgainClicked() {
    this.router.navigate(['/tileGuessr/details', this.gameMapId]);
  }

  ///////////////////////////////////////////////////////////////////////
  /////// SHARED DATA
  ///////////////////////////////////////////////////////////////////////

  public subscribeToSharedData() {
    this.gameService.currentRoundIndex
      .pipe(takeUntil(this.destroyGame$))
      .subscribe((currentRoundIndex) => {
        this.currentRoundIndex = currentRoundIndex
      })
    this.timeService.currentRemainingTime
      .pipe(takeUntil(this.destroyGame$))
      .subscribe((remainingTime) => {
        this.remainingTime = remainingTime
      })
  }
}
