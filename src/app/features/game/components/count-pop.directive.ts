import { Directive, effect, ElementRef, inject, input } from '@angular/core';

/**
 * Pops its host (`scale 1 → 1.3 → 1`) whenever the watched value changes —
 * the "count pop" from the design handoff. The first value is ignored so the
 * initial paint stays still; the `.pop` class is added imperatively (drop →
 * reflow → re-add, like the prototype) and removed on `animationend`, so the
 * resting state is always the visible one (SSR / reduced-motion safe).
 */
@Directive({
  selector: '[appCountPop]',
  host: { '(animationend)': 'onEnd($event)' },
})
export class CountPopDirective {
  /** The value to watch; a change (after the first) triggers the pop. */
  readonly appCountPop = input.required<unknown>();

  private seen = false;
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    effect(() => {
      this.appCountPop();
      if (!this.seen) {
        this.seen = true;
        return;
      }
      if (this.reducedMotion()) {
        return;
      }
      const node = this.el.nativeElement;
      node.classList.remove('pop');
      void node.offsetWidth; // force reflow so the animation restarts
      node.classList.add('pop');
    });
  }

  protected onEnd(event: AnimationEvent): void {
    if (event.animationName === 'count-pop') {
      this.el.nativeElement.classList.remove('pop');
    }
  }

  private reducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
