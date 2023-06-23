import { log } from "console";
import { TokenType } from "./tokenType";
import { TokenOption } from "./tokenOptions";

export const SumOperatorExpression = {
  option: TokenType.SumOperator,
  next: [
    [
      {
        option: TokenType.CommandSeparator,
      },
    ],
  ],
};

export const ArithmeticOperatorExpression = {
  option: TokenType.ArithmeticOperator,
  next: [
    [
      {
        option: TokenType.CommandSeparator,
      },
    ],
  ],
};

export const LogicalOperatorExpression = {
  option: TokenType.LogicalOperator,
  next: [
    [
      {
        option: TokenType.CommandSeparator,
      },
    ],
  ],
};

export const RelationalOperatorExpression = {
  option: TokenType.RelationalOperator,
  next: [
    [
      {
        option: TokenType.CommandSeparator,
      },
    ],
  ],
};

export const CommandSeparatorExpression = {
  option: TokenType.CommandSeparator,
};

export const statementsBuffer: TokenOption[] = [
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
                option: TokenType.Number,
                next: [
                  [
                    CommandSeparatorExpression,
                    SumOperatorExpression,
                    ArithmeticOperatorExpression,
                  ],
                ],
              },
            ],
            [
              {
                option: TokenType.LogicalValue,
                next: [],
              },
            ],
            [
              {
                option: TokenType.Identifier,
                next: [
                  [
                    SumOperatorExpression,
                    ArithmeticOperatorExpression,
                    LogicalOperatorExpression,
                    CommandSeparatorExpression,
                    RelationalOperatorExpression,
                  ],
                ],
              },
            ],
          ],
        },
      ],
    ],
  },
];
