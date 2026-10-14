import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from "@angular/core";

/** Fades an element up the first time it scrolls into view. */
@Directive({
  selector: "[appReveal]",
  host: { class: "reveal" }
})
export class RevealDirective {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    let observer: IntersectionObserver | undefined;

    afterNextRender(() => {
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      }, { rootMargin: "0px 0px -8% 0px" });
      observer.observe(element);
    });
    inject(DestroyRef).onDestroy(() => observer?.disconnect());
  }
}
