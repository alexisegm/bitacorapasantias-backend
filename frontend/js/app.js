(function () {
    'use strict';

    const api = window.PraxisTrackApi;
    if (!api) return;
    const auth = window.PraxisTrackAuth;
    let activeProfile = null;

    function statusPanel() {
        let panel = document.getElementById('apiStatus');
        if (!panel) {
            panel = document.createElement('p');
            panel.id = 'apiStatus';
            panel.setAttribute('role', 'status');
            panel.setAttribute('aria-live', 'polite');
            panel.className = 'mx-auto my-3 max-w-7xl px-4 text-sm text-on-surface-variant';
            const main = document.querySelector('main');
            if (main) main.prepend(panel);
        }
        return panel;
    }

    function showStatus(message, isError = false) {
        const panel = statusPanel();
        panel.textContent = message;
        panel.classList.toggle('text-error', isError);
        panel.classList.toggle('text-on-surface-variant', !isError);
    }

    function makeElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function initializeNavigation() {
        const header = document.querySelector('header');
        if (!header) return;

        const routes = [
            { label: 'marketplace', title: 'Marketplace', href: 'index.html', icon: 'storefront', key: 'marketplace' },
            { label: 'mi bitácora', title: 'Mi Bitácora', href: 'bitacora.html', icon: 'menu_book', key: 'bitacora' },
            { label: 'postulaciones', title: 'Postulaciones', href: 'expediente.html', icon: 'assignment_turned_in', key: 'postulaciones' }
        ];
        const currentFile = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
        const currentRoute = routes.find(route => route.href === currentFile) || routes[0];
        const styleLinks = (nav, isMobile = false) => {
            nav.setAttribute('aria-label', 'Navegación principal');
            nav.className = isMobile
                ? 'flex lg:hidden items-center justify-center gap-1 overflow-x-auto border-t border-outline-variant/60 bg-surface-container-lowest/95 px-2 py-2'
                : 'hidden lg:flex items-center gap-1 rounded-xl border border-outline-variant/60 bg-surface-container-low/70 p-1';

            [...nav.querySelectorAll('a')].forEach(link => {
                const route = routes.find(item => link.textContent.toLowerCase().includes(item.label));
                if (!route) {
                    link.remove();
                    return;
                }

                link.href = route.href;
                link.dataset.path = route.key;
                link.className = 'flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm transition-all';
                if (route === currentRoute) {
                    link.classList.add('bg-primary', 'text-on-primary', 'font-semibold', 'shadow-sm');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.add('font-medium', 'text-on-surface-variant', 'hover:text-on-surface', 'hover:bg-surface-container');
                    link.removeAttribute('aria-current');
                }
            });
        };

        const desktopNavigation = header.querySelector('nav');
        if (desktopNavigation) styleLinks(desktopNavigation);

        let mobileNavigation = header.querySelector('[data-mobile-navigation]');
        if (!mobileNavigation) {
            mobileNavigation = makeElement('nav', 'flex lg:hidden items-center justify-center gap-1 overflow-x-auto border-t border-outline-variant/60 bg-surface-container-lowest/95 px-2 py-2');
            mobileNavigation.dataset.mobileNavigation = 'true';
            routes.forEach(route => {
                const link = makeElement('a', 'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs transition-all');
                link.href = route.href;
                link.dataset.path = route.key;
                const icon = makeElement('span', 'material-symbols-outlined text-[18px]', route.icon);
                icon.setAttribute('aria-hidden', 'true');
                link.append(icon, document.createTextNode(route.title));
                mobileNavigation.append(link);
            });

            const headerRow = header.firstElementChild;
            if (headerRow) header.insertBefore(mobileNavigation, headerRow.nextSibling);
            else header.append(mobileNavigation);
        }
        styleLinks(mobileNavigation, true);

        const logoImage = header.querySelector('img[alt*="PraxisTrack"]');
        const logoIcon = [...header.querySelectorAll('.material-symbols-outlined')].find(element => element.textContent.trim() === 'terminal');
        const logo = logoImage
            ? logoImage.closest('.group') || logoImage
            : logoIcon?.parentElement;
        if (logo) {
            logo.classList.add('cursor-pointer');
            logo.setAttribute('role', 'link');
            logo.setAttribute('tabindex', '0');
            logo.setAttribute('aria-label', 'Ir al dashboard');
            logo.addEventListener('click', () => { window.location.href = 'index.html'; });
            logo.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    window.location.href = 'index.html';
                }
            });
        }

        const brand = [...header.querySelectorAll('div, span')].find(element =>
            element.childElementCount > 0 &&
            element.textContent.replace(/\s+/g, '').startsWith('PraxisTrack') &&
            element.textContent.includes('v2.4') &&
            ![...element.children].some(child => child.textContent.replace(/\s+/g, '').startsWith('PraxisTrack') && child.textContent.includes('v2.4'))
        );
        if (brand) {
            brand.classList.add('cursor-pointer');
            brand.setAttribute('role', 'link');
            brand.setAttribute('tabindex', '0');
            brand.setAttribute('aria-label', 'PraxisTrack, ir al dashboard');
            brand.addEventListener('click', () => { window.location.href = 'index.html'; });
            brand.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    window.location.href = 'index.html';
                }
            });
        }

        const avatar = header.querySelector('img[alt*="Mateo"], img[alt*="perfil"]') ||
            [...header.querySelectorAll('.material-symbols-outlined')].find(element => element.textContent.trim() === 'person');
        const profileButton = avatar?.closest('button');
        if (profileButton) {
            profileButton.classList.add('cursor-pointer');
            profileButton.setAttribute('aria-label', 'Abrir perfil');
            profileButton.addEventListener('click', () => { window.location.href = 'perfil.html'; });
        }

        if (currentRoute.key === 'postulaciones') {
            const main = document.querySelector('main');
            const adjustMainOffset = () => {
                if (main && window.matchMedia('(max-width: 1023px)').matches) {
                    main.style.paddingTop = '7rem';
                } else if (main) {
                    main.style.removeProperty('padding-top');
                }
            };
            adjustMainOffset();
            window.addEventListener('resize', adjustMainOffset);
        }
    }

    async function initializeSessionControls() {
        const header = document.querySelector('header');
        if (!header || !auth) return;

        const row = header.querySelector(':scope > div') || header;
        let controls = header.querySelector('[data-session-controls]');
        if (!controls) {
            controls = makeElement('div', 'ml-auto flex items-center gap-2');
            controls.dataset.sessionControls = 'true';
            row.append(controls);
        }
        controls.replaceChildren();

        const session = await auth.getSession();
        if (!session) {
            const signIn = makeElement('a', 'rounded-lg bg-primary px-3 py-2 text-xs font-bold text-on-primary', 'Iniciar sesión');
            signIn.href = 'auth.html';
            controls.append(signIn);
            return;
        }

        activeProfile = await api.getProfile();
        const displayName = activeProfile.nombre_completo || session.user?.email || 'Mi perfil';
        const profileButton = header.querySelector('img[alt*="Mateo"], img[alt*="perfil"]')?.closest('button');
        if (profileButton) {
            const nameLabel = profileButton.querySelector('div.flex-col > span:first-child');
            const roleLabel = profileButton.querySelector('div.flex-col > span:nth-child(2)');
            const avatar = profileButton.querySelector('img');
            if (nameLabel) nameLabel.textContent = displayName;
            if (roleLabel) roleLabel.textContent = activeProfile.rol || '';
            if (avatar) avatar.alt = `Foto de perfil de ${displayName}`;
            profileButton.setAttribute('aria-label', `Abrir perfil de ${displayName}`);
        }

        const signOut = makeElement('button', 'rounded-lg border border-outline-variant px-3 py-2 text-xs font-semibold text-on-surface hover:border-primary', 'Cerrar sesión');
        signOut.type = 'button';
        signOut.dataset.actionBound = 'true';
        signOut.addEventListener('click', async () => {
            signOut.disabled = true;
            try {
                await auth.signOut();
                window.location.href = 'auth.html';
            } catch (error) {
                signOut.disabled = false;
                showStatus(error.message, true);
            }
        });
        controls.append(signOut);
    }

    function initializeAuthPage() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        if (!loginForm || !signupForm) return false;

        const message = document.getElementById('authMessage');
        const recoveryForm = document.getElementById('recoveryForm');
        const loginTab = document.getElementById('showLogin');
        const signupTab = document.getElementById('showSignup');
        const setMessage = (text, isError = false) => {
            message.textContent = text;
            message.className = `mt-4 min-h-6 text-sm ${isError ? 'text-error' : 'text-on-surface-variant'}`;
        };
        const selectForm = isSignup => {
            loginForm.classList.toggle('hidden', isSignup);
            signupForm.classList.toggle('hidden', !isSignup);
            loginTab.className = isSignup
                ? 'rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant'
                : 'rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary';
            signupTab.className = isSignup
                ? 'rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary'
                : 'rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant';
            loginTab.setAttribute('aria-selected', String(!isSignup));
            signupTab.setAttribute('aria-selected', String(isSignup));
            setMessage('');
        };
        loginTab.addEventListener('click', () => selectForm(false));
        signupTab.addEventListener('click', () => selectForm(true));

        loginForm.addEventListener('submit', async event => {
            event.preventDefault();
            const button = loginForm.querySelector('[type="submit"]');
            button.disabled = true;
            setMessage('Validando credenciales...');
            try {
                const values = new FormData(loginForm);
                await auth.signIn(String(values.get('email')).trim(), String(values.get('password')));
                    const requestedPage = new URLSearchParams(window.location.search).get('next');
                    const safeNextPage = ['index.html', 'bitacora.html', 'expediente.html', 'perfil.html'].includes(requestedPage)
                        ? requestedPage
                        : 'index.html';
                    window.location.href = safeNextPage;
            } catch (error) {
                setMessage(error.message, true);
            } finally {
                button.disabled = false;
            }
        });

        signupForm.addEventListener('submit', async event => {
            event.preventDefault();
            const button = signupForm.querySelector('[type="submit"]');
            const values = new FormData(signupForm);
            if (values.get('password') !== values.get('password_confirmation')) {
                setMessage('Las contraseñas no coinciden.', true);
                return;
            }
            button.disabled = true;
            setMessage('Creando cuenta y perfil...');
            try {
                const result = await auth.signUp({
                    email: String(values.get('email')).trim(),
                    password: String(values.get('password')),
                    nombreCompleto: String(values.get('nombre_completo')).trim(),
                    documentoIdentidad: String(values.get('documento_identidad')).trim()
                });
                if (result.access_token) {
                    window.location.href = 'index.html';
                } else {
                    selectForm(false);
                    setMessage('Cuenta creada. Confirma tu correo electrónico y luego inicia sesión.');
                }
            } catch (error) {
                setMessage(error.message, true);
            } finally {
                button.disabled = false;
            }
        });

        document.getElementById('forgotPassword')?.addEventListener('click', async () => {
            const email = loginForm.elements.email.value.trim();
            if (!email) {
                setMessage('Escribe tu correo para enviarte el enlace de recuperación.', true);
                loginForm.elements.email.focus();
                return;
            }
            try {
                await auth.resetPassword(email);
                setMessage('Si el correo está registrado, recibirás instrucciones para restablecer la contraseña.');
            } catch (error) {
                setMessage(error.message, true);
            }
        });

        recoveryForm?.addEventListener('submit', async event => {
            event.preventDefault();
            const values = new FormData(recoveryForm);
            if (values.get('password') !== values.get('password_confirmation')) {
                setMessage('Las contraseñas no coinciden.', true);
                return;
            }
            const button = recoveryForm.querySelector('[type="submit"]');
            button.disabled = true;
            try {
                await auth.updatePassword(String(values.get('password')));
                await auth.signOut();
                recoveryForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                document.querySelector('[role="tablist"]').classList.remove('hidden');
                setMessage('Contraseña actualizada. Ya puedes iniciar sesión.');
            } catch (error) {
                setMessage(error.message, true);
            } finally {
                button.disabled = false;
            }
        });

        if (auth.isPasswordRecovery) {
            loginForm.classList.add('hidden');
            signupForm.classList.add('hidden');
            document.querySelector('[role="tablist"]').classList.add('hidden');
            recoveryForm?.classList.remove('hidden');
        } else {
            auth.getSession().then(session => {
                if (session) window.location.replace('index.html');
            }).catch(error => setMessage(error.message, true));
        }

        if (!auth.isConfigured) {
            setMessage('Falta configurar la URL y la clave pública de Supabase en js/config.js.', true);
        }
        return true;
    }

    async function initializeProfilePage() {
        const main = document.querySelector('main');
        if (!main) return;
        const session = await auth?.getSession();
        if (!session) {
            window.location.replace('auth.html?next=perfil.html');
            return;
        }

        const section = makeElement('section', 'mx-auto my-6 max-w-3xl rounded-2xl border border-outline-variant bg-surface-container-low p-6');
        section.id = 'accountProfileEditor';
        main.prepend(section);
        section.append(
            makeElement('h2', 'mb-2 text-xl font-bold text-on-surface', 'Mi cuenta PraxisTrack'),
            makeElement('p', 'mb-5 text-sm text-on-surface-variant', 'Actualiza tus datos de perfil. El rol lo asigna la administración.')
        );
        const form = document.createElement('form');
        form.className = 'space-y-4';
        form.innerHTML = `
            <label class="block text-sm">Nombre completo
                <input name="nombre_completo" required minlength="3" maxlength="120" class="mt-1 w-full rounded-lg border-outline-variant bg-surface px-3 py-2 text-on-surface">
            </label>
            <label class="block text-sm">Documento de identidad
                <input name="documento_identidad" required minlength="3" maxlength="40" class="mt-1 w-full rounded-lg border-outline-variant bg-surface px-3 py-2 text-on-surface">
            </label>
            <label class="block text-sm">Correo de acceso
                <input name="email" type="email" readonly class="mt-1 w-full rounded-lg border-outline-variant bg-surface px-3 py-2 text-on-surface">
            </label>
            <label class="block text-sm">Rol
                <input name="rol" readonly class="mt-1 w-full rounded-lg border-outline-variant bg-surface px-3 py-2 text-on-surface">
            </label>
            <p data-profile-message class="min-h-5 text-sm" role="status" aria-live="polite"></p>
            <button type="submit" class="rounded-lg bg-primary px-4 py-2 font-bold text-on-primary">Guardar cambios</button>`;
        section.append(form);
        const profile = await api.getProfile();
        activeProfile = profile;
        form.elements.nombre_completo.value = profile.nombre_completo || '';
        form.elements.documento_identidad.value = profile.documento_identidad || '';
        form.elements.email.value = session.user?.email || '';
        form.elements.rol.value = profile.rol || '';
        form.addEventListener('submit', async event => {
            event.preventDefault();
            const button = form.querySelector('[type="submit"]');
            const status = form.querySelector('[data-profile-message]');
            button.disabled = true;
            status.textContent = 'Guardando perfil...';
            try {
                const updated = await api.updateProfile({
                    nombre_completo: form.elements.nombre_completo.value.trim(),
                    documento_identidad: form.elements.documento_identidad.value.trim()
                });
                activeProfile = updated;
                status.textContent = 'Perfil actualizado correctamente.';
                status.className = 'min-h-5 text-sm text-primary';
            } catch (error) {
                status.textContent = error.message;
                status.className = 'min-h-5 text-sm text-error';
            } finally {
                button.disabled = false;
            }
        });
    }

    function configureMarketplaceActions() {
        const search = document.getElementById('internshipSearch');
        const grid = document.getElementById('cardsGrid');
        if (search && grid) {
            const filter = () => {
                const query = search.value.trim().toLowerCase();
                grid.querySelectorAll('article').forEach(card => {
                    card.hidden = !card.textContent.toLowerCase().includes(query);
                });
            };
            search.addEventListener('input', filter);
        }

        const exportButton = document.getElementById('btnExportPdf');
        if (exportButton) {
            exportButton.dataset.actionBound = 'true';
            exportButton.addEventListener('click', () => window.print());
        }
        document.querySelectorAll('a').forEach(link => {
            const label = link.textContent.trim().toLowerCase();
            if (label.includes('bitácora completa') || label.includes('horas totales')) link.href = 'bitacora.html';
            if (label.includes('volver a postulaciones')) link.href = 'expediente.html';
        });

        const resetFilters = [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Restablecer');
        resetFilters?.addEventListener('click', () => {
            resetFilters.dataset.actionBound = 'true';
            document.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
                checkbox.checked = index < 2;
            });
            const range = document.querySelector('input[type="range"]');
            if (range) range.value = range.min;
            if (search) search.value = '';
            grid?.querySelectorAll('article').forEach(card => { card.hidden = false; });
        });

        document.querySelectorAll('button[aria-label*="Alertas"], button[title*="Notificaciones"]').forEach(button => {
            button.dataset.actionBound = 'true';
            button.addEventListener('click', () => showStatus('No tienes notificaciones nuevas.'));
        });
    }

    function configureOtherActions() {
        document.querySelectorAll('a[href="#"]').forEach(link => {
            const label = link.textContent.trim().toLowerCase();
            if (label.includes('marketplace')) link.href = 'index.html';
            else if (label.includes('mi bitácora')) link.href = 'bitacora.html';
            else if (label.includes('postulaciones')) link.href = 'expediente.html';
            else if (label.includes('perfil') || label.includes('mateo')) link.href = 'perfil.html';
            else if (label.includes('inicio')) link.href = 'index.html';
        });

        document.querySelectorAll('button').forEach(button => {
            if (button.dataset.actionBound || button.id === 'btnNewEntry') return;
            const label = button.textContent.trim().toLowerCase();
            if (label.includes('descargar') || label.includes('pdf') || label.includes('exportar')) {
                button.addEventListener('click', () => window.print());
                button.dataset.actionBound = 'true';
            } else if (label.includes('recordatorio')) {
                button.addEventListener('click', () => {
                    window.location.href = 'mailto:?subject=Recordatorio%20de%20validaci%C3%B3n%20de%20horas&body=Hola,%20por%20favor%20revisa%20las%20horas%20pendientes%20en%20PraxisTrack.';
                });
                button.dataset.actionBound = 'true';
            } else if (label.includes('compartir')) {
                button.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(window.location.href);
                        showStatus('Enlace copiado al portapapeles.');
                    } catch {
                        showStatus('Copia la dirección de la página para compartirla.', true);
                    }
                });
                button.dataset.actionBound = 'true';
            } else if (label.includes('guardar') || label.includes('editar') || label.includes('configurar') || label.includes('añadir tecnología') || label.includes('subir')) {
                button.addEventListener('click', () => {
                    const target = document.querySelector('#accountProfileEditor input[name="nombre_completo"]');
                    if (target) {
                        target.focus();
                        document.getElementById('accountProfileEditor').scrollIntoView({ behavior: 'smooth' });
                    } else {
                        showStatus('Completa estos datos desde Mi perfil para guardarlos en tu cuenta.');
                        window.location.href = 'perfil.html';
                    }
                });
                button.dataset.actionBound = 'true';
            }
        });

        document.querySelectorAll('[data-path="evaluaciones-de-tutor"], a').forEach(link => {
            if (link.textContent.toLowerCase().includes('evaluaciones') || link.textContent.toLowerCase().includes('evaluación')) {
                link.addEventListener('click', event => {
                    event.preventDefault();
                    showStatus('Las evaluaciones aún no tienen un flujo definido en el backend.');
                });
            }
        });

        document.querySelectorAll('button[title*="Copiar expediente"]').forEach(button => {
            button.dataset.actionBound = 'true';
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText('EXP-2025-0842');
                    showStatus('Número de expediente copiado.');
                } catch {
                    showStatus('No se pudo acceder al portapapeles.', true);
                }
            });
        });

        document.querySelectorAll('button').forEach(button => {
            if (
                button.dataset.actionBound ||
                button.dataset.status ||
                button.dataset.filter ||
                button.hasAttribute('onclick') ||
                button.type === 'submit' ||
                button.id === 'btnNewEntry'
            ) return;
            button.addEventListener('click', () => {
                const label = button.textContent.trim().replace(/\s+/g, ' ');
                showStatus(`“${label}” todavía no está conectado a una función disponible en el backend.`, true);
            });
            button.dataset.actionBound = 'true';
        });
    }

    async function loadMarketplace() {
        const grid = document.getElementById('cardsGrid');
        if (!grid) return;

        let publishButton = document.getElementById('publishOfferButton');
        if (activeProfile?.rol === 'Empresa' && !publishButton) {
            publishButton = makeElement('button', 'mb-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary', 'Publicar una oferta');
            publishButton.id = 'publishOfferButton';
            publishButton.type = 'button';
            publishButton.addEventListener('click', openOfferForm);
            grid.parentElement.insertBefore(publishButton, grid);
        }

        grid.replaceChildren(makeElement('p', 'col-span-full text-sm text-on-surface-variant', 'Cargando ofertas...'));

        try {
            const offers = await api.listOffers();
            grid.replaceChildren();

            if (!offers.length) {
                grid.append(makeElement('p', 'col-span-full text-sm text-on-surface-variant', 'No hay ofertas activas en este momento.'));
                showStatus('Conectado al backend. No hay ofertas activas.');
                return;
            }

            offers.forEach(offer => {
                const card = makeElement('article', 'bg-surface-container-low/95 hover:bg-surface-container border border-outline/60 rounded-2xl p-5 shadow-glow-card transition-all flex flex-col justify-between');
                const content = makeElement('div');
                content.append(
                    makeElement('p', 'mb-2 text-xs font-mono text-on-surface-variant', offer.empresa || 'Empresa'),
                    makeElement('h3', 'mb-3 text-base font-bold text-white', offer.titulo),
                    makeElement('p', 'text-sm leading-relaxed text-on-surface-variant', offer.descripcion)
                );

                const footer = makeElement('div', 'mt-4 flex items-center justify-between border-t border-outline-variant/50 pt-3');
                const date = offer.fecha_publicacion
                    ? new Date(offer.fecha_publicacion).toLocaleDateString()
                    : '';
                footer.append(makeElement('span', 'text-[11px] font-mono text-on-surface-variant', date));

                if (activeProfile?.rol === 'Estudiante') {
                    const applyButton = makeElement('button', 'rounded-lg bg-amber-gold px-3.5 py-1.5 text-xs font-bold text-on-primary transition-all hover:bg-amber-400', 'Postularme');
                    applyButton.type = 'button';
                    applyButton.dataset.actionBound = 'true';
                    applyButton.addEventListener('click', async () => {
                        applyButton.disabled = true;
                        try {
                            await api.applyToOffer(offer.id_oferta);
                            applyButton.textContent = 'Postulación enviada';
                            showStatus('Tu postulación fue enviada correctamente.');
                        } catch (error) {
                            showStatus(error.message, true);
                            applyButton.disabled = false;
                        }
                    });
                    footer.append(applyButton);
                }
                card.append(content, footer);
                grid.append(card);
            });

            showStatus(`Conectado al backend. ${offers.length} oferta(s) cargadas.`);
        } catch (error) {
            grid.replaceChildren(makeElement('p', 'col-span-full text-sm text-error', error.message));
            showStatus(error.message, true);
        }

        function openOfferForm() {
            let dialog = document.getElementById('publishOfferDialog');
            if (!dialog) {
                dialog = document.createElement('dialog');
                dialog.id = 'publishOfferDialog';
                dialog.className = 'w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface backdrop:bg-black/70';
                dialog.innerHTML = `
                    <form class="space-y-4">
                        <h2 class="text-xl font-bold">Publicar oferta de pasantía</h2>
                        <label class="block text-sm">Título
                            <input name="titulo" required minlength="5" maxlength="150" class="mt-1 w-full rounded-lg bg-surface-container-lowest p-2 text-on-surface">
                        </label>
                        <label class="block text-sm">Descripción
                            <textarea name="descripcion" required minlength="20" class="mt-1 w-full rounded-lg bg-surface-container-lowest p-2 text-on-surface"></textarea>
                        </label>
                        <p class="text-sm text-error" role="alert"></p>
                        <div class="flex justify-end gap-2">
                            <button type="button" data-close class="rounded-lg border border-outline-variant px-4 py-2 text-sm">Cancelar</button>
                            <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Publicar</button>
                        </div>
                    </form>`;
                document.body.append(dialog);
                dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
                dialog.querySelector('form').addEventListener('submit', async event => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const values = new FormData(form);
                    const error = form.querySelector('[role="alert"]');
                    const submit = form.querySelector('[type="submit"]');
                    submit.disabled = true;
                    error.textContent = '';
                    try {
                        await api.publishOffer({
                            titulo: String(values.get('titulo')).trim(),
                            descripcion: String(values.get('descripcion')).trim()
                        });
                        dialog.close();
                        form.reset();
                        await loadMarketplace();
                        showStatus('Oferta publicada correctamente.');
                    } catch (requestError) {
                        error.textContent = requestError.message;
                    } finally {
                        submit.disabled = false;
                    }
                });
            }
            dialog.showModal();
        }
    }

    function localDate() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    function statusLabel(status) {
        return ({
            Registro_Creado: 'Registro creado',
            Pendiente_De_Aprobación: 'Pendiente de aprobación',
            Horas_Aprobadas: 'Horas aprobadas',
            Horas_Rechazadas: 'Horas rechazadas'
        })[status] || status;
    }

    function updateBitacoraMetrics(entries) {
        const approved = entries
            .filter(entry => entry.estado === 'Horas_Aprobadas')
            .reduce((sum, entry) => sum + Number(entry.horas || 0), 0);
        const pending = entries
            .filter(entry => entry.estado === 'Pendiente_De_Aprobación')
            .reduce((sum, entry) => sum + Number(entry.horas || 0), 0);

        const labels = [...document.querySelectorAll('main span')];
        const approvedLabel = labels.find(element => element.textContent.trim() === 'Horas Aprobadas');
        const pendingLabel = labels.find(element => element.textContent.trim() === 'En Revisión');
        const remainingLabel = labels.find(element => element.textContent.trim() === 'Horas Restantes');
        if (approvedLabel) approvedLabel.parentElement.parentElement.querySelector('.text-headline-lg').textContent = String(approved);
        if (pendingLabel) pendingLabel.parentElement.parentElement.querySelector('.text-headline-lg').textContent = String(pending);
        if (remainingLabel) remainingLabel.parentElement.parentElement.querySelector('.text-headline-lg').textContent = String(Math.max(0, 480 - approved));
    }

    function renderEntries(entries) {
        const container = document.getElementById('entriesContainer');
        if (!container) return;
        container.replaceChildren();

        entries.forEach(entry => {
            const article = makeElement('article', 'rounded-xl border border-outline-variant/60 bg-surface-container-low/95 p-4');
            article.dataset.itemStatus = entry.estado;
            const row = makeElement('div', 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between');
            const details = makeElement('div');
            details.append(
                makeElement('h3', 'font-semibold text-on-surface', `${entry.fecha} · ${entry.oferta || 'Práctica'}`),
                makeElement('p', 'mt-1 text-sm text-on-surface-variant', entry.descripcion),
                makeElement('p', 'mt-2 text-xs text-on-surface-variant', `${entry.horas} horas · ${statusLabel(entry.estado)}`)
            );
            const actions = makeElement('div', 'flex flex-wrap gap-2');

            const nextStates = activeProfile?.rol === 'Estudiante' && entry.estado === 'Registro_Creado'
                ? [['Pendiente_De_Aprobación', 'Enviar a revisión']]
                : activeProfile?.rol === 'Empresa' && entry.estado === 'Pendiente_De_Aprobación'
                    ? [['Horas_Aprobadas', 'Aprobar'], ['Horas_Rechazadas', 'Rechazar']]
                    : [];

            nextStates.forEach(([nextState, label]) => {
                const button = makeElement('button', 'rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface hover:border-primary', label);
                button.type = 'button';
                button.dataset.actionBound = 'true';
                button.addEventListener('click', async () => {
                    button.disabled = true;
                    try {
                        await api.updateTimeEntryStatus(entry.id_registro, nextState);
                        if (await loadBitacora()) {
                            showStatus('El estado de las horas se actualizó correctamente.');
                        }
                    } catch (error) {
                        button.disabled = false;
                        showStatus(error.message, true);
                    }
                });
                actions.append(button);
            });

            row.append(details, actions);
            article.append(row);
            container.append(article);
        });

        updateBitacoraMetrics(entries);
    }

    function applyEntryFilters() {
        const query = (document.getElementById('logSearchInput')?.value || '').trim().toLowerCase();
        const selected = document.querySelector('#statusFilterBar button.bg-primary')?.dataset.status || 'all';
        document.querySelectorAll('#entriesContainer article').forEach(entry => {
            const matchesStatus = selected === 'all' || entry.dataset.itemStatus === selected;
            const matchesQuery = entry.textContent.toLowerCase().includes(query);
            entry.hidden = !(matchesStatus && matchesQuery);
        });
    }

    async function loadBitacora() {
        const container = document.getElementById('entriesContainer');
        if (!container) return;

        container.replaceChildren(makeElement('p', 'text-sm text-on-surface-variant', 'Cargando registros...'));
        try {
            const entries = await api.listTimeEntries();
            renderEntries(entries);
            applyEntryFilters();
            showStatus(`Conectado al backend. ${entries.length} registro(s) de horas cargados.`);
        } catch (error) {
            container.replaceChildren(makeElement('p', 'text-sm text-error', error.message));
            showStatus(error.message, true);
            return false;
        }
        return true;
    }

    async function loadApplications() {
        let container = document.getElementById('apiApplications');
        if (!container) {
            container = document.createElement('section');
            container.id = 'apiApplications';
            container.className = 'mx-auto my-6 max-w-7xl rounded-2xl border border-outline-variant bg-surface-container-low p-5';
            container.setAttribute('aria-labelledby', 'apiApplicationsTitle');
            document.querySelector('main').prepend(container);
        }
        container.replaceChildren();

        const title = makeElement('h2', 'mb-4 text-lg font-bold text-on-surface', 'Postulaciones conectadas');
        title.id = 'apiApplicationsTitle';
        container.append(title, makeElement('p', 'text-sm text-on-surface-variant', 'Cargando postulaciones...'));

        try {
            const applications = await api.listApplications();
            container.replaceChildren(title);
            if (!applications.length) {
                container.append(makeElement('p', 'text-sm text-on-surface-variant', 'No tienes postulaciones registradas.'));
                showStatus('Conectado al backend. No hay postulaciones para mostrar.');
                return true;
            }

            applications.forEach(application => {
                const item = makeElement('article', 'mb-3 rounded-xl border border-outline-variant/60 bg-surface-container p-4 last:mb-0');
                const row = makeElement('div', 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between');
                const details = makeElement('div');
                details.append(
                    makeElement('h3', 'font-semibold text-on-surface', application.titulo_oferta),
                    makeElement('p', 'mt-1 text-sm text-on-surface-variant', `Estado: ${application.estado_actual} · ${application.fecha_registro ? new Date(application.fecha_registro).toLocaleDateString() : ''}`)
                );
                const actions = makeElement('div', 'flex flex-wrap gap-2');
                const transitions = activeProfile?.rol === 'Empresa' ? ({
                    Enviada: [
                        ['En_Revisión_Por_Empresa', 'Iniciar revisión'],
                        ['Rechazado', 'Rechazar']
                    ],
                    En_Revisión_Por_Empresa: [
                        ['Entrevista_Asignada', 'Asignar entrevista'],
                        ['Rechazado', 'Rechazar']
                    ],
                    Entrevista_Asignada: [
                        ['Seleccionado', 'Seleccionar'],
                        ['Rechazado', 'Rechazar']
                    ]
                })[application.estado_actual] || [] : [];

                transitions.forEach(([nextState, label]) => {
                    const button = makeElement('button', 'rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface hover:border-primary', label);
                    button.type = 'button';
                    button.dataset.actionBound = 'true';
                    button.addEventListener('click', async () => {
                        button.disabled = true;
                        try {
                            await api.updateApplicationStatus(application.id_postulacion, nextState);
                            if (await loadApplications()) {
                                showStatus('El estado de la postulación se actualizó correctamente.');
                            }
                        } catch (error) {
                            button.disabled = false;
                            showStatus(error.message, true);
                        }
                    });
                    actions.append(button);
                });

                row.append(details, actions);
                item.append(row);
                container.append(item);
            });
            showStatus(`Conectado al backend. ${applications.length} postulación(es) cargadas.`);
            return true;
        } catch (error) {
            container.replaceChildren(title, makeElement('p', 'text-sm text-error', error.message));
            showStatus(error.message, true);
            return false;
        }
    }

    function configureBitacoraFilters() {
        const filterBar = document.getElementById('statusFilterBar');
        if (filterBar) {
            const statuses = [
                ['all', 'Todas'],
                ['Horas_Aprobadas', 'Aprobadas'],
                ['Pendiente_De_Aprobación', 'En revisión'],
                ['Registro_Creado', 'Por enviar'],
                ['Horas_Rechazadas', 'Rechazadas']
            ];
            [...filterBar.querySelectorAll('button')].forEach((button, index) => {
                const [status, label] = statuses[index];
                button.dataset.status = status;
                button.textContent = label;
                button.addEventListener('click', applyEntryFilters);
            });
        }

        document.getElementById('logSearchInput')?.addEventListener('input', applyEntryFilters);
    }

    async function openNewEntryForm() {
        try {
            const applications = await api.listApplications();
            const selectedApplications = applications.filter(application => application.estado_actual === 'Seleccionado');
            if (!selectedApplications.length) {
                showStatus('Para registrar horas necesitas una postulación en estado Seleccionado.', true);
                return;
            }

            let dialog = document.getElementById('newEntryDialog');
            if (!dialog) {
                dialog = document.createElement('dialog');
                dialog.id = 'newEntryDialog';
                dialog.className = 'w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container p-6 text-on-surface backdrop:bg-black/70';
                dialog.innerHTML = `
                    <form id="newEntryForm" class="space-y-4">
                        <h2 class="text-xl font-bold">Registrar jornada</h2>
                        <label class="block text-sm">Postulación seleccionada
                            <select name="id_postulacion" required class="mt-1 w-full rounded-lg bg-surface-container-lowest p-2 text-on-surface"></select>
                        </label>
                        <label class="block text-sm">Fecha
                            <input name="fecha" type="date" required class="mt-1 w-full rounded-lg bg-surface-container-lowest p-2 text-on-surface">
                        </label>
                        <label class="block text-sm">Horas (máximo 8)
                            <input name="horas_invertidas" type="number" min="0.1" max="8" step="0.1" required class="mt-1 w-full rounded-lg bg-surface-container-lowest p-2 text-on-surface">
                        </label>
                        <label class="block text-sm">Descripción
                            <textarea name="descripcion" minlength="10" required class="mt-1 w-full rounded-lg bg-surface-container-lowest p-2 text-on-surface"></textarea>
                        </label>
                        <p id="newEntryError" class="text-sm text-error" role="alert"></p>
                        <div class="flex justify-end gap-2">
                            <button type="button" data-close-dialog class="rounded-lg border border-outline-variant px-4 py-2 text-sm">Cancelar</button>
                            <button type="submit" class="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary">Guardar</button>
                        </div>
                    </form>`;
                document.body.append(dialog);
                dialog.querySelector('[data-close-dialog]').addEventListener('click', () => dialog.close());
                dialog.querySelector('form').addEventListener('submit', async event => {
                    event.preventDefault();
                    const form = event.currentTarget;
                    const values = new FormData(form);
                    const error = dialog.querySelector('#newEntryError');
                    error.textContent = '';
                    try {
                        await api.createTimeEntry({
                            id_postulacion: values.get('id_postulacion'),
                            fecha: values.get('fecha'),
                            horas_invertidas: Number(values.get('horas_invertidas')),
                            descripcion: String(values.get('descripcion')).trim()
                        });
                        dialog.close();
                        form.reset();
                        if (await loadBitacora()) {
                            showStatus('Jornada registrada correctamente.');
                        }
                    } catch (requestError) {
                        error.textContent = requestError.message;
                    }
                });
            }

            const select = dialog.querySelector('select[name="id_postulacion"]');
            select.replaceChildren();
            selectedApplications.forEach(application => {
                const option = makeElement('option', '', `${application.titulo_oferta} · ${application.id_postulacion}`);
                option.value = application.id_postulacion;
                select.append(option);
            });
            dialog.querySelector('input[name="fecha"]').value = localDate();
            dialog.showModal();
        } catch (error) {
            showStatus(error.message, true);
        }
    }

    async function initialize() {
        initializeNavigation();
        if (initializeAuthPage()) return;

        try {
            await initializeSessionControls();
        } catch (error) {
            showStatus(error.message, true);
            return;
        }

        const page = window.location.pathname.split('/').pop().toLowerCase();
        if (page === 'perfil.html') {
            try {
                await initializeProfilePage();
            } catch (error) {
                showStatus(error.message, true);
            }
            configureOtherActions();
            return;
        }

        if (!await auth?.getSession()) {
            const nextPage = page && page !== 'index.html' ? page : 'index.html';
            const main = document.querySelector('main');
            if (main) {
                const signInLink = makeElement('a', 'inline-flex rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary', 'Iniciar sesión para ver tus datos');
                signInLink.href = `auth.html?next=${encodeURIComponent(nextPage)}`;
                main.prepend(signInLink);
                [...main.children].forEach(child => {
                    if (child !== signInLink && child.id !== 'apiStatus') child.hidden = true;
                });
            }
            if (document.getElementById('cardsGrid')) configureMarketplaceActions();
            configureOtherActions();
            return;
        }

        const isMarketplace = document.getElementById('cardsGrid');
        const isBitacora = document.getElementById('entriesContainer');
        const isExpediente = window.location.pathname.toLowerCase().endsWith('/expediente.html');

        try {
            await api.checkHealth();
            showStatus('Backend conectado.');
        } catch (error) {
            showStatus(`No se pudo verificar el backend: ${error.message}`, true);
        }

        if (isMarketplace) await loadMarketplace();
        if (isBitacora) {
            configureBitacoraFilters();
            document.getElementById('btnNewEntry')?.addEventListener('click', openNewEntryForm);
            await loadBitacora();
        }
        if (isExpediente) await loadApplications();

        if (isMarketplace) configureMarketplaceActions();
        configureOtherActions();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();