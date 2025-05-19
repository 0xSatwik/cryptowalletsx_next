# WalletsX - Next.js Version

This is a Next.js implementation of the WalletsX multi-chain analytics platform.

## About WalletsX

WalletsX is a comprehensive multi-chain analytics platform providing wallet tracking and blockchain statistics across various networks including Monad, Linea, Soneium, and more.

## Features

- Multi-chain wallet statistics tracking
- Real-time balance monitoring across networks
- Protocol and chain interaction analysis
- Airdrop eligibility tracking
- Bulk wallet checking capabilities
- User-friendly statistics visualization
- Cross-chain transaction analysis

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - Reusable UI components
- `lib/` - Utility functions, API clients, and types
- `public/` - Static assets

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (for icons)
- Ethers.js (for blockchain interactions)

## API Integration

The application integrates with various blockchain APIs to fetch wallet statistics, token balances, NFT holdings, and more. The API clients are located in the `lib/` directory.

## License

This project is licensed under the MIT License. 