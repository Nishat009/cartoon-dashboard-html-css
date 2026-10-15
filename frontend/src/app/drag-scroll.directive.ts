import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, effect, inject } from '@angular/core';
import { ExperienceService } from './experience.service';

/** Scrolls visible collections gently, yielding to mouse, touch and keyboard input. */
@Directive({
  selector: '[appDragScroll]',
  host: { class: 'scroll-row cursor-grab overflow-x-auto', tabindex: '0', 'aria-label': 'Scrollable collection' }
})
export class DragScrollDirective {
  constructor() {
    const row = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const experience = inject(ExperienceService);
    const zone = inject(NgZone);
    let visible = false;
    let hovering = false;
    let focused = false;
    let pressed = false;
    let dragging = false;
    let moved = false;
    let startX = 0;
    let startScroll = 0;
    let direction = 1;
    let position = 0;
    let lastWritten = 0;
    let maximum = 0;
    let frame = 0;
    let previous = 0;
    let waiting = false;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;
    let intersection: IntersectionObserver | undefined;
    let resize: ResizeObserver | undefined;

    const allowed = () => visible && experience.animationsEnabled() && !experience.panel() &&
      !document.hidden && !hovering && !focused && !pressed && !waiting && maximum > 1;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; previous = 0; };
    const tick = (now: number) => {
      frame = 0;
      if (!allowed()) { previous = 0; return; }
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      // Keep subpixel progress, but pick up native touch/scrollbar movement.
      if (Math.abs(row.scrollLeft - lastWritten) > 1) position = row.scrollLeft;
      position = Math.max(0, Math.min(maximum, position + direction * elapsed * 0.028));
      row.scrollLeft = position;
      lastWritten = row.scrollLeft;
      // Reverse gently at either end so every original card stays interactive.
      if (position >= maximum) direction = -1;
      else if (position <= 0) direction = 1;
      frame = requestAnimationFrame(tick);
    };
    const sync = () => zone.runOutsideAngular(() => {
      if (!allowed()) { stop(); return; }
      if (!frame) {
        position = row.scrollLeft;
        lastWritten = position;
        previous = 0;
        frame = requestAnimationFrame(tick);
      }
    });
    const rest = () => {
      waiting = true;
      stop();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { waiting = false; sync(); }, 2200);
    };
    effect(() => { experience.animationsEnabled(); experience.panel(); sync(); });

    const enter = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') { hovering = true; sync(); }
    };
    const leave = () => { hovering = false; sync(); };
    const down = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      pressed = true;
      dragging = event.pointerType === 'mouse';
      moved = false;
      startX = event.clientX;
      startScroll = row.scrollLeft;
      sync();
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 4) moved = true;
      if (!moved) return;
      event.preventDefault();
      row.scrollLeft = startScroll - distance;
    };
    const up = () => {
      if (!pressed) return;
      pressed = dragging = false;
      rest();
    };
    const click = (event: MouseEvent) => {
      if (moved) { event.preventDefault(); event.stopPropagation(); }
      moved = false;
    };
    const focus = () => { focused = true; sync(); };
    const blur = (event: FocusEvent) => { focused = row.contains(event.relatedTarget as Node | null); sync(); };
    const key = (event: KeyboardEvent) => {
      if (event.target !== row || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      rest();
      if (event.key === 'Home' || event.key === 'End') row.scrollLeft = event.key === 'Home' ? 0 : maximum;
      else row.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * row.clientWidth * 0.75, behavior: 'instant' });
    };
    afterNextRender(() => zone.runOutsideAngular(() => {
      row.addEventListener('pointerenter', enter);
      row.addEventListener('pointerleave', leave);
      row.addEventListener('pointerdown', down);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', up);
      row.addEventListener('click', click, true);
      row.addEventListener('focusin', focus);
      row.addEventListener('focusout', blur);
      row.addEventListener('keydown', key);
      row.addEventListener('wheel', rest, { passive: true });
      document.addEventListener('visibilitychange', sync);
      intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.15 });
      intersection.observe(row);
      resize = new ResizeObserver(() => { maximum = Math.max(0, row.scrollWidth - row.clientWidth); sync(); });
      resize.observe(row);
      for (const child of Array.from(row.children)) resize.observe(child);
    }));
    inject(DestroyRef).onDestroy(() => {
      stop();
      clearTimeout(resumeTimer);
      intersection?.disconnect();
      resize?.disconnect();
      row.removeEventListener('pointerenter', enter);
      row.removeEventListener('pointerleave', leave);
      row.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      row.removeEventListener('click', click, true);
      row.removeEventListener('focusin', focus);
      row.removeEventListener('focusout', blur);
      row.removeEventListener('keydown', key);
      row.removeEventListener('wheel', rest);
      document.removeEventListener('visibilitychange', sync);
    });
  }
}
