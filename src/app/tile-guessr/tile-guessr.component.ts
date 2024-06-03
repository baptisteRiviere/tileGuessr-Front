import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from './services/game.service';


@Component({
  selector: 'app-tile-guessr',
  templateUrl: './tile-guessr.component.html',
  styleUrls: ['./tile-guessr.component.css', 'tile-guessr-game.buttonSyle.css']
})
export class TileGuessrComponent {
  protected availableMaps = [{
    name: "Test",
    id: "testCities"
  }, {
    name: "French cities",
    id: "frenchCities"
  }, {
    name: "Capitals",
    id: "capitals"
  }, {
    name: "Random in France",
    id: "randomFrance"
  }, {
    name: "Paris",
    id: "paris"
  }, {
    name: "Lyon",
    id: "lyon"
  }, {
    name: "Nantes",
    id: "nantes"
  }]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) { }

  gotoDetail(mapId: string): void {
    this.router.navigate(['./details', mapId], { relativeTo: this.route });
  }
}
