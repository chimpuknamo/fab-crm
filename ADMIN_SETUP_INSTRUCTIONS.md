# 🎯 Quick Admin User Setup

Since we need to update the API keys for the new project, here's the fastest way to create your admin user:

## 📋 Step-by-Step Instructions

### 1. **Update Environment Variables**
First, get your correct API keys:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/uwtglbvmueyfwqsldykg/settings/api)
2. Copy the `anon` key and `service_role` key
3. Update your `.env.local` file:

```env
SUPABASE_URL=https://uwtglbvmueyfwqsldykg.supabase.co
SUPABASE_ANON_KEY=your_correct_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_correct_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=https://uwtglbvmueyfwqsldykg.supabase.co  
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_correct_anon_key_here
```

### 2. **Create Admin User** (Choose Option A or B)

#### **Option A: Use the Script (After updating API keys)**
```bash
node scripts/create-admin-user.js
```

#### **Option B: Manual Creation (If API keys are not ready)**

1. **Create User in Auth:**
   - Go to [Authentication > Users](https://supabase.com/dashboard/project/uwtglbvmueyfwqsldykg/auth/users)
   - Click "Add user"
   - Enter email: `admin@yourcompany.com`
   - Enter password: `your-secure-password`
   - Set "Email confirmed" to `true`
   - Add User Metadata: `{"role": "admin"}`

2. **Create User Profile:**
   - Go to [SQL Editor](https://supabase.com/dashboard/project/uwtglbvmueyfwqsldykg/sql)
   - Run this query (replace `USER_ID_HERE` with the actual user ID):

   ```sql
   INSERT INTO user_profiles (user_id, full_name, role, is_active)
   VALUES (
     'USER_ID_HERE',  -- Replace with actual user ID from auth.users
     'Admin User',    -- Your name
     'admin',         -- Admin role
     true
   );
   ```

### 3. **Test the Setup**

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Test login:**
   - Go to `http://localhost:3000/auth`
   - Sign in with your admin credentials
   - You should be redirected to `/admin`

3. **Test document upload:**
   - In the admin dashboard, go to Documents tab
   - Try uploading a test file
   - Verify it appears in the Recent Documents list

## ✅ Verification Checklist

- [ ] Database tables created (run migrations completed successfully)
- [ ] Storage bucket `documents` exists  
- [ ] Admin user can sign in at `/auth`
- [ ] Admin user is redirected to `/admin` dashboard
- [ ] Admin can upload documents
- [ ] RLS policies are working (regular users can't access `/admin`)

## 🚨 Common Issues

**"Invalid API key" Error:**
- Make sure you're using the correct keys for project `uwtglbvmueyfwqsldykg`
- Double-check the project reference in the Supabase dashboard URL

**"Cannot access /admin" Error:**  
- Verify the user has `"role": "admin"` in their user metadata
- Check that user_profiles table has role set to `'admin'`
- Make sure RLS policies are applied correctly

**Document upload fails:**
- Ensure the `documents` storage bucket exists
- Verify admin user has proper permissions
- Check browser console for specific error messages

## 🎉 Success!

Once everything is working:
- Your database schema is fully deployed with RLS security
- Admin user can manage documents, users, and system settings  
- Document upload pipeline processes files and creates embeddings
- System is ready for production use!

---

**Next Steps:** Check out `SETUP_GUIDE.md` for complete system documentation and advanced features.