import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BetDirection } from '../../services/game.service';
import { BetControlsComponent } from './bet-controls';

describe('BetControlsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BetControlsComponent] });
  });

  function create(disabled = false): {
    fixture: ComponentFixture<BetControlsComponent>;
    host: HTMLElement;
  } {
    const fixture = TestBed.createComponent(BetControlsComponent);
    fixture.componentRef.setInput('disabled', disabled);
    fixture.detectChanges();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('emits (bet) with the chosen direction', () => {
    const { fixture, host } = create();
    const seen: BetDirection[] = [];
    fixture.componentInstance.bet.subscribe((d) => seen.push(d));
    (host.querySelector('.betbtn.lower') as HTMLButtonElement).click();
    (host.querySelector('.betbtn.higher') as HTMLButtonElement).click();
    expect(seen).toEqual(['lower', 'higher']);
  });

  it('disables both buttons when disabled=true', () => {
    const { host } = create(true);
    const buttons = host.querySelectorAll<HTMLButtonElement>('.betbtn');
    expect(buttons.length).toBe(2);
    expect([...buttons].every((b) => b.disabled)).toBe(true);
  });
});
