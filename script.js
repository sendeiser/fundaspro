// script.js

document.addEventListener('DOMContentLoaded', () => { // Ejecutar cuando el DOM esté listo

    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');
    const themeToggleDarkIconMobile = document.getElementById('theme-toggle-dark-icon-mobile');
    const themeToggleLightIconMobile = document.getElementById('theme-toggle-light-icon-mobile');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');

    // Función auxiliar para actualizar los iconos
    const updateIcons = (isDarkMode) => {
        if (themeToggleLightIcon && themeToggleDarkIcon && themeToggleLightIconMobile && themeToggleDarkIconMobile) {
            if (isDarkMode) {
                themeToggleLightIcon.classList.remove('hidden');
                themeToggleDarkIcon.classList.add('hidden');
                themeToggleLightIconMobile.classList.remove('hidden');
                themeToggleDarkIconMobile.classList.add('hidden');
            } else {
                themeToggleLightIcon.classList.add('hidden');
                themeToggleDarkIcon.classList.remove('hidden');
                themeToggleLightIconMobile.classList.add('hidden');
                themeToggleDarkIconMobile.classList.remove('hidden');
            }
        } else {
            console.error("Alguno de los iconos del toggle de tema no fue encontrado.");
        }
    };

    // Función para verificar y aplicar el tema inicial (basado en localStorage y preferencia del sistema)
    // Esta función se llama tanto en la carga inicial como después de que el DOM esté listo
    const applyInitialTheme = () => {
        const savedTheme = localStorage.getItem('theme'); // Usamos 'theme' como clave
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let isDarkMode;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-mode'); // Añade a <body>
            isDarkMode = true;
        } else {
            document.body.classList.remove('dark-mode'); // Asegura que no esté en <body>
            isDarkMode = false;
        }
        updateIcons(isDarkMode); // Actualiza iconos según el estado aplicado
    };

    // Aplicar tema inicial tan pronto como sea posible (antes de DOMContentLoaded si es posible)
    // Esto evita el "flash" de tema incorrecto. Lo llamaremos de nuevo en DOMContentLoaded por si acaso.
    // (El script en <head> se encargará de la primera aplicación)

    // Función para cambiar el tema
    const toggleTheme = () => {
        // Alterna la clase 'dark-mode' en el elemento <body>
        const isDarkMode = document.body.classList.toggle('dark-mode');
        updateIcons(isDarkMode); // Actualiza los iconos según el nuevo estado

        // Guarda la preferencia en localStorage
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light'); // Guarda 'dark' o 'light'
    };

    // --- Ejecución dentro de DOMContentLoaded ---

    // Re-verifica el tema inicial y actualiza iconos por si el script del head falló o hubo cambios
    applyInitialTheme();

    // Añade listeners solo si los botones existen
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    } else {
        console.error("Botón de toggle de tema (desktop) no encontrado.");
    }

    if (themeToggleBtnMobile) {
        themeToggleBtnMobile.addEventListener('click', toggleTheme);
    } else {
        console.error("Botón de toggle de tema (mobile) no encontrado.");
    }

    // Mobile Menu Toggle
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                     mobileMenu.classList.add('hidden');
                }
            });
        });
    } else {
        console.error("Botón de menú móvil o el contenedor del menú no fueron encontrados.");
    }

    // --- Personalización de fundas ---

    const imageInput = document.getElementById('imageLoader');
    const textInput = document.getElementById('textInput');
    const previewCanvas = document.getElementById('previewCanvas');
    const canvasContext = previewCanvas?.getContext('2d');

    if (!imageInput || !textInput || !previewCanvas || !canvasContext) {
        console.error('Elementos para personalización no encontrados');
        return;
    }

    let uploadedImage = null;

    const renderPreview = () => {
        if (!canvasContext) return;

        // Limpiar canvas
        canvasContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Fondo blanco para mejor visibilidad
        canvasContext.fillStyle = '#ffffff';
        canvasContext.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

        // Dibujar imagen si existe
        if (uploadedImage) {
            const aspectRatio = uploadedImage.width / uploadedImage.height;
            let drawWidth = previewCanvas.width;
            let drawHeight = drawWidth / aspectRatio;

            if (drawHeight > previewCanvas.height) {
                drawHeight = previewCanvas.height;
                drawWidth = drawHeight * aspectRatio;
            }

            const offsetX = (previewCanvas.width - drawWidth) / 2;
            const offsetY = (previewCanvas.height - drawHeight) / 2;

            canvasContext.drawImage(uploadedImage, offsetX, offsetY, drawWidth, drawHeight);
        }

        // Dibujar texto si existe
        const userText = textInput.value.trim();
        if (userText) {
            canvasContext.font = '24px sans-serif';
            canvasContext.fillStyle = '#000000';
            canvasContext.textAlign = 'center';
            canvasContext.fillText(userText, previewCanvas.width / 2, previewCanvas.height - 30);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => {
                uploadedImage = image;
                renderPreview();
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const handleTextChange = () => {
        renderPreview();
    };

    imageInput.addEventListener('change', handleImageUpload);
    textInput.addEventListener('input', handleTextChange);

    // Render inicial vacío
    renderPreview();

    // --- Cambio tamaño canvas según modelo ---
    const phoneModelSelect = document.getElementById('phoneModelSelect');

    if (phoneModelSelect && previewCanvas) {
        phoneModelSelect.addEventListener('change', () => {
            const model = phoneModelSelect.value;

            let width = 250;
            let height = 500;

            if (model === 'iphone-15-pro-max') {
                width = 300;
                height = 600;
            } else if (model === 'galaxy-s24-ultra') {
                width = 280;
                height = 560;
            } else if (model === 'pixel-8-pro') {
                width = 270;
                height = 540;
            } else if (model === 'iphone-14-pro-max') {
                width = 295;
                height = 590;
            } else if (model === 'galaxy-z-fold5') {
                width = 260;
                height = 520;
            }

            previewCanvas.width = width;
            previewCanvas.height = height;

            renderPreview();
        });
    }

    // --- Modal de imagen funda ---
    const productImages = document.querySelectorAll('#productos img');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeImageModalButton = document.getElementById('closeImageModal');

    if (productImages && imageModal && modalImage && closeImageModalButton) {
        productImages.forEach((img) => {
            img.classList.add('cursor-pointer');
            img.setAttribute('tabindex', '0');
            img.setAttribute('role', 'button');
            img.setAttribute('aria-label', 'Ver imagen en pantalla completa');

            const handleOpenModal = () => {
                modalImage.src = img.src;
                imageModal.classList.remove('hidden');
                imageModal.classList.add('flex');
            };

            img.addEventListener('click', handleOpenModal);
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleOpenModal();
                }
            });
        });

        closeImageModalButton.addEventListener('click', () => {
            imageModal.classList.add('hidden');
            imageModal.classList.remove('flex');
        });

        imageModal.addEventListener('click', (event) => {
            if (event.target === imageModal) {
                imageModal.classList.add('hidden');
                imageModal.classList.remove('flex');
            }
        });
    } else {
        console.error('Elementos del modal de imagen no encontrados');
    }

    // --- Modal de Pago ---
    const customizeButton = document.querySelector('button.mt-8.w-full');
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModalButton = document.getElementById('closePaymentModal');

    if (customizeButton && paymentModal && closePaymentModalButton) {
        customizeButton.addEventListener('click', () => {
            paymentModal.classList.remove('hidden');
            paymentModal.classList.add('flex');
        });

        closePaymentModalButton.addEventListener('click', () => {
            paymentModal.classList.add('hidden');
            paymentModal.classList.remove('flex');
        });

        paymentModal.addEventListener('click', (event) => {
            if (event.target === paymentModal) {
                paymentModal.classList.add('hidden');
                paymentModal.classList.remove('flex');
            }
        });
    } else {
        console.error('Elementos del modal de pago no encontrados');
    }

    // --- Chatbox IA con backend proxy ---
    const toggleChatboxButton = document.getElementById('toggleChatbox');
    const chatbox = document.getElementById('chatbox');
    const closeChatboxButton = document.getElementById('closeChatbox');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendChatButton = document.getElementById('sendChat');

    if (toggleChatboxButton && chatbox && closeChatboxButton && chatMessages && chatInput && sendChatButton) {
        toggleChatboxButton.addEventListener('click', () => {
            chatbox.classList.toggle('hidden');
            chatbox.classList.toggle('flex');
        });

        closeChatboxButton.addEventListener('click', () => {
            chatbox.classList.add('hidden');
            chatbox.classList.remove('flex');
        });

        const appendMessage = (text, sender = 'user') => {
            const messageDiv = document.createElement('div');
            messageDiv.className = sender === 'user' ? 'text-right' : 'text-left';
            messageDiv.innerHTML = `<span class="inline-block px-3 py-2 rounded-lg max-w-[70%] break-words whitespace-pre-wrap ${sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}">${text}</span>`;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const handleSendMessage = async () => {
            const message = chatInput.value.trim();
            if (!message) return;

            appendMessage(message, 'user');
            chatInput.value = '';

            appendMessage('Escribiendo...', 'bot');

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message })
                });

                const data = await response.json();

                const botReply = data.reply?.trim() || data.choices?.[0]?.message?.content?.trim() || 'No pude entender, intenta de nuevo.';
                chatMessages.lastChild.remove();
                appendMessage(botReply, 'bot');
            } catch (error) {
                console.error(error);
                chatMessages.lastChild.remove();
                appendMessage('Ocurrió un error al conectar con la IA.', 'bot');
            }
        };

        sendChatButton.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    } else {
        console.error('Elementos del chatbox no encontrados');
    }

}); // Fin de DOMContentLoaded