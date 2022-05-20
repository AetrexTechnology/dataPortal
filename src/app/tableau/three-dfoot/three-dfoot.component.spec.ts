import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeDfootComponent } from './three-dfoot.component';

describe('ThrreDfootComponent', () => {
  let component: ThreeDfootComponent;
  let fixture: ComponentFixture<ThreeDfootComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThreeDfootComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreeDfootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
