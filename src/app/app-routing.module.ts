import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component'
import { TileGuessrComponent } from './tile-guessr/tile-guessr.component'
import { RouteNotFoundComponent } from './route-not-found/route-not-found.component'
import { TileGuessrGameComponent } from './tile-guessr/tile-guessr-game/tile-guessr-game.component';
import { CreditsComponent } from './credits/credits.component';
import { TileGuessrDetailsComponent } from './tile-guessr/tile-guessr-details/tile-guessr-details.component';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'credits', component: CreditsComponent },
  { path: 'tileGuessr', component: TileGuessrComponent },
  { path: 'tileGuessr/details/:id', component: TileGuessrDetailsComponent },
  { path: 'tileGuessr/map/:id', component: TileGuessrGameComponent },
  { path: '**', component: RouteNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
