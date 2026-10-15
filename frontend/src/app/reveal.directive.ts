import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject } from "@angular/core";

/** Fades an element up the first time it scrolls into view. */
@Directive({
  selector: "[appReveal]",
  host: { class: "reveal" }
})
export class RevealDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    let observer: IntersectionObserver | undefined;

    afterNextRender(() => zone.runOutsideAngular(() => {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px -24px 0px", threshold: 0.05 });
      observer.observe(element);
    }));
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }
}
