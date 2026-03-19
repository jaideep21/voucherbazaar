# VoucherBazaar

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- User authentication (signup/login) for sellers and buyers
- Voucher upload flow: seller uploads an image, app extracts voucher code + details via OCR (HTTP outcall to a free OCR API)
- Voucher listing with categories: GPay, PhonePe, Cred, Flipkart, Travel, Hotel, Food, Entertainment, Shopping, and Others
- Main dashboard showing all listed vouchers browsable by any visitor, filterable by category
- Voucher card with: image, title, category, face value, selling price, code (revealed on purchase/click), seller name
- "Buy" button on each voucher card that marks it as sold (contact seller flow)
- Seller dashboard: manage own uploaded vouchers (view, delete)
- Voucher detail modal/page with full details

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend actor with:
   - User profile management (linked to authorization)
   - Voucher CRUD: create, list all, list by category, list by seller, mark as sold, delete
   - Voucher data model: id, sellerId, title, category, faceValue, sellingPrice, voucherCode, description, imageId (blob-storage), status (available/sold), createdAt
   - Categories enum/list
   - HTTP outcall to OCR API to extract text from uploaded voucher image
2. Frontend:
   - Landing/home page with category filter bar and voucher grid
   - Auth pages (signup, login) via authorization component
   - Upload voucher page: image upload -> OCR extraction -> form pre-fill -> submit
   - Voucher detail modal
   - Seller dashboard page
