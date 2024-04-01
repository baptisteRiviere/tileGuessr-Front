import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { RouteNotFoundComponent } from './route-not-found/route-not-found.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TileGuessrModule } from './tile-guessr/tile-guessr.module';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CreditsComponent } from './credits/credits.component';



@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    RouteNotFoundComponent,
    CreditsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule,
    TileGuessrModule,
    ToolbarModule,
    ButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
