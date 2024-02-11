import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Map {
  name: string,
  id: string
}

export interface AvailableMapsReponse {
  maps: Array<Map>;
}

@Component({
  selector: 'app-tile-guessr',
  templateUrl: './tile-guessr.component.html',
  styleUrls: ['./tile-guessr.component.css', 'tile-guessr-game.buttonSyle.css']
})
export class TileGuessrComponent {
  protected availableMaps: Map[] = []

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _http: HttpClient
  ) { }


  ///////////////////////////////////////////////////////////////////////
  /////// LIFECYCLE HOOKS
  ///////////////////////////////////////////////////////////////////////

  ngOnInit(): void {
    this.fetchAvailableMaps()
  }

  ///////////////////////////////////////////////////////////////////////
  /////// FETCH
  ///////////////////////////////////////////////////////////////////////

  private fetchAvailableMaps() {
    this._http.get<AvailableMapsReponse>('/api/getAvailableMaps')
      .subscribe((availableMapsResponse) => {
        this.availableMaps = availableMapsResponse.maps
      });
  }

  ///////////////////////////////////////////////////////////////////////
  /////// LISTENERS
  ///////////////////////////////////////////////////////////////////////

  gotoDetail(mapId: string): void {
    this.router.navigate(['./map', mapId], { relativeTo: this.route });
  }
}
