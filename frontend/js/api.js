(function (global) {
    'use strict';

    const config = global.PRAXISTRACK_CONFIG || {};
    const apiBaseUrl = (config.apiBaseUrl || 'http://localhost:3000/api').replace(/\/+$/, '');

    function readStoredToken() {
        const explicitToken = config.accessToken || localStorage.getItem('praxisTrack.accessToken');
        if (explicitToken) return explicitToken;

        if (config.supabaseStorageKey) {
            const storedSession = localStorage.getItem(config.supabaseStorageKey);
            return storedSession ? readSessionToken(storedSession) : null;
        }

        const sessionKeys = Object.keys(localStorage).filter(key => /^sb-.+-auth-token$/.test(key));
        const tokens = sessionKeys
            .map(key => readSessionToken(localStorage.getItem(key)))
            .filter(Boolean);
        const uniqueTokens = [...new Set(tokens)];

        if (uniqueTokens.length > 1) {
            throw new Error('Hay varias sesiones de Supabase. Configura PRAXISTRACK_CONFIG.supabaseStorageKey.');
        }

        return uniqueTokens[0] || null;
    }

    function readSessionToken(serializedSession) {
        if (!serializedSession) return null;

        let session;
        try {
            session = JSON.parse(serializedSession);
        } catch {
            throw new Error('La sesión de Supabase guardada no tiene un formato válido.');
        }

        return (session.currentSession || session).access_token || null;
    }

    async function getAccessToken() {
        if (global.PraxisTrackAuth) {
            const token = await global.PraxisTrackAuth.getAccessToken();
            if (token) return token;
            throw new Error('Inicia sesión con Supabase para usar las funciones del sistema.');
        }

        if (typeof config.getAccessToken === 'function') {
            const token = await config.getAccessToken();
            if (token) return token;
        }

        const token = readStoredToken();
        if (!token) {
            throw new Error('Inicia sesión con Supabase para usar las funciones del sistema.');
        }

        return token;
    }

    async function request(path, options = {}) {
        const headers = new Headers(options.headers || {});
        let body;

        if (options.body !== undefined) {
            headers.set('Content-Type', 'application/json');
            body = JSON.stringify(options.body);
        }

        if (options.auth !== false) {
            const accessToken = await getAccessToken();
            headers.set('Authorization', 'Bearer ' + accessToken);
        }

        let response;
        try {
            response = await fetch(`${apiBaseUrl}${path}`, {
                method: options.method || 'GET',
                headers,
                body
            });
        } catch {
            throw new Error(`No se pudo conectar con la API (${apiBaseUrl}). Verifica que el backend esté activo y que CORS permita este origen.`);
        }

        const responseBody = await response.json();
        if (!response.ok) {
            const message = responseBody && (
                responseBody.message ||
                responseBody.error ||
                responseBody.mensaje
            );
            throw new Error(message || `La API respondió con HTTP ${response.status}.`);
        }

        return responseBody;
    }

    const api = {
        checkHealth() {
            const serverBaseUrl = apiBaseUrl.replace(/\/api$/, '');
            return fetch(`${serverBaseUrl}/api/health`)
                .then(response => {
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    return response.json();
                });
        },
        listOffers() {
            return request('/ofertas').then(result => result.data);
        },
        applyToOffer(idOferta) {
            return request('/postulaciones', {
                method: 'POST',
                body: { id_oferta: idOferta }
            }).then(result => result.data);
        },
        listApplications() {
            return request('/postulaciones').then(result => result.data);
        },
        getProfile() {
            return request('/perfil').then(result => result.data);
        },
        updateProfile(profile) {
            return request('/perfil', {
                method: 'PATCH',
                body: profile
            }).then(result => result.data);
        },
        listTimeEntries() {
            return request('/bitacora').then(result => result.data);
        },
        publishOffer(offer) {
            return request('/ofertas', {
                method: 'POST',
                body: offer
            }).then(result => result.data);
        },
        updateApplicationStatus(id, nextStatus) {
            return request(`/postulaciones/${encodeURIComponent(id)}/estado`, {
                method: 'PATCH',
                body: { nuevo_estado: nextStatus }
            }).then(result => result.data);
        },
        createTimeEntry(entry) {
            return request('/bitacora', {
                method: 'POST',
                body: entry
            }).then(result => result.data);
        },
        updateTimeEntryStatus(id, nextStatus) {
            return request(`/bitacora/${encodeURIComponent(id)}/estado`, {
                method: 'PATCH',
                body: { nuevo_estado: nextStatus }
            }).then(result => result.data);
        }
    };

    global.PraxisTrackApi = api;
})(window);