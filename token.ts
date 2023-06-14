import { TokenType } from "./tokenType";

export class Token {
	type: TokenType;
	value: string;
	position: number;
	line: number;
  
	constructor(type: TokenType, value: string, position: number, line: number) {
	  this.type = type;
	  this.value = value;
	  this.position = position;
	  this.line = line;
	}
  }