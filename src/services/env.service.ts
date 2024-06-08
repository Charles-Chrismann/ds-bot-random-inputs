class EnvService {
  [key: string]: string;
  constructor() {
    for(const [key, value] of Object.entries(process.env)) {
      this[key] = value as string
    }
  }
}

export default new EnvService()