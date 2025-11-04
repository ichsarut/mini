# LINE LIFF App with Next.js

แอปพลิเคชัน LINE LIFF (LINE Front-end Framework) ที่สร้างด้วย Next.js

> **หมายเหตุเกี่ยวกับ Next.js Version:**
>
> - โปรเจกต์นี้ใช้ **Next.js 15** ซึ่งเป็นเวอร์ชันล่าสุด
> - Next.js 15 รองรับ LINE LIFF SDK ได้ดี (ไม่มีปัญหาเรื่อง compatibility)
> - หากต้องการใช้ **Next.js 14** (เวอร์ชันที่เสถียรกว่า) สามารถเปลี่ยนได้โดยแก้ไข `package.json`:
>   ```json
>   "next": "^14.2.0",
>   "eslint-config-next": "^14.2.0"
>   ```
> - **แนะนำ**: Next.js 15 ใช้งานได้ดีและมีฟีเจอร์ใหม่ ๆ แต่ Next.js 14 มีความเสถียรมากกว่า

## คุณสมบัติ

- ✅ เชื่อมต่อกับ LINE LIFF SDK
- ✅ เข้าสู่ระบบด้วย LINE Login
- ✅ แสดงข้อมูลโปรไฟล์ผู้ใช้
- ✅ ส่งข้อความผ่าน LINE (ในแอป LINE เท่านั้น)
- ✅ ตรวจสอบสถานะการเข้าสู่ระบบและการเปิดในแอป LINE

## การติดตั้ง

### 0. Git Repository (พร้อมใช้งานแล้ว)

โปรเจกต์นี้มี Git repository initialize แล้ว พร้อมกับ:

- ✅ `.gitignore` - ไฟล์ที่ Git จะ ignore
- ✅ `.gitattributes` - ตั้งค่าการจัดการ line endings

**คำสั่ง Git พื้นฐาน:**

```bash
# ตรวจสอบสถานะ
git status

# เพิ่มไฟล์ทั้งหมด
git add .

# Commit การเปลี่ยนแปลง
git commit -m "Your commit message"

# เชื่อมต่อกับ remote repository
git remote add origin <your-repo-url>

# Push ขึ้น remote
git push -u origin main
```

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. สร้าง LIFF App ใน LINE Developers Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ใหม่ (ถ้ายังไม่มี)
3. สร้าง Channel ใหม่ (เลือก Messaging API)
4. ไปที่แท็บ "LIFF" และคลิก "Add"
5. ตั้งค่า LIFF App:

   - **LIFF app name**: ชื่อแอปของคุณ
   - **Size**: Full (หรือ Compact/ Tall ตามต้องการ)
   - **Endpoint URL**: `https://your-domain.com` (สำหรับ development ใช้ ngrok หรือ tunnel)
   - **Scope**: `profile`, `openid`
   - **Bot feature**: เปิดใช้งาน (ถ้าต้องการส่งข้อความ)

6. คัดลอก **LIFF ID** ที่ได้

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local`:

```bash
cp .env.local.example .env.local
```

แก้ไขไฟล์ `.env.local` และเพิ่ม LIFF ID:

```env
NEXT_PUBLIC_LIFF_ID=your-liff-id-here
```

### 4. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 5. ทดสอบใน LINE App

เนื่องจาก LIFF ทำงานได้เฉพาะใน LINE app คุณต้อง:

1. ใช้ ngrok หรือ tunnel เพื่อเปิด localhost ให้ LINE เข้าถึงได้:

```bash
# ใช้ ngrok
ngrok http 3000
```

2. อัปเดต Endpoint URL ใน LINE Developers Console เป็น URL จาก ngrok
3. เปิด LIFF URL ใน LINE app (ผ่านเมนู Rich Menu หรือ Flex Message)

## โครงสร้างโปรเจกต์

```
.
├── app/
│   ├── layout.tsx          # Root layout with LIFF SDK script
│   ├── page.tsx            # หน้าแรกพร้อมตัวอย่างการใช้งาน
│   ├── globals.css         # Global styles
│   └── page.module.css     # Component styles
├── hooks/
│   └── useLiff.ts          # Custom hook สำหรับใช้งาน LIFF
├── lib/
│   └── liff.ts             # LIFF utility functions
├── package.json
├── tsconfig.json
└── next.config.js
```

## การใช้งาน

### ใช้ Hook useLiff

```tsx
import { useLiff } from "@/hooks/useLiff";

function MyComponent() {
  const { liff, loading, error, isLoggedIn, isInClient } = useLiff();

  // ...
}
```

### ใช้ LIFF Functions

```tsx
import { getProfile, login, logout, sendMessages } from "@/lib/liff";

// ดึงข้อมูลโปรไฟล์
const profile = await getProfile();

// เข้าสู่ระบบ
login();

// ออกจากระบบ
logout();

// ส่งข้อความ
await sendMessages([{ type: "text", text: "Hello!" }]);
```

## Build สำหรับ Production

```bash
npm run build
npm start
```

## Deploy บน Vercel

### วิธีที่ 1: Deploy ผ่าน Vercel Dashboard (แนะนำ)

1. **Push โค้ดขึ้น GitHub/GitLab/Bitbucket**

   ```bash
   # Git repository ถูก initialize แล้ว
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **เชื่อมต่อกับ Vercel**

   - ไปที่ [vercel.com](https://vercel.com)
   - คลิก "Add New..." → "Project"
   - Import repository จาก GitHub/GitLab/Bitbucket
   - Vercel จะตรวจจับ Next.js อัตโนมัติ

3. **ตั้งค่า Environment Variables**

   - ในหน้า Project Settings → Environment Variables
   - เพิ่ม `NEXT_PUBLIC_LIFF_ID` และใส่ค่า LIFF ID ของคุณ
   - เลือกทั้ง Production, Preview, และ Development

4. **Deploy**

   - คลิก "Deploy"
   - รอให้ build เสร็จ (ประมาณ 1-2 นาที)

5. **อัปเดต LIFF Endpoint URL**
   - คัดลอก URL ที่ Vercel ให้มา (เช่น `https://your-app.vercel.app`)
   - ไปที่ LINE Developers Console → LIFF → แก้ไข Endpoint URL

### วิธีที่ 2: Deploy ผ่าน Vercel CLI

1. **ติดตั้ง Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   - จะถามว่าต้องการเชื่อมต่อกับ project ใหม่หรือไม่ → กด Enter
   - ตั้งค่า Environment Variables เมื่อถาม

4. **Deploy Production**
   ```bash
   vercel --prod
   ```

### การตั้งค่า Domain Custom (ถ้าต้องการ)

1. ไปที่ Project Settings → Domains
2. เพิ่ม domain ที่ต้องการ
3. ทำตามคำแนะนำในการตั้งค่า DNS

### Environment Variables ที่ต้องตั้งค่าใน Vercel

- `NEXT_PUBLIC_LIFF_ID` - LIFF ID จาก LINE Developers Console

## หมายเหตุ

- LIFF ทำงานได้เฉพาะใน LINE app เท่านั้น (ไม่สามารถทดสอบในเบราว์เซอร์ปกติได้)
- สำหรับ development ใช้ ngrok หรือ tunnel เพื่อเปิด localhost ให้ LINE เข้าถึงได้
- ตรวจสอบให้แน่ใจว่า Endpoint URL ใน LINE Developers Console ตรงกับ URL ที่ deploy

## เอกสารเพิ่มเติม

- [LINE LIFF Documentation](https://developers.line.biz/en/docs/liff/)
- [Next.js Documentation](https://nextjs.org/docs)
- [LINE Developers Console](https://developers.line.biz/)

## License

MIT
