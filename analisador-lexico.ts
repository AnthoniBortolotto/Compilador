import { Token } from "./token";
import { TokenType } from "./tokenType";
import {
  isCommandSeparator,
  isDigit,
  isEndOfLine,
  isLetter,
  isWhitespace,
} from "./tokensIdentifiers";

export class Lexer {
  input: string;
  position: number;
  line: number;
  currentChar: string | null;

  // remove from the string every character after the // until the end of the line
  removeComments(input: string) {
    const regex = /\/\/.*/g;
    return input.replace(regex, "");
  }
  // remove from the string every extra space
  removeDoubleSpaces(input: string) {
    const regex = / {2,}/g;
    return input.replace(regex, " ");
  }

  // remove comments and extra spaces from the input
  inputCleaner(input: string) {
    return this.removeDoubleSpaces(this.removeComments(input));
  }

  constructor(input: string) {
    this.input = this.inputCleaner(input);
    this.position = 0;
    this.line = 1;
    this.currentChar = input[0] || null;
  }

  advance(advanceQuantity = 1) {
    this.position += advanceQuantity;
    this.currentChar = this.input[this.position] || null;
  }

  getLine(position: number) {
    let line = 1;
    for (let i = 0; i < position; i++) {
      if (this.input[i] === "\n") {
        line++;
      }
    }
  }

  error() {
    console.log(
      `lexical error at line ${this.line}: unrecognized char '${
        this.currentChar
      }' near ${this.position > 6 ? this.input[this.position - 6] : ""}${
        this.position > 5 ? this.input[this.position - 5] : ""
      }${this.position > 4 ? this.input[this.position - 4] : ""}${
        this.position > 3 ? this.input[this.position - 3] : ""
      }${this.position > 2 ? this.input[this.position - 2] : ""}${
        this.position > 2 ? this.input[this.position - 1] : ""
      }${this.input[this.position]}`
    );
    this.input = this.input.replace(this.input[this.position], "$"); // replace the unrecognized char with a $
  }

  verifyKeyword(keyword: string, nextAction: Function) {
    if (
      this.currentChar === keyword[0] &&
      this.input.slice(this.position, this.position + keyword.length) ===
        keyword
    ) {
      this.advance(keyword.length);
      nextAction();
    }
  }

  getAllTokens() {
    const tokens = new Array<Token>();
    while (this.currentChar !== null) {
      const currentPosition = this.position;

      if (isWhitespace(this.currentChar)) {
        this.advance();
        continue;
      }
      if (isEndOfLine(this.currentChar)) {
        this.advance();
        this.line++;
        continue;
      }
      if (isCommandSeparator(this.currentChar)) {
        this.advance();
        tokens.push(
          new Token(TokenType.CommandSeparator, ";", currentPosition, this.line)
        );
        continue;
      }

      // keywords

      // if
      if (
        this.currentChar === "i" &&
        this.input.slice(this.position, this.position + 2) === "if"
      ) {
        this.advance(2);
        tokens.push(
          new Token(TokenType.Keyword, "if", currentPosition, this.line)
        );
        continue;
      }

      // else if
      if (
        this.currentChar === "e" &&
        this.input.slice(this.position, this.position + 7) === "else if"
      ) {
        this.advance(7);
        tokens.push(
          new Token(
            TokenType.ConditionFollow,
            "else if",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // else
      if (
        this.currentChar === "e" &&
        this.input.slice(this.position, this.position + 4) === "else"
      ) {
        this.advance(4);
        tokens.push(
          new Token(
            TokenType.ConditionFollow,
            "else",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // while
      if (
        this.currentChar === "w" &&
        this.input.slice(this.position, this.position + 5) === "while"
      ) {
        this.advance(5);
        tokens.push(
          new Token(TokenType.Keyword, "while", currentPosition, this.line)
        );
        continue;
      }

      //function
      if (
        this.currentChar === "f" &&
        this.input.slice(this.position, this.position + 8) === "function"
      ) {
        this.advance(8);
        tokens.push(
          new Token(TokenType.Keyword, "function", currentPosition, this.line)
        );
        continue;
      }

      // for
      if (
        this.currentChar === "f" &&
        this.input.slice(this.position, this.position + 3) === "for"
      ) {
        this.advance(3);
        tokens.push(
          new Token(TokenType.Keyword, "for", currentPosition, this.line)
        );
        continue;
      }

      // true
      if (
        this.currentChar === "t" &&
        this.input.slice(this.position, this.position + 4) === "true"
      ) {
        this.advance(4);
        tokens.push(
          new Token(TokenType.LogicalValue, "true", currentPosition, this.line)
        );
        continue;
      }

      // false
      if (
        this.currentChar === "f" &&
        this.input.slice(this.position, this.position + 5) === "false"
      ) {
        this.advance(5);
        tokens.push(
          new Token(TokenType.LogicalValue, "false", currentPosition, this.line)
        );
        continue;
      }

      // break
      if (
        this.currentChar === "b" &&
        this.input.slice(this.position, this.position + 5) === "break"
      ) {
        this.advance(5);
        tokens.push(
          new Token(TokenType.LogicalValue, "break", currentPosition, this.line)
        );
        continue;
      }

      // Data Types

      // number
      if (
        this.currentChar === "n" &&
        this.input.slice(this.position, this.position + 6) === "number"
      ) {
        this.advance(6);
        tokens.push(
          new Token(TokenType.DataTypes, "number", currentPosition, this.line)
        );
        continue;
      }

      // string
      if (
        this.currentChar === "s" &&
        this.input.slice(this.position, this.position + 6) === "string"
      ) {
        this.advance(6);
        tokens.push(
          new Token(TokenType.DataTypes, "string", currentPosition, this.line)
        );
        continue;
      }

      // bool
      if (
        this.currentChar === "b" &&
        this.input.slice(this.position, this.position + 4) === "bool"
      ) {
        this.advance(4);
        tokens.push(
          new Token(TokenType.DataTypes, "bool", currentPosition, this.line)
        );
        continue;
      }

      // string value
      // 'Bom dia'
      if (this.currentChar === "'") {
        const delimiterPosition = this.input.indexOf("'", this.position + 1);
        if (delimiterPosition === -1) {
          // convert everything to error char
          this.error();
          // skip the rest of the input
          this.advance(this.input.length - this.position);
          continue;
        }
        const string = this.input.slice(this.position + 1, delimiterPosition);
        this.advance(
          string.length + 2 // +2 to skip the quotes
        );
        tokens.push(
          new Token(
            TokenType.StringValue,
            "'" + string + "'",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // +
      if (this.currentChar === "+") {
        this.advance();
        tokens.push(
          new Token(
            TokenType.SumOperator,
            "+",
            currentPosition,
            this.line
          )
        );
        continue;
      }
      // -
      if (this.currentChar === "-") {
        this.advance();
        tokens.push(
          new Token(
            TokenType.ArithmeticOperator,
            "-",
            currentPosition,
            this.line
          )
        );
        continue;
      }
      // *
      if (this.currentChar === "*") {
        this.advance();
        tokens.push(
          new Token(
            TokenType.ArithmeticOperator,
            "*",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // /
      if (this.currentChar === "/") {
        this.advance();
        tokens.push(
          new Token(
            TokenType.ArithmeticOperator,
            "/",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // &&
      if (this.currentChar === "&" && this.input[this.position + 1] === "&") {
        this.advance(2);
        tokens.push(
          new Token(TokenType.LogicalOperator, "&&", currentPosition, this.line)
        );
        continue;
      }
      // ||
      if (this.currentChar === "|" && this.input[this.position + 1] === "|") {
        this.advance(2);
        tokens.push(
          new Token(TokenType.LogicalOperator, "||", currentPosition, this.line)
        );
        continue;
      }

      // <=
      if (this.currentChar === "<" && this.input[this.position + 1] === "=") {
        this.advance(2);
        tokens.push(
          new Token(
            TokenType.RelationalOperator,
            "<=",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // >=
      if (this.currentChar === ">" && this.input[this.position + 1] === "=") {
        this.advance(2);
        tokens.push(
          new Token(
            TokenType.RelationalOperator,
            ">=",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // ==
      if (this.currentChar === "=" && this.input[this.position + 1] === "=") {
        this.advance(2);
        tokens.push(
          new Token(
            TokenType.RelationalOperator,
            "==",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // !=
      if (this.currentChar === "!" && this.input[this.position + 1] === "=") {
        this.advance(2);
        tokens.push(
          new Token(
            TokenType.RelationalOperator,
            "!=",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // <
      if (this.currentChar === "<") {
        this.advance();
        tokens.push(
          new Token(
            TokenType.RelationalOperator,
            "<",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // >
      if (this.currentChar === ">") {
        this.advance();
        tokens.push(
          new Token(
            TokenType.RelationalOperator,
            ">",
            currentPosition,
            this.line
          )
        );
        continue;
      }

      // {
      if (this.currentChar === "{") {
        this.advance();
        tokens.push(
          new Token(TokenType.OpenBracket, "{", currentPosition, this.line)
        );
        continue;
      }

      // }

      if (this.currentChar === "}") {
        this.advance();
        tokens.push(
          new Token(TokenType.CloseBracket, "}", currentPosition, this.line)
        );
        continue;
      }

      if (this.currentChar === "(") {
        this.advance();
        tokens.push(
          new Token(TokenType.OpenParenthesis, "(", currentPosition, this.line)
        );
        continue;
      }

      if (this.currentChar === ")") {
        this.advance();
        tokens.push(
          new Token(TokenType.CloseParenthesis, ")", currentPosition, this.line)
        );
        continue;
      }

      // =
      if (this.currentChar === "=") {
        this.advance();
        tokens.push(
          new Token(TokenType.Assignment, "=", currentPosition, this.line)
        );
        continue;
      }

      // ,

      if (this.currentChar === ",") {
        this.advance();
        tokens.push(
          new Token(TokenType.Comma, ",", currentPosition, this.line)
        );
        continue;
      }

      if (isDigit(this.currentChar)) {
        tokens.push(this.getNumberToken(currentPosition));
        continue;
      }

      // .
      if (this.currentChar === ".") {
        this.advance();
        tokens.push(new Token(TokenType.Dot, ".", currentPosition, this.line));
        continue;
      }

      if (isLetter(this.currentChar)) {
        tokens.push(this.getIdentifierToken(currentPosition));
        continue;
      }



      this.error();
      this.advance();
    }
    tokens.push(new Token(TokenType.EOF, "", this.position, this.line));
    return tokens;
  }

  //tokens identifications

  getIdentifierToken(startPosition: number) {
    let result = "";

    while (
      this.currentChar !== null &&
      (isLetter(this.currentChar) || isDigit(this.currentChar))
    ) {
      result += this.currentChar;
      this.advance();
    }

    return new Token(TokenType.Identifier, result, startPosition, this.line);
  }

  getNumberToken(startPosition: number) {
    let result = "";
    let dotCount = 0;
    while (this.currentChar !== null && (isDigit(this.currentChar) || (this.currentChar === "." && dotCount < 1))) {
      result += this.currentChar;
      if (this.currentChar === ".") {
        dotCount++;
      }
      this.advance();
    }

    return new Token(TokenType.Number, result, startPosition, this.line);
  }
}
