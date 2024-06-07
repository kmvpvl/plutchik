import { Schema } from "mongoose";
export type MLString = string | {
    default: string;
    values?: Map<string, string>
}

export const MLStringSchema = new Schema({
    default: {type: String, required: true},
    values: {
        type: Map,
        of: String,
        required: false
    }
});
const plutchik_strings = new Map([
    ['Type region or country', 
        new Map([
        ['de', 'Geben Sie die Region oder das Land ein']
    ,   ['fr', 'Tapez la région ou le pays']
    ,   ['es', 'Escriba región o país']
    ,   ['uk', 'Введіть регіон або країну']
    ,   ['ru', 'Указать регион или страну']
        ])
    ], ['Share real location',
    new Map([
        ['de', 'Teilen Sie den tatsächlichen Standort']
    ,   ['fr', 'Указать регион или страну']
    ,   ['es', 'Compartir ubicación real']
    ,   ['uk', 'Поділіться реальним місцем розташування']
    ,   ['ru', 'Поделиться реальной геопозицией']
        ])
    ], ['Hide my location',
    new Map([
        ['de', 'Meinen Standort verbergen']
    ,   ['fr', 'Masquer ma position']
    ,   ['es', 'Ocultar mi ubicación']
    ,   ['uk', 'Приховати моє місцезнаходження']
    ,   ['ru', 'Скрыть мою геопозицию']
        ])
    ], ['My settings',
    new Map([
        ['de', 'Meine Einstellungen']
    ,   ['fr', 'Mes paramètres']
    ,   ['es', 'Mi configuración']
    ,   ['uk', 'Мої налаштування']
    ,   ['ru', 'Мои настройки']
        ])
    ], ['Assess new content',
    new Map([
        ['de', 'Emotionen bewerten']
    ,   ['fr', 'Évaluer le nouveau contenu']
    ,   ['es', 'Evaluar emociones']
    ,   ['uk', 'Оцінити емоції']
    ,   ['ru', 'Оценить ещё']
        ])
    ], ['Insights',
    new Map([
        ['de', 'Einblicke']
    ,   ['fr', 'Connaissances']
    ,   ['es', 'Perspectivas']
    ,   ['uk', 'Інсайти']
    ,   ['ru', 'Инсайты']
        ])
    ], ['Get matched',
    new Map([
        ['de', 'Gematcht werden']
    ,   ['fr', 'Soyez jumelé']
    ,   ['es', 'Ser emparejado']
    ,   ['uk', 'Отримати відповідність']
    ,   ['ru', 'Получить соответствие']
        ])
    ], ['Sorry, your account not found. Press /start',
    new Map([
        ['de', 'Entschuldigung, Ihr Konto wurde nicht gefunden. Drücke /start']
    ,   ['fr', 'Désolé, votre compte est introuvable. Appuyez sur /start']
    ,   ['es', 'Lo sentimos, no se encontró su cuenta. Presiona /start']
    ,   ['uk', 'Вибачте, ваш обліковий запис не знайдено. Натисніть /start']
    ,   ['ru', 'Ваша учетная запись не найдена. Чтобы возобновить введите /start']
        ])
    ], ['Here\'s what we know about you so far',
    new Map([
        ['de', 'Hier ist, was wir bisher über Sie wissen']
    ,   ['fr', 'Voici ce que nous savons de vous jusqu\'à présent']
    ,   ['es', 'Esto es lo que sabemos de ti hasta ahora']
    ,   ['uk', 'Ось що нам відомо про Вас на даний момент']
    ,   ['ru', 'Вот что нам известно о Вас на данный момент']
        ])
    ], ['Enter your name',
    new Map([
        ['de', 'Gib deinen Namen ein']
    ,   ['fr', 'Entrez votre nom']
    ,   ['es', 'Introduzca su nombre']
    ,   ['uk', 'Введіть ім\'я']
    ,   ['ru', 'Введите имя']
        ])
    ], ['Your name\'s been changed',
    new Map([
        ['de', 'Ihr Name wurde geändert']
    ,   ['fr', 'Ton nom a été changé']
    ,   ['es', 'Tu nombre ha sido cambiado']
    ,   ['uk', 'Ваше ім\'я змінено']
    ,   ['ru', 'Ваше имя изменено']
        ])
    ], ['Options to share location',
        new Map([
            ['de', 'Optionen zum Teilen des Standorts']
        ,   ['fr', 'Options pour partager l\'emplacement']
        ,   ['es', 'Opciones para compartir ubicación']
        ,   ['uk', 'Варіанти поділитися місцем розташування']
        ,   ['ru', 'Варианты поделиться местоположением']
            ])
        ]
]);

export default function ML(str?: string, lang?: string): string {
    if (str === undefined) return 'Unknown string';
    if (lang === undefined) return str;
    if (!plutchik_strings.has(str)) return str;
    const el = plutchik_strings.get(str);
    if (!el?.has(lang)) return str;
    return el.get(lang) as string;
}
