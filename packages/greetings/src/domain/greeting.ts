/**
 * Domain layer: pure functions, no I/O, no framework, no runtime imports
 * (enforced by dependency-cruiser rule `domain-is-pure`).
 */

export type Greeting = {
  readonly message: string;
};

/** Build the greeting for a person. Pure and total. */
export function greet(name: string): Greeting {
  return { message: `Hello, ${name}!` };
}
