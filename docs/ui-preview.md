# UI 미리보기 배포

`.github/workflows/ui-preview.yml`은 `main` 브랜치의 프론트엔드만 빌드해 GitHub Pages에 배포한다. 이 빌드는 `VITE_MOCK_MODE=true`를 사용하므로 Spring 서버나 데이터베이스에 연결하지 않는다.

저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 한 번 설정하면 이후 `main` push마다 갱신된다. Actions 탭의 **UI Preview**에서 수동 실행도 가능하다.

로컬에서 같은 화면을 확인하려면 다음 명령을 사용한다.

```powershell
npm --prefix front run build -- --mode mock
npm --prefix front run preview -- --base /
```

목업 데이터는 `front/src/services/mockApi.ts`에서 관리한다. 일반 `npm run dev`와 기본 빌드는 기존 `/api` 서버를 계속 사용한다.

목업 로그인 계정은 `demo@contest.dev` / `demo1234`이다. 로그인 상태는 브라우저 탭의 세션 저장소에만 유지되며 서버로 전송되지 않는다.
