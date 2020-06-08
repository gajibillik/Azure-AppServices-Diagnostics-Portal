import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JavaFlightRecorderComponent } from './java-flight-recorder.component';

describe('JavaFlightRecorderComponent', () => {
  let component: JavaFlightRecorderComponent;
  let fixture: ComponentFixture<JavaFlightRecorderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JavaFlightRecorderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JavaFlightRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
