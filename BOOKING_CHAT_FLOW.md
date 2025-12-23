# Booking and Chat Flow Documentation

## Overview
This document explains how the booking and chat system works across multiple entities (Laptop, Mobile, Car, Bike) using shared screens and entity-specific APIs.

---

## 1. Architecture Overview

### Buyer Flow
```
BuyerChatsScreen (Entity Selection)
    ↓
BuyerChatListScreen (Entity-specific Bookings List)
    ↓
BuyerChatThreadScreen (Chat Conversation)
```

### Seller Flow
```
SellerChatListScreen (Entity Selection)
    ↓
SellerEntityRequestsScreen (Entity-specific Requests List)
    ↓
SellerChatThreadScreen (Chat Conversation + Actions)
```

---

## 2. Key Files Structure

### Chat Screens
| File | Purpose |
|------|---------|
| `src/features/buyer/chat/screens/BuyerChatsScreen.tsx` | Entry point - shows entity categories |
| `src/features/buyer/chat/screens/BuyerChatListScreen.tsx` | Lists buyer's bookings for selected entity |
| `src/features/buyer/chat/screens/BuyerChatThreadScreen.tsx` | Chat conversation screen |
| `src/features/seller/chat/screens/SellerChatListScreen.tsx` | Entry point - shows entity categories |
| `src/features/seller/chat/screens/SellerEntityRequestsScreen.tsx` | Lists seller's requests for selected entity |
| `src/features/seller/chat/screens/SellerChatThreadScreen.tsx` | Chat conversation with seller actions |

### Core API Layer
| File | Purpose |
|------|---------|
| `src/core/booking/api/createBookingApi.ts` | Factory function - creates entity-specific API adapter |
| `src/core/booking/api/endpoints.config.ts` | All API endpoints for each entity type |
| `src/core/booking/api/BookingApiAdapter.ts` | Interface defining API contract |

### Hooks
| Hook | Purpose |
|------|---------|
| `useBookingList` | Fetches buyer's bookings |
| `useBookingThread` | Fetches single booking by ID |
| `useSendMessage` | Sends messages |
| `useSellerBookings` | Fetches seller's bookings |
| `useCreateBooking` | Creates new booking |

---

## 3. Entity Type Flow - How It Works

### Step 1: User Selects Entity Category

**BuyerChatsScreen.tsx:76-79**
```typescript
navigation.navigate('BuyerChatList', {
  entityType: category.id,      // 'laptop', 'car', 'mobile', 'bike'
  entityName: category.name
})
```

**SellerChatListScreen.tsx:67-70**
```typescript
navigation.navigate('SellerEntityRequests', {
  entityType: category.id,
  entityName: category.name
})
```

### Step 2: List Screen Receives Entity Type

**BuyerChatListScreen.tsx:38**
```typescript
const { entityType = 'mobile', entityName = 'Mobile' } = route.params || {}

useBookingList({
  entityType,           // Passed to hook
  buyerId: buyerId || 0
})
```

**SellerEntityRequestsScreen.tsx:35**
```typescript
const { entityType, entityName } = route.params

useSellerBookings({
  entityType,           // Passed to hook
  sellerId: sellerId || 0
})
```

### Step 3: Thread Screen Receives Entity Type

**BuyerChatThreadScreen.tsx:35**
```typescript
const { requestId, entityType = 'mobile' } = route.params

useBookingThread({
  entityType,           // Passed to hook
  bookingId: requestId,
  contextId: buyerId
})
```

**SellerChatThreadScreen.tsx:43**
```typescript
const { requestId, entityType = 'mobile' } = route.params

useBookingThread({
  entityType,           // Passed to hook
  bookingId: requestId,
  contextId: entityId   // mobileId, laptopId, carId, or bikeId
})
```

---

## 4. The Magic: API Factory Pattern

### createBookingApi() Function
**Location:** `src/core/booking/api/createBookingApi.ts`

This factory function creates an entity-specific API adapter:

```typescript
export const createBookingApi = <TEntity>(entityType: EntityType): BookingApiAdapter<TEntity> => {
  return {
    createBooking: async (request) => { /* entity-specific logic */ },
    getBuyerBookings: async (buyerId) => { /* entity-specific endpoint */ },
    getBookingById: async (bookingId, contextId) => { /* entity-specific endpoint */ },
    sendMessage: async (bookingId, senderId, message) => { /* entity-specific logic */ },
    // ... more methods
  };
};
```

### Entity-Specific Logic Example

**Create Booking - Different Payloads:**
```typescript
if (entityType === 'laptop') {
  payload = {
    laptopId: request.entityId,
    buyerUserId: request.buyerUserId,
    message: request.message,
    bookingDate: request.bookingDate || defaultDate,  // Laptop requires date
  };
}

if (entityType === 'car') {
  payload = {
    buyerId: request.buyerUserId,
    carId: request.entityId,
    message: request.message,
  };
}

if (entityType === 'mobile') {
  payload = {
    mobileId: request.entityId,
    buyerUserId: request.buyerUserId,
    message: request.message,
  };
}
```

---

## 5. API Endpoints Configuration

**Location:** `src/core/booking/api/endpoints.config.ts`

### Laptop Endpoints
```typescript
laptop: {
  createBooking: '/api/laptopBookings/create',
  getBuyerBookings: (buyerId) => `/api/laptopBookings/buyer/${buyerId}`,
  getBookingById: (bookingId) => `/api/laptopBookings/booking/${bookingId}`,
  getSellerBookings: (sellerId) => `/api/laptopBookings/seller/${sellerId}`,
  sendMessage: (bookingId) => `/api/laptopBookings/${bookingId}/message`,
  updateStatus: (bookingId) => `/api/laptopBookings/${bookingId}/status`,
  acceptBooking: (bookingId) => `/api/laptopBookings/${bookingId}/accept`,
  approveBooking: (bookingId) => `/api/laptopBookings/${bookingId}/complete`,
}
```

### Mobile Endpoints
```typescript
mobile: {
  createBooking: '/api/v1/mobile/requests/create',
  getBuyerBookings: (buyerId) => `/api/v1/mobile/requests/buyer/${buyerId}`,
  getBookingById: (bookingId) => `/api/v1/mobile/requests/${bookingId}`,
  sendMessage: (bookingId) => `/api/v1/mobile/requests/${bookingId}/message`,
  updateStatus: (bookingId) => `/api/v1/mobile/requests/${bookingId}/status`,
}
```

### Car Endpoints
```typescript
car: {
  createBooking: '/api/carBookings/createBooking',
  getBuyerBookings: (buyerId) => `/api/carBookings/buyer/${buyerId}`,
  getSellerBookings: (sellerId) => `/api/carBookings/seller/${sellerId}`,
  sendMessage: (bookingId) => `/api/carBookings/send',  // Uses query params
  acceptBooking: (bookingId) => `/api/carBookings/acceptBooking',  // Uses query params
}
```

### Bike Endpoints
```typescript
bike: {
  createBooking: '/bikes/bookings/post',
  getBuyerBookings: (buyerId) => `/bikes/bookings/buyer/${buyerId}`,
  getSellerBookings: (sellerId) => `/bikes/bookings/get-seller/${sellerId}`,
  sendMessage: (bookingId) => `/bikes/bookings/${bookingId}/message`,
}
```

---

## 6. Complete Flow: Laptop Booking Example

### 1. Buyer Initiates Chat
- User taps "Laptops" in `BuyerChatsScreen`
- Navigates to `BuyerChatListScreen` with `{ entityType: 'laptop' }`
- Hook calls: `createBookingApi('laptop').getBuyerBookings(buyerId)`
- **API Call:** `GET /api/laptopBookings/buyer/{buyerId}`

### 2. Buyer Opens Thread
- User taps a booking from the list
- Navigates to `BuyerChatThreadScreen` with `{ requestId, entityType: 'laptop' }`
- Hook calls: `createBookingApi('laptop').getBookingById(requestId, buyerId)`
- **API Call:** `GET /api/laptopBookings/booking/{requestId}`

### 3. Buyer Sends Message
- User types and sends: "Hello, is this laptop available?"
- Calls: `createBookingApi('laptop').sendMessage(requestId, userId, message)`
- **API Call:** `POST /api/laptopBookings/{requestId}/message?senderUserId={userId}&message=...`
- Response: Updated booking with new message in conversation array

### 4. Seller Views Request
- Seller taps "Laptops" in `SellerChatListScreen`
- Navigates to `SellerEntityRequestsScreen` with `{ entityType: 'laptop' }`
- Hook calls: `createBookingApi('laptop').getSellerBookings(sellerId)`
- **API Call:** `GET /api/laptopBookings/seller/{sellerId}`

### 5. Seller Opens Thread
- Seller taps a request from the list
- Navigates to `SellerChatThreadScreen` with `{ requestId, laptopId, buyerId, entityType: 'laptop' }`
- Hook calls: `createBookingApi('laptop').getBookingById(requestId, laptopId)`
- **API Call:** `GET /api/laptopBookings/booking/{requestId}`

### 6. Seller Sends First Message (Auto Status Update)
**SellerChatThreadScreen.tsx:79-117**
```typescript
if (booking?.status === 'PENDING') {
  // Auto-update status to IN_NEGOTIATION
  await createBookingApi('laptop').updateStatus(requestId, 'IN_NEGOTIATION');
  // API Call: PATCH /api/laptopBookings/{requestId}/status?status=IN_NEGOTIATION
}

// Then send the message
await sendMessage(requestId, userId, 'Yes, it is available');
// API Call: POST /api/laptopBookings/{requestId}/message
```

### 7. Seller Accepts Request
- Seller clicks "Accept Request" button
- Calls: `createBookingApi('laptop').acceptBooking(requestId)`
- **API Call:** `PATCH /api/laptopBookings/{requestId}/accept`
- Status changes from IN_NEGOTIATION → ACCEPTED

### 8. Seller Completes Deal
- After negotiation, seller clicks "Complete Deal"
- Calls: `createBookingApi('laptop').approveBooking(requestId)`
- **API Call:** `POST /api/laptopBookings/{requestId}/complete`
- Status changes to COMPLETED
- Chat input becomes disabled

---

## 7. Key Implementation Details

### Navigation Parameter Mapping
**SellerEntityRequestsScreen.tsx:49-63**
```typescript
const handleRequestPress = (request: any) => {
  const params: any = {
    requestId: request.bookingId || request.requestId,
    buyerId: request.buyerId,
    buyerName: request.buyerName,
    entityType,
  };

  // Entity-specific ID mapping
  if (entityType === 'mobile') params.mobileId = request.entityId;
  if (entityType === 'laptop') params.laptopId = request.entityId;
  if (entityType === 'car') params.carId = request.entityId;
  if (entityType === 'bike') params.bikeId = request.entityId;

  navigation.navigate('SellerChatThread', params);
};
```

### Booking Normalization
**createBookingApi.ts:273-329**

Different APIs return different response structures. The system normalizes them:

```typescript
function normalizeBooking(data: any, entityType: EntityType): Booking {
  // Extract seller name from different structures
  let sellerName = data.sellerName;
  if (!sellerName && data.seller?.user) {
    sellerName = `${data.seller.user.firstName} ${data.seller.user.lastName}`.trim();
  }

  // Extract entity ID from different fields
  const entityId = data.mobileId || data.carId || data.laptopId || data.bikeId;

  return {
    bookingId: data.bookingId || data.requestId || data.laptopBookingId,
    buyerId: data.buyerId || data.buyerUserId,
    sellerId: data.sellerId,
    entityId,
    status: data.status,
    conversation: data.conversation || data.messages || [],
    // ... more normalized fields
  };
}
```

### Seller Status Actions
**StatusActionButtons.tsx:26-180**

```typescript
const api = createBookingApi(entityType);

// For PENDING status (mobile/laptop only, not car)
if (currentStatus === 'PENDING' && entityType !== 'car') {
  // Show Accept and Reject buttons
  onAccept: () => api.acceptBooking(bookingId)
  onReject: () => api.rejectBooking(bookingId)
}

// For IN_NEGOTIATION, ACCEPTED, or CONFIRMED
if (['IN_NEGOTIATION', 'ACCEPTED', 'CONFIRMED'].includes(currentStatus)) {
  // Show Complete Deal button
  onComplete: () => api.approveBooking(bookingId)
}
```

---

## 8. Entity-Specific Differences

| Feature | Laptop | Mobile | Car | Bike |
|---------|--------|--------|-----|------|
| **Booking Date** | Required | Not required | Not required | Not required |
| **Send Message Format** | Query params | FormData | Body + query | Standard body |
| **Seller Bookings API** | ✅ Supported | ❌ Not supported | ✅ Supported | ✅ Supported |
| **First Message Status** | → IN_NEGOTIATION | → IN_NEGOTIATION | → CONFIRMED | → IN_NEGOTIATION |
| **Status Change Method** | `updateStatus()` | `updateStatus()` | `acceptBooking()` | `updateStatus()` |
| **API Response** | Full booking | Full booking | Partial (merge) | Full booking |

### Car Entity Special Handling

**BuyerChatThreadScreen.tsx:85-91**
```typescript
if (entityType === 'car' && booking) {
  // Car API returns partial data - merge with existing booking
  updateBooking({
    ...booking,
    status: updatedBooking.status,
    conversation: updatedBooking.conversation,
  });
}
```

---

## 9. Chat Status System

**From bookingStatus.utils.ts**

### Buyer View
- **PENDING** → "Pending" (yellow, clock icon)
- **IN_NEGOTIATION** → "In Negotiation" (blue, chat icon)
- **CONFIRMED** → "In Negotiation" (blue, chat icon)
- **ACCEPTED** → "Accepted" (green, check circle)
- **REJECTED** → "Rejected" (red, close circle)
- **COMPLETED** → "Completed" (gray, check all)
- **SOLD** → "Sold" (gray, check all)

### Seller View
- **PENDING** → "New Request" (yellow, clock icon)
- **IN_NEGOTIATION** → "In Negotiation" (blue, chat icon)
- **ACCEPTED** → "Accepted" (green, check circle)
- **REJECTED** → "Rejected" (red, close circle)
- **COMPLETED** → "Deal Completed" (gray, check all)

### Chat Disabled When
```typescript
status === 'COMPLETED' || status === 'REJECTED' || status === 'SOLD'
```

---

## 10. Shared Components

Both buyer and seller screens use shared components:

### From buyer/chat/components:
- **MessageBubble** - Renders chat messages
- **ChatInput** - Input field for typing messages

Seller imports from buyer folder:
```typescript
import MessageBubble from '../../../buyer/chat/components/MessageBubble';
import ChatInput from '../../../buyer/chat/components/ChatInput';
```

---

## 11. Navigation Stack Definition

### Buyer Stack
**BuyerTabNavigator.tsx:46-52**
```typescript
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BuyerChats" component={BuyerChatsScreen} />
    <Stack.Screen name="BuyerChatList" component={BuyerChatListScreen} />
    <Stack.Screen name="BuyerChatThread" component={BuyerChatThreadScreen} />
  </Stack.Navigator>
);
```

### Seller Stack
**SellerTabNavigator.tsx:19-25**
```typescript
const ChatStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SellerChats" component={SellerChatListScreen} />
    <Stack.Screen name="SellerEntityRequests" component={SellerEntityRequestsScreen} />
    <Stack.Screen name="SellerChatThread" component={SellerChatThreadScreen} />
  </Stack.Navigator>
);
```

---

## 12. Summary - Why This Architecture Works

### ✅ Single Codebase for Multiple Entities
- Same chat screens work for laptop, mobile, car, and bike
- No code duplication

### ✅ Factory Pattern
- `createBookingApi(entityType)` creates entity-specific API adapter
- Handles different endpoints, payloads, and response formats

### ✅ Navigation Params
- `entityType` passed through navigation params
- Maintains context throughout the flow

### ✅ Normalization Layer
- Different API responses normalized to common `Booking` interface
- UI works with consistent data structure

### ✅ Extensibility
- Adding new entity type (e.g., "tablet"):
  1. Add endpoints to `endpoints.config.ts`
  2. Add logic to `createBookingApi.ts`
  3. Add category to `BuyerChatsScreen` and `SellerChatListScreen`
  4. No changes needed to thread screens or hooks!

---

## Presentation Key Points

1. **Problem:** Need chat system for 4 different entities without duplicating code

2. **Solution:**
   - Shared screens for all entities
   - Factory pattern for entity-specific APIs
   - Entity type passed via navigation params

3. **Flow:**
   - User selects entity → entityType passed to list screen
   - List screen fetches data using `createBookingApi(entityType)`
   - User taps item → entityType passed to thread screen
   - Thread screen uses same entityType for all operations

4. **Benefits:**
   - DRY (Don't Repeat Yourself)
   - Easy to add new entities
   - Centralized API logic
   - Type-safe with TypeScript

5. **Example:** Laptop booking flows through entire system with just `entityType: 'laptop'` parameter
