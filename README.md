# Pleasure-Tool `(2.3.4)`

### <em>What's new in 2.3.4 version:</em>
 
 - We've added support for overwork. Currently, we support overwork for 5 and 10 percent.
 - Added our custom readline cli module for easy customization.

### What is it

Tool which will save you a huge amount of time that you could spend on yourself or something else!

### What it does

It generates excel time report file, based on your daily text statuses.

### Before using it, follow the steps:

 #### 🛠 Manual setup:
 
  * [NodeJS the latest](https://nodejs.org/en/) or higher.
  * Install <strong>PNPM</strong>: `npm i -g pnpm`
  * Install <strong>TypeScript</strong>: `npm i -g typescript`
 - clone repo: `git clone https://github.com/vladIsLove-hub/pleasure-tool.git`;
 - run `pnpm i` from the root. (Make sure that you have `pnpm` package manager, if not just run: `npm i -g pnpm`).
 
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
        "keywords": ["{first_keyword}", "{second_keyword}", ...]
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
        "keywords": [
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
        "keywords": [
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

After you have run `pnpm start` you'll be able to set all the necessary options for your status.

It looks like this: 

![image](https://user-images.githubusercontent.com/60508001/187263439-d7ebce5c-7786-4420-8db2-e4ebe8f9d709.png)

### <em>Notes:</em>

- Currently you can specify only 5 or 10 percent of overwork. (Any other values will be considered are incorrect).
- You can pass your personal report filename. Currently, the report filename must be not longer than 20 symbols.
- You can specify `overwork: "false"` in the `projects.types.json` if you don't want apply overwork to specific tasks

  ```json5
   "PBI Desktop, Build and Accessibility.Communication": {
        ...
        "overwork": false
   }
  ```

##### <em>If you don't want to set up any options, you can just skip these questions by pressing enter.</em>

After that `Reports.xlsx` (or your custom report name) file will appear. Upload it on the Akvelon TTS using "Import from Excel" functionality.

Enjoy!
