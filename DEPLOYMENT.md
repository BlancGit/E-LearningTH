# EduNexus Deployment Guide for Vercel

## Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database**: Set up a PostgreSQL database (recommended: [Supabase](https://supabase.com) or [Railway](https://railway.app))

## Step 1: Database Setup

### Option A: Using Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to Settings → Database
3. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`)
4. Save this for the environment variables

### Option B: Using Railway
1. Go to [railway.app](https://railway.app) and create a new project
2. Add a PostgreSQL database
3. Copy the connection string from the database service
4. Save this for the environment variables

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com/dashboard) and click "New Project"
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install && npx prisma generate`

### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel --prod
```

## Step 3: Environment Variables

In your Vercel project dashboard, go to Settings → Environment Variables and add:

### Required Variables:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
- `NODE_ENV`: `production`

### Example Values:
```env
DATABASE_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-here-64-characters-long
NODE_ENV=production
```

## Step 4: Database Migration

After deployment, you need to set up your database schema:

1. Go to your Vercel project dashboard
2. Click on "Functions" tab
3. Your API function should be running
4. The database schema will be automatically pushed during build

**OR** run locally and push to production:
```bash
# Set your production DATABASE_URL in .env
DATABASE_URL="your-production-database-url"

# Push schema to production database
npx prisma db push
```

## Step 5: Testing the Deployment

1. Visit your Vercel app URL
2. Test the following features:
   - User registration and login
   - Teacher dashboard
   - Course creation
   - Student course enrollment
   - Test taking functionality

## Project Structure for Vercel

```
EduNexus/
├── api/
│   └── index.ts              # Vercel serverless function
├── client/
│   └── src/                  # React frontend
├── server/
│   ├── index.ts              # Express server
│   ├── routes.ts             # API routes
│   ├── db.ts                 # Database connection
│   └── storage.ts            # Database operations
├── prisma/
│   └── schema.prisma         # Database schema
├── shared/
│   └── schema.ts             # Shared types
├── vercel.json               # Vercel configuration
└── package.json              # Dependencies and scripts
```

## Common Issues & Solutions

### Issue 1: Database Connection Errors
**Solution**: Ensure your DATABASE_URL is correctly formatted and the database is accessible from Vercel's servers.

### Issue 2: Build Failures
**Solution**: Check that all dependencies are in `dependencies` (not `devDependencies`) if they're needed at runtime.

### Issue 3: API Routes Not Working
**Solution**: Verify that your API routes are correctly proxied through the `/api/*` path.

### Issue 4: Environment Variables Not Loading
**Solution**: Make sure environment variables are set in Vercel dashboard and redeploy.

## Database Schema

Your database will automatically include these tables:
- `users` - User accounts (students/teachers)
- `courses` - Course information
- `tests` - Pre/post tests
- `questions` - Test questions
- `options` - Multiple choice options
- `test_scores` - Student test results
- `course_progress` - Student progress tracking

## Features Included

✅ **Authentication System**
- User registration/login
- JWT token-based auth
- Role-based access (Student/Teacher)

✅ **Teacher Features**
- Course creation and management
- Test builder (Google Forms-like)
- Student progress tracking
- Analytics and CSV export

✅ **Student Features**
- Course enrollment
- Pre/post test taking
- Progress tracking
- Score viewing

✅ **Security Features**
- Anti-cheating measures
- Copy-paste prevention
- Session management

## Support

If you encounter any issues:
1. Check the Vercel function logs
2. Verify environment variables are set correctly
3. Ensure database is accessible
4. Check the console for any client-side errors

## Next Steps

After successful deployment:
1. Test all functionality thoroughly
2. Set up monitoring and error tracking
3. Configure custom domain (optional)
4. Set up automated backups for your database
5. Consider adding SSL certificates for enhanced security

---

**Your EduNexus e-learning platform is now live! 🚀**