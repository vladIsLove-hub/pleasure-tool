# Pleasure-Tool `(2.1.2)`

### What is it

Tool which will save you a huge amount of time that you could spend on yourself or something else!

### What it does

It generates excel time report file, based on your daily text statuses.

Before using it, please follow the steps:

-   clone repo: `git clone https://github.com/vladIsLove-hub/pleasure-tool.git`;
-   run `pnpm i` from the root. (Make sure that you have `pnpm` package manager, if not just run: `npm i -g pnpm`).

### How to use

This tool needs two particular files: `statuses.txt` and `project.types.json`.

### About `project.types.json` file

Let's start with `project.types.json`. It's the main file where tasks of your project are described.
`project.types.info` structure:

```json5
{
    "{key}": {
        "min": {min_value},
        "max": {max_value},
        "wildcard": ["{first_keyword}", "{second_keyword}", ...]
    },
    ...
}
```

| Value                                | Type       | Description                                                                                                   |
| ------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------- |
| key                                  | `string`   | Your project taskname (For example: `PBI Desktop, Build and Accessibility.Development`)                       |
| min_value                            | `number`   | The minimum time that will be spent to complete the task (0 by default)                                       |
| max_value                            | `number`   | The maximum time that will be spent to complete the task (you can specify your default time here by yourself) |
| [first_keyword, second_keyword, ...] | `string[]` | Non-empty array of keywords which match specific project taskname.                                            |

Example:

```json
{
    "PBI Desktop, Build and Accessibility.Development": {
        "min": 0,
        "max": 3,
        "wildcard": [
            "update",
            "updating",
            "create",
            "creating",
            "develop",
            "implement",
            "change",
            "refactor",
            "rewriting",
            "rewrote",
            "resolve",
            "resolving"
        ]
    },
    "PBI Desktop, Build and Accessibility.Investigation": {
        "min": 0,
        "max": 3,
        "wildcard": [
            "investigate",
            "investigating",
            "investigation",
            "debug",
            "research"
        ]
    }
}
```

Let's investigate the first object inside `project.types.json`, because other objects will be almost the same.

`PBI Desktop, Build and Accessibility.Development` (and the others) - is a taskname of our project, but where can I receive it? It's easier than it looks!

1. Go to [Akvelon ETS](https://ets.akvelon.net/)
2. Sign in and then click `Download import template` in the dropdown menu:

![image](https://user-images.githubusercontent.com/60508001/181575828-a4cf3adc-3c49-489a-a99c-60398b90d109.png)

![image](https://user-images.githubusercontent.com/60508001/181575987-85f89a37-0dc7-4752-9302-71e1159b69dd.png)

After downloading `.xlsx` document, open it with Excel and you'll see all your tasknames in the `Projects` tab. Then copy your project tasknames to `project.types.json` and each of them will be the `key`.

![image](https://user-images.githubusercontent.com/60508001/181576713-f5a489b2-b827-4c68-9baa-44360ad35721.png)

### About `statuses.txt` file.

Firstly, you need to create `statuses.txt` file in the project's root.
`statuses.txt` structure:

```txt
{month}/{date}/{year}
 - {first_task_description}
 - {second_task_description}
...
===
{month}/{date}/{year}
 - {first_task_description}
 - {second_task_description}
...
===
...
```

Example:

```txt
7/19/2022
 - Investigated task 1
 - Implemented functionality for task 1
 - Participated in meeting
 - Tested changes for task 1
 ===
 7/20/2022
 - Investigated task 2
 - Investigated more in task 2
 - Participated in meeting
```

Two rules must be followed while creating `statuses.txt`:

-   each of your statuses must start with date written in correct date format (For instance: `7/30/2022` or `7-30-2022`). Slashes and dashed are supported as delimiters between `{month}` `{date}` and `{year}`, so formats `{month}/{date}/{year}` and `{month}-{date}-{year}` are supported;
-   each of your statuses must a separator `===` following it, except the last status.

### Excel time report file generation

As soon as all previous steps are completed you need to run: `pnpm start` in the root folder.

-   **Experimental feature**: you can pass custom filename for report as optional `name` argument using command `pnpm start`. F.e. `pnpm start --name="MyReport.xlsx"`. File extension `.xlsx` will be added automatically to filename if not provided explicitly.

After that `Reports.xlsx` file will appear. Upload it on the Akvelon TTS using "Import from Excel" functionality.

Enjoy!
