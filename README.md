# Cadillac EV Assistant

AI-powered customer support application for Cadillac electric vehicles with comprehensive knowledge base and technical documentation management.

## 🚗 Features

- **AI Chat Assistant**: Intelligent chat system powered by OpenAI with access to vehicle manuals and documentation
- **Knowledge Base Management**: Upload and manage documents, PDFs, and technical files
- **Technical Database**: Separate database for technical specifications and service manuals
- **Multi-language Support**: German language support with European units (km, €, °C)
- **Beautiful UI**: Modern, responsive design with dark/light theme support
- **Firebase Integration**: Backend powered by Firebase Cloud Functions and Firestore

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase Cloud Functions (Node.js)
- **Database**: Firestore
- **AI**: OpenAI GPT API
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Auth ready

## 📦 Project Structure

```
cadillac-ev-app/
├── public/              # Frontend files
│   ├── index.html      # Landing page
│   ├── chat.html       # Chat interface
│   ├── settings.html   # Settings & database management
│   ├── app.js          # Main application logic
│   └── styles.css      # Application styles
├── functions/           # Firebase Cloud Functions
│   ├── index.js        # API endpoints
│   └── package.json    # Backend dependencies
└── firebase.json       # Firebase configuration
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18 or higher
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Firestore and Functions enabled
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cadillac-ev-app
```

2. Install dependencies:
```bash
npm install
cd functions
npm install
cd ..
```

3. Configure Firebase:
```bash
firebase login
firebase use --add
```

4. Set up environment variables:
```bash
cd functions
firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY"
```

5. Deploy to Firebase:
```bash
firebase deploy
```

## 🔧 Configuration

### Firebase Functions Configuration

Required environment variables:
- `openai.key`: Your OpenAI API key

### Firestore Collections

The app uses these collections:
- `knowledgebase`: User-uploaded knowledge base documents
- `technicalDatabase`: Technical specifications and manuals
- `app_settings`: Application settings and branding
- `chat_history`: Chat conversation history

## 📱 Features Overview

### Chat System
- Real-time AI responses in German
- Access to knowledge base and technical documentation
- File and image upload support
- Quick question suggestions
- Conversation history

### Knowledge Base Management
- Upload PDF, TXT, MD, XLSX files
- Document preview and download
- Bulk operations (delete, export, import)
- Search and filter capabilities
- Document statistics

### Technical Database
- Separate database for technical documentation
- Category-based organization
- Vehicle-type specific documents
- Full CRUD operations

### Settings & Branding
- Custom logo upload
- Color scheme customization
- Text and title customization
- Theme toggle (dark/light)

## 🌐 Deployment

The application is deployed on Firebase Hosting:
- Production: https://cis-de.web.app
- Firebase Console: https://console.firebase.google.com/project/cis-de

## 📊 API Endpoints

### Cloud Functions
- `GET /knowledgebase` - Get all knowledge base documents
- `GET /technicalDatabase` - Get all technical documents
- `POST /generateChatResponse` - Generate AI chat response
- `GET /branding` - Get branding settings
- `POST /branding` - Update branding settings

## 🔒 Security

- Firestore security rules implemented
- CORS enabled for Cloud Functions
- API key secured via Firebase environment config
- User authentication ready (currently disabled)

## 🧪 Testing

Automated test suite included:
```bash
node automated-test-suite.js
node test-deployed-site.js
node simulate-browser-load.js
```

## 📝 Development

### Local Development
```bash
# Start local Firebase emulators
firebase emulators:start

# In another terminal, serve the frontend
firebase serve
```

### Code Structure
- `public/app.js`: Main frontend logic (~4400 lines)
- `functions/index.js`: Backend API (~1000 lines)
- `public/settings.html`: Settings interface (~1800 lines)

## 🐛 Known Issues & Solutions

### Databases showing 0 documents
- **Solution**: Hard refresh (Ctrl+Shift+R)
- **Cause**: Browser cache
- **Fixed**: Inline scripts now force immediate load

## 🤝 Contributing

This is a private business application. Contact the repository owner for contribution guidelines.

## 📄 License

Proprietary - All rights reserved

## 👥 Credits

- **AI Integration**: OpenAI GPT-4
- **Backend**: Firebase
- **Frontend**: Custom vanilla JavaScript
- **Design**: Modern, responsive UI with custom CSS

## 📞 Support

For support and questions:
- Check diagnostic page: https://cis-de.web.app/deep-diagnostic.html
- Review test results: See `TEST-RESULTS-SUMMARY.md`

## 🔄 Recent Updates

- ✅ Fixed database loading issues
- ✅ Added inline scripts for immediate data loading
- ✅ Implemented multiple retry mechanisms
- ✅ Added comprehensive error handling
- ✅ Created diagnostic tools
- ✅ Full German language support
- ✅ European units integration

## 🎯 Roadmap

- [ ] User authentication system
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (FR, IT)
- [ ] Mobile app version
- [ ] Voice input for chat
- [ ] Advanced search capabilities

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 2025

