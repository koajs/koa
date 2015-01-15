iojs ?= node --harmony-generators
SRC = lib/*.js

include node_modules/make-lint/index.mk

TESTS = test/application \
	test/context/* \
	test/request/* \
	test/response/*

test:
	@NODE_ENV=test $iojs ./node_modules/.bin/mocha \
		--require should \
		$(TESTS) \
		--bail

test-cov:
	@NODE_ENV=test $iojs node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		-- -u exports \
		--require should \
		$(TESTS) \
		--bail

test-travis:
	@NODE_ENV=test $iojs node_modules/.bin/istanbul cover \
		./node_modules/.bin/_mocha \
		--report lcovonly \
		-- -u exports \
		--require should \
		$(TESTS) \
		--bail

bench:
	@$(MAKE) -C benchmarks

.PHONY: test bench
