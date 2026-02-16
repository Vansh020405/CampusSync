# CampusSync - Dual-Mode Mobile UI System

## 🎯 Overview

CampusSync now features a **dual-mode interface** that allows users to seamlessly switch between:
1. **Internships Mode** - Career-focused features
2. **Campus Updates Mode** - Academic and faculty interaction features

The entire app UI dynamically changes based on the selected mode, providing a focused experience for each context.

---

## 🔐 Authentication System

### Role-Based Login

The login page features a modern, mobile-first design with:

- **Segmented Role Selection**: Toggle between Student and Faculty
- **Conditional Forms**: Different input fields based on selected role
  - **Student**: Roll Number + Password
  - **Faculty**: Faculty ID/Username + Password
- **Institutional Branding**: Gradient logo and clean design
- **Demo Credentials**: Built-in test accounts

**Demo Accounts:**
- Student: Any roll number / password
- Faculty: Any faculty ID / password

---

## 🏠 Home Dashboard

After login, users land on a **neutral overview dashboard** featuring:

### Quick Stats Cards
- Active Applications count
- Overall Attendance percentage

### Upcoming Deadlines
- Internship application deadlines
- Assignment submissions
- Color-coded urgency badges

### Recent Announcements
- Campus placement drives
- Exam schedules
- Important notices

### Quick Actions Grid
- Browse Internships
- Book Faculty
- View Syllabus
- Class Schedule

---

## 🔀 Mode Toggle System

### Location
Centered in the **top navigation bar** (sticky header)

### Design
- Segmented pill-shaped toggle
- Icons: Briefcase (Internships) | Graduation Cap (Campus)
- Smooth color transitions
- **Blue** accent for Internships mode
- **Emerald** accent for Campus mode

### Persistence
Mode selection is saved to `localStorage` and persists across sessions.

### Implementation
```tsx
import { useMode } from '@/contexts/ModeContext'

const { mode, setMode, toggleMode } = useMode()
// mode: 'internships' | 'campus'
```

---

## 📱 Mode 1: Internships Interface

### Theme
- **Primary Color**: Blue (#2563EB)
- **Focus**: Career development and job opportunities

### Bottom Navigation Tabs
1. **Home** - Overview dashboard
2. **Jobs** - Internship feed
3. **Resume** - Resume review tools
4. **Research** - Research submissions
5. **Track** - Application tracker

### Key Features
- Internship cards with company details
- Application status tracking
- Deadline alerts
- Eligibility matching
- Search and filters

---

## 📚 Mode 2: Campus Updates Interface

### Theme
- **Primary Color**: Emerald (#059669)
- **Focus**: Academic progress and faculty interaction

### Bottom Navigation Tabs
1. **Home** - Overview dashboard
2. **Faculty** - Faculty availability & booking
3. **Classes** - Class schedule & cancellations
4. **Syllabus** - Coverage tracker
5. **Attend** - Attendance monitoring

### Key Features

#### Faculty Availability
- Browse available faculty
- Book consultation slots
- View ratings and departments

#### Class Schedule
- Today's classes with timings
- Cancelled class alerts
- Makeup class schedules
- Room information

#### Syllabus Coverage
- Subject-wise progress tracking
- Visual progress bars
- Completion percentages
- Topic breakdown

#### Attendance Tracker
- Overall attendance percentage
- Subject-wise breakdown
- Warning alerts for <75%
- Required classes calculator

---

## 🎨 UI/UX Features

### Mobile-First Design
- ✅ Bottom navigation optimized for thumb reach
- ✅ Sticky top navbar with mode toggle
- ✅ Touch-friendly card layouts
- ✅ Responsive grid systems
- ✅ Smooth transitions and animations

### Visual Indicators
- **Color Coding**: Blue (Internships) vs Emerald (Campus)
- **Active States**: Filled icons and bold text
- **Status Badges**: Color-coded for different states
- **Progress Bars**: Visual tracking for syllabus/attendance

### Accessibility
- Clear visual hierarchy
- High contrast ratios
- Touch targets ≥44px
- Semantic HTML structure

---

## 🗂️ File Structure

```
src/
├── contexts/
│   └── ModeContext.tsx          # Global mode state management
├── components/
│   ├── ModeToggle.tsx           # Segmented mode switcher
│   ├── BottomNav.tsx            # Mode-aware bottom navigation
│   └── ui/
│       ├── dropdown-menu.tsx    # User menu component
│       └── progress.tsx         # Progress bar component
└── app/
    ├── page.tsx                 # Role-based login
    └── (dashboard)/
        ├── layout.tsx           # Dashboard layout with mode toggle
        ├── home/
        │   └── page.tsx         # Overview dashboard
        └── student/
            ├── internships/     # Internships mode pages
            ├── applications/
            ├── faculty/         # Campus mode pages
            ├── classes/
            ├── syllabus/
            └── attendance/
```

---

## 🔧 Technical Implementation

### State Management
- **Context API** for global mode state
- **localStorage** for persistence
- **Session** for authentication

### Routing
- **Next.js App Router** for file-based routing
- **Dynamic imports** for code splitting
- **Server components** where possible

### Styling
- **Tailwind CSS** for utility-first styling
- **ShadCN UI** for component library
- **CSS variables** for theming

---

## 🚀 Usage

### Running the App
```bash
npm run dev
```

Navigate to `http://localhost:3000`

### Login Flow
1. Select role (Student/Faculty)
2. Enter credentials
3. Click "Sign In"
4. Redirected to `/home` dashboard

### Switching Modes
1. Click the mode toggle in top navbar
2. UI instantly updates
3. Bottom navigation changes
4. Color scheme transitions
5. Selection persists

---

## 📊 Mode Comparison

| Feature | Internships Mode | Campus Mode |
|---------|------------------|-------------|
| **Primary Color** | Blue | Emerald |
| **Focus** | Career Development | Academic Progress |
| **Nav Tab 2** | Jobs | Faculty |
| **Nav Tab 3** | Resume | Classes |
| **Nav Tab 4** | Research | Syllabus |
| **Nav Tab 5** | Track | Attendance |

---

## 🎯 Key Benefits

### For Students
- **Focused Experience**: Switch between career and academic contexts
- **No Clutter**: Only see relevant features for current mode
- **Quick Access**: Bottom nav adapts to current needs

### For Faculty
- **Unified Interface**: Single app for all interactions
- **Consistent UX**: Same navigation patterns across modes

### For Developers
- **Maintainable**: Clear separation of concerns
- **Scalable**: Easy to add new modes or features
- **Type-Safe**: Full TypeScript support

---

## 🔮 Future Enhancements

- [ ] Swipe gestures to switch modes
- [ ] Mode-specific notifications
- [ ] Custom color themes per mode
- [ ] Analytics per mode usage
- [ ] Offline mode support
- [ ] Push notifications
- [ ] Dark mode variants

---

## 📝 Notes

- Mode selection is **client-side only** (no backend integration yet)
- All pages are **placeholders** with demo data
- **Real-time updates** not implemented
- **Database integration** pending
- **PWA features** enabled in production builds

---

## 🎨 Design Philosophy

The dual-mode system follows these principles:

1. **Context-Aware**: Show only what's relevant
2. **Consistent**: Same patterns across modes
3. **Smooth**: Instant transitions, no page reloads
4. **Mobile-First**: Optimized for smartphone usage
5. **Accessible**: Clear visual indicators and states

---

## 🛠️ Components Created

### New Components
- `ModeContext` - Global state provider
- `ModeToggle` - Segmented control switcher
- `DropdownMenu` - User menu
- `Progress` - Progress bar

### Updated Components
- `BottomNav` - Now mode-aware
- `DashboardLayout` - Includes mode toggle
- `Providers` - Wraps ModeProvider

### New Pages
- `/home` - Overview dashboard
- `/student/faculty` - Faculty booking
- `/student/classes` - Class schedule
- `/student/syllabus` - Coverage tracker
- `/student/attendance` - Attendance monitor

---

**Built with ❤️ for mobile-first academic excellence**
