# Search Logging & Remediation Features

## Overview

Added comprehensive search activity tracking and breach remediation management system to GladiatorRX.

## Database Schema Changes

### SearchLog Model

Tracks all user search activity with detailed metadata:

- **userId**: Reference to user who performed the search
- **query**: Search query string
- **resultsCount**: Number of results found (default: 0)
- **databaseName**: Optional - which leaked database was searched
- **searchType**: Type of search performed (general, email, domain, credential)
- **ipAddress**: IP address of the user
- **userAgent**: Browser/client user agent string
- **createdAt**: Timestamp of search

### RemediationAction Model

Manages breach response workflows and remediation tasks:

- **userId**: User who created the action
- **leakId**: Optional reference to leaked database/breach
- **affectedEmail**: Email address affected by breach
- **affectedDomain**: Domain affected by breach
- **actionType**: Type of remediation (PASSWORD_RESET, ACCOUNT_DISABLED, NOTIFICATION_SENT, CREDENTIAL_ROTATED)
- **status**: Current status (PENDING, IN_PROGRESS, COMPLETED, FAILED)
- **priority**: Priority level (LOW, MEDIUM, HIGH, CRITICAL)
- **description**: Detailed description of the action
- **steps**: JSON string of remediation steps/procedures
- **assignedTo**: Optional user/team member assigned
- **completedAt**: Timestamp when action was completed
- **notes**: Additional notes or comments
- **createdAt/updatedAt**: Audit timestamps

## API Endpoints

### Search Logs API (`/api/search-logs`)

#### GET - Fetch Search Logs

Query Parameters:

- `page` (default: 1) - Page number for pagination
- `limit` (default: 20) - Results per page
- `searchType` - Filter by search type
- `databaseName` - Filter by database name
- `startDate` - Filter logs after this date
- `endDate` - Filter logs before this date

Response:

```json
{
  "logs": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### POST - Create Search Log

Automatically logs search activity with metadata capture.

Body:

```json
{
  "query": "user@example.com",
  "resultsCount": 5,
  "databaseName": "LinkedIn Breach 2021",
  "searchType": "email"
}
```

IP address and user agent are automatically captured from request headers.

### Remediation API (`/api/remediation`)

#### GET - Fetch Remediation Actions

Query Parameters:

- `page` (default: 1)
- `limit` (default: 20)
- `status` - Filter by status
- `priority` - Filter by priority
- `actionType` - Filter by action type

#### POST - Create Remediation Action

Body:

```json
{
  "affectedEmail": "user@example.com",
  "affectedDomain": "example.com",
  "actionType": "PASSWORD_RESET",
  "priority": "HIGH",
  "description": "User credentials found in LinkedIn breach",
  "steps": {...},
  "assignedTo": "security-team@company.com"
}
```

#### PATCH - Update Remediation Action

Body:

```json
{
  "id": "action-id",
  "status": "COMPLETED",
  "priority": "CRITICAL",
  "notes": "Password reset completed successfully"
}
```

Automatically sets `completedAt` timestamp when status is changed to COMPLETED.

#### DELETE - Delete Remediation Action

Query Parameter: `id` - Action ID to delete

## Dashboard Pages

### Search Logs Page (`/dashboard/search-logs`)

Features:

- **Search History Table**: View all searches with date, query, results count, database, type, IP
- **Filters**: Filter by search type and database name
- **Export**: Download search logs as CSV file
- **Pagination**: Navigate through search history
- **Badge System**: Color-coded badges for search types and result counts
- **Statistics**: Total searches displayed

### Remediation Actions Page (`/dashboard/remediation`)

Features:

- **Statistics Dashboard**: 4 cards showing Total/Pending/In Progress/Completed actions
- **Create Action Dialog**: Form to create new remediation tasks with:
  - Affected email/domain inputs
  - Action type selection (Password Reset, Account Disabled, etc.)
  - Priority selection (Low to Critical)
  - Description textarea
- **Actions Table**: View all remediation tasks with:
  - Created date
  - Affected email/domain
  - Action type
  - Priority badge (color-coded)
  - Status badge (with icons)
  - Description
  - Quick actions (Start/Complete buttons)
- **Filters**: Filter by status and priority
- **Pagination**: Navigate through actions
- **Status Management**: Quick update action status with buttons

## Navigation Updates

Added to both regular user and admin navigation:

- **Search Logs**: Icon: activity, Shortcut: [l, l]
- **Remediation**: Icon: shield, Shortcut: [r, r]

## Security Features

- **Authentication Required**: All endpoints check for valid session
- **User Isolation**: Users can only view their own logs and actions
- **Admin Access**: Admin users can see all data (future enhancement)
- **IP Tracking**: Automatic IP address capture for audit trails
- **Cascade Delete**: Search logs and actions are deleted if user is deleted

## Usage

### Logging a Search

When a user performs a search in the database search feature, call:

```typescript
await fetch("/api/search-logs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: searchQuery,
    resultsCount: results.length,
    databaseName: selectedDatabase,
    searchType: detectSearchType(searchQuery),
  }),
});
```

### Creating a Remediation Action

When a breach is detected:

```typescript
await fetch("/api/remediation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    affectedEmail: breachData.email,
    affectedDomain: breachData.domain,
    actionType: "PASSWORD_RESET",
    priority: "HIGH",
    description: `Credentials found in ${breachData.source}`,
    steps: {
      1: "Send password reset email",
      2: "Verify user identity",
      3: "Force password change on next login",
    },
  }),
});
```

## Future Enhancements

- **Search Limits**: Enforce subscription-based search limits
- **Email Notifications**: Notify assigned users of new remediation actions
- **Workflow Automation**: Auto-create remediation actions from search results
- **Advanced Analytics**: Search pattern analysis, breach trending
- **Export Options**: PDF reports for compliance
- **Bulk Actions**: Process multiple remediation tasks at once
- **Templates**: Predefined remediation step templates
- **SLA Tracking**: Track response times and SLA compliance

## Files Changed

1. `/prisma/schema.prisma` - Added SearchLog and RemediationAction models
2. `/app/api/search-logs/route.ts` - Search logging API endpoints
3. `/app/api/remediation/route.ts` - Remediation management API endpoints
4. `/app/dashboard/search-logs/page.tsx` - Search logs dashboard page
5. `/app/dashboard/remediation/page.tsx` - Remediation actions dashboard page
6. `/constants/data.ts` - Added navigation items for new pages

## Migration

Schema changes have been applied to the database. No manual migration needed.

Run `npx prisma generate` if you need to regenerate the Prisma Client.
