# Centralised API Error Response

## Assignment

2.49 — Centralised API Error Response

## Implementation

Created a shared API response utility at:

`lib/api-response.ts`

It provides:

- `errorResponse()` for standardized API errors
- `successResponse()` for standardized successful API responses

## Standard Error Shape

The standard error response contains:

- `success: false`
- `error.code`
- `error.message`
- optional `error.details`

Example:

    {
      "success": false,
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "File is required.",
        "details": {
          "field": "file",
          "issue": "required"
        }
      }
    }

## Standard Success Shape

Successful API responses contain:

- `success: true`
- `data`

Example:

    {
      "success": true,
      "data": {
        "file": {}
      }
    }

## Route Handlers Updated

### `app/api/upload/route.ts`

All error paths now use the centralized response utility.

Validation cases include:

- Missing file
- Unsupported file type
- File larger than 2 MB
- Invalid multipart form data

Validation errors include field-level details.

Unexpected upload failures return:

- Code: `INTERNAL_SERVER_ERROR`
- Generic client-safe message
- No stack trace or internal error details

### `app/api/upload/[filename]/route.ts`

All error paths now use the centralized response utility.

Cases include:

- Invalid filename → `VALIDATION_ERROR`
- Missing file → `NOT_FOUND`

Successful file retrieval continues to return the binary file response.

## Client Update

Updated:

`app/file-uploads/upload-form.tsx`

The client now reads the standardized success response from:

`result.data.file`

instead of:

`result.file`

## Verification

The following tests were successfully performed.

### Missing File

Request:

`POST /api/upload`

Result:

`VALIDATION_ERROR`

Message:

`File is required.`

Details:

- field: `file`
- issue: `required`

### Unsupported File Type

Request:

`POST /api/upload`

Result:

`VALIDATION_ERROR`

Message:

`Only PNG, JPEG, and PDF files are supported.`

Details:

- field: `file`
- issue: `unsupported_type`
- allowed types: PNG, JPEG, PDF

### File Too Large

Request:

`POST /api/upload`

Result:

`VALIDATION_ERROR`

Message:

`Maximum file size is 2 MB.`

Details:

- field: `file`
- issue: `file_too_large`
- max size: `2097152` bytes

### Missing Uploaded File

Request:

`GET /api/upload/does-not-exist.png`

Result:

`NOT_FOUND`

Message:

`File not found.`

### Successful Upload

Request:

`POST /api/upload`

Result:

`success: true`

The response contains the uploaded file inside:

`data.file`

### Successful File Retrieval

Request:

`GET /api/upload/{uploaded-filename}`

Result:

`HTTP 200`

The uploaded PNG file was successfully retrieved.

## Result

API errors now use one consistent response contract containing:

- `success`
- error `code`
- `message`
- optional `details`

The frontend can therefore handle API errors consistently across the updated Route Handlers.
