# kostign

Статический сайт на [Astro](https://astro.build), только статическая
сборка (`output: "static"`): на сервере нет Node, OpenResty отдаёт файлы.
Сервер, домены и TLS описаны в
[mygarage-infra](https://github.com/imega/mygarage-infra) (раздел
«Статический сайт»); этот репозиторий хранит только содержимое и CI.

| Ветка        | Адрес                   | Environment  |
| ------------ | ----------------------- | ------------ |
| `main`       | `https://<домен>`       | `production` |
| pull request | `https://test.<домен>`  | `test`       |

`test.` закрыт basic auth (логины myGarage), не индексируется и не
кэшируется. Pull request'ы делят один `test.`: показывается тот, что
обновлялся последним. Pull request из форка не публикуется — у него нет
секретов.

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

Ограничения сервера:

- только файлы и каталоги с `index.html` в корне, без symlink
  (`make check` проверяет то же до загрузки);
- архив до 50 MB, распакованный — до 200 MB: видео и крупные изображения
  не класть в репозиторий;
- `/page` отдаётся из `page/index.html` (`/page` → 301 → `/page/`);
  `build.format: "file"` (`page.html`) сервер не найдёт;
- `src/pages/404.astro` соберётся, но сервер её не показывает: на 404
  отдаётся страница OpenResty (нужен `error_page` в mygarage-infra).

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

## Настройка GitHub

Ключи и пользователь `site` на сервере создаются в mygarage-infra
(«Статический сайт → Включение»). Здесь — Settings → Environments, два
окружения с одинаковыми именами secrets:

| Environment  | Deployment branches        | `DEPLOY_SSH_KEY`                           |
| ------------ | -------------------------- | ------------------------------------------ |
| `production` | Selected branches → `main` | `pbcopy < ~/.ssh/mygarage-site-production` |
| `test`       | No restriction             | `pbcopy < ~/.ssh/mygarage-site-test`       |

В обоих:

| Secret               | Значение                                            |
| -------------------- | --------------------------------------------------- |
| `DEPLOY_HOST`        | IP сервера                                          |
| `DEPLOY_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 <IP> 2>/dev/null \| pbcopy` |

Settings → Secrets and variables → Actions → Variables → New repository
variable:

| Variable         | Значение               |
| ---------------- | ---------------------- |
| `DEPLOY_ENABLED` | `true`                 |
| `SITE_URL`       | `https://<домен>`      |
| `SITE_TEST_URL`  | `https://test.<домен>` |

`SITE_URL` и `SITE_TEST_URL` можно не задавать: сайт соберётся без
`Astro.site`. Все три — переменные репозитория, не environment:
`DEPLOY_ENABLED` проверяется до выбора окружения, а `build` выполняется
без окружения. Без `DEPLOY_ENABLED` CI только собирает архив.
