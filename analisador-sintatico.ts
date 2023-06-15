import { Lexer } from "./analisador-lexico";
import { Token } from "./token";
import { TokenType } from "./tokenType";

export class Parser {
  lexer: Lexer;
  lexerPosition: number;
  currentToken: Token;
  tokenList: Token[];

  constructor(input: string) {
    this.lexer = new Lexer(input);
	this.lexerPosition = 0;
    this.tokenList = this.lexer.getAllTokens();
	this.currentToken = this.tokenList[this.lexerPosition]
  }

  match(tokenType: TokenType) {
    if (this.currentToken.type === tokenType) {
      this.consumeToken();
    } else {
      throw new Error(`Syntax error: Expected ${tokenType}, found ${this.currentToken.type}`);
    }
  }

  consumeToken() {
    this.currentToken = this.tokenList[++this.lexerPosition];
  }

  program() {
    this.statementList();
    this.match(TokenType.EOF);
  }

  statementList() {
    this.statement();
    this.statementListTail();
  }

  statementListTail() {
    if (this.currentToken.type === TokenType.CommandSeparator) {
      this.match(TokenType.CommandSeparator);
      this.statement();
      this.statementListTail();
    }
  }

  statement() {
    switch (this.currentToken.type) {
      case TokenType.Keyword:
        this.keyword();
        break;
      case TokenType.Identifier:
        this.identifier();
        break;
      case TokenType.Number:
        this.number();
        break;
      default:
        throw new Error(`Syntax error: Unexpected token ${this.currentToken.type}`);
    }
  }

  keyword() {
    if (this.currentToken.value === "if") {
      this.match(TokenType.Keyword);
    } else if (this.currentToken.value === "else") {
      this.match(TokenType.Keyword);
    } else if (this.currentToken.value === "while") {
      this.match(TokenType.Keyword);
    } else {
      throw new Error(`Syntax error: Unexpected keyword ${this.currentToken.value}`);
    }
  }

  identifier() {
    this.match(TokenType.Identifier);
  }

  number() {
    this.match(TokenType.Number);
  }

  parse() {
    try {
      this.program();
      console.log("Parsing completed successfully.");
    } catch (error) {
      console.log("Parsing failed. Error:");
    }
  }
}

// Usage example
const input = "if x > 0 { y = x; } else { y = -x; }";
const parser = new Parser(input);
parser.parse();
