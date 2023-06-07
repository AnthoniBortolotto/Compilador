import { TokenType } from "./tokenType";
import { Lexer } from "./analisador-lexico";
import { Parser } from "./analisador-sintatico";
import { Token } from "./token";

function compile(input: string) {
	const lexer = new Lexer(input);
	const tokens = new Array<Token>();

	let token = lexer.getNextToken();
	while (token.type !== TokenType.Identifier) {
		tokens.push(token);
		token = lexer.getNextToken();
	}

	const parser = new Parser(tokens);
	const result = parser.parse();
	console.log("Resultado:", result);
}

// Exemplo de uso
compile("x = 5 + 3 * 2");
