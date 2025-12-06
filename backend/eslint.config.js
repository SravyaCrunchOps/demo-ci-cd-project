import js from "@eslint/js";
import { defineConfig } from "eslint/config";

export default defineConfig([
    { 
        files: ["**/*.{js,mjs,cjs,jsx}"], 
        plugins: { js }, 
        extends: ["js/recommended"], 
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                console: "readonly",
                process: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
            },
        },
        rules: {
			"no-unused-vars": "warn",
			"no-undef": "warn",
		},
    },
]);
