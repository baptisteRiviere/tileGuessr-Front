import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileGuessrDetailsComponent } from './tile-guessr-details.component';

describe('TileGuessrDetailsComponent', () => {
  let component: TileGuessrDetailsComponent;
  let fixture: ComponentFixture<TileGuessrDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TileGuessrDetailsComponent]
    });
    fixture = TestBed.createComponent(TileGuessrDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
