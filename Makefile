init:
	pnpm install

dev:
	pnpm dev

package:
	pnpm package

release: package
	pnpm release