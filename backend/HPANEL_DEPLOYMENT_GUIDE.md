# FoodyBhai Backend - Hostinger hPanel Deployment Guide

This zip package contains the production build of the FoodyBhai NestJS backend, ready for 1-click deployment on Hostinger hPanel (Shared / Cloud / VPS / Business Hosting).

---

## 1. Upload & Extract in hPanel File Manager

1. Log in to **Hostinger hPanel** (`hpanel.hostinger.com`).
2. Go to **Websites** -> Select your domain/subdomain (e.g., `api.foodybhai.in`).
3. Open **File Manager** (`Files -> File Manager`).
4. Navigate to your application directory (e.g., `public_html` or `domains/api.foodybhai.in/public_html`).
5. Upload `backend-hpanel.zip` (or `backend-build.zip`).
6. Right-click the zip file and click **Extract**. Extract directly into the current folder.

---

## 2. Configure Node.js Application in hPanel

1. In hPanel, go to **Advanced** -> **Node.js** (or search for **Node.js** in the search bar).
2. Click **Create Application** (or select your existing application).
3. Fill in the following details:
   - **Node.js version**: `20.x` or `18.x` (Recommended: Node 20 LTS)
   - **Application mode**: `Production`
   - **Application root**: Path to where you extracted the files (e.g., `domains/api.foodybhai.in/public_html`)
   - **Application startup file**: `index.js` (or `app.js` or `dist/main.js`)
   - **Application URL**: Select your domain/subdomain (e.g., `api.foodybhai.in`)
4. Click **Create** / **Save**.

---

## 3. Install NPM Dependencies

1. In the Node.js application dashboard in hPanel, locate the **NPM** section.
2. Click the **Install NPM Packages** (or **Run npm install**) button.
3. *Alternatively*, if you have SSH access enabled:
   ```bash
   cd /path/to/backend
   npm install --omit=dev
   ```

---

## 4. Environment Variables (.env)

Make sure your `.env` file exists in the application root (included in this zip), or configure environment variables in hPanel under **Environment variables**:

```env
MONGODB_URI=mongodb+srv://tusharmanusharma:8218870579@cluster0.mjlna.mongodb.net/foodyBhaiOrganization?appName=Cluster0
JWT_SECRET=change-this-to-a-strong-random-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
PORT=3000
FRONTEND_URL=https://foodybhai.in,https://admin.foodybhai.in,http://localhost:4200
```

> **Note**: Hostinger may automatically assign a dynamic port via `process.env.PORT`. The backend is already configured to automatically bind to `process.env.PORT`!

---

## 5. Start / Restart Application

1. Click **Restart Application** in the hPanel Node.js dashboard.
2. Test your backend by visiting:
   ```
   https://api.foodybhai.in/api/recipes
   ```
   or
   ```
   https://api.foodybhai.in/api/settings
   ```
3. You should see the live JSON response immediately!
