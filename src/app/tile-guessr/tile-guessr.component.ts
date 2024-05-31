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
  },
  {
    name: "French Landmarks",
    id: "frenchLandmarks"
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
  }, {
    name: "Stadiums",
    id: "stadiums"
  }]

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  gotoDetail(mapId: string): void {
    this.router.navigate(['./map', mapId], { relativeTo: this.route });
  }
}
