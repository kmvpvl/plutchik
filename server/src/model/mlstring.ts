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
    [`Type region or country`, 
        new Map([
        [`de`, `Geben Sie die Region oder das Land ein`]
    ,   [`fr`, `Tapez la région ou le pays`]
    ,   [`es`, `Escriba región o país`]
    ,   [`uk`, `Введіть регіон або країну`]
    ,   [`ru`, `Указать регион или страну`]
        ])
    ], [`Share real location`,
    new Map([
        [`de`, `Teilen Sie den tatsächlichen Standort`]
    ,   [`fr`, `Указать регион или страну`]
    ,   [`es`, `Compartir ubicación real`]
    ,   [`uk`, `Поділіться реальним місцем розташування`]
    ,   [`ru`, `Поделиться реальной геопозицией`]
        ])
    ], [`Hide my location`,
    new Map([
        [`de`, `Meinen Standort verbergen`]
    ,   [`fr`, `Masquer ma position`]
    ,   [`es`, `Ocultar mi ubicación`]
    ,   [`uk`, `Приховати моє місцезнаходження`]
    ,   [`ru`, `Скрыть мою геопозицию`]
        ])
    ], [`My settings`,
    new Map([
        [`de`, `Meine Einstellungen`]
    ,   [`fr`, `Mes paramètres`]
    ,   [`es`, `Mi configuración`]
    ,   [`uk`, `Мої налаштування`]
    ,   [`ru`, `Мои настройки`]
        ])
    ], [`Assess new content`,
    new Map([
        [`de`, `Emotionen bewerten`]
    ,   [`fr`, `Évaluer le nouveau contenu`]
    ,   [`es`, `Evaluar emociones`]
    ,   [`uk`, `Оцінити емоції`]
    ,   [`ru`, `Оценить ещё`]
        ])
    ], [`Insights`,
    new Map([
        [`de`, `Einblicke`]
    ,   [`fr`, `Connaissances`]
    ,   [`es`, `Perspectivas`]
    ,   [`uk`, `Інсайти`]
    ,   [`ru`, `Инсайты`]
        ])
    ], [`Get matched`,
    new Map([
        [`de`, `Gematcht werden`]
    ,   [`fr`, `Soyez jumelé`]
    ,   [`es`, `Ser emparejado`]
    ,   [`uk`, `Отримати відповідність`]
    ,   [`ru`, `Получить соответствие`]
        ])
    ], [`Sorry, your account not found. Press /start`,
    new Map([
        [`de`, `Entschuldigung, Ihr Konto wurde nicht gefunden. Drücke /start`]
    ,   [`fr`, `Désolé, votre compte est introuvable. Appuyez sur /start`]
    ,   [`es`, `Lo sentimos, no se encontró su cuenta. Presiona /start`]
    ,   [`uk`, `Вибачте, ваш обліковий запис не знайдено. Натисніть /start`]
    ,   [`ru`, `Ваша учетная запись не найдена. Чтобы возобновить введите /start`]
        ])
    ], [`Here's what we know about you so far`,
    new Map([
        [`de`, `Hier ist, was wir bisher über Sie wissen`]
    ,   [`fr`, `Voici ce que nous savons de vous jusqu'à présent`]
    ,   [`es`, `Esto es lo que sabemos de ti hasta ahora`]
    ,   [`uk`, `Ось що нам відомо про Вас на даний момент`]
    ,   [`ru`, `Вот что нам известно о Вас на данный момент`]
        ])
    ], [`Enter your name`,
    new Map([
        [`de`, `Gib deinen Namen ein`]
    ,   [`fr`, `Entrez votre nom`]
    ,   [`es`, `Introduzca su nombre`]
    ,   [`uk`, `Введіть ім'я`]
    ,   [`ru`, `Введите имя`]
        ])
    ], [`Your name's been changed`,
    new Map([
        [`de`, `Ihr Name wurde geändert`]
    ,   [`fr`, `Ton nom a été changé`]
    ,   [`es`, `Tu nombre ha sido cambiado`]
    ,   [`uk`, `Ваше ім'я змінено`]
    ,   [`ru`, `Ваше имя изменено`]
        ])
    ], [`Options to share location`,
    new Map([
        [`de`, `Optionen zum Teilen des Standorts`]
    ,   [`fr`, `Options pour partager l'emplacement`]
    ,   [`es`, `Opciones para compartir ubicación`]
    ,   [`uk`, `Варіанти поділитися місцем розташування`]
    ,   [`ru`, `Варианты поделиться местоположением`]
        ])
    ], [`My name`,
    new Map([
        [`de`, `Mein Name`]
    ,   [`fr`, `Mon nom`]
    ,   [`es`, `Mi nombre`]
    ,   [`uk`, `Моє ім'я`]
    ,   [`ru`, `Мое имя`]
        ])
    ], [`Share my location`,
    new Map([
        [`de`, `Meinen Standort teilen`]
    ,   [`fr`, `Partager ma position`]
    ,   [`es`, `compartir mi ubicación`]
    ,   [`uk`, `Поділитися моїм розташуванням`]
    ,   [`ru`, `Мое местоположение`]
        ])
    ], [`Male`,
    new Map([
        [`de`, `Männlich`]
    ,   [`fr`, `Mâle`]
    ,   [`es`, `Masculina`]
    ,   [`uk`, `Чоловік`]
    ,   [`ru`, `Мужчина`]
        ])
    ], [`Female`,
    new Map([
        [`de`, `Weiblich`]
    ,   [`fr`, `Femelle`]
    ,   [`es`, `Femenina`]
    ,   [`uk`, `Жінка`]
    ,   [`ru`, `Женщина`]
        ])
    ], [`Their`,
    new Map([
        [`de`, `Anderes Geschlecht`]
    ,   [`fr`, `Leur`]
    ,   [`es`, `Otro género`]
    ,   [`uk`, `Інша стать`]
    ,   [`ru`, `Другой`]
        ])
    ], [`Your location hidden`,
    new Map([
        [`de`, `Ihr Standort ist ausgeblendet`]
    ,   [`fr`, `Votre position masquée`]
    ,   [`es`, `Tu ubicación oculta`]
    ,   [`uk`, `Ваше місцезнаходження приховано`]
    ,   [`ru`, `Ваше местоположение скрыто`]
        ])
    ], [`Type your place where you live`,
    new Map([
        [`de`, `Geben Sie Ihren Wohnort ein`]
    ,   [`fr`, `Tapez votre endroit où vous habitez`]
    ,   [`es`, `Escribe tu lugar donde vives`]
    ,   [`uk`, `Введіть своє місце проживання`]
    ,   [`ru`, `Введите место, где вы живете`]
        ])
    ], [`Press button to share you location`,
    new Map([
        [`de`, `Drücken Sie die Taste, um Ihren Standort freizugeben`]
    ,   [`fr`, `Appuyez sur le bouton pour partager votre position`]
    ,   [`es`, `Presione el botón para compartir su ubicación`]
    ,   [`uk`, `Натисніть кнопку, щоб поділитися своїм місцезнаходженням`]
    ,   [`ru`, `Нажмите кнопку, чтобы поделиться своим местоположением`]
        ])
    ], [`Your location accepted`,
    new Map([
        [`de`, `Ihr Standort akzeptiert`]
    ,   [`fr`, `Votre localisation acceptée`]
    ,   [`es`, `Tu ubicación aceptada`]
    ,   [`uk`, `Ваше місцезнаходження прийнято`]
    ,   [`ru`, `Ваше местоположение принято`]
        ])
    ], [`Your message does not contain real coordinates and accepted as your region or country`,
    new Map([
        [`de`, `Ihre Nachricht enthält keine echten Koordinaten und wird als Ihre Region oder Ihr Land akzeptiert`]
    ,   [`fr`, `Votre message ne contient pas de coordonnées réelles et est accepté comme votre région ou pays`]
    ,   [`es`, `Su mensaje no contiene coordenadas reales y se acepta como su región o país.`]
    ,   [`uk`, `Ваше повідомлення не містить реальних координат і прийнято як ваш регіон або країна`]
    ,   [`ru`, `Ваше сообщение не содержит реальных координат и принято за ваш регион или страну.`]
        ])
    ], [`If you have problems using the bot, then simply write a message to the bot. See details here`,
    new Map([
        [`de`, `Solltest du Probleme bei der Nutzung des Bots haben, dann schreib einfach eine Nachricht an den Bot. Einzelheiten finden Sie hier`]
    ,   [`fr`, `Si vous rencontrez des problèmes lors de l'utilisation du bot, écrivez simplement un message au bot. Voir les détails ici`]
    ,   [`es`, `Si tiene problemas para usar el bot, simplemente escriba un mensaje al bot. Ver detalles aquí`]
    ,   [`uk`, `Якщо у вас виникають проблеми з використанням бота, просто напишіть повідомлення боту. Подробиці дивіться тут`]
    ,   [`ru`, `Если у Вас есть проблемы при использовании бота, то просто напишите сообщение в бот. Подробности смотрите здесь`]
        ])
    ], [`Welcome! This bot is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The bot will allow you to calculate your emotional azimuth, compare it with other participants, while remaining safe. Be sure that information about you will be deleted the moment you ask for it. Read more details about the system here`,
    new Map([
        [`de`, `Willkommen! Dieser Bot ist Teil eines größeren Systems zur Interaktion zwischen Psychologen, ihren Klienten, Arbeitgebern und ihren Mitarbeitern. Das System zielt darauf ab, den Komfort der Interaktion zu erhöhen und die Lebensqualität aller Teilnehmer zu verbessern. Mit dem Bot können Sie Ihren emotionalen Azimut berechnen und ihn mit anderen Teilnehmern vergleichen, während Sie sicher bleiben. Sie können sicher sein, dass Informationen über Sie gelöscht werden, sobald Sie dies anfordern. Weitere Einzelheiten zum System finden Sie hier`]
    ,   [`fr`, `Accueillir! Ce bot fait partie d’un système plus vaste d’interaction entre les psychologues, leurs clients, les employeurs et leurs employés. Le système vise à augmenter le confort d'interaction et à améliorer la qualité de vie de tous les participants. Le bot vous permettra de calculer votre azimut émotionnel, de le comparer avec les autres participants, tout en restant en sécurité. Assurez-vous que les informations vous concernant seront supprimées dès que vous les demanderez. Lire plus de détails sur le système ici`]
    ,   [`es`, `¡Bienvenido! Este bot es parte de un sistema más amplio de interacción entre psicólogos, sus clientes, empleadores y empleados. El sistema tiene como objetivo aumentar la comodidad de la interacción y mejorar la calidad de vida de todos los participantes. El bot te permitirá calcular tu acimut emocional, compararlo con otros participantes y permanecer seguro. Asegúrese de que su información se elimine en el momento en que la solicite. Lea más detalles sobre el sistema aquí`]
    ,   [`uk`, `Ласкаво просимо! Цей бот є частиною великої системи взаємодії між психологами, їхніми клієнтами, роботодавцями та їхніми працівниками. Система спрямована на підвищення комфорту взаємодії та покращення якості життя всіх учасників. Бот дозволить вам розрахувати свій емоційний азимут, порівняти його з іншими учасниками, залишаючись у безпеці. Будьте впевнені, що інформація про вас буде видалена в той момент, коли ви про це попросите. Детальніше про систему читайте тут`]
    ,   [`ru`, `Добро пожаловать! Этот бот является частью большой системы для взаимодействия психологов, их клиентов, работодателей и их работников. Система нацелена на повышение комфортности взаимодействия и улучшения качества жизни всех участников. Бот позволит Вам вычислить Ваш эмоциональный азимут, сравнить его с другими участниками, оставаясь в безопасности. Будьте уверены, что информация о Вас будет удалена в тот момент, как Вы об этом попросите. Больше подробностей о системе прочитайте тут`]
        ])
    ], [`Match mind first`,
    new Map([
        [`de`, `Match Mind zuerst`]
    ,   [`fr`, `Faites correspondre l'esprit d'abord`]
    ,   [`es`, `Combina la mente primero`]
    ,   [`uk`, `Спочатку пізнайте розум`]
    ,   [`ru`, `Сначала познайте разум`]
        ])
    ]
]);

export default function ML(str?: string, lang?: string): string {
    if (str === undefined) return `Unknown string`;
    if (lang === undefined) return str;
    if (!plutchik_strings.has(str)) return str;
    const el = plutchik_strings.get(str);
    if (!el?.has(lang)) return str;
    return el.get(lang) as string;
}
