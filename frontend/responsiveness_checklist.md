# Responsiveness Checklist

## Global Layout

- [x] **AppShell**:
  - Desktop (1024px+): Visible sidebar, fixed width (256px).
  - Mobile (<1024px): Hidden sidebar, hamburger menu in TopBar.
  - Drawer mechanism implemented for mobile navigation.
- [x] **Container**: Max-width `7xl` with responsive padding (`p-4 sm:p-6 lg:p-8`).

## Components

- [x] **ResponsiveTable**:
  - Desktop: Standard table with headers.
  - Mobile: Stacked card view with key-value pairs.
  - Pagination controls adapt to screen size (minimal on mobile).
- [x] **Forms**:
  - Grid layout used (`grid-cols-1 md:grid-cols-2`).
  - Inputs span full width on mobile.
  - Button groups stack or flow naturally.
- [x] **Card**: Flexible padding (`p-4 sm:p-6`).

## Page Specifics

- [x] **Login**: Centered card layout, responsive width (`max-w-md`).
- [x] **Dashboard**:
  - Stats grid adapts (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
  - Welcome card stack content vertically on mobile.
- [x] **Patients List**:
  - Uses `ResponsiveTable`.
  - Search bar and "Add" button stack on mobile.
- [x] **Patient Details**:
  - Header info stacks on mobile.
  - Tabs are scrollable (`overflow-x-auto`) on mobile to avoid breaking layout.
- [x] **Appointments**:
  - Filters collapse into a panel on mobile (toggleable).
  - Uses `ResponsiveTable`.
- [x] **Medical Records / Billing**:
  - Uses `ResponsiveTable`.
  - Secondary columns hidden on mobile (`hideOnMobile: true`) to reduce clutter.

## Accessibility Notes

- [x] Keyboard navigation for buttons and inputs.
- [x] Focus states implemented (ring-2).
- [x] Semantic HTML (main, aside, nav, header).
- [x] Aria labels on icon-only buttons.
