# SnapShare - System Scaling Plan

## 1. Assumptions and Daily Active Users (DAU)
- Registered Users: 10,000,000
- Daily Active Users (DAU): 10% of registered users = 1,000,000 active users per day
- Upload Rate: Each active user uploads 1 photo per day = 1,000,000 uploads/day
- Consumption Rate: Each active user views 50 feed pages per day = 50,000,000 feed views/day
- File Sizes: Average photo size is 2 MB; average thumbnail size is 50 KB

## 2. Quantitative Estimates
- Uploads per Second:
  - Average: 1,000,000 uploads / 86,400 seconds ≈ 11.57 uploads/sec
  - Peak ($5\times$): 11.57 × 5 ≈ 57.85 uploads/sec
- Feed Views per Second:
  - Average: 50,000,000 views / 86,400 seconds ≈ 578.70 feed views/sec
  - Peak ($5\times$): 578.70 × 5 ≈ 2,893.52 feed views/sec[cite: 9]
- Photo Storage per Year:
  - Total Photos/Year: 1,000,000 photos/day × 365 days = 365,000,000 photos/year[cite: 9]
  - Original Photos Storage: 365,000,000 × 2 MB = 730,000,000 MB = 730 TB/year[cite: 9]
  - Thumbnails Storage: 365,000,000 × 50 KB = 18,250,000,000 KB ≈ 18.25 TB/year[cite: 9]
  - Total Combined Storage: 730 TB + 18.25 TB = 748.25 TB/year[cite: 9]

## 3. System Load Profile (Read-Heavy vs. Write-Heavy)
SnapShare is a read-heavy system. With 50 million feed views compared to only 1 million photo uploads per day, read requests vastly outnumber write requests[cite: 9]. 
* Design Implications: To handle the high read volume, the architecture must prioritize caching, database read replicas, and a Content Delivery Network (CDN) to serve feeds and static assets efficiently without overloading the primary database.

## 4. Why Photos Should Not Be Stored in the Database
Storing large binary files (blobs like 2 MB photos) directly inside a relational database severely degrades query performance, causes database bloat, slows down backups, and increases costs. Instead, raw files and thumbnails should be stored in Object Storage (such as AWS S3), while only lightweight metadata (file URLs, user IDs, timestamps) is saved in the database.

## 5. Architecture Diagram

```text
[Users / Clients]
       │
       ▼
    [ CDN ] ──────── (Static Images / Thumbnails / Web Assets)
       │
       ▼
[ Load Balancer ]
       │
       ├────────────────────────┐
       ▼                        ▼
[ App Servers ]         [ App Servers ]
       │                        │
       ├─────────┬──────────────┤
       ▼         ▼              ▼
    [Cache]  [Queue] ──► [Worker] ──► [Object Storage]
       │         │                     (Raw Photos & Thumbnails)
       ▼         ▼
[ Database ] ◄──┘
  (Primary: Writes) ──(Replication)──► [ Database (Read Replica) ]
                                        (Reads: Feeds / Metadata)

6. Component Breakdown (One Sentence Each)
CDN: Caches static image assets and thumbnails at edge locations globally to minimize network latency and reduce load on application servers.

Load Balancer: Distributes incoming user traffic evenly across multiple application servers to ensure high availability and prevent single-point overload.

App Servers: Execute business logic, handle API requests, and coordinate communication between clients, storage, queues, and databases.

Cache: Stores frequently accessed metadata or user feeds in fast memory to accelerate response times and reduce database read pressure.

Database (with Read Replica): The primary database handles write operations (metadata updates), while read replicas scale out capacity to serve heavy read queries for user feeds.

Object Storage: Securely and cost-effectively stores massive binary files including original high-resolution photos and generated thumbnails.

Queue & Worker: Asynchronously processes heavy background tasks like thumbnail generation so that user uploads complete without blocking HTTP requests.

7. Step-by-Step Photo Upload Flow
Client Request: The user selects a photo and sends an HTTP POST upload request to the system, which passes through the Load Balancer[cite: 9].

Routing: The Load Balancer forwards the request to an available Application Server[cite: 9].

Object Storage Upload: The application server uploads the raw binary photo file directly into Object Storage and receives a storage URL[cite: 9].

Metadata Persistence: The application server writes the photo's metadata (user ID, storage URL, caption, timestamp) into the Primary Database[cite: 9].

Queue Job Dispatch: The application server pushes a thumbnail creation job containing the photo reference to the Message Queue[cite: 9].

Async Thumbnail Processing: A background worker picks up the job from the queue, downloads the raw photo from object storage, resizes it into a 50 KB thumbnail, and uploads the thumbnail back to object storage[cite: 9].

Thumbnail URL Update: The worker updates the database metadata record with the new thumbnail URL[cite: 9].

Completion: The application server returns a success response back to the client[cite: 9].

8. Trade-offs
Trade-off 1 (Eventual Consistency for Thumbnails vs. Fast Uploads): Using an asynchronous queue and background worker for thumbnail generation allows uploads to respond instantly to users without waiting for image processing, but introduces a slight delay where thumbnails may take a few moments to appear in feeds after publishing.

Trade-off 2 (Database Replication Lag vs. Read Scalability): Using database read replicas allows the system to easily scale up for millions of read-heavy feed requests, but introduces minor replication lag where newly created posts might take a fraction of a second to appear when queried from a replica.