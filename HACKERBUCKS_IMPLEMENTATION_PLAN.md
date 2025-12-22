# Hacker Bucks Implementation Plan

## Overview

Implement a QR code-based Hacker Bucks system that allows admins to add or deduct Hacker Bucks from hackers by scanning their QR codes.

## User Flow

1. **Landing Page**: Admin navigates to Hacker Bucks page from nav bar
   - Displays two prominent buttons: "Add Hacker Bucks" and "Deduct Hacker Bucks"

2. **QR Scanner**: Based on button selection, navigate to QR scanner
   - Add button → Routes to add-hackerbux flow
   - Deduct button → Routes to deduct-hackerbux flow

3. **Amount Input**: After successful QR scan
   - Display numeric keypad (similar to provided screenshot design)
   - Show account selection (Checking - 7134 style, though we'll adapt for hacker context)
   - Allow user to enter amount to add/deduct
   - Display toggle to switch between add/deduct mode

4. **Confirmation**: Review transaction details
   - Show recipient name and ID
   - Show amount and transaction type
   - Display confirmation button

5. **Result**: Success or failure message
   - Show transaction summary
   - Return to main screen

## Architecture Changes

### Current State Analysis

The codebase already has:

- ✅ QR scanner component (`app/(admin)/hackerbucks/index.tsx`)
- ✅ Amount input screen (`app/(admin)/hackerbucks/sendHbucks.tsx`)
- ✅ Confirmation screen (`app/(admin)/hackerbucks/confirmHBucks.tsx`)
- ✅ Success screen (`app/(admin)/hackerbucks/success.tsx`)
- ✅ State management (`src/reducers/hackerbucks.ts`)
- ⚠️ Old API endpoints (need to update to QR-based endpoints)

### What Needs to Change

#### 1. Navigation Structure

**File**: `app/(admin)/_layout.tsx`

- Currently: Hacker Bucks is hidden from nav bar (`href: null`)
- **Change**: Add conditional display for admins only
- **Location**: Line 166-170

#### 2. New Landing Page

**File**: `app/(admin)/hackerbucks/index.tsx` (rename current to `scan.tsx`)
**New File**: `app/(admin)/hackerbucks/index.tsx`

- Create landing page with two buttons:
  - "Add Hacker Bucks" button
  - "Deduct Hacker Bucks" button
- Each button navigates to the scanner with mode context
- Design considerations:
  - Clean, simple layout
  - Large, accessible buttons
  - Clear labeling
  - Admin-only access enforced

#### 3. QR Scanner Routes

**Current File**: `app/(admin)/hackerbucks/index.tsx`
**New File**: `app/(admin)/hackerbucks/scan.tsx`

- Move current QR scanner logic to `scan.tsx`
- Update to accept route parameter for transaction mode (add/deduct)
- Pass mode to state management on successful scan
- Navigate to amount input screen after scan

#### 4. API Integration

**File**: `src/requests/hackerBucks.ts`
**Current Endpoints**:

```typescript
SEND: "/api/v13/admins/hacker-bucks/add";
DEDUCT: "/api/v13/admins/hacker-bucks/deduct";
```

**New Endpoints**:

```typescript
ADD_QR: "/api/v13/qr/add-hackerbux";
DEDUCT_QR: "/api/v13/qr/deduct-hackerbux";
```

**API Request Format**:

```typescript
{
  "qr_code": "string",  // The scanned QR code data
  "amount": 0           // Amount to add/deduct
}
```

**API Response Format**:

```typescript
{
  "user_id": 0,
  "hacker_fname": "string",
  "hacker_lname": "string",
  "email": "string",
  "previous_bucks": 0,
  "new_bucks": 0,
  "amount_changed": 0,
  "message": "string"
}
```

**Changes Required**:

- Create new functions: `addHackerBucksByQR()` and `deductHackerBucksByQR()`
- Update request payload to match QR API format
- Handle response data (populate recipient info from API response)

#### 5. State Management Updates

**File**: `src/reducers/hackerbucks.ts`
**Changes**:

- Update `Recipient` interface to include email and user_id from API response
- Store QR code data for API submission
- Add methods to handle QR-based transaction flow
- Update transaction types to match new API responses

#### 6. Amount Input Screen

**File**: `app/(admin)/hackerbucks/sendHbucks.tsx`
**Changes**:

- Update header text based on transaction mode
- Ensure toggle between add/deduct modes works correctly
- Follow design pattern from provided screenshot:
  - "How much do you want to transfer to {Recipient}?" header style
  - Account/recipient selector with chevron
  - Large amount display with currency formatting
  - Numeric keypad at bottom
  - "Choose Amount" button (disabled when amount is $0)
- Adapt "Public" → Recipient name
- Adapt "Checking - 7134" → Hacker info display

#### 7. Confirmation Screen

**File**: `app/(admin)/hackerbucks/confirmHBucks.tsx`
**Changes**:

- Update API call to use new QR-based endpoints
- Pass `qr_code` and `amount` to API
- Handle error states properly
- Update transaction status based on API response
- Navigate to success/failure screen

#### 8. Success Screen

**File**: `app/(admin)/hackerbucks/success.tsx`
**Changes**:

- Display additional info from API response:
  - Previous balance
  - New balance
  - Amount changed
  - Success message
- Add proper error handling for failed transactions
- Consider adding a "New Transaction" button

#### 9. Role-Based Access Control

**Files**: Multiple
**Changes**:

- Ensure Hacker Bucks feature is only visible to admins
- Check user role before allowing access to any hackerbucks routes
- Display appropriate error/redirect for non-admin users
- Update bottom nav bar logic to hide for non-admins

#### 10. Feature Flag

**File**: `src/config/featureFlags.ts`
**Current State**: `ENABLE_HACKERBUCKS: false`
**Action**: Update to `true` when ready to deploy

## File Structure

```
app/(admin)/hackerbucks/
├── _layout.tsx          # Stack layout (no changes needed)
├── index.tsx            # NEW: Landing page with Add/Deduct buttons
├── scan.tsx             # RENAMED: QR scanner (current index.tsx)
├── sendHbucks.tsx       # UPDATED: Amount input with keyboard
├── confirmHBucks.tsx    # UPDATED: Confirmation with new API
└── success.tsx          # UPDATED: Success screen with balance info

src/requests/
└── hackerBucks.ts       # UPDATED: New QR-based API functions

src/reducers/
└── hackerbucks.ts       # UPDATED: Enhanced state management

src/config/
└── featureFlags.ts      # UPDATE: Enable hackerbucks flag
```

## Implementation Checklist

### Phase 1: Setup & Routing

- [ ] Create new landing page (`hackerbucks/index.tsx`)
- [ ] Rename current scanner to `scan.tsx`
- [ ] Update navigation to show Hacker Bucks for admins only
- [ ] Add role-based access control checks

### Phase 2: API Integration

- [ ] Update `src/requests/hackerBucks.ts` with QR endpoints
- [ ] Create `addHackerBucksByQR()` function
- [ ] Create `deductHackerBucksByQR()` function
- [ ] Update API request/response interfaces

### Phase 3: State Management

- [ ] Update `Recipient` interface in hackerbucks.ts reducer
- [ ] Add QR code storage to transaction state
- [ ] Update transaction flow methods
- [ ] Handle API response data properly

### Phase 4: UI Updates

- [ ] Design and implement landing page UI
- [ ] Update scanner to accept and use transaction mode
- [ ] Update amount input screen to match design spec
- [ ] Update confirmation screen with new API integration
- [ ] Update success screen to show balance changes

### Phase 5: Error Handling

- [ ] Add error states for failed QR scans
- [ ] Handle API errors gracefully
- [ ] Display user-friendly error messages
- [ ] Add retry mechanisms where appropriate

### Phase 6: Testing & Polish

- [ ] Test add flow end-to-end
- [ ] Test deduct flow end-to-end
- [ ] Test error scenarios
- [ ] Verify admin-only access
- [ ] Update feature flag to enable
- [ ] Final QA pass

## Design Specifications

### Landing Page

- **Layout**: Centered content with vertical button stack
- **Buttons**:
  - Full-width, rounded corners
  - Primary color for "Add"
  - Secondary/destructive color for "Deduct"
  - Minimum touch target: 44pt height
  - Clear icon + text labels
- **Spacing**: Generous padding between elements
- **Header**: "Hacker Bucks Management" or similar

### Amount Input Screen (Reference: Screenshot)

- **Header**:
  - Question format: "How much do you want to {add/deduct} {to/from} {Name}?"
  - Recipient selector with chevron (tappable to change)
- **Amount Display**:
  - Large text (48-64pt)
  - $ prefix (or HB suffix)
  - Light gray when 0, black when entered
  - Cursor/input indicator
- **Keypad**:
  - 3x4 grid layout
  - Numbers 1-9, 0, decimal point
  - Backspace button
  - Clear spacing between buttons
- **Submit Button**:
  - Fixed at bottom
  - Full width
  - Disabled state when amount is 0
  - Text: "Choose Amount" or "Continue"

### Color Scheme

- Primary Blue: `#007AFF` (or existing `uoft_primary_blue`)
- Success Green: `#22c55e`
- Error Red: `#ef4444`
- Background: Theme-aware (light/dark mode)
- Text: Theme-aware

## API Error Handling

### Possible Error Scenarios

1. **Invalid QR Code**: QR code doesn't match any hacker
2. **Insufficient Balance**: Deducting more than hacker has
3. **Network Error**: API unreachable
4. **Validation Error**: Invalid amount format
5. **Permission Error**: User not authorized (not admin)

### Error Response Strategy

- Display toast/alert with error message
- Allow user to retry or go back
- Log errors for debugging
- Graceful degradation

## Security Considerations

- ✅ Admin-only access enforced at navigation level
- ✅ Admin-only access enforced at route level
- ✅ API requires admin permissions (backend)
- ⚠️ Consider adding confirmation for large amounts
- ⚠️ Consider adding transaction limits

## Future Enhancements (Out of Scope)

- Transaction history view
- Bulk operations
- CSV export of transactions
- Real-time balance display before transaction
- Push notifications for hackers on balance change
- Undo/refund functionality

## Notes

- The existing infrastructure is well-structured and mostly reusable
- Main changes are API endpoint updates and adding the landing page
- Design should follow existing app patterns and theme system
- Ensure proper haptic feedback on all interactions
- Support both light and dark modes
- Use existing components where possible (NumericKeypad, etc.)
