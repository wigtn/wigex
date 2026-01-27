# Discord 알림 설정 가이드

Git push/PR 이벤트 발생 시 Discord 채널로 알림을 받을 수 있습니다.

## 1단계: Discord 웹훅 생성

1. Discord 서버에서 알림 받을 채널 선택
2. **채널 설정** (톱니바퀴) → **연동** → **웹후크**
3. **새 웹후크** 클릭
4. 이름 설정 (예: "GitHub Bot")
5. **웹후크 URL 복사**

```
https://discord.com/api/webhooks/1234567890/abcdefg...
```

## 2단계: GitHub Secrets 설정

### 방법 A: 레포별 설정
1. GitHub 레포 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. Name: `DISCORD_WEBHOOK`
4. Value: 복사한 웹훅 URL 붙여넣기
5. **Add secret**

### 방법 B: Organization 전체 설정 (여러 레포 공유)
1. GitHub Organization → **Settings** → **Secrets and variables** → **Actions**
2. **New organization secret** 클릭
3. Name: `DISCORD_WEBHOOK`
4. Value: 웹훅 URL
5. Repository access: **All repositories** 또는 선택

## 3단계: Workflow 파일 복사

`.github/workflows/discord-notify.yml` 파일을 다른 레포에도 복사하면 됩니다.

```bash
# 다른 레포에서
mkdir -p .github/workflows
curl -o .github/workflows/discord-notify.yml \
  https://raw.githubusercontent.com/wigtn/wigtn-travel-helper/main/.github/workflows/discord-notify.yml
```

## 알림 예시

### Push 알림
```
🚀 Push to `main`
━━━━━━━━━━━━━━━━━━━
Commit: abc1234
Author: hong-gildong

feat(admin): Add admin dashboard

✓ Success
```

### PR 알림
```
📝 New PR: #42
━━━━━━━━━━━━━━━━━━━
Title: Add user authentication
Author: hong-gildong
Branch: feature/auth → main

[View PR](링크)
```

## 커스터마이징

### 특정 브랜치만 알림
```yaml
on:
  push:
    branches: [main]  # main만
```

### 특정 파일 변경 시만 알림
```yaml
on:
  push:
    paths:
      - 'src/**'
      - '!*.md'
```

### 알림 색상 변경
```yaml
color: 0x00ff00  # 초록
color: 0xff0000  # 빨강
color: 0x0099ff  # 파랑
color: 0x9333ea  # 보라
```

## 문제 해결

### 알림이 안 올 때
1. GitHub Actions 탭에서 워크플로우 실행 확인
2. Secrets에 `DISCORD_WEBHOOK` 설정 확인
3. 웹훅 URL이 유효한지 Discord에서 확인

### 테스트
```bash
# 터미널에서 직접 테스트
curl -H "Content-Type: application/json" \
  -d '{"content": "테스트 메시지입니다!"}' \
  "YOUR_WEBHOOK_URL"
```
