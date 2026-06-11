import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PointerParallaxDirective } from './pointer-parallax';

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

@Component({
  selector: 'app-parallax-host',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PointerParallaxDirective],
  template: '<div class="target" appPointerParallax></div>',
})
class ParallaxHostComponent {}

describe('PointerParallaxDirective', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
  });

  function setup() {
    TestBed.configureTestingModule({ imports: [ParallaxHostComponent] });
    const fixture = TestBed.createComponent(ParallaxHostComponent);
    fixture.detectChanges();
    const debugEl = fixture.debugElement.query(By.directive(PointerParallaxDirective));
    return {
      el: debugEl.nativeElement as HTMLElement,
      directive: debugEl.injector.get(PointerParallaxDirective),
    };
  }

  it('initializes --rot-x / --rot-y to 0deg', () => {
    mockMatchMedia(false);
    const { el } = setup();
    expect(el.style.getPropertyValue('--rot-x')).toBe('0deg');
    expect(el.style.getPropertyValue('--rot-y')).toBe('0deg');
  });

  it('does not update the rotation on pointermove under reduced motion', () => {
    mockMatchMedia(true);
    const { el, directive } = setup();
    const event = { clientX: 123, clientY: 456 } as unknown as PointerEvent;
    directive['onPointerMove'](event);
    expect(el.style.getPropertyValue('--rot-x')).toBe('0deg');
    expect(el.style.getPropertyValue('--rot-y')).toBe('0deg');
  });
});
