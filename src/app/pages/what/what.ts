import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, signal, ViewChild, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-what',
  imports: [RouterLink, Footer],
  templateUrl: './what.html',
  styleUrl: './what.scss',
})
export class What implements AfterViewInit, OnDestroy {
  @ViewChildren('silverText') private silverTextElements!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('tileGrid') private tileGrid!: ElementRef<HTMLElement>;

  readonly clarityLetters = Array.from("You can't improve what you can't see");
  readonly ambitionLetters = Array.from('A strategy that doesn\'t move is just a plan.');
  readonly transformationLetters = Array.from('We don\'t advise from the sidelines. We work alongside you.');
  readonly operatorLetters = Array.from('Experience that connects. Execution that delivers.');
  readonly silverTextVisibility = [signal(false), signal(false), signal(false), signal(false)];
  selectedSituations: string[] = [];
  submissionMessage = '';
  isSubmitting = false;
  readonly prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private silverTextObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.tileGrid.nativeElement.querySelectorAll<HTMLElement>('.flippable-square').forEach((tile) => {
      const front = tile.querySelector<HTMLElement>('.square-front');
      if (!front) return;

      const imageAlt = front.querySelector('img')?.alt;
      const textLabel = front.textContent?.trim().replace(/\s+/g, ' ');
      tile.tabIndex = 0;
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-pressed', 'false');
      tile.setAttribute('aria-label', imageAlt || textLabel || 'Show tile details');
    });

    this.silverTextObserver = new IntersectionObserver((entries) => {
      const elements = this.silverTextElements.toArray();
      for (const entry of entries) {
        const index = elements.findIndex((element) => element.nativeElement === entry.target);
        if (index < 0) continue;

        if (entry.intersectionRatio >= 0.35) {
          this.silverTextVisibility[index].set(true);
        } else if (!entry.isIntersecting) {
          this.silverTextVisibility[index].set(false);
        }
      }
    }, { threshold: [0, 0.35] });

    this.silverTextElements.forEach((element) => this.silverTextObserver?.observe(element.nativeElement));
  }

  ngOnDestroy(): void {
    this.silverTextObserver?.disconnect();
  }

  onSituationChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.selectedSituations = checkbox.checked
      ? [...this.selectedSituations, checkbox.value]
      : this.selectedSituations.filter((situation) => situation !== checkbox.value);
  }

  toggleTile(event: MouseEvent | KeyboardEvent): void {
    const tile = (event.target as Element).closest<HTMLElement>('.flippable-square');
    if (!tile?.querySelector('.square-flipper')) return;

    if (event instanceof KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
    }

    const isFlipped = tile.classList.toggle('is-flipped');
    tile.setAttribute('aria-pressed', String(isFlipped));
  }

  async onCtaSubmit(event: SubmitEvent): Promise<void> {
    // https://app.web3forms.com/forms/1786a01b-05b4-4d97-a562-bcb6de31e753/submissions
    event.preventDefault();
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    this.isSubmitting = true;
    this.submissionMessage = '';

    try {
      const formData = new FormData(form);
      formData.append('access_key', '1786a01b-05b4-4d97-a562-bcb6de31e753');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json() as { success?: boolean; message?: string };

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to send your message. Please try again.');
      }

      form.reset();
      this.selectedSituations = [];
      this.submissionMessage = 'Success! Your message has been sent.';
    } catch (error) {
      this.submissionMessage = error instanceof Error
        ? `Error: ${error.message}`
        : 'Something went wrong. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
