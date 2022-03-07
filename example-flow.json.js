const example = {
    id: "string",
    name: "string",
    start: {
        parameters: {
            // initial parameters, key: value
            string: "string",
        },
    },
    forks: [
        // a fork is a conditional statements to be evaluated
        // a block may have multiple forks
        // statements are expressed as a string from the `illogical` library
        {
            id: "string",
            name: "string",
            type: "string", // "simple" or "mapped"
            block: "string",
            statement: "string",
            mapping: {
                // mapping of blocks to be invoked after the statement is evaluated
                true: "string", // or null
                false: "string", // or null
                string: "string", // or null
            },
        },
    ],
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
    blocks: [
        // collection of one or more expressions
        // one block can be used multiple times
        // a block output can be used as input for another block or a fork
        {
            id: "string",
            name: "string",
            parentBlock: "string", // or null for root blocks
            expressions: ["string"],
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
