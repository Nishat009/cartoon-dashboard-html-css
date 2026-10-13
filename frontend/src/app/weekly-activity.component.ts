import { Component, computed, input } from "@angular/core";
import { DayActivity } from "./models";

/** Formats minutes as "1h 50m" / "45m". */
function duration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

@Component({
  selector: "app-weekly-activity",
  templateUrl: "./weekly-activity.component.html",
  host: { class: "glass-card block p-5" }
})
export class WeeklyActivityComponent {
  readonly days = input.required<DayActivity[]>();
  readonly favorites = input.required<number>();

  protected readonly duration = duration;
  protected readonly total = computed(() => this.days().reduce((sum, day) => sum + day.minutes, 0));
  protected readonly peak = computed(() => Math.max(...this.days().map((day) => day.minutes)));
}
