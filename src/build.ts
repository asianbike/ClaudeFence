import fs from "node:fs"
import Parser from "tree-sitter";
import TS from "tree-sitter-typescript";


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

const parser = new Parser();
parser.setLanguage(TS.tsx);

const raw = fs.readFileSync("../ru-vibe/app/layout.tsx", "utf-8")
const tree = parser.parse(raw)

for (const node of tree.rootNode.namedChildren) {
    console.error(node.type, node.startPosition.row + 1)
}
