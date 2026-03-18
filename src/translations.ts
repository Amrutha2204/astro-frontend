export type Locale = "en" | "hi";

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    appName: "Jyotishya Darshan",
    tagline: "Vedic Horoscope • Marriage Match • Panchang",
    benefit1: "Personalized daily horoscope & Kundli based on your birth details",
    benefit2: "Marriage compatibility (Guna Milan) & Dosha check — no login to try",
    benefit3: "Panchang, Muhurat & remedies — for guidance when you need it",
    socialProof: "Trusted by 10,000+ users for accurate Vedic insights",
    login: "Login",
    register: "Register",
    whatToExplore: "What would you like to explore?",
    chooseService:
      "Choose a service below. No login needed to try Horoscope, Match, Calendar, Transits, Dasha and Dosha.",
    disclaimer:
      "For guidance purposes only. Astrology does not replace personal judgment or professional advice.",
    freeKundli: "Free Kundli",
    freeKundliDesc:
      'Birth chart with Lagna, Rashi, Nakshatra — optional "I don\'t know" birth time',
    todaysHoroscope: "Today's Horoscope",
    todaysHoroscopeDesc: "Daily prediction for your zodiac sign",
    matchCompatibility: "Match / Compatibility",
    matchCompatibilityDesc: "Check compatibility with your partner",
    calendarPanchang: "Calendar (Panchang)",
    calendarPanchangDesc: "Auspicious days and festivals",
    transits: "Transits",
    transitsDesc: "Current planetary positions",
    dasha: "Dasha",
    dashaDesc: "Planetary periods in your life",
    doshaCheck: "Dosha Check",
    doshaCheckDesc: "Manglik and other dosha analysis",
  },
  hi: {
    appName: "ज्योतिष दर्शन",
    tagline: "वैदिक कुंडली • विवाह मिलान • पंचांग",
    benefit1: "आपके जन्म विवरण के आधार पर व्यक्तिगत दैनिक राशिफल और कुंडली",
    benefit2: "विवाह अनुकूलता (गुण मिलान) और दोष जांच — बिना लॉगिन आज़माएं",
    benefit3: "पंचांग, मुहूर्त और उपाय — जब आपको ज़रूरत हो",
    socialProof: "10,000+ उपयोगकर्ता सटीक वैदिक जानकारी के लिए विश्वास करते हैं",
    login: "लॉगिन",
    register: "रजिस्टर",
    whatToExplore: "आप क्या देखना चाहेंगे?",
    chooseService:
      "नीचे से सेवा चुनें। राशिफल, मिलान, कैलेंडर, ट्रांजिट, दशा और दोष बिना लॉगिन आज़माएं।",
    disclaimer:
      "केवल मार्गदर्शन के लिए। ज्योतिष व्यक्तिगत निर्णय या विशेषज्ञ सलाह का विकल्प नहीं है।",
    freeKundli: "मुफ्त कुंडली",
    freeKundliDesc: 'लग्न, राशि, नक्षत्र — वैकल्पिक "मुझे जन्म समय नहीं पता"',
    todaysHoroscope: "आज का राशिफल",
    todaysHoroscopeDesc: "आपकी राशि के लिए दैनिक भविष्यवाणी",
    matchCompatibility: "मिलान / अनुकूलता",
    matchCompatibilityDesc: "साथी के साथ अनुकूलता जांचें",
    calendarPanchang: "कैलेंडर (पंचांग)",
    calendarPanchangDesc: "शुभ दिन और त्योहार",
    transits: "ट्रांजिट",
    transitsDesc: "वर्तमान ग्रह स्थिति",
    dasha: "दशा",
    dashaDesc: "जीवन में ग्रहों की अवधि",
    doshaCheck: "दोष जांच",
    doshaCheckDesc: "मंगलिक और अन्य दोष विश्लेषण",
  },
};

export function getTranslation(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations.en[key] ?? key;
}
