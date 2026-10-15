import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, inject, viewChild } from '@angular/core';
import { BOOKS, CARTOONS, PREMIERES } from './dashboard-data';
import { ExperienceService } from './experience.service';
import { LibraryService } from './library.service';

@Component({
  selector: 'app-detail-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dialog class="detail-dialog" aria-labelledby="dialog-title" (cancel)="close()" (close)="close()" (click)="backdrop($event)">
      @if (experience.panel(); as panel) {
        <div class="dialog-inner">
          <button autofocus type="button" class="dialog-close" aria-label="Close dialog" (click)="close()">×</button>
          @if (panel.kind === 'cartoon') {
            <img class="dialog-cover" [src]="panel.cartoon.image" [alt]="panel.cartoon.title" width="640" height="360">
            <div class="dialog-body">
              <p class="eyebrow">{{ panel.cartoon.genre }} · ★ {{ panel.cartoon.rating }}</p>
              <h2 id="dialog-title">{{ panel.cartoon.title }}</h2>
              <p class="mt-3 leading-relaxed opacity-80">A little adventure for your next break. Save this title to your favorites or discover more stories in the catalog.</p>
              <button type="button" class="primary-action mt-5" [attr.aria-pressed]="library.favorites().has(panel.cartoon.id)" (click)="library.toggleFavorite(panel.cartoon.id)">
                {{ library.favorites().has(panel.cartoon.id) ? '♥ Saved to favorites' : '♡ Add to favorites' }}
              </button>
              <p class="mt-4 text-sm opacity-65">This is a discovery dashboard. Full episodes are not hosted here.</p>
            </div>
          } @else if (panel.kind === 'settings') {
            <div class="dialog-body">
              <p class="eyebrow">Make yourself at home</p><h2 id="dialog-title">Your preferences</h2>
              <label class="preference-row"><span><strong>Soft background</strong><small>A quieter version of the original artwork</small></span>
                <input type="checkbox" [checked]="experience.softBackground()" (change)="experience.softBackground.set($any($event.target).checked)"></label>
              <label class="preference-row"><span><strong>Decorative animations</strong><small>Turn off movement for a calmer experience</small></span>
                <input type="checkbox" [checked]="experience.motion()" (change)="experience.motion.set($any($event.target).checked)"></label>
              <p class="mt-4 text-sm opacity-70">Your preferences are saved in this browser.</p>
            </div>
          } @else {
            <div class="dialog-body">
              <p class="eyebrow">Your own little collection</p><h2 id="dialog-title">Saved library</h2>
              <h3 class="mt-6 mb-3 font-bold">Cartoons · {{ library.favorites().size }}</h3>
              @for (cartoon of cartoons; track cartoon.id) {
                @if (library.favorites().has(cartoon.id)) { <div class="saved-row"><span>{{ cartoon.title }}</span><button type="button" [attr.aria-label]="'Remove ' + cartoon.title + ' from favorites'" (click)="library.toggleFavorite(cartoon.id)">Remove</button></div> }
              }
              @if (!library.favorites().size) { <p class="text-sm opacity-70">Save a cartoon with its heart button.</p> }
              <h3 class="mt-6 mb-3 font-bold">Read later · {{ library.books().size }}</h3>
              @for (book of books; track book.id) {
                @if (library.books().has(book.id)) { <div class="saved-row"><span>{{ book.title }}</span><button type="button" [attr.aria-label]="'Remove ' + book.title + ' from reading list'" (click)="library.toggleBook(book.id)">Remove</button></div> }
              }
              @if (!library.books().size) { <p class="text-sm opacity-70">Bookmark a comic to keep it here.</p> }
              <h3 class="mt-6 mb-3 font-bold">Premiere reminders · {{ library.reminders().size }}</h3>
              @for (premiere of premieres; track premiere.id) {
                @if (library.reminders().has(premiere.id)) { <div class="saved-row"><span>{{ premiere.title }}<small>{{ premiere.date }}</small></span><button type="button" [attr.aria-label]="'Remove reminder for ' + premiere.title" (click)="library.toggleReminder(premiere.id)">Remove</button></div> }
              }
              @if (!library.reminders().size) { <p class="text-sm opacity-70">Tap a premiere bell to save a reminder.</p> }
              <p class="mt-5 text-xs opacity-65">Saved locally. Reminders do not send notifications.</p>
            </div>
          }
        </div>
      }
    </dialog>
  `
})
export class DetailDialogComponent {
  protected readonly experience = inject(ExperienceService);
  protected readonly library = inject(LibraryService);
  protected readonly books = BOOKS;
  protected readonly cartoons = CARTOONS;
  protected readonly premieres = PREMIERES;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.experience.panel()) { if (!dialog.open) dialog.showModal(); }
      else if (dialog.open) dialog.close();
    });
  }
  protected close(): void { this.experience.panel.set(null); }
  protected backdrop(event: MouseEvent): void {
    if (event.target !== this.dialog().nativeElement) return;
    const rect = this.dialog().nativeElement.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.close();
  }
}
