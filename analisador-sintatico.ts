import { Lexer } from "./analisador-lexico";
import { Token } from "./token";
import { TokenType } from "./tokenType";
import { isSyncToken } from "./tokensIdentifiers";

export class Parser {
  lexer: Lexer;
  lexerPosition: number;
  currentToken: Token;
  tokenList: Token[];
  acceptedTokens: TokenType[] = [];
  buffer: Array<Array<TokenType>> = [];

  constructor(input: string) {
    this.lexer = new Lexer(input);
    this.lexerPosition = 0;
    this.tokenList = this.lexer.getAllTokens();
    this.buffer = [[TokenType.Keyword]]; // tokens that are accepted by the parser in the current state
    // ex: if the parser is an open parenthesis, it will accept only close parenthesis and letters

    // normalize EOF token in the end of the token list
    if (this.tokenList.length === 0) {
      throw new Error("Empty input");
    }
    const lastValidToken = this.tokenList[this.tokenList.length - 1];
    if (lastValidToken.type !== TokenType.EOF) {
      this.tokenList.push(
        new Token(
          TokenType.EOF,
          "",
          lastValidToken.value.length + lastValidToken.position,
          lastValidToken.line
        )
      );
    }
    this.currentToken = this.tokenList[this.lexerPosition];
  }

  parse() {
    while (this.currentToken.type !== TokenType.EOF) {
      // if the buffer is empty
      if (
        this.buffer.length === 0 &&
        !isSyncToken(this.currentToken) // sync token can be accepted in any state
      ) {
        // discard the current token and do not try to parse it
        this.advance();
        continue;
      }

      if (this.currentToken.type === TokenType.Keyword) {
        this.validateKeyword();
        continue;
      }
      if (this.currentToken.type === TokenType.Identifier) {
      }
      if (this.currentToken.type === TokenType.Number) {
      }
      if (this.currentToken.type === TokenType.Operator) {
      }
      if (this.currentToken.type === TokenType.OpenParenthesis) {
      }
      if (this.currentToken.type === TokenType.CloseParenthesis) {
      }
      if (this.currentToken.type === TokenType.CommandSeparator) {
        this.validateCommandSeparator();
        continue;
      }
      if (this.currentToken.type === TokenType.Assignment) {
      }
      if (this.currentToken.type === TokenType.StringDelimiter) {
      }
      if (this.currentToken.type === TokenType.OpenBracket) {
      }
      if (this.currentToken.type === TokenType.CloseBracket) {
      }
      if (this.currentToken.type === TokenType.LogicalValue) {
      }
    }
  }
  advance() {
    this.lexerPosition++;
    this.currentToken = this.tokenList[this.lexerPosition];
  }

  validateKeyword() {
    // if the parser is not in a state that accepts keywords
    if (!this.buffer[0].find((tokenType) => tokenType === TokenType.Keyword)) {
      // remove the first state from the buffer
      this.buffer.shift();
      this.error();
      return;
    }
    if (this.currentToken.value === "if") {
      // add to the start of the buffer the states that are accepted after the keyword if
      this.buffer.unshift([TokenType.OpenParenthesis]);
    } else if (this.currentToken.value === "else") {
    } else if (this.currentToken.value === "while") {
    } else {
      throw new Error(
        `Syntax error: Unexpected keyword ${this.currentToken.value}`
      );
    }
  }

  validateCommandSeparator() {
    if (
      this.buffer.length !== 0 &&
      !this.buffer[0].find(
        (tokenType) => tokenType === TokenType.CommandSeparator
      )
    ) {
      console.log(
        `Syntax error at line ${this.currentToken.line}: Expected tokens not found`
      );
    }
    this.buffer = [[TokenType.Keyword]];
  }

  error() {
    console.log(
      `Syntax error at line ${this.currentToken.line}: Unexpected token ${this.currentToken.value}`
    );
  }
}
