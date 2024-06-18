//

export interface IMLString {
    default: string;
    values?: Map<string, string> | [string, string][];
  }
  
  export default class MLString extends String {
    values: Map<string, string>;
    constructor(def: IMLString | string) {
      super(typeof def !== 'string' ? def.default : def);
      this.values = new Map();
      this.values = typeof def !== 'string' ? new Map<string, string>(def.values) : new Map<string, string>();
    }
    public toString(lang?: string): string {
      if (!lang) lang = MLString.getLang();
      if (!this.values.has(lang)) lang = lang.split('-')[0];
      return (lang ? (this.values.has(lang) ? this.values.get(lang) : super.toString()) : super.toString()) as string;
    }
    public toJSON() {
      return {
        default: super.toString(),
        values: Array.from(this.values)
      }
    }
    get default() {
      return super.toString();
    }
    public static getLang(): string {
      const params: string[] = window.location.search.substring(1).split('&');
      let lang = '';
      params.forEach((v: string) => {
        const l: string[] = v.split('=');
        if ('lang' === l[0]) {
          lang = l[1];
        } else {
          lang = window.navigator.language;
        }
      });
      return lang;
    }
  }
  
const plutchik_strings = new Map([
    [`Welcome! This content creation and editing system is part of a larger system for interaction between psychologists, their clients, employers and their employees. The system is aimed at increasing the comfort of interaction and improving the quality of life of all participants. The system will allow you to create content, send a task to the participant for assessment, monitor implementation and calculate the emotional azimuth of the participant. Read more details about the system here`, 
        new Map([
        [`de`, `Willkommen! Dieses System zur Erstellung und Bearbeitung von Inhalten ist Teil eines größeren Systems zur Interaktion zwischen Psychologen, ihren Klienten, Arbeitgebern und ihren Mitarbeitern. Das System zielt darauf ab, den Interaktionskomfort zu erhöhen und die Lebensqualität aller Teilnehmer zu verbessern. Das System ermöglicht es Ihnen, Inhalte zu erstellen, dem Teilnehmer eine Aufgabe zur Bewertung zu senden, die Umsetzung zu überwachen und den emotionalen Azimut des Teilnehmers zu berechnen. Weitere Einzelheiten zum System finden Sie hier`]
        , [`fr`, `Accueillir! Ce système de création et d'édition de contenu fait partie d'un système plus vaste d'interaction entre les psychologues, leurs clients, les employeurs et leurs employés. Le système vise à augmenter le confort d'interaction et à améliorer la qualité de vie de tous les participants. Le système vous permettra de créer du contenu, d'envoyer une tâche au participant pour évaluation, de surveiller la mise en œuvre et de calculer l'azimut émotionnel du participant. Lire plus de détails sur le système ici`]
        , [`es`, `¡Bienvenido! Este sistema de creación y edición de contenidos es parte de un sistema más amplio de interacción entre psicólogos, sus clientes, empleadores y sus empleados. El sistema tiene como objetivo aumentar la comodidad de la interacción y mejorar la calidad de vida de todos los participantes. El sistema le permitirá crear contenido, enviar una tarea al participante para su evaluación, monitorear su implementación y calcular el azimut emocional del participante. Lea más detalles sobre el sistema aquí`]
        , [`uk`, `Ласкаво просимо! Ця система створення та редагування контенту є частиною більшої системи взаємодії між психологами, їхніми клієнтами, роботодавцями та їхніми працівниками. Система спрямована на підвищення комфорту взаємодії та покращення якості життя всіх учасників. Система дозволить створювати контент, відправляти завдання учаснику на оцінку, контролювати виконання та розраховувати емоційний азимут учасника. Детальніше про систему читайте тут`]
        , [`ru`, `Добро пожаловать! Эта система создания и редактирования контента является частью большой системы для взаимодействия психологов, их клиентов, работодателей и их работников. Система нацелена на повышение комфортности взаимодействия и улучшения качества жизни всех участников. Система позволит Вам создать контент, направить задание участнику на оценку, проконтролировать выполнение и вычислить эмоциональный азимут участника. Больше подробностей о системе прочитайте тут`]
        , [`it`, `Benvenuto! Questo sistema di creazione e modifica dei contenuti fa parte di un sistema più ampio di interazione tra psicologi, i loro clienti, datori di lavoro e i loro dipendenti. Il sistema ha lo scopo di aumentare il comfort di interazione e migliorare la qualità della vita di tutti i partecipanti. Il sistema ti consentirà di creare contenuti, inviare un'attività al partecipante per la valutazione, monitorare l'implementazione e calcolare l'azimut emotivo del partecipante. Leggi maggiori dettagli sul sistema qui`]
        ])
    ], 
])

export function ML(str?: string, lang?: string): string {
    if (lang === undefined) {
        lang = MLString.getLang();
    };
    if (str === undefined) return `Unknown string`;
    if (lang === undefined) return str;
    if (!plutchik_strings.has(str)) return str;
    const el = plutchik_strings.get(str);
    if (!el?.has(lang)) return str;
    return el.get(lang) as string;
}
