# PulNazorat — Moliyaviy nazorat ilovasi

React (Vite) + Tailwind CSS asosida qurilgan to'liq shaxsiy moliya boshqaruv paneli.
Backend API bilan ishlash uchun tayyor: Users, Wallets, Categories, Transactions,
Budgets, Debts, Goals.

## Texnologiyalar
- React 18 + Vite
- Tailwind CSS (dark/light mode, `class` strategiyasi)
- React Router DOM (himoyalangan marshrutlar)
- Context API (Auth va Theme uchun)
- Axios (`src/api/api.js` — baseURL va token interceptor)
- Framer Motion (animatsiyalar: modal, sahifa, kartalar)
- react-toastify (xabarnomalar)
- lucide-react (ikonkalar)

## O'rnatish

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL ni backend manzilingizga moslang
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

## Muhit o'zgaruvchisi

`.env` faylida:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Loyiha strukturasi

```
src/
  api/            -> axios instance va har bir resurs uchun service (usersService.js va h.k.)
  context/        -> AuthContext (login/register/logout/user), ThemeContext (dark/light)
  routes/         -> ProtectedRoute (token bo'lmasa /login ga yo'naltiradi)
  components/
    Layout/       -> Sidebar, Navbar, MainLayout (hamburger menyu, responsive)
    UI/           -> Button, Input, Select, Card, Modal, ConfirmDialog, ProgressBar,
                     Skeleton, EmptyState, PageHeader — qayta ishlatiladigan komponentlar
  pages/          -> Login, Register, Dashboard, Transactions, Wallets, Categories,
                     Budgets, Goals, Debts, Profile, NotFound
  utils/format.js -> pul va sana formatlash funksiyalari
```

## Backend integratsiyasi haqida eslatma

Har bir `*Service.js` fayli backendingizdagi mos endpointlarga to'g'ridan-to'g'ri
mos keladi (masalan `walletsService.create` -> `POST /api/wallets`). Agar backend
javob formatlari (masalan `login` javobidagi token maydoni nomi) boshqacha bo'lsa,
`src/context/AuthContext.jsx` faylidagi `login`/`register` funksiyalarini biroz
moslashtirish kifoya.

## Dizayn eslatmasi

Interfeys "kvitansiya" (receipt) motividan foydalanadi — tranzaksiya va qarz
ro'yxatlarida punktir chiziq bilan ajratilgan qatorlar shakl beradi, bu moliyaviy
mavzuga mos keladi. Barcha pul summalari "tabular numbers" bilan (`.figure` klassi)
ko'rsatiladi, shunda raqamlar tekis ustunlarda joylashadi.
