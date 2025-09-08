import { Injectable, signal, effect, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'finance-app-theme';

  // Signal to track current theme
  private readonly _theme = signal<Theme>(this.getInitialTheme());

  // Public readonly signal
  readonly theme = this._theme.asReadonly();

  constructor() {
    // Effect to apply theme changes to the document
    effect(() => {
      this.applyTheme(this._theme());
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this._theme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this._theme.set(theme);
    this.saveThemeToStorage(theme);
  }

  /**
   * Get the initial theme from localStorage or system preference
   */
  private getInitialTheme(): Theme {
    // Try to get theme from localStorage first
    const savedTheme = this.getThemeFromStorage();
    if (savedTheme) {
      return savedTheme;
    }

    // Fall back to system preference
    if (this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Apply theme to the document by adding/removing classes
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = this.document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemeToStorage(theme: Theme): void {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }

  /**
   * Get theme preference from localStorage
   */
  private getThemeFromStorage(): Theme | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved === 'light' || saved === 'dark' ? saved : null;
    } catch (error) {
      console.warn('Failed to read theme from localStorage:', error);
      return null;
    }
  }
}
