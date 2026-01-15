# 🧠 SmartQue - The AI Quiz Hero

**SmartQue** is a modern, dynamic web application that allows users to take AI-generated quizzes on core web development topics like HTML, CSS, and JavaScript. Powered by OpenAI, it provides an infinite variety of questions tailored to different skill levels.

![SmartQue Banner](https://via.placeholder.com/1200x400?text=SmartQue+-+AI+Powered+Quiz+Hero)

## ✨ Features

- **🤖 AI-Driven Questions:** Quizzes are generated in real-time using OpenAI's GPT-4o-mini engine.
- **🌍 Multilingual Support:** Choose between **Bangla** and **English** with a single click.
- **📈 Skill Levels:** Adaptive difficulty levels: Beginner, Intermediate, and Advanced.
- **📱 Responsive Design:** Fully mobile-responsive UI built with Tailwind CSS.
- **🕒 Timed Challenges:** Test your speed and accuracy with a countdown timer.
- **📝 Detailed Explanations:** Every answer comes with an educational description to help you learn.
- **💾 History & Progress:** Keeps track of your previous scores using local storage.

## 🛠️ Technology Stack

- **Frontend:** HTML5, Vanilla JavaScript
- **Styling:** Tailwind CSS (via CDN)
- **API:** OpenAI API (Chat Completions)
- **Icons:** Font Awesome
- **Fonts:** Anek Bangla & Rubik

## 🚀 Getting Started

### Prerequisites

- A modern web browser.
- An OpenAI API key (for dynamic question generation).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/farhanshahriyar/SmartQueQA.git
   ```
2. Open `index.html` in your browser.

### Configuration

Add your OpenAI API key in `api.js`:
```javascript
const API_KEY = 'your_api_key_here';
```

## 🏗️ System Overview

1.  **Selection:** User selects a topic and level.
2.  **Generation:** The `api.js` makes a request to OpenAI with a custom prompt.
3.  **Translation:** `translations.js` ensures the UI matches the user's language choice.
4.  **Quiz Loop:** `quiz.js` and `index.js` handle the quiz state, timer, and scoring.
5.  **Review:** Results are displayed with grades and educational descriptions.

## 🎓 Author

**Farhan Shahriyar**
- LinkedIn: [Farhan Shahriyar](https://www.linkedin.com/in/farhanshahriyar/)
- GitHub: [@farhanshahriyar](https://github.com/farhanshahriyar)

## 📜 License

Copyright © 2024-2026 Farhan Shahriyar. All rights reserved.
