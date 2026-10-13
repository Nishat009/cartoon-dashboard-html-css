import { Component, DestroyRef, ElementRef, NgZone, afterNextRender, inject, input, viewChild } from "@angular/core";
import Swiper from "swiper";
import { EffectCoverflow, Pagination } from "swiper/modules";
import { Slide } from "./models";

@Component({
  selector: "app-playlist-slider",
  templateUrl: "./playlist-slider.component.html"
})
export class PlaylistSliderComponent {
  readonly slides = input.required<Slide[]>();

  private readonly container = viewChild.required<ElementRef<HTMLElement>>("swiper");
  private readonly pagination = viewChild.required<ElementRef<HTMLElement>>("pagination");
  private swiper?: Swiper;

  constructor() {
    const zone = inject(NgZone);
    afterNextRender(() => zone.runOutsideAngular(() => {
      this.swiper = new Swiper(this.container().nativeElement, {
        modules: [EffectCoverflow, Pagination],
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        loop: true,
        speed: 600,
        slidesPerView: "auto",
        slideToClickedSlide: true,
        coverflowEffect: { rotate: 10, stretch: 120, depth: 200, modifier: 1, slideShadows: false },
        pagination: { el: this.pagination().nativeElement }
      });
    }));
    inject(DestroyRef).onDestroy(() => this.swiper?.destroy());
  }
}
