import type { LocaleId } from "@/lib/locales";
import type { Suit } from "@/lib/tarot-deck";

const MAJORS: Record<string, Record<LocaleId, string>> = {
  "the-fool": {
    en: "The Fool", sq: "I Marrë", zh: "愚者", hi: "मूर्ख", es: "El Loco", fr: "Le Fou",
    ar: "المجنون", bn: "মূর্খ", pt: "O Louco", ru: "Шут", ur: "بے وقوف", id: "Sang Bodoh", de: "Der Narr", ja: "愚者", ko: "바보", it: "Il Matto", la: "Stultus",
  },
  "the-magician": {
    en: "The Magician", sq: "Magjistari", zh: "魔术师", hi: "जादूगर", es: "El Mago", fr: "Le Magicien",
    ar: "الساحر", bn: "জাদুকর", pt: "O Mago", ru: "Маг", ur: "جادوگر", id: "Sang Penyihir", de: "Der Magier", ja: "魔術師", ko: "마법사", it: "Il Mago", la: "Magus",
  },
  "the-high-priestess": {
    en: "The High Priestess", sq: "Priftëresha e Lartë", zh: "女祭司", hi: "महापुरोहितिन", es: "La Sacerdotisa", fr: "La Papesse",
    ar: "الكاهنة العليا", bn: "মহাপুরোহিতা", pt: "A Sacerdotisa", ru: "Верховная Жрица", ur: "اعلیٰ کاہنہ", id: "Imam Perempuan Agung", de: "Die Hohepriesterin", ja: "女教皇", ko: "여사제", it: "La Papessa", la: "Sacerdos",
  },
  "the-empress": {
    en: "The Empress", sq: "Perandoresha", zh: "皇后", hi: "महारानी", es: "La Emperatriz", fr: "L'Impératrice",
    ar: "الإمبراطورة", bn: "সম্রাজ্ঞী", pt: "A Imperatriz", ru: "Императрица", ur: "ملکۂ اعظم", id: "Permaisuri", de: "Die Herrscherin", ja: "女帝", ko: "여황제", it: "L'Imperatrice", la: "Imperatrix",
  },
  "the-emperor": {
    en: "The Emperor", sq: "Perandori", zh: "皇帝", hi: "सम्राट", es: "El Emperador", fr: "L'Empereur",
    ar: "الإمبراطور", bn: "সম্রাট", pt: "O Imperador", ru: "Император", ur: "شہنشاہ", id: "Kaisar", de: "Der Herrscher", ja: "皇帝", ko: "황제", it: "L'Imperatore", la: "Imperator",
  },
  "the-hierophant": {
    en: "The Hierophant", sq: "Hierofanti", zh: "教皇", hi: "धर्मगुरु", es: "El Hierofante", fr: "Le Pape",
    ar: "الكاهن الأعظم", bn: "ধর্মগুরু", pt: "O Hierofante", ru: "Иерофант", ur: "پیشوا", id: "Sang Hierofant", de: "Der Hierophant", ja: "教皇", ko: "교황", it: "Il Papa", la: "Pontifex",
  },
  "the-lovers": {
    en: "The Lovers", sq: "Të Dashuruarit", zh: "恋人", hi: "प्रेमी", es: "Los Enamorados", fr: "Les Amoureux",
    ar: "العشاق", bn: "প্রেমিকযুগল", pt: "Os Enamorados", ru: "Влюблённые", ur: "عاشق", id: "Sepasang Kekasih", de: "Die Liebenden", ja: "恋人", ko: "연인", it: "Gli Amanti", la: "Amantes",
  },
  "the-chariot": {
    en: "The Chariot", sq: "Qerrja", zh: "战车", hi: "रथ", es: "El Carro", fr: "Le Chariot",
    ar: "العربة", bn: "রথ", pt: "O Carro", ru: "Колесница", ur: "رتھ", id: "Kereta", de: "Der Wagen", ja: "戦車", ko: "전차", it: "Il Carro", la: "Currus",
  },
  strength: {
    en: "Strength", sq: "Forca", zh: "力量", hi: "शक्ति", es: "La Fuerza", fr: "La Force",
    ar: "القوة", bn: "শক্তি", pt: "A Força", ru: "Сила", ur: "طاقت", id: "Kekuatan", de: "Kraft", ja: "力", ko: "힘", it: "La Forza", la: "Fortitudo",
  },
  "the-hermit": {
    en: "The Hermit", sq: "Eremiti", zh: "隐者", hi: "संन्यासी", es: "El Ermitaño", fr: "L'Ermite",
    ar: "الناسك", bn: "সন্ন্যাসী", pt: "O Eremita", ru: "Отшельник", ur: "تارک الدنیا", id: "Pertapa", de: "Der Eremit", ja: "隠者", ko: "은둔자", it: "L'Eremita", la: "Eremita",
  },
  "wheel-of-fortune": {
    en: "Wheel of Fortune", sq: "Rrota e Fatit", zh: "命运之轮", hi: "भाग्य चक्र", es: "La Rueda de la Fortuna", fr: "La Roue de Fortune",
    ar: "عجلة الحظ", bn: "ভাগ্যচক্র", pt: "A Roda da Fortuna", ru: "Колесо Фортуны", ur: "قسمت کا پہیہ", id: "Roda Keberuntungan", de: "Das Rad des Schicksals", ja: "運命の輪", ko: "운명의 수레바퀴", it: "La Ruota della Fortuna", la: "Rota Fortunae",
  },
  justice: {
    en: "Justice", sq: "Drejtësia", zh: "正义", hi: "न्याय", es: "La Justicia", fr: "La Justice",
    ar: "العدالة", bn: "ন্যায়", pt: "A Justiça", ru: "Справедливость", ur: "انصاف", id: "Keadilan", de: "Gerechtigkeit", ja: "正義", ko: "정의", it: "La Giustizia", la: "Iustitia",
  },
  "the-hanged-man": {
    en: "The Hanged Man", sq: "I Varuri", zh: "倒吊人", hi: "उलटा लटका व्यक्ति", es: "El Colgado", fr: "Le Pendu",
    ar: "المعلق", bn: "ঝুলন্ত মানুষ", pt: "O Enforcado", ru: "Повешенный", ur: "لٹکا ہوا آدمی", id: "Orang Tergantung", de: "Der Gehängte", ja: "吊された男", ko: "매달린 사람", it: "L'Appeso", la: "Suspensus",
  },
  death: {
    en: "Death", sq: "Vdekja", zh: "死神", hi: "मृत्यु", es: "La Muerte", fr: "La Mort",
    ar: "الموت", bn: "মৃত্যু", pt: "A Morte", ru: "Смерть", ur: "موت", id: "Kematian", de: "Der Tod", ja: "死神", ko: "죽음", it: "La Morte", la: "Mors",
  },
  temperance: {
    en: "Temperance", sq: "Maturia", zh: "节制", hi: "संयम", es: "La Templanza", fr: "Tempérance",
    ar: "الاعتدال", bn: "সংযম", pt: "A Temperança", ru: "Умеренность", ur: "اعتدال", id: "Kesederhanaan", de: "Mäßigkeit", ja: "節制", ko: "절제", it: "La Temperanza", la: "Temperantia",
  },
  "the-devil": {
    en: "The Devil", sq: "Djalli", zh: "恶魔", hi: "शैतान", es: "El Diablo", fr: "Le Diable",
    ar: "الشيطان", bn: "শয়তান", pt: "O Diabo", ru: "Дьявол", ur: "شیطان", id: "Iblis", de: "Der Teufel", ja: "悪魔", ko: "악마", it: "Il Diavolo", la: "Diabolus",
  },
  "the-tower": {
    en: "The Tower", sq: "Kulla", zh: "塔", hi: "मीनार", es: "La Torre", fr: "La Tour",
    ar: "البرج", bn: "মিনার", pt: "A Torre", ru: "Башня", ur: "مینار", id: "Menara", de: "Der Turm", ja: "塔", ko: "탑", it: "La Torre", la: "Turris",
  },
  "the-star": {
    en: "The Star", sq: "Ylli", zh: "星星", hi: "तारा", es: "La Estrella", fr: "L'Étoile",
    ar: "النجمة", bn: "তারা", pt: "A Estrela", ru: "Звезда", ur: "ستارہ", id: "Bintang", de: "Der Stern", ja: "星", ko: "별", it: "La Stella", la: "Stella",
  },
  "the-moon": {
    en: "The Moon", sq: "Hëna", zh: "月亮", hi: "चंद्रमा", es: "La Luna", fr: "La Lune",
    ar: "القمر", bn: "চাঁদ", pt: "A Lua", ru: "Луна", ur: "چاند", id: "Bulan", de: "Der Mond", ja: "月", ko: "달", it: "La Luna", la: "Luna",
  },
  "the-sun": {
    en: "The Sun", sq: "Dielli", zh: "太阳", hi: "सूर्य", es: "El Sol", fr: "Le Soleil",
    ar: "الشمس", bn: "সূর্য", pt: "O Sol", ru: "Солнце", ur: "سورج", id: "Matahari", de: "Die Sonne", ja: "太陽", ko: "태양", it: "Il Sole", la: "Sol",
  },
  judgement: {
    en: "Judgement", sq: "Gjykimi", zh: "审判", hi: "निर्णय", es: "El Juicio", fr: "Le Jugement",
    ar: "الحكم", bn: "বিচার", pt: "O Julgamento", ru: "Суд", ur: "فیصلہ", id: "Penghakiman", de: "Gericht", ja: "審判", ko: "심판", it: "Il Giudizio", la: "Iudicium",
  },
  "the-world": {
    en: "The World", sq: "Bota", zh: "世界", hi: "विश्व", es: "El Mundo", fr: "Le Monde",
    ar: "العالم", bn: "বিশ্ব", pt: "O Mundo", ru: "Мир", ur: "دنیا", id: "Dunia", de: "Die Welt", ja: "世界", ko: "세계", it: "Il Mondo", la: "Mundus",
  },
};

const RANKS: Record<LocaleId, Record<string, string>> = {
  en: { A: "Ace", "2": "Two", "3": "Three", "4": "Four", "5": "Five", "6": "Six", "7": "Seven", "8": "Eight", "9": "Nine", "10": "Ten", P: "Page", Kn: "Knight", Q: "Queen", K: "King" },
  sq: { A: "Asi", "2": "Dy", "3": "Tre", "4": "Katër", "5": "Pesë", "6": "Gjashtë", "7": "Shtatë", "8": "Tetë", "9": "Nëntë", "10": "Dhjetë", P: "Faqja", Kn: "Kalorësi", Q: "Mbretëresha", K: "Mbreti" },
  zh: { A: "王牌", "2": "二", "3": "三", "4": "四", "5": "五", "6": "六", "7": "七", "8": "八", "9": "九", "10": "十", P: "侍从", Kn: "骑士", Q: "王后", K: "国王" },
  hi: { A: "इक्का", "2": "दो", "3": "तीन", "4": "चार", "5": "पाँच", "6": "छह", "7": "सात", "8": "आठ", "9": "नौ", "10": "दस", P: "पृष्ठ", Kn: "घुड़सवार", Q: "रानी", K: "राजा" },
  es: { A: "As", "2": "Dos", "3": "Tres", "4": "Cuatro", "5": "Cinco", "6": "Seis", "7": "Siete", "8": "Ocho", "9": "Nueve", "10": "Diez", P: "Sota", Kn: "Caballero", Q: "Reina", K: "Rey" },
  fr: { A: "As", "2": "Deux", "3": "Trois", "4": "Quatre", "5": "Cinq", "6": "Six", "7": "Sept", "8": "Huit", "9": "Neuf", "10": "Dix", P: "Valet", Kn: "Cavalier", Q: "Reine", K: "Roi" },
  ar: { A: "الآس", "2": "الاثنان", "3": "الثلاثة", "4": "الأربعة", "5": "الخمسة", "6": "الستة", "7": "السبعة", "8": "الثمانية", "9": "التسعة", "10": "العشرة", P: "الوصيف", Kn: "الفارس", Q: "الملكة", K: "الملك" },
  bn: { A: "টেক্কা", "2": "দুই", "3": "তিন", "4": "চার", "5": "পাঁচ", "6": "ছয়", "7": "সাত", "8": "আট", "9": "নয়", "10": "দশ", P: "পাতা", Kn: "অশ্বারোহী", Q: "রানি", K: "রাজা" },
  pt: { A: "Ás", "2": "Dois", "3": "Três", "4": "Quatro", "5": "Cinco", "6": "Seis", "7": "Sete", "8": "Oito", "9": "Nove", "10": "Dez", P: "Valete", Kn: "Cavaleiro", Q: "Rainha", K: "Rei" },
  ru: { A: "Туз", "2": "Двойка", "3": "Тройка", "4": "Четвёрка", "5": "Пятёрка", "6": "Шестёрка", "7": "Семёрка", "8": "Восьмёрка", "9": "Девятка", "10": "Десятка", P: "Паж", Kn: "Рыцарь", Q: "Королева", K: "Король" },
  ur: { A: "اکّا", "2": "دو", "3": "تین", "4": "چار", "5": "پانچ", "6": "چھ", "7": "سات", "8": "آٹھ", "9": "نو", "10": "دس", P: "غلام", Kn: "سوار", Q: "رانی", K: "بادشاہ" },
  id: { A: "As", "2": "Dua", "3": "Tiga", "4": "Empat", "5": "Lima", "6": "Enam", "7": "Tujuh", "8": "Delapan", "9": "Sembilan", "10": "Sepuluh", P: "Pelayan", Kn: "Kesatria", Q: "Ratu", K: "Raja" },
  de: { A: "Ass", "2": "Zwei", "3": "Drei", "4": "Vier", "5": "Fünf", "6": "Sechs", "7": "Sieben", "8": "Acht", "9": "Neun", "10": "Zehn", P: "Bube", Kn: "Ritter", Q: "Königin", K: "König" },
  ja: { A: "エース", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10", P: "ペイジ", Kn: "ナイト", Q: "クイーン", K: "キング" },
  ko: { A: "에이스", "2": "2", "3": "3", "4": "4", "5": "5", "6": "6", "7": "7", "8": "8", "9": "9", "10": "10", P: "시종", Kn: "기사", Q: "여왕", K: "국왕" },
  it: { A: "Asso", "2": "Due", "3": "Tre", "4": "Quattro", "5": "Cinque", "6": "Sei", "7": "Sette", "8": "Otto", "9": "Nove", "10": "Dieci", P: "Fante", Kn: "Cavaliere", Q: "Regina", K: "Re" },
  la: { A: "As", "2": "Duo", "3": "Tria", "4": "Quattuor", "5": "Quinque", "6": "Sex", "7": "Septem", "8": "Octo", "9": "Novem", "10": "Decem", P: "Puer", Kn: "Eques", Q: "Regina", K: "Rex" },
};

const SUITS: Record<LocaleId, Record<Suit, string>> = {
  en: { wands: "Wands", cups: "Cups", swords: "Swords", pentacles: "Pentacles" },
  sq: { wands: "Shkopinjve", cups: "Kupave", swords: "Shpatave", pentacles: "Monedhave" },
  zh: { wands: "权杖", cups: "圣杯", swords: "宝剑", pentacles: "星币" },
  hi: { wands: "छड़ियों का", cups: "प्यालों का", swords: "तलवारों का", pentacles: "सिक्कों का" },
  es: { wands: "Bastos", cups: "Copas", swords: "Espadas", pentacles: "Oros" },
  fr: { wands: "Bâtons", cups: "Coupes", swords: "Épées", pentacles: "Deniers" },
  ar: { wands: "العصي", cups: "الكؤوس", swords: "السيوف", pentacles: "النقود" },
  bn: { wands: "দণ্ডের", cups: "পেয়ালার", swords: "তরবারির", pentacles: "মুদ্রার" },
  pt: { wands: "Paus", cups: "Copas", swords: "Espadas", pentacles: "Ouros" },
  ru: { wands: "жезлов", cups: "кубков", swords: "мечей", pentacles: "пентаклей" },
  ur: { wands: "چھڑیوں کا", cups: "پیالوں کا", swords: "تلواروں کا", pentacles: "سکوں کا" },
  id: { wands: "Tongkat", cups: "Cawan", swords: "Pedang", pentacles: "Koin" },
  de: { wands: "Stäbe", cups: "Kelche", swords: "Schwerter", pentacles: "Münzen" },
  ja: { wands: "ワンド", cups: "カップ", swords: "ソード", pentacles: "ペンタクル" },
  ko: { wands: "완드", cups: "컵", swords: "소드", pentacles: "펜타클" },
  it: { wands: "Bastoni", cups: "Coppe", swords: "Spade", pentacles: "Denari" },
  la: { wands: "baculorum", cups: "poculorum", swords: "gladiorum", pentacles: "nummorum" },
};

function minorName(locale: LocaleId, index: string, suit: Suit): string {
  const rank = RANKS[locale][index] ?? index;
  const name = SUITS[locale][suit];
  if (locale === "zh") return `${name}${rank}`;
  if (locale === "ja") return `${name}の${rank}`;
  if (locale === "ko") return `${name} ${rank}`;
  if (locale === "it") return `${rank} di ${name}`;
  if (locale === "la") return `${rank} ${name}`;
  if (locale === "hi" || locale === "ur") return `${name} ${rank}`;
  if (locale === "bn") return `${name} ${rank}`;
  if (locale === "sq") {
    const particle = index === "P" || index === "Q" ? "e" : "i";
    return `${rank} ${particle} ${name}`;
  }
  if (locale === "ru" || locale === "ar" || locale === "id") return `${rank} ${name}`;
  if (locale === "de") return `${rank} der ${name}`;
  if (locale === "fr" && name.startsWith("É")) return `${rank} d'${name}`;
  return `${rank} of ${name}`.replace(" of ", locale === "en" ? " of " : " de ");
}

export function cardName(
  locale: LocaleId,
  card: { id: string; index: string; suit: Suit | null; arcana: "major" | "minor" },
): string {
  if (card.arcana === "major") return MAJORS[card.id]?.[locale] ?? card.id;
  if (!card.suit) return card.id;
  return minorName(locale, card.index, card.suit);
}
