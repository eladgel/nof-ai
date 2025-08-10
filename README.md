# nof-ai
# מבנה פרויקט Next.js - מערכת המלצות השקעות

## 📁 מבנה התיקיות

```
investment-advisor/
├── 📁 app/
│   ├── 📄 layout.tsx                 # Layout ראשי עם RTL
│   ├── 📄 page.tsx                   # עמוד הבית - מערכת ההמלצות
│   ├── 📄 globals.css                # סגנונות גלובליים
│   └── 📁 api/
│       └── 📁 banks/
│           └── 📄 route.ts          # API endpoint לנתוני בנקים
├── 📁 components/
│   ├── 📁 ui/                       # shadcn/ui components
│   │   ├── 📄 button.tsx
│   │   ├── 📄 card.tsx
│   │   ├── 📄 input.tsx
│   │   ├── 📄 label.tsx
│   │   ├── 📄 select.tsx
│   │   ├── 📄 badge.tsx
│   │   └── 📄 separator.tsx
│   ├── 📄 investment-advisor.tsx     # הקומפוננט הראשי
│   ├── 📄 bank-selector.tsx          # בחירת בנק
│   ├── 📄 recommendations.tsx        # רשימת המלצות
│   └── 📄 fee-calculator.tsx         # מחשבון עמלות
├── 📁 lib/
│   ├── 📄 utils.ts                   # פונקציות עזר
│   ├── 📄 bank-data.ts              # נתוני הבנקים
│   ├── 📄 fee-calculator.ts         # לוגיקת חישוב עמלות
│   └── 📄 storage.ts                # ניהול LocalStorage
├── 📁 types/
│   └── 📄 index.ts                   # הגדרות טיפוסים
├── 📁 data/
│   └── 📁 banks/                     # קבצי JSON של הבנקים
│       ├── 📄 1107.json             # בנק לאומי
│       ├── 📄 1115.json             # בנק דיסקונט
│       ├── 📄 1123.json             # בנק הפועלים
│       └── 📄 ...                   # שאר הבנקים
├── 📁 public/
│   └── 📁 logos/                     # לוגואים של בנקים
├── 📄 package.json
├── 📄 next.config.js
├── 📄 tailwind.config.js
├── 📄 tsconfig.json
├── 📄 components.json               # תצורת shadcn/ui
└── 📄 README.md
```

## 🚀 הוראות התקנה והפעלה

### 1. יצירת פרויקט חדש

```bash
npx create-next-app@latest investment-advisor --typescript --tailwind --eslint --app
cd investment-advisor
```

### 2. התקנת shadcn/ui

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button input label select badge separator
```

### 3. התקנת ספריות נוספות

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install -D @types/node
```

## 📄 קבצי הקונפיגורציה

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // תמיכה ב-RTL
  i18n: {
    locales: ['he'],
    defaultLocale: 'he',
  },
}

module.exports = nextConfig
```

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ['Assistant', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### `app/layout.tsx`
```typescript
import './globals.css'
import type { Metadata } from 'next'
import { Assistant } from 'next/font/google'

const assistant = Assistant({ 
  subsets: ['hebrew'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'מערכת המלצות השקעות ישראלית',
  description: 'השוו עמלות בנקים וקבלו המלצות מותאמות אישית לתיק ההשקעות שלכם',
  keywords: ['השקעות', 'בנקים', 'עמלות', 'ייעוץ פיננסי', 'ישראל'],
  authors: [{ name: 'Investment Advisor System' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl">
      <body className={assistant.className}>
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}
```

### `app/page.tsx`
```typescript
import InvestmentAdvisor from '@/components/investment-advisor'

export default function Home() {
  return <InvestmentAdvisor />
}
```

### `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;500;600;700;800&display=swap');

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

/* RTL specific styles */
[dir="rtl"] {
  direction: rtl;
}

[dir="rtl"] .text-right {
  text-align: right;
}

[dir="rtl"] .text-left {
  text-align: left;
}

/* Custom animations for Hebrew text */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hebrew number formatting */
.hebrew-numbers {
  font-feature-settings: "lnum" 1;
}
```

### `types/index.ts`
```typescript
export interface BankCommission {
  id: string;
  name: string;
  logo: string;
  israeliStocksRate: number;
  israeliStocksMin: number;
  israeliStocksMax: number;
  foreignStocksRate: number;
  foreignStocksMin: number;
  foreignStocksMax: number;
  managementFeeIsraeli: number;
  managementFeeForeign: number;
  exceptional?: boolean;
  exceptionalMessage?: string;
}

export interface InvestmentData {
  currentBank: string;
  israeliAmount: number;
  foreignAmount: number;
}

export interface Recommendation {
  bank: BankCommission;
  totalFee: number;
  savings: number;
  savingsPercentage: number;
  breakdown: {
    israeliFee: number;
    foreignFee: number;
    managementFee: number;
  };
}

export interface CommissionTableRow {
  HasNoService: number;
  DescHeb: string;
  Cols: (string | null)[];
}

export interface BankJsonData {
  Name: string;
  Logo: string;
  Comment: string;
  ExceptionalMessage: string;
  Exceptional: boolean;
  CommisionTaarifon: {
    DateUpdate: string;
    Comment: string | null;
    TableRow: CommissionTableRow[];
    TableHeader: string[];
  };
}
```

### `lib/bank-data.ts`
```typescript
import { BankCommission, BankJsonData } from '@/types';

// Function to parse bank JSON data to our format
export function parseBankData(jsonData: BankJsonData, id: string): BankCommission {
  const commissionRows = jsonData.CommisionTaarifon.TableRow;
  
  // Find relevant commission rows
  const israeliStocksRow = commissionRows.find(row => 
    row.DescHeb.includes('ני"ע ישראלים: מניות, אג"ח')
  );
  
  const foreignStocksRow = commissionRows.find(row => 
    row.DescHeb.includes('ני"ע בחו"ל') && row.DescHeb.includes('מניות, אג"ח')
  );
  
  const managementIsraeliRow = commissionRows.find(row => 
    row.DescHeb.includes('דמי ניהול') && row.DescHeb.includes('ישראל')
  );
  
  const managementForeignRow = commissionRows.find(row => 
    row.DescHeb.includes('דמי ניהול') && row.DescHeb.includes('חו"ל')
  );

  // Parse commission data
  const parseCommissionString = (str: string): { rate: number; min: number; max: number } => {
    const rate = parseFloat(str.match(/(\d+\.?\d*)\s*%/)?.[1] || '0');
    const min = parseFloat(str.match(/(\d+\.?\d*)\s*₪/)?.[1] || str.match(/(\d+\.?\d*)\s*\$/)?.[1] || '0');
    const max = 0; // Will be parsed from max column
    return { rate, min, max };
  };

  return {
    id,
    name: jsonData.Name,
    logo: jsonData.Logo,
    israeliStocksRate: israeliStocksRow ? parseCommissionString(israeliStocksRow.Cols[0] || '').rate : 0,
    israeliStocksMin: israeliStocksRow ? parseCommissionString(israeliStocksRow.Cols[1] || '').min : 0,
    israeliStocksMax: israeliStocksRow ? parseCommissionString(israeliStocksRow.Cols[2] || '').min : 0,
    foreignStocksRate: foreignStocksRow ? parseCommissionString(foreignStocksRow.Cols[0] || '').rate : 0,
    foreignStocksMin: foreignStocksRow ? parseCommissionString(foreignStocksRow.Cols[1] || '').min : 0,
    foreignStocksMax: foreignStocksRow ? parseCommissionString(foreignStocksRow.Cols[2] || '').min : 0,
    managementFeeIsraeli: managementIsraeliRow ? parseCommissionString(managementIsraeliRow.Cols[0] || '').rate : 0,
    managementFeeForeign: managementForeignRow ? parseCommissionString(managementForeignRow.Cols[0] || '').rate : 0,
    exceptional: jsonData.Exceptional,
    exceptionalMessage: jsonData.ExceptionalMessage
  };
}

// Static bank data (can be replaced with dynamic loading from JSON files)
export const banksData: BankCommission[] = [
  // Data will be populated from your JSON files
];
```

### `lib/fee-calculator.ts`
```typescript
import { BankCommission } from '@/types';

export function calculateTradingFee(
  bank: BankCommission, 
  amount: number, 
  type: 'israeli' | 'foreign'
): number {
  if (amount === 0) return 0;
  
  if (type === 'israeli') {
    if (bank.israeliStocksRate === 0) return 0;
    let fee = (amount * bank.israeliStocksRate) / 100;
    if (bank.israeliStocksMin > 0) fee = Math.max(fee, bank.israeliStocksMin);
    if (bank.israeliStocksMax > 0) fee = Math.min(fee, bank.israeliStocksMax);
    return fee;
  } else {
    if (bank.foreignStocksRate === 0) return 0;
    let fee = (amount * bank.foreignStocksRate) / 100;
    // Convert USD to ILS (approximate rate: 3.8)
    if (bank.foreignStocksMin > 0) fee = Math.max(fee, bank.foreignStocksMin * 3.8);
    if (bank.foreignStocksMax > 0) fee = Math.min(fee, bank.foreignStocksMax * 3.8);
    return fee;
  }
}

export function calculateManagementFee(
  bank: BankCommission, 
  israeliAmount: number, 
  foreignAmount: number
): number {
  const israeliFee = typeof bank.managementFeeIsraeli === 'number' 
    ? bank.managementFeeIsraeli > 10 
      ? bank.managementFeeIsraeli * 12 // Monthly fixed fee
      : (israeliAmount * bank.managementFeeIsraeli * 4) / 100 // Quarterly percentage
    : 0;
  
  const foreignFee = typeof bank.managementFeeForeign === 'number'
    ? bank.managementFeeForeign > 10
      ? bank.managementFeeForeign * 12 // Monthly fixed fee  
      : (foreignAmount * bank.managementFeeForeign * 4) / 100 // Quarterly percentage
    : 0;
  
  return israeliFee + foreignFee;
}

export function calculateTotalFee(
  bank: BankCommission,
  israeliAmount: number,
  foreignAmount: number
): number {
  const israeliFee = calculateTradingFee(bank, israeliAmount, 'israeli');
  const foreignFee = calculateTradingFee(bank, foreignAmount, 'foreign');
  const managementFee = calculateManagementFee(bank, israeliAmount, foreignAmount);
  
  return israeliFee + foreignFee + managementFee;
}
```

### `lib/storage.ts`
```typescript
import { InvestmentData } from '@/types';

const STORAGE_KEY = 'investmentData';

export function saveInvestmentData(data: InvestmentData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save investment data:', error);
  }
}

export function loadInvestmentData(): InvestmentData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load investment data:', error);
    return null;
  }
}

export function clearInvestmentData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear investment data:', error);
  }
}
```

### `package.json`
```json
{
  "name": "investment-advisor",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.290.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
```

## 🔄 הוראות הפעלה

1. **יצירת הפרויקט**:
   ```bash
   npx create-next-app@latest investment-advisor --typescript --tailwind --eslint --app
   cd investment-advisor
   ```

2. **התקנת התלויות**:
   ```bash
   npm install @radix-ui/react-select @radix-ui/react-slot class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
   ```

3. **הגדרת shadcn/ui**:
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add card button input label select badge separator
   ```

4. **העתקת הקבצים**:
   - העתק את כל הקבצים לפי המבנה שהוצג למעלה
   - שים את קבצי הJSON של הבנקים בתיקיית `data/banks/`

5. **הפעלת השרת**:
   ```bash
   npm run dev
   ```

המערכת תהיה זמינה בכתובת: `http://localhost:3000`

## ✨ תכונות המערכת

- 📊 **חישוב עמלות מדויק** בהתבסס על נתוני הבנקים האמיתיים
- 🎯 **המלצות מותאמות אישית** לפי גודל התיק וההרכב
- 💾 **שמירת נתונים מקומית** ללא שליחה לשרת
- 🌐 **תמיכה מלאה בעברית** עם RTL
- 📱 **עיצוב רספונסיבי** לכל המכשירים
- ⚡ **ביצועים מהירים** עם Next.js 14

כל מה שנותר לעשות הוא להעתיק את הקבצים למקומם, להתקין את התלויות ולהריץ את הפרויקט!



## Commit Message Guidelines
This project adheres to the Conventional Commits specification. Commit messages should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Type**: Must be one of the following:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Scope**: Optional, describes the part of the codebase affected.
**Description**: A concise summary of the change.
**Body**: Optional, provides additional contextual information.
**Footer(s)**: Optional, used for breaking changes or referencing issues.