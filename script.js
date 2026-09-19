document.addEventListener("DOMContentLoaded", () => {


    /* =====================================
       NAVBAR
    ===================================== */

    const navbar = document.getElementById("navbar");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }

    });


    /* =====================================
       MOBILE MENU
    ===================================== */

    const menuButton = document.getElementById("menuButton");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileClose = document.getElementById("mobileClose");

    menuButton.addEventListener("click", () => {
        mobileMenu.classList.add("active");
        document.body.style.overflow = "hidden";
    });


    mobileClose.addEventListener("click", closeMobileMenu);


    document.querySelectorAll(".mobile-menu a").forEach(link => {

        link.addEventListener("click", closeMobileMenu);

    });


    function closeMobileMenu() {

        mobileMenu.classList.remove("active");

        document.body.style.overflow = "";

    }


    /* =====================================
       AUTOMATIC GALLERY
    ===================================== */

    const galleryTrack = document.getElementById("galleryTrack");
    const galleryLoading = document.getElementById("galleryLoading");
    const galleryEmpty = document.getElementById("galleryEmpty");

    const galleryPrev = document.getElementById("galleryPrev");
    const galleryNext = document.getElementById("galleryNext");

    const galleryCurrent = document.getElementById("galleryCurrent");
    const galleryTotal = document.getElementById("galleryTotal");

    const galleryDots = document.getElementById("galleryDots");

    let galleryImages = [];

    let currentSlide = 0;

    let galleryTimer;


    /*
       gallery.php automatically scans the
       /gallery/ folder and returns image names.
    */

    async function loadGallery() {

        try {

            const response = await fetch(
                "gallery.php?time=" + Date.now()
            );

            if (!response.ok) {
                throw new Error("Gallery request failed");
            }

            const images = await response.json();

            galleryLoading.style.display = "none";


            if (!Array.isArray(images) || images.length === 0) {

                galleryEmpty.style.display = "grid";

                return;

            }


            galleryImages = images;

            galleryTotal.textContent =
                String(images.length).padStart(2, "0");


            createGallerySlides();

            createGalleryDots();

            updateGallery();

            startGalleryAutoplay();

        }

        catch (error) {

            console.error(
                "Gallery error:",
                error
            );

            galleryLoading.textContent =
                "Unable to load gallery.";

        }

    }


    function createGallerySlides() {

        galleryTrack.innerHTML = "";

        galleryImages.forEach((image, index) => {

            const slide =
                document.createElement("div");

            slide.className = "gallery-slide";


            const img =
                document.createElement("img");

            img.src = image;

            img.alt =
                "YES Cricket Arena gallery image " +
                (index + 1);

            img.loading =
                index === 0
                    ? "eager"
                    : "lazy";


            slide.appendChild(img);

            galleryTrack.appendChild(slide);

        });

    }


    function createGalleryDots() {

        galleryDots.innerHTML = "";

        galleryImages.forEach((_, index) => {

            const dot =
                document.createElement("button");

            dot.className = "gallery-dot";

            dot.setAttribute(
                "aria-label",
                "Go to image " + (index + 1)
            );


            dot.addEventListener("click", () => {

                currentSlide = index;

                updateGallery();

                restartGalleryAutoplay();

            });


            galleryDots.appendChild(dot);

        });

    }


    function updateGallery() {

        if (!galleryImages.length) {
            return;
        }


        galleryTrack.style.transform =
            `translateX(-${currentSlide * 100}%)`;


        galleryCurrent.textContent =
            String(currentSlide + 1).padStart(2, "0");


        document
            .querySelectorAll(".gallery-dot")
            .forEach((dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === currentSlide
                );

            });

    }


    function nextGallery() {

        if (!galleryImages.length) {
            return;
        }

        currentSlide =
            (currentSlide + 1) %
            galleryImages.length;

        updateGallery();

    }


    function previousGallery() {

        if (!galleryImages.length) {
            return;
        }

        currentSlide =
            (currentSlide - 1 +
             galleryImages.length) %
            galleryImages.length;

        updateGallery();

    }


    galleryNext.addEventListener(
        "click",
        () => {

            nextGallery();

            restartGalleryAutoplay();

        }
    );


    galleryPrev.addEventListener(
        "click",
        () => {

            previousGallery();

            restartGalleryAutoplay();

        }
    );


    function startGalleryAutoplay() {

        clearInterval(galleryTimer);


        galleryTimer = setInterval(() => {

            nextGallery();

        }, 5000);

    }


    function restartGalleryAutoplay() {

        startGalleryAutoplay();

    }


    /* =====================================
       GALLERY SWIPE
    ===================================== */

    let touchStartX = 0;
    let touchEndX = 0;


    galleryTrack.addEventListener(
        "touchstart",
        event => {

            touchStartX =
                event.changedTouches[0].screenX;

        },
        { passive: true }
    );


    galleryTrack.addEventListener(
        "touchend",
        event => {

            touchEndX =
                event.changedTouches[0].screenX;

            handleSwipe();

        },
        { passive: true }
    );


    function handleSwipe() {

        const difference =
            touchStartX - touchEndX;


        if (Math.abs(difference) < 50) {
            return;
        }


        if (difference > 0) {

            nextGallery();

        } else {

            previousGallery();

        }


        restartGalleryAutoplay();

    }


    /* =====================================
       FULLSCREEN LIGHTBOX
    ===================================== */

    const lightbox =
        document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxClose =
        document.getElementById("lightboxClose");

    const lightboxPrev =
        document.getElementById("lightboxPrev");

    const lightboxNext =
        document.getElementById("lightboxNext");

    const lightboxNumber =
        document.getElementById("lightboxNumber");

    const fullscreenGallery =
        document.getElementById("fullscreenGallery");


    function openLightbox(index) {

        if (!galleryImages.length) {
            return;
        }


        currentSlide = index;

        lightboxImage.src =
            galleryImages[currentSlide];


        lightboxNumber.textContent =
            String(currentSlide + 1)
                .padStart(2, "0");


        lightbox.classList.add("active");

        document.body.style.overflow = "hidden";

    }


    function closeLightbox() {

        lightbox.classList.remove("active");

        document.body.style.overflow = "";

    }


    function lightboxNextImage() {

        currentSlide =
            (currentSlide + 1) %
            galleryImages.length;

        openLightbox(currentSlide);

    }


    function lightboxPreviousImage() {

        currentSlide =
            (currentSlide - 1 +
             galleryImages.length) %
            galleryImages.length;

        openLightbox(currentSlide);

    }


    fullscreenGallery.addEventListener(
        "click",
        () => openLightbox(currentSlide)
    );


    galleryTrack.addEventListener(
        "click",
        event => {

            const slide =
                event.target.closest(
                    ".gallery-slide"
                );

            if (!slide) {
                return;
            }


            const slides =
                [...galleryTrack.children];

            const index =
                slides.indexOf(slide);


            if (index !== -1) {
                openLightbox(index);
            }

        }
    );


    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );


    lightboxNext.addEventListener(
        "click",
        lightboxNextImage
    );


    lightboxPrev.addEventListener(
        "click",
        lightboxPreviousImage
    );


    lightbox.addEventListener(
        "click",
        event => {

            if (event.target === lightbox) {
                closeLightbox();
            }

        }
    );


    /* =====================================
       KEYBOARD CONTROLS
    ===================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (!lightbox.classList.contains("active")) {
                return;
            }


            if (event.key === "Escape") {
                closeLightbox();
            }


            if (event.key === "ArrowRight") {
                lightboxNextImage();
            }


            if (event.key === "ArrowLeft") {
                lightboxPreviousImage();
            }

        }
    );


    /* =====================================
       REVEAL ANIMATIONS
    ===================================== */

    const revealElements =
        document.querySelectorAll(".reveal");


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.15
            }
        );


    revealElements.forEach(element => {

        observer.observe(element);

    });


    /* =====================================
       BOOKING FORM
    ===================================== */

    const bookingForm =
        document.getElementById("bookingForm");


    bookingForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const formData =
                new FormData(bookingForm);


            const name =
                formData.get("name");

            const phone =
                formData.get("phone");

            const service =
                formData.get("service");

            const message =
                formData.get("message");


            /*
               Change this number to your
               actual WhatsApp number.

               IMPORTANT:
               Use country code without +
               Example:
               919876543210
            */

            const whatsappNumber =
                "+917827444706";


            const whatsappMessage =
                `Hello YES Cricket Arena,

I am ${name}.

Phone: ${phone}

I am interested in:
${service}

Message:
${message || "No additional message."}`;


            const whatsappURL =
                "https://wa.me/" +
                whatsappNumber +
                "?text=" +
                encodeURIComponent(
                    whatsappMessage
                );


            window.open(
                whatsappURL,
                "_blank"
            );

        }
    );


    /* =====================================
       FOOTER YEAR
    ===================================== */

    document.getElementById("year")
        .textContent =
        new Date().getFullYear();


    /* =====================================
       START GALLERY
    ===================================== */

    loadGallery();

});

