import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, signal, viewChild } from "@angular/core";
import { FALLBACK_COVER, TRACKS } from "./dashboard-data";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  protected readonly error = signal('');
  protected readonly progress = computed(() => (this.duration() ? (this.currentTime() / this.duration()) * 100 : 0));
  protected readonly equalizerDelays = [0, 0.3, 0.15, 0.45];
  protected readonly controlClass = "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[rgba(200,187,255,0.6)] text-[1.1rem] text-white shadow-control transition-all duration-300 ease-linear";

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

  selectTrack(index: number): void {
    if (!this.tracks[index]) return;
    this.index.set(index);
    this.load();
    this.play();
  }

  protected skip(step: number): void {
    this.index.update((index) => (index + step + this.tracks.length) % this.tracks.length);
    this.load();
    this.play();
  }

  protected seek(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (!Number.isFinite(this.duration()) || this.duration() <= 0) return;
    this.audio().nativeElement.currentTime = value;
    this.currentTime.set(value);
  }

  protected timeUpdate(): void {
    const audio = this.audio().nativeElement;
    this.currentTime.set(audio.currentTime);
  }

  protected metadataLoaded(): void {
    const audio = this.audio().nativeElement;
    this.duration.set(Number.isFinite(audio.duration) ? audio.duration : 0);
    this.currentTime.set(audio.currentTime);
  }

  protected coverFailed(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(FALLBACK_COVER)) img.src = FALLBACK_COVER;
  }

  protected play(): void {
    this.error.set('');
    // Browsers can refuse playback (e.g. no network); the icon then stays on "play".
    this.audio().nativeElement.play().catch(() => {
      this.playing.set(false);
      this.error.set('Unable to play this track. Please try again or skip to the next song.');
    });
  }

  protected playbackFailed(): void {
    this.playing.set(false);
    this.error.set('Unable to load this track. Please try the next song.');
  }

  private load(): void {
    this.error.set('');
    this.audio().nativeElement.src = this.track().source;
    this.currentTime.set(0);
    this.duration.set(0);
  }
}
