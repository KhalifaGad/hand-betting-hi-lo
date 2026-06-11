import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LandingPageComponent } from './landing-page';

function mockMatchMedia(matches: boolean): void {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

function enterEvent(target: EventTarget): Event {
  const event = new KeyboardEvent('keydown', { key: 'Enter' });
  Object.defineProperty(event, 'target', { value: target });
  return event;
}

describe('LandingPageComponent', () => {
  beforeEach(() => {
    // reduced motion → newGame() navigates synchronously (no timers)
    mockMatchMedia(true);
    TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  function create(): {
    fixture: ComponentFixture<LandingPageComponent>;
    navigate: ReturnType<typeof vi.spyOn>;
  } {
    const fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    return { fixture, navigate };
  }

  it('deals in (navigates to /game) when Enter is pressed with nothing interactive focused', () => {
    const { fixture, navigate } = create();
    fixture.componentInstance['onEnterKey'](enterEvent(document.body));
    expect(navigate).toHaveBeenCalledWith(['/game']);
  });

  it('ignores Enter when a button is the event target', () => {
    const { fixture, navigate } = create();
    const button = document.createElement('button');
    fixture.componentInstance['onEnterKey'](enterEvent(button));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('ignores Enter while the How to Play modal is open', () => {
    const { fixture, navigate } = create();
    fixture.componentInstance['howToOpen'].set(true);
    fixture.componentInstance['onEnterKey'](enterEvent(document.body));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('drives the reshuffle/bust copy from GAME_CONFIG', () => {
    const { fixture } = create();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('3 reshuffles to bust');
    expect(text).toContain('reach 0');
    expect(text).toContain('10 and the tile is out');
  });
});
