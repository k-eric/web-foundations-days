# TicketHub - Event Ticketing System Design Document

## 1. Requirements

### Functional Requirements
- **Browse Events:** Users can search and view upcoming concerts, sports events, and shows.
- **View Seat Map:** Users can view real-time seat availability and layout maps for a specific venue.
- **Hold Seats:** Users can temporarily reserve specific seats during checkout (hold with a TTL).
- **Process Payment:** Users can securely complete payment to finalize ticket purchases.
- **View Purchased Tickets:** Users can view their order history and digital tickets.

### Non-Functional Requirements
- **Speed:** Low latency (<200ms) for browsing and seat map rendering.
- **Correctness:** Absolute data integrity; zero double-bookings under high concurrency.
- **Fairness:** First-come, first-served allocation during high-demand flash sales without bot exploitation.

---

## 2. Traffic Estimates & Calculations

### Assumptions (Based on Starting Facts)
- **Registered Users:** 2,000,000
- **Normal Day Traffic:** 50,000 active visitors/day, each viewing 10 pages = 500,000 page views/day
- **Normal Ticket Sales:** 5,000 tickets sold per normal day
- **"Big Sale" Flash Traffic:** 200,000 users trying to buy 20,000 seats within the first 10 minutes

### Quantitative Calculations
- **Normal Read Traffic (Average):**
  - $500,000 \text{ views} / 86,400 \text{ seconds} \approx \textbf{5.79 reads/sec}$
- **Normal Write Traffic (Average):**
  - $5,000 \text{ sales} / 86,400 \text{ seconds} \approx \textbf{0.06 writes/sec}$
- **Flash Sale Spike (Big Sale):**
  - **Duration:** 10 minutes = 600 seconds
  - **Concurrent Checkout Attempts:** 200,000 users competing for 20,000 seats
  - **Average Request Rate during Spike:** $200,000 / 600 \text{ sec} \approx \textbf{333.33 requests/sec}$ (with peak burst traffic reaching over $1,500 \text{ req/sec}$ when the sale drops).

---

## 3. API Design

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/events` | Retrieve a list of available events. | `200 OK` |
| `GET` | `/api/v1/events/{id}/seats` | Get real-time seat map and status. | `200 OK` |
| `POST` | `/api/v1/events/{id}/seats/hold` | Temporarily hold selected seats (10-min TTL). | `201 Created` |
| `POST` | `/api/v1/orders/checkout` | Process payment and confirm ticket purchase. | `201 Created` |
| `GET` | `/api/v1/user/tickets` | Retrieve tickets owned by the authenticated user. | `200 OK` |

---

## 4. Data Model (Entities & Schema)

### Tables
1. **`users`**: Stores user account credentials and profile info.
2. **`events`**: Stores concert/event details (title, date, venue).
3. **`seats`**: Stores specific seats for each venue/event with a status (`available`, `held`, `booked`).
4. **`orders`**: Records completed ticket transactions linking users to purchased seats.

### SQL DDL (`CREATE TABLE`)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    venue VARCHAR(100) NOT NULL
);

CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    seat_number VARCHAR(20) NOT NULL,
    status ENUM('available', 'held', 'booked') DEFAULT 'available',
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE (event_id, seat_number)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    seat_id INT NOT NULL UNIQUE,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (seat_id) REFERENCES seats(id)
);

## 5. Preventing Double-Booking
 1. Database Transactions & Row-Level Locking: When a user attempts to hold a seat, the system opens an explicit database transaction (BEGIN TRANSACTION) and uses SELECT ... FOR UPDATE to lock the specific seat row.
 2. Conditional Status Updates: The server verifies if status = 'available'. If true, it updates the status to held and sets a Redis TTL timer (e.g., 10 minutes). If the user fails to complete checkout within 10 minutes, the Redis expiration triggers a release back to available.
 4. Unique Constraints: The composite unique constraint (event_id, seat_number) and the unique constraint on orders(seat_id) strictly prohibit duplicate bookings at the database engine level.

## 6. Architecture Diagram & Scaling
[Users / Clients]
       │
       ▼
[ Virtual Queue / Waiting Room ] (Manages Flash Sale Traffic Spikes)
       │
       ▼
    [ CDN ] ──────── (Static Frontend & Assets)
       │
       ▼
[ Load Balancer ] (Nginx / ALB)
       │
       ├─────────────────────────┐
       ▼                         ▼
[ App Server 1 ]         [ App Server 2 ]
       │                         │
       ├──────────┬──────────────┤
       ▼          ▼              ▼
    [ Redis Cache ]  [ Message Queue ] ──► [ Worker ]
    (Seat Holds)     (Async Payments)
       │
       ▼
[ Primary Database ] ──(Async Replication)──► [ Read Replicas ]
 (Writes / Transactions)                     (Event Browsing / Seat Maps)

Component Explanations
 1.Virtual Queue: Throttles massive flash sale traffic influx, placing users in a fair waiting line before letting them access seat selection.

 2. CDN: Caches static web content and event poster images at global edge locations to minimize latency.

 3. Load Balancer: Distributes incoming HTTP traffic evenly across multiple stateless application servers.

 4. App Servers: Execute business logic, handle API requests, and coordinate seat holding logic.

 5. Redis Cache: Manages lightning-fast temporary seat holds and TTL expirations during peak sales.

 6. Message Queue & Worker: Offloads asynchronous background tasks like payment gateway callbacks and email receipt generation.

 7. Primary Database & Read Replicas: Primary DB handles strict transactional checkouts, while read replicas absorb heavy read loads for event browsing.

 ## 7. Trade-offs & SPOF Mitigation
  1. Trade-off 1 (Virtual Waiting Room vs. Direct Access): Implementing a virtual queue creates a fair barrier and protects backend servers from crashing under 200,000 concurrent users, but introduces a brief mandatory wait time for users eager to buy tickets.
  2. Trade-off 2 (Strict Transactional Locking vs. High Throughput): Using row-level locking ensures 100% correctness against double-booking, but can introduce minor queuing delays for popular seats during intense flash sales.
  3. SPOF Mitigation: Single points of failure are eliminated by deploying redundant load balancers, horizontally autoscaling application servers, using Redis cluster replication, and configuring master-slave database failover groups.