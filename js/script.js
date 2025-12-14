/* script.js */
/*
  Features:
  - Loader & Cover
  - Fullscreen open
  - Show/Hide sections
  - Bottom menu navigation (with reset & smooth center)
  - Background music auto + toggle
  - QR modal
  - Gallery preview
  - RSVP + Wishes storage
*/
let isSubmittingWish = false;
let lastWishHash = null;

(() => {
    // =============================
    // ELEMENTS
    // =============================
    const loader = document.getElementById('loader');
    const frame = document.getElementById('frame');
    const cover = document.getElementById('halamancover');
    const sectionsContainer = document.getElementById('sections');
    const openBtn = document.getElementById('openBtn');
    const qrBtn = document.getElementById('qrBtn');
    const bottomMenu = document.getElementById('bottomMenu');
    const menuTrack = document.getElementById('menuTrack');
    const menuItems = Array.from(document.querySelectorAll('.menu-item'));
    const sections = Array.from(document.querySelectorAll('.section'));
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const audio = document.getElementById('bgAudio');
    const musicBtn = document.getElementById('music-btn');

    // =============================
    // GUEST NAME HANDLER
    // =============================
    const params = new URLSearchParams(window.location.search);
    const guest = params.get('to')
        ? decodeURIComponent(params.get('to').replace(/\+/g, ' '))
        : 'Tamu Undangan';
    const guestNameEl = document.getElementById('guestName');
    if (guestNameEl) guestNameEl.textContent = guest;

    // =============================
    // PAGE LOADER
    // =============================
    // window.addEventListener('load', () => {
    //     setTimeout(() => {
    //         if (loader) loader.classList.add('hide');
    //         setTimeout(() => loader.style.display = 'none', 500);
    //     }, 2000);
    //     tryAutoplay();

    // });

    window.addEventListener('load', () => {
    setTimeout(() => {
        loader?.classList.add('hide');
        setTimeout(() => loader.style.display = 'none', 300);
    }, 500); // max 0.5 detik
});





    // =============================
    // FULLSCREEN HELPER
    // =============================
    async function enterFullScreen(el) {
        if (!el) return;
        try {
            if (el.requestFullscreen) await el.requestFullscreen();
            else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
        } catch { /* ignore */ }
    }

    // =============================
    // OPEN INVITATION BUTTON
    // =============================
    let current = -1;
    let allowCenterMenu = true;

    openBtn.addEventListener('click', async () => {
        await enterFullScreen(document.documentElement);

        if (loader) loader.style.display = 'none';

        // Reset menu posisi ke awal
        if (menuTrack) menuTrack.style.transform = 'translateX(0)';

        // Matikan sementara center otomatis
        allowCenterMenu = false;

        // Sembunyikan cover
        if (cover) {
            cover.classList.add('exit');
            cover.classList.remove('visible');
        }

        // Setelah animasi selesai
        setTimeout(() => {
            if (cover) cover.style.display = 'none';
            if (sectionsContainer) sectionsContainer.classList.add('visible');
            bottomMenu?.classList.remove('hidden');
            showSectionByIdx(1); // buka section pertama
            allowCenterMenu = true;
        }, 350);
    });

    // =============================
    // SECTION NAVIGATION
    // =============================
    function showSectionByIdx(idx) {
        if (idx < 0 || idx >= sections.length) return;

        if (cover && cover.classList.contains('visible')) {
            cover.classList.add('exit');
            cover.classList.remove('visible');
        }

        bottomMenu?.classList.remove('hidden');

        sections.forEach(s => s.classList.remove('visible'));
        const target = sections[idx];
        setTimeout(() => target.classList.add('visible'), 30);

        current = idx;
        updateActiveMenu(idx);

        if (allowCenterMenu) centerMenu(idx);
    }

    // =============================
    // MENU INTERACTION (with return to cover)
    // =============================
    menuItems.forEach(mi => {
        mi.addEventListener('click', () => {
            const idx = Number(mi.dataset.idx);

            // Jika menu pertama diklik → kembali ke cover
            if (idx === 0) {
                sections.forEach(s => s.classList.remove('visible'));
                bottomMenu?.classList.add('hidden');

                if (menuTrack) menuTrack.style.transform = 'translateX(0)';

                if (cover) {
                    cover.style.display = 'flex';
                    cover.classList.remove('exit');
                    setTimeout(() => cover.classList.add('visible'), 30);
                }

                current = -1;
                updateActiveMenu(-1);
                return;
            }

            showSectionByIdx(idx);
        });
    });

    function updateActiveMenu(idx) {
        menuItems.forEach(m =>
            m.classList.toggle('active', Number(m.dataset.idx) === idx)
        );
    }

    // =============================
    // MENU SMOOTH ANIMATION HELPER
    // =============================
    function animateMenuScroll(targetX) {
        // Ambil posisi transform saat ini
        const currentTransform = menuTrack.style.transform.match(/-?\d+(\.\d+)?/);
        const currentX = currentTransform ? parseFloat(currentTransform[0]) : 0;

        // Selisih yang akan dianimasikan
        const diff = targetX - currentX;
        let start = null;

        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / 350, 1);
            const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const newX = currentX + diff * ease;
            menuTrack.style.transform = `translateX(-${newX}px)`;
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    // =============================
    // RETINA-READY CENTERING MENU
    // =============================
    function centerMenu(idx) {
        const viewport = document.querySelector('.menu-viewport');
        if (!viewport || !menuItems.length) return;

        const total = menuItems.length;
        const item = menuItems[idx];
        if (!item) return;

        const itemRect = item.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        const trackWidth = menuTrack.scrollWidth;
        const viewportWidth = viewportRect.width;

        // Rata-rata lebar item
        const avgItemWidth = trackWidth / total;
        const visibleCount = Math.floor(viewportWidth / avgItemWidth);

        // Batas awal dan akhir
        const earlyLimit = 2;
        const lateLimit = total - 3;

        // Posisi ideal agar item di tengah
        const desiredCenter = item.offsetLeft - (viewportWidth / 2 - item.offsetWidth / 2);

        const maxScroll = trackWidth - viewportWidth;
        let scrollPos = desiredCenter;

        if (idx <= earlyLimit) scrollPos = 0;
        else if (idx >= lateLimit) scrollPos = maxScroll;
        else scrollPos = Math.max(0, Math.min(scrollPos, maxScroll));

        // Animasi perpindahan menu
        animateMenuScroll(scrollPos);
    }




    // =============================
    // MODAL HANDLER
    // =============================
    function showModal(html) {
        modal.classList.remove('hidden');
        modalBody.innerHTML = html;
    }
    function closeModal() {
        modal.classList.add('hidden');
        modalBody.innerHTML = '';
    }
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
        if (e.target === modal.querySelector('.modal-backdrop')) closeModal();
    });

    // =============================
    // QR POPUP
    // =============================
    if (qrBtn) {
        qrBtn.addEventListener('click', () => {
            const guestName = encodeURIComponent(params.get('to') || 'Tamu');
            const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${guestName}`;
            showModal(`<h3>QR Tamu</h3><img src="${qrUrl}" alt="QR Code" style="max-width:100%" />`);
        });
    }

    // =============================
    // GALLERY PREVIEW
    // =============================
    document.querySelectorAll('.thumb').forEach(img =>
        img.addEventListener('click', e => {
            const src = e.target.getAttribute('src');
            showModal(`<img src="${src}" alt="preview" style="max-width:100%;height:auto;border-radius:8px" />`);
        })
    );

    // =============================
    // RSVP + WISHES
    // =============================
    // function load(key) {
    //     try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    //     catch { return []; }
    // }
    // function save(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }
    // function escapeHtml(s) {
    //     return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // }

    // const rsvpForm = document.getElementById('rsvpForm');
    // if (rsvpForm) {
    //     rsvpForm.addEventListener('submit', e => {
    //         e.preventDefault();
    //         const f = e.target;
    //         const data = {
    //             name: f.name.value.trim(),
    //             attend: f.attend.value,
    //             guests: Number(f.guests.value) || 1,
    //             note: f.note.value.trim(),
    //             time: new Date().toISOString()
    //         };
    //         if (!data.name) {
    //             Swal.fire('Mohon isi nama', 'Nama wajib diisi', 'warning');
    //             return;
    //         }
    //         const list = load('rsvps');
    //         list.unshift(data);
    //         save('rsvps', list);
    //         Swal.fire({
    //             icon: 'success',
    //             title: 'Terima kasih',
    //             text: 'Konfirmasi Anda telah tercatat',
    //             timer: 1500,
    //             showConfirmButton: false
    //         });
    //         f.reset();
    //     });
    // }

    // const wishForm = document.getElementById('wishForm');
    // const wishListEl = document.getElementById('wishList');

    // function renderWishes() {
    //     const items = load('wishes');
    //     wishListEl.innerHTML = items.length
    //         ? items.map(it => `
    //             <div class="wish-card">
    //                 <div class="wish-meta">
    //                     <strong>${escapeHtml(it.name)}</strong> • ${it.attend} • ${new Date(it.time).toLocaleString()}
    //                 </div>
    //                 <div class="wish-text">${escapeHtml(it.note)}</div>
    //             </div>`).join('')
    //         : '<div class="muted">Belum ada ucapan.</div>';
    // }

    // if (wishForm) {
    //     wishForm.addEventListener('submit', e => {
    //         e.preventDefault();
    //         const f = e.target;
    //         const data = {
    //             name: f.name.value.trim(),
    //             attend: f.attend.value,
    //             note: f.note.value.trim(),
    //             time: new Date().toISOString()
    //         };
    //         if (!data.name || !data.note) {
    //             Swal.fire('Isi lengkap', 'Nama dan ucapan wajib diisi', 'warning');
    //             return;
    //         }
    //         const list = load('wishes');
    //         list.unshift(data);
    //         save('wishes', list);
    //         renderWishes();
    //         Swal.fire({
    //             icon: 'success',
    //             title: 'Terkirim',
    //             text: 'Ucapan Anda telah dikirim',
    //             timer: 1400,
    //             showConfirmButton: false
    //         });
    //         f.reset();
    //     });
    // }

    // renderWishes();

    // =============================
    // MUSIC CONTROL
    // =============================
    function tryAutoplay() {
        if (!audio) return;
        audio.play().catch(() => {
            document.body.addEventListener('click', () => audio.play().catch(() => { }), { once: true });
        });
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().catch(() => { });
                musicBtn.classList.add('music-active');
            } else {
                audio.pause();
                musicBtn.classList.remove('music-active');
            }
        });
    }

    // Pause/resume musik saat tab tidak aktif/aktif
    document.addEventListener('visibilitychange', () => {
        if (!audio) return;
        if (document.hidden) {
            audio.pause();
            musicBtn?.classList.remove('music-active');
        } else {
            audio.play().catch(() => { });
            musicBtn?.classList.add('music-active');
        }
    });


    // =============================
    // INITIAL MENU CENTERING
    // =============================
    setTimeout(() => {
        if (!bottomMenu.classList.contains('hidden')) centerMenu(0);
    }, 600);

})();

// =============================
// COUNTDOWN 2-DIGIT
// =============================
(function () {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    const targetDate = new Date('2025-12-21T00:00:00');

    // Fungsi bantu untuk dua digit
    function twoDigit(num) {
        return num.toString().padStart(2, '0');
    }

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minsEl.textContent = '00';
            secsEl.textContent = '00';
            clearInterval(timer);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        daysEl.textContent = twoDigit(days);
        hoursEl.textContent = twoDigit(hours);
        minsEl.textContent = twoDigit(minutes);
        secsEl.textContent = twoDigit(seconds);
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
})();

// SALIN NOMOR REKENING
document.querySelectorAll('.btn-copy').forEach(button => {
    button.addEventListener('click', function () {
        // cari elemen parent terdekat (.rekening-card)
        const card = this.closest('.rekening-card');

        // ambil nomor rekening di dalam card tersebut
        const number = card.querySelector('.card-number').textContent.trim();

        // copy ke clipboard
        navigator.clipboard.writeText(number).then(() => {
            // feedback
            this.querySelector('span').textContent = "Disalin!";
            
            setTimeout(() => {
                this.querySelector('span').textContent = "Salin Nomor Rekening";
            }, 1500);
        });
    });
});

// SALIN ALAMAT GIFT CARD
document.querySelectorAll('.gift-card .btn-copy').forEach(button => {
    button.addEventListener('click', function () {
        const card = this.closest('.gift-card');

        // ambil alamat
        const address = card.querySelector('.gift-location').textContent.trim();

        // salin ke clipboard
        navigator.clipboard.writeText(address).then(() => {
            this.querySelector('span').textContent = "Disalin!";
            setTimeout(() => {
                this.querySelector('span').textContent = "Salin Alamat";
            }, 1500);
        });
    });
});

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby9f5jTGKgWIRKf2yusPAKe4sWjd3kjC0_BvL2GlitGWyCADF3IRggz9EQBnOPXEvve/exec";


// ========== POPUP CUSTOM ==========
function showCustomPopup(msg) {
    document.getElementById("popupText").innerText = msg;
    document.getElementById("customPopup").style.display = "flex";

    setTimeout(closeCustomPopup, 2000);
}

function closeCustomPopup() {
    document.getElementById("customPopup").style.display = "none";
}


// ================== SUBMIT WISH ==================
// document.getElementById("wishForm")?.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const f = e.target;

//     const formData = new URLSearchParams();
//     formData.append("action", "wish");
//     formData.append("name", f.name.value);
//     formData.append("attend", f.attend.value);
//     formData.append("note", f.note.value);

//     await fetch(WEB_APP_URL, {
//         method: "POST",
//         body: formData
//     });

//     showCustomPopup("Ucapan berhasil dikirim.");

//     f.reset();
//     renderWishList();
// });

document.getElementById("wishForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Cegah submit dobel
    if (isSubmittingWish) return;

    const f = e.target;
    const name   = f.name.value.trim();
    const attend = f.attend.value;
    const note   = f.note.value.trim();

    // Validasi ringan
    if (!name || !note) {
        showCustomPopup("Nama dan ucapan wajib diisi.");
        return;
    }

    // Fingerprint sederhana (anti klik dobel)
    const wishHash = `${name}|${attend}|${note}`;

    if (wishHash === lastWishHash) {
        showCustomPopup("Ucapan sudah dikirim.");
        return;
    }

    isSubmittingWish = true;
    lastWishHash = wishHash;

    // Disable tombol submit
    const submitBtn = f.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("loading");
    }

    // 🚀 FEEDBACK LANGSUNG (tanpa tunggu server)
    showCustomPopup("Ucapan berhasil dikirim.");

    // Reset form langsung (UX cepat)
    f.reset();

    try {
        const formData = new URLSearchParams();
        formData.append("action", "wish");
        formData.append("name", name);
        formData.append("attend", attend);
        formData.append("note", note);

        await fetch(WEB_APP_URL, {
            method: "POST",
            body: formData
        });

        // Refresh list setelah server selesai
        renderWishList();

    } catch (err) {
        // Jika gagal, beri tahu user
        showCustomPopup("Gagal mengirim ucapan.");
        lastWishHash = null;
    } finally {
        isSubmittingWish = false;

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("loading");
        }
    }
});



// ================== LOAD WISH LIST ==================
// async function loadWishes() {
//     const res = await fetch(WEB_APP_URL);
//     return await res.json();
// }

// Ambil 2 initial dari nama
function getInitials(name) {
    if (!name) return "?";

    const parts = name.trim().split(" ");

    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    } else {
        return parts[0].substring(0, 2).toUpperCase();
    }
}

// Render wish list
async function renderWishList() {
    const listEl = document.getElementById("wishList");
    const data = await loadWishes();

    if (!data || data.length === 0) {
        listEl.innerHTML = `<div class="muted">Belum ada ucapan.</div>`;
        return;
    }

    listEl.innerHTML = data
        .map(w => {
            const nama = w[0];
            const status = w[1]; // hadir / tidak
            const ucapan = w[2];
            const initials = getInitials(nama);

            const isHadir = status.toLowerCase() === "hadir";

            const badgeClass = isHadir ? "badge-hadir" : "badge-tidak";
            const badgeIcon = isHadir
                ? `<i class="fa-solid fa-circle-check"></i>`
                : `<i class="fa-solid fa-circle-xmark"></i>`;

            return `
                <div class="wish-card">

                    <div class="initials-wish-guest">${initials}</div>

                    <div style="flex:1;">

                        <div class="nama-badge-wish">

                            <div class="nama-guest-wish">${nama}</div>

                            <span class="${badgeClass}">
                                ${badgeIcon}
                                ${status}
                            </span>

                        </div>

                        <div class="wish-text">${ucapan}</div>

                    </div>

                </div>
            `;
        })
        .join("");
}

renderWishList();




//POPUP KUSTOM
function showCustomPopup(msg) {
    document.getElementById("popupText").innerText = msg;
    document.getElementById("customPopup").style.display = "flex";

    // Auto close
    setTimeout(() => {
        closeCustomPopup();
    }, 2000);
}

function closeCustomPopup() {
    document.getElementById("customPopup").style.display = "none";
}


// NAMA OTOMATIS MASIH BISA INPUT
document.addEventListener("DOMContentLoaded", function () {
    const guestName = document.getElementById("guestName")?.textContent.trim();
    const inputName = document.getElementById("w-name");

    if (guestName && inputName) {
        // Jika kosong, isi dengan guestName
        if (!inputName.value.trim()) {
            inputName.value = guestName;
        }
    }
});


//LIGHTBOX FULLSCREEN
document.addEventListener("DOMContentLoaded", function () {

    const lightbox     = document.getElementById("lightbox");
    const lightboxImg  = document.getElementById("lightbox-img");
    const closeBtn     = document.querySelector(".lightbox-close");
    const prevBtn      = document.querySelector(".lightbox-prev");
    const nextBtn      = document.querySelector(".lightbox-next");

    const galleryLinks = document.querySelectorAll('a[data-lightbox="gallery"]');
    let currentIndex = 0;

    // Buka lightbox
    function openLightbox(index) {
        currentIndex = index;
        lightboxImg.src = galleryLinks[index].getAttribute("href");
        lightbox.style.display = "flex";
    }

    // Tutup
    function closeLightbox() {
        lightbox.style.display = "none";
    }

    // Next
    function nextImage() {
        currentIndex = (currentIndex + 1) % galleryLinks.length;
        openLightbox(currentIndex);
    }

    // Prev
    function prevImage() {
        currentIndex = (currentIndex - 1 + galleryLinks.length) % galleryLinks.length;
        openLightbox(currentIndex);
    }

    // Event pada gambar
    galleryLinks.forEach((link, index) => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            openLightbox(index);
        });
    });

    // Tombol
    closeBtn.addEventListener("click", closeLightbox);
    nextBtn.addEventListener("click", nextImage);
    prevBtn.addEventListener("click", prevImage);

    // Klik area gelap untuk close
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // ================================
    //      SWIPE SUPPORT MOBILE
    // ================================
    let startX = 0;

    lightbox.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    lightbox.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;
        let diff = startX - endX;

        if (diff > 50) {
            nextImage();  // swipe kiri
        } 
        else if (diff < -50) {
            prevImage();  // swipe kanan
        }
    });

});

// FULLSCREEN TOGGLE BUTTON
const fullscreenBtn = document.getElementById('fullscreenBtn');

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

fullscreenBtn.addEventListener('click', toggleFullscreen);

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenBtn.classList.add('active');
        fullscreenBtn.innerHTML = '⛶'; // exit fullscreen icon
    } else {
        fullscreenBtn.classList.remove('active');
        fullscreenBtn.innerHTML = '⛶'; // fullscreen icon
    }
});

