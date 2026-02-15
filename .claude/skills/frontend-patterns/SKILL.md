---
name: notion-minimal
description: Create clean, minimalist frontends inspired by Notion's design philosophy. Use when building productivity tools, dashboards, documentation sites, workspace applications, or any interface requiring clarity, efficiency, and calm aesthetics. Emphasizes typography hierarchy, subtle interactions, and functional elegance.
---

# Notion Minimal - Frontend Design Skill

This skill guides the creation of minimalist, Notion-inspired frontend interfaces that prioritize clarity, usability, and calm aesthetics. Build production-grade applications with the refined simplicity that makes tools like Notion, Linear, and Stripe feel effortless.

## Philosophy

Notion's design excellence stems from:
- **Clarity over decoration**: Every element serves a purpose
- **Typography as the foundation**: Hierarchy, spacing, and readability first
- **Subtle, purposeful interactions**: Smooth transitions that feel natural
- **Restrained color**: Use color sparingly and meaningfully
- **Information density without clutter**: Dense when needed, spacious when not
- **Calm, focused environments**: Reduce visual noise to enhance concentration

This skill applies these principles to create interfaces that feel professional, trustworthy, and timeless.

## Design System

### Color Palette

Use a neutral foundation with minimal accent colors:

```css
:root {
  /* Neutrals - The foundation (use 7-9 shades) */
  --gray-50: #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #e5e5e5;
  --gray-300: #d4d4d4;
  --gray-400: #a3a3a3;
  --gray-500: #737373;
  --gray-600: #525252;
  --gray-700: #404040;
  --gray-800: #262626;
  --gray-900: #171717;

  /* Semantic colors */
  --background: #ffffff;
  --surface: #fafafa;
  --surface-hover: #f5f5f5;
  --border: #e5e5e5;
  --border-hover: #d4d4d4;
  --text-primary: #171717;
  --text-secondary: #525252;
  --text-tertiary: #a3a3a3;

  /* Single accent color (choose ONE that fits context) */
  --accent: #2563eb;        /* Blue - default */
  --accent-hover: #1d4ed8;
  --accent-light: #dbeafe;
  
  /* Status colors (only when needed) */
  --success: #059669;
  --success-light: #d1fae5;
  --warning: #d97706;
  --warning-light: #fed7aa;
  --error: #dc2626;
  --error-light: #fee2e2;
}

/* Dark mode variant */
[data-theme="dark"] {
  --background: #0a0a0a;
  --surface: #171717;
  --surface-hover: #262626;
  --border: #262626;
  --border-hover: #404040;
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --text-tertiary: #525252;
}
```

**Color principles:**
- Use neutrals (grays) for 95% of the interface
- Accent color only for primary actions and key interactive elements
- Status colors only when communicating state (success/warning/error)
- Avoid colorful backgrounds - prefer subtle grays
- Dark mode should invert gracefully

### Typography

Typography is the primary design tool. Use a type scale with careful hierarchy:

```css
:root {
  /* Font families - Choose TWO maximum */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
  
  /* Alternative sans-serif options (pick ONE): */
  /* --font-sans: 'Inter', ... */              /* Default - excellent all-rounder */
  /* --font-sans: 'IBM Plex Sans', ... */      /* Slightly warmer, friendly */
  /* --font-sans: 'DM Sans', ... */            /* Geometric, clean */
  /* --font-sans: 'Manrope', ... */            /* Rounded, modern */
  /* --font-sans: 'General Sans', ... */       /* Contemporary, balanced */
  /* --font-sans: 'Satoshi', ... */            /* Rounded, elegant */

  /* Type scale (modular scale: 1.125 - perfect fourth) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Letter spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
}

/* Typography system */
.text-display {
  font-size: var(--text-4xl);
  font-weight: 600;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.text-heading-1 {
  font-size: var(--text-3xl);
  font-weight: 600;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
}

.text-heading-2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  line-height: var(--leading-tight);
}

.text-heading-3 {
  font-size: var(--text-xl);
  font-weight: 600;
  line-height: var(--leading-normal);
}

.text-body {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--text-primary);
}

.text-body-sm {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--text-secondary);
}

.text-caption {
  font-size: var(--text-xs);
  line-height: var(--leading-normal);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  font-weight: 500;
}
```

**Typography principles:**
- Use font weights sparingly: 400 (normal), 500 (medium), 600 (semibold)
- Never use more than 3 weights in one interface
- Body text: 16px minimum, line-height 1.5-1.75
- Headings: Tight line-height (1.25), negative letter-spacing
- Labels/captions: Uppercase, wide tracking, smaller size

### Spacing System

Use a consistent spacing scale (8px base):

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

**Spacing principles:**
- Use the scale consistently - no arbitrary values
- Generous white space creates clarity
- Group related elements with smaller gaps (4-8px)
- Separate unrelated sections with larger gaps (24-48px)
- Page margins: 24px mobile, 48-96px desktop

### Components

#### Buttons

```css
/* Primary button - ONE per view */
.btn-primary {
  padding: 0 var(--space-4);
  height: 36px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background 150ms ease;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

/* Secondary button - Most common */
.btn-secondary {
  padding: 0 var(--space-4);
  height: 36px;
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--border-hover);
}

/* Ghost button - Subtle actions */
.btn-ghost {
  padding: 0 var(--space-3);
  height: 32px;
  background: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 4px;
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-ghost:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}
```

**Button principles:**
- Only ONE primary button per screen
- Use secondary as default
- Ghost for tertiary actions
- Icons before text, 4px gap
- Loading state: subtle spinner, maintain button size
- Disabled: 50% opacity, no hover

#### Inputs

```css
.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all 150ms ease;
}

.input:hover {
  border-color: var(--border-hover);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.input::placeholder {
  color: var(--text-tertiary);
}

/* Input with label */
.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.input-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.input-hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}
```

**Input principles:**
- Always include labels (no floating labels)
- Use placeholders for examples, not instructions
- Error state: red border, no background change
- Focus state: subtle shadow in accent color
- Consistent height: 40px for all inputs

#### Cards

```css
.card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: var(--space-6);
  transition: all 150ms ease;
}

.card-hover {
  cursor: pointer;
}

.card-hover:hover {
  border-color: var(--border-hover);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Compact card variant */
.card-compact {
  padding: var(--space-4);
}

/* Card with sections */
.card-header {
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-4);
}

.card-footer {
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
  margin-top: var(--space-4);
}
```

**Card principles:**
- Subtle borders, never heavy shadows
- Hover state: lighter shadow, border change
- Don't stack cards inside cards
- Use consistent padding (16-24px)

#### Tables

```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  text-align: left;
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.table tr:hover td {
  background: var(--surface-hover);
}

.table tr:last-child td {
  border-bottom: none;
}
```

**Table principles:**
- Headers: uppercase, small, gray
- Hover entire row
- No vertical borders
- Align numbers right
- Use monospace for numbers/code

### Layout Patterns

#### Sidebar Navigation

```css
.app-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar-item {
  padding: var(--space-2) var(--space-3);
  border-radius: 4px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 150ms ease;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.sidebar-item:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.sidebar-item.active {
  background: var(--accent-light);
  color: var(--accent);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-8) var(--space-10);
}
```

#### Page Header

```css
.page-header {
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.page-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
}

.page-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}
```

#### Grid Layouts

```css
/* Dashboard grid */
.grid-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

/* Content grid (2-column) */
.grid-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-8);
}

/* List layout */
.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
```

### Interactions & Animations

Keep animations subtle and fast:

```css
:root {
  /* Timing */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;
  
  /* Easing */
  --ease-out: cubic-bezier(0.2, 0, 0, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Apply to modals */
.modal {
  animation: scale-in var(--duration-normal) var(--ease-out);
}

/* Apply to tooltips */
.tooltip {
  animation: fade-in var(--duration-fast) var(--ease-out);
}

/* Apply to page transitions */
.page-enter {
  animation: slide-up var(--duration-normal) var(--ease-out);
}
```

**Animation principles:**
- Fast: 150ms for hover states
- Normal: 250ms for most transitions
- Slow: 400ms for page/modal transitions
- Use ease-out for exits, ease-in-out for page loads
- Stagger multiple elements with animation-delay
- Never animate layout properties (width/height) - use transform/opacity

### Micro-interactions

```css
/* Button press effect */
.btn:active {
  transform: scale(0.98);
}

/* Checkbox */
.checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.checkbox:checked {
  background: var(--accent);
  border-color: var(--accent);
  background-image: url("data:image/svg+xml,..."); /* Checkmark SVG */
}

/* Toggle switch */
.toggle {
  width: 44px;
  height: 24px;
  background: var(--gray-300);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background var(--duration-normal) var(--ease-in-out);
}

.toggle::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: transform var(--duration-normal) var(--ease-in-out);
}

.toggle.active {
  background: var(--accent);
}

.toggle.active::after {
  transform: translateX(20px);
}

/* Skeleton loader */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 0%,
    var(--gray-100) 50%,
    var(--gray-200) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Icons

Use a consistent icon system:
- **Lucide** (recommended): Clean, minimal, 24px default
- **Heroicons**: Modern, 20/24px variants
- **Phosphor**: Versatile, multiple weights

```jsx
// React example with Lucide
import { Search, Plus, Settings, ChevronDown } from 'lucide-react';

<button className="btn-primary">
  <Plus size={16} />
  <span>Add Item</span>
</button>
```

**Icon principles:**
- 16px in buttons
- 20px in navigation
- 24px for standalone icons
- Always pair with text for primary actions
- Use consistent stroke width (1.5-2px)
- Avoid mixing icon libraries

## React Component Patterns

### Base Button Component

```jsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils'; // Tailwind merge utility

const Button = forwardRef(({ 
  variant = 'secondary', 
  size = 'default',
  className,
  children,
  isLoading,
  icon,
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover',
    secondary: 'bg-transparent border border-border hover:bg-surface-hover hover:border-border-hover',
    ghost: 'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary'
  };
  
  const sizes = {
    sm: 'h-8 px-3 text-sm rounded',
    default: 'h-9 px-4 text-sm rounded-md',
    lg: 'h-11 px-6 text-base rounded-lg'
  };
  
  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader className="animate-spin" size={16} />
      ) : icon && (
        <span>{icon}</span>
      )}
      {children}
    </button>
  );
});
```

### Input Component

```jsx
const Input = forwardRef(({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-3 bg-background border border-border rounded-md',
            'text-sm text-text-primary placeholder:text-text-tertiary',
            'transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20',
            'hover:border-border-hover',
            error && 'border-error focus:border-error focus:ring-error/20',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {rightIcon}
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-text-tertiary">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  );
});
```

### Card Component

```jsx
const Card = ({ 
  children, 
  hover = false,
  className,
  header,
  footer,
  ...props 
}) => {
  return (
    <div
      className={cn(
        'bg-background border border-border rounded-lg p-6',
        'transition-all',
        hover && 'cursor-pointer hover:border-border-hover hover:shadow-sm',
        className
      )}
      {...props}
    >
      {header && (
        <div className="pb-4 border-b border-border mb-4">
          {header}
        </div>
      )}
      {children}
      {footer && (
        <div className="pt-4 border-t border-border mt-4">
          {footer}
        </div>
      )}
    </div>
  );
};
```

### Modal Component

```jsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <Dialog.Title className="text-lg font-semibold">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded hover:bg-surface-hover transition-colors"
                  >
                    <X size={20} className="text-text-secondary" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="flex justify-end gap-3 p-6 border-t border-border">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
```

### Dropdown Menu

```jsx
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDown } from 'lucide-react';

const Dropdown = ({ trigger, items }) => {
  return (
    <Menu as="div" className="relative">
      <Menu.Button className="inline-flex items-center gap-2">
        {trigger}
        <ChevronDown size={16} className="text-text-tertiary" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="py-1">
            {items.map((item, index) => (
              <Menu.Item key={index}>
                {({ active }) => (
                  <button
                    onClick={item.onClick}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2 text-sm',
                      active ? 'bg-surface-hover text-text-primary' : 'text-text-secondary'
                    )}
                  >
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
```

## Tailwind Configuration

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        accent: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#dbeafe',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.5' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.75' }],
        lg: ['1.125rem', { lineHeight: '1.75' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.25' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 12px rgba(0, 0, 0, 0.05)',
        md: '0 6px 16px rgba(0, 0, 0, 0.08)',
        lg: '0 12px 24px rgba(0, 0, 0, 0.10)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '400ms',
      },
    },
  },
  plugins: [],
};
```

## Accessibility Guidelines

Minimalism should never compromise accessibility:

```css
/* Focus states */
*:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Skip to content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent);
  color: white;
  padding: var(--space-2) var(--space-4);
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

**Accessibility checklist:**
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] All interactive elements keyboard accessible
- [ ] Focus states clearly visible
- [ ] ARIA labels for icon-only buttons
- [ ] Semantic HTML (nav, main, article, etc.)
- [ ] Form labels properly associated
- [ ] Loading states announced to screen readers
- [ ] Skip navigation link for keyboard users

## Implementation Checklist

When building a Notion-style interface:

**Foundation:**
- [ ] CSS variables for all design tokens
- [ ] Neutral color palette (grays + one accent)
- [ ] Type scale with consistent hierarchy
- [ ] 8px spacing system
- [ ] Dark mode support (if applicable)

**Components:**
- [ ] Buttons: primary, secondary, ghost variants
- [ ] Inputs with labels and states
- [ ] Cards with subtle borders
- [ ] Tables with hover states
- [ ] Modals with backdrop blur
- [ ] Dropdowns with smooth transitions

**Interactions:**
- [ ] Hover states on all interactive elements
- [ ] Focus states for keyboard navigation
- [ ] Loading states for async actions
- [ ] Error states with clear messages
- [ ] Success feedback (toasts/inline messages)

**Layout:**
- [ ] Responsive sidebar navigation
- [ ] Generous white space
- [ ] Consistent page structure
- [ ] Mobile-friendly breakpoints

**Polish:**
- [ ] Smooth transitions (150-250ms)
- [ ] Subtle animations on mount
- [ ] Skeleton loaders for data
- [ ] Empty states with helpful messages
- [ ] Consistent icon usage

## Common Patterns

### Dashboard Layout

```jsx
const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Revenue" value="$12,450" change="+12.5%" />
        <StatCard title="Active Users" value="1,234" change="+8.2%" />
        <StatCard title="Conversion" value="3.2%" change="-2.1%" />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {/* Activity list */}
        </Card>
        <Card>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          {/* Actions */}
        </Card>
      </div>
    </div>
  );
};
```

### Settings Page

```jsx
const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-8">Settings</h1>
      
      {/* Tabs navigation */}
      <div className="flex gap-6 border-b border-border mb-8">
        <Tab active>Profile</Tab>
        <Tab>Account</Tab>
        <Tab>Billing</Tab>
        <Tab>Notifications</Tab>
      </div>

      {/* Settings sections */}
      <div className="space-y-8">
        <SettingSection 
          title="Profile Information"
          description="Update your personal details"
        >
          <Input label="Full Name" defaultValue="John Doe" />
          <Input label="Email" type="email" defaultValue="john@example.com" />
        </SettingSection>

        <SettingSection 
          title="Preferences"
          description="Customize your experience"
        >
          <Toggle label="Email notifications" />
          <Toggle label="Dark mode" />
        </SettingSection>
      </div>
    </div>
  );
};
```

### Empty States

```jsx
const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-md">{description}</p>
      {action && action}
    </div>
  );
};

// Usage
<EmptyState
  icon={<FileText className="text-text-tertiary" size={24} />}
  title="No documents yet"
  description="Create your first document to get started with organizing your work."
  action={
    <Button variant="primary" icon={<Plus size={16} />}>
      Create Document
    </Button>
  }
/>
```

## Do's and Don'ts

### ✅ Do:
- Use consistent spacing from the 8px scale
- Keep color palette minimal (grays + one accent)
- Prioritize typography hierarchy
- Add subtle hover states to interactive elements
- Use loading skeletons for content
- Provide clear empty states
- Maintain 4.5:1 contrast ratios minimum
- Test keyboard navigation
- Use semantic HTML

### ❌ Don't:
- Use multiple accent colors
- Add heavy shadows or gradients
- Overcomplicate layouts
- Mix different icon styles
- Use more than 2-3 font weights
- Animate layout properties
- Ignore loading/error states
- Skip mobile responsiveness
- Use color as the only indicator

## Example Tech Stack

For a complete Notion-style app:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@headlessui/react": "^1.7.17",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

## Resources

- **Fonts**: [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Components**: [Headless UI](https://headlessui.com/)
- **Colors**: [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- **Inspiration**: Notion, Linear, Stripe, Vercel

---

## Summary

This skill creates minimalist, Notion-inspired frontends by:

1. **Starting with typography** - Clear hierarchy, readable sizes
2. **Using neutral colors** - Grays for structure, one accent for interaction
3. **Maintaining consistency** - Design tokens, spacing scale, component patterns
4. **Adding subtle interactions** - Fast transitions, smooth animations
5. **Prioritizing clarity** - White space, clean layouts, purposeful elements
6. **Ensuring accessibility** - Contrast, keyboard nav, semantic HTML

The result: interfaces that feel calm, professional, and effortless to use.
