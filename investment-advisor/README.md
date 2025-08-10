מערכת Next.js בעברית (RTL) לחישוב והמלצת בנקים להשקעות, בהתאם לעמלות.

## הוראות הפעלה

התקינו תלויות והריצו שרת פיתוח:

```bash
npm install
npm run dev
```

פתחו את `http://localhost:3000` בדפדפן.

עריכת העמוד הראשי מתבצעת בקובץ `src/app/page.tsx`. השינויים נטענים אוטומטית.

הפרויקט משתמש בפונט Google `Assistant` ותומך RTL מלא.

## מבנה ולוגיקה

- `src/types/` - טיפוסים (`BankCommission`, `InvestmentData` ...)
- `src/lib/` - חישובי עמלות, המרת נתוני בנק, ושמירה ב-LocalStorage
- `src/app/api/banks/route.ts` - קריאת קבצי JSON מתיקיית `data/banks/` והחזרתם כתצורה אחידה
- `src/components/investment-advisor.tsx` - קומפוננטת המערכת: קלטי סכומים והצגת 5 ההמלצות הזולות

## נתוני בנקים

שימו קבצי JSON בפורמט הבנק בתיקייה `data/banks/` בשם `<bankId>.json`. ה-API יקרא אותם וימיר לפורמט `BankCommission`.
