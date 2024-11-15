import {type Context} from '../context.types.js';
/**
 * The next function caller in a Koa Middleware chain.
 * Always returns a promise and allows for fine grained middleware control flow.
 */
export type Next = () => Promise<unknown>;

/**
 * Composeable middleware.
 *
 * @param context - The Koa extended context object
 * @param next - The next function to be call the next next middleware in the middleware chain.
 */
export type Middleware<C = Context> = (
  /**
   * The Koa extended context object
   */
  context: C,
  /**
   * The next function to be call the next next middleware in the middleware chain.
   * Always returns a promise and allows for fine grained middleware control flow.
   *
   */
  next?: Next | undefined,
) => Promise<unknown>;
/**
 * Compose `middleware` returning
 * a fully valid middleware comprised
 * of all those which are passed.
 *
 * @param middleware - The middleware to be composed.
 */
export default function compose(middleware: Middleware[]): Middleware;
