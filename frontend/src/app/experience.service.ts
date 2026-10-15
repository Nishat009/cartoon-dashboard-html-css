import { DestroyRef, Injectable, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { Cartoon } from './models';

export type Panel = { kind: 'cartoon'; cartoon: Cartoon } | { kind: 'settings' | 'library' };
@Injectable({ providedIn: 'root' })
export class ExperienceService {
  readonly panel = signal<Panel | null>(null);
  readonly softBackground = signal(false);
  readonly motion = signal(true);
  private readonly reducedMotion = signal(false);
  readonly animationsEnabled = computed(() => this.motion() && !this.reducedMotion());

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => this.reducedMotion.set(preference.matches);
      update();
      preference.addEventListener('change', update);
      destroy.onDestroy(() => preference.removeEventListener('change', update));
    });
    try {
      const saved = JSON.parse(localStorage.getItem('cartoon-preferences') || 'null');
      this.softBackground.set(saved?.softBackground === true);
      this.motion.set(saved?.motion !== false);
    } catch { /* Preferences remain usable when storage is unavailable. */ }
    effect(() => {
      document.documentElement.classList.toggle('soft-background', this.softBackground());
      document.documentElement.classList.toggle('calm-motion', !this.animationsEnabled());
      try { localStorage.setItem('cartoon-preferences', JSON.stringify({ softBackground: this.softBackground(), motion: this.motion() })); } catch { /* Session only. */ }
    });
  }
}
