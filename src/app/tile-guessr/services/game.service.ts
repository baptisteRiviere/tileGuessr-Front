import { Injectable } from "@angular/core";
import { IRound, IRoundOption } from "../interfaces/round";
import { GameInitService } from "./game-init.service";
import { IGameMap } from "../interfaces/game";
import { LatLng, LatLngBounds } from "leaflet";
import { defaultMappingOptions } from '../parameters/mapping-options.default'
import { BehaviorSubject, Observable } from "rxjs";
import { IGuessResult, RoundService } from "./round.service";
import { ParamMap } from "@angular/router";


@Injectable({
    providedIn: 'root'
})
export class GameService {
    constructor(
        private gameInitService: GameInitService,
        private roundService: RoundService
    ) { }

    private rounds: IRound[] = []

    // Current Round Index
    private roundIndex: BehaviorSubject<number> = new BehaviorSubject(0);
    public currentRoundIndex = this.roundIndex.asObservable();

    // Game Score TODO
    private gameScore: BehaviorSubject<number> = new BehaviorSubject(0)
    public currentGameScore = this.gameScore.asObservable();

    // Timer TODO

    private guessingMapBounds: LatLngBounds = new LatLngBounds(
        new LatLng(90, 200),
        new LatLng(-90, -200)
    )

    public getCurrentRound(): IRound {
        return this.rounds[this.roundIndex.value]
    }

    public incrementRoundIndex() { // TODO
        this.roundIndex.next(this.roundIndex.value + 1)
    }

    public getGuessingMapBounds(): LatLngBounds {
        return this.guessingMapBounds
    }

    public async initGame(gameMap: IGameMap, params: ParamMap): Promise<void> {
        // initializing index and scores
        this.roundIndex.next(-1)

        // getting game map bounds
        this.guessingMapBounds = gameMap.features.getBounds()

        // build user options
        const userOptions: Partial<IRoundOption> = this._buildUserOptions(params)

        this.rounds = await this.gameInitService.drawRoundsFromGameMap(
            gameMap.features.getLayers(),
            defaultMappingOptions.numberOfRounds,
            {
                ...defaultMappingOptions,
                ...gameMap.properties.defaultRoundOptions,
                ...userOptions
            }
        )
    }

    public async guess(
        guessedCoordinates: LatLng,
        satelliteMaxBounds: LatLngBounds,
        remainingTimeInMs: number,
    ): Promise<IGuessResult> {
        return this.roundService.guess(
            this.getCurrentRound(),
            guessedCoordinates,
            satelliteMaxBounds,
            this.guessingMapBounds,
            remainingTimeInMs,
            defaultMappingOptions.millisecondsInARound
        )
    }

    private _buildUserOptions(params: ParamMap): Partial<IRoundOption> {
        return {
            moveAcrossBorders: params.get("moveAcrossBorders") == "true"
        }
    }
}