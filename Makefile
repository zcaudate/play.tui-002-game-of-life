init:
	pnpm install

dev:
	pnpm dev

run:
	node dist/main.js

package:
	pnpm package

release: package
	pnpm release