import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tile-guessr',
  templateUrl: './tile-guessr.component.html',
  styleUrls: ['./tile-guessr.component.css', 'tile-guessr-game.buttonSyle.css']
})
export class TileGuessrComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  gotoDetail(): void {
    this.router.navigate(['./map'], { relativeTo: this.route });
  }
}
