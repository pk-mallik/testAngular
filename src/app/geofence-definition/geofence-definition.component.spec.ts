import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeofenceDefinitionComponent } from './geofence-definition.component';

describe('GeofenceDefinitionComponent', () => {
  let component: GeofenceDefinitionComponent;
  let fixture: ComponentFixture<GeofenceDefinitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeofenceDefinitionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeofenceDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
