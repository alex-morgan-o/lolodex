<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "../composables/use-auth";
import { useRouter } from "vue-router";

const router = useRouter();
const { signIn, signUp, isAuthenticated } = useAuth();

// Redirect to home if already authenticated
onMounted(() => {
    if (isAuthenticated.value) {
        router.push("/");
    }
});

const isSignUp = ref(false);
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);

const handleSubmit = async () => {
    error.value = "";

    // Validation
    if (!email.value || !password.value) {
        error.value = "Please fill in all fields";
        return;
    }

    if (isSignUp.value && password.value !== confirmPassword.value) {
        error.value = "Passwords do not match";
        return;
    }

    if (password.value.length < 6) {
        error.value = "Password must be at least 6 characters";
        return;
    }

    loading.value = true;

    try {
        if (isSignUp.value) {
            await signUp(email.value, password.value);
            // Show success message for sign up
            alert(
                "Account created! Please check your email to verify your account.",
            );
        } else {
            await signIn(email.value, password.value);
        }
        // Redirect to home page after successful auth
        router.push("/");
    } catch (err: any) {
        error.value = err.message || "Authentication failed";
    } finally {
        loading.value = false;
    }
};

const toggleMode = () => {
    isSignUp.value = !isSignUp.value;
    error.value = "";
    password.value = "";
    confirmPassword.value = "";
};
</script>

<template>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1 class="auth-title">
                    {{ isSignUp ? "Create Account" : "Welcome Back" }}
                </h1>
                <p class="auth-subtitle">
                    {{
                        isSignUp
                            ? "Sign up to get started"
                            : "Sign in to continue"
                    }}
                </p>
            </div>

            <form @submit.prevent="handleSubmit" class="auth-form">
                <div class="form-group">
                    <label for="email" class="form-label">Email</label>
                    <input
                        id="email"
                        v-model="email"
                        type="email"
                        placeholder="you@example.com"
                        class="form-input"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="password" class="form-label">Password</label>
                    <input
                        id="password"
                        v-model="password"
                        type="password"
                        placeholder="••••••••"
                        class="form-input"
                        required
                    />
                </div>

                <div v-if="isSignUp" class="form-group">
                    <label for="confirmPassword" class="form-label"
                        >Confirm Password</label
                    >
                    <input
                        id="confirmPassword"
                        v-model="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        class="form-input"
                        required
                    />
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <button type="submit" class="submit-button" :disabled="loading">
                    {{
                        loading
                            ? "Loading..."
                            : isSignUp
                              ? "Sign Up"
                              : "Sign In"
                    }}
                </button>
            </form>

            <div class="auth-footer">
                <p class="toggle-text">
                    {{
                        isSignUp
                            ? "Already have an account?"
                            : "Don't have an account?"
                    }}
                    <button @click="toggleMode" class="toggle-button">
                        {{ isSignUp ? "Sign In" : "Sign Up" }}
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background-color: #27282d;
}

.auth-card {
    width: 100%;
    max-width: 420px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 40px;
}

.auth-header {
    text-align: center;
    margin-bottom: 32px;
}

.auth-title {
    font-size: 28px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 8px 0;
}

.auth-subtitle {
    font-size: 14px;
    color: #888;
    margin: 0;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-label {
    font-size: 13px;
    font-weight: 500;
    color: #aaa;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-input {
    width: 100%;
    height: 44px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0 16px;
    color: #ffffff;
    font-size: 15px;
    transition: border-color 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
}

.form-input::placeholder {
    color: #666;
}

.error-message {
    padding: 12px 16px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 13px;
    text-align: center;
}

.submit-button {
    width: 100%;
    height: 44px;
    background: rgba(255, 255, 255, 0.9);
    color: #000;
    border: none;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 8px;
}

.submit-button:hover:not(:disabled) {
    background: #ffffff;
    transform: translateY(-1px);
}

.submit-button:active:not(:disabled) {
    transform: translateY(0);
}

.submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.auth-footer {
    margin-top: 24px;
    text-align: center;
}

.toggle-text {
    font-size: 14px;
    color: #888;
    margin: 0;
}

.toggle-button {
    background: none;
    border: none;
    color: #ffffff;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    margin-left: 4px;
    font-size: 14px;
}

.toggle-button:hover {
    color: #ddd;
}

@media (max-width: 768px) {
    .auth-card {
        padding: 32px 24px;
    }

    .auth-title {
        font-size: 24px;
    }
}
</style>
