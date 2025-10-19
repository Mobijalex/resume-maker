/**
 * Tests for accessibility utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AccessibilityManager, KeyboardNavigation, AriaUtils } from '../accessibility';

// Mock DOM methods
const mockElement = {
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    textContent: '',
    style: { cssText: '' },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    focus: vi.fn(),
    dispatchEvent: vi.fn(),
    querySelectorAll: vi.fn(() => []),
};

const mockDocument = {
    createElement: vi.fn(() => mockElement),
    body: {
        appendChild: vi.fn(),
    },
    getElementById: vi.fn(() => mockElement),
    activeElement: mockElement,
};

// Mock window.matchMedia
const mockMatchMedia = vi.fn((query: string) => ({
    matches: query.includes('reduce') || query.includes('high'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
}));

// Setup global mocks
Object.defineProperty(global, 'document', {
    value: mockDocument,
    writable: true,
});

Object.defineProperty(global, 'window', {
    value: {
        matchMedia: mockMatchMedia,
    },
    writable: true,
});

describe('AccessibilityManager', () => {
    let manager: AccessibilityManager;

    beforeEach(() => {
        vi.clearAllMocks();
        manager = AccessibilityManager.getInstance();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const manager1 = AccessibilityManager.getInstance();
            const manager2 = AccessibilityManager.getInstance();
            expect(manager1).toBe(manager2);
        });
    });

    describe('Screen Reader Announcements', () => {
        it('should create announcer element on initialization', () => {
            expect(mockDocument.createElement).toHaveBeenCalledWith('div');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('class', 'sr-only');
            expect(mockDocument.body.appendChild).toHaveBeenCalledWith(mockElement);
        });

        it('should announce messages with polite priority', () => {
            manager.announce('Test message');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
            expect(mockElement.textContent).toBe('Test message');
        });

        it('should announce messages with assertive priority', () => {
            manager.announce('Urgent message', 'assertive');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
            expect(mockElement.textContent).toBe('Urgent message');
        });

        it('should clear message after timeout', () => {
            vi.useFakeTimers();
            manager.announce('Test message');
            expect(mockElement.textContent).toBe('Test message');

            vi.advanceTimersByTime(1100);
            expect(mockElement.textContent).toBe('');
            vi.useRealTimers();
        });
    });

    describe('ID Generation', () => {
        it('should generate unique IDs with default prefix', () => {
            const id1 = manager.generateId();
            const id2 = manager.generateId();

            expect(id1).toMatch(/^a11y-\d+-[a-z0-9]+$/);
            expect(id2).toMatch(/^a11y-\d+-[a-z0-9]+$/);
            expect(id1).not.toBe(id2);
        });

        it('should generate unique IDs with custom prefix', () => {
            const id = manager.generateId('custom');
            expect(id).toMatch(/^custom-\d+-[a-z0-9]+$/);
        });
    });

    describe('Focus Trap', () => {
        it('should create focus trap with event listeners', () => {
            const container = mockElement as any;
            const focusableElements = [mockElement, mockElement];

            container.querySelectorAll = vi.fn(() => focusableElements as any);

            const cleanup = manager.createFocusTrap(container);

            expect(container.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
            expect(focusableElements[0].focus).toHaveBeenCalled();

            // Test cleanup
            cleanup();
            expect(container.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });

    describe('Color Contrast', () => {
        it('should calculate contrast ratio for hex colors', () => {
            const result = manager.checkColorContrast('#000000', '#ffffff');

            expect(result.ratio).toBeGreaterThan(20); // Black on white has very high contrast
            expect(result.passesAA).toBe(true);
            expect(result.passesAAA).toBe(true);
        });

        it('should identify failing contrast ratios', () => {
            const result = manager.checkColorContrast('#888888', '#999999');

            expect(result.ratio).toBeLessThan(4.5);
            expect(result.passesAA).toBe(false);
            expect(result.passesAAA).toBe(false);
        });
    });

    describe('Configuration', () => {
        it('should update configuration', () => {
            manager.updateConfig({ announceChanges: false });
            const config = manager.getConfig();

            expect(config.announceChanges).toBe(false);
        });

        it('should detect reduced motion preference', () => {
            const config = manager.getConfig();
            expect(config.reducedMotion).toBe(true); // Based on our mock
        });

        it('should detect high contrast preference', () => {
            const prefersHighContrast = manager.prefersHighContrast();
            expect(prefersHighContrast).toBe(true); // Based on our mock
        });
    });
});

describe('KeyboardNavigation', () => {
    const mockItems = [
        { focus: vi.fn() } as any,
        { focus: vi.fn() } as any,
        { focus: vi.fn() } as any,
    ];

    const mockOnIndexChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Arrow Navigation', () => {
        it('should handle ArrowDown navigation', () => {
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            event.preventDefault = vi.fn();

            KeyboardNavigation.handleArrowNavigation(event, mockItems, 0, mockOnIndexChange);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnIndexChange).toHaveBeenCalledWith(1);
            expect(mockItems[1].focus).toHaveBeenCalled();
        });

        it('should handle ArrowUp navigation', () => {
            const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
            event.preventDefault = vi.fn();

            KeyboardNavigation.handleArrowNavigation(event, mockItems, 2, mockOnIndexChange);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnIndexChange).toHaveBeenCalledWith(1);
            expect(mockItems[1].focus).toHaveBeenCalled();
        });

        it('should handle Home key navigation', () => {
            const event = new KeyboardEvent('keydown', { key: 'Home' });
            event.preventDefault = vi.fn();

            KeyboardNavigation.handleArrowNavigation(event, mockItems, 2, mockOnIndexChange);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnIndexChange).toHaveBeenCalledWith(0);
            expect(mockItems[0].focus).toHaveBeenCalled();
        });

        it('should handle End key navigation', () => {
            const event = new KeyboardEvent('keydown', { key: 'End' });
            event.preventDefault = vi.fn();

            KeyboardNavigation.handleArrowNavigation(event, mockItems, 0, mockOnIndexChange);

            expect(event.preventDefault).toHaveBeenCalled();
            expect(mockOnIndexChange).toHaveBeenCalledWith(2);
            expect(mockItems[2].focus).toHaveBeenCalled();
        });

        it('should not exceed array bounds', () => {
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
            event.preventDefault = vi.fn();

            KeyboardNavigation.handleArrowNavigation(event, mockItems, 2, mockOnIndexChange);

            expect(mockOnIndexChange).toHaveBeenCalledWith(2); // Should stay at last index
        });

        it('should ignore non-navigation keys', () => {
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            event.preventDefault = vi.fn();

            KeyboardNavigation.handleArrowNavigation(event, mockItems, 1, mockOnIndexChange);

            expect(event.preventDefault).not.toHaveBeenCalled();
            expect(mockOnIndexChange).not.toHaveBeenCalled();
        });
    });

    describe('Tab Navigation', () => {
        it('should handle Tab key for next navigation', () => {
            const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false });
            const onNext = vi.fn();
            const onPrevious = vi.fn();

            KeyboardNavigation.handleTabNavigation(event, onNext, onPrevious);

            expect(onNext).toHaveBeenCalled();
            expect(onPrevious).not.toHaveBeenCalled();
        });

        it('should handle Shift+Tab for previous navigation', () => {
            const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
            const onNext = vi.fn();
            const onPrevious = vi.fn();

            KeyboardNavigation.handleTabNavigation(event, onNext, onPrevious);

            expect(onPrevious).toHaveBeenCalled();
            expect(onNext).not.toHaveBeenCalled();
        });
    });
});

describe('AriaUtils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Described By Relationships', () => {
        it('should create new describedby relationship', () => {
            mockElement.getAttribute.mockReturnValue(null);

            AriaUtils.createDescribedBy('element-id', 'description-id');

            expect(mockDocument.getElementById).toHaveBeenCalledWith('element-id');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-describedby', 'description-id');
        });

        it('should append to existing describedby relationship', () => {
            mockElement.getAttribute.mockReturnValue('existing-id');

            AriaUtils.createDescribedBy('element-id', 'description-id');

            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-describedby', 'existing-id description-id');
        });
    });

    describe('Live Region Updates', () => {
        it('should update live region with message', () => {
            AriaUtils.updateLiveRegion('region-id', 'Test message');

            expect(mockDocument.getElementById).toHaveBeenCalledWith('region-id');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'polite');
            expect(mockElement.textContent).toBe('Test message');
        });

        it('should update live region with assertive priority', () => {
            AriaUtils.updateLiveRegion('region-id', 'Urgent message', 'assertive');

            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
            expect(mockElement.textContent).toBe('Urgent message');
        });
    });

    describe('Expanded State', () => {
        it('should set aria-expanded to true', () => {
            AriaUtils.setExpanded('element-id', true);

            expect(mockDocument.getElementById).toHaveBeenCalledWith('element-id');
            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
        });

        it('should set aria-expanded to false', () => {
            AriaUtils.setExpanded('element-id', false);

            expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
        });
    });
});