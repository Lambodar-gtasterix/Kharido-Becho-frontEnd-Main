# Laptop Booking & Chat Flow

## BUYER FLOW

### Screen 1: BuyerChatsScreen
**File:** `src/features/buyer/chat/screens/BuyerChatsScreen.tsx`

**User Action:** Taps "Laptops" category

**Code Block (lines 76-79):**
```typescript
navigation.navigate('BuyerChatList', {
  entityType: 'laptop',
  entityName: 'Laptops'
})
```

**What Happens:** Navigate to BuyerChatListScreen with entityType='laptop'

---

### Screen 2: BuyerChatListScreen
**File:** `src/features/buyer/chat/screens/BuyerChatListScreen.tsx`

**Receives Params (line 38):**
```typescript
const { entityType = 'mobile', entityName = 'Mobile' } = route.params || {}
// entityType = 'laptop', entityName = 'Laptops'
```

**Hook Called (lines 40-43):**
```typescript
const { bookings, loading, error, refetch } = useBookingList({
  entityType,           // 'laptop'
  buyerId: buyerId || 0
})
```

**What Hook Does:**
- Calls `createBookingApi('laptop').getBuyerBookings(buyerId)`
- **API Call:** `GET /api/laptopBookings/buyer/{buyerId}`
- Returns list of all laptop bookings for this buyer

**UI Renders (lines 97-130):**
```typescript
<FlatList
  data={bookings}
  renderItem={({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('BuyerChatThread', {
        requestId: item.bookingId,
        mobileTitle: item.entityTitle,
        sellerId: item.sellerId,
        entityType
      })}
    >
      {/* Shows booking card with seller name, status, last message */}
    </TouchableOpacity>
  )}
/>
```

**User Action:** Taps a booking card

**Navigation (lines 105-110):**
```typescript
navigation.navigate('BuyerChatThread', {
  requestId: item.bookingId,      // e.g., 123
  mobileTitle: item.entityTitle,  // laptop title
  sellerId: item.sellerId,
  entityType                      // 'laptop'
})
```

---

### Screen 3: BuyerChatThreadScreen
**File:** `src/features/buyer/chat/screens/BuyerChatThreadScreen.tsx`

**Receives Params (line 35):**
```typescript
const { requestId, entityType = 'mobile' } = route.params
// requestId = 123, entityType = 'laptop'
```

**Hook Called (lines 37-42):**
```typescript
const {
  booking,
  loading,
  error,
  refetch,
  updateBooking,
} = useBookingThread({
  entityType,           // 'laptop'
  bookingId: requestId, // 123
  contextId: buyerId
})
```

**What Hook Does:**
- Calls `createBookingApi('laptop').getBookingById(requestId, buyerId)`
- **API Call:** `GET /api/laptopBookings/booking/{requestId}`
- Returns single booking with:
  - Seller details
  - Laptop details
  - Status (PENDING, IN_NEGOTIATION, etc.)
  - Conversation array (all messages)

**Send Message Hook (lines 44-51):**
```typescript
const {
  sendMessage,
  loading: sendingMessage,
  error: sendError,
} = useSendMessage({
  entityType,           // 'laptop'
  onSuccess: updateBooking,
  onError: (err) => console.error(err),
})
```

**UI Renders (lines 128-155):**
```typescript
<FlatList
  data={booking?.conversation || []}
  renderItem={({ item: message }) => (
    <MessageBubble
      message={message.message}
      isSender={message.senderUserId === userId}
      timestamp={message.timestamp}
    />
  )}
/>

<ChatInput
  onSendMessage={handleSendMessage}
  disabled={isCompleted}
/>
```

**User Types Message:** "Is laptop available?"

**Send Message Function (lines 70-95):**
```typescript
const handleSendMessage = async (message: string) => {
  try {
    setIsSending(true)

    // Call hook's sendMessage
    const updatedBooking = await sendMessage(requestId, userId, message)

    // For laptop, full booking returned
    updateBooking(updatedBooking)

    setIsSending(false)
  } catch (err) {
    setIsSending(false)
  }
}
```

**What sendMessage Does (useSendMessage hook):**
- Calls `createBookingApi('laptop').sendMessage(requestId, userId, message)`
- **API Call:** `POST /api/laptopBookings/{requestId}/message?senderUserId={userId}&message=...`
- Returns updated booking with new message added to conversation

**API Layer (createBookingApi.ts for laptop, lines 94-116):**
```typescript
sendMessage: async (bookingId, senderId, message) => {
  const response = await api.post(
    endpoints.laptop.sendMessage(bookingId),
    {},
    {
      params: {
        senderUserId: senderId,
        message: message,
      },
    }
  )
  return normalizeBooking(response.data, 'laptop')
}
```

---

## SELLER FLOW

### Screen 1: SellerChatListScreen
**File:** `src/features/seller/chat/screens/SellerChatListScreen.tsx`

**User Action:** Taps "Laptops" category

**Code Block (lines 67-70):**
```typescript
navigation.navigate('SellerEntityRequests', {
  entityType: 'laptop',
  entityName: 'Laptops'
})
```

---

### Screen 2: SellerEntityRequestsScreen
**File:** `src/features/seller/chat/screens/SellerEntityRequestsScreen.tsx`

**Receives Params (line 35):**
```typescript
const { entityType, entityName } = route.params
// entityType = 'laptop', entityName = 'Laptops'
```

**Hook Called (lines 37-40):**
```typescript
const { bookings, loading, error, refetch } = useSellerBookings({
  entityType,           // 'laptop'
  sellerId: sellerId || 0,
})
```

**What Hook Does:**
- Calls `createBookingApi('laptop').getSellerBookings(sellerId)`
- **API Call:** `GET /api/laptopBookings/seller/{sellerId}`
- Returns all laptop booking requests for this seller

**UI Renders (lines 74-107):**
```typescript
<FlatList
  data={bookings}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => handleRequestPress(item)}>
      {/* Shows buyer name, status, last message */}
    </TouchableOpacity>
  )}
/>
```

**User Taps Request:**

**Navigation Logic (lines 49-63):**
```typescript
const handleRequestPress = (request: any) => {
  const params: any = {
    requestId: request.bookingId || request.requestId,
    buyerId: request.buyerId,
    buyerName: request.buyerName,
    entityType,
  }

  // For laptop
  params.laptopId = request.entityId

  navigation.navigate('SellerChatThread' as never, params as never)
}
```

---

### Screen 3: SellerChatThreadScreen
**File:** `src/features/seller/chat/screens/SellerChatThreadScreen.tsx`

**Receives Params (line 43):**
```typescript
const { requestId, entityType = 'mobile' } = route.params
// requestId = 123, entityType = 'laptop'
```

**Get Entity ID (lines 45-48):**
```typescript
const entityId =
  (route.params as any).mobileId ||
  (route.params as any).laptopId ||  // This one for laptop
  (route.params as any).carId
```

**Hook Called (lines 50-55):**
```typescript
const { booking, loading, error, refetch, updateBooking } = useBookingThread({
  entityType,           // 'laptop'
  bookingId: requestId, // 123
  contextId: entityId   // laptopId
})
```

**What Hook Does:**
- Calls `createBookingApi('laptop').getBookingById(requestId, laptopId)`
- **API Call:** `GET /api/laptopBookings/booking/{requestId}`
- Returns booking details with conversation

**Send Message Hook (lines 57-64):**
```typescript
const { sendMessage, loading: sendingMessage, error: sendError } = useSendMessage({
  entityType,           // 'laptop'
  onSuccess: updateBooking,
  onError: (err) => console.error(err),
})
```

**UI Renders (lines 161-221):**
```typescript
<FlatList
  data={booking?.conversation || []}
  renderItem={({ item: message }) => (
    <MessageBubble
      message={message.message}
      isSender={message.senderUserId === userId}
    />
  )}
/>

{/* Seller action buttons */}
<StatusActionButtons
  currentStatus={booking?.status}
  entityType={entityType}
  bookingId={requestId}
  onStatusUpdate={handleStatusUpdate}
/>

<ChatInput onSendMessage={handleSendMessage} />
```

**Seller Sends First Message:**

**Auto Status Update (lines 79-94):**
```typescript
const handleSendMessage = async (message: string) => {
  try {
    // If status is PENDING, auto-update to IN_NEGOTIATION
    if (booking?.status === 'PENDING') {
      const api = createBookingApi(entityType)

      // For laptop: update status
      await api.updateStatus(requestId, 'IN_NEGOTIATION')
      // API Call: PATCH /api/laptopBookings/{requestId}/status?status=IN_NEGOTIATION
    }

    // Send the actual message
    const updatedBooking = await sendMessage(requestId, userId, message)
    // API Call: POST /api/laptopBookings/{requestId}/message

    updateBooking(updatedBooking)
  }
}
```

**Seller Accepts Request (StatusActionButtons component):**

**Accept Button Click:**
```typescript
const api = createBookingApi('laptop')
await api.acceptBooking(requestId)
// API Call: PATCH /api/laptopBookings/{requestId}/accept
// Status changes: IN_NEGOTIATION → ACCEPTED
```

**Seller Completes Deal:**

**Complete Button Click:**
```typescript
const api = createBookingApi('laptop')
await api.approveBooking(requestId)
// API Call: POST /api/laptopBookings/{requestId}/complete
// Status changes: ACCEPTED → COMPLETED
// Chat input disabled
```

---

## API ENDPOINTS (Laptop)

**File:** `src/core/booking/api/endpoints.config.ts`

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

---

## HOOK DETAILS

### useBookingList Hook
**File:** `src/core/booking/hooks/useBookingList.ts`

**Input:** `{ entityType: 'laptop', buyerId: 1 }`

**What It Does:**
```typescript
const api = createBookingApi('laptop')
const data = await api.getBuyerBookings(buyerId)
// Calls: GET /api/laptopBookings/buyer/1
```

**Returns:** `{ bookings: [...], loading, error, refetch }`

---

### useBookingThread Hook
**File:** `src/core/booking/hooks/useBookingThread.ts`

**Input:** `{ entityType: 'laptop', bookingId: 123, contextId: 456 }`

**What It Does:**
```typescript
const api = createBookingApi('laptop')
const data = await api.getBookingById(bookingId, contextId)
// Calls: GET /api/laptopBookings/booking/123
```

**Returns:** `{ booking: {...}, loading, error, refetch, updateBooking }`

---

### useSendMessage Hook
**File:** `src/core/booking/hooks/useSendMessage.ts`

**Input:** `{ entityType: 'laptop', onSuccess, onError }`

**What It Does:**
```typescript
const api = createBookingApi('laptop')

const sendMessage = async (bookingId, senderId, message) => {
  const updated = await api.sendMessage(bookingId, senderId, message)
  // Calls: POST /api/laptopBookings/{bookingId}/message
  onSuccess(updated)
  return updated
}
```

**Returns:** `{ sendMessage, loading, error }`

---

### useSellerBookings Hook
**File:** `src/core/booking/hooks/useSellerBookings.ts`

**Input:** `{ entityType: 'laptop', sellerId: 2 }`

**What It Does:**
```typescript
const api = createBookingApi('laptop')
const data = await api.getSellerBookings(sellerId)
// Calls: GET /api/laptopBookings/seller/2
```

**Returns:** `{ bookings: [...], loading, error, refetch }`

---

## createBookingApi('laptop') Function

**File:** `src/core/booking/api/createBookingApi.ts`

**Returns object with methods:**

### getBuyerBookings
```typescript
getBuyerBookings: async (buyerId) => {
  const response = await api.get(
    endpoints.laptop.getBuyerBookings(buyerId)
    // /api/laptopBookings/buyer/{buyerId}
  )
  return response.data.map(item => normalizeBooking(item, 'laptop'))
}
```

### getBookingById
```typescript
getBookingById: async (bookingId, contextId) => {
  const response = await api.get(
    endpoints.laptop.getBookingById(bookingId)
    // /api/laptopBookings/booking/{bookingId}
  )
  return normalizeBooking(response.data, 'laptop')
}
```

### sendMessage
```typescript
sendMessage: async (bookingId, senderId, message) => {
  const response = await api.post(
    endpoints.laptop.sendMessage(bookingId),
    // /api/laptopBookings/{bookingId}/message
    {},
    {
      params: {
        senderUserId: senderId,
        message: message,
      }
    }
  )
  return normalizeBooking(response.data, 'laptop')
}
```

### updateStatus
```typescript
updateStatus: async (bookingId, status) => {
  const response = await api.patch(
    endpoints.laptop.updateStatus(bookingId),
    // /api/laptopBookings/{bookingId}/status
    {},
    { params: { status } }
  )
  return normalizeBooking(response.data, 'laptop')
}
```

### acceptBooking
```typescript
acceptBooking: async (bookingId) => {
  const response = await api.patch(
    endpoints.laptop.acceptBooking(bookingId)
    // /api/laptopBookings/{bookingId}/accept
  )
  return normalizeBooking(response.data, 'laptop')
}
```

### approveBooking
```typescript
approveBooking: async (bookingId) => {
  const response = await api.post(
    endpoints.laptop.approveBooking(bookingId)
    // /api/laptopBookings/{bookingId}/complete
  )
  return normalizeBooking(response.data, 'laptop')
}
```

---

## SUMMARY FLOW

### BUYER
```
BuyerChatsScreen (tap Laptops)
  → navigate with entityType='laptop'

BuyerChatListScreen
  → useBookingList('laptop', buyerId)
  → GET /api/laptopBookings/buyer/{buyerId}
  → Shows list
  → Tap booking
  → navigate with requestId, entityType='laptop'

BuyerChatThreadScreen
  → useBookingThread('laptop', requestId, buyerId)
  → GET /api/laptopBookings/booking/{requestId}
  → Shows conversation
  → Type message
  → useSendMessage → POST /api/laptopBookings/{requestId}/message
  → UI updates with new message
```

### SELLER
```
SellerChatListScreen (tap Laptops)
  → navigate with entityType='laptop'

SellerEntityRequestsScreen
  → useSellerBookings('laptop', sellerId)
  → GET /api/laptopBookings/seller/{sellerId}
  → Shows requests
  → Tap request
  → navigate with requestId, laptopId, entityType='laptop'

SellerChatThreadScreen
  → useBookingThread('laptop', requestId, laptopId)
  → GET /api/laptopBookings/booking/{requestId}
  → Shows conversation
  → First message auto-updates status
  → PATCH /api/laptopBookings/{requestId}/status?status=IN_NEGOTIATION
  → Then POST /api/laptopBookings/{requestId}/message
  → Accept request → PATCH /api/laptopBookings/{requestId}/accept
  → Complete deal → POST /api/laptopBookings/{requestId}/complete
```
