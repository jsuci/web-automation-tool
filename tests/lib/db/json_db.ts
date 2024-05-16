import { JsonDB, Config } from "node-json-db";

class JsonDBWrapper {
  public db: JsonDB;
  private dbPath: string;

  constructor(dbPath: string) {
    this.db = new JsonDB(new Config(dbPath, true, true, "/"));
    this.dbPath = dbPath;
  }

  public async push(path: string, data: any) {
    await this.db.push(path, data);
  }

  public async get(path: string) {
    return await this.db.getData(path);
  }

  public getDbPath() {
    return this.dbPath;
  }
}

export default JsonDBWrapper;
