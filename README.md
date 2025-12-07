<div align="center">

# 🎨 Structura Diagram

### AI-Powered Diagram Generation Platform

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://structura-diagram.vercel.app)
[![Vercel](https://img.shields.io/badge/deployed%20on-vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/react-18.3-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/supabase-database-green?style=for-the-badge&logo=supabase)](https://supabase.com)

**Transform your ideas into beautiful diagrams with AI assistance**

[🚀 Try Now](https://structura-diagram.vercel.app) • [📖 Documentation](#documentation) • [💬 Support](#support)

</div>

---

## ✨ Features

### 🤖 AI-Powered Generation
- **Google Gemini Integration** - Advanced AI for intelligent diagram creation
- **Natural Language Processing** - Describe your diagram in plain text
- **Smart Suggestions** - AI-powered recommendations for better diagrams

### 💳 Integrated Payment System
- **TriPay Integration** - Secure payment processing
- **QRIS Support** - Quick Response Code Indonesian Standard
- **Token-based System** - Purchase tokens to generate diagrams
- **Automatic Fulfillment** - Instant token delivery after payment

### 🎨 Rich Diagram Features
- **Multiple Diagram Types** - Flowcharts, mind maps, and more
- **Real-time Preview** - See changes as you work
- **Export Options** - Download in various formats
- **Customization** - Colors, styles, and layouts

### 🌐 Modern Tech Stack
- **React 18** - Latest React features with TypeScript
- **Vite** - Lightning-fast build tool
- **Supabase** - Backend as a Service with PostgreSQL
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible components

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nashswan0/structura-diagram.git
   cd structura-diagram
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` file:
   ```bash
   # Supabase
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Google Gemini
   VITE_GEMINI_API_KEY=your_gemini_api_key
   
   # TriPay (for payment integration)
   VITE_TRIPAY_API_KEY=your_tripay_api_key
   VITE_TRIPAY_PRIVATE_KEY=your_tripay_private_key
   VITE_TRIPAY_MERCHANT_CODE=your_merchant_code
   VITE_TRIPAY_MODE=sandbox
   VITE_TRIPAY_API_URL=https://tripay.co.id/api-sandbox
   ```

4. **Run database migrations**
   ```bash
   npx supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:8080
   ```

---

## 📁 Project Structure

```
structura-diagram/
├── api/                    # Serverless API functions
│   └── tripay/            # Payment processing endpoints
├── src/
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Auth, Language)
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   └── main.tsx          # Application entry point
├── supabase/
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

---

## 🔧 Configuration

### Database Setup

The project uses Supabase with the following tables:

- `profiles` - User profiles
- `transactions` - Payment transactions
- `user_tokens` - Token balances

Run migrations to set up the database:

```bash
npx supabase db push
```

### Payment Integration

TriPay is integrated for payment processing. To enable:

1. Register at [TriPay](https://tripay.co.id)
2. Get your API credentials
3. Update environment variables
4. Configure callback URL in TriPay dashboard

For production deployment, see [Production Migration Guide](./docs/production-migration.md).

---

## 🌍 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy!

3. **Set up environment variables in Vercel**
   - Add all variables from `.env.local`
   - Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for API functions

### Environment Variables for Production

Required variables in Vercel:

```bash
# Frontend
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_GEMINI_API_KEY
VITE_TRIPAY_API_KEY
VITE_TRIPAY_PRIVATE_KEY
VITE_TRIPAY_MERCHANT_CODE
VITE_TRIPAY_MODE
VITE_TRIPAY_API_URL

# Backend (API Functions)
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

---

## 💻 Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Router** - Navigation
- **React Query** - Data fetching

### Backend
- **Supabase** - Database & Auth
- **Vercel Functions** - Serverless API
- **PostgreSQL** - Database

### Integrations
- **Google Gemini** - AI diagram generation
- **TriPay** - Payment processing
- **Supabase Auth** - Authentication

---

## 📖 Documentation

### Key Features

#### 🔐 Authentication
- Google OAuth integration
- Secure session management
- Protected routes

#### 💰 Token System
- Purchase tokens via QRIS
- Automatic token delivery
- Real-time balance updates

#### 🎨 Diagram Generation
- AI-powered suggestions
- Multiple diagram types
- Export capabilities

### API Endpoints

#### Payment APIs
- `POST /api/tripay/create-transaction` - Create payment transaction
- `POST /api/tripay/callback` - Handle payment callbacks
- `GET /api/tripay/transaction-status` - Check transaction status

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI capabilities
- [TriPay](https://tripay.co.id) - Payment processing
- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Hosting platform
- [shadcn/ui](https://ui.shadcn.com) - UI components

---

## 📞 Support

For support, email nashwanzaki19@gmail.com or open an issue on GitHub.

---

## 🔗 Links

- **Live Demo**: [structura-diagram.vercel.app](https://structura-diagram.vercel.app)
- **GitHub**: [nashswan0/structura-diagram](https://github.com/nashswan0/structura-diagram)

---

<div align="center">

**Made with ❤️ by Nashwan Zaki Permana**

⭐ Star this repo if you find it helpful!

</div>
