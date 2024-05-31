import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FeatureGroup, geoJSON } from 'leaflet';
import { IGameMap, IGameMapProperties } from '../interfaces/game'
import { GameService } from '../services/game.service';


@Component({
  selector: 'app-tile-guessr-details',
  templateUrl: './tile-guessr-details.component.html',
  styleUrls: ['./tile-guessr-details.component.css']
})
export class TileGuessrDetailsComponent implements OnInit {
  protected gameMapProperties: IGameMapProperties | undefined
  private id: string | undefined

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  public async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get("id") ?? undefined
    if (this.id != undefined) {
      const gameMap: IGameMap | undefined = 
        await this.gameService.fetchGameMapFromId(this.id)
      this.gameMapProperties = gameMap?.properties ?? undefined
    }
  }

  protected onChooseGameClicked() {
    if (this.gameMapProperties) {
      this.router.navigate(
        ['./tileGuessr/map', this.id],
      );
    }
  }
}
