# Design Guidelines: Ruku na srce Volunteer Tracking System

## Design Approach
**Selected System**: Material Design principles adapted for humanitarian/nonprofit context
**Rationale**: Information-dense productivity application requiring clear data visualization, efficient workflows, and trust-building through clean, professional design

## Typography System

**Font Families** (Google Fonts):
- Primary: Inter (all weights 400-700) - UI elements, forms, tables
- Accent: Montserrat (500-700) - headers, statistics, key metrics

**Type Scale**:
- Hero numbers/stats: text-5xl (48px) - bold
- Page headers: text-3xl (30px) - semibold
- Section headers: text-xl (20px) - semibold
- Body text: text-base (16px) - regular
- Captions/metadata: text-sm (14px) - regular
- Labels/badges: text-xs (12px) - medium

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, and 12
- Component padding: p-4 to p-8
- Section spacing: space-y-6 to space-y-8
- Card gaps: gap-6
- Form field spacing: space-y-4

**Grid Structure**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Data tables: Full-width with responsive horizontal scroll
- Activity feeds: Single column with max-w-4xl
- Statistics overview: grid-cols-2 lg:grid-cols-4

**Container Widths**:
- Main content: max-w-7xl mx-auto px-6
- Forms/modals: max-w-2xl
- Activity details: max-w-4xl

## Core Component Library

### Navigation
**Admin Sidebar** (persistent):
- Width: w-64, sticky top-0, full height
- Sections: Dashboard, Scholars, Activities, Reports, Settings
- Icons: Heroicons (outline style)
- Active state: Subtle background treatment, semibold text

**Scholar Top Navigation**:
- Horizontal bar with logo left, user menu right
- Quick stats in center (Hours This Month, Total Hours)
- Mobile: Hamburger menu

### Dashboard Components

**Stat Cards**:
- Elevated cards with rounded-xl corners
- Large number (text-4xl) + label below
- Icon top-right corner
- Subtle shadow: shadow-md
- Padding: p-6

**Activity Table**:
- Zebra striping for rows
- Sticky header row
- Columns: Date, Scholar Name (admin), Activity, Category, Hours, Status, Actions
- Badge components for status (Pending, Approved, Rejected)
- Row hover state with cursor pointer
- Compact spacing: py-3 px-4

**Progress Indicators**:
- Horizontal progress bars showing monthly hour completion
- Label above: "15/20 hours completed"
- Visual threshold markers at requirement point
- Height: h-3, rounded-full

### Forms & Input

**Activity Submission Form**:
- Single column layout
- Field groups with labels (text-sm, font-medium, mb-2)
- Input fields: rounded-lg, p-3, border
- Textarea for description: min-h-32
- Date picker and duration inputs side-by-side (grid-cols-2)
- Category dropdown with icons
- Submit button: Full-width on mobile, auto on desktop

**Scholar Profile Card**:
- Two-column layout: Photo/info left, statistics right
- Avatar: rounded-full, w-24 h-24
- Info grid: Name, ID, Level (Elementary/High School/University), Required Hours
- Quick action buttons below

### Data Visualization

**Monthly Calendar View**:
- Grid showing activity days with dot indicators
- Approved activities: filled circle
- Pending: outlined circle
- Click to view day's activities

**Activity Feed**:
- Card-based timeline layout
- Each card: rounded-lg, p-4, space-y-2
- Header row: Activity title + timestamp
- Body: Category badge, description preview
- Footer: Hours badge, status badge, action buttons (admin only)
- Spacing between cards: space-y-4

### Modals & Overlays

**Approval Modal** (Admin):
- Centered overlay with backdrop blur
- Width: max-w-2xl
- Sections: Activity details, scholar info, approval form
- Comments textarea
- Action buttons: Approve (primary), Reject (secondary), Cancel

**Filter Panel** (Slide-over):
- From right edge, w-96
- Filter groups: Date Range, Status, Category, Scholar (admin)
- Apply/Reset buttons at bottom

## Micro-interactions

**Minimal Animation**:
- Button hover: subtle scale (scale-105)
- Card hover: shadow elevation change
- Status change: smooth opacity transition
- Loading states: Simple spinner, no elaborate animations

## Accessibility

**Consistent Patterns**:
- All form inputs: Clear labels, placeholder text, error states
- Focus states: Visible outline ring (ring-2)
- Button contrast: High contrast text on all button states
- Screen reader labels on icon-only buttons
- Keyboard navigation throughout

## Page-Specific Layouts

### Admin Dashboard
- Top row: 4 stat cards (Total Scholars, Active This Month, Pending Approvals, Hours This Month)
- Second row: Recent Activities table (6-8 rows) + Scholar Status sidebar
- Full-width table below for detailed activity log

### Scholar Dashboard  
- Welcome header with name and current month progress
- 3-column stat cards: This Month, Total Hours, Activities Pending
- Activity submission card (prominent, top priority)
- Recent activities feed below

### Activity Management (Admin)
- Filter bar at top (search, date range, status, category)
- Bulk action toolbar when items selected
- Table view with pagination
- Quick preview panel slides in from right on row click

### Reports Page (Admin)
- Month/date range selector at top
- Export buttons (PDF, CSV)
- Scholar compliance grid: Names with checkmark/warning indicators
- Detailed breakdown table below

## Images

**No hero image needed** - This is a productivity application, not marketing
**Scholar Avatars**: Placeholder avatar system using initials with generated background patterns
**Empty States**: Simple illustrations for "No activities yet" and "No pending approvals" states - use SVG illustrations from unDraw or similar

## Key Design Principles

1. **Information Hierarchy**: Critical data (hours, status) always prominent
2. **Efficiency First**: Minimize clicks - common actions always visible
3. **Trust Through Clarity**: No hidden information, transparent processes
4. **Humanitarian Warmth**: Rounded corners (rounded-lg, rounded-xl), friendly spacing, approachable typography
5. **Mobile Consideration**: Tables collapse to cards on mobile, navigation adapts, touch-friendly targets (min h-12)