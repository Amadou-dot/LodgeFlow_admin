# Button Consistency Guide

This guide establishes consistent button patterns across the LodgeFlow Admin application.

## Button Patterns

### Primary Actions
```tsx
<Button color='primary' variant='solid'>
  Primary Action
</Button>
```

### Secondary Actions
```tsx
<Button color='default' variant='bordered'>
  Secondary Action
</Button>
```

### Cancel/Close Actions
```tsx
<Button variant='light'>
  Cancel
</Button>
```

### Destructive Actions (Delete)
```tsx
<Button color='danger' variant='light'>
  Delete
</Button>
```

### Form Actions
```tsx
// Save/Submit
<Button color='primary' variant='solid' type="submit">
  Save Changes
</Button>

// Cancel
<Button variant='bordered' onPress={onCancel}>
  Cancel
</Button>
```

## DeletionModal Usage

Instead of creating custom delete modals, use the `DeletionModal` component:

```tsx
import DeletionModal from '@/components/DeletionModal';

// For React Query mutations
<DeletionModal
  resourceId={item.id}
  resourceName="Item"
  itemName={item.name}
  onDelete={deleteMutation}
  note="Optional note about deletion restrictions"
/>

// For custom functions
<DeletionModal
  resourceId={item.id}
  resourceName="Item"
  itemName={item.name}
  onDelete={() => deleteFunction(item.id)}
  buttonProps={{
    color: 'danger',
    variant: 'light',
    size: 'sm'
  }}
/>
```

## Updated Components

The following components have been updated to use consistent button patterns and DeletionModal:

### Modal Components Updated
1. **CabinCard**: Uses DeletionModal, consistent button variants
2. **DiningCard**: Uses DeletionModal, consistent button variants
3. **ExperienceGrid**: Replaced manual delete modal with DeletionModal
4. **Cabins Page**: Replaced manual delete modal with DeletionModal

### Button Consistency Updates
1. **EditExperienceForm/FormActions**: Added `variant='solid'` to primary button
2. **BookingForm/FormActions**: Added `variant='solid'` to primary button
3. **AddGuestForm/FormActionsSection**: Added `variant='solid'` to primary button
4. **navbar**: Added `variant='solid'` to Sign Up button
5. **EditBookingModal**: Changed Close button to `variant='light'` (close action)

### Manual Delete Modals Removed
- Removed custom delete modal from `app/(dashboard)/cabins/page.tsx`
- Removed custom delete modal from `components/ExperienceGrid.tsx`

## Button Variant Standards

- `solid`: Primary actions (save, create, submit)
- `bordered`: Secondary actions (cancel in forms)
- `light`: Cancel/close actions, destructive actions
- `flat`: Special UI states
- `ghost`: Navigation or subtle actions
