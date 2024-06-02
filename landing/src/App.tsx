import React from 'react';
import './App.css';
import Logo from './components/logo/logo';
import Banner from './components/banner/banner';
import Market from './components/market/market';
import MLString from './components/mlstrings';
import Manifest from './components/manifest/manifest';
import QNA from './components/qna/qna';
import Login from './components/login/login';

export interface AppProps {

}

export interface AppState {

}

const strForHRD = new MLString({
  default: "For HRD & HRBP and Business coach", 
  values: new Map([
      ["en-US", "For HRD and Business coach"],
      ["de", "Für Personalleiter und Business Coach"],
      ["fr", "Pour Directeur RH et Business Coach"],
      ["es", "Para director de recursos humanos y coach empresarial"],
      ["uk", "Для HRD та Business coach"],
      ["ru", "Директору по персоналу и Бизнес-тренеру"]])
});

const strForPsychologists = new MLString({
  default: "For psychologist and researcher", 
  values: new Map([
      ["en-US", "For psychologist and researcher"],
      ["de", "Für Psychologen und Forscher"],
      ["fr", "Pour psychologue et chercheur"],
      ["es", "Para psicólogo e investigador"],
      ["uk", "Для психолога та дослідника"],
      ["ru", "Психологу и исследователю"]])
});

const strForEveryone = new MLString({
  default: "For everyone", 
  values: new Map([
      ["en-US", "For everyone"],
      ["de", "Für jeden"],
      ["fr", "Pour tout le monde"],
      ["es", "Para todos"],
      ["uk", "Для всіх"],
      ["ru", "Всем"]])
});

const strForHRDDesc = new MLString({
  default: "Multiple assessments of the personnel of your enterprise or project team will reveal the emotional unity or disunity of employees.\nThe research will identify specific issues or topics on which the team has emotional agreement and emotional opposition. The study will help to see groups of opposition within the team, to identify leaders and compromisers.", 
  values: new Map([
      ["en-US", "Multiple assessments of the personnel of your enterprise or project team will reveal the emotional unity or disunity of employees.\nThe research will identify specific issues or topics on which the team has emotional agreement and emotional opposition. The study will help to see groups of opposition within the team, to identify leaders and compromisers."],
      ["de", "Mehrfachbeurteilungen des Personals Ihres Unternehmens oder Projektteams werden die emotionale Einigkeit oder Uneinigkeit der Mitarbeiter offenbaren.\nDie Forschung wird spezifische Probleme oder Themen identifizieren, zu denen das Team emotionale Zustimmung und emotionale Opposition hat. Die Studie wird dazu beitragen, Oppositionsgruppen innerhalb des Teams zu erkennen und Anführer und Kompromissgeber zu identifizieren."],
      ["fr", "De multiples évaluations du personnel de votre entreprise ou de votre équipe de projet révéleront l'unité ou la désunion émotionnelle des employés.\nLa recherche identifiera des questions ou des sujets spécifiques sur lesquels l’équipe a un accord émotionnel et une opposition émotionnelle. L'étude permettra de voir les groupes d'opposition au sein de l'équipe, d'identifier les leaders et les conciliateurs."],
      ["es", "Múltiples evaluaciones del personal de su empresa o equipo de proyecto revelarán la unidad o desunión emocional de los empleados.\nLa investigación identificará cuestiones o temas específicos en los que el equipo tenga acuerdo emocional y oposición emocional. El estudio ayudará a identificar los grupos de oposición dentro del equipo, a identificar a los líderes y a los comprometidos."],
      ["uk", "Безліч оцінок персоналу вашого підприємства чи проектної команди дозволить виявити емоційну спільність чи роз'єднаність працівників.\nДослідження дозволить ідентифікувати конкретні питання чи теми, за якими у команди виникають емоційна згода та емоційне протистояння. Дослідження допоможе побачити групи протистояння всередині колективу, виявити лідерів та погоджувачів."],
      ["ru", "Множество оценок персонала вашего предприятия или проектной команды позволит выявить эмоциональную общность или разобщенность работников.\nИсследование позволит идентифицировать конкретные вопросы или темы, по которым у команды возникают эмоциональное согласие и эмоциональное противостояние. Исследование поможет увидеть группы противостояния внутри коллектива, выявить лидеров и соглашателей."]])
});


const strForPsyDesc =  new MLString({
  default: "The service will help you assess the emotional state of your client relative to the average emotional state of the group that evaluated the same content.\nYou can create your own content sets to test your clients, or you can use existing ones. Public sets, including those created by you and your colleagues, are offered for evaluation to a wide range of participants. Using a large sample of estimates, more confident conclusions can be drawn. Some sets are multilingual. Take this into account when analyzing.", 
  values: new Map([
      ["en-US", "The service will help you assess the emotional state of your client relative to the average emotional state of the group that evaluated the same content.\nYou can create your own content sets to test your clients, or you can use existing ones. Public sets, including those created by you and your colleagues, are offered for evaluation to a wide range of participants. Using a large sample of estimates, more confident conclusions can be drawn. Some sets are multilingual. Take this into account when analyzing."],
      ["de", "Der Service hilft Ihnen dabei, den emotionalen Zustand Ihres Kunden im Verhältnis zum durchschnittlichen emotionalen Zustand der Gruppe zu beurteilen, die denselben Inhalt bewertet hat.\nSie können Ihre eigenen Inhaltssätze erstellen, um Ihre Kunden zu testen, oder Sie können vorhandene verwenden. Öffentliche Sets, auch die von Ihnen und Ihren Kollegen erstellten, werden einem breiten Teilnehmerkreis zur Auswertung angeboten. Anhand einer großen Stichprobe von Schätzungen können sicherere Schlussfolgerungen gezogen werden. Einige Sets sind mehrsprachig. Berücksichtigen Sie dies bei der Analyse."],
      ["fr", "Le service vous aidera à évaluer l'état émotionnel de votre client par rapport à l'état émotionnel moyen du groupe qui a évalué le même contenu.\nVous pouvez créer vos propres ensembles de contenus pour tester vos clients, ou vous pouvez utiliser ceux existants. Les ensembles publics, y compris ceux créés par vous et vos collègues, sont proposés pour évaluation à un large éventail de participants. En utilisant un large échantillon d’estimations, des conclusions plus sûres peuvent être tirées. Certains ensembles sont multilingues. Tenez-en compte lors de l’analyse."],
      ["es", "El servicio le ayudará a evaluar el estado emocional de su cliente en relación con el estado emocional promedio del grupo que evaluó el mismo contenido.\nPuede crear sus propios conjuntos de contenido para probar a sus clientes o puede utilizar los existentes. Los conjuntos públicos, incluidos los creados por usted y sus colegas, se ofrecen para su evaluación a una amplia gama de participantes. Utilizando una muestra grande de estimaciones, se pueden sacar conclusiones más confiables. Algunos conjuntos son multilingües. Tenga esto en cuenta al analizar."],
      ["uk", "Сервіс допоможе Вам провести оцінку емоційного стану Вашого клієнта щодо усередненого емоційного стану групи, яка оцінювала той самий контент.\nВи можете створювати власні набори контенту для тестування своїх клієнтів, а можете використовувати існуючі. Публічні набори, у тому числі створювані Вами та Вашими колегами, пропонуються для оцінки широкого кола учасників. На великій вибірці оцінок можна робити більш впевнені висновки. Частина наборів є мультимовними. Враховуйте це під час аналізу."],
      ["ru", "Сервис поможет Вам произвести оценку эмоционального состояния Вашего клиента относительно усредненного эмоционального состояния группы, оценивавшей тот же контент.\nВы можете создавать собственные наборы контента для тестирования своих клиентов, а можете использовать уже существующие. Публичные наборы, в том числе создаваемые Вами и Вашими коллегами, предлагаются для оценки широкому кругу участников. На большой выборке оценок можно строить более уверенные выводы. Часть наборов является мультиязычными. Учитывайте это при анализе. "]])
});

const strForEveryoneDesc = new MLString({
  default: "If you have the feeling that relationships within the group or with loved ones are not working out, try to analyze your inner emotional background. Analysis will allow you to understand what makes you special. We will tell you how you differ emotionally from your peers living in the same region. The direction in which you need to work on yourself will become clear. Go through the study again after some time and look at your progress. Analysis of emotional azimuth helps to combat manifestations of complex emotions: painful attachments, jealousy, envy, which cause colossal harm to many people.", 
  values: new Map([
      ["en-US", "If you have the feeling that relationships within the group or with loved ones are not working out, try to analyze your inner emotional background. Analysis will allow you to understand what makes you special. We will tell you how you differ emotionally from your peers living in the same region. The direction in which you need to work on yourself will become clear. Go through the study again after some time and look at your progress. Analysis of emotional azimuth helps to combat manifestations of complex emotions: painful attachments, jealousy, envy, which cause colossal harm to many people."],
      ["de", "Wenn Sie das Gefühl haben, dass die Beziehungen innerhalb der Gruppe oder zu Ihren Lieben nicht funktionieren, versuchen Sie, Ihren inneren emotionalen Hintergrund zu analysieren. Durch die Analyse können Sie verstehen, was Sie besonders macht. Wir sagen Ihnen, wie Sie sich emotional von Ihren Gleichaltrigen in der gleichen Region unterscheiden. Es wird klar, in welche Richtung Sie an sich arbeiten müssen. Gehen Sie die Studie nach einiger Zeit noch einmal durch und sehen Sie sich Ihre Fortschritte an. Die Analyse des emotionalen Azimuts hilft, Manifestationen komplexer Emotionen zu bekämpfen: schmerzhafte Bindungen, Eifersucht, Neid, die vielen Menschen enormen Schaden zufügen."],
      ["fr", "Si vous avez le sentiment que les relations au sein du groupe ou avec les proches ne fonctionnent pas, essayez d'analyser votre fond émotionnel intérieur. L'analyse vous permettra de comprendre ce qui vous rend spécial. Nous vous dirons en quoi vous vous différenciez émotionnellement de vos pairs vivant dans la même région. La direction dans laquelle vous devez travailler sur vous-même deviendra claire. Reprenez l'étude après un certain temps et observez vos progrès. L'analyse de l'azimut émotionnel aide à lutter contre les manifestations d'émotions complexes : attachements douloureux, jalousie, envie, qui causent des dommages colossaux à de nombreuses personnes."],
      ["es", "Si tiene la sensación de que las relaciones dentro del grupo o con sus seres queridos no funcionan, intente analizar su trasfondo emocional interno. El análisis te permitirá comprender qué te hace especial. Le diremos en qué se diferencia emocionalmente de sus compañeros que viven en la misma región. Quedará clara la dirección en la que debes trabajar en ti mismo. Vuelva a realizar el estudio después de un tiempo y observe su progreso. El análisis del azimut emocional ayuda a combatir las manifestaciones de emociones complejas: apegos dolorosos, celos, envidia, que causan un daño colosal a muchas personas."],
      ["uk", "Якщо у Вас виникає відчуття, що не складаються стосунки всередині групи або з близькими людьми, спробуйте проаналізувати свій внутрішній емоційний фон. Аналіз дозволить Вам зрозуміти, у чому Ваша особливість. Ми розповімо, чим Ви емоційно відрізняєтесь від Ваших ровесників, які мешкають у тому ж регіоні. Стане зрозумілим напрямок, у якому треба працювати над собою. Пройдіть дослідження через деякий час повторно і подивіться свій прогрес. Аналіз емоційного азимуту допомагає боротися з проявами складних емоцій: хворобливих уподобань, ревнощів, заздрістю, які завдають колосальної шкоди багатьом людям."],
      ["ru", "Если у Вас возникает ощущение, что не складываются отношения внутри группы или с близкими людьми, попробуйте проанализировать свой внутренний эмоциональный фон. Анализ позволит Вам понять, в чем Ваша особенность. Мы расскажем, чем Вы эмоционально отличаетесь от Ваших ровесников, проживающих в том же регионе. Станет понятно направление, в котором надо работать над собой. Пройдите исследование спустя некоторое время повторно и посмотрите на свой прогресс. Анализ эмоционального азимута помогает бороться с проявлениями сложных эмоций: болезненных привязанностей, ревностью, завистью, наносящих колоссальный вред многим людям."]])
});

export default class App extends React.Component <AppProps, AppState> {
  render(): React.ReactNode {
    return <div className='app-container'>
      <Logo/>
      <Banner/>
      <Login onLanguageChanged={(lang)=>{window.location.href = `${window.location.pathname}?lang=${lang}`}}/>
      <Market area='HRD' emotion='joy' caption={strForHRD.toString()} description={strForHRDDesc.toString()}/>
      <Market area='psychologists' emotion='trust' caption={strForPsychologists.toString()} description={strForPsyDesc.toString()}/>
      <Market area='everyone' emotion='surprise' caption={strForEveryone.toString()} description={strForEveryoneDesc.toString()}/>
      <Manifest/>
      <QNA/>
    </div>
  }
}

