# 🚀 Deployment Guide - Elder Care AI

## Quick Deployment Steps

### **Option 1: Deploy to Vercel (Recommended - 2 minutes)**

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com
   - Sign up or log in with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Paste: `https://github.com/tmanoj2007/Elder-Care-AI.git`
   - Click "Import"

3. **Configure Project:**
   - Framework: `Vite`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist`
   - Environment: Add if needed (none required currently)
   - Click "Deploy"

4. **Done!** 
   - Get your live URL in 2-3 minutes
   - Example: `https://elder-care-ai.vercel.app`

---

### **Option 2: Deploy to Netlify (5 minutes)**

1. **Go to Netlify:**
   - Visit https://netlify.com
   - Sign up/login with GitHub

2. **Add New Site:**
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub → Select your repo
   - Choose: `tmanoj2007/Elder-Care-AI`

3. **Build Settings:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Click "Deploy site"

4. **Done!**
   - Get your live URL
   - Example: `https://elder-care-ai.netlify.app`

---

### **Option 3: Deploy to Railway.app (Docker)**

1. Visit https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Railway auto-detects settings
5. Deploy instantly

---

## Local Testing Before Deploy

```bash
# Build the app
npm run build

# Preview the production build locally
npm run preview
```

## GitHub Commit & Push

```bash
# Commit deployment config
git add vercel.json
git commit -m "Add Vercel deployment configuration"
git push origin master
```

---

## ✅ What Gets Deployed

- React + TypeScript frontend
- Express backend (Node.js)
- All components (Login, Dashboard, Caregiver, Elderly)
- Database state (localStorage for demo)

## 🔗 Live URL Format

After deployment, you'll get:
- **Vercel:** `https://your-project.vercel.app`
- **Netlify:** `https://your-project.netlify.app`
- **Railway:** Custom URL assigned

---

## Environment Variables (if needed)

Currently using localStorage. To add API keys later:
1. Go to project settings
2. Add environment variables
3. Redeploy

---

**Any issues?** Check build logs in the platform's dashboard.
