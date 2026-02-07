# OpsMind Authentication - Testing Guide

This guide will help you test the complete OTP-based authentication integration between the frontend and backend.

---

## Prerequisites

### 1. Backend Running
Ensure the backend API is running at `http://localhost:3002`

```bash
# Test backend health
curl http://localhost:3002/health
```

Expected response:
```json
{
  "success": true,
  "message": "Auth service is running",
  "timestamp": "2026-02-07T..."
}
```

### 2. Frontend Server
The frontend needs to be served via HTTP (not file://) to support ES6 modules.

**Option A: Using Python (recommended)**
```bash
cd /Users/moashraf/Desktop/Moe/Projects/opsmind_frontend
python3 -m http.server 5500
```

**Option B: Using Node.js http-server**
```bash
cd /Users/moashraf/Desktop/Moe/Projects/opsmind_frontend
npx http-server -p 5500
```

**Option C: Using VS Code Live Server**
- Right-click on `index.html`
- Select "Open with Live Server"

Then open: `http://localhost:5500/index.html`

### 3. Email Configuration
Ensure the backend is configured to send emails (check backend `.env` file for SMTP settings).

---

## Test Scenarios

### ✅ Test 1: Signup with Valid Data

**Steps:**
1. Open `http://localhost:5500/index.html`
2. Click "Sign Up" (Create Account)
3. Fill in the form:
   - First Name: `Ahmed`
   - Last Name: `Hassan`
   - Email: `ahmed.hassan@miuegypt.edu.eg`
   - Password: `Test123!@#` (meets all requirements)
   - Confirm Password: `Test123!@#`
   - Role: Select `Student`
4. Click "Sign Up"

**Expected Result:**
- ✅ Form submits successfully
- ✅ OTP modal appears with title "Verify Your Email"
- ✅ Email address is shown in modal
- ✅ Instructions say "Please enter the verification code"
- ✅ Check email for 6-digit VERIFICATION OTP

**Next Steps:**
5. Enter the VERIFICATION OTP (6 digits)
6. Click "Verify Code"

**Expected Result:**
- ✅ Success message: "Email verified successfully! Logging you in..."
- ✅ Modal title changes to "Complete Login"
- ✅ Instructions update: "Please enter the login code"
- ✅ Check email for 6-digit LOGIN OTP

**Next Steps:**
7. Enter the LOGIN OTP (6 digits)
8. Click "Verify Code"

**Expected Result:**
- ✅ Success message with checkmark
- ✅ Redirected to `dashboard.html` after 2 seconds
- ✅ JWT token stored in localStorage (`opsmind_token`)
- ✅ User data stored in localStorage (`opsmind_user`)

---

### ✅ Test 2: Signup with Invalid Email Domain

**Steps:**
1. Click "Sign Up"
2. Fill in the form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@gmail.com` ❌
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
   - Role: `Student`
3. Click "Sign Up"

**Expected Result:**
- ❌ Error message: "Email must be a valid MIU email address (@miuegypt.edu.eg)"
- ❌ Form does not submit

---

### ✅ Test 3: Signup with Weak Password

**Steps:**
1. Click "Sign Up"
2. Fill in the form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@miuegypt.edu.eg`
   - Password: `weak` ❌
   - Confirm Password: `weak`
   - Role: `Student`
3. Click "Sign Up"

**Expected Result:**
- ❌ Error message showing validation failures:
  - "Password must be at least 8 characters"
  - "Password must contain at least one uppercase letter"
  - "Password must contain at least one number"
  - "Password must contain at least one special character"
- ❌ Form does not submit

---

### ✅ Test 4: Signup with Mismatched Passwords

**Steps:**
1. Click "Sign Up"
2. Fill in the form:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@miuegypt.edu.eg`
   - Password: `Test123!@#`
   - Confirm Password: `Different123!@#` ❌
   - Role: `Student`
3. Click "Sign Up"

**Expected Result:**
- ❌ Error message: "Passwords do not match"
- ❌ Form does not submit

---

### ✅ Test 5: Login with Existing User

**Prerequisites:**
- User must be registered and verified (complete Test 1 first)

**Steps:**
1. Refresh the page or navigate to `http://localhost:5500/index.html`
2. Ensure you're on the "Sign In" form
3. Fill in:
   - Email: `ahmed.hassan@miuegypt.edu.eg`
   - Password: `Test123!@#`
4. Click "Sign In"

**Expected Result:**
- ✅ Form submits successfully
- ✅ OTP modal appears with title "Complete Login"
- ✅ Check email for 6-digit LOGIN OTP
- ✅ Enter LOGIN OTP
- ✅ Success message appears
- ✅ Redirected to dashboard after 2 seconds

---

### ✅ Test 6: Login with Incorrect Password

**Steps:**
1. On "Sign In" form:
   - Email: `ahmed.hassan@miuegypt.edu.eg`
   - Password: `WrongPassword123!` ❌
2. Click "Sign In"

**Expected Result:**
- ❌ Error message: "Invalid credentials" (or similar backend error)
- ❌ OTP modal does not appear

---

### ✅ Test 7: OTP Resend Functionality

**Steps:**
1. Trigger any OTP flow (signup or login)
2. When OTP modal appears, click "Resend Code"

**Expected Result:**
- ✅ Success message: "A new code has been sent to your email"
- ✅ Button disabled for 3 seconds (cooldown)
- ✅ New OTP received via email
- ✅ Old OTP no longer works

---

### ✅ Test 8: Invalid OTP Entry

**Steps:**
1. Trigger any OTP flow
2. Enter incorrect OTP: `123456` ❌
3. Click "Verify Code"

**Expected Result:**
- ❌ Error message: "Invalid or expired OTP" (or similar)
- ❌ Not redirected
- ❌ Can try again with correct OTP

---

### ✅ Test 9: OTP Input Validation

**Steps:**
1. Trigger any OTP flow
2. Try entering non-numeric characters: `abc123` ❌

**Expected Result:**
- ✅ Only numbers are accepted
- ✅ Maximum 6 digits
- ✅ Auto-formatted (letters stripped)

---

### ✅ Test 10: Session Persistence

**Steps:**
1. Complete signup or login successfully
2. Open browser DevTools → Application → Local Storage
3. Verify stored data:
   - `opsmind_token`: JWT string
   - `opsmind_user`: User object JSON
4. Refresh the page

**Expected Result:**
- ✅ Automatically redirected to dashboard
- ✅ No login required

---

### ✅ Test 11: Logout Functionality

**Prerequisites:**
- Must be logged in

**Steps:**
1. Navigate to `dashboard.html`
2. Click logout button (if implemented)
   - OR manually test: Open DevTools Console and run:
   ```javascript
   AuthService.logout();
   window.location.href = 'index.html';
   ```

**Expected Result:**
- ✅ localStorage cleared (`opsmind_token`, `opsmind_user`)
- ✅ Redirected to login page
- ✅ Cannot access dashboard without logging in again

---

### ✅ Test 12: Professor/Doctor Role

**Steps:**
1. Click "Sign Up"
2. Fill form with:
   - First Name: `Dr.`
   - Last Name: `Smith`
   - Email: `dr.smith@miuegypt.edu.eg`
   - Password: `Professor123!@#`
   - Confirm Password: `Professor123!@#`
   - Role: Select `Professor` 👨‍🏫
3. Complete signup and OTP verification

**Expected Result:**
- ✅ User created with role `DOCTOR` (backend)
- ✅ localStorage `opsmind_user` shows `"role": "DOCTOR"`
- ✅ Can access doctor-specific features (if implemented)

---

## Testing Checklist

### Frontend Validation:
- [ ] ✅ MIU email domain validation works
- [ ] ✅ Password strength validation shows all errors
- [ ] ✅ Password confirmation matching works
- [ ] ✅ First/Last name split works correctly
- [ ] ✅ Role selection (Student/Professor) works
- [ ] ✅ Form prevents submission on validation errors

### OTP Modal:
- [ ] ✅ Modal appears after signup/login
- [ ] ✅ Modal title changes based on verification purpose
- [ ] ✅ Email address displays correctly
- [ ] ✅ Instructions update dynamically
- [ ] ✅ OTP input accepts only 6 digits
- [ ] ✅ OTP input auto-formats (strips non-numeric)
- [ ] ✅ Success/error alerts display correctly
- [ ] ✅ Resend button has 3-second cooldown
- [ ] ✅ Modal can be closed and reopened

### Authentication Flow:
- [ ] ✅ Signup → VERIFICATION OTP → LOGIN OTP → Dashboard
- [ ] ✅ Login → LOGIN OTP → Dashboard
- [ ] ✅ Invalid credentials show error
- [ ] ✅ Invalid OTP shows error
- [ ] ✅ Expired OTP shows error
- [ ] ✅ Token stored in localStorage
- [ ] ✅ User data stored in localStorage
- [ ] ✅ Pending verification stored in sessionStorage

### Session Management:
- [ ] ✅ Logged-in users redirected to dashboard
- [ ] ✅ Session persists across page refresh
- [ ] ✅ Logout clears all auth data
- [ ] ✅ Unauthenticated users cannot access dashboard

---

## Debugging Tips

### Check Browser Console
Open DevTools (F12) → Console tab
Look for:
- Network errors (CORS, 404, 500)
- JavaScript errors
- API responses

### Check Network Tab
Open DevTools (F12) → Network tab
Monitor:
- `/auth/signup` requests
- `/auth/login` requests
- `/auth/verify-otp` requests
- `/auth/resend-otp` requests

### Check Application Storage
Open DevTools (F12) → Application tab
Verify:
- Local Storage: `opsmind_token`, `opsmind_user`
- Session Storage: `opsmind_pending_verification`

### Test Backend Directly
```bash
# Test signup
curl -X POST http://localhost:3002/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@miuegypt.edu.eg",
    "password": "Test123!@#",
    "role": "STUDENT"
  }'

# Test login
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@miuegypt.edu.eg",
    "password": "Test123!@#"
  }'

# Test OTP verification
curl -X POST http://localhost:3002/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@miuegypt.edu.eg",
    "otp": "123456",
    "purpose": "VERIFICATION"
  }'
```

---

## Common Issues and Solutions

### ❌ Issue: "Failed to fetch" error
**Solution:** 
- Ensure backend is running: `curl http://localhost:3002/health`
- Check CORS settings on backend
- Verify API_BASE_URL in `authService.js`

### ❌ Issue: ES6 module error
**Solution:**
- Serve frontend via HTTP, not file://
- Use Python http.server or Live Server
- Check browser console for specific module errors

### ❌ Issue: OTP not received via email
**Solution:**
- Check backend email configuration
- Check spam folder
- Verify SMTP settings in backend `.env`
- Check backend logs for email send errors

### ❌ Issue: Modal doesn't appear
**Solution:**
- Check browser console for JavaScript errors
- Verify Bootstrap is loaded (check Network tab)
- Ensure modal HTML exists in `index.html`

### ❌ Issue: Token not stored
**Solution:**
- Check browser console for storage errors
- Verify localStorage is enabled (not in private/incognito mode)
- Check backend returns token in response

---

## Success Criteria

All tests should pass with:
- ✅ **100% frontend validation** working
- ✅ **Complete signup flow** with two OTPs
- ✅ **Complete login flow** with one OTP
- ✅ **Token management** working
- ✅ **Session persistence** working
- ✅ **Error handling** graceful and informative
- ✅ **OTP resend** working with cooldown
- ✅ **Role mapping** correct (Student→STUDENT, Professor→DOCTOR)

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Document any bugs found
2. ✅ Add automated tests (Jest, Cypress)
3. ✅ Implement password reset flow
4. ✅ Add rate limiting feedback
5. ✅ Enhance error messages
6. ✅ Add loading animations
7. ✅ Improve accessibility (ARIA labels)
8. ✅ Add comprehensive logging

---

**Happy Testing! 🎉**
