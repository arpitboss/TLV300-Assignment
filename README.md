# WHOIS Lookup Tool

A full-stack web application for performing WHOIS domain lookups, built with Node.js/Express backend and React frontend.

## 🌟 Features

- **Domain Information Lookup**: Get comprehensive domain details including registrar, registration/expiration dates, domain age, and name servers
- **Contact Information Lookup**: Retrieve registrant, technical, and administrative contact details
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Error Handling**: Graceful error handling with user-friendly messages
- **Real-time Search**: Fast API responses with loading states
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## 🏗️ Tech Stack

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client for API requests
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend

- **React** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon components
- **Modern JavaScript (ES6+)**

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14.0.0 or higher)
- **npm** or **yarn** package manager
- **WHOIS API Key** from [WhoisXMLAPI](https://whoisxmlapi.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/arpitboss/TLV300-Assignment.git
cd whois-lookup-tool
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file and add your WHOIS API key
# WHOIS_API_KEY=your_api_key_here
# PORT=5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Install Tailwind CSS (if not already installed)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 4. Get Your WHOIS API Key

1. Visit [WhoisXMLAPI](https://whoisxmlapi.com/)
2. Create a free account
3. Go to your user settings/dashboard
4. Copy your API key
5. Add it to your `.env` file in the backend directory

## 🎯 Running the Application

### Development Mode

1. **Start the Backend Server**:

```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```

2. **Start the Frontend Development Server**:

```bash
cd frontend
npm start
# Frontend will run on http://localhost:3000
```

### Production Mode

1. **Build the Frontend**:

```bash
cd frontend
npm run build
```

2. **Start the Backend**:

```bash
cd backend
npm start
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
whois-lookup-tool/
├── backend/
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── .env.example          # Environment variables template
│   └── .env                  # Environment variables (create this)
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   └── WhoisLookup.js # Main React component
│   │   ├── App.js            # Root component
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Tailwind CSS styles
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind configuration
└── README.md                 # This file
```

## 🔧 API Endpoints

### POST `/api/whois`

Performs WHOIS lookup for a domain.

**Request Body:**

```json
{
  "domain": "amazon.com",
  "dataType": "domain" // or "contact"
}
```

**Response (Domain Info):**

```json
{
  "success": true,
  "dataType": "domain",
  "domain": "amazon.com",
  "data": {
    "domainName": "amazon.com",
    "registrar": "MarkMonitor, Inc.",
    "registrationDate": "Nov 1, 1994",
    "expirationDate": "Oct 31, 2024",
    "estimatedDomainAge": "29 years",
    "hostnames": "ns1.p31.dynect.net, ns2.p31..."
  }
}
```

### GET `/api/health`

Health check endpoint.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Testing

### Test with Sample Domain

Use `amazon.com` as suggested in the requirements to test the application:

1. Enter `amazon.com` in the domain field
2. Select either "Domain Information" or "Contact Information"
3. Click "Lookup Domain"

### Manual Testing Checklist

- [ ] Domain information lookup works
- [ ] Contact information lookup works
- [ ] Error handling for invalid domains
- [ ] Error handling for network issues
- [ ] Loading states display correctly
- [ ] Responsive design on mobile/desktop
- [ ] API key validation

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```bash
# Required
WHOIS_API_KEY=your_whois_api_key_here

# Optional
PORT=5000
NODE_ENV=development
```

### Frontend Proxy

The frontend is configured to proxy API requests to the backend. In `frontend/package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

## 🔧 Troubleshooting

### Common Issues

1. **"WHOIS API key not configured" error**

   - Ensure you've added your API key to the `.env` file
   - Restart the backend server after adding the API key

2. **CORS errors**

   - Make sure the backend server is running on port 5000
   - Check that CORS is properly configured in `server.js`

3. **Frontend not connecting to backend**

   - Verify the proxy setting in `frontend/package.json`
   - Ensure both servers are running

4. **API quota exceeded**
   - Check your WhoisXMLAPI account limits
   - Consider upgrading your plan if needed

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

## 🚀 Deployment

### Local Deployment

The application is configured to run on `localhost:5000` as specified in the requirements.

### Production Deployment

For production deployment:

1. Build the frontend: `npm run build`
2. Serve static files from the backend
3. Use process managers like PM2
4. Configure reverse proxy (nginx)
5. Set up SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [WhoisXMLAPI](https://whoisxmlapi.com/) for providing the WHOIS data service
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for the beautiful icon set
- [React](https://reactjs.org/) for the UI library

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the [WhoisXMLAPI documentation](https://whois.whoisxmlapi.com/documentation/making-requests)
3. Create an issue in this repository

---

**Made with ❤️ by Arpit Verma**
