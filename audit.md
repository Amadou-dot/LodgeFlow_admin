# LodgeFlow Admin — Audit Issues

---

## Issue 1: Duplicate Notifications & Double Confirmation on Cabin Delete

**Status: Fixed**
**Severity:** Medium
**Area:** Cabins
**Screenshots:** `delete modal confirmation 1.png`, `delete modal confirmation 2.png`, `multi toast error.png`

**Description:**
When deleting a cabin, two separate confirmation modals appear sequentially instead of one. After confirming deletion, three toast notifications are displayed simultaneously ("Cabin Deleted", "Success", and another "Cabin Deleted"), indicating the success handler or event fires multiple times. Only a single confirmation modal and a single success toast should appear.

**Expected behavior:**
- One confirmation modal: "Are you sure you want to delete cabin {X}? {irreversible action warning} {cabins with active bookings cannot be deleted note}"
- One success toast after deletion completes.

---

## Issue 2: Booking Edit Form Blocks the Booking's Own Dates

**Status: Fixed in PR #73**
**Severity:** High
**Area:** Bookings — Edit Form
**Screenshot:** `cannot edit bookings.png`

**Description:**
When opening the edit form for an existing booking, the date picker marks the booking's own dates as unavailable ("Selected date unavailable."). This prevents the user from keeping the current dates or making small adjustments. The overlap detection logic does not exclude the booking being edited, so it treats the booking's own reserved dates as a conflict.

**Expected behavior:**
The date picker should exclude the current booking from the overlap check so its own dates remain selectable. The `findOverlapping` method accepts an `excludeBookingId` parameter — this should be passed when loading blocked dates for the edit form.

---

## Issue 3: Booking Update Fails with Generic Browser Alert

**Status: Fixed in PR #73**
**Severity:** High
**Area:** Bookings — Update Mutation
**Screenshot:** `cannot update bookings.png`

**Description:**
Even after changing dates to avoid conflicts, submitting the booking edit form fails. The API returns a non-OK response, triggering `throw new Error('Failed to update booking')` in the mutation function. The error is shown using the browser's default `alert()` dialog (`localhost:3000 says — Failed to update booking. Please try again.`) instead of an in-app modal or toast.

Two separate problems here:
1. **Backend bug:** The update API endpoint returns an error for an unknown reason (needs investigation on the API route handler).
2. **UX issue:** Errors should be displayed using the app's existing toast/modal system, not the native browser `alert()`.

**Stack trace:**
```
hooks/useBookings.ts:239 — throw new Error('Failed to update booking')
```
The mutation's `onError` callback likely calls `window.alert()` or similar. It should use a toast notification consistent with the rest of the app.

---

## Issue 4: No Search Functionality on Experiences Page

**Status: Fixed**
**Severity:** Low
**Area:** Experiences
**Screenshot:** `Experiences page.png`

**Description:**
The Experiences page displays experience cards but has no search bar or text filter. Other listing pages (Cabins, Bookings) include a search input — the Experiences page should follow the same pattern for consistency and usability, especially as the number of experiences grows.

**Expected behavior:**
Add a search input that filters experiences by name, description, or category (matching the pattern used on the Cabins page).

---

## Issue 5: Guest Management Should Use Clerk User Records

**Status: Fixed**
**Severity:** Medium
**Area:** Guests — Add / Edit
**Type:** Feature requirement

**Description:**
When adding or editing guest profiles, the system should create or update users through the Clerk API rather than storing guest data directly in MongoDB. Clerk supports `publicMetadata` and `privateMetadata` on user records, which should be used to store additional guest information (e.g., nationality, national ID, country flag, notes). This keeps user identity and business metadata in a single authoritative source and aligns with the existing auth architecture.

**Implementation notes:**
- Use `clerkClient.users.createUser()` for new guests.
- Use `clerkClient.users.updateUserMetadata()` to store extra fields.
- The Guests page should read from Clerk (as it likely already does) and write back to Clerk on save.
