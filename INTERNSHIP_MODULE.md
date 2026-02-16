# CampusSync - Internship Opportunity Tracker Module

## ✅ Completed Features

### 1. **Internship Feed (Student View)**
- **Location**: `/student/internships`
- Mobile-optimized card-based feed
- Each card displays:
  - Company name & role
  - Stipend with visual indicator
  - Location & work mode (Remote/Onsite/Hybrid)
  - Deadline with urgency badge
  - Eligibility CGPA requirement
- Actions: View Details, Apply Now, Save (star icon)
- Sticky search bar with filter drawer
- Tab switcher between "Opportunities" and "Applications"

### 2. **Internship Detail Page**
- **Location**: `/student/internships/[id]`
- Full-screen detail view with:
  - Job description
  - Required skills (placeholder)
  - Selection process steps
  - Eligibility criteria
  - Deadline countdown
  - Allowed branches
- Sticky action footer with "Save" and "Apply Now" buttons
- Back navigation to feed

### 3. **Filters & Search**
- Mobile drawer-based filter UI
- Search by company name or role
- Filter options:
  - Type (Internship/Full-time)
  - Location (Remote/Onsite/Any)
- Real-time search filtering

### 4. **Application Tracker**
- **Location**: `/student/applications`
- Status-based tracking:
  - SAVED
  - APPLIED
  - INTERVIEW
  - SELECTED
  - REJECTED
- Color-coded status badges
- Application date tracking
- Empty state with CTA to browse opportunities

### 5. **Admin Posting Panel**
- **Location**: `/admin/internships`
- Two-view system:
  - **List View**: All posted internships with edit/delete actions
  - **Create View**: Comprehensive posting form
- Form fields:
  - Company name
  - Job role
  - Stipend
  - Location
  - Work mode (dropdown)
  - Deadline (date picker)
  - Min CGPA
  - Allowed branches (comma-separated)
  - Job description (textarea)
  - Application link
- Instant feedback on submission

## 🗄️ Database Schema

### Prisma Models Created:

```prisma
model Internship {
  id              Int      @id @default(autoincrement())
  company         String
  role            String
  stipend         String
  location        String
  mode            String   // "REMOTE", "ONSITE", "HYBRID"
  eligibilityCgpa Float
  branchesAllowed String   // Comma separated
  deadline        DateTime
  jdUrl           String?
  applyLink       String?
  description     String?
  skills          String?
  selectionProcess String?
  createdById     Int
  createdBy       User     @relation("PostedInternships")
  createdAt       DateTime @default(now())
  applications    Application[]
}

model Application {
  id           Int      @id @default(autoincrement())
  studentId    Int
  student      User     @relation
  internshipId Int
  internship   Internship @relation
  status       String   // "SAVED", "APPLIED", "INTERVIEW", "SELECTED", "REJECTED"
  appliedAt    DateTime @default(now())
  @@unique([studentId, internshipId])
}
```

## 📱 Mobile UI Features

- ✅ Card-based feed layout
- ✅ Bottom sheet filters (Drawer component)
- ✅ Sticky search & tabs
- ✅ Deadline urgency badges
- ✅ Touch-optimized buttons
- ✅ Responsive grid layouts
- ✅ Status color coding
- ✅ Empty states with CTAs

## 🔐 Role Permissions

### Students Can:
- Browse all internships
- Search and filter opportunities
- View detailed internship information
- Apply to internships
- Save internships for later
- Track application status

### Admins Can:
- Post new internships
- View all posted internships
- Edit internship details (UI ready)
- Delete internships (UI ready)

## 🎨 UI Components Created

1. **InternshipCard** - Reusable card component with all metadata
2. **ApplicationStatusCard** - Status tracking card
3. **Badge** - ShadCN UI badge for tags
4. **Drawer** - Mobile bottom sheet for filters
5. **Select** - Dropdown component
6. **Textarea** - Multi-line input
7. **Toast** - Notification system (integrated)

## 💾 Data Storage

**Note**: Since PostgreSQL is not running locally, the module uses an **in-memory mock store** (`src/lib/store.ts`) that:
- Provides 3 demo internships
- Simulates all CRUD operations
- Persists data during the session
- Can be easily replaced with real Prisma calls when DB is available

### Demo Internships:
1. **TechCorp Inc.** - SDE Intern (₹50k/mo, Hybrid, Bangalore)
2. **DataWise Analytics** - Data Science Intern (₹45k/mo, Remote)
3. **BuildIt** - Frontend Developer (₹30k/mo, Onsite, Mumbai)

## 🚀 How to Run

```bash
npm run dev
```

Navigate to:
- Student Feed: http://localhost:3000/student/internships
- Admin Panel: http://localhost:3000/admin/internships (login as admin@campus.edu)
- Applications: http://localhost:3000/student/applications

## 🔔 Notifications

Toast notifications are integrated for:
- Successful application submission
- Internship saved
- Form submission confirmation

## 📦 Dependencies Added

- `vaul` - Drawer component
- `@radix-ui/react-dialog` - Dialog primitives
- `@radix-ui/react-select` - Select component
- `@radix-ui/react-toast` - Toast notifications
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-slot` - Composition primitive

## ✨ Next Steps (Future Enhancements)

- [ ] Connect to real PostgreSQL database
- [ ] Implement edit/delete functionality for admin
- [ ] Add file upload for JD PDFs
- [ ] Real-time deadline notifications
- [ ] Email notifications on new postings
- [ ] Advanced filters (CGPA range, branches, stipend range)
- [ ] Application status updates by admin
- [ ] Bulk operations for admin
- [ ] Analytics dashboard
- [ ] Export applications to CSV
