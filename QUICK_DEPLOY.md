# Quick Deploy to Vercel - EduNexus

## 🚀 Quick Steps

### 1. Database Setup (5 minutes)
- Go to [supabase.com](https://supabase.com) → New Project
- Copy the PostgreSQL connection string
- Save it for step 3

### 2. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Deploy to Vercel
- Go to [vercel.com](https://vercel.com) → New Project
- Import your GitHub repo
- Set Environment Variables:
  - `DATABASE_URL` = your Supabase connection string
  - `JWT_SECRET` = any random 64-character string
  - `NODE_ENV` = production
- Deploy!

### 4. Test Your App
Visit your Vercel URL and test:
- User registration/login
- Teacher dashboard
- Course creation
- Student enrollment
- Test taking

## 🎯 That's it! Your EduNexus platform is live!

**Need help?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide.