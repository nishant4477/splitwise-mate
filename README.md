# SplitMate 💸

SplitMate is a modern, full-stack web application designed to eliminate the awkwardness of splitting bills among friends, roommates, or travel groups. With features like AI-powered receipt scanning, greedy debt simplification, and one-click payment links, it provides a seamless and "glassmorphic" premium user experience.

![SplitMate Showcase](https://via.placeholder.com/1200x600.png?text=SplitMate+Premium+UI)

## 🌟 Key Features

1. **Smart Debt Simplification (Greedy Algorithm)**
   - Built an algorithm that reduces total transactions. Instead of 10 complex transactions among 5 friends, it simplifies the graph so that debts are settled in the minimum number of payments.
2. **AI Receipt Scanner (OCR)**
   - Integrated **Google Gemini API (Flash 2.5)** to automatically scan uploaded receipts, extract the total amount, suggest a title, and categorize the expense.
3. **AI Group Insights**
   - Uses Gemini to analyze a group's expense history and provide engaging, fun, and useful financial insights (e.g., "You spend too much on Food!").
4. **Flexible Splitting Engine**
   - Supports Equal splits, Custom amounts, Percentages, and Shares. 
5. **Instant Payment Links**
   - Automatically generates deep-links for Venmo, PayPal, Cash App, and UPI so users can pay each other with a single tap.
6. **Premium Dark Glassmorphism UI**
   - Built entirely from scratch using Tailwind CSS, featuring subtle micro-animations, glowing gradients, and responsive layouts.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4 + Custom CSS for glassmorphism)
- **Database**: PostgreSQL (via [Supabase](https://supabase.com/) / Neon / Local)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js (Auth.js)](https://next-auth.js.org/) (Google & GitHub OAuth)
- **State Management**: React `useState` & Server-side state
- **AI / LLM**: `@google/genai` (Google Gemini 2.5 Flash)
- **Icons**: `lucide-react`

---

## 🧠 How It Works (Behind the scenes)

### 1. The Debt Simplification Algorithm
The core of SplitMate is the `calculateSettlements(balances)` function. 
1. We calculate the **net balance** of every user in a group (Amount Paid - Amount Owed).
2. We separate users into `debtors` (negative balance) and `creditors` (positive balance).
3. We use a **Greedy Algorithm**: We take the largest debtor and the largest creditor, and settle as much of their balance as possible in a single transaction.
4. This repeats until all balances are `0`, minimizing the total number of transactions required to settle the entire group.

### 2. AI Receipt OCR
When a user uploads a receipt, the file is converted into a `Base64` string. It is securely sent via a Next.js Server Action to the Gemini API with a strict JSON schema prompt. Gemini reads the image, extracts the `title`, `amount`, and `category`, and returns the JSON which instantly populates the React form state.

---

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/splitmate.git
   cd splitmate
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/splitmate"
   NEXTAUTH_SECRET="your_random_secret_string"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers
   GOOGLE_CLIENT_ID="your_google_id"
   GOOGLE_CLIENT_SECRET="your_google_secret"
   GITHUB_ID="your_github_id"
   GITHUB_SECRET="your_github_secret"

   # AI integration
   GEMINI_API_KEY="your_gemini_key"
   ```

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

---

## 📚 Learning Resources (For the Tech Stack)

If you need to brush up on the technologies used in this project before an interview, here are some of the best YouTube resources:

**1. Next.js 14/15 App Router & Server Actions**
- *Codevolution - Next.js App Router Tutorial:* [Watch Playlist](https://www.youtube.com/playlist?list=PLC3y8-rFHvwjOKd6gdf4QtV1uYNiQnlsI)
- *JavaScript Mastery - Next.js Crash Course:* [Watch Video](https://www.youtube.com/watch?v=wm5gMKuwSYk)

**2. Prisma ORM & Relational Databases**
- *Web Dev Simplified - Prisma Crash Course:* [Watch Video](https://www.youtube.com/watch?v=RebA5J-naZA)
- *Net Ninja - Prisma Tutorial:* [Watch Playlist](https://www.youtube.com/playlist?list=PL4cUxeGkcC9hG1K108Z27G0ylYgP0n1-b)

**3. NextAuth.js (Authentication)**
- *Dave Gray - NextAuth.js Full Tutorial:* [Watch Video](https://www.youtube.com/watch?v=w2h54xz6Ndw)

**4. Tailwind CSS (Advanced UI Design)**
- *Tailwind Labs (Official) - Core Concepts:* [Watch Playlist](https://www.youtube.com/playlist?list=PL5f_mz_zU5eXWYDXHUDW8vA19tXepY2v)
- *Hyperplexed - Micro-animations & CSS Glows:* [Watch Video](https://www.youtube.com/watch?v=342sSExF-0E)

**5. Google Gemini API**
- *Google for Developers - Get Started with Gemini API:* [Watch Video](https://www.youtube.com/watch?v=hZem2dGg94U)

---

## 👨‍💻 Author
**Nishant Rajput**
Feel free to reach out if you have any questions about the architecture or implementation!
