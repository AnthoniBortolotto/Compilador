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

export const functionParameterExpression: TokenOption[] = [
  {
    option: TokenType.DataTypes,
    optional: true,
    next: [
      [
        {
          option: TokenType.Identifier,
          next: [
            [
              {
                option: TokenType.Comma,
                optional: true,
                repeatable: true,
                next: [
                  [
                    {
                      option: TokenType.DataTypes,
                      next: [[{ option: TokenType.Identifier }]],
                    },
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

export const functionCallParameterNext = [
  [
    {
      option: TokenType.Comma,
      optional: true,
      repeatable: true,
      next: [
        [
          {
            option: TokenType.Identifier,
          },
          {
            option: TokenType.StringValue,
          },
          {
            option: TokenType.Number,
          },
          {
            option: TokenType.LogicalValue,
          },
        ],
      ],
    },
  ],
]

export const functionCallParameterExpression: TokenOption[] = [
  {
    option: TokenType.Identifier,
    next: functionCallParameterNext,
    optional: true,
  },
  {
    option: TokenType.StringValue,
    next: functionCallParameterNext,
    optional: true,
  },
  {
    option: TokenType.Number,
    next: functionCallParameterNext,
    optional: true,
  },
  {
    option: TokenType.LogicalValue,
    next: functionCallParameterNext,
    optional: true,
  },
];

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
                //     next: [],
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
