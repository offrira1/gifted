# Gifted – מתנות דיגיטליות לאירועים

אתר MVP לניהול מתנות דיגיטליות לחתונות ואירועים. בעל האירוע יוצר אירוע, משתף לינק/QR, ואורחים יכולים להביא מתנה (ברכה + סכום) ולבחור אמצעי תשלום (BIT, PayBox, PayPal, Google Pay, העברה בנקאית).

## טכנולוגיות

- **Next.js 15** (App Router) + TypeScript
- **TailwindCSS** + shadcn/ui + Framer Motion
- **Supabase** – Auth, Database, Storage
- **React Hook Form + Zod** – טפסים ולידציה
- **Zustand** – state קל
- **qrcode.react** – יצירת QR

## התקנה

### דרישות

- Node.js 18+
- חשבון Supabase

### שלבים

1. **שכפול והתקנת חבילות**

   ```bash
   cd Gifted
   npm install
   ```

2. **הגדרת משתני סביבה**

   העתק את הקובץ לדוגמה ו filled את הערכים:

   ```bash
   copy .env.example .env.local
   ```

   ב־`.env.local` הגדר:

   - `NEXT_PUBLIC_SUPABASE_URL` – כתובת הפרויקט ב-Supabase (Dashboard → Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` – מפתח anon public

   אופציונלי (למשל לפעולות שרת מתקדמות):

   - `NEXT_PUBLIC_APP_URL` – כתובת האתר (למשל `http://localhost:3000` או הדומיין בפרודקשן) – משמש ל-QR ולינקים.

3. **הגדרת Supabase**

   - **פרויקט:** צור פרויקט חדש ב-[Supabase](https://supabase.com).

   - **טבלאות ומיגרציות:**  
     הרץ את קבצי ה-SQL מתיקיית `supabase/migrations` לפי הסדר:
     - `20250214000000_initial_schema.sql` – טבלאות `events`, `gifts` ו-RLS
     - `20250214000001_storage.sql` – bucket `event-media` ומדיניות Storage

   ניתן להריץ דרך Supabase Dashboard → SQL Editor, או עם Supabase CLI:

   ```bash
   npx supabase db push
   ```

   - **Storage:**  
     אחרי המיגרציה, bucket בשם `event-media` אמור להיווצר. וודא שההרשאות (להעלאה וקריאה) מתאימות לפי ה-policies ב־`20250214000001_storage.sql`.

4. **הרצת פיתוח**

   ```bash
   npm run dev
   ```

   האתר זמין ב־`http://localhost:3000`.

## חשבון הדגמה (Demo)

1. **יצירת משתמש:**  
   היכנס ל־`/admin/login` ולחץ "אין לך חשבון? הירשם". מלא אימייל וסיסמה (לפחות 6 תווים) ורשום. אם Supabase מוגדר לאישור אימייל, אשר את המייל לפני ההתחברות.

2. **התחברות:**  
   התחבר עם האימייל והסיסמה שיצרת.

3. **אירוע חדש:**  
   ב־`/admin` לחץ "אירוע חדש", מלא את הטופס (סוג אירוע, פרטי בעל האירוע, פרטי בנק, תאריך ושעה וכו') ושמור.

4. **דף אירוע ו-QR:**  
   בלחיצה על "כנס לאירוע" נפתח דף ציבורי עם QR ולינק לזרימת אורח. סריקת ה-QR או כניסה ל־`/g/[eventId]` מאפשרת לאורח למלא ברכה, סכום ולבחור אמצעי תשלום (דמו).

5. **דוח תשלומים:**  
   ב־`/admin/events/[id]/stats` מוצגת טבלת תשלומים עם פילטרים וכפתור "הורד דוח CSV".

## מבנה נתונים (DB)

- **events** – אירועים (בעלים, סוג, תאריך, מיקום, פרטי בנק, טקסט ברוכים הבאים, קאבר וכו').
- **gifts** – מתנות/ברכות (אירוע, שם נותן, ברכה, פרטי משלם, סכום, אמצעי תשלום, סטטוס, קישור למדיה).

פרטי בנק נשמרים ב־events ומוצגים רק במסך "העברה בנקאית" בזרימת האורח, ורק לבעל האירוע יש גישה מלאה לנתונים.

## אבטחה

- RLS (Row Level Security) מופעל על הטבלאות; רק בעל האירוע רואה את האירועים והמתנות שלו.
- דפי `/admin` (מלבד `/admin/login`) דורשים התחברות; middleware מפנה לא־מחוברים ל־`/admin/login`.
- הגבלת גודל והרשאות להעלאת קבצים ב-Storage (לפי המיגרציה).

## סקריפטים

- `npm run dev` – שרת פיתוח
- `npm run build` – בנייה לפרודקשן
- `npm run start` – הרצת הפרויקט אחרי build
- `npm run lint` – בדיקות ESLint

## רישיון

פרויקט זה נוצר כ-MVP. שימוש חופשי בהתאם לצרכי הפרויקט.
