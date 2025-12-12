# Firestore Composite Index Setup

The Fleet page requires a composite index to query by `status` and `createdAt` together.

## Quick Fix (Recommended)

**Click this link to create the index automatically:**
https://console.firebase.google.com/v1/r/project/pwycrr-4acc4/firestore/indexes?create_composite=Cllwcm9qZWN0cy9wd3ljcnItNGFjYzQvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3JlZ2F0dGFSZWdpc3RyYXRpb25zL2luZGV4ZXMvXxABGgoKBnN0YXR1cxABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI

This will:
1. Open Firebase Console
2. Pre-configure the index
3. Click "Create Index"
4. Wait 2-5 minutes for the index to build

## Manual Setup

If the link doesn't work:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pwycrr-4acc4**
3. Go to **Firestore Database** > **Indexes** tab
4. Click **Create Index**
5. Configure:
   - **Collection ID**: `regattaRegistrations`
   - **Fields to index**:
     - Field: `status`, Order: Ascending
     - Field: `createdAt`, Order: Descending
6. Click **Create**
7. Wait 2-5 minutes for the index to build

## What This Does

The index allows Firestore to efficiently query:
- All registrations where `status == 'approved'`
- Sorted by `createdAt` in descending order (newest first)

## Current Behavior

The Fleet page will work without the index using a fallback query, but:
- It will log warnings in the console
- Performance may be slightly slower
- The index is recommended for production

## After Creating the Index

Once the index is built (status shows "Enabled"):
- Refresh the Fleet page
- The console warnings will stop
- Queries will be faster

