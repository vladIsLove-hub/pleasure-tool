# Pleasure-Tool
### Tool which will save you a huge amount of time that you could spend on yourself or somewhere else!

Before using it, please follow the steps:
 - Clone repo: `git clone https://github.com/vladIsLove-hub/pleasure-tool.git`.
 - Run `pnpm i` from the root. (Make sure that you have `pnpm` package manager, if not just run: `npm i -g pnpm`).
 
### How to use it?

This tool need two particular files: `statuses.txt` and `project.types.json`.

### About `project.types.json` file

Let's start with `project.types.json`. It's the main file for your project's info detection.
`project.types.info` structure example: 
```json
{
    "PBI Desktop, Build and Accessibility.Development": {
        "min": 0,
        "max": 3,
        "wildcard": ["Update", "Creating", "Fix", "Create", "develop", "implementing", "implement", "Change", "Refactored", "Rewrote", "Resolve"]
    },
    "PBI Desktop, Build and Accessibility.Investigation": {
        "min": 0,
        "max": 3,
        "wildcard": ["Investigate", "Investigating", "Investigation", "Debug"]
    }
    ...
}
```

Key  | Description
------------- | -------------
key: `string` |  Your project taskname (For example: `PBI Desktop, Build and Accessibility.Development`)
min: `number`  |  The minimum time that will be spent to complete the task (0 by default)
max: `number` |  The maximum time that will be spent to complete the task (you can specify your default time here by yourself)
wildcard: `string[]` |  Array of strings (keywords) to determine which type your task is of.

Let's investigate the first object inside `project.types.json`, because other objects will be almost the same.

`PBI Desktop, Build and Accessibility.Development` (and the others) - is a taskname of our project, but where can I receive them? It's either than it looks!

1. Go to [Akvelon ETS](https://ets.akvelon.net/)
2. Sign in and then:

![image](https://user-images.githubusercontent.com/60508001/181575828-a4cf3adc-3c49-489a-a99c-60398b90d109.png)

![image](https://user-images.githubusercontent.com/60508001/181575987-85f89a37-0dc7-4752-9302-71e1159b69dd.png)

You have downloaded `.xlsx` document with all your tasks' types in your project, just open it and you'll see all your tasks's types in the `Projects` tab. Then just copy your project tasks's types to `project.types.json` and each of them will be the `key` in this object.

![image](https://user-images.githubusercontent.com/60508001/181576713-f5a489b2-b827-4c68-9baa-44360ad35721.png)

### About `statuses.txt` file.

Firstly, you sould create `statuses.txt` file in the project's root.
`statuses.txt` structure:

```txt
{month}/{date}/{year}
 - {first_task_description}
 - {second_task_description}
...
```

Example:

```txt
7/19/2022
 - Investigated something
 - Implemented something
 - Participated in something
 - Tested something
 ===
 7/20/2022
 - Investigated something
 - Implemented something
 - Participated in something
 - Tested something
```

2 rules must be followed:
- Each of your statuses must start with Date and make sure that you have proper date format (For instance: `7/30/2022` or `7-30-2022`, `{month}/{date}/{year}`)
- Each of your status must include a separator: ```===```

### Excel time report file generation 

As soon as all previous steps are completed you need to run: `pnpm build` in the root folder.
After that `Reports.xlsx` file will appear. Enjoy!
