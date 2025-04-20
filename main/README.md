# AIgnite 🚀

AIgnite is an intelligent GitHub repository analysis platform that provides deep insights, code assessments, and development playbooks powered by AI. It helps developers and teams understand codebases better, identify patterns, and follow best practices.

## Features ✨

- **Repository Analysis** - Get comprehensive insights about any GitHub repository
  - Code hotspots and complexity analysis
  - Language statistics and tech stack insights
  - Development patterns and practices
  - Architecture and code organization assessment
  
- **AI-Powered Chat** - Interactive chat interface to ask questions about repositories
  - Query code structure and organization
  - Get explanations about specific files or patterns
  - Receive development recommendations
  
- **Development Playbook** - Extract team conventions and best practices
  - Code style and formatting conventions
  - Review and approval processes
  - Testing requirements
  - Documentation standards
  - Branch naming and commit message conventions

- **Team Assessment** - Evaluate code quality and development practices
  - Task-based assessment system
  - Language-specific feedback
  - Improvement roadmaps
  - Project-specific recommendations

## Getting Started 🛠️

1. Clone the repository
```bash
git clone <repository-url>
cd AIgnite
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables by creating a `.env.local` file:
```
GITHUB_ID=your_github_oauth_client_id
GITHUB_SECRET=your_github_oauth_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GROQ_API_KEY=your_groq_api_key
GITHUB_TOKEN=your_github_personal_access_token
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to start using AIgnite!

## Tech Stack 💻

- [Next.js](https://nextjs.org/) - React framework for production
- [NextAuth.js](https://next-auth.js.org/) - Authentication for Next.js
- [Groq](https://groq.com/) - AI model for code analysis
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [MongoDB](https://www.mongodb.com/) - Database

## Architecture 🏗️

The project follows a modern Next.js 13+ structure with:
- `/app` - App router pages and API routes
- `/components` - Reusable React components
- `/lib` - Core business logic and utilities
- `/public` - Static assets
- `/functions` - Utility functions
- `/api` - API route handlers

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📝

[MIT License](https://opensource.org/licenses/MIT) - feel free to use this project for your own purposes.
