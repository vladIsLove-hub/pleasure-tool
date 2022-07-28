# Pleasure-Tool
### Tool which will save you a huge amount of time that you could spend on yourself or somewhere else!

Before using it, please follow the steps:
 - Clone repo: `git clone https://github.com/vladIsLove-hub/pleasure-tool.git`.
 - Run `pnpm i` from the root. (Make sure that you have `pnpm` package manager, if not - just run: `npm i -g pnpm`).
 
### How to use it?

This tool need two particular files: `statuses.txt` and `project.types.json`.

Let's start with `project.types.json`. It's the main file for detection of your project info.
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

`PBI Desktop, Build and Accessibility.Development` and others it's a taskname of our project, but where can I receive them? It's either than it looks!

1. Go to [Akvelon ETS](https://ets.akvelon.net/)
2. Sign in and then:

![image](https://user-images.githubusercontent.com/60508001/181575828-a4cf3adc-3c49-489a-a99c-60398b90d109.png)

![image](https://user-images.githubusercontent.com/60508001/181575987-85f89a37-0dc7-4752-9302-71e1159b69dd.png)

You have downloaded `.xlsx` document with all your tasks and project, just open it and you'll see all your tasks on your project. Then just copy your project tasks to `project.types.json` and they will be your `key` in this object.

![image](https://user-images.githubusercontent.com/60508001/181576713-f5a489b2-b827-4c68-9baa-44360ad35721.png)

### About `statuses.txt` file.

Firstly, you sould make `statuses.txt` file in the root of project.
`statuses.txt` structure:

```
{month}/{date}/{year}
 - Investigated in something
 - Implemented something
 - Participated in something
 - Tested something
===
7/19/2022
 - Investigated in something
 - Implemented something
 - Participated in something
 - Tested something
```

- Each of your statuses must starting with Date and make sure that you have properly date format (For instance: `7/30/2022` or `7-30-2022`, `{month}/{date}/{year}`)
- Each of your status must be include a separator: ```===```

### As soon all previous steps was completed you can run: `pnpm build` in the root folder.

After that `Reports.xlsx` file will be appear. Enjoy!
