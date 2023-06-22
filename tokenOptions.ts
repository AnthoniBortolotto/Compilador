import { TokenType } from "./tokenType";

export interface TokenOption {
    option: TokenType
    repeatable?: boolean
    optional?: boolean
    alreadyRead?: boolean
}