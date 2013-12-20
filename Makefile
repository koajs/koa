
test:
	@NODE_ENV=test \
		gnode ./node_modules/.bin/mocha \
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
