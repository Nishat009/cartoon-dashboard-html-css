import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { authInterceptor } from "./app/auth.interceptor";

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch((error: unknown) => console.error("Unable to start the application.", error));
