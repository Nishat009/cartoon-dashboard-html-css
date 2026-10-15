import { inject } from '@angular/core';
import { ExperienceService } from './experience.service';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CARTOONS } from './dashboard-data';
import { FavoriteButtonComponent } from './favorite-button.component';
import { GenreTile } from './models';

@Component({
  selector: 'app-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FavoriteButtonComponent],
  template: `
    <div class="catalog-toolbar">
      <div><h2 id="trending-title" class="section-title">Discover your next favorite</h2>
        <p class="mt-2 text-sm opacity-75" role="status">{{ results().length }} shows{{ genre() === 'All' ? '' : ' in ' + genre() }}</p></div>
      <label class="sort-control">Sort by
        <select [value]="sort()" (change)="sort.set($any($event.target).value)">
          <option value="popular">Most watched</option><option value="rating">Top rated</option><option value="title">Title A–Z</option>
        </select>
      </label>
    </div>
    @if (query() || genre() !== 'All') {
      <div class="catalog-filter mb-4 flex flex-wrap items-center gap-3 text-sm"><span>{{ query() ? 'Search: ' + query() : genre() }}</span>
        <button class="reset-filter" type="button" (click)="reset.emit()">Clear filters ×</button></div>
    }
    <ol class="catalog-grid">
      @for (cartoon of results(); track cartoon.id; let i = $index) {
        <li class="catalog-card">
          <div class="catalog-art"><button class="catalog-open" type="button" [attr.aria-label]="'View ' + cartoon.title" (click)="experience.panel.set({ kind: 'cartoon', cartoon })"><img [src]="cartoon.image" [alt]="cartoon.title" width="400" height="300" loading="lazy" decoding="async"></button>
            <span class="catalog-rank">{{ (i + 1).toString().padStart(2, '0') }}</span>
            <app-favorite-button class="absolute top-3 right-3" [cartoon]="cartoon" /></div>
          <div class="p-4"><p class="mb-1 text-xs font-bold tracking-wider text-plum uppercase">{{ cartoon.genre }}</p>
            <h3 class="truncate font-extrabold" [title]="cartoon.title">{{ cartoon.title }}</h3>
            <div class="mt-3 flex justify-between text-xs opacity-75"><span>★ {{ cartoon.rating }}</span><span>{{ views(cartoon.views) }} views</span></div></div>
        </li>
      } @empty {
        <li class="catalog-empty"><span class="text-3xl">⌕</span><h3 class="mt-2 font-bold">No shows found</h3>
          <p class="my-2 text-sm">Try another title or explore all genres.</p><button type="button" class="reset-filter" (click)="reset.emit()">Show all cartoons</button></li>
      }
    </ol>
  `
})
export class CatalogComponent {
  protected readonly experience = inject(ExperienceService);
  readonly query = input('');
  readonly genre = input<GenreTile['name']>('All');
  readonly reset = output<void>();
  protected readonly sort = signal('popular');
  private readonly number = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
  protected readonly results = computed(() => {
    const query = this.query().trim().toLowerCase();
    return CARTOONS.filter(item => (this.genre() === 'All' || item.genre === this.genre()) &&
      `${item.title} ${item.genre}`.toLowerCase().includes(query))
      .sort((a, b) => this.sort() === 'rating' ? b.rating - a.rating : this.sort() === 'title' ? a.title.localeCompare(b.title) : b.views - a.views);
  });
  protected views(value: number): string { return this.number.format(value); }
}
