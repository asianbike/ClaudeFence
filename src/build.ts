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
let imports=[]
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
    else if (node.type === "import_statement") {
        let exportarray={source:"", kind:"",names:[],typeOnly:false,line:0,resolved:null}
        exportarray.line=line
        exportarray.typeOnly=node.text.startsWith("import type")
        const sourceNode = node.namedChildren
        for(const child of sourceNode){
            if (child.type==="string"){
                exportarray.source=child.text
            }
        }
        let flag=0
        for(const child of sourceNode){
            if (child.type==="import_clause"){
                flag=1
                if (child.text.startsWith("{")){
                    exportarray.kind="named"
                    exportarray.names=child.namedChildren[0].namedChildren.map(n => n.text)
                }
                else if (child.text.startsWith("*")){
                    exportarray.kind="namespace"
                    exportarray.names=[]
                }
                else{
                    exportarray.kind="default"
                    exportarray.names=[child.namedChildren[0].text]
                }
            }
            else{
                if (flag===0){
                    exportarray.kind="side-effect"
                    exportarray.names=[]
                }
            }
    }

        imports.push(exportarray)
        continue
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
console.log(JSON.stringify({symbols: array, imports: imports}))
