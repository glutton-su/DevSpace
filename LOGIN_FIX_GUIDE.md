# Login Issue Fix Guide

## Problem
Login functionality stopped working after adding the `avatarIcon` field to the User model.

## Root Cause
The database doesn't have the new `avatar_icon` column that we added to the User model, causing SQL errors when trying to query user data.

## Quick Fix Steps

### Option 1: Run Database Migration
```bash
cd server
npx sequelize-cli db:migrate
npm run dev
```

### Option 2: Manual Database Update
Connect to your database and run:
```sql
ALTER TABLE users ADD COLUMN avatar_icon ENUM('user', 'code', 'star', 'zap') DEFAULT 'user';
```

### Option 3: Temporary Fix (Remove Avatar Icon)
If you want to remove the avatar icon feature temporarily:

1. **Revert User Model:**
```javascript
// In server/models/User.js, remove these lines:
avatarIcon: {
  type: DataTypes.ENUM("user", "code", "star", "zap"),
  defaultValue: "user",
  field: "avatar_icon",
  allowNull: true,
},
```

2. **Revert Auth Controller:**
Remove `avatarIcon: user.avatarIcon || 'user',` from login and register responses.

3. **Revert Settings.jsx:**
Change back to the "coming soon" avatar upload message.

## Files That Were Modified

### Backend:
- `server/models/User.js` - Added avatarIcon field
- `server/controllers/authController.js` - Updated to include avatarIcon in responses
- `server/migrations/20250126-add-avatar-icon.js` - Migration file

### Frontend:
- `client/src/pages/Settings.jsx` - Icon selector UI
- `client/src/components/features/SnippetCard.jsx` - Icon display

## Diagnostic Scripts
Run these to identify the exact issue:

```bash
# Check database structure and connectivity
node diagnose-login.js

# Test login functionality
node test-login-debug.js

# Run migration fix
node fix-login.js
```

## Expected Error Messages
If you're seeing errors like:
- "Unknown column 'avatar_icon' in 'field list'"
- "ER_BAD_FIELD_ERROR: Unknown column"
- "Database error" on login

These confirm the database migration is needed.

## Verification
After fixing, you should be able to:
1. Login successfully
2. See avatar icon selector in Settings
3. Change and save avatar icons
4. See selected icons in snippet cards

## Rollback Instructions
If avatar icons are causing too many issues, run:
```sql
ALTER TABLE users DROP COLUMN avatar_icon;
```
And revert the code changes mentioned in Option 3 above.
