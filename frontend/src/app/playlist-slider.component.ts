import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, input, output, viewChild } from "@angular/core";
import Swiper from "swiper";
import { A11y, EffectCoverflow, Keyboard, Pagination } from "swiper/modules";
import { Slide } from "./models";

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

  constructor() {
    const zone = inject(NgZone);
    afterNextRender(() => zone.runOutsideAngular(() => {
      this.swiper = new Swiper(this.container().nativeElement, {
        modules: [A11y, EffectCoverflow, Keyboard, Pagination],
        keyboard: { enabled: true, onlyInViewport: true },
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        loop: true,
        speed: 600,
        slidesPerView: "auto",
        slideToClickedSlide: true,
        coverflowEffect: { rotate: 10, stretch: 120, depth: 200, modifier: 1, slideShadows: false },
        pagination: { el: this.pagination().nativeElement, clickable: true }
      });
    }));
    inject(DestroyRef).onDestroy(() => this.swiper?.destroy());
  }
}
