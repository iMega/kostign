SITE_DIR := dist
ARCHIVE := build/site.tar.gz

.PHONY: deps dev lint build check preview clean help

deps:
	npm ci

dev:
	npm run dev

# Stylelint over src/**/*.css and <style> in .astro (.stylelintrc.json).
lint:
	npm run lint:css

# The server (site-receive.sh in mygarage-infra) accepts only regular files
# and directories with index.html at the root; check fails the same way
# before the upload.
check:
	@test -f $(SITE_DIR)/index.html || { echo "$(SITE_DIR)/index.html is missing" >&2; exit 1; }
	@other=$$(find $(SITE_DIR) ! -type f ! -type d); \
		test -z "$$other" || { echo "only files and directories are allowed: $$other" >&2; exit 1; }

build: deps
	npm run lint:css
	npm run build
	$(MAKE) check
	mkdir -p $(dir $(ARCHIVE))
	tar --no-xattrs -czf $(ARCHIVE) -C $(SITE_DIR) .

preview:
	npm run preview

clean:
	rm -rf dist build .astro

help:
	@echo "Available targets:"
	@echo "  deps     - Install dependencies from package-lock.json"
	@echo "  dev      - Astro dev server with live reload"
	@echo "  lint     - Stylelint over src/ styles"
	@echo "  build    - Lint, build the site and pack $(SITE_DIR)/ into $(ARCHIVE) (what CI uploads)"
	@echo "  check    - Validate $(SITE_DIR)/ the way the server does"
	@echo "  preview  - Serve the built $(SITE_DIR)/"
	@echo "  clean    - Remove build output"
