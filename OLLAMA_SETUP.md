# Ollama Local AI Setup Guide

## ✅ Updated to Ollama (Local AI)

Your chatbot now uses **Ollama** running locally on your Mac - completely free, private, and no API costs!

---

## 🚀 Quick Setup

### 1. Install Ollama (if not already installed)

```bash
# Download and install from:
# https://ollama.com/download

# Or install via Homebrew:
brew install ollama
```

### 2. Start Ollama Server

```bash
# Start Ollama service
ollama serve
```

**Note**: Keep this terminal window open. Ollama will run on `http://localhost:11434`

### 3. Pull a Model

In a new terminal window:

```bash
# Recommended: Llama 3.2 (3B - Fast, good quality)
ollama pull llama3.2

# Or choose from these popular models:
ollama pull llama3.1      # Llama 3.1 8B (Better quality, slower)
ollama pull llama2        # Llama 2 7B (Older but reliable)
ollama pull mistral       # Mistral 7B (Good balance)
ollama pull phi3          # Phi-3 (Small and fast)
ollama pull gemma2        # Google Gemma 2 9B
```

### 4. Test Ollama

```bash
# Test the model in terminal
ollama run llama3.2

# Type a message and press Enter
# Type /bye to exit
```

### 5. Use with OpsMind Chatbot

✅ **That's it!** Your chatbot is already configured to use Ollama.

Just open the chatbot page and start chatting!

---

## ⚙️ Configuration

### Current Settings:
```javascript
// File: services/geminiService.js
const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'llama3.2';  // Change this to your model
```

### Change Model:
Edit `services/geminiService.js` line 10:

```javascript
const MODEL_NAME = 'llama3.2';    // Current
const MODEL_NAME = 'llama3.1';    // Better quality
const MODEL_NAME = 'mistral';     // Alternative
const MODEL_NAME = 'phi3';        // Faster, smaller
```

### Change Port (if needed):
If Ollama runs on a different port:

```javascript
const OLLAMA_API_URL = 'http://localhost:YOUR_PORT/api/chat';
```

---

## 🎯 Available Models

### Recommended for Chatbots:

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| **llama3.2** | 3B | ⚡⚡⚡ | ⭐⭐⭐ | **Best balance** |
| **llama3.1** | 8B | ⚡⚡ | ⭐⭐⭐⭐ | Better responses |
| **mistral** | 7B | ⚡⚡ | ⭐⭐⭐⭐ | Technical support |
| **phi3** | 3.8B | ⚡⚡⚡ | ⭐⭐⭐ | Fast, efficient |
| **gemma2** | 9B | ⚡⚡ | ⭐⭐⭐⭐ | Google model |

### Download a Model:
```bash
ollama pull <model-name>
```

### List Installed Models:
```bash
ollama list
```

### Remove a Model:
```bash
ollama rm <model-name>
```

---

## 💻 System Requirements

### Minimum:
- **RAM**: 8GB (for 3B models like llama3.2, phi3)
- **Storage**: 2-4GB per model
- **CPU**: Apple Silicon (M1/M2/M3) or Intel with AVX2

### Recommended:
- **RAM**: 16GB+ (for 7B-8B models)
- **Storage**: 10GB+ (for multiple models)
- **GPU**: Apple Silicon for best performance

### Model Sizes:
- **Small (3-4B)**: llama3.2, phi3 → 2-3GB RAM
- **Medium (7-8B)**: llama3.1, mistral → 5-8GB RAM
- **Large (13B+)**: llama2:13b → 10-16GB RAM

---

## 🎛️ Advanced Configuration

### Adjust Response Settings:

Edit `services/geminiService.js`:

```javascript
options: {
    temperature: 0.7,      // 0.0-1.0 (lower = focused, higher = creative)
    top_p: 0.9,           // Nucleus sampling
    num_predict: 1024,     // Max response length
    repeat_penalty: 1.1,   // Reduce repetition (1.0-2.0)
    top_k: 40,            // Vocabulary sampling
    num_ctx: 2048,        // Context window size
}
```

### Performance Tuning:

#### Faster Responses:
```javascript
options: {
    temperature: 0.5,
    num_predict: 512,  // Shorter responses
    top_k: 20,
}
```

#### Better Quality:
```javascript
options: {
    temperature: 0.8,
    num_predict: 2048,  // Longer responses
    repeat_penalty: 1.2,
}
```

---

## 🧪 Testing

### Check Ollama is Running:
```bash
curl http://localhost:11434/api/tags
```

Should return list of installed models.

### Test in Browser Console:
```javascript
fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        model: 'llama3.2',
        messages: [{ role: 'user', content: 'Hello!' }],
        stream: false
    })
}).then(r => r.json()).then(console.log);
```

### Test Your Chatbot:

**Quick Responses** (Instant - no Ollama call):
- "Hello"
- "How do I create a ticket?"

**Ollama AI** (1-5 seconds depending on model):
- "How do I troubleshoot a slow computer?"
- "What are best practices for IT security?"

**Check Console:**
```
[Ollama] Sending request to local Ollama server...
[Ollama] Model: llama3.2
[Ollama] Response received
```

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to Ollama"

**Solution:**
```bash
# Make sure Ollama is running
ollama serve

# Check if it's running
curl http://localhost:11434/api/tags

# Check process
ps aux | grep ollama
```

### Issue: "Model not found"

**Solution:**
```bash
# List installed models
ollama list

# Pull the model specified in geminiService.js
ollama pull llama3.2
```

### Issue: Slow Responses

**Solutions:**
1. Use a smaller model: `phi3` or `llama3.2`
2. Reduce `num_predict` (max tokens)
3. Close other applications to free RAM
4. Ensure Ollama is using GPU acceleration (automatic on M-series Macs)

### Issue: High Memory Usage

**Solutions:**
1. Use smaller models (3B instead of 7B+)
2. Unload model when not in use:
   ```bash
   # Stop Ollama
   killall ollama
   ```
3. Limit context window:
   ```javascript
   num_ctx: 1024  // Instead of 2048
   ```

### Issue: CORS Errors

Ollama allows CORS by default from `localhost` and `127.0.0.1`.

If issues persist:
```bash
# Set OLLAMA_ORIGINS environment variable
export OLLAMA_ORIGINS="*"
ollama serve
```

---

## 🎯 Benefits of Ollama

### vs Cloud APIs:
✅ **100% Free** - No API costs  
✅ **Private** - All data stays on your machine  
✅ **Fast** - No network latency  
✅ **Offline** - Works without internet  
✅ **No Limits** - Unlimited requests  
✅ **Customizable** - Full control over model behavior  

### vs OpenRouter/Gemini:
✅ **No API key needed**  
✅ **No rate limiting**  
✅ **No quota concerns**  
✅ **Better privacy**  

### Hybrid System Still Active:
- ⚡ Quick responses = Instant (no AI call)
- 🤖 Complex queries = Local Ollama AI
- 📊 Live data = Your backend

---

## 📊 Performance Comparison

### Response Times (on M1 Mac):

| Model | First Response | Subsequent | Quality |
|-------|---------------|------------|---------|
| llama3.2 (3B) | 2-3s | 1-2s | ⭐⭐⭐ |
| llama3.1 (8B) | 4-6s | 2-4s | ⭐⭐⭐⭐ |
| mistral (7B) | 3-5s | 2-3s | ⭐⭐⭐⭐ |
| phi3 (3.8B) | 2-3s | 1-2s | ⭐⭐⭐ |

**Note**: First response is slower (model loading). Subsequent responses are faster.

---

## 🔄 Running Ollama Automatically

### macOS (Homebrew Service):
```bash
# Start Ollama as a service
brew services start ollama

# Check status
brew services list

# Stop service
brew services stop ollama
```

### Launch at Startup:
Ollama runs as a background service by default after installation.

Check System Settings → General → Login Items

---

## 💡 Tips & Best Practices

### 1. Choose the Right Model:
- **Support chatbot**: llama3.2 or phi3 (fast, good enough)
- **Complex queries**: llama3.1 or mistral (better understanding)
- **Code help**: codellama (specialized for code)

### 2. Pre-load Model:
```bash
# Pre-load model to reduce first response time
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "Hi"
}'
```

### 3. Monitor Resources:
```bash
# Check Ollama memory usage
ps aux | grep ollama

# Check GPU usage (M-series Macs)
sudo powermetrics --samplers gpu_power -i 1000 -n 1
```

### 4. Multiple Models:
Install multiple models and switch based on use case:
- `llama3.2` for quick questions
- `llama3.1` for complex support
- `codellama` for technical/code questions

---

## 🚀 Next Steps

### 1. Test Different Models:
```bash
# Try phi3 (smaller, faster)
ollama pull phi3

# Update geminiService.js:
const MODEL_NAME = 'phi3';
```

### 2. Customize System Prompt:
Edit `_buildContext()` in `geminiService.js` to add more OpsMind-specific knowledge.

### 3. Add Model Selector:
Add UI to let users choose model:
```javascript
const MODEL_NAME = localStorage.getItem('ai_model') || 'llama3.2';
```

### 4. Monitor Performance:
Add response time tracking:
```javascript
const start = Date.now();
const response = await GeminiService.generateResponse(message);
console.log(`Response time: ${Date.now() - start}ms`);
```

---

## 📚 Resources

- **Ollama Website**: https://ollama.com
- **Model Library**: https://ollama.com/library
- **GitHub**: https://github.com/ollama/ollama
- **Documentation**: https://github.com/ollama/ollama/tree/main/docs

---

## ✨ Summary

### What Changed:
✅ API URL → `http://localhost:11434/api/chat`  
✅ No API key needed  
✅ Model → `llama3.2` (configurable)  
✅ Local processing → 100% private  

### What to Do:
1. ✅ Install Ollama: `brew install ollama`
2. ✅ Start server: `ollama serve`
3. ✅ Pull model: `ollama pull llama3.2`
4. ✅ Test chatbot: Open browser and chat!

### Benefits:
🎉 **Free forever**  
🎉 **Private and secure**  
🎉 **Fast local responses**  
🎉 **No rate limits**  
🎉 **Works offline**  

**Your AI chatbot is now completely local and free! 🚀**
