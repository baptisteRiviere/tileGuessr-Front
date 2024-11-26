import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet'
import { TileGuessrGameComponent } from './tile-guessr-game/tile-guessr-game.component';
import { TileGuessrComponent } from './tile-guessr.component';
import { TileGuessrDetailsComponent } from './tile-guessr-details/tile-guessr-details.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    TileGuessrComponent,
    TileGuessrGameComponent,
    TileGuessrDetailsComponent,
  ],
  imports: [
    CommonModule,
    LeafletModule,
    HttpClientModule,
  ],
  bootstrap: [TileGuessrGameComponent]
})
export class TileGuessrModule { }