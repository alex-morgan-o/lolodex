import { createRouter, createWebHistory } from "vue-router";
import { useSupabase } from "../composables/use-supabase";
import List from "../views/List.vue";
import Auth from "../views/Auth.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: List,
      meta: { requiresAuth: true },
    },
    {
      path: "/auth",
      name: "auth",
      component: Auth,
      meta: { requiresAuth: false },
    },
  ],
});

// Track if auth has been initialized
let authInitialized = false;
let authInitPromise: Promise<void> | null = null;

// Initialize auth session
async function initializeAuth() {
  if (authInitialized) return;
  if (authInitPromise) return authInitPromise;

  authInitPromise = (async () => {
    const supabase = useSupabase();
    // Wait for session to be restored from storage
    await supabase.auth.getSession();
    authInitialized = true;
  })();

  return authInitPromise;
}

// Navigation guard to check authentication
router.beforeEach(async (to, from, next) => {
  // Ensure auth is initialized before checking
  await initializeAuth();

  const supabase = useSupabase();

  // Check if route requires authentication
  const requiresAuth = to.meta.requiresAuth;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  if (requiresAuth && !isAuthenticated) {
    // Redirect to auth page if not authenticated
    next({ name: "auth" });
  } else if (!requiresAuth && isAuthenticated && to.name === "auth") {
    // Redirect to home if already authenticated and trying to access auth page
    next({ name: "home" });
  } else {
    // Allow navigation
    next();
  }
});

export default router;
