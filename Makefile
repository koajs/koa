
test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--harmony-generators \
		test/context/* \
		test/request/* \
		test/response/* \
		--bail

bench:
	@$(MAKE) -C benchmarks

.PHONY: test bench
