# Lean proofs

The proposed first proof, `tests/proofs/HeadLength.lean`, models how Koa chooses
`Content-Length` for a `200 HEAD` response when the application has supplied no
explicit length. If Koa sends the header, its value must equal the number of
bytes the corresponding `GET` would send. [RFC 9110 §8.6](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.6)

| Body | Expected `Content-Length` on `HEAD` |
| --- | --- |
| Buffer containing `n` bytes | `n`, including `0` for an empty buffer |
| Stream of unknown length | Header omitted |

Koa once advertised 2 bytes for a stream that sent 5,000 bytes on `GET`.
The Lean proof would check the rule for every payload in these two cases.
The JavaScript regression test checks the header on an actual Koa response.
[Issue #2042](https://github.com/koajs/koa/issues/2042) · [Response tests](../unit/application/respond.test.js)

Once the proof exists, the proposed CI job would run the following command
from the repository root once per pull request, outside the Node.js version matrix.

```sh
lean tests/proofs/HeadLength.lean
```
