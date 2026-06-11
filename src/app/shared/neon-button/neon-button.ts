import { Component, input } from '@angular/core';

export type NeonButtonVariant = 'primary' | 'ghost';

/**
 * Neon-styled button. Attaches to a native `<button>` element so it keeps
 * full keyboard / a11y semantics. Use `variant` to switch between the
 * gradient primary CTA and the glass ghost button.
 */
@Component({
  selector: 'button[appNeon]',
  template: '<ng-content />',
  styleUrl: './neon-button.css',
  host: {
    class: 'neon',
    '[class.primary]': "variant() === 'primary'",
    '[class.ghost]': "variant() === 'ghost'",
  },
})
export class NeonButtonComponent {
  readonly variant = input<NeonButtonVariant>('primary');
}
