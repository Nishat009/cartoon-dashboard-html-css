import { DestroyRef, Directive, ElementRef, NgZone, inject } from "@angular/core";

/** Lets a horizontal row be scrolled by dragging it with the mouse. */
@Directive({
  selector: "[appDragScroll]",
  host: { class: "scroll-row cursor-grab overflow-x-auto" }
})
export class DragScrollDirective {
  private dragging = false;
  private moved = false;
  private startX = 0;
  private scrollLeft = 0;

  constructor() {
    const row = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const listeners: [string, EventListener, boolean?][] = [
      ["mousedown", (event) => {
        this.dragging = true;
        this.moved = false;
        this.startX = (event as MouseEvent).pageX - row.offsetLeft;
        this.scrollLeft = row.scrollLeft;
      }],
      ["mousemove", (event) => {
        if (!this.dragging) return;
        event.preventDefault();
        const step = ((event as MouseEvent).pageX - row.offsetLeft - this.startX) * 0.6;
        if (Math.abs(step) > 3) this.moved = true;
        row.scrollLeft = this.scrollLeft - step;
      }],
      ["mouseup", () => (this.dragging = false)],
      ["mouseleave", () => (this.dragging = false)],
      // A drag that ends over a button should not also press it.
      ["click", (event) => { if (this.moved) event.stopPropagation(); this.moved = false; }, true]
    ];

    // Mouse moves would otherwise run change detection for the whole page.
    inject(NgZone).runOutsideAngular(() => {
      for (const [type, listener, capture] of listeners) row.addEventListener(type, listener, capture);
    });
    inject(DestroyRef).onDestroy(() => {
      for (const [type, listener, capture] of listeners) row.removeEventListener(type, listener, capture);
    });
  }
}
