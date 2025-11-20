import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,  // Keep default exclusions (node_modules, etc.)
      '**/dist/**',               // Exclude dist folder
      '**/build/**'               // Exclude build folder if you have one
    ]
  }
});
