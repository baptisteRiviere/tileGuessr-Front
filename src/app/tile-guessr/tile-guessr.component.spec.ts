import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TileGuessrComponent } from './tile-guessr.component';

describe('TileGuessrComponent', () => {
  let component: TileGuessrComponent;
  let fixture: ComponentFixture<TileGuessrComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TileGuessrComponent]
    });
    fixture = TestBed.createComponent(TileGuessrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
