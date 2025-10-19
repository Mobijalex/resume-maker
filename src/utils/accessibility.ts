/**
 * Accessibility utilities for WCAG 2.1 Level AA compliance
 */

export interface AccessibilityConfig {
    announceChanges: boolean;
    enableKeyboardNavigation: boolean;
    highContrastMode: boolean;
    reducedMotion: boolean;
}

export class AccessibilityManager {
    private static instance: AccessibilityManager;
    private config: AccessibilityConfig;
    private announcer: HTMLElement | null = null;

    private constructor() {
        this.config = {
            announceChanges: true,
            enableKeyboardNavigation: true,
            highContrastMode: false,
            reducedMotion: this.prefersReducedMotion(),
        };
        this.initializeAnnouncer();
    }

    public static getInstance(): AccessibilityManager {
        if (!AccessibilityManager.instance) {
            AccessibilityManager.instance = new AccessibilityManager();
        }
        return AccessibilityManager.instance;
    }

    /**
     * Initialize screen reader announcer
     */
    private initializeAnnouncer(): void {
        if (typeof document === 'undefined') return;

        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.setAttribute('class', 'sr-only');
        this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
        document.body.appendChild(this.announcer);
    }

    /**
     * Announce message to screen readers
     */
    public announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
        if (!this.config.announceChanges || !this.announcer) return;

        this.announcer.setAttribute('aria-live', priority);
        this.announcer.textContent = message;

        // Clear after announcement to allow repeated messages
        setTimeout(() => {
            if (this.announcer) {
                this.announcer.textContent = '';
            }
        }, 1000);
    }

    /**
     * Check if user prefers reduced motion
     */
    private prefersReducedMotion(): boolean {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * Check if user prefers high contrast
     */
    public prefersHighContrast(): boolean {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-contrast: high)').matches;
    }

    /**
     * Generate unique ID for accessibility
     */
    public generateId(prefix: string = 'a11y'): string {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Create focus trap for modals and dialogs
     */
    public createFocusTrap(container: HTMLElement): () => void {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                // Let the component handle escape
                container.dispatchEvent(new CustomEvent('escape-pressed'));
            }
        };

        container.addEventListener('keydown', handleTabKey);
        container.addEventListener('keydown', handleEscapeKey);

        // Focus first element
        if (firstElement) {
            firstElement.focus();
        }

        // Return cleanup function
        return () => {
            container.removeEventListener('keydown', handleTabKey);
            container.removeEventListener('keydown', handleEscapeKey);
        };
    }

    /**
     * Check color contrast ratio
     */
    public checkColorContrast(foreground: string, background: string): {
        ratio: number;
        passesAA: boolean;
        passesAAA: boolean;
    } {
        const getLuminance = (color: string): number => {
            // Simple RGB extraction (assumes hex colors)
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;

            const sRGB = [r, g, b].map(c => {
                return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            });

            return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
        };

        const l1 = getLuminance(foreground);
        const l2 = getLuminance(background);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

        return {
            ratio,
            passesAA: ratio >= 4.5,
            passesAAA: ratio >= 7,
        };
    }

    /**
     * Update configuration
     */
    public updateConfig(updates: Partial<AccessibilityConfig>): void {
        this.config = { ...this.config, ...updates };
    }

    /**
     * Get current configuration
     */
    public getConfig(): AccessibilityConfig {
        return { ...this.config };
    }
}

/**
 * Hook for React components to use accessibility features
 */
export const useAccessibility = () => {
    const manager = AccessibilityManager.getInstance();

    return {
        announce: manager.announce.bind(manager),
        generateId: manager.generateId.bind(manager),
        createFocusTrap: manager.createFocusTrap.bind(manager),
        checkColorContrast: manager.checkColorContrast.bind(manager),
        prefersHighContrast: manager.prefersHighContrast.bind(manager),
        config: manager.getConfig(),
    };
};

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
    /**
     * Handle arrow key navigation in lists
     */
    handleArrowNavigation: (
        event: KeyboardEvent,
        items: HTMLElement[],
        currentIndex: number,
        onIndexChange: (index: number) => void
    ) => {
        let newIndex = currentIndex;

        switch (event.key) {
            case 'ArrowDown':
                newIndex = Math.min(currentIndex + 1, items.length - 1);
                break;
            case 'ArrowUp':
                newIndex = Math.max(currentIndex - 1, 0);
                break;
            case 'Home':
                newIndex = 0;
                break;
            case 'End':
                newIndex = items.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        onIndexChange(newIndex);
        items[newIndex]?.focus();
    },

    /**
     * Handle tab navigation with custom logic
     */
    handleTabNavigation: (
        event: KeyboardEvent,
        onNext: () => void,
        onPrevious: () => void
    ) => {
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                onPrevious();
            } else {
                onNext();
            }
        }
    },
};

/**
 * ARIA utilities
 */
export const AriaUtils = {
    /**
     * Create ARIA describedby relationship
     */
    createDescribedBy: (elementId: string, descriptionId: string) => {
        const element = document.getElementById(elementId);
        if (element) {
            const existingDescribedBy = element.getAttribute('aria-describedby');
            const newDescribedBy = existingDescribedBy
                ? `${existingDescribedBy} ${descriptionId}`
                : descriptionId;
            element.setAttribute('aria-describedby', newDescribedBy);
        }
    },

    /**
     * Update ARIA live region
     */
    updateLiveRegion: (regionId: string, message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const region = document.getElementById(regionId);
        if (region) {
            region.setAttribute('aria-live', priority);
            region.textContent = message;
        }
    },

    /**
     * Set ARIA expanded state
     */
    setExpanded: (elementId: string, expanded: boolean) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.setAttribute('aria-expanded', expanded.toString());
        }
    },
};