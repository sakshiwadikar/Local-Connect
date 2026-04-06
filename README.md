# LocalConnect 🌐

A modern web platform connecting users with local service providers. Find plumbers, electricians, hospitals, and more in your area with real-time availability, ratings, and verified provider profiles.

**Live Demo:** https://localconnect-f077b.web.app

---

## ✨ Features

### For Users (Customers)
- 🔍 Browse and search local service providers by category
- ⭐ View ratings and trust scores from verified reviews
- ❤️ Save favorite services for quick access
- 📍 Location-based service discovery
- 🔐 Secure authentication (Email/Password & Google Sign-In)
- 📊 Real-time trust scores and analytics

### For Providers
- ➕ Create and manage service listings
- 📝 Add business details, location, and pricing
- ✅ Get verified on the platform
- 🎯 Reach local customers efficiently
- 📈 Track service analytics and performance

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite (fast build tool)
- Tailwind CSS for styling with dark mode support
- Framer Motion for animations
- React Router for navigation
- Context API for state management

**Backend & Services:**
- Firebase Authentication (Email/Password, Google OAuth)
- Firestore (NoSQL database) for data storage
- Firebase Cloud Storage for file uploads
- Firebase Hosting for deployment
- Google Cloud Console for API management

**Tools:**
- ESLint for code quality
- Git for version control

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mangesh-Alange/Local-Connect.git
   cd Local-Connect
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment variables:**
   - Create `.env.local` in the root directory:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   ```
   - Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
   - See `.env.example` for reference

4. **Start development server:**
   ```bash
   npm run dev
   ```
   - Opens at `http://localhost:5173`

---

## 📝 Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run ESLint for code quality
npm run lint

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

---

## 📁 Project Structure

```
src/
├── assets/              # Images, icons, static files
├── components/          # Reusable UI components
│   └── Navbar.jsx       # Navigation component
├── context/             # React Context for state
│   └── AuthContext.jsx  # Authentication context
├── hooks/               # Custom React hooks
│   ├── useFavorites.js  # Favorites management
│   └── useProviderServices.js  # Service CRUD
├── lib/
│   └── firebase.js      # Firebase configuration & setup
├── pages/               # Page components
│   ├── Home.jsx
│   ├── ServiceListing.jsx
│   ├── ServiceDetail.jsx
│   ├── AddService.jsx
│   └── Analytics.jsx
├── App.jsx              # Main app component
├── main.jsx             # Entry point
├── App.css              # Global styles
└── index.css            # Base styles

public/                 # Static assets
firestore.rules         # Firestore security rules
firebase.json          # Firebase configuration
vite.config.js         # Vite configuration
package.json           # Dependencies & scripts
```

---

## 🔐 Firebase Setup

### 1. Create Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Enable required services below

### 2. Enable Services
- **Authentication:** Email/Password & Google Sign-In
- **Firestore Database:** Create in production mode
- **Cloud Storage:** For file uploads
- **Hosting:** For deployment

### 3. Get API Key
- Project Settings → General → Web Apps → Copy config
- Use the `apiKey` value in your `.env.local`

### 4. Configure Security Rules
- Copy contents of `firestore.rules` to Firestore Rules section in Firebase Console
- Deploy rules: `firebase deploy --only firestore:rules`

---

## 📊 Database Schema

### Collections

**`users/{userId}`**
- `uid`: User's unique ID
- `name`: Full name
- `email`: Email address
- `role`: 'user' or 'provider'
- `favorites`: Array of favorite serviceIds
- `photoURL`: Profile picture
- `createdAt`: Timestamp

**`services/{serviceId}`**
- `ownerUid`: Provider's user ID
- `businessName`: Service name
- `category`: Type (Plumber, Electrician, Hospital, etc.)
- `description`: Service details
- `location`: { state, city, address, coordinates }
- `rating`: Average rating (0-5)
- `trustScore`: Trust percentage (0-100)
- `isVerified`: Verification status
- `pricingText`: Price information
- `createdAt`: Creation timestamp

**`reviews/{reviewId}`**
- `serviceId`: Related service
- `reviewerUid`: Reviewer's user ID
- `rating`: Rating (1-5)
- `text`: Review text
- `date`: Timestamp

---

## 🔒 Security & Best Practices

✅ **Implemented:**
- API key stored in `.env.local` (not committed to git)
- `.env.local` protected by `.gitignore`
- Firestore rules enforce role-based access
- Google OAuth for secure authentication
- HTTPS-only deployment on Firebase Hosting

⚠️ **Note for Collaborators:**
- Never commit `.env.local` to git
- Always use environment variables for sensitive data
- Get your own API key from Google Cloud Console

---

## 🛠️ Development Workflow

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and test locally
npm run dev

# 3. Build to test production
npm run build

# 4. Commit changes
git add .
git commit -m "description of changes"

# 5. Push to GitHub
git push origin feature/your-feature-name

# 6. Create a Pull Request on GitHub
```

---

## 📖 Key Features Implementation

### Real-time Favorites
- Uses Firestore `onSnapshot()` for live sync
- Updates across all pages instantly
- Persists in user document

### Provider Authentication
- Separate role assignment for providers
- Enhanced signup with userType preservation
- Provider-only pages and features

### Service Form Submission
- Multi-step form validation
- Timeout protection (30 seconds)
- Real-time Firestore document creation
- Error handling with user feedback

---

## 🐛 Troubleshooting

**App won't start:**
- Ensure `.env.local` exists with valid API key
- Run `npm install` again
- Clear node_modules: `rm -r node_modules && npm install`

**Firebase errors:**
- Check Firestore rules in Firebase Console
- Verify API key isn't revoked
- Ensure project is properly initialized

**Build errors:**
- Check Node.js version: `node --version` (needs v16+)
- Clear Vite cache: `rm -rf dist && npm run build`

---

## 📞 Support & Contribution

Found a bug? Have a feature idea?
- Open an issue on [GitHub Issues](https://github.com/Mangesh-Alange/Local-Connect/issues)
- Submit pull requests with improvements

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 👤 Author

**Mangesh Alange**
- GitHub: [@Mangesh-Alange](https://github.com/Mangesh-Alange)
- Project: [Local-Connect](https://github.com/Mangesh-Alange/Local-Connect)

---

**Happy coding! 🚀**
