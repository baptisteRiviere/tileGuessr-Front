import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet'
import { TileGuessrGameComponent } from './tile-guessr-game/tile-guessr-game.component';



@NgModule({
  declarations: [
    TileGuessrGameComponent,
  ],
  imports: [
    CommonModule,
    LeafletModule
  ],
  bootstrap: [TileGuessrGameComponent]
})
export class TileGuessrModule { }