# Quran Hosting CRM

Next.js + Appwrite se bana complete Sales CRM system.

## Features

- **Leads Management** — Phone number, country, platform ke saath leads add/edit/delete karein
- **Call Logs** — WhatsApp aur Viki calls alag alag track karein (daily + monthly)
- **Daily Targets** — Agent ko lead ID range assign karein (e.g. lead_1 se lead_50 tak)
- **Trials** — Trial book karna, trial ka outcome (join/nahi) record karna
- **Students** — Joined students ki list, fee track karna (paid/pending)
- **Reports** — Monthly analytics: leads, calls, trials, students, total fee
- **Dashboard** — Overview with charts

---

## Setup Instructions

### 1. Project Install Karein

```bash
cd quran-hosting-crm
npm install
```

### 2. Appwrite Setup

1. [cloud.appwrite.io](https://cloud.appwrite.io) par account banayein
2. Naya project banayein: **"Quran Hosting CRM"**
3. **Databases** section mein jaayein → **Create Database**
   - ID: `quran_crm`
   - Name: `Quran Hosting CRM`

### 3. Collections Banayein

Database mein 3 collections banayein:

#### Collection 1: `leads`
| Attribute | Type | Required | Default |
|-----------|------|----------|---------|
| phone | String (size: 20) | Yes | — |
| country | String (size: 50) | Yes | — |
| platform | String (size: 30) | Yes | — |
| status | String (size: 20) | Yes | new |
| notes | String (size: 500) | No | — |
| assignedTo | String (size: 50) | No | — |
| trialDate | String (size: 20) | No | — |
| trialDone | Boolean | No | false |
| joinedDate | String (size: 20) | No | — |
| feeAmount | Integer | No | — |
| feePaid | Boolean | No | false |

#### Collection 2: `calls`
| Attribute | Type | Required |
|-----------|------|----------|
| leadId | String (size: 50) | Yes |
| agentId | String (size: 50) | Yes |
| agentName | String (size: 50) | Yes |
| callType | String (size: 20) | Yes |
| duration | Integer | No |
| date | String (size: 20) | Yes |
| notes | String (size: 300) | No |
| outcome | String (size: 30) | Yes |

#### Collection 3: `targets`
| Attribute | Type | Required |
|-----------|------|----------|
| agentId | String (size: 50) | Yes |
| agentName | String (size: 50) | Yes |
| date | String (size: 20) | Yes |
| leadIdFrom | String (size: 50) | Yes |
| leadIdTo | String (size: 50) | Yes |
| targetCalls | Integer | Yes |
| completed | Boolean | Yes |

### 4. Permissions Set Karein

Har collection ke settings mein jaayein → **Permissions** tab:
- Role: **Any** → ✅ Create, Read, Update, Delete

> ⚠️ Production mein user-specific permissions lagayein

### 5. .env.local Banayein

Project root mein `.env.local` file banayein:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=aapka_project_id_yahan
NEXT_PUBLIC_APPWRITE_DATABASE_ID=quran_crm
```

Project ID Appwrite dashboard mein Settings > General mein milega.

### 6. Run Karein

```bash
npm run dev
```

Browser mein kholein: [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── dashboard/     # Main dashboard with charts
│   ├── leads/         # Leads management
│   ├── calls/         # Call logs (WhatsApp + Viki)
│   ├── targets/       # Daily targets per agent
│   ├── trials/        # Trial tracking
│   ├── students/      # Students + fee management
│   ├── reports/       # Monthly analytics
│   └── admin/         # Setup guide
├── components/
│   └── ui/
│       └── Sidebar.tsx
└── lib/
    └── appwrite.ts    # All DB functions
```

---

## Tech Stack

- **Next.js 14** — App Router
- **Appwrite** — Database + Auth
- **Tailwind CSS** — Styling
- **Recharts** — Charts
- **date-fns** — Date formatting
- **react-hot-toast** — Notifications

---

## Lead Status Flow

```
New → Contacted → Trial Booked → Trial Done → Joined / Not Joined
                                             ↓
                                           Lost
```
