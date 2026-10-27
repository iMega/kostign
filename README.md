# kostign

Статический сайт на Astro

| Ветка        | Адрес                  | Environment  |
| ------------ | ---------------------- | ------------ |
| `main`       | `https://<домен>`      | `production` |
| pull request | `https://test.<домен>` | `test`       |

## Устройство

```
src/pages/         страницы: about.astro → /about/ (about/index.html)
src/layouts/       общий шаблон страниц
public/            файлы, копируемые в сборку как есть (favicon, robots.txt)
astro.config.mjs   статическая сборка, формат directory
.nvmrc             версия Node для CI и локально (Astro 7: Node ≥ 22.23.4)
Makefile           dev, build (dist/ → build/site.tar.gz), check, preview
.github/workflows/
  ci.yml           build → deploy (main → production, pull request → test)
  rollback.yml     production к сохранённому релизу без пересборки
```

## Локально

Node из `.nvmrc` (`nvm use` или `fnm use`).

```bash
make dev        # http://localhost:4321, перезагрузка при правке
make build      # npm ci + astro build + check → build/site.tar.gz (то, что загружает CI)
make preview    # готовая сборка из dist/
```

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
собирается, например, локальный запуск). Сейчас адрес
используется только для `<link rel="canonical">` в `src/layouts/Base.astro`.
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
