# How to Start the OpsMind Frontend

The OpsMind frontend uses **ES6 modules** (`import/export`), which requires the application to be served via HTTP, not opened directly as a file.

---

## ⚠️ Important: Do NOT open `index.html` directly!

Opening `index.html` by double-clicking or using `file://` will cause:
- ❌ ES6 module errors
- ❌ CORS errors
- ❌ JavaScript features not working
- ❌ Sign Up/Sign In flip animation not working

---

## ✅ Start the Frontend Server

### Option 1: Python HTTP Server (Recommended)

```bash
cd /Users/moashraf/Desktop/Moe/Projects/opsmind_frontend
python3 -m http.server 5500
```

Then open: **http://localhost:5500/index.html**

---

### Option 2: Node.js HTTP Server

```bash
cd /Users/moashraf/Desktop/Moe/Projects/opsmind_frontend
npx http-server -p 5500
```

Then open: **http://localhost:5500/index.html**

---

### Option 3: VS Code Live Server Extension

1. Install the **Live Server** extension in VS Code
2. Right-click on `index.html`
3. Select **"Open with Live Server"**

---

## ✅ Verify It's Working

1. Open your browser's **Developer Tools** (F12 or Cmd+Option+I)
2. Go to the **Console** tab
3. You should see:
   ```
   🚀 Initializing login page...
   📋 Elements found: {cardWrapper: true, showSignupBtn: true, showLoginBtn: true}
   ```

4. Click **"Sign Up"** and you should see:
   ```
   🔄 Sign Up clicked - flipping card...
   ```

5. The card should flip to show the signup form!

---

## 🔧 Troubleshooting

### Issue: ES6 Module Error
```
Access to script at 'file:///.../auth.js' from origin 'null' has been blocked by CORS policy
```
**Solution:** Use one of the HTTP server methods above.

### Issue: Nothing happens when clicking Sign Up
**Possible causes:**
1. ❌ File opened directly (use HTTP server)
2. ❌ JavaScript not loading (check Console for errors)
3. ❌ Backend not running (should be at http://localhost:3002)

### Issue: Backend not responding
```bash
# Check if backend is running
curl http://localhost:3002/health
```

If backend is not running, start it according to its README.

---

## 🎯 Quick Start Checklist

- [ ] Backend running at http://localhost:3002
- [ ] Frontend served via HTTP (not file://)
- [ ] Browser at http://localhost:5500/index.html
- [ ] No errors in browser console
- [ ] Sign Up/Sign In flip animation working
- [ ] Ready to test authentication!

---

**Current Status:**
- ✅ Backend: http://localhost:3002 (verify with `/health` endpoint)
- 🔄 Frontend: Start with one of the methods above
