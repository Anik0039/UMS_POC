# User Management - Angular 19 Project

A clean and modern Angular 19 application built with standalone components, shadcn/ui styling, and comprehensive code quality tools.

## 🚀 Features

- **Angular 19** with standalone components (no NgModules)
- **shadcn/ui** integration with Tailwind CSS
- **Dark/Light theme** support with system preference detection
- **ESLint** with Angular-specific rules
- **Prettier** for consistent code formatting
- **Well-organized folder structure** for scalability
- **TypeScript** with strict configuration

## 📁 Project Structure

```
src/
├── app/                    # Main application module
├── components/             # Global components
├── services/               # Global services
├── models/                 # TypeScript interfaces and types
├── shared/                 # Shared utilities and components
│   ├── components/         # Reusable UI components
│   ├── services/           # Shared services
│   └── utils/              # Utility functions
├── features/               # Feature-based modules
│   └── users/              # User management feature
│       ├── components/     # User-specific components
│       └── services/       # User-specific services
└── lib/                    # Library utilities
    └── utils.ts            # Class name utility (cn)
```

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Available Scripts

```bash
# Development server
npm run dev          # Start dev server with auto-open
npm start            # Start dev server

# Building
npm run build        # Build for production
npm run watch        # Build in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm test             # Run unit tests
```

## 🎨 Styling

This project uses **shadcn/ui** components with **Tailwind CSS**. The design system includes:

- CSS custom properties for theming
- Light and dark mode support
- Responsive design utilities
- Consistent component styling

### Theme Customization

Theme colors are defined in `src/styles.scss` using CSS custom properties. You can customize:

- Primary and secondary colors
- Background and foreground colors
- Border and accent colors
- Component-specific styling

## 🔧 Code Quality

### ESLint Configuration

- Angular-specific rules
- TypeScript strict mode
- Accessibility checks
- Import/export organization

### Prettier Configuration

- Consistent code formatting
- Angular template support
- Automatic formatting on save (recommended)

## 🌟 Components

### Button Component

A flexible button component with multiple variants:

```typescript
<app-button variant="default" size="lg">
  Click me
</app-button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `default`, `sm`, `lg`, `icon`

### Theme Toggle

Automatic theme switching with system preference detection:

```typescript
<app-theme-toggle></app-theme-toggle>
```

## 📦 Dependencies

### Core
- Angular 19
- TypeScript 5.7
- RxJS 7.8

### Styling
- Tailwind CSS 4.1
- shadcn/ui utilities
- Lucide icons

### Development
- ESLint with Angular rules
- Prettier
- Angular CLI

## 🚀 Getting Started

1. **Clone and install:**
   ```bash
   npm install
   ```

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 📝 Next Steps

This project provides a solid foundation for building Angular applications. Consider adding:

- State management (NgRx or Akita)
- HTTP interceptors
- Authentication guards
- Unit and e2e tests
- CI/CD pipeline
- Additional shadcn/ui components

## 🤝 Contributing

1. Follow the existing code style
2. Run `npm run lint:fix` before committing
3. Ensure all tests pass
4. Use conventional commit messages

---

**Happy coding!** 🎉
