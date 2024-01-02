import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  gotoTileGuessr(): void {
    this.router.navigate(['../tileGuessr'], { relativeTo: this.route });
  }
}
