(function (global) {
    'use strict';

    const config = global.PRAXISTRACK_CONFIG || {};
    const sessionKey = 'praxisTrack.session';
    let session = null;
    let configured = false;

    try {
        const storedSession = localStorage.getItem(sessionKey);
        session = storedSession ? JSON.parse(storedSession) : null;
    } catch {
        localStorage.removeItem(sessionKey);
    }

    const recoveryParams = new URLSearchParams(global.location.hash.slice(1));
    const isPasswordRecovery = recoveryParams.get('type') === 'recovery' && Boolean(recoveryParams.get('access_token'));
    if (isPasswordRecovery) {
        const expiresIn = Number(recoveryParams.get('expires_in') || 3600);
        session = {
            access_token: recoveryParams.get('access_token'),
            refresh_token: recoveryParams.get('refresh_token'),
            token_type: recoveryParams.get('token_type') || 'bearer',
            expires_in: expiresIn,
            expires_at: Math.floor(Date.now() / 1000) + expiresIn
        };
        localStorage.setItem(sessionKey, JSON.stringify(session));
        history.replaceState(null, '', `${global.location.pathname}${global.location.search}`);
    }

    function saveSession(nextSession) {
        session = nextSession;
        if (nextSession) {
            localStorage.setItem(sessionKey, JSON.stringify(nextSession));
        } else {
            localStorage.removeItem(sessionKey);
        }
        global.dispatchEvent(new CustomEvent('praxistrack:session', { detail: session }));
    }

    function ensureConfigured() {
        if (!configured) {
            throw new Error('Configura supabaseUrl y supabaseAnonKey en frontend/js/config.js para habilitar autenticación.');
        }
    }

    async function authRequest(path, { method = 'POST', body, token } = {}) {
        ensureConfigured();
        const headers = {
            apikey: config.supabaseAnonKey
        };

        if (body !== undefined) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        let response;
        try {
            response = await fetch(`${config.supabaseUrl.replace(/\/+$/, '')}/auth/v1/${path}`, {
                method,
                headers,
                body: body === undefined ? undefined : JSON.stringify(body)
            });
        } catch {
            throw new Error('No se pudo conectar con Supabase Auth. Comprueba el Project URL y la conexión.');
        }

        const responseText = await response.text();
        let result = {};
        if (responseText) {
            try {
                result = JSON.parse(responseText);
            } catch {
                throw new Error('Supabase devolvió una respuesta que no es JSON válido.');
            }
        }

        if (!response.ok) {
            throw new Error(result.msg || result.message || result.error_description || result.error || `Supabase respondió con HTTP ${response.status}.`);
        }

        return result;
    }

    async function refreshSession() {
        if (!session?.refresh_token) return null;
        try {
            const refreshed = await authRequest('token?grant_type=refresh_token', {
                body: { refresh_token: session.refresh_token }
            });
            saveSession(refreshed);
            return refreshed;
        } catch (error) {
            saveSession(null);
            throw error;
        }
    }

    async function getSession() {
        if (!session) return null;
        if (session.expires_at && session.expires_at * 1000 < Date.now() + 30_000) {
            return refreshSession();
        }
        return session;
    }

    const auth = {
        isConfigured: configured,
        isPasswordRecovery,
        async getSession() {
            return getSession();
        },
        async getAccessToken() {
            const currentSession = await getSession();
            return currentSession?.access_token || null;
        },
        async signIn(email, password) {
            const result = await authRequest('token?grant_type=password', {
                body: { email, password }
            });
            saveSession(result);
            return result;
        },
        async signUp({ email, password, nombreCompleto, documentoIdentidad }) {
            const result = await authRequest('signup', {
                body: {
                    email,
                    password,
                    data: {
                        nombre_completo: nombreCompleto,
                        documento_identidad: documentoIdentidad
                    }
                }
            });
            if (result.access_token) {
                saveSession(result);
            }
            return result;
        },
        async resetPassword(email) {
            const redirectTo = `${global.location.origin}${global.location.pathname.replace(/[^/]*$/, 'auth.html')}`;
            await authRequest(`recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
                body: { email }
            });
        },
        async updatePassword(password) {
            const currentSession = await getSession();
            if (!currentSession?.access_token) {
                throw new Error('El enlace de recuperación expiró. Solicita uno nuevo.');
            }
            const result = await authRequest('user', {
                method: 'PUT',
                token: currentSession.access_token,
                body: { password }
            });
            saveSession({ ...currentSession, user: result });
            return result;
        },
        async signOut() {
            const currentSession = await getSession();
            let signOutError;
            try {
                if (currentSession?.access_token) {
                    await authRequest('logout', { token: currentSession.access_token });
                }
            } catch (error) {
                signOutError = error;
            }
            saveSession(null);
            if (signOutError) {
                throw signOutError;
            }
            return true;
        },
        onSessionChange(listener) {
            global.addEventListener('praxistrack:session', event => listener(event.detail));
        }
    };

    configured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
    auth.isConfigured = configured;
    global.PraxisTrackAuth = auth;
    global.PraxisTrackAuthReady = Promise.resolve(auth);

    global.addEventListener('storage', event => {
        if (event.key !== sessionKey) return;
        try {
            session = event.newValue ? JSON.parse(event.newValue) : null;
        } catch {
            session = null;
        }
        global.dispatchEvent(new CustomEvent('praxistrack:session', { detail: session }));
    });
})(window);
