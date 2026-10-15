import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
@Component({ selector: 'app-dashboard-header', changeDetection: ChangeDetectionStrategy.OnPush, templateUrl: './dashboard-header.component.html' })
export class DashboardHeaderComponent {
  readonly greeting = input.required<string>();
  readonly firstName = input.required<string>();
  readonly query = input('');
  readonly queryChange = output<string>();
  readonly searchSubmit = output<void>();
  protected submit(event: Event): void { event.preventDefault(); this.searchSubmit.emit(); }
}
