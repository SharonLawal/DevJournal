# DevJournal: An AI-Powered Developer's Journal

DevJournal is a modern, full-stack web application designed to help developers document their coding journey, track their progress, and gain intelligent insights into their work. It combines a rich text editor for detailed note-taking with a powerful AI assistant to provide feedback, suggest resources, and analyze journal entries.

This project is built with a decoupled architecture, featuring an Angular frontend and a Node.js/Express backend, making it scalable and maintainable.

---

## ✨ Key Features

- **📝 Rich Text Journaling:** Create, edit, and view journal entries using a feature-rich WYSIWYG editor (powered by Quill.js) that supports code blocks, lists, and various text formatting options.
- **🖼️ Image & Media Support:** Upload and associate a cover image with each journal entry via Cloudinary integration.
- **🏷️ Smart Organization:** Categorize and tag your entries for easy searching and filtering.
- **🤖 AI-Powered Insights:** Get intelligent analysis of your journal entries, including sentiment, key themes, actionable advice, and resource recommendations, powered by the Google Gemini API.
- **💬 AI Chat Assistant:** A dedicated chat interface to ask coding questions and get help from an AI mentor.
- **📄 PDF Export:** Export your beautifully formatted journal entries, including images and styled content, as high-quality PDF documents.
- **🔐 Secure Authentication:** User registration and login system using JSON Web Tokens (JWT) to secure user data and API endpoints.
- **🚀 Decoupled Architecture:** A robust Angular single-page application for the frontend and a separate Node.js, Express, and MongoDB backend API.

---

## 🛠️ Tech Stack

### Frontend

- **[Angular](https://angular.io/)** (v16)
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Bootstrap](https://getbootstrap.com/)** & **[SCSS](https://sass-lang.com/)** for styling
- **[ngx-quill](https://github.com/KillerCodeMonkey/ngx-quill)** for the rich text editor
- **[html2pdf.js](https://github.com/eKoopmans/html2pdf.js)** for PDF generation

### Backend

- **[Node.js](https://nodejs.org/)**
- **[Express.js](https://expressjs.com/)** for the REST API framework
- **[MongoDB](https://www.mongodb.com/)** with **[Mongoose](https://mongoosejs.com/)** for the database
- **[JSON Web Token (JWT)](https://jwt.io/)** for authentication
- **[Cloudinary](https://cloudinary.com/)** for image storage and management
- **[Google Gemini API](https://ai.google.dev/)** for generative AI features

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js** (v18 or later recommended)
- **Angular CLI:** `npm install -g @angular/cli`
- A **MongoDB** database (either local or a free Atlas cluster)
- A **Cloudinary** account for image uploads
- A **Google AI API Key** for Genkit/Gemini features

### Installation & Setup

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/SharonLawal/DevJournal.git
    cd DevJournal
    ```

2.  **Setup the Backend**
    - Navigate to the backend directory:
      ```sh
      cd backend
      ```
    - Install the backend dependencies:
      ```sh
      npm install
      ```
    - Create a `.env` file in the `backend` directory and add the following environment variables:
      ```env
      PORT=5000
      MONGODB_URI=your_mongodb_connection_string
      JWT_SECRET=your_super_secret_jwt_key
      
      # Cloudinary Credentials
      CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
      CLOUDINARY_API_KEY=your_cloudinary_api_key
      CLOUDINARY_API_SECRET=your_cloudinary_api_secret

      # Google Gemini API Key
      GEMINI_API_KEY=your_google_ai_api_key
      ```
    - Start the backend server:
      ```sh
      npm run dev
      ```
    - The server should now be running on `http://localhost:5000`.

3.  **Setup the Frontend**
    - Open a **new terminal window**.
    - Navigate to the frontend directory:
      ```sh
      cd frontend
      ```
    - Install the frontend dependencies. The `.npmrc` file in this directory will automatically handle peer dependency issues.
      ```sh
      npm install
      ```
    - Make sure your frontend knows where the API is running. Open `frontend/src/environments/environment.ts` and set the `apiUrl`:
      ```typescript
      export const environment = {
        production: false,
        apiUrl: 'http://localhost:5000/api'
      };
      ```
    - Start the Angular development server:
      ```sh
      ng serve
      ```
    - Open your browser and navigate to `http://localhost:4200`. The application should now be fully functional.

---

## 🚢 Deployment

This project is configured for a decoupled deployment:

- **Frontend:** The Angular application is configured for deployment on static hosting platforms like **Vercel** or **Netlify**. A `netlify.toml` file is included with the correct build settings.
- **Backend:** The Node.js/Express API is configured for deployment on a server hosting platform like **Render**.

Remember to set the correct environment variables in your deployment service's dashboard.

