import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

/**
 * Parallaxes the host element toward the cursor by writing `--rot-x` / `--rot-y`
 * (degrees) that the host's `transform` consumes. Coalesces pointer events to
 * one update per frame, eases back to rest on `pointerleave`, and is a no-op
 * under `prefers-reduced-motion`.
 */
@Directive({
  selector: '[appPointerParallax]',
  host: {
    '(window:pointermove)': 'onPointerMove($event)',
    '(window:pointerleave)': 'reset()',
  },
})
export class PointerParallaxDirective {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  /** Latest pointer position, applied once per animation frame. */
  private pointerX = 0;
  private pointerY = 0;
  private frameId: number | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.frameId !== null) {
        cancelAnimationFrame(this.frameId);
      }
    });
    this.write(0, 0);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (this.reducedMotion()) {
      return;
    }
    this.pointerX = event.clientX;
    this.pointerY = event.clientY;
    // Coalesce bursts of pointer events into a single per-frame update.
    if (this.frameId === null) {
      this.frameId = requestAnimationFrame(() => this.apply());
    }
  }

  /** Ease back to rest when the pointer leaves the window. */
  protected reset(): void {
    this.write(0, 0);
  }

  private apply(): void {
    this.frameId = null;
    const offsetX = this.pointerX / window.innerWidth - 0.5;
    const offsetY = this.pointerY / window.innerHeight - 0.5;
    this.write(-offsetY * 6, offsetX * 8);
  }

  private write(rotX: number, rotY: number): void {
    this.host.style.setProperty('--rot-x', `${rotX}deg`);
    this.host.style.setProperty('--rot-y', `${rotY}deg`);
  }

  private reducedMotion(): boolean {
    return (
      typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }
}
