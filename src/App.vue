<script setup lang="ts">
import { onMounted } from "vue";
import { useAuth } from "./composables/use-auth";
import { RouterView } from "vue-router";

const { initAuth } = useAuth();

// Initialize authentication on app mount
onMounted(async () => {
    await initAuth();
});
</script>

<template>
    <div class="app">
        <main class="app-main">
            <RouterView />
        </main>
    </div>
</template>

<style>
.app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #27282d;
}

.app-main {
    flex: 1;
    width: 100%;
}

@media (max-width: 768px) {
    .header-content {
        padding: 12px 20px;
    }

    .app-title {
        font-size: 22px;
    }
}
</style>
