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
  