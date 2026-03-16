#!/bin/bash

# ============================================================
# Japan Travel Planner - GitHub 자동 설정 스크립트
# ============================================================

set -e

REPO_NAME="japan-travel-planner"
REPO_DESC="🗾 Claude AI 기반 일본 여행 일정 자동 생성 서비스"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🗾 Japan Travel Planner — GitHub 설정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# GitHub CLI 확인
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI(gh)가 설치되어 있지 않습니다."
  echo ""
  echo "설치 방법:"
  echo "  macOS:   brew install gh"
  echo "  Windows: winget install GitHub.cli"
  echo "  Linux:   https://github.com/cli/cli/releases"
  echo ""
  exit 1
fi

# Git 확인
if ! command -v git &> /dev/null; then
  echo "❌ git이 설치되어 있지 않습니다."
  exit 1
fi

# GitHub 로그인 확인
if ! gh auth status &> /dev/null; then
  echo "⚠️  GitHub에 로그인되어 있지 않습니다. 로그인을 진행합니다..."
  gh auth login
fi

echo "✅ GitHub CLI 인증 확인됨"

# .env 파일 생성 안내
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔑 Anthropic API 키 설정"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo ""
  read -p "  Anthropic API 키를 입력하세요 (sk-ant-...): " API_KEY
  if [ -n "$API_KEY" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s/your_anthropic_api_key_here/$API_KEY/" backend/.env
    else
      sed -i "s/your_anthropic_api_key_here/$API_KEY/" backend/.env
    fi
    echo "  ✅ API 키가 backend/.env에 저장되었습니다."
  else
    echo "  ⚠️  API 키를 나중에 backend/.env 파일에서 직접 설정해주세요."
  fi
else
  echo "  ✅ backend/.env 파일이 이미 존재합니다."
fi

# Git 초기화
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📦 Git 레포지토리 초기화"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -d ".git" ]; then
  git init
  echo "  ✅ Git 초기화 완료"
else
  echo "  ✅ 이미 Git 레포지토리입니다."
fi

# .gitignore 생성
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Environment
.env
backend/.env
*.env.local

# Build
frontend/build/
dist/

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
EOF

echo "  ✅ .gitignore 생성 완료"

# GitHub 레포지토리 생성
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 GitHub 레포지토리 생성"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "  레포지토리를 공개(public)로 만들까요? [y/N]: " IS_PUBLIC

if [[ "$IS_PUBLIC" =~ ^[Yy]$ ]]; then
  VISIBILITY="--public"
  echo "  📢 공개 레포지토리로 생성합니다."
else
  VISIBILITY="--private"
  echo "  🔒 비공개 레포지토리로 생성합니다."
fi

# GitHub repo 생성 시도
if gh repo create "$REPO_NAME" $VISIBILITY --description "$REPO_DESC" --source=. --remote=origin --push 2>/dev/null; then
  echo ""
  echo "  ✅ GitHub 레포지토리 생성 및 코드 푸시 완료!"
else
  # 이미 존재하는 경우 remote만 설정
  echo "  ℹ️  레포지토리가 이미 존재하거나 생성 오류. remote를 설정합니다..."
  GH_USER=$(gh api user --jq '.login' 2>/dev/null || echo "")
  if [ -n "$GH_USER" ]; then
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/$GH_USER/$REPO_NAME.git"
    git add -A
    git commit -m "🗾 Initial commit: Japan Travel Planner" 2>/dev/null || true
    git branch -M main
    git push -u origin main --force
    echo "  ✅ 코드 푸시 완료"
  fi
fi

# 의존성 설치
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📦 의존성 설치"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "  지금 npm 의존성을 설치할까요? [Y/n]: " DO_INSTALL

if [[ ! "$DO_INSTALL" =~ ^[Nn]$ ]]; then
  echo "  루트 의존성 설치 중..."
  npm install
  echo "  프론트엔드 의존성 설치 중..."
  cd frontend && npm install && cd ..
  echo "  백엔드 의존성 설치 중..."
  cd backend && npm install && cd ..
  echo "  ✅ 모든 의존성 설치 완료"
fi

# 완료
GH_USER=$(gh api user --jq '.login' 2>/dev/null || echo "your-username")
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 설정 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  📂 GitHub: https://github.com/$GH_USER/$REPO_NAME"
echo ""
echo "  🚀 개발 서버 실행:"
echo "     npm run dev"
echo ""
echo "  🌐 접속 주소:"
echo "     Frontend → http://localhost:3000"
echo "     Backend  → http://localhost:5000"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
