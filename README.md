# kostign

Статический сайт на Astro

| Ветка        | Адрес                  | Environment  |
| ------------ | ---------------------- | ------------ |
| `main`       | `https://<домен>`      | `production` |
| pull request | `https://test.<домен>` | `test`       |

## Устройство

```
src/pages/         [lang]/index.astro → /ru/, /en/, /el/; index.astro — переход на /en/ (defaultLanguage в src/lib/i18n.ts)
src/layouts/       общий шаблон: canonical, hreflang, JSON-LD, тема
src/components/    блоки страницы; icons/ — встроенные SVG
src/data/translations/  тексты по языкам; ru.json — эталон, ключи en/el сверяются при сборке
src/lib/           языки (i18n.ts), контакты (contact.ts), JSON-LD (seo.ts), праздники (events.ts)
src/scripts/       клиентский скрипт: раскрывает раздел, на который ведёт ссылка
src/styles/        стили: цвета OKLCH; тёмная тема по настройке системы (prefers-color-scheme)
.stylelintrc.json  stylelint-config-standard, классы kebab-case или BEM
public/            файлы, копируемые в сборку как есть (favicon, assets/)
astro.config.mjs   статическая сборка, формат directory
.nvmrc             версия Node для CI и локально (Astro 7: Node ≥ 22.23.4)
Makefile           dev, lint, build (dist/ → build/site.tar.gz), check, preview
.github/workflows/
  ci.yml           build → deploy (main → production, pull request → test)
  rollback.yml     production к сохранённому релизу без пересборки
```

## Локально

Node из `.nvmrc` (`nvm use` или `fnm use`).

```bash
make dev        # http://localhost:4321, перезагрузка при правке
make lint       # stylelint: src/**/*.css и <style> в .astro
make build      # npm ci + lint + astro build + check → build/site.tar.gz (то, что загружает CI)
make preview    # готовая сборка из dist/
```

## Контакты мастерской

Адрес, телефон и ссылка на карту — `src/lib/contact.ts`. Часы работы —
`contact.hours` в `src/data/translations/*.json` и
`openingHoursSpecification` в `src/lib/seo.ts`: при смене часов править
оба места.

## Праздничное оформление

Список праздников и дат — только `src/lib/events.ts`: `id`, `from`, `to`
в формате `MM-DD`, обе границы включительно. Если `from` > `to`, диапазон
переходит через Новый год. Скрипт в `<head>` (`src/components/EventScript.astro`)
берёт текущую дату по часовому поясу Europe/Nicosia и ставит
`<html data-event="<id>">` до отрисовки страницы. Вне дат атрибута нет, и
сайт выглядит как обычно.

Новый праздник:

1. запись в `events` (`src/lib/events.ts`);
2. иконка в `src/components/icons/` и строка в `icons`
   (`src/components/EventIcons.astro`): без неё не пройдёт проверка типов;
3. в `src/styles/site.css`, раздел Holidays: `html[data-event="<id>"]` с
   `--accent` и правило, показывающее `.event-icon--<id>`.

Праздник меняет только `--accent` и иконку у названия; светлая и тёмная
темы по-прежнему следуют настройке системы.

## Адрес сайта

Адрес в коде не пишется. Сборка берёт его из переменной окружения
`SITE_URL` (`astro.config.mjs` → `site`), в коде он доступен как
`Astro.site` (объект `URL`):

```astro
---
const ogImage = Astro.site && new URL("/og.png", Astro.site);
---
```

Без `SITE_URL` `Astro.site` — `undefined`: код должен это допускать (так
собирается, например, локальный запуск). Адрес
используется для `<link rel="canonical">`, `hreflang` и JSON-LD в
`src/layouts/Base.astro`.
Неверный URL останавливает сборку (`Invalid URL`).

```bash
SITE_URL=https://<домен> make build
```

CI берёт адрес из переменных репозитория: push в `main` — `SITE_URL`,
pull request — `SITE_TEST_URL`.

Обновление Astro: `npm install --save-exact astro@<версия>`, commit
`package.json` и `package-lock.json`. CI ставит зависимости только из
lock-файла (`npm ci`).

## Публикация

CI (`.github/workflows/ci.yml`):

1. `build`: Node из `.nvmrc`, `make build`, архив — artifact `site-<sha>`;
2. `deploy` (при `DEPLOY_ENABLED=true`): `ssh site@<IP> deploy <sha> <
build/site.tar.gz`. Ключ окружения задаёт, куда попадёт релиз: ключ
   `test` не может опубликовать production, а секреты `production`
   выдаются только запускам из `main`. Сервер распаковывает архив в новый
   каталог и атомарно переключает на него окружение; до этого отдаётся
   прежний релиз. В Summary прогона — список релизов, `*` — отдаваемый.

На сервере хранятся 3 последних релиза каждого окружения.

Откат production: Actions → rollback → Run workflow. Пустой `sha` — релиз
перед отдаваемым, иначе — сохранённый релиз этого коммита. Пересборки нет;
следующий push в `main` публикует новый релиз как обычно.
