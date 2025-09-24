# Install Dependencies:
- cd to the frontend directory
- <h3><code> npm install </code></h3> 


# To Run
- <h3><code> npm  start </code></h3>

# .env file 
PORT=3000

# Azure Document Intelligence
DOC_ENDPOINT=https://aiaiai.cognitiveservices.azure.com/
DOC_KEY=3aRDAcmXAMYTjA2H7AgDqU340zmkqhbViCXSafcNi5TJLxA5X5OeJQQJ99BIACGhslBXJ3w3AAALACOGxLS2

# Azure OpenAI
# AZURE_OPENAI_ENDPOINT=https://openlabel-openai.openai.azure.com/
# AZURE_OPENAI_KEY=4mjzKt4RhFGU2ecomfAQnBYUCoOT5Jswu9Ou6shy4CfEa5DgccX1JQQJ99BIAC77bzfXJ3w3AAABACOGdVgA
# AZURE_OPENAI_DEPLOYMENT=nutrition-ai
# AZURE_OPENAI_API_VERSION=2024-10-21

CLOUDINARY_CLOUD_NAME=dhg1f3dab
CLOUDINARY_API_KEY=178974155415274
CLOUDINARY_API_SECRET=DHHR_X6fpni_9Q6CFbqvJfI1d-c

# OCR_PROVIDER=azure
# AZURE_KEY=3aRDAcmXAMYTjA2H7AgDqU340zmkqhbViCXSafcNi5TJLxA5X5OeJQQJ99BIACGhslBXJ3w3AAALACOGxLS2
# AZURE_ENDPOINT=https://aiaiai.cognitiveservices.azure.com/
# OPENROUTER_API_KEY=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
PORT=3000

# OpenRouter GPT-3.5 Free
# OPENROUTER_API_KEY=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
# DAILY_LIMIT=50

# OCR_PROVIDER=azure


**Test the setup:**
- OCR Backend: `http://localhost:3000/api/health`
- Auth Backend: `http://localhost:3001/api/health`
- Mobile App: Scan QR code with Expo Go app

## 📱 Frontend Features
- **🏥 WHO Health Analysis** - Real-time ingredient analysis using WHO standards
- **📊 Advanced Analytics** - Health statistics and compliance tracking  
- **🖼️ Full-Screen Image Viewer** - High-quality image display with zoom
- **🧩 Interactive Quiz System** - Gamified nutrition education
- **📈 Progress Tracking** - Personal health journey monitoring
- **💾 Scan History** - Enhanced history with image gallery
- **🎯 Purchase Recommendations** - Buy/Caution/Avoid guidance

## 🔧 Backend Features

### backend-ocr (Main Analysis)
- **🔤 Azure OCR Integration** - Advanced text extraction from labels
- **🤖 OpenRouter GPT-3.5** - AI-powered WHO health analysis
- **☁️ Cloudinary Storage** - Secure image upload and management
- **📊 Health Grading** - A-F scale based on WHO standards
- **🔬 Ingredient Analysis** - Individual health impact assessment

### backend-auth (Authentication)
- **🔐 JWT Authentication** - Secure user authentication
- **👤 User Management** - Registration, login, profile management
- **📊 User Analytics** - Personal health statistics tracking
- **🔒 Data Security** - Encrypted user data and secure endpoints

---

**Ready to analyze ingredients with WHO health standards!** 🏥📱
