import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileGuessrGameComponent } from './tile-guessr-game.component';

describe('TgMapComponent', () => {
  let component: TileGuessrGameComponent;
  let fixture: ComponentFixture<TileGuessrGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TileGuessrGameComponent]
    });
    fixture = TestBed.createComponent(TileGuessrGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
