import { Component, computed, inject, input } from "@angular/core";
import { LibraryService } from "./library.service";
import { Cartoon } from "./models";

@Component({
  selector: "app-favorite-button",
  template: `
    <button type="button" (click)="library.toggleFavorite(cartoon().id)" [attr.aria-pressed]="active()" [attr.aria-label]="'Favorite ' + cartoon().title"
      class="grid size-9 cursor-pointer place-items-center rounded-full bg-white/70 text-grape shadow-control transition hover:scale-110">
      <i [class]="active() ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
    </button>
  `
})
export class FavoriteButtonComponent {
  readonly cartoon = input.required<Cartoon>();
  protected readonly library = inject(LibraryService);
  protected readonly active = computed(() => this.library.favorites().has(this.cartoon().id));
}
