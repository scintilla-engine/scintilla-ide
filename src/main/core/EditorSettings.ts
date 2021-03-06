import * as fse from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

const homeDir = os.homedir();
const EDITOR_CONFIG_PATH = path.join(homeDir, path.sep, '.purpurina');
const SETTINGS_PATH = path.join(EDITOR_CONFIG_PATH, 'settings.json');

function checkSettingsPath(): boolean {
  const firstTime = !fse.existsSync(EDITOR_CONFIG_PATH);
  if (firstTime) {
    fse.mkdirpSync(EDITOR_CONFIG_PATH);
    fse.mkdirpSync(path.join(EDITOR_CONFIG_PATH, 'logs'));
  }
  return firstTime;
}

interface EditorSettingsPack {
  readonly recentProjects: string[];
  readonly language: string;
}

export default class EditorSettings implements EditorSettingsPack {
  private recentProj: string[];
  private lang: string;

  public get language(): string {
    return this.lang;
  }

  public get recentProjects(): string[] {
    return this.recentProj;
  }

  /**
   * Constructor
   */
  constructor(json?: EditorSettingsPack) {
    if (!json) {
      this.recentProj = [];
      this.lang = 'en';
    } else {
      this.recentProj = json.recentProjects || [];
      this.lang = json.language || 'en';
    }
  }

  addRecentProject(projectPath: string): void {
    if (!this.recentProj) {
      this.recentProj = [];
      this.recentProj.push(projectPath);
    } else {
      const recent: string[] = [];
      const len = this.recentProj.length;

      for (let i = 0; i < len; i += 1) {
        const item = this.recentProj[i];
        if (this.recentProj[i] !== projectPath) {
          recent.push(item);
        }
      }

      recent.unshift(projectPath);
      this.recentProj = recent;

      if (this.recentProj.length > 10) {
        this.recentProj.pop();
      }
    }
  }

  save(): void {
    checkSettingsPath();
    fse.writeFileSync(SETTINGS_PATH, this.toJSON(true) as string);
  }

  toJSON(stringify = false): EditorSettingsPack | string {
    const json = {
      recentProjects: this.recentProj,
      language: this.lang,
    };

    if (stringify === true) {
      return JSON.stringify(json, null, '\t');
    }

    return json;
  }

  static createAsync(): Promise<EditorSettings> {
    return new Promise((resolve, reject) => {
      const settings = new EditorSettings();

      fse
        .writeFile(SETTINGS_PATH, settings.toJSON(true))
        .then(() => {
          resolve(settings);
        })
        .catch((err) => reject(err));
    });
  }

  static create(): EditorSettings {
    const config = new EditorSettings();
    fse.writeFileSync(SETTINGS_PATH, config.toJSON(true) as string);
    return config;
  }

  static load(): EditorSettings {
    let config: EditorSettings;
    if (checkSettingsPath()) {
      config = this.create();
    } else {
      try {
        const data = fse.readFileSync(SETTINGS_PATH, {
          encoding: 'utf-8',
          flag: 'r',
        });
        config = new EditorSettings(JSON.parse(data));
      } catch {
        config = EditorSettings.create();
      }
    }

    return config;
  }

  static loadAsync(): Promise<EditorSettings> {
    let p: Promise<EditorSettings>;
    if (checkSettingsPath()) {
      p = this.createAsync();
    } else {
      p = new Promise((resolve) => {
        fse
          .readFile(SETTINGS_PATH, { encoding: 'utf-8' })
          .then((value: string) => {
            const json: EditorSettingsPack = JSON.parse(value);
            resolve(new EditorSettings(json));
          });
      });
    }
    return p;
  }
}
