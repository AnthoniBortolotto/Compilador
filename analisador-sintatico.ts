import { Lexer } from "./analisador-lexico";
import { Token } from "./token";
import { TokenOption } from "./tokenOptions";
import { TokenType } from "./tokenType";
import { isSyncToken } from "./tokensIdentifiers";

export class Parser {
  lexer: Lexer;
  lexerPosition: number;
  currentToken: Token;
  tokenList: Token[];
  acceptedTokens: TokenType[] = [];
  buffer: Array<Array<TokenOption>> = [];

  constructor(input: string) {
    this.lexer = new Lexer(input);
    this.lexerPosition = 0;
    this.tokenList = this.lexer.getAllTokens();
    this.buffer = [
      [
        {
          option: TokenType.Keyword,
          repeatable: true,
        },
      ],
    ]; // tokens that are accepted by the parser in the current state
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
      if (this.validateOptionalsAndRepeatables()) {
        continue;
      }
      // if the buffer is empty
      if (
        this.buffer.length === 0 &&
        !isSyncToken(this.currentToken) // sync token can be accepted in any state
        // use global sync tokens, verify later
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
        this.validateIdentifier();
        continue;
      }
      if (this.currentToken.type === TokenType.ConditionFollow) {
        this.validateConditionFollow();
      }
      if (this.currentToken.type === TokenType.Number) {
      }
      if (this.currentToken.type === TokenType.ArithmeticOperator) {
        this.validateArithmeticOperator();
        continue;
      }
      if (this.currentToken.type === TokenType.RelationalOperator) {
      }
      if (this.currentToken.type === TokenType.LogicalOperator) {
      }
      if (this.currentToken.type === TokenType.OpenParenthesis) {
        this.validateOpenParenthesis();
        continue;
      }
      if (this.currentToken.type === TokenType.CloseParenthesis) {
        this.validateCloseParenthesis();
        continue;
      }
      if (this.currentToken.type === TokenType.CommandSeparator) {
        this.validateCommandSeparator();
        continue;
      }
      if (this.currentToken.type === TokenType.Assignment) {
        this.validateAssignment();
        continue;
      }
      if (this.currentToken.type === TokenType.StringValue) {
        this.validateStringValue();
        continue;
      }
      if (this.currentToken.type === TokenType.OpenBracket) {
        this.validateOpenBracket();
        continue;
      }
      if (this.currentToken.type === TokenType.CloseBracket) {
        this.validateCloseBracket();
        continue;
      }
      if (this.currentToken.type === TokenType.LogicalValue) {
        this.validateLogicalValue();
        continue;
      }
    }
  }

  validateOptionalsAndRepeatables() {
    if (this.buffer[0][0].repeatable) {
      if (this.haveOption(this.currentToken.type)) {
        this.buffer[0][0].alreadyRead = true;
        this.buffer.unshift(this.buffer[0]);
        return false;
      }
      // if the current token is not accepted by the parser and the current state already read a token
      if (this.buffer[0][0].alreadyRead || this.buffer[0][0].optional) {
        this.buffer.shift();
        return true;
      }
      this.error();
      if (isSyncToken(this.currentToken)) {
        this.buffer.shift();
      } else {
        this.advance();
      }
      return true;
    } else if (
      this.buffer[0][0].optional &&
      !this.haveOption(this.currentToken.type)
    ) {
      this.buffer.shift();
      return true;
    }

    return false;
  }

  validateLogicalValue() {
    if (!this.haveOption(TokenType.LogicalValue)) {
      this.advance();
      this.error();
      return;
    }
    this.buffer.shift();
    this.advance();
  }

  validateArithmeticOperator() {
    if (!this.haveOption(TokenType.ArithmeticOperator)) {
      this.advance();
      this.error();
      return;
    }
    this.buffer.unshift([{ option: TokenType.Number }, { option: TokenType.Identifier }]);
    this.advance();
  }

  validateKeyword() {
    // if the parser is not in a state that accepts keywords
    if (!this.haveOption(TokenType.Keyword)) {
      // remove the first state from the buffer
      this.advance();
      this.error();
      return;
    }
    if (this.currentToken.value === "if") {
      // remove the first state from the buffer
      this.buffer.shift();

      // add to the start of the buffer the states that are accepted after the keyword if
      this.buffer.unshift([
        { option: TokenType.ConditionFollow, optional: true },
      ]);
      this.buffer.unshift([{ option: TokenType.CloseBracket }]);
      this.buffer.unshift([{ option: TokenType.Keyword, repeatable: true }]);
      this.buffer.unshift([{ option: TokenType.OpenBracket }]);
      this.buffer.unshift([{ option: TokenType.CloseParenthesis }]);
      this.buffer.unshift([
        { option: TokenType.LogicalValue },
        { option: TokenType.Identifier },
      ]);
      this.buffer.unshift([{ option: TokenType.OpenParenthesis }]);
      this.advance();
    } else if (this.currentToken.value === "while") {
    } else if (this.currentToken.value === "for") {
    } else if (this.currentToken.value === "int") {
    } else if (this.currentToken.value === "float") {
    } else if (this.currentToken.value === "string") {
      this.buffer.shift();

      this.buffer.unshift([{ option: TokenType.CommandSeparator }]);
      this.buffer.unshift([
        {
          option: TokenType.ArithmeticOperator,
          optional: true,
        },
      ]);
      this.buffer.unshift([
        { option: TokenType.StringValue },
        { option: TokenType.Identifier },
      ]);
      this.buffer.unshift([{ option: TokenType.Assignment }]);
      this.buffer.unshift([{ option: TokenType.Identifier }]);
      this.advance();
    } else if (this.currentToken.value === "bool") {
    } else {
      throw new Error(
        `Syntax error: Unexpected keyword ${this.currentToken.value}`
      );
    }
  }

  validateCommandSeparator() {
    if (!this.haveOption(TokenType.CommandSeparator)) {
      this.error();
      this.buffer.shift();
      return;
    }
    this.buffer.shift();
    this.advance();
    //   this.buffer = [[TokenType.Keyword]];
  }

  validateOpenParenthesis() {
    if (!this.haveOption(TokenType.OpenParenthesis)) {
      this.error();
      this.advance();
    } else {
      this.buffer.shift();
      this.advance();
    }
  }

  validateCloseParenthesis() {
    if (!this.haveOption(TokenType.CloseParenthesis)) {
      this.error();
      this.advance();
    } else {
      this.buffer.shift();
      this.advance();
    }
  }

  validateAssignment() {
    if (!this.haveOption(TokenType.Assignment)) {
      this.error();
      this.advance();
    }
    this.buffer.shift();
    this.advance();
  }

  validateStringValue() {
    if (!this.haveOption(TokenType.StringValue)) {
      this.error();
      this.advance();
    }
    this.buffer.shift();
    this.advance();
  }

  validateIdentifier() {
    if (!this.haveOption(TokenType.Identifier)) {
      this.error();
      this.advance();
    } else {
      this.buffer.shift();
      this.advance();
    }
  }

  validateOpenBracket() {
    if (!this.haveOption(TokenType.OpenBracket)) {
      this.error();
      this.advance();
    } else {
      this.buffer.shift();
      this.advance();
    }
  }

  validateCloseBracket() {
    if (!this.haveOption(TokenType.CloseBracket)) {
      this.error();
      this.advance();
    } else {
      this.buffer.shift();
      this.advance();
    }
  }

  validateConditionFollow() {
    if (!this.haveOption(TokenType.ConditionFollow)) {
      // remove the first state from the buffer
      this.advance();
      this.error();
      return;
    }

    if (this.currentToken.value === "else if") {
    } else if (this.currentToken.value === "else") {
    } else {
      throw new Error(
        `Syntax error: Unexpected Condition Follow ${this.currentToken.value}`
      );
    }
  }

  // utility functions

  error() {
    console.log(
      `Syntax error at line ${this.currentToken.line}: Unexpected token ${this.currentToken.value}`
    );
  }

  haveOption(option: TokenType) {
    return this.buffer[0].find((tokenOption) => tokenOption.option === option);
  }

  advance() {
    this.lexerPosition++;
    this.currentToken = this.tokenList[this.lexerPosition];
  }
}
