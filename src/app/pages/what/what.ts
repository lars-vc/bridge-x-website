import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, signal, ViewChildren } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-what',
  imports: [RouterLink],
  templateUrl: './what.html',
  styleUrl: './what.scss',
})
export class What implements AfterViewInit, OnDestroy {
  @ViewChildren('silverText') private silverTextElements!: QueryList<ElementRef<HTMLElement>>;

  readonly clarityLetters = Array.from("You can't improve what you can't see");
  readonly ambitionLetters = Array.from('A strategy that doesn\'t move is just a plan.');
  readonly transformationLetters = Array.from('We don\'t advise from the sidelines. We work alongside you.');
  readonly operatorLetters = Array.from('Not an advisor on the sidelines. An operator alongside you.');
  readonly silverTextVisibility = [signal(false), signal(false), signal(false), signal(false)];
  readonly prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private silverTextObserver?: IntersectionObserver;

  ngAfterViewInit(): void {
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
}
