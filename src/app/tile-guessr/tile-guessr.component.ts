import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tile-guessr',
  templateUrl: './tile-guessr.component.html',
  styleUrls: ['./tile-guessr.component.css', 'tile-guessr-game.buttonSyle.css']
})
export class TileGuessrComponent {
  protected availableMaps = [{
    name: "French cities",
    id: "frenchCities"
  }, {
    name: "Capitals",
    id: "capitals"
  }, {
    name: "random in France",
    id: "randomFrance"
  }, {
    name: "For testing",
    id: "testCities"
  }]

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  gotoDetail(mapId: string): void {
    this.router.navigate(['./map', mapId], { relativeTo: this.route });
  }
}
