<script setup lang="ts">
import { ref, computed } from "vue";
import { useProcessedEmails } from "../composables/use-processed-emails";
import { useRouter } from "vue-router";

const { records, loading, error } = useProcessedEmails();
const router = useRouter();

const searchQuery = ref("");

const filteredItems = computed(() => {
    if (!records.value) return [];

    return records.value.filter((record) => {
        const matchesSearch =
            searchQuery.value === "" ||
            record.title
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
            record.summary
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
            record.from_email
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
            record.to_email
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase());

        return matchesSearch;
    });
});

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
};
</script>

<template>
    <div class="list-container">
        <div class="list-header">
            <div class="search-section">
                <div class="search-wrapper">
                    <div class="search-icon">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search..."
                        class="search-input"
                    />
                </div>
            </div>
            <div class="actions-section">
                <button
                    @click="router.push('/settings')"
                    class="settings-button"
                    aria-label="Open settings"
                    title="Settings"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                    >
                        <path
                            d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                        />
                        <path
                            d="M19.4 15a7.5 7.5 0 0 0 .1-2 7.5 7.5 0 0 0-.1-2l2.1-1.6a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.5 1a7.5 7.5 0 0 0-1.73-1L14 2.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5L9.4 4.1a7.5 7.5 0 0 0-1.73 1l-2.5-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.1 1.6a7.5 7.5 0 0 0 0 4L2.19 15a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.5-1a7.5 7.5 0 0 0 1.73 1l.6 2.1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5l.6-2.1a7.5 7.5 0 0 0 1.73-1l2.5 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64Z"
                        />
                    </svg>
                </button>
            </div>
        </div>

        <div v-if="loading" class="loading-state">
            <div class="loading-text">Loading your emails...</div>
        </div>

        <div v-else-if="error" class="error-state">
            <div class="error-text">{{ error }}</div>
        </div>

        <div v-else-if="filteredItems.length === 0" class="empty-state">
            <div class="empty-text">
                {{
                    searchQuery
                        ? "No emails found matching your search"
                        : "No emails yet"
                }}
            </div>
        </div>

        <div v-else class="content-grid">
            <!-- Always keep the header hidden from the user -->
            <div v-if="false" class="grid-header">
                <div class="header-cell title-col">Title</div>
                <div class="header-cell summary-col">Summary</div>
                <div class="header-cell date-col">Date</div>
            </div>

            <div class="grid-body">
                <div
                    v-for="record in filteredItems"
                    :key="record.id"
                    class="grid-row"
                    role="button"
                    tabindex="0"
                    @click="router.push({ name: 'record', params: { id: record.id } })"
                    @keydown.enter="router.push({ name: 'record', params: { id: record.id } })"
                >
                    <div class="grid-cell title-col">
                        <div class="title-text">
                            {{ record.title || "Untitled" }}
                        </div>
                    </div>

                    <div class="grid-cell summary-col">
                        <div class="summary-text">
                            {{ record.summary || "No summary available" }}
                        </div>
                    </div>

                    <div class="grid-cell date-col">
                        <div class="date-text">
                            {{ formatDate(record.created_at) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.list-container {
    padding: 0 24px;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.search-section {
    flex: 1;
    max-width: 400px;
}

.search-wrapper {
    position: relative;
}

.search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    z-index: 1;
}

.search-input {
    width: 100%;
    height: 40px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0 16px 0 48px;
    color: #ffffff;
    font-size: 14px;
    transition: border-color 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.2);
}

.search-input::placeholder {
    color: #666;
}

.actions-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

.settings-button {
    width: 38px;
    height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border-radius: 50%;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
}

.settings-button:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
}

.settings-button:active {
    transform: scale(0.96);
}

.content-count {
    color: #888;
    font-size: 14px;
    font-weight: 300;
}

.loading-state,
.error-state,
.empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80px 24px;
    text-align: center;
}

.loading-text {
    color: #aaa;
    font-size: 14px;
    font-weight: 400;
}

.error-text {
    color: #ff6b6b;
    font-size: 14px;
    font-weight: 400;
}

.empty-text {
    color: #888;
    font-size: 14px;
    font-weight: 400;
}

.content-grid {
    overflow: hidden;
}

.grid-header {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.header-cell {
    padding: 16px 0;
    font-size: 11px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
}

.header-cell.title-col {
    width: calc(100% / 3);
    flex-shrink: 0;
}

.header-cell.summary-col {
    width: 50%;
    flex-shrink: 0;
}

.header-cell.date-col {
    width: calc(100% / 6);
    flex-shrink: 0;
}

.grid-body {
    overflow-y: auto;
}

.grid-row {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background-color 0.2s ease;
    cursor: pointer;
}

.grid-row:hover {
    background: rgba(255, 255, 255, 0.02);
}

.grid-row:last-child {
    border-bottom: none;
}

.grid-cell {
    padding: 12px 0;
    display: flex;
    align-items: center;
    min-height: 48px;
}

.grid-cell.title-col {
    width: 30%;
    flex-shrink: 0;
    padding-right: 16px;
}

.grid-cell.summary-col {
    width: 65%;
    flex-shrink: 0;
    padding-right: 16px;
}

.grid-cell.date-col {
    width: 5%;
    flex-shrink: 0;
    justify-content: flex-end;
}

.title-text {
    font-size: 14px;
    font-weight: 400;
    color: #fff;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.summary-text {
    font-size: 13px;
    font-weight: 300;
    color: #aaa;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.date-text {
    font-size: 13px;
    color: #888;
    font-weight: 400;
}

@media (max-width: 1024px) {
    .header-cell,
    .grid-cell {
        padding: 12px 20px;
    }
}

@media (max-width: 768px) {
    .list-container {
        padding: 24px 24px;
    }

    .list-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
    }

    .search-section {
        max-width: none;
    }

    .actions-section {
        justify-content: space-between;
    }

    .user-email {
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .content-grid {
        border-radius: 12px;
    }

    .grid-header {
        display: none;
    }

    .grid-row {
        display: block;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .grid-cell {
        padding: 0;
        margin-bottom: 12px;
        min-height: auto;
    }

    .grid-cell:last-child {
        margin-bottom: 0;
    }

    .title-text {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 12px;
    }

    .date-text {
        font-size: 12px;
    }
}
</style>
