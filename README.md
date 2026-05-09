# 배우 프로필 웹앱

Next.js(App Router) 기반으로 만든 배우 프로필 사이트입니다.

- 공개 페이지: 배우 목록 + 배우 상세 프로필
- 관리자 페이지: 배우 프로필 등록/수정/삭제(CRUD)
- 저장소: Cloudflare R2 (프로필 JSON + 사진 파일)

## 1) 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속:

- 공개 페이지: `/`
- 관리자 페이지: `/admin`

## 2) 환경변수 설정

루트에 `.env.local` 파일을 만들고 아래 값을 채워주세요.

```env
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=...
CLOUDFLARE_R2_PUBLIC_BASE_URL=...
```

### 값 설명

- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare 계정 ID
- `CLOUDFLARE_R2_ACCESS_KEY_ID`: R2 API 토큰 Access Key
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`: R2 API 토큰 Secret Key
- `CLOUDFLARE_R2_BUCKET_NAME`: 사용할 R2 버킷명
- `CLOUDFLARE_R2_PUBLIC_BASE_URL`: 공개 이미지 URL 베이스(커스텀 도메인 권장)
  - 예: `https://cdn.your-domain.com`

## 3) R2 데이터 구조

- `actors/index.json`: 배우 ID 목록
- `actors/{actorId}.json`: 배우 상세 데이터
- `actors/{actorId}/photos/*`: 배우 사진 파일

## 4) Vercel 배포

1. Git 저장소를 Vercel에 연결
2. Project Settings > Environment Variables에 위 5개 환경변수 등록
3. Deploy

배포 후 관리자 페이지(`/admin`)에서 프로필 등록/수정/삭제를 하면, R2 데이터가 함께 반영됩니다.
