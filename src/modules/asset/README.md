# Assets Module Documentation

## Overview
The Assets Module manages company assets with three different entry modes:
1. **WITH_SERIAL_NUMBER** - Assets with only serial numbers (مع الرقم التسلسلي فقط)
2. **WITH_CATEGORIES** - Assets with only categories (مع أصناف فقط)
3. **WITH_SERIAL_NUMBER_AND_CATEGORIES** - Assets with both serial numbers and categories (مع الرقم التسلسلي و الأصناف)

## Installation & Setup

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Run Database Migration
```bash
npx prisma migrate dev --name add_asset_models
```

## API Endpoints

All endpoints require JWT authentication via the `JwtAuthGuard`.

### Get All Assets (Paginated)
**GET** `/assets?page=1&limit=10`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Asset Name",
      "serialNumber": "SN123" | null,
      "type": "WITH_SERIAL_NUMBER" | "WITH_CATEGORIES" | "WITH_SERIAL_NUMBER_AND_CATEGORIES",
      "categories": [...],
      "createdAt": "2025-11-04T...",
      "updatedAt": "2025-11-04T..."
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### Get Single Asset
**GET** `/assets/:id`

**Response:**
```json
{
  "id": "uuid",
  "name": "Asset Name",
  "serialNumber": "SN123" | null,
  "type": "WITH_SERIAL_NUMBER",
  "categories": [...],
  "createdAt": "2025-11-04T...",
  "updatedAt": "2025-11-04T..."
}
```

### Create Asset

**POST** `/assets`

#### Option 1: WITH_SERIAL_NUMBER
```json
{
  "name": "Laptop Dell XPS 15",
  "type": "WITH_SERIAL_NUMBER",
  "serialNumber": "SN123456789"
}
```

#### Option 2: WITH_CATEGORIES
```json
{
  "name": "Office Furniture Set",
  "type": "WITH_CATEGORIES",
  "categories": [
    { "name": "Desk" },
    { "name": "Chair" },
    { "name": "Cabinet" }
  ]
}
```

#### Option 3: WITH_SERIAL_NUMBER_AND_CATEGORIES
```json
{
  "name": "Computer System HP",
  "type": "WITH_SERIAL_NUMBER_AND_CATEGORIES",
  "serialNumber": "HP-2024-XYZ789",
  "categories": [
    { "name": "Monitor 24 inch" },
    { "name": "Keyboard Mechanical" },
    { "name": "Mouse Wireless" }
  ]
}
```

### Update Asset
**PUT** `/assets/:id`

**Request Body:**
```json
{
  "name": "Updated Asset Name",
  "serialNumber": "NEW-SN-123",
  "categories": [
    { "name": "New Category 1" },
    { "name": "New Category 2" }
  ]
}
```

**Note:** All fields are optional. Categories will be completely replaced if provided.

### Delete Asset
**DELETE** `/assets/:id`

**Response:**
```json
{
  "message": "Asset deleted successfully"
}
```

## Validation Rules

### Create Asset Validation
1. **name** - Required, max 200 characters
2. **type** - Required, must be one of the AssetType enum values
3. **serialNumber** - Required if type is WITH_SERIAL_NUMBER or WITH_SERIAL_NUMBER_AND_CATEGORIES, max 100 characters, must be unique
4. **categories** - Required if type is WITH_CATEGORIES or WITH_SERIAL_NUMBER_AND_CATEGORIES, must have at least 1 category

### Update Asset Validation
1. **name** - Optional, max 200 characters
2. **serialNumber** - Optional, max 100 characters, must be unique
3. **categories** - Optional, minimum 1 category if provided

## Architecture

### Clean Code Principles Applied
1. **Separation of Concerns**
   - Repository layer handles database operations
   - Service layer contains business logic
   - Controller layer manages HTTP requests/responses
   - DTOs handle data validation

2. **Single Responsibility**
   - Each method has a single, well-defined purpose
   - Small, focused functions
   - Private helper methods for reusable logic

3. **Repository Pattern**
   - All database queries isolated in AssetRepository
   - Service layer uses repository methods
   - Easy to test and maintain

### Project Structure
```
src/modules/asset/
├── dto/
│   ├── asset-category.dto.ts      # Category validation
│   ├── create-asset.dto.ts        # Create asset validation
│   ├── update-asset.dto.ts        # Update asset validation
│   ├── asset-response.dto.ts      # Response type definitions
│   └── index.ts                   # Barrel export
├── repositories/
│   └── asset.repository.ts        # Database operations
├── asset.controller.ts            # HTTP endpoints
├── asset.service.ts               # Business logic
├── asset.module.ts                # Module configuration
└── README.md                      # This file
```

## i18n Support

The module supports both English and Arabic translations.

### Available Translation Keys
- `asset.notFound`
- `asset.serialNumberExists`
- `asset.createSuccess`
- `asset.updateSuccess`
- `asset.deleteSuccess`
- `asset.fetchFailed`
- `asset.createFailed`
- `asset.updateFailed`
- `asset.deleteFailed`

### Usage
Set the `Accept-Language` header to `en` or `ar` in your requests.

## Database Schema

### AssetType Enum
```prisma
enum AssetType {
  WITH_SERIAL_NUMBER
  WITH_CATEGORIES
  WITH_SERIAL_NUMBER_AND_CATEGORIES
}
```

### Asset Model
```prisma
model Asset {
  id           String     @id @default(uuid())
  name         String
  serialNumber String?
  type         AssetType
  categories   AssetCategory[]
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  @@index([serialNumber])
}
```

### AssetCategory Model
```prisma
model AssetCategory {
  id        String   @id @default(uuid())
  name      String
  assetId   String
  asset     Asset    @relation(fields: [assetId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([assetId])
}
```

## Testing Examples

### Using cURL

#### Create Asset with Serial Number
```bash
curl -X POST http://localhost:3000/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept-Language: en" \
  -d '{
    "name": "Laptop Dell XPS 15",
    "type": "WITH_SERIAL_NUMBER",
    "serialNumber": "SN123456789"
  }'
```

#### Create Asset with Categories
```bash
curl -X POST http://localhost:3000/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Accept-Language: ar" \
  -d '{
    "name": "Office Furniture Set",
    "type": "WITH_CATEGORIES",
    "categories": [
      {"name": "Desk"},
      {"name": "Chair"}
    ]
  }'
```

#### Get All Assets
```bash
curl -X GET "http://localhost:3000/assets?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Update Asset
```bash
curl -X PUT http://localhost:3000/assets/ASSET_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Asset Name"
  }'
```

#### Delete Asset
```bash
curl -X DELETE http://localhost:3000/assets/ASSET_UUID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

The module uses custom exception handling:

1. **TranslatedException** - For localized error messages
2. **BadRequestException** - For validation errors
3. **ConflictException** - For duplicate serial numbers
4. **NotFoundException** - For missing assets

## Future Enhancements

Potential improvements:
- Add search/filter functionality
- Add asset assignment to users
- Add asset maintenance tracking
- Add asset depreciation calculation
- Add file attachments for asset photos/documents
- Add asset location tracking

