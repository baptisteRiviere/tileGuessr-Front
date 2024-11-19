import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGameMapProperties } from '../interfaces/game'
import { GameInitService } from '../services/game-init.service';
import { map, Observable } from 'rxjs';


@Component({
  selector: 'app-tile-guessr-details',
  templateUrl: './tile-guessr-details.component.html',
  styleUrls: ['./tile-guessr-details.component.css']
})
export class TileGuessrDetailsComponent implements OnInit {
  protected gameMapProperties$: Observable<IGameMapProperties> = new Observable<IGameMapProperties>()
  private gameMapId: string | undefined

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameInitService: GameInitService
  ) { }

  public async ngOnInit() {
    this.gameMapId = this.route.snapshot.paramMap.get("id") ?? undefined
    if (this.gameMapId != undefined) {
      this.gameMapProperties$ =
        this.gameInitService.fetchGameMapPropertiesFromId$(this.gameMapId)
    }
  }

  protected onChooseGameClicked() {
    this.router.navigate(['./tileGuessr/map', this.gameMapId]);
  }
}
