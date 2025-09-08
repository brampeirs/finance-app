import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, ThemeToggleComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('Finance App');
  protected readonly themeService = inject(ThemeService);
}
