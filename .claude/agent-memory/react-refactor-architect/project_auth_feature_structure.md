---
name: Auth feature module structure
description: Estructura del módulo auth bajo src/features/auth/ con sub-secciones login y register
type: project
---

Auth feature was refactored from monolithic pages into feature-based architecture.

Structure:

- `src/features/auth/types.ts` — LoginFormData, RegisterFormData, UseLoginPageReturn, UseRegisterPageReturn, LoginFormProps, RegisterFormProps
- `src/features/auth/api.ts` — re-exports authApi from src/api/auth.api (no duplication)
- `src/features/auth/login/hooks/useLoginPage.ts` — all login business logic (form state, error handling, submit)
- `src/features/auth/login/components/LoginForm.tsx` — pure UI, receives LoginFormProps
- `src/features/auth/register/hooks/useRegisterPage.ts` — all register business logic
- `src/features/auth/register/components/RegisterForm.tsx` — pure UI, receives RegisterFormProps
- `src/features/auth/index.ts` — barrel exports

Pages (src/pages/LoginPage.tsx, RegisterPage.tsx) remain as orchestrators: they call the hook, handle guard redirects (isAuthLoading spinner, isAuthenticated Navigate), and render the form component. They do NOT contain form state or event handlers.

**Why:** Pure UI Rule — pages only orchestrate. Auth flow guards (loading spinner, Navigate redirect) stay in the page because they depend on router context (Navigate) which should not be inside a pure form component.

**How to apply:** When adding new auth-related pages (e.g., ForgotPassword), follow same sub-section pattern: `auth/forgot-password/hooks/useForgotPasswordPage.ts` + `auth/forgot-password/components/ForgotPasswordForm.tsx`.
