const example = {
    id: "string",
    name: "string",
    environment: {
        // environment variables, key: value
        string: "string",
    },
    blocks: [
        // collection of one or more expressions
        // one block can be used multiple times
        // a block output can be used as input for another block or a fork
        {
            id: "string",
            name: "string",
            parentBlocks: ["string"], // or empty array for root blocks
            expressions: [
                // raw compute expressions
                // can be reused multiple times by different blocks
                // result is computed on every execution
                // one or more per block
                // a block with only one expression is referred to as an "inline" block
                {
                    id: "string",
                    name: "string",
                    type: "string",
                    retry: "number",
                    parameters: [
                        // parameters, key: value
                        {
                            id: "string",
                            name: "string",
                            type: "string",
                            defaultValue: "string",
                            description: "string",
                        },
                    ],
                    results: [
                        // one or more results
                        {
                            id: "string",
                            name: "string",
                            type: "string",
                            description: "string",
                        },
                    ],
                },
            ],
            forks: [
                // a fork is a conditional statements to be evaluated
                // a block may have multiple forks
                // statements are expressed as a string from the `illogical` library
                {
                    id: "string",
                    name: "string",
                    block: "string",
                    branches: [
                        {
                            statement: "string",
                            // mapping of block ids to be invoked after each statement is evaluated
                            // the mappings are "true" and "false" for each statement
                            resultTrueBlocks: ["string"], // or empty array
                            resultFalseBlocks: ["string"], // or empty array
                        },
                    ],
                },
            ],
            parameters: [
                {
                    id: "string",
                    name: "string",
                    type: "string",
                    defaultValue: "string",
                    description: "string",
                },
            ],
            results: [
                {
                    id: "string",
                    name: "string",
                    type: "string",
                    description: "string",
                },
            ],
        },
    ],
};
