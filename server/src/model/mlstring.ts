import { Schema } from "mongoose";
import colours from "./colours";
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
        [`de`, `Willkommen! Dieser Bot ist Teil eines größeren Systems zur Interaktion zwischen Psychologen, ihren Klienten, Arbeitgebern und ihren Mitarbeitern. Das System zielt darauf ab, den Komfort der Interaktion zu erhöhen und die Lebensqualität aller Teilnehmer zu verbessern. Mit dem Bot können Sie Ihren emotionalen Azimut berechnen und ihn mit anderen Teilnehmern vergleichen, während Sie sicher bleiben. Sie können sicher sein, dass Informationen über Sie gelöscht werden, sobald Sie dies anfordern. Mehr lesen`]
    ,   [`fr`, `Accueillir! Ce bot fait partie d'un système plus vaste d'interaction entre les psychologues, leurs clients, les employeurs et leurs employés. Le système vise à augmenter le confort d'interaction et à améliorer la qualité de vie de tous les participants. Le bot vous permettra de calculer votre azimut émotionnel, de le comparer avec les autres participants, tout en restant en sécurité. Assurez-vous que les informations vous concernant seront supprimées dès que vous les demanderez. En savoir plus`]
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
    ], [`Register me`,
    new Map([
        [`de`, `Registriere mich`]
    ,   [`fr`, `Inscrivez-moi`]
    ,   [`es`, `Registrame`]
    ,   [`uk`, `Зарегистрируйте меня`]
    ,   [`ru`, `Зарегистрируйте меня`]
    ,   [`it`, `Registrami`]
        ])
    ], [`Main menu`,
    new Map([
        [`de`, `Hauptmenü`]
    ,   [`fr`, `Menu principal`]
    ,   [`es`, `Menú principal`]
    ,   [`uk`, `Головне меню`]
    ,   [`ru`, `Главное меню`]
    ,   [`it`, `Menu principale`]
        ])
    ], [`I have an issue, pls help me`,
    new Map([
        [`de`, `Ich habe ein Problem, bitte helfen Sie mir`]
    ,   [`fr`, `J'ai un problème, aidez-moi s'il vous plaît`]
    ,   [`es`, `Tengo un problema por favor ayúdenme.`]
    ,   [`uk`, `У мене проблема, будь ласка, допоможіть мені`]
    ,   [`ru`, `Мне нужна помощь, помогите мне, пожалуста`]
    ,   [`it`, `Ho un problema, per favore aiutami`]
        ])
    ], [`I Accept`,
    new Map([
        [`de`, `Ich akzeptiere`]
    ,   [`fr`, `J'accepte`]
    ,   [`es`, `Acepto`]
    ,   [`uk`, `Я приймаю`]
    ,   [`ru`, `Я принимаю`]
        ])
    ], [`Click the "I Accept" button to express your informed consent that the author of the request will be able to familiarize yourself with your emotional assessments of the proposed content`,
    new Map([
        [`de`, `Klicken Sie auf die Schaltfläche "Ich akzeptiere", um Ihre informierte Zustimmung auszudrücken, dass der Autor der Anfrage Ihre emotionalen Einschätzungen des vorgeschlagenen Inhalts kennenlernen kann`]
    ,   [`fr`, `Cliquez sur le bouton "J'accepte" pour exprimer votre consentement éclairé afin que l'auteur de la demande puisse prendre connaissance de vos appréciations émotionnelles sur le contenu proposé.`]
    ,   [`es`, `Haga clic en el botón "Acepto" para expresar su consentimiento informado de que el autor de la solicitud podrá familiarizarse con sus valoraciones emocionales del contenido propuesto.`]
    ,   [`uk`, `Натисніть кнопку «Приймаю», щоб висловити інформовану згоду на те, що автор запиту зможе ознайомитися з вашими емоційними оцінками запропонованого контенту.`]
    ,   [`ru`, `Нажмите кнопку "Я принимаю", чтобы выразить Ваше информированное согласие, что автор запроса сможет ознакомиться с Вашими эмоциональными оценками предложенного контента `]
        ])
    ], [`Click the "I Decline" button to reject and cancel the request. The requester will be informed that their request has been rejected`,
    new Map([
        [`de`, `Klicken Sie auf die Schaltfläche „Ich lehne ab“, um die Anfrage abzulehnen und abzubrechen. Der Antragsteller wird darüber informiert, dass seine Anfrage abgelehnt wurde.`]
    ,   [`fr`, `Cliquez sur le bouton « Je refuse » pour rejeter et annuler la demande. Le demandeur sera informé que sa demande a été rejetée`]
    ,   [`es`, `Haga clic en el botón "Rechazo" para rechazar y cancelar la solicitud. Se informará al solicitante que su solicitud ha sido rechazada.`]
    ,   [`uk`, `Натисніть кнопку «Я відхиляю», щоб відхилити та скасувати запит. Заявник буде проінформований про те, що його запит відхилено`]
    ,   [`ru`, `Нажмите кнопку "Я отклоняю", чтобы отклонить и аннулировать запрос. Автор запроса будет проинформирован, что его запрос отклонен `]
        ])
    ], [`I Decline`,
    new Map([
        [`de`, `Ich lehne ab`]
    ,   [`fr`, `Je refuse`]
    ,   [`es`, `Rechazo`]
    ,   [`uk`, `Я відхиляю`]
    ,   [`ru`, `Я отклоняю`]
        ])
    ], [`Your Telegram ID is `,
    new Map([
        [`de`, `Ihre Telegram-ID ist `]
    ,   [`fr`, `Votre identifiant Telegram est `]
    ,   [`es`, `Tu ID de Telegram es `]
    ,   [`uk`, `Ваш ідентифі катор Telegram `]
    ,   [`ru`, `Ваш Telegram ID `]
        ])
    ], [`Use your Telegram ID to create own content sets or to be invited assessing other sets`,
    new Map([
        [`de`, `Verwende deine Telegram-ID, um eigene Inhaltssets zu erstellen oder um zur Bewertung anderer Sets eingeladen zu werden`]
    ,   [`fr`, `Utilisez votre identifiant Telegram pour créer vos propres ensembles de contenu ou pour être invité à évaluer d'autres ensembles`]
    ,   [`es`, `Utilice su ID de Telegram para crear conjuntos de contenido propios o para ser invitado a evaluar otros conjuntos`]
    ,   [`uk`, `Використовуйте свій ідентифікатор Telegram, щоб створювати власні набори вмісту або отримувати запрошення оцінювати інші набори`]
    ,   [`ru`, `Используйте свой идентификатор Telegram, чтобы создавать собственные наборы контента или получать приглашения для оценки других наборов.`]
        ])
    ], [`Now you can assess new content. The assigned sets have priority and be proposed first. When you assess all assigned item we'll text to author of set`,
    new Map([
        [`de`, `Jetzt können Sie neue Inhalte bewerten. Die zugewiesenen Sets haben Priorität und werden zuerst vorgeschlagen. Wenn Sie alle zugewiesenen Elemente bewertet haben, senden wir eine SMS an den Autor des Sets.`]
    ,   [`fr`, `Vous pouvez désormais évaluer le nouveau contenu. Les ensembles attribués sont prioritaires et seront proposés en premier. Lorsque vous aurez évalué tous les éléments attribués, nous enverrons un SMS à l'auteur de l'ensemble.`]
    ,   [`es`, `Ahora puedes valorar nuevos contenidos. Los conjuntos asignados tienen prioridad y serán propuestos en primer lugar. Cuando evalúes todos los elementos asignados, enviaremos un mensaje de texto al autor del conjunto.`]
    ,   [`uk`, `Тепер ви можете оцінити новий вміст. Призначені набори мають пріоритет і пропонуються першими. Коли ви оціните всі призначені елементи, ми надішлемо текстове повідомлення автору набору`]
    ,   [`ru`, `Теперь вы можете оценить новый контент. Назначенные наборы имеют приоритет и предлагаются в первую очередь. Когда вы оцените все назначенные предметы, мы отправим сообщение автору набора.`]
        ])
    ], [`You declined the invitation`,
    new Map([
        [`de`, `Sie haben die Einladung abgelehnt`]
    ,   [`fr`, `Vous avez décliné l'invitation`]
    ,   [`es`, `Rechazaste la invitación.`]
    ,   [`uk`, `Ви відхилили запрошення`]
    ,   [`ru`, `Вы отклонили приглашение`]
        ])
    ], [`has accepted your invitation to assess the set`,
        new Map([
        [`de`, `hat Ihre Einladung zur Bewertung des Sets angenommen`]
    ,   [`fr`, `a accepté votre invitation à évaluer l'ensemble`]
    ,   [`es`, `ha aceptado tu invitación para valorar el conjunto.`]
    ,   [`uk`, `прийняв ваше запрошення оцінити набір`]
    ,   [`ru`, `принял ваше приглашение оценить`]
        ])
    ], [`has declined your invitation to assess the set`,
        new Map([
        [`de`, `hat Ihre Einladung zur Bewertung des Sets abgelehnt`]
    ,   [`fr`, `a décliné votre invitation à évaluer l'ensemble`]
    ,   [`es`, `ha rechazado su invitación para valorar el conjunto.`]
    ,   [`uk`, `відхилив ваше запрошення оцінити набір`]
    ,   [`ru`, `отклонил ваше приглашение оценить`]
        ])
    ], [`invites you to assess the set`,
        new Map([
        [`de`, `lädt Sie ein, das Set zu bewerten`]
    ,   [`fr`, `vous invite à évaluer l'ensemble`]
    ,   [`es`, `te invita a evaluar el conjunto.`]
    ,   [`uk`, `пропонує вам оцінити набір`]
    ,   [`ru`, `приглашает вас оценить набор`]
        ])
    ], [`reminds you about the set`,
        new Map([
        [`de`, `erinnert Sie an das Set`]
    ,   [`fr`, `vous rappelle l'ensemble`]
    ,   [`es`, `te recuerda sobre el set.`]
    ,   [`uk`, `нагадує про набір`]
    ,   [`ru`, `напоминает о наборе`]
        ])
    ], [`User didn't accept your invitation`,
        new Map([
        [`de`, `Der Benutzer hat Ihre Einladung nicht angenommen`]
    ,   [`fr`, `L'utilisateur n'a pas accepté votre invitation`]
    ,   [`es`, `El usuario no aceptó tu invitación.`]
    ,   [`uk`, `Користувач не прийняв ваше запрошення`]
    ,   [`ru`, `Пользователь не принял ваше приглашение`]
        ])
    ], [`The assign was closed`,
        new Map([
        [`de`, `Die Zuweisung wurde abgeschlossen`]
    ,   [`fr`, `La mission a été clôturée`]
    ,   [`es`, `La asignación fue cerrada.`]
    ,   [`uk`, `Призначення було закрито`]
    ,   [`ru`, `Назначение было закрыто`]
        ])
    ]
]);

export default function ML(str?: string, lang?: string): string {
    if (lang === undefined) console.log(`${colours.fg.yellow}ML without lang '${str?.substring(0, 15)}'... ${colours.reset}`);
    if (str === undefined) return `Unknown string`;
    if (lang === undefined) return str;
    if (!plutchik_strings.has(str)) {
        console.log(`${colours.fg.yellow}ML is absent in the list '${str?.substring(0, 15)}'... ${colours.reset}`);
        return str;
    }
    const el = plutchik_strings.get(str);
    if (!el?.has(lang)) return str;
    return el.get(lang) as string;
}
