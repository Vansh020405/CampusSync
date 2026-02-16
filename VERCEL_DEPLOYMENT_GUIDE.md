# Vercel Deployment Guide - Fix Authentication Error

## 🔴 Problem
Getting "Internal server error" and authentication errors on Vercel because required environment variables are missing.

## ✅ Solution: Add Environment Variables to Vercel

### Step 1: Generate NEXTAUTH_SECRET

Run this command in your terminal to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use this online generator: https://generate-secret.vercel.app/32

**Copy the generated secret** - you'll need it in Step 3.

### Step 2: Get Your Supabase Database URL

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) → **Database**
3. Scroll to **Connection String** section
4. Copy the **Connection pooling** URI (recommended for serverless)
   - It should look like: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
5. Replace `[PASSWORD]` with your actual database password

**Important**: Use the **pooler connection string** (port 6543) for Vercel, not the direct connection (port 5432).

### Step 3: Add Environment Variables to Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your **CampusSync** project
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. Add these three variables:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXTAUTH_SECRET` | [Paste the secret from Step 1] | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-app-name.vercel.app` | Production |
| `NEXTAUTH_URL` | `https://your-preview-url.vercel.app` | Preview |
| `DATABASE_URL` | [Paste Supabase connection string from Step 2] | Production, Preview, Development |

**For NEXTAUTH_URL**:
- Production: Use your main Vercel URL (e.g., `https://campus-sync.vercel.app`)
- Preview: You can use the same as production or leave it for preview deployments
- Development: Use `http://localhost:3000`

### Step 4: Redeploy Your Application

After adding the environment variables:

1. Go to **Deployments** tab in Vercel
2. Click on the **three dots (...)** next to your latest deployment
3. Click **Redeploy**
4. Select **Use existing Build Cache** (optional, faster)
5. Click **Redeploy**

### Step 5: Verify the Deployment

1. Wait for the deployment to complete
2. Visit your Vercel URL
3. Try to sign up with a new student account
4. Check if the authentication works

## 🔍 Debugging Tips

If you still get errors:

### Check Vercel Logs
1. Go to your deployment in Vercel
2. Click on **View Function Logs**
3. Look for any Prisma or authentication errors

### Common Issues:

**Issue 1: Prisma Client Not Generated**
- **Solution**: Vercel should automatically run `prisma generate` via the `postinstall` script in package.json
- Verify `package.json` has: `"postinstall": "prisma generate"`

**Issue 2: Database Connection Timeout**
- **Solution**: Make sure you're using the Supabase **pooler connection string** (port 6543)
- Check if your Supabase project is active

**Issue 3: NEXTAUTH_SECRET Error**
- **Error**: `NO_SECRET` error
- **Solution**: Ensure `NEXTAUTH_SECRET` is set in Vercel environment variables

**Issue 4: Database Tables Not Found**
- **Solution**: Run migrations on Supabase:
  ```bash
  npx prisma migrate deploy
  ```
  Or push the schema:
  ```bash
  npx prisma db push
  ```

## 📝 Example .env File (For Local Development)

Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# NextAuth
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Note**: Never commit `.env.local` to Git. It's already in `.gitignore`.

## ✅ Checklist

- [ ] Generated NEXTAUTH_SECRET
- [ ] Got Supabase DATABASE_URL (pooler connection)
- [ ] Added all 3 environment variables to Vercel
- [ ] Redeployed the application
- [ ] Tested signup on Vercel URL
- [ ] Verified authentication works

## 🎯 Quick Fix Summary

The authentication error happens because:
1. **NextAuth requires a secret** → Add `NEXTAUTH_SECRET`
2. **Prisma needs database connection** → Add `DATABASE_URL`
3. **NextAuth needs to know its URL** → Add `NEXTAUTH_URL`

Once these are set in Vercel, redeploy and it should work! 🚀
