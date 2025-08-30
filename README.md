# Interview Ace

Interview Ace is your personal AI-powered interview coach. It's designed to help you practice for job interviews, get instant feedback on your answers, and ultimately land your dream job.

## Features

-   **Personalized Interview Sessions:** Generates interview questions based on your target role, the company you're applying to, and your resume.
-   **Voice-based Practice:** Practice answering questions out loud, just like in a real interview.
-   **AI-Powered Feedback:** Get instant, detailed analysis of your responses, focusing on content, relevance, and communication.
-   **Adaptive Questioning:** The AI can ask follow-up questions to dig deeper into your experience.
-   **Performance Reports:** Receive a comprehensive report at the end of each session with scores on confidence, correctness, and more.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
-   **AI:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models.
-   **Authentication & Database:** [Firebase](https://firebase.google.com/)
-   **UI:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), and [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

### Prerequisites

-   Node.js (v20 or later)
-   A Firebase project.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Firebase project credentials and a Gemini API key. You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```env
    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=

    # Genkit
    GEMINI_API_KEY=
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
