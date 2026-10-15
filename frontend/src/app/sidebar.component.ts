import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { PRIMARY_NAV, SECONDARY_NAV, USER } from "./dashboard-data";
import { NavItem } from "./models";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  host: { class: "block select-none rounded-l-[15px] border-r border-[rgba(224,173,173,0.5)]" }
})
export class SidebarComponent {
  readonly active = input.required<string>();
  readonly navigate = output<NavItem>();

  protected readonly user = USER;
  protected readonly groups = [PRIMARY_NAV, SECONDARY_NAV];
}
