import { TokenType } from "./tokenType";
import { Lexer } from "./analisador-lexico";
import { Parser } from "./analisador-sintatico";
import * as fs from "fs";
import { Token } from "./token";

function compile(input: string) {
	const lexer = new Lexer(input);
	
	const tokens = lexer.getAllTokens();;
	console.log(tokens)

/* 	let token = lexer.getNextToken();
	while (token.type !== TokenType.Identifier) {
		tokens.push(token);
		token = lexer.getNextToken();
	} */
	return tokens;

}

function readFile(caminhoArquivo: string): string {
	return fs.readFileSync(caminhoArquivo, "utf8")
}

const fileContent = readFile("entrada.txt");

// Exemplo de uso
const result = compile(fileContent);
//console.log(result);
