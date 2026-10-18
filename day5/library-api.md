# Library REST API Design - Books Resource

This document specifies the REST API endpoints for managing the library's `books` collection.

## Endpoints

### 1. List All Books
- Method: `GET`
- Path: `/api/books`
- Description: Retrieves a complete list of all books available in the library.
- Success Status Code: `200 OK`

### 2. List Books by Author
- Method: `GET`
- Path: `/api/books?author=name`
- Description: Retrieves a filtered list of books written by a specific author using a query parameter.
- Success Status Code: `200 OK`

### 3. Get a Single Book
- Method: `GET`
- Path: `/api/books/:id`
- Description: Retrieves detailed information for a single book by its unique ID.
- Success Status Code: `200 OK`

### 4. Create a Book
- Method: `POST`
- Path: `/api/books`
- Description: Adds a new book to the library database.
- Example Request Body:
  ```json
  {
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "year": 2008
  }
- Success Status Code: `201 OK`

### 5. Update a Book 
- Method: PUT
- Path: /api/books/:id
- Description: Updates an existing book's details by its unique ID
- Exanple Request Body:
 ```json
 {
  "title": "Clean Code (Updated Edition)",
  "author": "Robert C. Martin",
  "year": 2021
}
- Success Status Code: `200 OK`

6. Delete a Book
Method: DELETE

Path: /api/books/:id

Description: Removes a book from the library database by its unique ID.

Success Status Code: 204 No Content

Error Handling
400 Bad Request
When it happens: Triggered when the request payload is malformed or missing mandatory fields (e.g., trying to create a book without a title).

404 Not Found
When it happens: Triggered when a client attempts to retrieve, update, or delete a book using an :id that does not exist in the database.