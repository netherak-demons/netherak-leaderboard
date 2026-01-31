This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Netherak API Configuration
NETHERAK_API_KEY=your_api_key_here

# Backoffice Password (hashed)
# Generate hash using: node scripts/generate-password-hash.js <password>
BACKOFFICE_PASSWORD_HASH=hash:salt

# Sequence Wallet Configuration (optional)
NEXT_PUBLIC_SEQUENCE_PROJECT_ACCESS_KEY=your_key_here
NEXT_PUBLIC_SEQUENCE_WAAS_CONFIG_KEY=your_key_here

# Development Mode
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 3. Generate Backoffice Password Hash

To generate a hashed password for the backoffice:

```bash
node scripts/generate-password-hash.js your_password
```

This will output the hash and salt that you need to add to `.env.local` as `BACKOFFICE_PASSWORD_HASH`.

**Alternative:** In development mode, you can also use the API endpoint:
```
GET http://localhost:3000/api/auth/backoffice?password=your_password
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Security Notes

- **Never commit `.env.local` to git** - it contains sensitive credentials
- The backoffice password is hashed using PBKDF2 (100,000 iterations) for security
- API keys should never be exposed to the client (use server-side only variables without `NEXT_PUBLIC_` prefix)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
