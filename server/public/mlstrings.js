const ml_emotions = new Map([
    ['en', new Map([
        ['joy','joy']
        ,['trust','trust']
        ,['fear', 'fear']
        ,['surprise', 'surprise']
        ,['sadness', 'sadness']
        ,['disgust', 'disgust']
        ,['anger', 'anger']
        ,['anticipation', 'anticipation']
    ])],
    ['de', new Map([
        ['joy','Freude']
        ,['trust','Vertrauen']
        ,['fear', 'Furcht']
        ,['surprise', 'Erstaunen']
        ,['sadness', 'Missvergnügen']
        ,['disgust', 'Ekel']
        ,['anger', 'Wut']
        ,['anticipation', 'Vorwegnahme']
    ])],
    ['es', new Map([
        ['joy','alegría']
        ,['trust','confianza']
        ,['fear', 'miedo']
        ,['surprise', 'asombro']
        ,['sadness', 'molestia']
        ,['disgust', 'asco']
        ,['anger', 'enojo']
        ,['anticipation', 'anticipación']
    ])],
    ['uk', new Map([
        ['joy','радість']
        ,['trust','довіра']
        ,['fear', 'страх']
        ,['surprise', 'здивування']
        ,['sadness', 'смуток']
        ,['disgust', 'огида']
        ,['anger', 'гнів']
        ,['anticipation', 'очікування']
    ])],
   ['ru', new Map([
        ['joy','радость']
        ,['trust','доверие']
        ,['fear', 'страх']
        ,['surprise', 'удивление']
        ,['sadness', 'досада']
        ,['disgust', 'отвращение']
        ,['anger', 'злость']
        ,['anticipation', 'предвкушение']
    ])]
]);

const myEmotions = new Map([
    ['en', 'My emotions']
    ,['ru', 'Мои эмоции']
    ,['de', 'Meine Gefühle']
    ,['es', 'Mis emociones']
    ,['uk', 'мої емоції']
]);

const othersEmotions = new Map([
    ['en', `Emotions of people who rated the same content`]
    ,['ru', 'Эмоции людей, оценивших тот же контент']
    ,['de', 'Emotionen von Personen, die denselben Inhalt bewertet haben']
    ,['es', 'Emociones de las personas que calificaron el mismo contenido']
    ,['uk', 'Емоції людей, які оцінили один і той же контент']
]);

const prompt = new Map([
    ['en', 'Pay attention to the difference between your ratings and the ratings of other people. A strong excess of the level of individual emotions or their reduced level requires attention. Click on the columns of emotions and see the transcript']
    ,['ru', 'Обратите внимание на отличие Ваших оценок от оценок других людей. Сильное превышение уровня отдельных эмоций или их пониженный уровень требуют внимания. Нажимайте на столбики эмоций и смотрите расшифровку']
    ,['de', 'Achten Sie auf den Unterschied zwischen Ihren Bewertungen und den Bewertungen anderer Personen. Eine starke Überschreitung des Niveaus einzelner Emotionen oder deren Reduzierung erfordert Aufmerksamkeit. Klicken Sie auf die Emotionsspalten und sehen Sie sich das Transkript an']
    ,['es', 'Preste atención a la diferencia entre sus calificaciones y las calificaciones de otras personas. Un fuerte exceso del nivel de emociones individuales o su nivel reducido requiere atención. Haga clic en las columnas de emociones y vea la transcripción.']
    ,['uk', 'Зверніть увагу на відміну Ваших оцінок від оцінок інших людей. Сильне перевищення рівня окремих емоцій чи їх знижений рівень потребують уваги. Натискайте на стовпчики емоцій та дивіться розшифровку']
]);

const assess = new Map([
    ['en', 'Assess']
    ,['ru', 'Оценить']
    ,['de', 'Bewerten']
    ,['es', 'Evaluar']
    ,['uk', 'Оцінити']
]);

function txt_skip (lang = 'en') {
    switch(lang) {
        case 'es': return 'Saltar';
        case 'de': return 'Überspringen';
        case 'uk': return 'Пропустити';
        case 'ru': return 'Пропустить';
        case 'en':
        default: return 'Skip';
    }
}

const thatsAll = new Map([
    ['en', `Sorry, that's all content `]
    ,['ru', 'Извините на этом всё']
    ,['de', 'Entschuldigung, das ist alles']
    ,['es', 'lo siento, eso es todo']
    ,['uk', 'Вибачте, на цьому все']
]);

const pressToNew = new Map([
    ['en', `Press button to get new content item`]
    ,['ru', 'Нажмите кнопку, чтобы получить новый контент для оценки']
    ,['de', 'Klicken Sie auf die Schaltfläche, um neue Inhalte zum Bewerten zu erhalten']
    ,['es', 'Haga clic en el botón para obtener contenido nuevo para calificar']
    ,['uk', 'Натисніть кнопку, щоб отримати новий контент для оцінки']
]);

class MLString extends String {
    constructor(def) {
        super(typeof def !== 'string' ? def.default : def);
        //this.values = new Map();
        this.values = typeof def !== 'string' ? new Map(def.values) : new Map();
    }
    toString(lang){
        return lang ? (this.values.has(lang) ? this.values.get(lang) : super.toString()) : super.toString();
    }
    toJSON() {
        return {
            default: super.toString(),
            values: Array.from(this.values)
        }
    }
    get default() {
        return super.toString();
    }
}

const strBack = new MLString({
    default: 'Back',
    values: [
        ['en', 'Back'],
        ['ru', 'Назад'],
        ['uk', 'назад'],
        ['es', 'Atrás'],
        ['de', 'zurück'],
    ]
});

const strEmotion = new MLString({
    default: 'Emotion',
    values: [
        ['en', 'Emotion'],
        ['ru', 'Эмоция'],
        ['uk', 'Емоція'],
        ['es', 'Emoción'],
        ['de', 'Emotion'],
    ]
});

const strDecodingTip = new MLString({
    default: 'Select different items one by one to see how your scores differ from other people\'s scores',
    values: [
        ['en', 'Select different items one by one to see how your scores differ from other people\'s scores'],
        ['ru', 'Выберите поочередно разные элементы, чтобы посмотреть, как отличаются Ваши оценки и оценки других людей'],
        ['uk', 'Виберіть по черзі різні елементи, щоб подивитися, як відрізняються Ваші оцінки та оцінки інших людей'],
        ['es', 'Seleccione diferentes elementos uno por uno para ver cómo sus puntajes difieren de los puntajes de otras personas'],
        ['de', 'Wählen Sie nacheinander verschiedene Elemente aus, um zu sehen, wie sich Ihre Ergebnisse von den Ergebnissen anderer Personen unterscheiden'],
    ]
});

const strDecodingYouFound = new MLString({
    default: 'You discovered',
    values: [
        ['en', 'You discovered'],
        ['ru', 'Вы обнаружили'],
        ['uk', 'Ви виявили'],
        ['es', 'descubriste'],
        ['de', 'Du hast es entdeckt'],
    ]
});

const strDecodingOthersAssessed = new MLString({
    default: 'Others assessed',
    values: [
        ['en', 'Others assessed'],
        ['ru', 'Другие оценили'],
        ['uk', 'Інші оцінили'],
        ['es', 'Otro(a)s evaluados'],
        ['de', 'Andere bewerteten'],
    ]
});
