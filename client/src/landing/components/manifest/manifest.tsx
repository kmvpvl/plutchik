import { ReactNode } from "react";
import "./manifest.css";
import React from "react";
import MLString from "./../mlstrings";

export interface ManifestProps {

}

export interface ManifestState {

}
const strSafetyManifest = new MLString({
    default: "SAFETY MANIFEST", 
    values: new Map([
        ["en-US", "SAFETY MANIFEST"],
        ["de", "SICHERHEITSMANIFEST"],
        ["fr", "MANIFESTE DE SÉCURITÉ"],
        ["es", "MANIFIESTO DE SEGURIDAD"],
        ["uk", "МАНІФЕСТ БЕЗПЕКИ"],
        ["ru", "МАНИФЕСТ БЕЗОПАСНОСТИ"]])
});

const strSafetyManifestText = new MLString({
    default: " Our most important task is to help people identify their emotional characteristics and do it safely.\n We, a team of psychologists and information technology specialists, are aware of our personal and shared responsibility for the fact that without users’ trust in our service, we will not be able to provide assistance.\n We have created a service in which users leave their emotional mark and we guarantee to users.\n ✅ No user data is for sale.\n ✅ User’s personal data and his emotional assessments are separated from each other and only emotional assessments are available to researchers.\n ✅ The user can share his data with researchers only as a result of informed consent.\n ✅ All user data will be deleted upon request.", 
    values: new Map([
        ["en-US", " Our most important task is to help people identify their emotional characteristics and do it safely.\n We, a team of psychologists and information technology specialists, are aware of our personal and shared responsibility for the fact that without users’ trust in our service, we will not be able to provide assistance.\n We have created a service in which users leave their emotional mark and we guarantee to users.\n ✅ No user data is for sale.\n ✅ User’s personal data and his emotional assessments are separated from each other and only emotional assessments are available to researchers.\n ✅ The user can share his data with researchers only as a result of informed consent.\n ✅ All user data will be deleted upon request."],
        ["de", " Unser wichtigstes Ziel ist es, Menschen dabei zu helfen, ihre emotionale Identität sicher zu erkennen.\n Wir, ein Team aus Psychologen und Informatikern, sind uns unserer persönlichen und gemeinsamen Verantwortung dafür bewusst, dass wir ohne das Vertrauen der Nutzer in unseren Service keine Hilfe leisten können.\n Wir haben einen Service geschaffen, bei dem Benutzer ihre emotionalen Spuren hinterlassen, und das garantieren wir den Benutzern.\n ✅ Es stehen keine Benutzerdaten zum Verkauf.\n ✅ Die persönlichen Daten des Nutzers und seine emotionalen Einschätzungen werden voneinander getrennt und den Forschern stehen nur emotionale Einschätzungen zur Verfügung.\n ✅ Der Nutzer darf seine Daten nur mit einer informierten Einwilligung an Forscher weitergeben.\n ✅ Sämtliche Nutzerdaten werden auf Wunsch gelöscht."],
        ["fr", 
        " Notre objectif le plus important est d’aider les gens à identifier leur identité émotionnelle et à le faire en toute sécurité.\n Nous, une équipe de psychologues et de spécialistes des technologies de l’information, sommes conscients de notre responsabilité personnelle et partagée dans le fait que sans la confiance des utilisateurs dans notre service, nous ne pourrons pas leur apporter une assistance.\n Nous avons créé un service dans lequel les utilisateurs laissent leur marque émotionnelle et nous le garantissons.\n ✅ Aucune donnée utilisateur n'est à vendre.\n ✅ Les données personnelles de l’utilisateur et ses évaluations émotionnelles sont séparées les unes des autres et seules les évaluations émotionnelles sont accessibles aux chercheurs.\n ✅ L'utilisateur ne peut partager ses données avec des chercheurs qu'avec son consentement éclairé.\n ✅ Toutes les données utilisateur seront supprimées sur demande."],
        ["es", " Nuestro objetivo más importante es ayudar a las personas a identificar sus identidades emocionales y hacerlo de forma segura.\n Nosotros, un equipo de psicólogos y especialistas en tecnologías de la información, somos conscientes de nuestra responsabilidad personal y compartida por el hecho de que sin la confianza de los usuarios en nuestro servicio, no podremos brindarles asistencia.\n Hemos creado un servicio en el que los usuarios dejan su huella emocional y se lo garantizamos a los usuarios.\n ✅ No hay datos de usuario a la venta.\n ✅ Los datos personales del usuario y sus valoraciones emocionales están separados entre sí y los investigadores sólo disponen de evaluaciones emocionales.\n ✅ El usuario podrá compartir sus datos con investigadores únicamente mediante consentimiento informado.\n ✅ Todos los datos del usuario se eliminarán previa solicitud."],
        ["uk", " Наше найважливіше завдання – допомогти людям визначити свої емоційні особливості та зробити це безпечно.\n Ми, команда психологів та фахівців з інформаційних технологій, усвідомлюємо свою особисту та спільну відповідальність за те, що без довіри користувачів до нашого сервісу ми не зможемо надати допомогу.\n Ми створили сервіс, в якому користувачі залишають свій емоційний слід і гарантуємо користувачам.\n ✅ Дані користувача не продаються.\n ✅ Особисті дані користувача та його емоційні оцінки відокремлені один від одного, і лише емоційні оцінки доступні дослідникам.\n ✅ Користувач може ділитися своїми даними з дослідниками лише в результаті інформованої згоди.\n ✅ Усі дані користувача будуть видалені за запитом."],
        ["ru", " Наша важнейшая задача помочь людям определить их эмоциональные особенности и сделать это безопасно.\n Мы - команда психологов и специалистов по информационным технологиям - осознаем собственную личную и общую ответственность за то, что без доверия нашему сервису со стороны пользователей мы не сможем оказать помощь.\n  Мы создали сервис, в котором пользователи оставляют свой эмоциональный след и мы гарантируем пользователям.\n ✅ Никакие данные пользователей не подлежат продаже.\n ✅ Персональные данные пользователя и его эмоциональные оценки отделены друг от друга и исследователям доступны только эмоциональные оценки.\n ✅ Пользователь может поделиться своими данными с исследователями только в результате осознанного информированного согласия.\n ✅ Все данные пользователя будут удалены по первому требованию."]])
})


export default class Manifest extends React.Component<ManifestProps, ManifestState> {
    render(): ReactNode {
        return <span className="manifest-container">
            <span className="manifest-header">{strSafetyManifest.toString()}</span>
            <span className="manifest-content">{strSafetyManifestText.toString()}</span>
            
        </span>
    }
}