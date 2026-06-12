/**
 * Krizz Portfolio SPA - Application Logic
 * Implements: dynamic SPA routing, voice note player simulation,
 * multi-step modal form, diagnostic quiz, media gallery lightbox,
 * scroll-triggered animations, and interactive mock payment checkout.
 */

document.addEventListener('DOMContentLoaded', () => {
    initRouting();
    initScrollAnimations();
    initVoicePlayer();
    initIntakeForm();
    initPathfinderQuiz();
    initEGXGallery();
    initPaymentCheckout();
});

/* ==========================================================================
   1. SINGLE PAGE ROUTING (SPA)
   ========================================================================== */
function initRouting() {
    const pages = document.querySelectorAll('.page-view');
    const navItems = document.querySelectorAll('.nav-item');
    const defaultHash = '#/';

    function routePage() {
        const currentHash = window.location.hash || defaultHash;
        
        // Match Hash to Page Element
        let matched = false;
        pages.forEach(page => {
            const pageId = page.getAttribute('id');
            const targetHash = `#/${pageId.replace('page-', '')}`;
            
            // Map Home page properly
            const isHomeMapping = (currentHash === '#/' || currentHash === '') && pageId === 'page-home';
            
            if (currentHash === targetHash || isHomeMapping) {
                page.classList.add('active');
                matched = true;
            } else {
                page.classList.remove('active');
            }
        });

        // Fallback to Home if invalid hash
        if (!matched) {
            window.location.hash = defaultHash;
            return;
        }

        // Update Nav Menu active indicators
        navItems.forEach(item => {
            const itemPage = item.getAttribute('data-page');
            const pageSlug = currentHash.replace('#/', '') || 'home';
            
            if (itemPage === pageSlug) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Scroll to top on page change
        window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Bind route listeners
    window.addEventListener('hashchange', routePage);
    routePage(); // Run initially
}

/* ==========================================================================
   2. SCROLL TRIGGERED ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                    observer.unobserve(entry.target); // Trigger once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => el.classList.add('appear'));
    }
}

/* ==========================================================================
   3. INTERACTIVE VOICE NOTE PLAYER
   ========================================================================== */
function initVoicePlayer() {
    const audio = document.getElementById('vp-audio-element');
    const playPauseBtn = document.getElementById('voice-play-pause');
    const playIcon = playPauseBtn.querySelector('.vp-play-icon');
    const pauseIcon = playPauseBtn.querySelector('.vp-pause-icon');
    const waveform = document.getElementById('equalizer-waveform');
    const timeDisplay = document.getElementById('voice-time');
    
    // Waveform heights setup
    const defaultWaveHeights = [15, 25, 10, 35, 20, 30, 15, 40, 25, 10, 35, 20, 30, 15, 25];
    let animationInterval = null;

    // Build the visual equalizer bars
    waveform.innerHTML = '';
    defaultWaveHeights.forEach(height => {
        const bar = document.createElement('div');
        bar.className = 'wave-bar';
        bar.style.height = `${height}%`;
        waveform.appendChild(bar);
    });

    const bars = waveform.querySelectorAll('.wave-bar');

    function togglePlay() {
        if (audio.paused) {
            // Attempt playing audio
            audio.play().then(() => {
                onPlayState();
            }).catch(err => {
                // If audio is missing/blocked, simulate playback visually
                console.warn('Audio play failed or blocked, running visual simulation: ', err);
                onPlayState();
                simulateAudioDuration();
            });
        } else {
            audio.pause();
            onPauseState();
        }
    }

    function onPlayState() {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        waveform.classList.add('playing');
        startEqualizerAnimation();
    }

    function onPauseState() {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        waveform.classList.remove('playing');
        stopEqualizerAnimation();
    }

    // Smooth bounce simulation for equalizer
    function startEqualizerAnimation() {
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = setInterval(() => {
            bars.forEach(bar => {
                // Generate natural frequency wave scaling
                const randomScale = Math.random() * 80 + 15;
                bar.style.height = `${randomScale}%`;
            });
        }, 110);
    }

    function stopEqualizerAnimation() {
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        // Return to standard heights
        bars.forEach((bar, idx) => {
            bar.style.height = `${defaultWaveHeights[idx]}%`;
        });
    }

    // Audio time progression display
    audio.addEventListener('timeupdate', () => {
        const current = formatTime(audio.currentTime);
        const duration = isNaN(audio.duration) ? '0:42' : formatTime(audio.duration);
        timeDisplay.textContent = `${current} / ${duration}`;
    });

    audio.addEventListener('ended', () => {
        onPauseState();
        audio.currentTime = 0;
        timeDisplay.textContent = `0:00 / 0:42`;
    });

    // Simulated playback progress helper if file doesn't load/exist
    let simTime = 0;
    let simInterval = null;
    function simulateAudioDuration() {
        if (simInterval) clearInterval(simInterval);
        simInterval = setInterval(() => {
            if (audio.paused && !waveform.classList.contains('playing')) {
                clearInterval(simInterval);
                return;
            }
            simTime += 0.5;
            if (simTime >= 42) {
                simTime = 0;
                onPauseState();
                timeDisplay.textContent = `0:00 / 0:42`;
                clearInterval(simInterval);
            } else {
                timeDisplay.textContent = `${formatTime(simTime)} / 0:42`;
            }
        }, 500);
    }

    function formatTime(secs) {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    playPauseBtn.addEventListener('click', togglePlay);
}

/* ==========================================================================
   4. MULTI-STEP QUALIFYING DIRECTION APPLICATION FORM (WITH LOCALSTORAGE)
   ========================================================================== */
function initIntakeForm() {
    const modal = document.getElementById('apply-modal');
    const openTriggers = document.querySelectorAll('.open-apply-trigger, #open-apply-modal');
    const closeBtn = document.getElementById('close-apply-modal');
    const form = document.getElementById('direction-application-form');
    const steps = form.querySelectorAll('.form-step');
    const progressBar = document.getElementById('apply-progress');
    
    let currentStep = 1;

    // Open/Close Modal
    openTriggers.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            restoreFormData();
            setStep(1);
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Step navigation buttons
    form.querySelectorAll('.next-step').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                saveFormData();
                setStep(currentStep + 1);
            }
        });
    });

    form.querySelectorAll('.prev-step').forEach(btn => {
        btn.addEventListener('click', () => {
            setStep(currentStep - 1);
        });
    });

    function setStep(stepNum) {
        currentStep = stepNum;
        steps.forEach(step => {
            const stepId = parseInt(step.getAttribute('data-step'));
            if (stepId === currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Progress bar sizing
        const percentage = (currentStep / steps.length) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    // Basic fields validation per step
    function validateStep(stepId) {
        const stepContainer = form.querySelector(`.form-step[data-step="${stepId}"]`);
        const inputs = stepContainer.querySelectorAll('input[required], select[required], textarea[required]');
        
        let isValid = true;
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.reportValidity();
                isValid = false;
            } else if (input.type === 'checkbox' && !input.checked) {
                input.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }

    // LocalStorage Data Persistence Helpers
    const STORAGE_KEY = 'krizz_application_draft';
    function saveFormData() {
        const data = {
            name: document.getElementById('app-name').value,
            social: document.getElementById('app-social').value,
            biz: document.getElementById('app-biz').value,
            revenue: document.getElementById('app-revenue').value,
            blocker: document.getElementById('app-blocker').value
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function restoreFormData() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                document.getElementById('app-name').value = data.name || '';
                document.getElementById('app-social').value = data.social || '';
                document.getElementById('app-biz').value = data.biz || '';
                document.getElementById('app-revenue').value = data.revenue || '';
                document.getElementById('app-blocker').value = data.blocker || '';
            } catch (e) {
                console.error('Failed to parse cached draft', e);
            }
        }
    }

    // Final Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateStep(currentStep)) return;

        const name = document.getElementById('app-name').value.trim();
        const social = document.getElementById('app-social').value.trim();
        const biz = document.getElementById('app-biz').value.trim();
        const revenue = document.getElementById('app-revenue').value;
        const blocker = document.getElementById('app-blocker').value.trim();

        // Sanitize and structure message for Krizz
        const message = `Hey Krizz, I'd like to apply for Direction.\n\n` +
                        `- Name: ${name}\n` +
                        `- Social: ${social}\n` +
                        `- Business: ${biz}\n` +
                        `- Revenue: ${revenue}\n` +
                        `- Main bottleneck: ${blocker}`;
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappLink = `https://wa.me/447727053922?text=${encodedMessage}`;
        
        // Clear drafts from storage
        localStorage.removeItem(STORAGE_KEY);
        form.reset();
        closeModal();

        // Redirect to WhatsApp
        window.open(whatsappLink, '_blank', 'noopener');
    });
}

/* ==========================================================================
   5. DIAGNOSTIC PATHFINDER QUIZ
   ========================================================================== */
function initPathfinderQuiz() {
    const container = document.getElementById('pathfinder-quiz');
    
    // Quiz Questions Data Model
    const questions = [
        {
            step: 1,
            question: "Where are you currently hitting a wall?",
            options: [
                { text: "I'm struggling to make or scale consistent revenue.", value: "revenue" },
                { text: "I've made the money, but my health, fitness, or focus is slipping.", value: "alignment" },
                { text: "I need specialized logistics/resources (properties, motor fleet insurance).", value: "logistics" }
            ]
        },
        {
            step: 2,
            question: "What is your primary commitment style?",
            options: [
                { text: "Self-paced reading, analyzing, and applying theories.", value: "reading" },
                { text: "Engaging in communities and learning with other operators.", value: "community" },
                { text: "High-intensity, direct 1-on-1 accountability.", value: "one-on-one" }
            ]
        },
        {
            step: 3,
            question: "What resource budget are you willing to invest in your development today?",
            options: [
                { text: "£1 to £20 (Entry-level guidance or group community access)", value: "low" },
                { text: "£1,000 (Commitment to direct 90-day 1-on-1 auditing)", value: "high" }
            ]
        }
    ];

    let userAnswers = {};
    let activeStepIndex = 0;

    function renderQuestion(stepIdx) {
        const qData = questions[stepIdx];
        const progressPercentage = ((stepIdx + 1) / questions.length) * 100;

        container.innerHTML = `
            <div class="quiz-step active">
                <div class="quiz-progress">
                    <span class="step-num">Step ${qData.step} of 3</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%;"></div>
                    </div>
                </div>
                <h3 class="quiz-question">${qData.question}</h3>
                <div class="quiz-options">
                    ${qData.options.map(opt => `
                        <button class="quiz-opt-btn" data-value="${opt.value}">${opt.text}</button>
                    `).join('')}
                </div>
            </div>
        `;

        // Add selection listener
        container.querySelectorAll('.quiz-opt-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = e.currentTarget.getAttribute('data-value');
                userAnswers[qData.step] = val;
                
                // Advance or finish
                if (activeStepIndex < questions.length - 1) {
                    activeStepIndex++;
                    renderQuestion(activeStepIndex);
                } else {
                    renderRecommendation();
                }
            });
        });
    }

    function renderRecommendation() {
        const ans1 = userAnswers[1];
        const ans2 = userAnswers[2];
        const ans3 = userAnswers[3];

        let title = "";
        let badge = "";
        let desc = "";
        let ctaText = "";
        let targetType = "payment"; // Default to interactive payment checkout
        let targetItemName = "Socratic Study Space";
        let targetItemPrice = "£20.00/mo";
        let ctaHref = "";
        let secondaryCtaText = "";
        let secondaryCtaHref = "";
        let isApplyModalTrigger = false;

        // Path Matching Logic
        if (ans3 === "high" || ans1 === "alignment" || ans2 === "one-on-one") {
            // Direction Path
            badge = "Premium Mentoring";
            title = "Direction Program";
            desc = "You've proven you can generate capital, but your fitness, focus, or personal alignment is lagging. Direction provides 90 days of direct 1-on-1 WhatsApp auditing to reshape the man behind the money.";
            ctaText = "Apply for Direction (£1,000)";
            isApplyModalTrigger = true;
            secondaryCtaText = "View Details";
            secondaryCtaHref = "#/direction";
        } else if (ans1 === "logistics") {
            // Services Path
            badge = "Direct Connections";
            title = "Specialized Services";
            desc = "You need direct connections without the agency markups. We provide vetted direct links for UK and Medina properties, or fleet and trade motor insurance brokers.";
            ctaText = "Explore Services";
            ctaHref = "#/services";
            targetType = "link";
            secondaryCtaText = "Message WhatsApp";
            secondaryCtaHref = "https://wa.me/447727053922";
        } else if (ans2 === "community" || ans1 === "revenue") {
            // Study Space
            badge = "Community & Accountability";
            title = "Socratic Study Space";
            desc = "You need structural guidance, peer accountability, and a curated learning curriculum to sharpen your business and life. Join other operators in the Study Space.";
            ctaText = "Join Socratic Study Space (£20/mo)";
            targetItemName = "Socratic Study Space";
            targetItemPrice = "£20.00/mo";
            secondaryCtaText = "Read the Book first";
            secondaryCtaHref = "https://winnerkrizz.gumroad.com/";
        } else {
            // Entry Level
            badge = "Foundational Roadmap";
            title = "The Slave Mind Protocol";
            desc = "Start with the absolute foundations. The Slave Mind Protocol details the daily structures, training methodologies, and focus routines for the price of a coffee.";
            ctaText = "Grab the Protocol (£1)";
            targetItemName = "The Slave Mind Protocol";
            targetItemPrice = "£1.00";
            secondaryCtaText = "Socratic Study Space";
            secondaryCtaHref = "https://whop.com/krizz-c7c9?a=winnerkrizz";
        }

        container.innerHTML = `
            <div class="quiz-result">
                <span class="result-badge">${badge}</span>
                <h3 class="result-title">${title}</h3>
                <p class="result-desc">${desc}</p>
                <div class="btn-group" style="margin-top: 0; max-width: 100%;">
                    ${isApplyModalTrigger ? 
                        `<button class="btn-primary open-apply-trigger">Apply Now</button>` :
                        (targetType === "payment" ?
                            `<button class="btn-primary open-checkout-quiz" data-item="${targetItemName}" data-price="${targetItemPrice}">${ctaText}</button>` :
                            `<a href="${ctaHref}" class="btn-primary">${ctaText}</a>`
                        )
                    }
                    ${secondaryCtaHref.startsWith('#') ? 
                        `<a href="${secondaryCtaHref}" class="btn-secondary">${secondaryCtaText}</a>` :
                        `<a href="${secondaryCtaHref}" target="_blank" rel="noopener" class="btn-secondary">${secondaryCtaText}</a>`
                    }
                </div>
                <button class="quiz-restart-btn" id="restart-quiz">Restart Pathfinder</button>
            </div>
        `;

        // Attach listeners for quiz dynamic output triggers
        if (isApplyModalTrigger) {
            container.querySelector('.open-apply-trigger').addEventListener('click', () => {
                document.getElementById('apply-modal').classList.add('active');
            });
        }

        const openCheckoutQuizBtn = container.querySelector('.open-checkout-quiz');
        if (openCheckoutQuizBtn) {
            openCheckoutQuizBtn.addEventListener('click', (e) => {
                const name = e.currentTarget.getAttribute('data-item');
                const price = e.currentTarget.getAttribute('data-price');
                window.openCheckoutModal(name, price);
            });
        }

        container.querySelector('#restart-quiz').addEventListener('click', () => {
            activeStepIndex = 0;
            userAnswers = {};
            renderQuestion(activeStepIndex);
        });
    }

    // Launch quiz
    renderQuestion(activeStepIndex);
}

/* ==========================================================================
   6. EGX MEDIA GALLERY & FULL LIGHTBOX VIEW
   ========================================================================== */
function initEGXGallery() {
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCap = document.getElementById('lightbox-caption');
    const closeBtn = document.getElementById('close-lightbox');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const galleryItems = document.querySelectorAll('.grid-item-wrap');
    
    let activeIdx = 0;
    const imagesData = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt')
        };
    });

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            activeIdx = index;
            openLightbox();
        });
    });

    function openLightbox() {
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        updateLightboxContent();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
    }

    function updateLightboxContent() {
        const currentData = imagesData[activeIdx];
        lightboxImg.setAttribute('src', currentData.src);
        lightboxImg.setAttribute('alt', currentData.alt);
        lightboxCap.textContent = currentData.alt;
    }

    function navigateLightbox(direction) {
        activeIdx = (activeIdx + direction + imagesData.length) % imagesData.length;
        updateLightboxContent();
    }

    // Event Bindings
    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => navigateLightbox(-1));
    nextBtn.addEventListener('click', () => navigateLightbox(1));
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

/* ==========================================================================
   7. INTERACTIVE MOCK PAYMENT CHECKOUT SYSTEM
   ========================================================================== */
function initPaymentCheckout() {
    const checkoutModal = document.getElementById('checkout-modal');
    const closeBtn = document.getElementById('close-checkout-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const mainContent = document.getElementById('checkout-main-content');
    const successScreen = document.getElementById('checkout-success-screen');
    const payBtn = document.getElementById('btn-pay-now');
    const applePayBtn = document.getElementById('btn-mock-apple-pay');
    
    const summaryName = document.getElementById('checkout-summary-name');
    const summaryPrice = document.getElementById('checkout-summary-price');
    const itemTitle = document.getElementById('checkout-item-title');
    
    // Globally expose checkout trigger so pathfinder quiz can invoke it
    window.openCheckoutModal = function(itemName, itemPrice) {
        // Reset states
        mainContent.style.display = 'block';
        successScreen.style.display = 'none';
        checkoutForm.reset();
        payBtn.textContent = itemName.includes('Subscription') || itemName.includes('Space') ? 'Pay and Subscribe' : 'Pay Now';
        payBtn.disabled = false;
        
        // Load details
        itemTitle.textContent = `Checkout`;
        summaryName.textContent = itemName;
        summaryPrice.textContent = itemPrice;
        
        // Show modal
        checkoutModal.classList.add('active');
        checkoutModal.setAttribute('aria-hidden', 'false');
    };

    function closeCheckout() {
        checkoutModal.classList.remove('active');
        checkoutModal.setAttribute('aria-hidden', 'true');
    }

    closeBtn.addEventListener('click', closeCheckout);
    document.getElementById('close-success-btn').addEventListener('click', closeCheckout);
    
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckout();
    });

    // Intercept external Whop and Gumroad billing links to route to our local checkout
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href') || '';
        if (href.includes('whop.com') || href.includes('gumroad.com')) {
            e.preventDefault();
            
            let name = "Socratic Study Space";
            let price = "£20.00/mo";
            
            if (href.includes('gumroad.com')) {
                name = "The Slave Mind Protocol";
                price = "£1.00";
            }
            
            window.openCheckoutModal(name, price);
        }
    });

    // Credit Card formatting listeners (delightful micro-interactions)
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvcInput = document.getElementById('card-cvc');

    cardNumberInput.addEventListener('input', (e) => {
        // Formats card values with gaps: 4242 4242...
        let val = e.target.value.replace(/\D/g, '');
        let formatted = val.match(/.{1,4}/g);
        e.target.value = formatted ? formatted.join(' ') : '';
    });

    cardExpiryInput.addEventListener('input', (e) => {
        // Formats expiry values: MM/YY
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) {
            e.target.value = val.substring(0,2) + '/' + val.substring(2,4);
        } else {
            e.target.value = val;
        }
    });

    cardCvcInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Submit Handler: Simulate secure gateway connection with delay
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        payBtn.disabled = true;
        payBtn.textContent = "Processing Securely...";
        
        setTimeout(() => {
            // Transition to Success screen
            mainContent.style.display = 'none';
            successScreen.style.display = 'block';
        }, 1600);
    });

    // Apple Pay Simulation handler
    applePayBtn.addEventListener('click', () => {
        applePayBtn.style.transform = 'scale(0.98)';
        applePayBtn.style.opacity = '0.8';
        
        setTimeout(() => {
            applePayBtn.style.transform = 'scale(1)';
            applePayBtn.style.opacity = '1';
            
            // Transition to Success screen
            mainContent.style.display = 'none';
            successScreen.style.display = 'block';
        }, 1000);
    });
}
