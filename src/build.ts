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
console.log(JSON.stringify({hello:"world"}))

const Tree=fs.readdirSync(process.argv[2],{recursive:true})

for (const dir of Tree){
    if ((!dir.includes("node_modules") && !dir.includes(".next") && !dir.includes(".git") && !dir.includes("dist")) 
        && ((dir.endsWith(".ts")|| dir.endsWith(".tsx"))
        && (!dir.endsWith(".d.ts"))) )
        console.log(dir)
    }


