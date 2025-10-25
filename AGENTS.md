# AGENTS.md

## Project Overview

It receives data via email, file uploads, and text messages. It extracts useful information from the provided data and automatically organizes it into a structured format for easy access and analysis. It also provides a user-friendly interface for viewing and managing the data. Users can easily search, filter, and sort the data, and can export it to various formats for further analysis.

This app is especially useful for businesses that need to manage large amounts of text data efficiently. It can help streamline workflows, reduce errors, and improve decision-making by providing a centralized platform for data storage and analysis.

## Framework Guidelines

**IMPORTANT**: This project uses Vue.js exclusively for the frontend. NEVER use React, React components, or React patterns. Always use:
- Vue 3 with Composition API and `<script setup>` syntax
- Vue-specific directives (`v-if`, `v-for`, `v-model`, etc.)
- Vue component lifecycle hooks (`onMounted`, `onUnmounted`, etc.)
- Vue reactive primitives (`ref`, `reactive`, `computed`, etc.)
- Vue router for navigation (if routing is needed)
- Vue-compatible UI libraries only
