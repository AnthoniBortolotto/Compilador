export enum TokenType {
  Identifier, // variable name or function name
  Number, // 21 or 12.32
  ArithmeticOperator, //  - * /
  SumOperator, // +
  RelationalOperator, // > < >= <= == !=
  LogicalOperator, // && ||
  OpenParenthesis, // (
  CloseParenthesis, // )
  Keyword, // if while for function
  ConditionFollow, // else else if
  Comma, // ,
  Dot, // .
  DataTypes, // number string bool
  CommandSeparator, // ;
  Assignment, // =
  StringValue, // "bom dia"
  OpenBracket, // {
  CloseBracket, // }
  LogicalValue, // true false
  EOF, // end of file
}
