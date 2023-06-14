import { Token } from "./token";
import { TokenType } from "./tokenType";

export class Parser {
	tokens: Token[];
	currentToken: Token | null;
	currentIndex: number;

	constructor(tokens: Token[]) {
		this.tokens = tokens;
		this.currentIndex = 0;
		this.currentToken = tokens[0] || null;
	}

	advance() {
		this.currentIndex++;
		this.currentToken = this.tokens[this.currentIndex] || null;
	}

	error(message: string) {
		const position = this.currentToken ? this.currentToken.position : -1;
		throw new Error(`Syntax error at position ${position}: ${message}`);
	}

	parse() {
		return this.expr();
	}

	factor() {
		const token = this.currentToken;

		if (token?.type === TokenType.Number) {
			this.advance();
			return parseFloat(token.value);
		} else if (token?.type === TokenType.Identifier) {
			this.advance();
			return token.value;
		} else if (token?.type === TokenType.Parenthesis && token.value === "(") {
			this.advance();
			const result = this.expr();
			if (this.currentToken?.type === TokenType.Parenthesis && this.currentToken.value === ")") {
				this.advance();
				return result;
			} else {
				this.error("Missing closing parenthesis");
			}
		} else {
			this.error("Invalid token");
		}
	}

	term() {
		let result = this.factor();

		while (this.currentToken?.type === TokenType.Operator && ["*", "/"].includes(this.currentToken.value)) {
			const operator = this.currentToken.value;
			this.advance();
			const nextFactor = this.factor();

			if (operator === "*") {
				result *= nextFactor;
			} else if (operator === "/") {
				result /= nextFactor;
			}
		}

		return result;
	}

	expr() {
		let result = this.term();

		while (this.currentToken?.type === TokenType.Operator && ["+", "-"].includes(this.currentToken.value)) {
			const operator = this.currentToken.value;
			this.advance();
			const nextTerm = this.term();

			if (operator === "+") {
				result += nextTerm;
			} else if (operator === "-") {
				result -= nextTerm;
			}
		}

		return result;
	}
}

