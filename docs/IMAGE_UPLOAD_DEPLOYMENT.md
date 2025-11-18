# Image Upload Deployment Guide

## The Problem
Profile images uploaded to `/public/uploads/profiles/` during runtime aren't accessible in production builds because Next.js serves the `/public` folder statically at build time.

## The Solution
We've implemented an API route that serves uploaded images dynamically, ensuring they work in both development and production environments.

## What Changed

### 1. **New API Route for Serving Images**
- **File**: `/app/api/uploads/profiles/[filename]/route.ts`
- **Purpose**: Serves uploaded profile images dynamically
- **URL Pattern**: `/api/uploads/profiles/{filename}`
- **Features**:
  - Directory traversal protection
  - Proper content-type headers
  - Caching headers for performance
  - 404 handling for missing files

### 2. **Updated Image Upload API**
- **File**: `/app/api/profile/image/route.ts`
- **Change**: Image URLs now use `/api/uploads/profiles/` instead of `/uploads/profiles/`
- **Result**: Images are served through API route in production

### 3. **Database Migration**
- **Script**: `/scripts/migrate-image-urls.ts`
- **Purpose**: Updates existing image URLs in database to use new API route format
- **Status**: ✅ Already run (1 user updated)

## Deployment Steps

### For VM/Production Server:

1. **Ensure the uploads directory exists**:
   ```bash
   mkdir -p public/uploads/profiles
   chmod 755 public/uploads/profiles
   ```

2. **Copy existing uploaded files** (if migrating):
   ```bash
   # From old server to new server
   scp -r old-server:/path/to/public/uploads/profiles/* public/uploads/profiles/
   ```

3. **Build the project**:
   ```bash
   npm run build
   # or
   pnpm build
   ```

4. **Start the production server**:
   ```bash
   npm start
   # or
   pnpm start
   ```

### For Docker Deployment:

Add volume mount for persistent uploads:

```dockerfile
# In your Dockerfile
VOLUME ["/app/public/uploads"]

# Or in docker-compose.yml
volumes:
  - ./uploads:/app/public/uploads
```

### For Vercel/Netlify:

⚠️ **Important**: These platforms have **read-only file systems** in production.

**Options:**
1. **Use Cloud Storage** (Recommended):
   - AWS S3
   - Cloudflare R2
   - Vercel Blob Storage
   - Uploadthing

2. **Use a CDN service**:
   - Cloudinary
   - ImageKit
   - Uploadcare

## File Structure

```
/public/uploads/profiles/
├── {userId}-{timestamp}.jpg
├── {userId}-{timestamp}.png
└── ...
```

## Testing

1. **Development**:
   ```bash
   npm run dev
   ```
   - Upload a profile image
   - Verify it shows correctly in sidebar/header
   - Check browser console for 404 errors

2. **Production**:
   ```bash
   npm run build && npm start
   ```
   - Upload a new profile image
   - Verify it shows correctly
   - Check image URL: should be `/api/uploads/profiles/{filename}`
   - Open image in new tab: should load correctly

## Troubleshooting

### Images show 404 in production:

1. **Check uploads directory exists**:
   ```bash
   ls -la public/uploads/profiles/
   ```

2. **Check file permissions**:
   ```bash
   chmod -R 755 public/uploads/
   ```

3. **Check database URLs**:
   ```bash
   # Run migration again if needed
   npx tsx scripts/migrate-image-urls.ts
   ```

4. **Check API route works**:
   ```bash
   curl http://localhost:3000/api/uploads/profiles/{filename}
   ```

### Images work locally but not on VM:

1. **Copy uploads folder to VM**:
   ```bash
   rsync -avz public/uploads/ user@vm:/path/to/app/public/uploads/
   ```

2. **Ensure .env has correct settings**
3. **Rebuild on VM**: `pnpm build`

## Security Notes

- ✅ Directory traversal protection implemented
- ✅ File type validation (JPEG, PNG, GIF, WebP only)
- ✅ File size limit (5MB max)
- ✅ Filename sanitization
- ⚠️ Consider adding rate limiting for upload endpoint
- ⚠️ Consider adding virus scanning for user uploads

## Performance

- **Caching**: Images served with `Cache-Control: public, max-age=31536000, immutable`
- **CDN**: Consider using a CDN in front of your API route for better performance
- **Optimization**: Consider using Next.js Image component with `fill` prop

## Future Improvements

1. **Cloud Storage Migration**: Move to S3/R2 for scalability
2. **Image Optimization**: Automatically resize/compress uploads
3. **CDN Integration**: Serve images through CDN
4. **Cleanup Script**: Remove unused images periodically
5. **Backup**: Automated backup of uploads folder
