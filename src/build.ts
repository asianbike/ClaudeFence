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

const parser = new Parser();
parser.setLanguage(TS.tsx);

const raw = fs.readFileSync("../ru-vibe/app/layout.tsx", "utf-8")
const tree = parser.parse(raw)

let array=[]
for (const node of tree.rootNode.namedChildren) {

    let res={ name: "", kind: "", exported: false, default: false, line: 0 }
    let name=""
    let kind=node.type
    let exported=false
    let defaultval=false
    let line=node.startPosition.row+1

    if (node.type === "function_declaration") {
        const nameNode = node.childForFieldName("name")
        if (nameNode) {
            name = nameNode.text
        }
    } 
    else if (node.type === "lexical_declaration") {
        const nameNode = node.namedChildren[0]
        if (nameNode) {
            const nameNodeText = nameNode.childForFieldName("name")
            if (nameNodeText) {
                name = nameNodeText.text
            }
        }
    } 
    else if (node.type === "export_statement") {
        exported=true
        if (node.text.includes("default")) {
            defaultval=true
        }
        const declarationNode = node.childForFieldName("declaration")
        if (declarationNode) {
            kind = declarationNode.type
            if (declarationNode.type === "function_declaration") {
                const nameNode = declarationNode.childForFieldName("name")
                if (nameNode) {
                    name = nameNode.text
                }
            }
            else if (declarationNode.type === "lexical_declaration") {
                const nameNode = declarationNode.namedChildren[0]
                if (nameNode) {
                    const nameNodeText = nameNode.childForFieldName("name")
                    if (nameNodeText) {
                        name = nameNodeText.text
                    }
                }
            }
        }
    }
    else{
        continue
    }
    res.name=name
    res.kind=kind
    res.exported=exported
    res.default=defaultval
    res.line=line
    array.push(res)

}
console.log(JSON.stringify(array))
console.error(JSON.stringify(array))

/*만들 것: src/build.ts 안에 top-level 심볼을 뽑는 로직 (함수로 분리하든 말든 네 판단) 
— tree.rootNode.namedChildren을 순회하면서 위 규칙대로 {name, kind, exported, default, line} 객체 배열을 만들어라. */