import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TRACKS } from './dashboard-data';

@Component({
  selector: 'app-track-list', changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 id="songs-title" class="section-title mb-5">Listen & unwind</h2>
    <p class="mb-4 text-sm opacity-70">A soundtrack for your break</p>
    <ul class="track-list">@for (track of tracks; track track.source; let i = $index) {
      <li><button type="button" (click)="choose.emit(i)" [attr.aria-label]="'Play ' + track.title">
        <span class="track-play" aria-hidden="true">▶</span><span class="min-w-0 flex-1"><strong class="block truncate">{{ track.title }}</strong><small>{{ track.artist }}</small></span>
        <span class="opacity-50" aria-hidden="true">↗</span>
      </button></li>
    }</ul>
  `
})
export class TrackListComponent {
  protected readonly tracks = TRACKS;
  readonly choose = output<number>();
}
