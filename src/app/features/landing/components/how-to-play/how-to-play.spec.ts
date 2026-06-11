import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HowToPlayComponent } from './how-to-play';

describe('HowToPlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HowToPlayComponent] });
  });

  function create(): { fixture: ComponentFixture<HowToPlayComponent>; dialog: HTMLDialogElement } {
    const fixture = TestBed.createComponent(HowToPlayComponent);
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('dialog') as HTMLDialogElement;
    return { fixture, dialog };
  }

  it('shows the modal when open=true and closes it when open=false', () => {
    const { fixture, dialog } = create();
    // jsdom doesn't implement showModal/close, so stub them (and reflect `open`).
    const showModal = vi.fn(() => {
      dialog.open = true;
    });
    const close = vi.fn(() => {
      dialog.open = false;
    });
    dialog.showModal = showModal;
    dialog.close = close;

    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(showModal).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('emits (closed) from the close button and (startPlaying) from Start playing', () => {
    const { fixture } = create();
    let closed = false;
    let started = false;
    fixture.componentInstance.closed.subscribe(() => (closed = true));
    fixture.componentInstance.startPlaying.subscribe(() => (started = true));

    const host = fixture.nativeElement as HTMLElement;
    (host.querySelector('.close') as HTMLButtonElement).click();

    const buttons = [...host.querySelectorAll('button')];
    const startButton = buttons.find((b) => b.textContent?.trim() === 'Start playing');
    startButton?.click();

    expect(closed).toBe(true);
    expect(started).toBe(true);
  });
});
