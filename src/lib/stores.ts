export type Theme = 'light' | 'dark' | 'system';

// Apply theme class to document
export function applyThemeClass(theme: Theme): void {
	if (typeof window === 'undefined') return;
	const root = document.documentElement;
	if (theme === 'dark') {
		root.classList.add('dark');
	} else if (theme === 'light') {
		root.classList.remove('dark');
	} else {
		const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		root.classList.toggle('dark', systemDark);
	}
}

// Initialize theme from localStorage
export function initTheme(): Theme {
	if (typeof window === 'undefined') return 'system';
	const saved = localStorage.getItem('theme');
	if (saved === 'light' || saved === 'dark' || saved === 'system') {
		return saved;
	}
	return 'system';
}

// Save theme to localStorage
export function saveTheme(theme: Theme): void {
	if (typeof window === 'undefined') return;
	localStorage.setItem('theme', theme);
	applyThemeClass(theme);
}
