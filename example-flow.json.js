const example = {
    id: "string",
    name: "string",
    start: {
        parameters: {
            // initial parameters, key: value
            string: "string",
        },
    },
    conditions: [
        {
            id: "string",
            name: "string",
            type: "string",
            block: "string",
            value: "string",
            operator: "string",
            path: "string", // a path has the form "<block_id>.<block_id>..."
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
