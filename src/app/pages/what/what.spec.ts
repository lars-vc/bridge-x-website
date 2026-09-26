import { ComponentFixture, TestBed } from '@angular/core/testing';

import { What } from './what';

describe('What', () => {
  let component: What;
  let fixture: ComponentFixture<What>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [What],
    }).compileComponents();

    fixture = TestBed.createComponent(What);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
