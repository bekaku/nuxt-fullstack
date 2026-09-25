# รีวิวโครงสร้างโปรเจ็ค (2026-09-25)

บันทึกจากการอ่าน working tree วันที่ระบุ (ต่อยอดรอบ 2026-09-24) ใช้เลือกจุดที่ต้องระวังก่อน
implement งานใหม่ โค้ดอาจเปลี่ยนหลังรีวิว ให้อ่านซอร์สที่เกี่ยวข้องซ้ำทุกครั้ง

## 1. ภาพรวมโครงสร้าง

| ส่วน | ที่อยู่ | หมายเหตุ |
|---|---|---|
| หน้าเว็บ | `app/pages/<kebab>/index.vue` + `[crud]/[id].vue` | ใช้ `useCrudList` / `useCrudForm` + `BaseTable` / `BaseForm` |
| HTTP client | `app/composables/useApi.ts`, `app/api/use*Api.ts` | cookie SSR, refresh อัตโนมัติ, toast จาก `message` |
| เมนู / สิทธิ์ฝั่ง UI | `app/composables/useMenu.ts`, `useRbac.ts`, `v-rbac`, middleware `00/01/02` | เป็น UX เท่านั้น |
| API | `server/api/<camelCase>/{index.get,[id].get,index.post,[id].delete}.ts` | guard → Zod → Drizzle → `ResponseEntity` |
| Auth | `server/middleware/00.auth.ts`, `server/utils/{permission,jwt,password,loginRateLimit}.ts` | ไม่มี cookie = anonymous, handler ต้องตัดสินเอง |
| DB | `server/database/{schema,client,seed}.ts`, `drizzle/` | Snowflake bigint PK, soft delete ด้วย `auditFieldsSoftDelete()` |
| AI | `server/services/ai/`, `server/utils/ai/qdrant.ts`, `server/utils/tools/`, `server/api/{aiChat,aiDocumentMeta}/` | ไฟล์ / Ollama / Qdrant / PostgreSQL แยก failure domain |
| i18n | `i18n/locales/{en,th}/{app,base,error,helper,model}.json` | ไฟล์ต้องอยู่ใน `fileLangNames` ของ `nuxt.config.ts` |

กลไกสำคัญที่ agent มักพลาด: `crudName` แบบ PascalCase ตัวเดียวถูกแปลงเป็น 3 ชื่อ
(`pascalToKebab` → โฟลเดอร์หน้า, `pascalToCamelCase` → path API, `pascalToSnake` → prefix permission
ใน `BaseTable`/`BaseForm`) ถ้าไม่ตรงกัน ปุ่มจะหายหรือ request 404

## 2. สิ่งที่ทำได้ดี

- แยก layer ชัด ตาม feature จากหน้าไปถึงตารางได้ตรงไปตรงมา
- `paginate()` มี whitelist column, จำกัด page size 100, escape LIKE
- `serverException()` กัน error ของ driver รั่วไปถึง client
- Login มี dummy hash, rate limit, refresh rotation, revoke session ตอนเปลี่ยนรหัส
- `appUser/index.post.ts` ใช้ transaction และลบไฟล์เก่าหลัง commit — เป็นต้นแบบที่ดี

## 3. ประเด็นที่พบและสถานะการแก้ (แก้แล้ว 2026-09-25)

| ระดับ | ประเด็น | การแก้ |
|---|---|---|
| สูง | `fileManager/index.get.ts` และ `files-stream.get.ts` ไม่มี guard | ต้อง login; list เห็นเฉพาะไฟล์ตัวเอง เว้นแต่มี `file_manager_list`; stream ต้องเป็นเจ้าของหรือมี `file_manager_view` (`server/utils/files.ts`) |
| สูง | `fileManager/index.delete.ts` ไม่ตรวจเจ้าของ | ต้องเป็นเจ้าของหรือมี `file_manager_delete`; `?id=` ต้องเป็นตัวเลข; `deleteFileManager` ไม่แปลง 404 เป็น 500 แล้ว |
| สูง | `server/api/meta.ts` fetch URL ใดก็ได้ (SSRF) | ต้อง login + `server/utils/safeFetch.ts`: http(s) เท่านั้น, บล็อก IP private/loopback/link-local/metadata ทุก redirect, timeout 5 วินาที, จำกัด 1 MB, HTML เท่านั้น |
| สูง | ingest ซ้ำลบของเดิมก่อน | ยังแทนที่ตามชื่อไฟล์ (ตั้งใจไว้) แต่เปลี่ยนเป็น ingest ใหม่ให้สำเร็จก่อนแล้วค่อยลบของเก่า; เขียน PG ใน transaction; ถ้า Qdrant/PG ล้มจะลบ vector ใหม่ทิ้ง; ลบเอกสารผ่าน `deleteIngestedDocument` ที่ retry ได้ |
| สูง | `aiChat/stream.post.ts` log คำถามและ payload | เหลือ log แค่จำนวน hit + score และเฉพาะตอน dev |
| สูง | `server/api/test/**` (อ่าน/นำเข้า app_user จาก MySQL) ไม่มี guard | `requireDevEndpoint`: production ตอบ 404, dev ต้องมี `app_user_add` |
| กลาง | `test-socket-send.post.ts` ไม่มี guard และเชื่อ `senderId` จาก client | ต้อง login, validate ด้วย Zod, ใช้ `auth.sub` เป็น sender |
| กลาง | Upsert ใช้ `_add` หรือ `_edit` ได้ทั้งสองโหมด | `appUser`, `appRole`, `permission` เช็ค code ตามโหมดซ้ำหลัง parse body; ID ใน body ต้องเป็นตัวเลข; update ที่ไม่เจอ row ตอบ 404 |
| กลาง | `permission/*` แปลง 404 เป็น 500 และส่ง `error.message` ของ DB | เอา try/catch ที่กลืน error ออก, ใช้ `serverException`, ลบใน transaction, list คืน ID เป็น string |
| กลาง | `appRole/index.post.ts`, `aiChat/[id].put.ts` ส่ง `error.message` | ใช้ `serverException` |
| กลาง | `appRole/[id].delete.ts` ลบ role ที่ผูกผู้ใช้แล้วได้ 500 (FK) | ตอบ 409 พร้อมข้อความ; ลบใน transaction; 404 เมื่อไม่พบ |
| กลาง | `aiChat` ไม่กรอง `deleted` | กรองใน list, messages, update และ stream |
| กลาง | เมนูใช้ `file_manager_manage` ที่ไม่มีใน seed; เมนู AI ไม่มี permission | My drive ใช้ `file_manager_list` (ทั้งเมนูและหน้า); เมนู AI ใช้ `ai_document_meta_list` |
| กลาง | `validateID()` ไม่เช็คตัวเลข | เช็ค `^\d{1,20}$` → 400; เพิ่ม `assertNumericId()` |
| กลาง | Seed สร้าง role/admin ซ้ำ และ permission ซ้ำทุกครั้ง (`code` ไม่มี unique) | Seed idempotent: เพิ่มเฉพาะที่ขาด ไม่เปลี่ยนรหัสผ่าน admin |
| กลาง | `drizzle/` มี SQL ซ้ำเลข `0000`–`0003` | ลบ 4 ไฟล์ที่ไม่อยู่ใน journal (journal มีการเปลี่ยนแปลงเหล่านั้นครบแล้ว และอยู่ใน git history) |
| กลาง | Rate limit ใช้ memory | ประกาศ mount `nitro.storage['login-rate-limit']` พร้อมวิธีเปลี่ยนเป็น Redis; PM2 ตั้ง `instances: 1` จึงถูกต้องในปัจจุบัน — ต้องเปลี่ยน driver ก่อน scale |
| ต่ำ | Chat model hard-code | ย้ายไป runtime config `ollamaChatBaseUrl` / `ollamaChatModel` (`NUXT_OLLAMA_CHAT_*`), ค่า default เท่าเดิม |
| ต่ำ | `mapToAppUser` URL cover ผิด | ใช้ `cdnBase` เหมือน avatar |
| ต่ำ | import ที่ไม่ใช้ใน `favoriteMenu/*` | ลบออก |
| ต่ำ | i18n key ปน flat/nested, import alias ปนกัน | **ไม่แก้** — เปลี่ยน key เดิมจะทำให้ key compatibility พัง; SKILL กำหนดรูปแบบสำหรับโค้ดใหม่ (อยู่ใน `docs/OPEN_QUESTIONS.md`) |

พบระหว่างแก้: `pnpm typecheck` ใช้ไม่ได้ (TypeScript 7 กับ `vue-tsc` 3.3 ไม่เข้ากัน) — แก้แล้วโดยลด
TypeScript เป็น `^5.9.3` (และตั้ง Renovate ไม่ให้ขึ้น major) จากนั้นแก้ error เดิมที่ถูกซ่อนไว้ 165 จุด:
89 จุด import type (`verbatimModuleSyntax`) ใน 48 ไฟล์, ชนิดข้อมูลใน mock 74 จุด, `:name` ใน
`example/feed`, และบั๊กจริงใน `BaseVideoPlayerDetail.vue` ที่เรียก `formatDistanceFromNow` ผิดรูปแบบ
(วันที่แบบ "x นาทีที่แล้ว" แสดงผิด) — ตอนนี้ `pnpm typecheck` ผ่าน 0 error

## 4. การปรับ SKILL รอบนี้

- ทุก SKILL ใช้โครงเดียวกัน: ตารางไฟล์ → ตารางตัดสินใจ/กฎ → template โค้ดที่คัดจากไฟล์จริง → checklist ตอนจบ
- `nitro-backend`: template list/get/upsert/delete, ตาราง guard, รูปแบบ query param ของ `paginate` (`page`, `size`, `sort`, `_q`, `_keyword`), รายการไฟล์ที่ห้ามใช้เป็นต้นแบบ
- `drizzle-database`: template ตาราง, cheatsheet query/transaction, ตาราง bigint, ขั้นตอน migration และข้อจำกัดของ seed
- `nuxt-frontend`: กฎ `crudName` 3 ชื่อ, template หน้า list/form, client API helper, เมนู, ชนิด field ของ `BaseForm`
- `authentication-security`: แผนภาพ flow auth, ตารางเลือก guard, ขั้นตอนเพิ่ม permission, invariant, known gaps
- `fullstack-feature`: ตารางตั้งชื่อ + checklist 12 ขั้นตามลำดับไฟล์ พร้อม contract ที่ต้องตรงกันระหว่าง layer
- `ai-rag`: แผนภาพ ingestion/chat, config, กฎ failure domain และ vector dimension
- `testing-debugging`: ตารางเลือก check ตามชนิดงาน, ตาราง symptom → layer
- **ยกเลิกการรัน `pnpm lint` ในขั้นตอนตรวจของ agent** (แก้ใน `AGENTS.md`, ทุก SKILL, `project-map.md`, `REVIEW_CODE_BASE_PROMT.md`) — ตรวจด้วย `pnpm typecheck` (+ `pnpm build` เมื่อกระทบ runtime) และรัน lint เฉพาะเมื่อผู้ใช้สั่ง
