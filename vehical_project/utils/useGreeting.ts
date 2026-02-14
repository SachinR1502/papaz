import { useLanguage } from '@/context/LanguageContext';

export const useGreeting = () => {
    const { t } = useLanguage();

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('greeting_morning');
        if (hour < 18) return t('greeting_afternoon');
        return t('greeting_evening');
    };

    return getGreeting;
};
