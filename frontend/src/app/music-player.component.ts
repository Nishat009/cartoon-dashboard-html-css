import { Component, ElementRef, afterNextRender, computed, signal, viewChild } from "@angular/core";
import { FALLBACK_COVER, TRACKS } from "./dashboard-data";

@Component({
  selector: "app-music-player",
  templateUrl: "./music-player.component.html",
  host: { class: "glass-card flex flex-col items-center justify-center px-5 py-[30px] text-[#241010] backdrop-blur-[10px]" }
})
export class MusicPlayerComponent {
  private readonly tracks = TRACKS;
  private readonly index = signal(0);
  private readonly audio = viewChild.required<ElementRef<HTMLAudioElement>>("audio");

  protected readonly track = computed(() => this.tracks[this.index()]);
  protected readonly playing = signal(false);
  protected readonly currentTime = signal(0);
  protected readonly duration = signal(0);
  protected readonly progress = computed(() => (this.duration() ? (this.currentTime() / this.duration()) * 100 : 0));
  protected readonly equalizerDelays = [0, 0.3, 0.15, 0.45];
  protected readonly controlClass = "m-5 flex aspect-square w-9 cursor-pointer items-center justify-center rounded-full bg-[rgba(200,187,255,0.6)] text-[1.1rem] text-white shadow-control transition-all duration-300 ease-linear max-[1250px]:m-[15px] max-[700px]:m-5";

  constructor() {
    afterNextRender(() => this.load());
  }

  /** Formats seconds as "m:ss". */
  protected clock(seconds: number): string {
    const whole = Number.isFinite(seconds) ? Math.floor(seconds) : 0;
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
  }

  protected togglePlay(): void {
    if (this.audio().nativeElement.paused) this.play();
    else this.audio().nativeElement.pause();
  }

  protected skip(step: number): void {
    this.index.update((index) => (index + step + this.tracks.length) % this.tracks.length);
    this.load();
    this.play();
  }

  protected seek(event: Event): void {
    this.audio().nativeElement.currentTime = Number((event.target as HTMLInputElement).value);
  }

  protected timeUpdate(): void {
    const audio = this.audio().nativeElement;
    if (!audio.paused) this.currentTime.set(audio.currentTime);
  }

  protected metadataLoaded(): void {
    const audio = this.audio().nativeElement;
    this.duration.set(audio.duration);
    this.currentTime.set(audio.currentTime);
  }

  protected coverFailed(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(FALLBACK_COVER)) img.src = FALLBACK_COVER;
  }

  protected play(): void {
    // Browsers can refuse playback (e.g. no network); the icon then stays on "play".
    this.audio().nativeElement.play().catch(() => this.playing.set(false));
  }

  private load(): void {
    this.audio().nativeElement.src = this.track().source;
    this.currentTime.set(0);
    this.duration.set(0);
  }
}
