# 🧠 Collabs — Real-Time Collaboration Platform (MERN Stack)


> **A Notion-like real-time collaboration app built with MERN Stack, empowering teams to create, edit, and collaborate on documents simultaneously.**

---

## 🚀 Overview

**Collabs** is a full-stack collaboration platform that enables teams to create workspaces, write and share documents in real-time, and manage user roles efficiently.  
Built with **MongoDB, Express, React, Node.js, and Socket.io**, it provides a smooth, secure, and modern collaborative experience — similar to Notion or Google Docs.

---

## 🌟 Features

### 1. 🔐 Authentication & Authorization
- **JWT-based Authentication** with Refresh Tokens  
- **Role-based Access Control (RBAC)** — Admin, Editor, and Viewer  
- **Social Login Integration** using **Google** and **GitHub OAuth**  
- Secure routes and tokens stored using **HttpOnly Cookies**

---

### 2. 🧩 Workspaces & Documents
- Create multiple **Workspaces** for teams or projects  
- Each workspace contains nested **Documents** (pages/sub-pages)  
- **Markdown + Rich Text Editor** for seamless writing experience  
- Full **CRUD Operations** (Create, Read, Update, Delete)  
- **Version History** — Rollback to previous versions easily  
- Document sharing via secure links  

---

### 3. ⚡ Real-Time Collaboration
- Built on **Socket.io (WebSockets)** for real-time data sync  
- Users editing the same doc see **instant updates** without refresh  
- Implements **Operational Transformations (OT)** / **CRDT** for consistency  
- **Live Cursors** and **Presence Indicators** show who’s online  
- Conflict-free editing experience for multiple users  

---

### 4. 📁 File & Media Uploads
- Upload and embed **images, PDFs, or media** directly into documents  
- Uses **Multer** and **Cloudinary / AWS S3** for storage  
- Secure and efficient file handling with upload progress tracking  

---

. 🔔 Notifications System
Real-time notifications for:
Mentions (@username)
Document sharing and permissions
Comments or edits on shared docs
Built with Socket.io for instant delivery
In-app notification tray with read/unread indicators

----

| Layer               | Technology                                                   |
| :------------------ | :----------------------------------------------------------- |
| **Frontend**        | React.js (Vite) • Tailwind CSS • Recharts • Socket.io-client |
| **Backend**         | Node.js • Express.js • MongoDB (Mongoose) • JWT • Socket.io  |
| **Auth**            | Google OAuth • GitHub OAuth • JWT Refresh Tokens             |
| **Database**        | MongoDB Atlas                                                |
| **File Storage**    | Cloudinary / AWS S3 (configurable)                           |
| **Analytics**       | Mongo Aggregations + WebSocket Events                        |
| **Version Control** | Git & GitHub                                                 |

----

git clone https://github.com/ARIHANT218/Collabs.git
cd Collabs

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
