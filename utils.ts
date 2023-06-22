import { TokenType } from "./tokenType";

export const statementsBuffer = [
  {
    option: TokenType.Keyword,
    repeatable: true,
  },
  {
    option: TokenType.DataTypes,
    repeatable: true,
  },
  {
    option: TokenType.Identifier,
    repeatable: true,
    next: [
      [
        // function call
        {
          option: TokenType.CommandSeparator,
        },
        {
          option: TokenType.CloseParenthesis,
        },
        {
          option: TokenType.Identifier,
          optional: true,
          repeatable: true,
          next: [
            [
              {
                option: TokenType.Comma,
                optional: true,
              },
            ],
          ],
        },
        {
          option: TokenType.OpenParenthesis,
        },
      ],
      [
        // reassignment
        {
          option: TokenType.CommandSeparator,
        },
        {
          option: TokenType.Assignment,
          next: [
            [
              {
                option: TokenType.StringValue,
                next: [
                  [
                    {
                      option: TokenType.CommandSeparator,
                    },
                    {
                      option: TokenType.SumOperator,
                      optional: true,
                      repeatable: true,
                    },
                  ],
                ],
              },
            ],
            [
              {
                option: TokenType.ArithmeticOperator,
                optional: true,
                repeatable: true,
              },
              {
                option: TokenType.Number,
              },
            ],
            [
              {
                option: TokenType.LogicalValue,
              },
            ],
            [
              {
                option: TokenType.ArithmeticOperator,
                optional: true,
                repeatable: true,
              },
              {
                option: TokenType.Identifier,
              },
            ],
          ],
        },
      ],
    ],
  },
];
