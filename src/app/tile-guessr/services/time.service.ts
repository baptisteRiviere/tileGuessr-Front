import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, takeUntil, timer } from "rxjs";
import { defaultMappingOptions } from "../parameters/mapping-options.default";

@Injectable({
    providedIn: 'root'
})
export class TimeService {
    private destroyTimer$ = new Subject<void>();
    private remainingTime$: BehaviorSubject<number> = new BehaviorSubject<number>(defaultMappingOptions.millisecondsInARound)
    public currentRemainingTime = this.remainingTime$.asObservable()

    constructor() { }

    public ngOnDestroy(): void {
        this.destroyTimer$.next();
        this.destroyTimer$.complete();
    }

    public launchCounter(): void {
        this.remainingTime$.next(defaultMappingOptions.millisecondsInARound)
        timer(0, 1000)
            .pipe(takeUntil(this.destroyTimer$))
            .subscribe(() => {
                if (this.remainingTime$.value === 0) {
                    this.destroyTimer$.next()
                }
                this.remainingTime$.next(this.remainingTime$.value - 1000)
            });
    }

    public stopCounter(): number {
        const finalTime = this.remainingTime$.value
        this.destroyTimer$.next();
        return finalTime
    }

}