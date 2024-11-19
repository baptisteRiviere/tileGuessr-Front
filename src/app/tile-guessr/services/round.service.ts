import { Injectable } from "@angular/core";
import { IRound } from "../interfaces/round";
import { LatLng, LatLngBounds } from "leaflet";
import { ScoreService } from "./score.service";
import { TimeService } from "./time.service";

export interface IGuessResult {
    score: number,
    distance: number,
    guessedIntoTheTile: boolean
}

@Injectable({
    providedIn: 'root'
})
export class RoundService {

    constructor(
        public scoreService: ScoreService,
        public timeService: TimeService
    ) { }

    public guess(
        round: IRound,
        guessedCoordinates: LatLng,
        satelliteMaxBounds: LatLngBounds,
        defaultGuessingMapBounds: LatLngBounds,
        remainingTimeInMs: number,
        millisecondsInARound: number
    ): IGuessResult {

        // stoping timer

        const coordinatesToGuess = new LatLng(round.latitude, round.longitude)
        const distanceInMeters: number = guessedCoordinates.distanceTo(coordinatesToGuess);
        const guessedIntoTheTile: boolean = satelliteMaxBounds.contains(guessedCoordinates)
        const mapMaxBoundSize = defaultGuessingMapBounds
            .getSouthEast()
            .distanceTo(
                defaultGuessingMapBounds.getNorthEast()
            )

        // compute score
        const score = this.scoreService.computeScore(
            round,
            guessedIntoTheTile,
            distanceInMeters,
            mapMaxBoundSize,
            remainingTimeInMs,
            millisecondsInARound
        )

        return {
            score: score,
            distance: distanceInMeters,
            guessedIntoTheTile: guessedIntoTheTile,
        }
    }

    public subscribeToSharedData() {
        this.timeService.currentRemainingTime
            .subscribe((remainingTime) => {
                if (remainingTime <= 0) {
                    console.log("time out")
                }
            })
    }
}