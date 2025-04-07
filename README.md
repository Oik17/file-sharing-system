# File Sharing System

A web-based file sharing system that allows users to upload and manage various types of files (e.g., JPG, PNG, PDF, etc.) and share them easily and securely with other users.

## Demo

- **Website**: [https://file-sharing.akshat-gupta.com](https://file-sharing.akshat-gupta.com)
- **GitHub**: [https://github.com/Oik17/file-sharing-system](https://github.com/Oik17/file-sharing-system)

## Overview

The File Sharing System is a lightweight, efficient alternative to traditional file sharing tools, focusing on quick uploads, simple link-based sharing, and a clean user experience. Built with an incremental development approach, the system evolved through continuous feedback integration to ensure a stable, user-focused experience.

## Tech Stack

- **Frontend**: Next.js - Fast, responsive, and server-rendered UI
- **Backend**: Golang - High-performance API for handling uploads and logic
- **Database**: PostgreSQL - Manages user data and file metadata
- **Cache**: Redis - Session management and performance caching
- **Storage**: AWS S3 - Scalable cloud storage for reliable file hosting
- **Authentication**: Google OAuth - Secure and simple user authentication

## Features

- **Secure Authentication**: Login securely using Google OAuth
- **Intuitive Dashboard**: View uploaded files, create folders, and manage content
- **File Upload**: Upload various file types directly to AWS S3
- **Folder Organization**: Create and manage nested folder structures
- **File Preview**: Open and view supported files within the platform
- **Easy Sharing**: Generate unique URLs for quick file sharing without recipient login

## Getting Started

### Prerequisites
- Go 1.16+
- Node.js 14+
- PostgreSQL
- Redis
- AWS S3 Account

### Installation

Follow these steps to set up and run the File Sharing System:

#### 1. Clone the Repository
```bash
git clone https://github.com/Oik17/file-sharing-system.git
cd file-sharing-system
```

#### 2. Set Up Backend
```bash
cd backend
go mod download
```

#### 3. Set Up Frontend
```bash
cd ../file-sharing-app
npm install
```

#### 4. Configure Environment Variables
Create `.env` files for both the backend and frontend with the following variables:

**Backend `.env`**
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=filesharing
REDIS_URL=localhost:6379
AWS_ACCESS_KEY=your_access_key
AWS_SECRET_KEY=your_secret_key
AWS_REGION=your_region
AWS_BUCKET=your_bucket_name
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Frontend `.env`**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
```

#### 5. Run the Application

**Start Backend**
```bash
cd backend
go run main.go
```

**Start Frontend**
```bash
cd ../file-sharing-app
npm run dev
```

#### 6. Access the Application
Open your browser and navigate to:  
[http://localhost:3000](http://localhost:3000)


## Author

- **Name**: Akshat Gupta
- **Registration Number**: 22BCE2173

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.