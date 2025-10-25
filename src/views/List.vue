<script setup lang="ts">
import { ref, computed } from "vue";

interface ContentItem {
    id: string;
    topic: string;
    title: string;
    summary: string;
    people: string[];
    date: Date;
    tags: string[];
}

const searchQuery = ref("");
const selectedFilter = ref("all");

const contentItems = ref<ContentItem[]>([
    {
        id: "1",
        topic: "Product Strategy",
        title: "Q4 Planning Meeting Notes",
        summary: "Discussion of key initiatives and resource allocation for Q4",
        people: ["Sarah Chen", "Mike Johnson"],
        date: new Date("2024-10-20"),
        tags: ["strategy", "planning", "urgent"],
    },
    {
        id: "2",
        topic: "Customer Feedback",
        title: "User Experience Survey Results",
        summary: "Analysis of user satisfaction scores and improvement areas",
        people: ["Alex Rivera", "Emma Watson"],
        date: new Date("2024-10-19"),
        tags: ["feedback", "ux", "research"],
    },
    {
        id: "3",
        topic: "Technical Documentation",
        title: "API Integration Guidelines",
        summary: "Step-by-step guide for third-party API implementation",
        people: ["David Kim"],
        date: new Date("2024-10-18"),
        tags: ["tech", "documentation", "api"],
    },
    {
        id: "4",
        topic: "Marketing Campaign",
        title: "Social Media Content Calendar",
        summary: "Scheduled posts and engagement strategy for next quarter",
        people: ["Lisa Park", "Tom Wilson", "Ana Garcia"],
        date: new Date("2024-10-17"),
        tags: ["marketing", "social", "content"],
    },
    {
        id: "5",
        topic: "Financial Report",
        title: "Monthly Budget Review",
        summary: "Overview of expenses, revenue, and variance analysis",
        people: ["Robert Brown"],
        date: new Date("2024-10-16"),
        tags: ["finance", "budget", "monthly"],
    },
]);

const filteredItems = computed(() => {
    return contentItems.value.filter((item) => {
        const matchesSearch =
            searchQuery.value === "" ||
            item.title
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
            item.topic
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
            item.tags.some((tag) =>
                tag.toLowerCase().includes(searchQuery.value.toLowerCase()),
            );

        return matchesSearch;
    });
});

const formatDate = (date: Date) => {
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

const getTagColor = () => {
    return "rgba(255, 255, 255, 0.08)";
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
        </div>

        <div class="content-grid">
            <!-- Always keep the header hidden from the user -->
            <div v-if="false" class="grid-header">
                <div class="header-cell title-col">Title</div>
                <div class="header-cell summary-col">Summary</div>
                <div class="header-cell date-col">Date</div>
                <div class="header-cell tags-col">Tags</div>
            </div>

            <div class="grid-body">
                <div
                    v-for="item in filteredItems"
                    :key="item.id"
                    class="grid-row"
                >
                    <div class="grid-cell title-col">
                        <div class="title-text">{{ item.title }}</div>
                    </div>

                    <div class="grid-cell summary-col">
                        <div class="summary-text">{{ item.summary }}</div>
                    </div>

                    <div class="grid-cell date-col">
                        <div class="date-text">{{ formatDate(item.date) }}</div>
                    </div>

                    <div class="grid-cell tags-col">
                        <div class="tags-list">
                            <span
                                v-for="tag in item.tags.slice(0, 3)"
                                :key="tag"
                                class="tag"
                                :style="{ backgroundColor: getTagColor(tag) }"
                            >
                                {{ tag }}
                            </span>
                            <span v-if="item.tags.length > 3" class="tag-count">
                                +{{ item.tags.length - 3 }}
                            </span>
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

.content-count {
    color: #888;
    font-size: 14px;
    font-weight: 300;
}

.content-grid {
    overflow: hidden;
}

.grid-header {
    display: grid;
    grid-template-columns: 2fr 3fr 1fr 1.5fr;
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

.grid-body {
    overflow-y: auto;
}

.grid-row {
    display: grid;
    grid-template-columns: 2fr 3fr 1fr 1.5fr;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition: background-color 0.2s ease;
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

.title-text {
    font-size: 14px;
    font-weight: 400;
    color: #fff;
    line-height: 1.4;
}

.summary-text {
    font-size: 13px;
    font-weight: 300;
    color: #aaa;
    line-height: 1.4;
}

.date-text {
    font-size: 13px;
    color: #888;
    font-weight: 400;
}

.tags-list {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
}

.tag {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    color: white;
    white-space: nowrap;
}

.tag-count {
    font-size: 11px;
    color: #888;
    font-weight: 500;
}

@media (max-width: 1024px) {
    .grid-header,
    .grid-row {
        grid-template-columns: 2fr 3fr 1fr 1.5fr;
    }

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

    .tags-list {
        margin-bottom: 8px;
    }

    .date-text {
        font-size: 12px;
    }
}
</style>
