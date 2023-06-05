import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapgridComponent } from './mapgrid.component';

describe('MapgridComponent', () => {
  let component: MapgridComponent;
  let fixture: ComponentFixture<MapgridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapgridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapgridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
