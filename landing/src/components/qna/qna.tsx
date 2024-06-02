import { ReactNode } from "react";
import "./qna.css";
import React from "react";
import MLString from "../mlstrings";

export interface QNAProps {

}

export interface QNAState {

}
const strQNA = new MLString({
    default: "Q&A", 
    values: new Map([
        ["en-US", "Q&A"],
        ["de", "Fragen und Antworten"],
        ["fr", "Questions et réponses"],
        ["es", "Preguntas y respuestas"],
        ["uk", "Питання та відповіді"],
        ["ru", "Вопросы и ответы"]])
});

const strQNAText = new MLString({
    default: 
    "❓: How do I log in?\n"+
    "✅: Find the bot named @plutchart_bot in Telegram and run the /start command. If you have not previously registered or have previously revoked your consent to use your ratings, you will be re-registered. If you have a valid registration, we will provide all the data we have about you.\n\n"+
    
    "❓: How can I find out my emotional vector?\n"+
    "✅: To do this, you need to start assessing the content. Click the “Assess new content” button and a content element will appear in front of you. Below you will see a list of basic emotions. Mark the emotions that the proposed content evokes in you and their level and click the “Next” button. If for some reason you want to leave the proposed content without rating, click the “Skip” button. The more elements you assess, the more accurate the measurement will be. When you decide that you have assessed enough, click the “Insights” button. You will see your average emotional vector and the average emotional vector of people who have previously assessed the same content. The system will calculate the difference between these two vectors and highlight your differences.\n\n"+
    
    "❓: Who will see my assessments?\n"+
    "✅: Your assessments will be visible to researchers. They will see that this assessment was made by an anonymous user. If you provide your age, gender, region, the researcher will also see them. But your name, your Telegram ID will remain a secret for him. In addition, your assessments will be aggregated with the assessments of other users and will be used to calculate the average emotional vector with which other users will be compared. Your assessments will not be used to calculate the average emotional vector with which your emotional vector will be compared.\n\n"+
    
    "❓: How do I know how I differ from others?\n"+
    "✅: If you have enough assessments, then select the “Insights” button. You will see your emotional vector, the average emotional vector of other users who have assessed the same content. The system will highlight your difference from others.\n\n"+
    
    "❓: How do I express my informed consent that my psychologist, business coach or employer can see my assessments?\n"+
    "✅: If a researcher, your employer or business coach wants to access not only anonymous data, then you will receive a request in Telegram to see previously given assessments or an invitation to evaluate a new set of content. You can accept or decline it. The researcher does not have the right to remain anonymous. You will see the name of the person who is asking for your consent.\n\n"+
    
    "❓: How do I withdraw my consent to view my assessments?\n"+
    "✅: You can click the “Delete My Data” button. All your data will be deleted.\n\n"+
    
    "❓: How do I invite my team or client to take an assessment?\n"+
    "✅: Click the “Invite” button, enter the name of the user you want to invite, and wait for the invitee to accept or decline your invitation.\n\n"+
    
    "❓: How do I get informed consent from team members to view their assessment results?\n"+
    "✅: Accepting your invitation to take an assessment constitutes informed consent to view the assessment results.\n\n"+
    
    "❓: What happens if and when a team member withdraws their consent?\n"+
    "✅: When and if any user withdraws their consent to view the assessment results, you lose access to their assessments.\n\n"+
    
    "❓: How can I monitor the progress of my team or clients in their assessment?\n"+
    "✅: You will receive a message when someone you invited has completed their assessment of your content.", 
    values: new Map([
        ["de", 
        "❓: Wie melde ich mich an?\n"+
        "✅: Suchen Sie in Telegram nach dem Bot mit dem Namen @plutchart_bot und führen Sie den Befehl /start aus. Wenn Sie sich zuvor nicht registriert haben oder Ihre Zustimmung zur Verwendung Ihrer Bewertungen zuvor widerrufen haben, werden Sie erneut registriert. Wenn Sie über eine gültige Registrierung verfügen, stellen wir Ihnen alle Daten zur Verfügung, die wir über Sie haben.\n\n"+
        
        "❓: Wie kann ich meinen emotionalen Vektor herausfinden?\n"+
        "✅: Dazu müssen Sie mit der Bewertung des Inhalts beginnen. Klicken Sie auf die Schaltfläche „Neuen Inhalt bewerten“ und ein Inhaltselement wird vor Ihnen angezeigt. Darunter sehen Sie eine Liste grundlegender Emotionen. Markieren Sie die Emotionen, die der vorgeschlagene Inhalt in Ihnen hervorruft, und deren Ausmaß und klicken Sie auf die Schaltfläche „Weiter“. Wenn Sie den vorgeschlagenen Inhalt aus irgendeinem Grund ohne Bewertung belassen möchten, klicken Sie auf die Schaltfläche „Überspringen“. Je mehr Elemente Sie bewerten, desto genauer ist die Messung. Wenn Sie entscheiden, dass Sie genug bewertet haben, klicken Sie auf die Schaltfläche „Erkenntnisse“. Sie sehen Ihren durchschnittlichen emotionalen Vektor und den durchschnittlichen emotionalen Vektor von Personen, die denselben Inhalt zuvor bewertet haben. Das System berechnet die Differenz zwischen diesen beiden Vektoren und hebt Ihre Unterschiede hervor.\n\n"+
        
        "❓: Wer sieht meine Bewertungen?\n"+
        "✅: Ihre Bewertungen sind für Forscher sichtbar. Sie sehen, dass diese Bewertung von einem anonymen Benutzer abgegeben wurde. Wenn Sie Ihr Alter, Geschlecht und Ihre Region angeben, sieht der Forscher diese auch. Aber Ihr Name, Ihre Telegram-ID bleiben für ihn geheim. Darüber hinaus werden Ihre Bewertungen mit den Bewertungen anderer Benutzer aggregiert und zur Berechnung des durchschnittlichen emotionalen Vektors verwendet, mit dem andere Benutzer verglichen werden. Ihre Bewertungen werden nicht zur Berechnung des durchschnittlichen emotionalen Vektors verwendet, mit dem Ihr emotionaler Vektor verglichen wird.\n\n"+

        "❓: Woher weiß ich, wie ich mich von anderen unterscheide?\n"+
        "✅: Wenn Sie über genügend Bewertungen verfügen, wählen Sie die Schaltfläche „Insights“. Sie sehen Ihren emotionalen Vektor, den durchschnittlichen emotionalen Vektor anderer Benutzer, die denselben Inhalt bewertet haben. Das System hebt Ihren Unterschied zu anderen hervor.\n\n"+

        "❓: Wie drücke ich meine informierte Zustimmung aus, dass mein Psychologe, Business-Coach oder Arbeitgeber meine Bewertungen sehen kann?\n"+
        "✅: Wenn ein Forscher, Ihr Arbeitgeber oder Business Coach nicht nur auf anonyme Daten zugreifen möchte, erhalten Sie in Telegram eine Anfrage, um zuvor abgegebene Bewertungen einzusehen, oder eine Einladung, einen neuen Satz von Inhalten zu bewerten. Sie können dies annehmen oder ablehnen. Der Forscher hat kein Recht, anonym zu bleiben. Sie sehen den Namen der Person, die um Ihre Zustimmung bittet.\n\n"+

        "❓: Wie widerrufe ich meine Zustimmung zur Anzeige meiner Bewertungen?\n"+
        "✅: Sie können auf die Schaltfläche „Meine Daten löschen“ klicken. Alle Ihre Daten werden gelöscht.\n\n"+

        "❓: Wie lade ich mein Team oder meinen Kunden zu einer Bewertung ein?\n"+
        "✅: Klicken Sie auf die Schaltfläche „Einladen“, geben Sie den Namen des Benutzers ein, den Sie einladen möchten, und warten Sie, bis der Eingeladene Ihre Einladung annimmt oder ablehnt.\n\n"+

        "❓: Wie erhalte ich die informierte Zustimmung von Teammitgliedern zur Anzeige ihrer Bewertungsergebnisse?\n"+
        "✅: Die Annahme Ihrer Einladung zur Teilnahme an einer Bewertung gilt als informierte Zustimmung zur Anzeige der Bewertungsergebnisse.\n\n"+

        "❓: Was passiert, wenn ein Teammitglied seine Zustimmung widerruft?\n"+
        "✅: Wenn ein Benutzer seine Zustimmung zur Anzeige der Bewertungsergebnisse widerruft, verlieren Sie den Zugriff auf seine Bewertungen.\n\n"+

        "❓: Wie kann ich den Fortschritt meines Teams oder meiner Kunden bei deren Bewertung überwachen?\n"+
        "✅: Sie erhalten eine Nachricht, wenn jemand, den Sie eingeladen haben, seine Bewertung Ihres Inhalts abgeschlossen hat."],
        ["fr", 
        "❓: Comment puis-je me connecter ?\n"+
        "✅: Recherchez le bot nommé @plutchart_bot dans Telegram et exécutez la commande /start. Si vous ne vous êtes pas encore inscrit ou si vous avez déjà révoqué votre consentement à l'utilisation de vos notes, vous serez réinscrit. Si vous avez une inscription valide, nous vous fournirons toutes les données dont nous disposons sur vous.\n\n"+
        
        "❓: Comment puis-je connaître mon vecteur émotionnel ?\n"+
        "✅: Pour ce faire, vous devez commencer à évaluer le contenu. Cliquez sur le bouton « Évaluer le nouveau contenu » et un élément de contenu apparaîtra devant vous. Ci-dessous, vous verrez une liste d'émotions de base. Marquez les émotions que le contenu proposé évoque en vous et leur niveau et cliquez sur le bouton « Suivant ». Si pour une raison quelconque vous souhaitez laisser le contenu proposé sans évaluation, cliquez sur le bouton « Ignorer ». Plus vous évaluez d'éléments, plus la mesure sera précise. Lorsque vous décidez que vous avez suffisamment évalué, cliquez sur le bouton « Insights ». Vous verrez votre vecteur émotionnel moyen et le vecteur émotionnel moyen des personnes qui ont déjà évalué le même contenu. Le système calculera la différence entre ces deux vecteurs et mettra en évidence vos différences.\n\n"+
        
        "❓ : Qui verra mes évaluations ?\n"+
        "✅ : Vos évaluations seront visibles par les chercheurs. Ils verront que cette évaluation a été faite par un utilisateur anonyme. Si vous indiquez votre âge, votre sexe, votre région, le chercheur les verra également. Mais votre nom, votre identifiant Telegram resteront secrets pour lui. De plus, vos évaluations seront agrégées avec les évaluations des autres utilisateurs et serviront à calculer le vecteur émotionnel moyen avec lequel les autres utilisateurs seront comparés. Vos évaluations ne seront pas utilisées pour calculer le vecteur émotionnel moyen avec lequel votre vecteur émotionnel sera comparé.\n\n"+

        "❓ : Comment savoir en quoi je diffère des autres ?\n"+
        "✅ : Si vous avez suffisamment d’évaluations, sélectionnez alors le bouton « Insights ». Vous verrez votre vecteur émotionnel, le vecteur émotionnel moyen des autres utilisateurs qui ont évalué le même contenu. Le système mettra en évidence votre différence par rapport aux autres.\n\n"+

        "❓ : Comment exprimer mon consentement éclairé pour que mon psychologue, mon coach d’affaires ou mon employeur puisse voir mes évaluations ?\n"+
        "✅ : Si un chercheur, votre employeur ou votre coach d'entreprise souhaite accéder à des données non anonymes, vous recevrez une demande dans Telegram pour voir les évaluations précédemment effectuées ou une invitation à évaluer un nouvel ensemble de contenu. Vous pouvez l'accepter ou la refuser. Le chercheur n'a pas le droit de rester anonyme. Vous verrez le nom de la personne qui demande votre consentement.\n\n"+

        "❓: Comment puis-je retirer mon consentement à consulter mes évaluations ?\n"+
        "✅: Vous pouvez cliquer sur le bouton « Supprimer mes données ». Toutes vos données seront supprimées.\n\n"+

        "❓: Comment puis-je inviter mon équipe ou mon client à passer une évaluation ?\n"+
        "✅: Cliquez sur le bouton « Inviter », saisissez le nom de l'utilisateur que vous souhaitez inviter et attendez que l'invité accepte ou refuse votre invitation.\n\n"+

        "❓: Comment puis-je obtenir le consentement éclairé des membres de l'équipe pour consulter leurs résultats d'évaluation ?\n"+
        "✅: Accepter votre invitation à passer une évaluation constitue un consentement éclairé pour consulter les résultats de l'évaluation.\n\n"+

        "❓: Que se passe-t-il si et quand un membre de l'équipe retire son consentement ?\n"+
        "✅: Quand un utilisateur retire son consentement à consulter les résultats de l'évaluation, vous perdez l'accès à ses évaluations.\n\n"+

        "❓: Comment puis-je suivre la progression de mon équipe ou de mes clients dans leur évaluation ?\n"+
        "✅: Vous recevrez un message lorsque la personne que vous avez invitée aura terminé son évaluation de votre contenu."],
        ["es", 
        "❓: ¿Cómo puedo iniciar sesión?\n"+
        "✅: Busca el bot llamado @plutchart_bot en Telegram y ejecuta el comando /start. Si no te has registrado previamente o has revocado previamente tu consentimiento para usar tus valoraciones, se te volverá a registrar. Si tienes un registro válido, proporcionaremos todos los datos que tenemos sobre ti.\n\n"+
        
        "❓: ¿Cómo puedo saber mi vector emocional?\n"+
        "✅: Para ello, debes empezar a evaluar el contenido. Haz clic en el botón “Evaluar nuevo contenido” y aparecerá un elemento de contenido frente a ti. A continuación verás una lista de emociones básicas. Marca las emociones que te evoca el contenido propuesto y su nivel y haz clic en el botón “Siguiente”. Si por alguna razón quieres dejar el contenido propuesto sin calificación, haz clic en el botón “Omitir”. Cuantos más elementos evalúes, más precisa será la medición. Cuando decidas que has evaluado lo suficiente, haz clic en el botón “Insights”. Verás tu vector emocional medio y el vector emocional medio de las personas que han evaluado previamente el mismo contenido. El sistema calculará la diferencia entre estos dos vectores y resaltará sus diferencias.\n\n"+
        
        "❓: ¿Quién verá mis valoraciones?\n"+
        "✅: Tus valoraciones serán visibles para los investigadores. Verán que esta valoración la realizó un usuario anónimo. Si proporcionas tu edad, sexo y región, el investigador también las verá. Pero tu nombre y tu ID de Telegram permanecerán en secreto para él. Además, tus valoraciones se agregarán a las valoraciones de otros usuarios y se utilizarán para calcular el vector emocional medio con el que se compararán otros usuarios. Tus valoraciones no se utilizarán para calcular el vector emocional medio con el que se comparará tu vector emocional.\n\n"+

        "❓: ¿Cómo sé en qué me diferencio de los demás?\n"+
        "✅: Si tienes suficientes valoraciones, selecciona el botón “Insights”. Verás tu vector emocional, el vector emocional medio de otros usuarios que han valorado el mismo contenido. El sistema resaltará tu diferencia con los demás.\n\n"+

        "❓: ¿Cómo expreso mi consentimiento informado para que mi psicólogo, coach empresarial o empleador pueda ver mis valoraciones?\n"+
        "✅: Si un investigador, tu empleador o un asesor empresarial quiere acceder no solo a datos anónimos, recibirás una solicitud en Telegram para ver evaluaciones anteriores o una invitación para evaluar un nuevo conjunto de contenidos. Puedes aceptarla o rechazarla. El investigador no tiene derecho a permanecer anónimo. Verás el nombre de la persona que solicita tu consentimiento.\n\n"+

        "❓: ¿Cómo puedo anular mi consentimiento para ver mis evaluaciones?\n"+
        "✅: Puede hacer clic en el botón “Eliminar mis datos”. Se eliminarán todos sus datos.\n\n"+

        "❓: ¿Cómo puedo invitar a mi equipo o cliente a realizar una evaluación?\n"+
        "✅: Haga clic en el botón “Invitar”, ingrese el nombre del usuario que desea invitar y espere a que el invitado acepte o rechace su invitación.\n\n"+

        "❓: ¿Cómo obtengo el consentimiento informado de los miembros del equipo para ver los resultados de su evaluación?\n"+
        "✅: Aceptar su invitación para realizar una evaluación constituye el consentimiento informado para ver los resultados de la evaluación.\n\n"+

        "❓: ¿Qué sucede si un miembro del equipo anula su consentimiento?\n"+
        "✅: Cuando un usuario anule su consentimiento para ver los resultados de la evaluación, perderá el acceso a sus evaluaciones.\n\n"+

        "❓: ¿Cómo puedo monitorear el progreso de mi equipo o de mis clientes en su evaluación?\n"+
        "✅: Recibirá un mensaje cuando alguien a quien haya invitado haya completado su evaluación de su contenido."],
        ["uk", 
        "❓: як мені увійти?\n"+
        "✅: знайдіть у Telegram бота під назвою @plutchart_bot і запустіть команду /start. Якщо ви раніше не реєструвалися або раніше відкликали згоду на використання своїх рейтингів, вас буде повторно зареєстровано. Якщо у вас є дійсна реєстрація, ми надамо всі наявні у нас дані про вас.\n\n"+
        
        "❓: Як дізнатися свій емоційний вектор?\n"+
        "✅: Для цього потрібно почати оцінювати контент. Натисніть кнопку «Оцінити новий вміст», і перед вами з’явиться елемент контенту. Нижче ви побачите список основних емоцій. Позначте емоції, які у вас викликає запропонований контент, та їх рівень і натисніть кнопку «Далі». Якщо з якоїсь причини ви хочете залишити запропонований контент без рейтингу, натисніть кнопку «Пропустити». Чим більше елементів ви оціните, тим точнішим буде вимірювання. Коли ви вирішите, що оцінили достатньо, натисніть кнопку «Insights». Ви побачите свій середній емоційний вектор і середній емоційний вектор людей, які раніше оцінювали той самий контент. Система обчислить різницю між цими двома векторами та підкреслить ваші відмінності.\n\n"+
        
        "❓: Хто бачитиме мої оцінки?\n"+
        "✅: Ваші оцінки будуть видимі дослідникам. Вони побачать, що цю оцінку зробив анонімний користувач. Якщо ви вкажете свій вік, стать, регіон, дослідник їх також побачить. Але ваше ім'я, ваш Telegram ID залишаться для нього таємницею. Крім того, ваші оцінки будуть агреговані з оцінками інших користувачів і використовуватимуться для розрахунку середнього емоційного вектора, з яким порівнюватимуться інші користувачі. Ваші оцінки не будуть використані для розрахунку середнього емоційного вектора, з яким буде порівнюватися ваш емоційний вектор.\n\n"+

        "❓: як я знаю, чим я відрізняюся від інших?\n"+
        "✅: якщо у вас достатньо оцінок, виберіть кнопку «Insights». Ви побачите свій емоційний вектор, середній емоційний вектор інших користувачів, які оцінювали той самий контент. Система підкреслить вашу відмінність від інших.\n\n"+

        "❓: як я можу висловити свою інформовану згоду на те, щоб мій психолог, бізнес-тренер або роботодавець могли бачити мої оцінки?\n"+
        "✅: якщо дослідник, ваш роботодавець або бізнес-тренер захоче отримати доступ не лише до анонімних даних, то ви отримаєте в Telegram запит на перегляд раніше наданих оцінок або запрошення оцінити новий набір контенту. Ви можете прийняти або відхилити його. Дослідник не має права залишатися анонімним. Ви побачите ім'я особи, яка просить вашої згоди.\n\n"+

        "❓: Як мені відкликати свою згоду на перегляд моїх оцінок?\n"+
        "✅: Ви можете натиснути кнопку «Видалити мої дані». Усі ваші дані буде видалено.\n\n"+

        "❓: Як запросити свою команду чи клієнта пройти оцінювання?\n"+
        "✅: Натисніть кнопку «Запросити», введіть ім’я користувача, якого ви хочете запросити, і зачекайте, поки запрошений прийме або відхилить ваше запрошення.\n\n"+

        "❓: Як отримати інформовану згоду членів команди на перегляд результатів оцінювання?\n"+
        "✅: Прийняття вашого запрошення пройти оцінювання означає інформовану згоду на перегляд результатів оцінювання.\n\n"+

        "❓: Що станеться, якщо і коли член команди відкличе свою згоду?\n"+
        "✅: Коли будь-який користувач відкликає свою згоду на перегляд результатів оцінювання, ви втрачаєте доступ до його оцінювання.\n\n"+

        "❓: Як я можу відстежувати прогрес моєї команди або клієнтів у їхньому оцінюванні?\n"+
        "✅: Ви отримаєте повідомлення, коли хтось із запрошених завершить оцінку вашого вмісту."],
        ["ru", 
        "❓: Как мне зайти в систему?\n" +
        "✅: Найдите в Telegram бот @plutchart_bot и выполните команду /start. Если Вы не были ранее зарегистрированы или ранее отозвали свое согласие на использование своих оценок, то Вы будете вновь зарегистрированы. Если же у Вас есть действующая регистрация, то мы сообщим все имеющиеся у нас данные о Вас.\n\n"+
        
        "❓: Как мне узнать мой эмоциональный вектор? \n"+
        "✅: Для этого Вам необходимо начать оценивать контент. Нажмите на кнопку “Оценить еще” и перед Вами появится элемент контента. Ниже Вы увидите список базовых эмоций. Отметьте те эмоции, которые у Вас вызывает предложенный контент и их уровень и нажмите кнопку “Следующий”. Если по какой-то причине Вы хотите оставить предложенный контент без оценки, нажмите кнопку “Пропустить”. Чем больше элементов Вы оцените, тем точнее будет измерение. Когда Вы решите, что оценили уже достаточно, нажмите кнопку “Инсайты”. Вы увидите Ваш средний эмоциональный вектор и средний эмоциональный вектор людей, оценивших ранее тот же контент. Система вычислит, отличие этих двух векторов и подсветит Ваши отличия.\n\n"+
        
        "❓: Кому будут видны мои оценки?\n"+
        "✅: Ваши оценки будут видны исследователям. Они будут видеть, что эту оценку выполнил анонимный пользователь. Если Вы сообщите свои возраст, пол, регион, то исследователь их тоже увидит. Но Ваше имя, Ваш идентификатор в Telegram останутся для него секретом. Кроме того, Ваши оценки будут агрегированы с оценками других пользователей и будут участвовать в расчете среднего эмоционального вектора, с которым будут сравниваться другие пользователи. Ваши оценки не будут учитываться при расчете среднего эмоционального вектора, с которым будет сравниваться Ваш эмоциональный вектор.\n\n"+
        
        "❓: Как мне узнать, чем я отличаюсь от других?\n"+
        "✅: Если у Вас есть достаточное количество оценок, то выберите кнопку “Инсайты”. Вы увидите свой эмоциональный вектор, усредненный эмоциональный вектор других пользователей, оценивших тот же контент. Система подсветит Ваше отличие от других.\n\n"+
        
        "❓: Как мне выразить свое информированное согласие, что с моими оценками может ознакомиться мой психолог, бизнес-тренер или работодатель?\n"+
        "✅: Если какой-то исследователь, Ваш работодатель или бизнес-тренер захочет получить доступ не только к анонимным данным, то Вам в Telegram придет запрос на ознакомление с ранее данными оценками или приглашение на оценку нового набора контента. Вы можете его принять или отклонить. Исследователь не имеет права остаться анонимным. Вы будете видеть имя того, кто запрашивает у Вас согласие.\n\n"+
        
        "❓: Как я могу отозвать свое согласие на ознакомление с моими оценками?\n"+
        "✅: Вы можете нажать кнопку “Удалить мои данные”. Все Ваши данные будут удалены.\n\n"+
        
        "❓: Как мне пригласить мою команду или клиента пройти оценку?\n"+
        "✅: Нажмите кнопку “Пригласить”, укажите имя пользователя, которого Вы хотите пригласить, и ожидайте, что приглашенный Вами примет или отклонит Ваше приглашение.\n\n"+
        
        "❓: Как получить от членов команды информированное согласие на ознакомление с результатами их оценки?\n"+
        "✅: Принятие Вашего приглашения на прохождение оценки означает информированное согласие на ознакомление с результатами оценки.\n\n"+
        
        "❓: Что будет, когда и если кто-то из членов команды отзовет свое согласие?\n"+
        "✅: Когда и если любой пользователь отзывает свое согласие на ознакомление с результатами оценки, то Вы теряете доступ к их оценкам.\n\n"+
        
        "❓: Как я могу контролировать прогресс прохождения оценки моей командой или моими клиентами?\n"+
        "✅: Вы получите сообщение, когда кто-то из приглашенных Вами завершит оценку Вашего контента."
        ]])
});

export default class QNA extends React.Component<QNAProps, QNAState> {
    render(): ReactNode {
        return <div className="qna-container">
            <span className="qna-header">{strQNA.toString()}</span>
            <span className="qna-content">{strQNAText.toString()}</span>
        </div>
    }
}