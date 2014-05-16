
SRC = lib/*.js

include node_modules/make-lint/index.mk

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--harmony-generators \
		test/application \
		test/context/* \
		test/request/* \
		test/response/* \
		--bail

bench:
	@$(MAKE) -C benchmarks

.PHONY: test bench
