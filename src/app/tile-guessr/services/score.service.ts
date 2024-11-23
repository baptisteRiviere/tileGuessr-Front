import { Injectable } from "@angular/core";
import { IRound } from "../interfaces/round";
import { CircleMarker, LatLng, LatLngBounds } from "leaflet";

// Constants for score management
const MAX_SCORE_FOR_DIST = 800 // max score reachable 
const COEF_DIST = 0.8 // this means that player will have 0 points for dist if the guess is more than 0.8 * max bounds 
const MAX_SCORE_FOR_TIME = 200
const MIN_TIME_MS = 5000 // Minimum time to guess for having the max amount of points
const COEF_TIME = 0.8 // this means that player will have 0 points for time if the guess is more than 0.8 * the accorded time


@Injectable({
    providedIn: 'root'
})
export class ScoreService {


    /*
    * Compute the score from multiple values
    *
    * @param {round} : current round
    * @param {guessedIntoTheTile} : true if the plyer guessed into the tile
    * @param {distanceInMeters} : distance between the guess and the point in meters
    * @param {mapMaxBoundSize} : size of the bounds of the whole map
    * @param {remainingTimeInMs} : time remaining in the timer when the player guessed
    * @param {totalTimeInMs} : total time of the round in ms
    */
    public computeScore(
        round: IRound,
        guessedIntoTheTile: boolean,
        distanceInMeters: number | undefined,
        mapMaxBoundSize: number,
        remainingTimeInMs: number,
        totalTimeInMs: number
    ) {

        let distScore = MAX_SCORE_FOR_DIST // by default, MAX SCORE is assigned to dist score
        if (!guessedIntoTheTile) {
            if (distanceInMeters == undefined) {
                distScore = 0 // the player didn't click on the map
            } else {
                // If the player didn't guessed into the tile the dist score is recomputed
                distScore = this.secretScoreFunction(
                    distanceInMeters,
                    MAX_SCORE_FOR_DIST,
                    round.boundSizeInMeters / 2, // the half size of the bounding box
                    mapMaxBoundSize * COEF_DIST
                )
            }
        }

        // computing score for time 
        const timeScore = this.secretScoreFunction(
            totalTimeInMs - remainingTimeInMs,
            MAX_SCORE_FOR_TIME,
            MIN_TIME_MS,
            totalTimeInMs * COEF_TIME,
        )

        // rounding
        return Math.floor(distScore + timeScore)
    }


    /*
    * This is the mathematical function used to compute the score as
    *    f(x) = maxY if x < A
    *    f(c) = 0 if x > B
    *    f(x) = a*cos(b(x-h))+ k otherwise
    * for the function parameters, f respects the following rules :
    *    a = maxY /2 
    *    k = maxY /2
    *    h = A
    *    f(B) = 0 => permit to compute b
    */
    private secretScoreFunction(x: number, maxY: number, A: number, B: number): number {
        if (x < A) {
            return maxY
        } else if (x > B) {
            return 0
        } else {
            // parameters are recomputed each time
            const a: number = maxY / 2
            const k: number = maxY / 2
            const h: number = A
            const b = Math.acos(- k / a) / (B - h)
            return a * Math.cos(b * (x - h)) + k
        }
    }

}