import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component'
import { TileGuessrComponent } from './tile-guessr/tile-guessr.component'
import { RouteNotFoundComponent } from './route-not-found/route-not-found.component'
import { TileGuessrGameComponent } from './tile-guessr/tile-guessr-game/tile-guessr-game.component';

const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: 'welcome', component: WelcomeComponent },
  { path: 'tileGuessr', component: TileGuessrComponent },
  { path: 'tileGuessr/map', component: TileGuessrGameComponent },
  { path: '**', component: RouteNotFoundComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
