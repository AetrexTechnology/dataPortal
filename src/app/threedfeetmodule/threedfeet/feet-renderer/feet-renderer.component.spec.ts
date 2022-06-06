import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeetRendererComponent } from './feet-renderer.component';

describe('FeetRendererComponent', () => {
  let component: FeetRendererComponent;
  let fixture: ComponentFixture<FeetRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeetRendererComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeetRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
