import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, effect, inject, input, output, viewChild } from "@angular/core";
import Swiper from "swiper";
import { A11y, Autoplay, EffectCoverflow, Keyboard, Pagination } from "swiper/modules";
import { Slide } from "./models";
import { ExperienceService } from "./experience.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-playlist-slider",
  templateUrl: "./playlist-slider.component.html"
})
export class PlaylistSliderComponent {
  readonly choose = output<string>();
  readonly slides = input.required<Slide[]>();

  private readonly container = viewChild.required<ElementRef<HTMLElement>>("swiper");
  private readonly pagination = viewChild.required<ElementRef<HTMLElement>>("pagination");
  private swiper?: Swiper;
  private readonly experience = inject(ExperienceService);
  private visible = false;
  private hovering = false;
  private focused = false;

  constructor() {
    const zone = inject(NgZone);
    let observer: IntersectionObserver | undefined;
    let cleanup = () => {};
    const sync = () => zone.runOutsideAngular(() => {
      if (!this.swiper) return;
      const enabled = this.experience.animationsEnabled();
      this.swiper.params.speed = enabled ? 650 : 0;
      const run = enabled && !this.experience.panel() && this.visible && !this.hovering && !this.focused && !document.hidden;
      if (run && !this.swiper.autoplay.running) this.swiper.autoplay.start();
      if (!run && this.swiper.autoplay.running) this.swiper.autoplay.stop();
    });
    effect(() => { this.experience.animationsEnabled(); this.experience.panel(); sync(); });
    afterNextRender(() => zone.runOutsideAngular(() => {
      const container = this.container().nativeElement;
      this.swiper = new Swiper(container, {
        modules: [A11y, Autoplay, EffectCoverflow, Keyboard, Pagination],
        autoplay: { delay: 2800, disableOnInteraction: false },
        keyboard: { enabled: true, onlyInViewport: true },
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        loop: true,
        speed: this.experience.animationsEnabled() ? 650 : 0,
        slidesPerView: "auto",
        slideToClickedSlide: true,
        coverflowEffect: { rotate: 10, stretch: 120, depth: 200, modifier: 1, slideShadows: false },
        pagination: { el: this.pagination().nativeElement, clickable: true }
      });
      sync();
      const enter = (event: PointerEvent) => { if (event.pointerType !== 'mouse') return; this.hovering = true; sync(); };
      const leave = () => { this.hovering = false; sync(); };
      const focus = () => { this.focused = true; sync(); };
      const blur = (event: FocusEvent) => { this.focused = container.contains(event.relatedTarget as Node | null); sync(); };
      container.addEventListener('pointerenter', enter);
      container.addEventListener('pointerleave', leave);
      container.addEventListener('focusin', focus);
      container.addEventListener('focusout', blur);
      document.addEventListener('visibilitychange', sync);
      observer = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; sync(); }, { threshold: 0.15 });
      observer.observe(container);
      cleanup = () => {
        container.removeEventListener('pointerenter', enter);
        container.removeEventListener('pointerleave', leave);
        container.removeEventListener('focusin', focus);
        container.removeEventListener('focusout', blur);
        document.removeEventListener('visibilitychange', sync);
      };
    }));
    inject(DestroyRef).onDestroy(() => { observer?.disconnect(); cleanup(); this.swiper?.destroy(); });
  }
}
