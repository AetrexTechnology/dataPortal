import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreedfeetmoduleComponent } from './threedfeetmodule.component';

describe('ThreedfeetmoduleComponent', () => {
  let component: ThreedfeetmoduleComponent;
  let fixture: ComponentFixture<ThreedfeetmoduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThreedfeetmoduleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ThreedfeetmoduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
