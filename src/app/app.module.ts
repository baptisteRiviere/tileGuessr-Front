import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { RouteNotFoundComponent } from './route-not-found/route-not-found.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TileGuessrModule } from './tile-guessr/tile-guessr.module';



@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    RouteNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule,
    TileGuessrModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
