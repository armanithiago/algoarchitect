// Isolated so only production code paths ever load the `virtual:pwa-register` module (it does not exist under Vitest).
export { registerSW } from "virtual:pwa-register";
