import { Token } from "./token";
import { TokenType } from "./tokenType";

export class Lexer {
	input: string;
	position: number;
	currentChar: string | null;
  
	constructor(input: string) {
	  this.input = input;
	  this.position = 0;
	  this.currentChar = input[0] || null;
	}
  
	advance() {
	  this.position++;
	  this.currentChar = this.input[this.position] || null;
	}
  
	isWhitespace(char: string) {
	  return /\s/.test(char);
	}
  
	isLetter(char: string) {
	  return /[a-zA-Z]/.test(char);
	}
  
	isDigit(char: string) {
	  return /\d/.test(char);
	}
  
	getNextToken() {
	  while (this.currentChar !== null) {
		if (this.isWhitespace(this.currentChar)) {
		  this.advance();
		  continue;
		}
  
		if (this.isLetter(this.currentChar)) {
		  return this.getIdentifierToken();
		}
  
		if (this.isDigit(this.currentChar)) {
		  return this.getNumberToken();
		}
  
		// Check for operators
		if (this.currentChar === '+') {
		  this.advance();
		  return new Token(TokenType.Operator, '+');
		}
  
		if (this.currentChar === '-') {
		  this.advance();
		  return new Token(TokenType.Operator, '-');
		}
  
		// Check for parentheses
		if (this.currentChar === '(') {
		  this.advance();
		  return new Token(TokenType.Parenthesis, '(');
		}
  
		if (this.currentChar === ')') {
		  this.advance();
		  return new Token(TokenType.Parenthesis, ')');
		}
  
		// Check for keywords
		if (this.currentChar === 'if') {
		  this.advance();
		  return new Token(TokenType.Keyword, 'if');
		}
  
		// Handle unrecognized characters
		throw new Error(`Unrecognized character: ${this.currentChar}`);
	  }
  
	  // Return EOF token
	  return new Token(TokenType.Identifier, '');
	}
  
	getIdentifierToken() {
	  let result = '';
  
	  while (
		this.currentChar !== null &&
		(this.isLetter(this.currentChar) || this.isDigit(this.currentChar))
	  ) {
		result += this.currentChar;
		this.advance();
	  }
  
	  return new Token(TokenType.Identifier, result);
	}
  
	getNumberToken() {
	  let result = '';
  
	  while (this.currentChar !== null && this.isDigit(this.currentChar)) {
		result += this.currentChar;
		this.advance();
	  }
  
	  return new Token(TokenType.Number, result);
	}
  }
