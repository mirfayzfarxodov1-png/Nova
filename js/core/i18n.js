// ============================================
// NOVA - I18N.JS (Ko'p tillilik)
// ============================================

(function() {
    "use strict";
    
    const translations = {
        uz: {
            app_name: "NOVA",
            home: "Bosh sahifa",
            explore: "Kashf et",
            reels: "Reels",
            my_videos: "Mening videolarim",
            notifications: "Ogohlantirishlar",
            chat: "Xabarlar",
            trending: "Trendlar",
            settings: "Sozlamalar",
            badge: "Animatsiyali galichka (1$/oy)",
            coins: "Nova Coin",
            premium: "Premium obuna",
            no_videos: "Hech qanday video yo'q",
            upload_first: "Birinchi videoni yuklang!",
            upload: "Video yuklash",
            save: "Saqlash",
            cancel: "Bekor qilish",
            like: "Layk",
            comment: "Komment",
            share: "Ulashish",
            subscribe: "Obuna",
            subscribed: "Obunada",
            channel: "Kanal",
            report: "Shikoyat qilish",
            delete: "O'chirish",
            copy_link: "Havolani nusxalash",
            edit_profile: "Profilni tahrirlash",
            dark_mode: "Dark mode",
            language: "Til"
        },
        ru: {
            app_name: "НОВА",
            home: "Главная",
            explore: "Поиск",
            reels: "Reels",
            my_videos: "Мои видео",
            notifications: "Уведомления",
            chat: "Сообщения",
            trending: "Тренды",
            settings: "Настройки",
            badge: "Анимированный значок (1$/мес)",
            coins: "Nova Coin",
            premium: "Премиум подписка",
            no_videos: "Нет видео",
            upload_first: "Загрузите первое видео!",
            upload: "Загрузить видео",
            save: "Сохранить",
            cancel: "Отмена",
            like: "Нравится",
            comment: "Комментарий",
            share: "Поделиться",
            subscribe: "Подписаться",
            subscribed: "Подписан",
            channel: "Канал",
            report: "Пожаловаться",
            delete: "Удалить",
            copy_link: "Скопировать ссылку",
            edit_profile: "Редактировать профиль",
            dark_mode: "Темная тема",
            language: "Язык"
        },
        en: {
            app_name: "NOVA",
            home: "Home",
            explore: "Explore",
            reels: "Reels",
            my_videos: "My videos",
            notifications: "Notifications",
            chat: "Messages",
            trending: "Trending",
            settings: "Settings",
            badge: "Animated badge ($1/month)",
            coins: "Nova Coin",
            premium: "Premium subscription",
            no_videos: "No videos yet",
            upload_first: "Upload your first video!",
            upload: "Upload video",
            save: "Save",
            cancel: "Cancel",
            like: "Like",
            comment: "Comment",
            share: "Share",
            subscribe: "Subscribe",
            subscribed: "Subscribed",
            channel: "Channel",
            report: "Report",
            delete: "Delete",
            copy_link: "Copy link",
            edit_profile: "Edit profile",
            dark_mode: "Dark mode",
            language: "Language"
        }
    };
    
    let currentLang = localStorage.getItem('nova_lang') || 'uz';
    
    window.t = function(key) {
        return translations[currentLang][key] || key;
    };
    
    window.setLanguage = function(lang) {
        if (translations[lang]) {
            currentLang = lang;
            localStorage.setItem('nova_lang', lang);
            updateUITexts();
            window.showToast(`Til o'zgartirildi: ${lang.toUpperCase()}`);
        }
    };
    
    function updateUITexts() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            el.textContent = window.t(key);
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.dataset.i18nPlaceholder;
            el.placeholder = window.t(key);
        });
    }
    
    function initI18n() {
        updateUITexts();
        window.log("I18n.js loaded");
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initI18n);
    } else {
        initI18n();
    }
    
    window.log("I18n.js loaded");
})();
