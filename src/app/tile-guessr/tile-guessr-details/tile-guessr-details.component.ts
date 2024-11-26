import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IGameMapProperties } from '../interfaces/game'
import { GameInitService } from '../services/game-init.service';
import { defaultMappingOptions } from '../parameters/mapping-options.default'
import { Observable } from 'rxjs';


@Component({
  selector: 'app-tile-guessr-details',
  templateUrl: './tile-guessr-details.component.html',
  styleUrls: ['./tile-guessr-details.component.css', '../tile-guessr-game.shared.css'],
})
export class TileGuessrDetailsComponent implements OnInit {
  protected isLoading = true;
  protected gameMapProperties$: Observable<IGameMapProperties> = new Observable<IGameMapProperties>()
  protected moveAcrossBorders = defaultMappingOptions.moveAcrossBorders
  private gameMapId: string | undefined


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameInitService: GameInitService
  ) { }

  public async ngOnInit() {
    this.gameMapId = this.route.snapshot.paramMap.get("id") ?? undefined
    if (this.gameMapId != undefined) {
      this.gameMapProperties$ = await
        this.gameInitService.fetchGameMapPropertiesFromId$(this.gameMapId)
      this.isLoading = false
    }
  }

  protected onChooseGameClicked() {
    this.router.navigate(['./tileGuessr/map', this.gameMapId], {
      queryParams: {
        moveAcrossBorders: this.moveAcrossBorders
      }
    });
  }
}
