import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestcontrolComponent } from './testcontrol.component';

describe('TestcontrolComponent', () => {
  let component: TestcontrolComponent;
  let fixture: ComponentFixture<TestcontrolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestcontrolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestcontrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
