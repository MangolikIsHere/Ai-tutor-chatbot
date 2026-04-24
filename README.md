# 🤖 NeuralChat — Advanced RAG-Powered AI SaaS

<p align="center">
  <a href="https://neuralchat-ai.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🚀 Live_Demo-NeuralChat-blueviolet?style=for-the-badge" />
  </a>
  <a href="https://github.com/MangolikIsHere/Ai-tutor-chatbot/stargazers">
    <img src="https://img.shields.io/github/stars/MangolikIsHere/Ai-tutor-chatbot?style=for-the-badge" />
  </a>
  <a href="https://github.com/MangolikIsHere/Ai-tutor-chatbot/network/members">
    <img src="https://img.shields.io/github/forks/MangolikIsHere/Ai-tutor-chatbot?style=for-the-badge" />
  </a>
  <a href="https://github.com/MangolikIsHere/Ai-tutor-chatbot/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/MangolikIsHere/Ai-tutor-chatbot?style=for-the-badge" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=flat-square&logo=tailwind-css" />
  <img src="https://img.shields.io/badge/Groq-LLM-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/FAISS-VectorDB-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Firebase-Auth-yellow?style=flat-square&logo=firebase" />
</p>

---

## ✨ Overview

**NeuralChat** is a premium AI tutoring and document-intelligence platform powered by **RAG (Retrieval-Augmented Generation)**.

It combines a high-performance **FastAPI backend**, blazing-fast **Groq inference**, and a sleek **Next.js frontend** to deliver a professional chatbot experience for:

- 📚 AI tutoring  
- 📄 PDF / DOC / TXT document chat  
- 💡 Concept explanations  
- 💻 Coding help  
- 🎯 Interview preparation  
- 🧠 Personalized learning conversations  

🔗 **Live App:** https://neuralchat-ai.vercel.app/

---

## 🚀 Why NeuralChat?

Unlike basic chatbots, NeuralChat is designed like a real SaaS product.

✅ Premium UI/UX  
✅ Fast responses with Groq  
✅ Context-aware conversations  
✅ Upload docs & ask questions  
✅ Markdown/code rendering  
✅ Chat history system  
✅ Authentication ready  
✅ Responsive dark-mode design  

---

## 🎬 Live Demo

<p align="center">
  <a href="https://neuralchat-ai.vercel.app/">
    <img src="https://img.shields.io/badge/OPEN%20LIVE%20DEMO-Click%20Here-success?style=for-the-badge&logo=vercel" />
  </a>
</p>

---

## 📸 Product Showcase

### 🏠 Home Dashboard

| Main Interface |
| :---: |
| ![Dashboard](./assets/screenshots/dashboard.png) |

---

### 💬 AI Chat Experience

| Chat UI | Smart Prompt Cards |
| :---: | :---: |
| ![Chat UI](./assets/screenshots/chat-ui.png) | ![Prompts](./assets/screenshots/home-prompts.png) |

---

### 📄 RAG Document Upload

| Upload Knowledge Files |
| :---: |
| ![Upload](./assets/screenshots/upload-documents.png) |

---

### 👤 User Profile & Account

| Profile Dashboard | Account Menu |
| :---: | :---: |
| ![Profile](./assets/screenshots/profile-dashboard.png) | ![Menu](./assets/screenshots/account-menu.png) |

---

## 🧠 Core Features

### 📚 AI Tutor Assistant
- Explains concepts clearly  
- Personalized learning help  
- Beginner to advanced support  

### 💻 Coding Mentor
- Debugging help  
- Code generation  
- Best practices guidance  

### 🎯 Interview Prep
- DSA revision  
- ML / DL concepts  
- Mock technical Q&A  

### 📄 Chat With Documents
Upload:

- PDF  
- TXT  
- DOCX  
- Markdown files  

Then ask questions instantly.

### ⚡ Lightning Fast Inference

Powered by **Groq** for extremely low-latency responses.

---

## 🛠️ Tech Stack

### Frontend
- Next.js 16  
- React 19  
- Tailwind CSS 4  
- Framer Motion  
- Radix UI / shadcn style  

### Backend
- FastAPI  
- Python 3.10+  
- LangChain  
- Groq API  
- FastEmbed  
- FAISS  

### Database / Auth
- Firebase Auth  
- Firestore (optional)

---

## 📐 Architecture

```mermaid
graph TD
A[User] --> B[Next.js Frontend]
B --> C[FastAPI Backend]
C --> D[FastEmbed Embeddings]
D --> E[FAISS Vector Search]
E --> F[Groq LLM]
F --> C
C --> B
B --> A