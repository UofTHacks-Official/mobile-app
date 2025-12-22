# HackerBucks Feature Implementation Plan

## Overview

Implement a complete HackerBucks feature where hackers can display their QR code and balance, and admins can scan the QR code to deduct HackerBucks from hacker accounts.

## Feature Flow

### Hacker Side

1. **Display QR Code**: Hackers see their personal QR code on their profile
2. **Show Balance**: Display current HackerBucks balance prominently
3. **Real-time Updates**: Balance updates automatically after transactions

### Admin Side

1. **Scan QR Code**: Admin scans hacker's QR code
2. **Enter Amount**: Admin enters deduction amount
3. **Confirm Transaction**: Review and confirm the deduction
4. **View Results**: See success message with updated balance

---

## Implementation Tasks

### Phase 1: API Integration & Types

#### 1.1 Add QR Code Endpoint to hackerBucks.ts

**File**: `src/requests/hackerBucks.ts`

**Tasks**:

- Add `GET_QR` endpoint: `/api/v13/qr/get-qr`
- Create `GetQRRequest` interface:
  ```typescript
  interface GetQRRequest {
    userid: number;
  }
  ```
- Create `GetQRResponse` interface:
  ```typescript
  interface GetQRResponse {
    qr_code: string;
  }
  ```
- Implement `getHackerQRCode(userId: number)` function
  - Takes hacker ID as parameter
  - Returns QR code string
  - Handles errors appropriately

**Acceptance Criteria**:

- ✅ Function successfully calls `/api/v13/qr/get-qr` endpoint
- ✅ Returns QR code string on success
- ✅ Handles 404 (user not found) errors
- ✅ Handles network errors gracefully

---

### Phase 2: Hacker Profile Updates

#### 2.1 Add HackerBucks Balance Display

**File**: `app/(admin)/profile.tsx`

**Tasks**:

- Add HackerBucks balance section in the hacker profile view (around line 106, after email)
- Display `hacker.hacker_bucks` value
- Use appropriate icon (e.g., `Coins` from lucide-react-native)
- Style consistently with existing Account Information section
- Format balance as currency (e.g., "500 HB" or "$500")

**UI Design**:

```
Account Information
├── First Name: [Name]
├── Last Name: [Name]
├── Email: [Email]
└── HackerBucks: 500 HB  [NEW]
```

**Acceptance Criteria**:

- ✅ Balance displays correctly for logged-in hacker
- ✅ Balance updates when hacker data refreshes
- ✅ Uses theme-aware styling (dark/light mode)
- ✅ Handles null/undefined balance gracefully

#### 2.2 Add QR Code Display Component

**File**: `app/(admin)/profile.tsx`

**Tasks**:

- Add new section below Account Information: "My QR Code"
- Import necessary dependencies:
  - `QRCode` from `react-native-qrcode-svg`
  - `getHackerQRCode` from `@/requests/hackerBucks`
- Fetch QR code on component mount using hacker ID from `hackerData.hacker_id`
- Display QR code in a centered card
- Add loading state while fetching QR code
- Add error state if QR code fails to load
- Add helper text: "Show this QR code to admins for HackerBucks transactions"

**UI Design**:

```
My QR Code
┌─────────────────────┐
│                     │
│   [QR CODE 200x200] │
│                     │
└─────────────────────┘
Show this to admins for transactions
```

**Implementation Details**:

```typescript
const [qrCode, setQrCode] = useState<string>("");
const [qrLoading, setQrLoading] = useState(false);
const [qrError, setQrError] = useState<string>("");

useEffect(() => {
  if (hacker?.hacker_id) {
    fetchQRCode();
  }
}, [hacker?.hacker_id]);

const fetchQRCode = async () => {
  setQrLoading(true);
  try {
    const code = await getHackerQRCode(hacker.hacker_id);
    setQrCode(code);
  } catch (error) {
    setQrError("Failed to load QR code");
  } finally {
    setQrLoading(false);
  }
};
```

**Acceptance Criteria**:

- ✅ QR code loads automatically for hackers
- ✅ Shows loading spinner while fetching
- ✅ Displays QR code with 200x200 size
- ✅ Shows error message if fetch fails
- ✅ QR code is centered and properly styled
- ✅ Works in both dark and light themes
- ✅ Only visible to hackers (not admins)

---

### Phase 3: Admin Deduction Flow Enhancement

#### 3.1 Review Existing Scan Flow

**Files**:

- `app/(admin)/hackerbucks/scan.tsx` (already exists)
- `app/(admin)/hackerbucks/sendHbucks.tsx` (already exists)
- `app/(admin)/hackerbucks/confirmHBucks.tsx` (already exists)
- `app/(admin)/hackerbucks/success.tsx` (already exists)

**Tasks**:

- Review current implementation in scan.tsx (lines 54-159)
- Verify QR scanner properly captures hacker QR code
- Ensure `deduct` mode is properly handled
- Check that QR code data is passed through the flow

**Current Flow**:

```
1. scan.tsx (mode=deduct)
   ↓ [Scan QR Code]
2. sendHbucks.tsx (mode=deduct)
   ↓ [Enter Amount]
3. confirmHBucks.tsx
   ↓ [Confirm Transaction]
4. success.tsx
   [Show Results]
```

**Acceptance Criteria**:

- ✅ Scan flow handles `deduct` mode correctly
- ✅ QR code data flows through all screens
- ✅ Navigation works seamlessly

#### 3.2 Update sendHbucks.tsx for Deduct Mode

**File**: `app/(admin)/hackerbucks/sendHbucks.tsx`

**Tasks**:

- Verify `mode` parameter is read from URL params
- Ensure UI text changes based on mode:
  - "Add HackerBucks" → "Deduct HackerBucks" when mode=deduct
- Verify amount input validation
- Check that QR code is stored in state
- Ensure proper navigation to confirmation screen

**Acceptance Criteria**:

- ✅ Title changes to "Deduct HackerBucks" when mode=deduct
- ✅ Amount validation prevents negative numbers
- ✅ Amount validation prevents decimals (integer only)
- ✅ QR code properly stored in zustand store
- ✅ Navigates to confirmHBucks with correct data

#### 3.3 Update confirmHBucks.tsx

**File**: `app/(admin)/hackerbucks/confirmHBucks.tsx`

**Tasks**:

- Read `mode` parameter from URL or store
- Update confirmation text based on mode:
  - "You are about to ADD X HackerBucks"
  - "You are about to DEDUCT X HackerBucks"
- Call `deductHackerBucksByQR` when mode=deduct
- Call `addHackerBucksByQR` when mode=add
- Pass QR code and amount to API
- Handle API response
- Navigate to success screen with transaction data

**API Integration**:

```typescript
const response = await deductHackerBucksByQR({
  qr_code: storedQRCode,
  amount: enteredAmount,
});

// Response contains:
// - user_id
// - hacker_fname
// - hacker_lname
// - email
// - previous_bucks
// - new_bucks
// - amount_changed
// - message
```

**Acceptance Criteria**:

- ✅ Calls correct API endpoint based on mode
- ✅ Shows appropriate confirmation message
- ✅ Handles loading state during API call
- ✅ Handles errors (insufficient balance, invalid QR, etc.)
- ✅ Navigates to success on successful transaction

#### 3.4 Update success.tsx

**File**: `app/(admin)/hackerbucks/success.tsx`

**Tasks**:

- Verify success screen shows:
  - Hacker name (first + last)
  - Previous balance
  - New balance
  - Amount changed
  - Success message
- Ensure styling is theme-aware
- Add "Done" button to return to home/scanner

**Acceptance Criteria**:

- ✅ Displays all transaction details
- ✅ Shows previous and new balance correctly
- ✅ Works for both add and deduct modes
- ✅ Provides clear navigation back

---

### Phase 4: Entry Points & Navigation

#### 4.1 Add Deduct HackerBucks Option to QR Screen

**File**: `app/(admin)/qr.tsx`

**Tasks**:

- Review existing QR scanner entry screen
- Add "Deduct HackerBucks" option alongside existing options
- Ensure button navigates to `/hackerbucks/scan?mode=deduct`
- Style consistently with other options
- Use appropriate icon (e.g., `MinusCircle` or `ArrowDownCircle`)

**Acceptance Criteria**:

- ✅ Button visible to admins only
- ✅ Navigates to scanner with mode=deduct
- ✅ Styled consistently with other scanner options
- ✅ Feature flag respected (ENABLE_HACKERBUCKS)

#### 4.2 Verify Test QR Screen

**File**: `app/(admin)/test-qr.tsx`

**Tasks**:

- Verify test QR screen still works for generating test QR codes
- Ensure it calls `/api/v13/qr/get-qr` correctly
- Test with Bob's ID (18) to verify QR generation
- Consider adding this as a developer tool

**Acceptance Criteria**:

- ✅ Can generate QR code for any user ID
- ✅ QR code format matches what hackers see
- ✅ Useful for testing without needing hacker account

---

### Phase 5: Testing & Edge Cases

#### 5.1 Error Handling

**Scenarios to Handle**:

1. **Insufficient Balance**
   - User has 100 HB, admin tries to deduct 200 HB
   - Expected: Show error message "Insufficient balance"

2. **Invalid QR Code**
   - QR code is malformed or doesn't match any user
   - Expected: Show error "Invalid QR code"

3. **Network Errors**
   - API call fails due to network issues
   - Expected: Show "Network error, please try again"

4. **User Not Found**
   - QR code format is valid but user doesn't exist
   - Expected: Show "User not found"

**Implementation**:

- Add try-catch blocks around all API calls
- Show user-friendly error messages
- Provide retry option for network errors
- Log errors for debugging

#### 5.2 Balance Refresh

**Tasks**:

- Ensure hacker's balance refreshes after transaction
- Consider adding pull-to-refresh on profile screen
- Consider real-time updates via polling or websockets (future enhancement)

**Acceptance Criteria**:

- ✅ Balance updates on profile when hacker returns from background
- ✅ Balance updates when profile screen regains focus
- ✅ Pull-to-refresh works on profile screen

#### 5.3 Loading States

**All screens should show**:

- Loading spinner during API calls
- Disabled buttons during loading
- Clear feedback that action is in progress

**Acceptance Criteria**:

- ✅ No double-submission of transactions
- ✅ Clear loading indicators on all async operations
- ✅ Buttons disabled during processing

---

## File Structure

```
app/
└── (admin)/
    ├── profile.tsx                    [MODIFIED] - Add QR code & balance display
    ├── qr.tsx                         [MODIFIED] - Add deduct HackerBucks entry
    └── hackerbucks/
        ├── scan.tsx                   [EXISTING] - QR scanner
        ├── sendHbucks.tsx             [REVIEW] - Amount input
        ├── confirmHBucks.tsx          [MODIFIED] - Call deduct API
        └── success.tsx                [EXISTING] - Show results

src/
└── requests/
    └── hackerBucks.ts                 [MODIFIED] - Add getHackerQRCode function
```

---

## API Endpoints Used

### Get QR Code

```
POST /api/v13/qr/get-qr
Body: { userid: number }
Response: { qr_code: string }
```

### Deduct HackerBucks

```
POST /api/v13/qr/deduct-hackerbux
Body: { qr_code: string, amount: number }
Response: {
  user_id: number,
  hacker_fname: string,
  hacker_lname: string,
  email: string,
  previous_bucks: number,
  new_bucks: number,
  amount_changed: number,
  message: string
}
```

### Get Hacker Profile

```
GET /api/v13/hackers/profile
Headers: { Authorization: Bearer <token> }
Response: Hacker object (includes hacker_bucks)
```

---

## Dependencies

Already installed:

- ✅ `react-native-qrcode-svg` - For QR code display
- ✅ `expo-camera` - For QR code scanning
- ✅ `zustand` - For state management
- ✅ `axios` - For API calls

---

## Testing Checklist

### Hacker Side

- [ ] Login as hacker (Bob, ID: 18)
- [ ] Navigate to profile
- [ ] Verify balance displays correctly
- [ ] Verify QR code loads and displays
- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Test with slow network (loading state)
- [ ] Test with network error (error state)

### Admin Side

- [ ] Login as admin
- [ ] Navigate to QR scanner screen
- [ ] Select "Deduct HackerBucks"
- [ ] Scan hacker QR code (use test QR or hacker app)
- [ ] Enter deduction amount
- [ ] Verify confirmation screen shows correct details
- [ ] Complete transaction
- [ ] Verify success screen shows updated balance
- [ ] Test insufficient balance error
- [ ] Test invalid QR code error
- [ ] Test network error handling

### Integration

- [ ] Hacker receives balance update after admin deduction
- [ ] Multiple consecutive transactions work correctly
- [ ] No race conditions or duplicate transactions
- [ ] Balance persists after app restart

---

## Future Enhancements

1. **Transaction History**
   - Show list of all HackerBucks transactions on profile
   - Filter by date, type (add/deduct)

2. **Push Notifications**
   - Notify hacker when HackerBucks are added/deducted
   - Show transaction details in notification

3. **Real-time Balance Updates**
   - Use WebSocket or polling to update balance in real-time
   - Show live balance without refresh

4. **Analytics**
   - Admin dashboard showing HackerBucks statistics
   - Most active hackers, total distributed, etc.

5. **Batch Transactions**
   - Allow admin to scan multiple hackers and deduct same amount
   - Useful for event check-ins with rewards

---

## Success Metrics

- ✅ Hackers can view their QR code and balance
- ✅ Admins can scan hacker QR codes
- ✅ Deductions process successfully
- ✅ Balances update correctly on both sides
- ✅ No crashes or errors during normal flow
- ✅ Works in both light and dark themes
- ✅ Handles common errors gracefully

---

## Timeline Estimate

- **Phase 1** (API Integration): 1-2 hours
- **Phase 2** (Hacker Profile): 2-3 hours
- **Phase 3** (Admin Flow): 2-3 hours
- **Phase 4** (Entry Points): 1 hour
- **Phase 5** (Testing): 2-3 hours

**Total**: 8-12 hours of development time

---

## Notes

- The admin deduction flow already exists for adding HackerBucks
- Main work is adapting it for deduction mode
- QR code generation endpoint is already available
- Focus on reusing existing components and patterns
- Ensure consistent styling with rest of app
- Test thoroughly with staging backend before deploying
