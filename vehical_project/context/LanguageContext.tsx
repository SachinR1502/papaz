import { Language, TranslationKey, translations } from '@/constants/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => Promise<void>;
    t: (key: TranslationKey | string) => string;
    translate: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [activeTranslations, setActiveTranslations] = useState<typeof translations>(translations);
    const [isLoading, setIsLoading] = useState(false);

    // Track in-flight translation requests to avoid duplicates
    const pendingTranslations = useRef(new Set<string>());

    useEffect(() => {
        loadLanguage();
        loadCachedTranslations();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('user-language');
            if (savedLanguage && ['en', 'hi', 'mr', 'kn', 'ta', 'te', 'ml', 'gu', 'bn', 'pa'].includes(savedLanguage)) {
                setLanguageState(savedLanguage as Language);
            }
        } catch (error) {
            console.error('Failed to load language', error);
        }
    };

    const loadCachedTranslations = async () => {
        try {
            const cachedData = await AsyncStorage.getItem('translations-cache');
            if (cachedData && cachedData !== 'undefined') {
                try {
                    const parsedCache = JSON.parse(cachedData);
                    // Merge cached translations with static translations
                    setActiveTranslations(prev => {
                        const merged = { ...prev };
                        const languages: Language[] = ['hi', 'mr', 'kn', 'ta', 'te', 'ml', 'gu', 'bn', 'pa'];
                        languages.forEach(lang => {
                            // @ts-ignore
                            if (parsedCache[lang]) merged[lang] = { ...merged[lang], ...parsedCache[lang] };
                        });
                        return merged;
                    });
                } catch (e) {
                    console.error('Failed to parse cached translations', e);
                    await AsyncStorage.removeItem('translations-cache');
                }
            }
        } catch (error) {
            console.error('Failed to load name translations', error);
        }
    };

    const setLanguage = async (lang: Language) => {
        try {
            await AsyncStorage.setItem('user-language', lang);
            setLanguageState(lang);
        } catch (error) {
            console.error('Failed to save language', error);
        }
    };

    const translate = async (text: string): Promise<string> => {
        if (language === 'en') return text;
        if (!text) return '';

        // Check if already translated
        // @ts-ignore
        if (activeTranslations[language] && activeTranslations[language][text]) {
            // @ts-ignore
            return activeTranslations[language][text];
        }

        try {
            const formData = new FormData();
            formData.append('key', 'devnagri_6059fc7af2a311f09cc642010aa00fc7');
            formData.append('sentence', text);
            formData.append('src_lang', 'en');
            formData.append('dest_lang', language);
            formData.append('industry', 'general'); // Changed from '5' to 'general' or default
            formData.append('is_apply_glossary', '0'); // Simplified

            const response = await fetch('https://api.devnagri.com/machine-translation/v2/translate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errText = await response.text();
                // console.warn(`Translation API ${response.status}:`, errText);
                throw new Error(`API returned status ${response.status}`);
            }

            const data = await response.json();
            const translatedText = data.translated_text || text;

            // Update cache so next t() call uses it
            setActiveTranslations(prev => {
                const langActive = prev[language] || {};
                const updated = {
                    ...prev,
                    [language]: {
                        ...langActive,
                        [text]: translatedText
                    }
                };
                return updated;
            });

            return translatedText;
        } catch (error: any) {
            // console.error("Translation failed for:", text, error.message);
            return text;
        }
    };

    const t = (key: TranslationKey | string): string => {
        if (!key) return '';

        // 1. Direct key lookup in target language
        // @ts-ignore
        let cached = activeTranslations[language][key];
        if (cached && typeof cached === 'string') return cached;

        // 2. English lookup for translation key
        // @ts-ignore
        const englishValue = translations.en[key as TranslationKey];

        // 3. If English, return value or key
        if (language === 'en') return englishValue || key;

        // 4. Check if translated version of English value exists in cache
        if (englishValue) {
            // @ts-ignore
            cached = activeTranslations[language][englishValue];
            if (cached && typeof cached === 'string') return cached;
        }

        // 5. Fallback text to display and translate
        const textToTranslate = englishValue || key;

        // Ignore internal technical keys if they don't have English values
        if (!englishValue && key.includes('_')) return key;

        // 6. Trigger background translation
        if (!pendingTranslations.current.has(key)) {
            pendingTranslations.current.add(key);
            translate(textToTranslate).finally(() => {
                pendingTranslations.current.delete(key);
            });
        }

        return textToTranslate;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
