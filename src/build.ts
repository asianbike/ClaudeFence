import fs from "node:fs"


if (!process.argv[2]) {
    console.error("argv[2] is required")
    process.exit(1)
}
else{
    if (!fs.existsSync(process.argv[2])) {
        console.error("No such file or directory: " + process.argv[2])
        process.exit(1)
    }
}

console.log(JSON.stringify([{ file: "../ru-vibe/proxy.ts", symbols: [{ name: "proxy.ts", kind: "function", exported: true }] }]))

