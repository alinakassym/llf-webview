# LLF Webview

Веб-приложение для отображения внутри [LLF Score](https://github.com/alinakassym/llf-score) в качестве WebView. Предоставляет дополнительные страницы и функциональность для основного мобильного приложения.

### Назначение
Это приложение разработано для интеграции с мобильным приложением LLF Score через WebView компонент. Позволяет использовать веб-технологии для определённых экранов и функций внутри нативного приложения.

**Стек технологий:**
- [React](https://react.dev/) 19.x
- [TypeScript](https://www.typescriptlang.org/) 5.x
- [Vite](https://vite.dev/) 7.x

---

## Требования
- Node.js LTS (рекомендуется 20.x)
- npm / pnpm / yarn

---

## Установка и запуск

```bash
# 1. Клонирование репозитория
git clone <repository-url>
cd llf-webview

# 2. Установка зависимостей
npm install

# 3. Запуск dev-сервера
npm run dev
```

📱 **Разработка**: приложение будет доступно по адресу `http://localhost:5173`

---

## Сборка

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

---

## Скрипты

```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

---

## Интеграция с LLF Score

Приложение предназначено для встраивания в мобильное приложение LLF Score через WebView. Убедитесь, что:
- Приложение адаптивно и работает на мобильных экранах
- Поддерживается работа на Android и iOS
- Учитываются особенности WebView (например, safe areas)

---

## Коммит-стиль

Мы придерживаемся [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: ...` — новая функциональность
- `fix: ...` — исправление ошибок
- `chore: ...` — изменения в инфраструктуре/конфиге
- `docs: ...` — документация
- `refactor: ...` — рефакторинг без изменения логики
