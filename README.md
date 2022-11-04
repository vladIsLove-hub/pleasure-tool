# Pleasure-Tool (v3.0.1)

## Motivation: 

All of us know that time is an incredibly important resource that needs to be spent wisely. The current Akvelon reporting (AKVELON ETS) system is quite inefficient and I bet you yourself don't like spending so much time filling out reports. Our solution will help you reduce this time by an average of 30-40%. You just need to write your statuses in one text file.
As a result our tool generates a .xlsx (Excel) file that needs to be loaded to the [Akvelon ETS](https://ets.akvelon.com/).

## Our powerful features:
 
 - You'll store all your statuses only in one text file.
 - You don't need to calculate what time you spend on your tasks, because our flexible system does it by itself based on your parameters.
 - Finally, you don't need to specify your efforts or task type (Investigation, Development, etc...) every time.
 - We have overtime support for 10 and 5 percent. All time is calculated automatically based on your daily statuses with the highest precision.
 - Do not worry if you suddenly do something wrong in your statuses, our tool will tell you where, how and what needs to be corrected in case there are any mistakes in your statuses

## Before using it, follow the steps:

 #### 🛠 Manual setup:
 
  * [NodeJS](https://nodejs.org/en/) 16 or higher.
  * Install <strong>PNPM</strong> globally: `npm i -g pnpm`
  * Clone repo: `git clone https://github.com/vladIsLove-hub/pleasure-tool.git`;
  * Run `pnpm i` from the root.
 
## How to use it:

This tool needs two particular files: `statuses.txt` and `pleasure.config.json`.

### About `pleasure.config.json` file

Let's start with `pleasure.config.json`. It's the main file where tasks of your project are described.
`pleasure.config.json` structure:

```json5
{
    "projectTypes": {
        "{key}": {
            "max": {max_value},
            "keywords": ["{first_keyword}", "{second_keyword}", ...]
        },
        ...
    }
    "times": {
        "totalWorkHoursPerDay": 8,
        "timeUnitInHours": 0.25
    }
}
```

| Value                                | Type       | Description                                                                                                            |
| ------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| projectTypes                         | `object`   | Object that collects all your project types that based on types from Akvelon ETS)                                      |
| key                                  | `string`   | Your project taskname (For example: `PBI Desktop, Build and Accessibility.Development`)                                |
| max_value                            | `number`   | The maximum time that will be spent to complete the task (you can specify your default time here by yourself)          |
| [first_keyword, second_keyword, ...] | `string[]` | Non-empty array of keywords which match specific project taskname.                                                     |
| times                                | `object`   | Object that collects your default time value (we recommend leaving the field values the same as in the example above)ю |
| totalWorkHoursPerDay                 | `number`   | Total work hours in the day. Must be non negative integer.                                                             |
| timeUnitInHours                      | `number`   | The minimal time unit that can be allocated to the task (dimension: hours)                                             |
|                                      |

Example:

```json
{
   "projectTypes": {
        "PBI Desktop, Build and Accessibility.Development": {
            "max": 3,
            "keywords": [
                "update",
                "create",
                "develop",
                "implement"
            ]
        },
        "PBI Desktop, Build and Accessibility.Investigation": {
            "max": 3,
            "keywords": [
                "investigate",
                "debug",
                "research"
            ]
        },
        ...
   },
   "times": {
        "totalWorkHoursPerDay": 8,
        "timeUnitInHours": 0.25
    }
}
```

Let's investigate the first object of `projectTypes` inside `pleasure.config.json`, because other objects will be almost the same.

`PBI Desktop, Build and Accessibility.Development` (and the others) - is a taskname of our project, but where can I receive it? It's easier than it looks!

1. Go to [Akvelon ETS](https://ets.akvelon.net/)
2. Sign in and then click `Download import template` in the dropdown menu:

![Screenshot 2022-11-04 131207](https://user-images.githubusercontent.com/60508001/199970877-24ea2e15-9d2c-4480-b412-0efc0597fdaa.png)

![Screenshot 2022-11-04 131351](https://user-images.githubusercontent.com/60508001/199970925-ef55b104-c8d1-4157-a563-75c31c7e9507.png)

After downloading `.xlsx` document, open it with Excel and you'll see all your tasknames in the `Projects` tab. Then copy your project tasknames to `pleasure.config.json` and each of them will be the `key`.

![Screenshot 2022-11-04 131617](https://user-images.githubusercontent.com/60508001/199970981-2bd5caf1-d9ec-4b06-9425-309058d710ac.png)

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

## Excel time report file generation

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

(If you don't want to set up any options, you can just skip these questions by pressing enter)

After that `Reports.xlsx` (or your custom report name) file will appear. Upload it on the Akvelon TTS using "Import from Excel" functionality.

Enjoy!

## Authors: 

| Vladislav Evtushenko                                                          | Aleksandr Miroshnichenko                                                                                                              |                                                       
--------------------------------------------------------------------- | --------------------------------------------------------------------------- 
| ![Vladislav Evtushenjo](https://pbs.twimg.com/profile_images/1581742333200056322/ov01qZqU_400x400.jpg) | ![Aleksandr Miroshnichenko ](https://media-exp1.licdn.com/dms/image/C4D03AQH95ZAy_AupXQ/profile-displayphoto-shrink_800_800/0/1649235827833?e=1672876800&v=beta&t=aqCNZVCCOq_D7wWMxg2kK0pyAGe4Kbfry3o6_53L_VU) |
| [vladIsLove-hub](https://github.com/vladIsLove-hub)                                  | [polotent](https://github.com/polotent)                       | 
