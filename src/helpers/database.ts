import fs from "fs"
import path from "path"

const dataDir = path.join(process.cwd(), "/src/data")

export const readJsonFile = (fileName: string): any[] => {
    const filePath = path.join(dataDir, fileName)
    const json = fs.readFileSync(filePath, "utf-8")
    
    return JSON.parse(json)
}

export const writeJsonFile = (fileName: string, data: any[]): void => {
    const filePath = path.join(dataDir, fileName)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}