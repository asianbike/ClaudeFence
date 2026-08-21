import fs from "node:fs"

let raw = ""
process.stdin.on("data", (chunk) => { raw += chunk })
process.stdin.on("end", () => {
    const request=JSON.parse(raw)
    let contract=JSON.parse(fs.readFileSync(".claudefence/contract.json", "utf-8"))
    fs.writeFileSync("hook-log.json", JSON.stringify(request), "utf-8")
    
    let filePath=request.tool_input.file_path
    let allowedFiles=contract.allowedFiles


    if (isAllowed(filePath, allowedFiles)) {
        process.exit(0)
    }
    else {
        console.error("rejected: out of scope " + filePath)
        process.exit(2)
    }
})

function isAllowed(filePath: string, allowedFiles: string[]): boolean {
  return allowedFiles.includes(filePath)
}
