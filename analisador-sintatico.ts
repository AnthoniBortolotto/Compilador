import { Lexer } from "./analisador-lexico";
import { Token } from "./token";
import { TokenOption } from "./tokenOptions";
import { TokenType } from "./tokenType";
import { isSyncToken } from "./tokensIdentifiers";
import {
  LogicalOperatorExpression,
  RelationalOperatorExpression,
  statementsBuffer,
} from "./utils";

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
    this.buffer = [statementsBuffer]; // tokens that are accepted by the parser in the current state
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
      if (this.currentToken.type === TokenType.DataTypes) {
        this.validateDataTypes();
        continue;
      }
      if (this.currentToken.type === TokenType.Identifier) {
        this.genericValidate(TokenType.Identifier);
        continue;
      }
      if (this.currentToken.type === TokenType.ConditionFollow) {
        this.validateConditionFollow();
        continue;
      }
      if (this.currentToken.type === TokenType.Number) {
        this.genericValidate(TokenType.Number);
        continue;
      }
      if (this.currentToken.type === TokenType.ArithmeticOperator) {
        this.validateArithmeticOperator();
        continue;
      }
      if (this.currentToken.type === TokenType.SumOperator) {
        this.validateSumOperator();
        continue;
      }
      if (this.currentToken.type === TokenType.RelationalOperator) {
        this.validateRelationalOperator();
        continue;
      }
      if (this.currentToken.type === TokenType.LogicalOperator) {
        this.validateLogicalOperator();
        continue;
      }
      if (this.currentToken.type === TokenType.OpenParenthesis) {
        this.genericValidate(TokenType.OpenParenthesis);
        continue;
      }
      if (this.currentToken.type === TokenType.CloseParenthesis) {
        this.genericValidate(TokenType.CloseParenthesis);
        continue;
      }
      if (this.currentToken.type === TokenType.CommandSeparator) {
        this.genericValidate(TokenType.CommandSeparator, true);
        continue;
      }
      if (this.currentToken.type === TokenType.Assignment) {
        this.genericValidate(TokenType.Assignment);
        continue;
      }
      if (this.currentToken.type === TokenType.StringValue) {
        this.genericValidate(TokenType.StringValue);
        continue;
      }
      if (this.currentToken.type === TokenType.OpenBracket) {
        this.genericValidate(TokenType.OpenBracket);
        continue;
      }
      if (this.currentToken.type === TokenType.CloseBracket) {
        this.genericValidate(TokenType.CloseBracket, true);
        continue;
      }
      if (this.currentToken.type === TokenType.LogicalValue) {
        this.genericValidate(TokenType.LogicalValue);
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

  validateArithmeticOperator() {
    const option = this.haveOption(TokenType.ArithmeticOperator);
    if (!option) {
      this.error();
      this.advance();
      return;
    }
    this.buffer.shift();

    this.advance();
    this.handleNext(option);
    this.buffer.unshift([
      { option: TokenType.Number },
      { option: TokenType.Identifier },
    ]);
  }

  validateLogicalOperator() {
    // && ||
    const option = this.haveOption(TokenType.LogicalOperator);
    if (!option) {
      this.error();
      this.advance();
      return;
    }
    this.buffer.shift();

    this.advance();
    this.handleNext(option);
    this.buffer.unshift([{ option: TokenType.Identifier }]);
  }

  validateRelationalOperator() {
    // > < >= <= == !=
    const option = this.haveOption(TokenType.RelationalOperator);
    if (!option) {
      this.error();
      this.advance();
      return;
    }

    this.buffer.shift();
    if ([">", "<", ">=", "<="].includes(this.currentToken.value)) {
      this.advance();
      this.handleNext(option);
      this.buffer.unshift([
        { option: TokenType.Identifier },
        { option: TokenType.Number },
      ]);
    } else {
      this.advance();
      this.handleNext(option);
      this.buffer.unshift([
        { option: TokenType.Identifier },
        { option: TokenType.Number },
        { option: TokenType.StringValue },
        { option: TokenType.LogicalValue },
      ]);
    }
  }

  validateSumOperator() {
    const option = this.haveOption(TokenType.SumOperator);
    if (!option) {
      this.error();
      this.advance();
      return;
    }
    this.buffer.shift();

    this.advance();
    this.handleNext(option);
    this.buffer.unshift([
      { option: TokenType.Number },
      { option: TokenType.Identifier },
      { option: TokenType.StringValue },
    ]);
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
      this.buffer.unshift(statementsBuffer);
      this.buffer.unshift([{ option: TokenType.OpenBracket }]);
      this.buffer.unshift([{ option: TokenType.CloseParenthesis }]);
      this.buffer.unshift([
        { option: TokenType.LogicalValue },
        { option: TokenType.Identifier },
      ]);
      this.buffer.unshift([{ option: TokenType.OpenParenthesis }]);
      this.advance();
    } else if (this.currentToken.value === "while") {
      // remove the first state from the buffer
      this.buffer.shift();

      // add to the start of the buffer the states that are accepted after the keyword if
      this.buffer.unshift([{ option: TokenType.CloseBracket }]);
      this.buffer.unshift(statementsBuffer);
      this.buffer.unshift([{ option: TokenType.OpenBracket }]);
      this.buffer.unshift([{ option: TokenType.CloseParenthesis }]);
      this.buffer.unshift([
        { option: TokenType.LogicalValue },
        { option: TokenType.Identifier },
      ]);
      this.buffer.unshift([{ option: TokenType.OpenParenthesis }]);
      this.advance();
    } else if (this.currentToken.value === "for") {
      // for (i = 0; i < 10; i = i + 1) {
      // }
      this.buffer.shift();

      // add to the start of the buffer the states that are accepted after the keyword if
      this.buffer.unshift([{ option: TokenType.CloseBracket }]);
      this.buffer.unshift(statementsBuffer);
      this.buffer.unshift([{ option: TokenType.OpenBracket }]);
      this.buffer.unshift([{ option: TokenType.CloseParenthesis }]);

      // i = i + 1
      this.buffer.unshift([
        { option: TokenType.ArithmeticOperator, optional: true },
        { option: TokenType.SumOperator, optional: true },
      ]);
      this.buffer.unshift([
        { option: TokenType.Number },
        { option: TokenType.Identifier },
      ]);
      this.buffer.unshift([{ option: TokenType.Assignment }]);
      this.buffer.unshift([
        {
          option: TokenType.Identifier,
        },
      ]);
      this.buffer.unshift([{ option: TokenType.CommandSeparator }]);

      // i < 10

      this.buffer.unshift([{ option: TokenType.RelationalOperator }]);
      this.buffer.unshift([
        {
          option: TokenType.Identifier,
        },
      ]);
      this.buffer.unshift([{ option: TokenType.CommandSeparator }]);

      // i = 0

      this.buffer.unshift([{ option: TokenType.Number }]);

      this.buffer.unshift([{ option: TokenType.Assignment }]);

      this.buffer.unshift([{ option: TokenType.Identifier }]);

      this.buffer.unshift([{ option: TokenType.OpenParenthesis }]);
      this.advance();
    } else {
      throw new Error(
        `Syntax error: Unexpected keyword ${this.currentToken.value}`
      );
    }
  }

  validateDataTypes() {
    const option = this.haveOption(TokenType.DataTypes);
    if (!option) {
      this.error();
      this.advance();
      return;
    }

    // verify if last token was a command separator
    if (
      this.lexerPosition === 0 ||
      [TokenType.CommandSeparator, TokenType.OpenBracket].includes(
        this.peekBehind().type
      ) ||
      this.peekBehind().type === TokenType.CommandSeparator
    ) {
      if (
        this.currentToken.value === "int" ||
        this.currentToken.value === "float"
      ) {
        this.buffer.shift();

        this.buffer.unshift([{ option: TokenType.CommandSeparator }]);
        this.buffer.unshift([
          {
            option: TokenType.ArithmeticOperator,
            optional: true,
            repeatable: true,
          },
          {
            option: TokenType.SumOperator,
            optional: true,
            repeatable: true,
          },
        ]);
        this.buffer.unshift([
          { option: TokenType.Number },
          { option: TokenType.Identifier },
        ]);
        this.buffer.unshift([{ option: TokenType.Assignment }]);
        this.buffer.unshift([{ option: TokenType.Identifier }]);
        this.advance();
      } else if (this.currentToken.value === "string") {
        this.buffer.shift();

        this.buffer.unshift([{ option: TokenType.CommandSeparator }]);
        this.buffer.unshift([
          {
            option: TokenType.SumOperator,
            optional: true,
            repeatable: true,
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

        this.buffer.shift();
     //   this.buffer.unshift([{ option: TokenType.CommandSeparator }]); logical operators put it in the buffer

        this.buffer.unshift([
          {
            option: TokenType.LogicalValue,
            next: [[LogicalOperatorExpression]],
          },
          {
            option: TokenType.Identifier,
            next: [[LogicalOperatorExpression, RelationalOperatorExpression]],
          },
          {
            option: TokenType.Number,
            next: [[RelationalOperatorExpression]],
          },
        ]);

        this.buffer.unshift([{ option: TokenType.Assignment }]);
        this.buffer.unshift([{ option: TokenType.Identifier }]);
        this.advance();
      }
    } else {
      this.buffer.shift();
      this.advance();
    }
    this.handleNext(option);
  }

  genericValidate(tokenType: TokenType, isSyncToken: boolean = false) {
    const option = this.haveOption(tokenType);
    if (!option && isSyncToken) {
      this.error();
      this.buffer.shift();
      return;
    } else if (!option) {
      this.error();
      this.advance();
      return;
    }

    this.buffer.shift();
    this.advance();
    this.handleNext(option);
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

  handleNext(currentToken: TokenOption) {
    if (currentToken.next) {
      const correctNext = currentToken.next.find((current) => {
        const startCurrentOption = current[current.length - 1].option;
        return startCurrentOption === this.currentToken.type;
      });
      this.buffer.unshift(correctNext ? correctNext : currentToken.next[0]);
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

  peekBehind() {
    return this.tokenList[this.lexerPosition - 1];
  }
}
