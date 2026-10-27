SITE_DIR := dist
ARCHIVE := build/site.tar.gz

.PHONY: deps dev build check preview clean help

deps:
	npm ci

dev:
	npm run dev

# The server (site-receive.sh in mygarage-infra) accepts only regular files
# and directories with index.html at the root; check fails the same way
# before the upload.
check:
	@test -f $(SITE_DIR)/index.html || { echo "$(SITE_DIR)/index.html is missing" >&2; exit 1; }
	@other=$$(find $(SITE_DIR) ! -type f ! -type d); \
		test -z "$$other" || { echo "only files and directories are allowed: $$other" >&2; exit 1; }

build: deps
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
	@echo "  build    - Build the site and pack $(SITE_DIR)/ into $(ARCHIVE) (what CI uploads)"
	@echo "  check    - Validate $(SITE_DIR)/ the way the server does"
	@echo "  preview  - Serve the built $(SITE_DIR)/"
	@echo "  clean    - Remove build output"
