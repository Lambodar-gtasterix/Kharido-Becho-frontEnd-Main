# Mobile Booking Flow Documentation

## Overview
This document explains the complete mobile booking flow, chat functionality, conversation history loading, and all API endpoints used in the system.

---

## Table of Contents
1. [Seller Flow - Adding Mobile](#seller-flow---adding-mobile)
2. [Buyer Flow - Chat & Booking](#buyer-flow---chat--booking)
3. [Seller Flow - Managing Requests](#seller-flow---managing-requests)
4. [API Endpoints](#api-endpoints)
5. [Key Hooks](#key-hooks)

---

## Seller Flow - Adding Mobile

### Navigation: `SellMobileStack`
**Path:** `src/features/seller/sell/navigation/SellMobileStack.tsx`

### Step 1: Add Mobile Details
**Screen:** `AddMobileDetailsScreen.tsx`
- **Inputs:** Brand, Model, Color, Year, Storage, RAM, Condition, Description, Price
- **Brand Autocomplete:** GET `/api/v1/mobile-meta/brands?query={query}`
- **Model Autocomplete:** GET `/api/v1/mobile-meta/models?brand={brand}&query={query}`
- **Submit API:** POST `/api/v1/mobiles/add`
  ```json
  {
    "sellerId": 123,
    "brand": "APPLE",
    "model": "IPHONE 14 PRO",
    "color": "Space Gray",
    "yearOfPurchase": "2023",
    "storage": "256GB",
    "ram": "6GB",
    "condition": "Excellent",
    "description": "Like new condition",
    "price": 75000
  }
  ```
- **Response:** Returns `mobileId`

### Step 2: Upload Photos
**Screen:** `SelectMobilePhotoScreen.tsx`
- **Max Photos:** 10
- **API:** POST `/api/v1/mobile-images/{mobileId}/upload`
- **Format:** FormData with multiple files

### Step 3: Review Pricing
**Screen:** `MobilePricingScreen.tsx`
- **API:** GET `/api/v1/mobiles/{mobileId}`
- Updates pricing if needed

### Step 4: Set Location
**Screen:** `MobileLocationScreen.tsx`
- Select State, City, Area
- Location pickers provided

### Step 5: Confirm Details
**Screen:** `ConfirmDetailsScreen.tsx`
- **API:** GET `/api/v1/sellers/{userId}`
- Confirms contact details
- Posts the ad and navigates to SellerHome

---

## Buyer Flow - Chat & Booking

### Step 1: Browse Mobiles
**Screen:** `CatalogListScreen` (Browse tab)
- View available mobile listings

### Step 2: View Details
**Screen:** `CatalogDetailScreen`
- Click on mobile to see full details
- Click "Chat" button to initiate conversation

### Step 3: Create Chat Request
**Modal:** `ChatRequestModal`
- **Input:** Initial message to seller
- **API:** POST `/api/v1/mobile/requests/create`
  ```json
  {
    "mobileId": 456,
    "buyerUserId": 789,
    "message": "Is this still available?"
  }
  ```
- **Response:** Creates booking with status `PENDING`

### Step 4: View Chat List
**Navigation:** Chats tab → Select "Mobiles"
**Screen:** `BuyerChatListScreen.tsx`
- **API:** GET `/api/v1/mobile/requests/buyer/{buyerId}`
- **Filters:** All, Active, Completed
- **Hook:** `useBookingList`

### Step 5: Chat Conversation
**Screen:** `BuyerChatThreadScreen.tsx`
- **Load Conversation:** GET `/api/v1/mobile/requests/{bookingId}`
  - Returns full conversation history with all messages
  - Shows mobile details, seller info, and messages
- **Send Message:** POST `/api/v1/mobile/requests/{bookingId}/message`
  ```json
  FormData {
    "senderUserId": 789,
    "message": "What's your best price?"
  }
  ```
- **Hooks:**
  - `useBookingThread` - Loads conversation
  - `useSendMessage` - Sends new messages

---

## Seller Flow - Managing Requests

### Step 1: View Categories
**Screen:** `SellerChatCategoriesScreen.tsx`
- Select entity type (Mobiles, Laptops, Cars, Bikes)

### Step 2: View Mobile Requests
**Screen:** `SellerAdRequestsScreen.tsx`
- Shows all buyer requests for specific mobile
- **API:** GET `/api/v1/mobile/requests/{mobileId}`
- **Hook:** `useEntityBookings`

### Step 3: Chat with Buyer
**Screen:** `SellerChatThreadScreen.tsx`
- **Load Conversation:** GET `/api/v1/mobile/requests/{bookingId}`
- **Send Message:** POST `/api/v1/mobile/requests/{bookingId}/message`
- **Auto Status Change:** First message changes status from `PENDING` to `IN_NEGOTIATION`
- **Status Actions:**
  - Accept: PATCH `/api/v1/mobile/requests/{bookingId}/accept`
  - Reject: PATCH `/api/v1/mobile/requests/{bookingId}/reject`
  - Complete: POST `/api/v1/mobile/requests/{bookingId}/complete`

---

## API Endpoints

### Mobile Listing APIs
**Base Path:** `/api/v1/mobiles/`

| Method | Endpoint | Description | File |
|--------|----------|-------------|------|
| POST | `/add` | Create new mobile listing | `addMobile.ts` |
| GET | `/{mobileId}` | Get mobile by ID | `getById.ts` |
| PATCH | `/update/{mobileId}` | Update mobile details | `update.ts` |
| DELETE | `/{mobileId}` | Delete mobile listing | `deleteMobile.ts` |
| GET | `/` | Get all mobiles | `getAll.ts` |

### Mobile Images API
**Base Path:** `/api/v1/mobile-images/`

| Method | Endpoint | Description | File |
|--------|----------|-------------|------|
| POST | `/{mobileId}/upload` | Upload mobile photos (max 10) | `uploadImages.ts` |

### Brand/Model Autocomplete APIs
**Base Path:** `/api/v1/mobile-meta/`

| Method | Endpoint | Description | Hook |
|--------|----------|-------------|------|
| GET | `/brands?query={query}` | Search mobile brands | `useBrandAutocomplete` |
| GET | `/models?brand={brand}&query={query}` | Search models by brand | `useModelAutocomplete` |

**Features:**
- Debounced search (300ms delay)
- Uppercase conversion
- Fallback to popular brands/models on error

### Booking/Chat APIs
**Base Path:** `/api/v1/mobile/requests/`

| Method | Endpoint | Description | Hook |
|--------|----------|-------------|------|
| POST | `/create` | Create new chat request | `useCreateBooking` |
| GET | `/buyer/{buyerId}` | Get all buyer bookings | `useBookingList` |
| GET | `/seller/{sellerId}` | Get all seller bookings | `useSellerBookings` |
| GET | `/{mobileId}` | Get all requests for mobile | `useEntityBookings` |
| GET | `/{bookingId}` | Get conversation by booking ID | `useBookingThread` |
| POST | `/{bookingId}/message` | Send message in conversation | `useSendMessage` |
| PATCH | `/{bookingId}/status?status={status}` | Update booking status | - |
| PATCH | `/{bookingId}/accept` | Accept booking request | - |
| PATCH | `/{bookingId}/reject` | Reject booking request | - |
| POST | `/{bookingId}/complete` | Mark booking as completed | - |

### Seller API
**Base Path:** `/api/v1/sellers/`

| Method | Endpoint | Description | File |
|--------|----------|-------------|------|
| GET | `/{userId}` | Get seller contact details | `confirmDetails.ts` |

---

## Key Hooks

### Location: `src/core/booking/hooks/`

#### `useCreateBooking`
- Creates new chat/booking request
- API: POST `/api/v1/mobile/requests/create`
- Returns: `{ mutate, loading, error }`

#### `useBookingList`
- Fetches all buyer bookings for entity type
- API: GET `/api/v1/mobile/requests/buyer/{buyerId}`
- Filters by status (All, Active, Completed)
- Returns: `{ bookings, loading, error, refetch }`

#### `useBookingThread`
- Loads single conversation with full message history
- API: GET `/api/v1/mobile/requests/{bookingId}`
- Returns: `{ booking, loading, error, refetch }`
- **Data Structure:**
  ```typescript
  {
    id: number,
    mobileId: number,
    buyerUserId: number,
    sellerUserId: number,
    status: 'PENDING' | 'IN_NEGOTIATION' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED',
    messages: [
      { id, senderUserId, message, createdAt, senderName }
    ],
    mobile: { brand, model, price, ... },
    buyer: { name, phone },
    seller: { name, phone }
  }
  ```

#### `useSendMessage`
- Sends message to existing conversation
- API: POST `/api/v1/mobile/requests/{bookingId}/message`
- Uses FormData
- Returns updated conversation
- Returns: `{ mutate, loading, error }`

#### `useEntityBookings`
- Fetches all bookings for specific listing (seller side)
- API: GET `/api/v1/mobile/requests/{mobileId}`
- Returns: `{ bookings, loading, error, refetch }`

### Location: `src/core/mobile/hooks/`

#### `useBrandAutocomplete`
- Brand search with debouncing (300ms)
- API: GET `/api/v1/mobile-meta/brands?query={query}`
- Fallback to `POPULAR_BRANDS` on error
- Returns: `{ brands, loading, error }`

#### `useModelAutocomplete`
- Model search filtered by brand
- API: GET `/api/v1/mobile-meta/models?brand={brand}&query={query}`
- Requires brand to be selected first
- Returns: `{ models, loading, error }`

---

## Booking Status Flow

```
PENDING (Initial request from buyer)
    ↓
IN_NEGOTIATION (Seller sends first message - automatic)
    ↓
ACCEPTED (Seller accepts the deal)
    or
REJECTED (Seller rejects the request)
    or
COMPLETED (Deal is finalized)
```

---

## Chat Loading Flow

### When opening chat conversation:

1. **User clicks on chat** → `BuyerChatThreadScreen` or `SellerChatThreadScreen`
2. **Hook `useBookingThread`** triggers with `bookingId`
3. **API Call:** GET `/api/v1/mobile/requests/{bookingId}`
4. **Response includes:**
   - Complete message history (all messages sorted by timestamp)
   - Mobile/Laptop/Car details
   - Buyer and Seller information
   - Current booking status
5. **Screen renders:**
   - Shows loading indicator while fetching
   - Displays all messages in chronological order
   - Shows mobile details at top
   - Provides message input at bottom

### When sending message:

1. **User types message** and clicks Send
2. **Hook `useSendMessage`** triggers
3. **API Call:** POST `/api/v1/mobile/requests/{bookingId}/message`
4. **Response:** Returns updated conversation with new message
5. **Screen updates:**
   - New message appears immediately
   - Conversation list refreshes
   - If seller's first message → status changes to `IN_NEGOTIATION`

---

## File Locations

### Screens
- Seller Sell Flow: `src/features/seller/sell/screens/mobile/`
- Buyer Chat: `src/features/buyer/chat/screens/`
- Seller Chat: `src/features/seller/chat/screens/`

### APIs
- Mobile APIs: `src/features/seller/sell/api/MobilesApi/`
- Booking APIs: `src/core/booking/api/`
- Meta APIs: `src/core/mobile/api/mobileMetaApi.ts`

### Hooks
- Booking Hooks: `src/core/booking/hooks/`
- Mobile Hooks: `src/core/mobile/hooks/`

### Navigation
- Sell Mobile Stack: `src/features/seller/sell/navigation/SellMobileStack.tsx`
- Buyer Chat Stack: `src/features/buyer/chat/navigation/BuyerChatStack.tsx`
- Seller Chat Stack: `src/features/seller/chat/navigation/SellerChatStack.tsx`

---

## Notes

- All text inputs for brand/model are auto-converted to UPPERCASE
- Brand autocomplete must be selected before model autocomplete works
- Maximum 10 photos can be uploaded per mobile
- Chat requests are created with `PENDING` status by default
- First seller message automatically changes status to `IN_NEGOTIATION`
- Both buyer and seller can view full conversation history
- Messages are sent using FormData format
- All APIs use `/api/v1/` base path
