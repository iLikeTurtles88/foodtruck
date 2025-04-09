/**
 * Dave's Mexican Food Truck - Script Principal
 * Gère les interactions : menu mobile, scroll, animations, formulaire, lightbox...
 */
document.addEventListener('DOMContentLoaded', function() {
    'use strict'; // Mode strict pour éviter les erreurs courantes

    // --- Sélection des éléments DOM ---
    const header = document.getElementById('header');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopButton = document.getElementById('back-to-top');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const locationElement = document.getElementById('current-location');
    const yearSpan = document.getElementById('current-year');
    const allSections = document.querySelectorAll('main section[id]');
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const galleryLinks = document.querySelectorAll('.gallery-grid .gallery-item');

    // --- État et Configuration ---
    let isMenuOpen = false;
    let lastFocusedElement; // Pour restaurer le focus après fermeture menu

    // --- Fonctions Utilitaires ---

    /** Debounce : Limite la fréquence d'appel d'une fonction */
    const debounce = (func, wait = 15, immediate = false) => {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    // --- Fonctionnalités ---

    /** Effet Scroll sur l'En-tête */
    const handleHeaderScroll = () => {
        if (!header) return;
        if (window.scrollY >= 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    /** Menu Mobile : Ouverture/Fermeture et Gestion du Focus */
    const openMenu = () => {
        if (!navMenu || !navClose) return;
        lastFocusedElement = document.activeElement;
        navMenu.classList.add('active');
        navMenu.removeAttribute('tabindex');
        navClose.focus();
        isMenuOpen = true;
        document.body.style.overflow = 'hidden';
        navMenu.addEventListener('keydown', trapFocus);
    };

    const closeMenu = () => {
        if (!navMenu || !navToggle) return;
        navMenu.classList.remove('active');
        navMenu.setAttribute('tabindex', '-1');
        isMenuOpen = false;
        document.body.style.overflow = '';
        navMenu.removeEventListener('keydown', trapFocus);
        if (lastFocusedElement) {
            lastFocusedElement.focus();
        } else {
             navToggle.focus();
        }
    };

    const trapFocus = (e) => {
        if (!isMenuOpen || !navMenu) return;
        if (e.key !== 'Tab') return;

        const focusableElements = Array.from(navMenu.querySelectorAll('a[href], button:not([disabled])'));
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    };

    if (navToggle) navToggle.addEventListener('click', openMenu);
    if (navClose) navClose.addEventListener('click', closeMenu);
    navLinks.forEach(link => link.addEventListener('click', () => { if (isMenuOpen) closeMenu(); }));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });


    /** Bouton Retour en Haut */
    const handleBackToTop = () => {
        if (!backToTopButton) return;
        if (window.scrollY >= 400) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    };
    if (backToTopButton) {
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /** Smooth Scroll */
     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.length <= 1) return;
            if (this.id === 'back-to-top') return;

            try {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = header?.offsetHeight || 70;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - headerOffset - 10;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    if (isMenuOpen) closeMenu();
                }
            } catch (error) {
                console.warn(`Smooth scroll target not found or invalid selector: ${href}`, error);
            }
        });
    });

    /** Mise en évidence du Lien de Navigation Actif */
    const activateNavLink = (sectionId) => {
        navLinks.forEach(link => {
            link.classList.remove('active-link');
            link.removeAttribute('aria-current');
            // Vérifier si le href correspond exactement à l'ID de la section
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active-link');
                link.setAttribute('aria-current', 'page');
            }
        });
    };
    const sectionObserverOptions = {
        root: null,
        rootMargin: `-${header?.offsetHeight || 70}px 0px -60% 0px`,
        threshold: 0
    };
    const sectionObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                activateNavLink(entry.target.id);
            }
        });
    };
    if (window.IntersectionObserver && allSections.length > 0) {
        const sectionObserver = new IntersectionObserver(sectionObserverCallback, sectionObserverOptions);
        allSections.forEach(section => {
            // Vérifier si la section a un ID avant de l'observer
            if(section.id) {
                sectionObserver.observe(section);
            }
        });
    } else {
        console.warn("IntersectionObserver not supported, active link highlighting might not work perfectly.");
    }

    /** Animation des Éléments au Scroll */
    const animateObserverOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    };
    const animateObserverCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };
     if (window.IntersectionObserver && animatedElements.length > 0) {
        const animateObserver = new IntersectionObserver(animateObserverCallback, animateObserverOptions);
        animatedElements.forEach(elem => animateObserver.observe(elem));
     } else {
         animatedElements.forEach(elem => elem.classList.add('visible'));
     }

    /** Mise à Jour Dynamique de l'Emplacement (Bruxelles) */
    if (locationElement) {
        const today = new Date().getDay();
        let todayLocation = "Vérifiez nos réseaux sociaux pour les imprévus !";
        const locations = {
            1: "Quartier EU (Schuman) (11h30 - 14h30)", 2: "Place Flagey, Ixelles (11h30 - 14h30)",
            4: "Parvis de Saint-Gilles (11h30 - 14h30)", 5: "Place Flagey, Ixelles (11h30 - 15h00)",
            6: "Événements / Marché (Variable - Voir Instagram !)", 0: "Marché du Midi (Gare) (10h00 - 15h00)"
        };
        if (today === 3) {
             todayLocation = "Repos / Préparation aujourd'hui.";
        } else {
             todayLocation = locations[today] || todayLocation;
        }
        const dayName = new Date().toLocaleDateString('fr-BE', { weekday: 'long' });
        locationElement.innerHTML = `<strong>Aujourd'hui (${dayName}) :</strong> ${todayLocation}`;
    }

    /** Mise à Jour Année Footer */
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /** Gestion Formulaire de Contact */
    if (contactForm && formStatus) {
        const honeypotField = contactForm.querySelector('input[name="website-url"]');
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            let isValid = true;

            if (honeypotField && honeypotField.value !== '') {
                console.warn('Honeypot field filled, likely a bot.');
                return;
            }

            const requiredFields = contactForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                const trimmedValue = field.value.trim();
                if (!trimmedValue) {
                    isValid = false;
                    field.setAttribute('aria-invalid', 'true');
                    field.style.borderColor = 'var(--error-color)';
                } else {
                    field.setAttribute('aria-invalid', 'false');
                    field.style.borderColor = '';
                }
                if (field.type === 'email' && trimmedValue) {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(trimmedValue)) {
                        isValid = false;
                        field.setAttribute('aria-invalid', 'true');
                        field.style.borderColor = 'var(--error-color)';
                    }
                }
            });

            if (!isValid) {
                formStatus.textContent = 'Veuillez vérifier les champs indiqués en rouge.';
                formStatus.className = 'form-status error';
                 const firstInvalidField = contactForm.querySelector('[aria-invalid="true"]');
                 firstInvalidField?.focus();
                return;
            }

            formStatus.textContent = 'Envoi en cours...';
            formStatus.className = 'form-status info';
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            setTimeout(() => {
                const simulatedSuccess = Math.random() > 0.1;
                if (simulatedSuccess) {
                    formStatus.textContent = 'Merci ! Votre message a bien été envoyé.';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                     requiredFields.forEach(field => {
                         field.setAttribute('aria-invalid', 'false');
                         field.style.borderColor = '';
                     });
                } else {
                    formStatus.textContent = 'Oups ! Une erreur est survenue. Veuillez réessayer plus tard.';
                    formStatus.className = 'form-status error';
                }
                 if (submitButton) submitButton.disabled = false;
            }, 1500);
        });

        contactForm.querySelectorAll('input[required], textarea[required]').forEach(field => {
            field.addEventListener('input', () => {
                if (field.getAttribute('aria-invalid') === 'true') {
                    field.setAttribute('aria-invalid', 'false');
                     field.style.borderColor = '';
                }
            });
        });
    }

    /** Initialisation Lightbox pour Galerie */
    if (typeof basicLightbox !== 'undefined' && galleryLinks.length > 0) {
         galleryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const imageSrc = link.href;
                const imgInside = link.querySelector('img');
                const altText = imgInside?.alt || link.dataset.alt || "Image de la galerie Dave's Mexican Food Truck"; // Nom adapté

                const lightboxInstance = basicLightbox.create(
                    `<img src="${imageSrc}" alt="${altText}" style="max-height: 90vh; max-width: 90vw;">`,
                    { onClose: (instance) => { document.removeEventListener('keydown', closeLightboxOnEscape); } }
                );

                 const closeLightboxOnEscape = (event) => {
                    if (event.key === 'Escape') {
                        lightboxInstance.close();
                    }
                 };

                lightboxInstance.show(() => {
                    document.addEventListener('keydown', closeLightboxOnEscape);
                });
            });
        });
    } else if (galleryLinks.length > 0) {
        console.warn("BasicLightbox library not found. Gallery clicks will follow standard link behavior.");
    }

    // --- Ajout des Écouteurs d'Événements Globaux ---
    const debouncedScrollHandler = debounce(() => {
        handleHeaderScroll();
        handleBackToTop();
    }, 15);

    window.addEventListener('scroll', debouncedScrollHandler);

    // --- Exécution Initiale au Chargement ---
    handleHeaderScroll();
    handleBackToTop();

    console.log("Dave's Mexican Food Truck - Site Initialisé !"); // Message console adapté

}); // Fin de DOMContentLoaded