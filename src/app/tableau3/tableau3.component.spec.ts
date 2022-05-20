import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Tableau3Component } from './tableau3.component';

describe('Tableau3Component', () => {
  let component: Tableau3Component;
  let fixture: ComponentFixture<Tableau3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Tableau3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Tableau3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
